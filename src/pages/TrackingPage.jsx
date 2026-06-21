// ─── Real-Time GPS Order Tracking Page ───────────────────────────────
//
// Uses Leaflet.js (loaded from CDN — no npm needed) with OpenStreetMap.
// Shows three markers on Ghana map:
//   🍽️  Restaurant (vendor location — Accra coordinates from businessName)
//   🛵  Driver (animated, moves from vendor → customer in real time)
//   📍  You (customer's actual GPS position from browser)
//
// Driver animation:
//   - Total journey: proportional to real distance (avg speed ~30 km/h)
//   - Position saved in localStorage every second so vendor/admin can see it
//   - ETA counts down live
// ─────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import DB from '../utils/db';
import {
  getVendorCoords, getCustomerPosition, lerpCoords,
  distanceMetres, fmtDistance, fmtETA, saveDriverPosition,
} from '../utils/gpsService';
import SoundService from '../utils/soundService';

// ── Load Leaflet from CDN ──────────────────────────────────────────────
let leafletLoaded = false;
function loadLeaflet() {
  return new Promise((resolve) => {
    if (leafletLoaded && window.L) { resolve(); return; }
    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
    // JS
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    s.onload = () => { leafletLoaded = true; resolve(); };
    document.head.appendChild(s);
  });
}

// ── Status pipeline config ─────────────────────────────────────────────
const STAGES = [
  { key:'pending',    label:'Order Placed',   icon:'📝', color:'#003796' },
  { key:'confirmed',  label:'Confirmed',       icon:'✅', color:'#f54100' },
  { key:'preparing',  label:'Preparing',       icon:'👨‍🍳', color:'#f89d00' },
  { key:'ready',      label:'Ready',           icon:'🎁', color:'#009c15' },
  { key:'on_the_way', label:'On the Way',      icon:'🛵', color:'#f34100' },
  { key:'delivered',  label:'Delivered',       icon:'🎉', color:'#0b8600' },
];

function StatusPipeline({ status }) {
  const idx = STAGES.findIndex(s => s.key === status);
  return (
    <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }} className="no-scroll">
        {STAGES.map((s, i) => {
          const done    = i < idx;
          const current = i === idx;
          const col     = done || current ? s.color : '#E5E7EB';
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 'none', minWidth: i < STAGES.length-1 ? 0 : 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: done||current ? col : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: current ? `2.5px solid ${col}` : 'none', transition: 'all .4s', boxShadow: current ? `0 0 0 4px ${col}25` : 'none' }}>
                  {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        : <span style={{ fontSize: 10, filter: done||current?'none':'grayscale(1)', opacity: done||current?1:.35 }}>{s.icon}</span>}
                </div>
                <span style={{ fontSize: 9, color: current ? col : '#00399b', fontWeight: current?800:500, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? col : '#F3F4F6', marginBottom: 18, transition: 'background .4s', minWidth: 8 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackingPage({ order, customer, onBack }) {
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);  // { map, driverMarker, routeLine }
  const intervalRef = useRef(null);

  const [mapReady,     setMapReady]     = useState(false);
  const [custCoords,   setCustCoords]   = useState(null);
  const [vendorCoords, setVendorCoords] = useState(null);
  const [driverPos,    setDriverPos]    = useState(null);
  const [progress,     setProgress]     = useState(0);   // 0 → 1
  const [eta,          setEta]          = useState(0);   // seconds
  const [totalSecs,    setTotalSecs]    = useState(300); // default 5 min
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [arrived,       setArrived]       = useState(false);

  const vendor = DB.getVendorById(order.vendorId);

  // ── Initialise map ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadLeaflet();
      if (cancelled || !mapRef.current) return;
      const L = window.L;

      // Get positions
      const [cust, vend] = await Promise.all([
        getCustomerPosition(),
        Promise.resolve(getVendorCoords(vendor || {})),
      ]);
      if (cancelled) return;

      setCustCoords(cust);
      setVendorCoords(vend);

      // Calculate real distance → realistic ETA
      const dist   = distanceMetres(vend, cust);
      const speed  = 8.5; // m/s ≈ 30 km/h for a rider
      const secs   = Math.max(60, Math.round(dist / speed));
      setTotalSecs(secs);
      setEta(secs);

      // Init map
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
        .setView([cust.lat, cust.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom icons
      const makeIcon = (emoji, size = 36) => L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size*.5}px;box-shadow:0 3px 10px rgba(0,0,0,.25);border:2px solid #FF6B35">${emoji}</div>`,
        iconSize: [size, size], iconAnchor: [size/2, size/2], className: '',
      });

      // Markers
      const vendorMark  = L.marker([vend.lat, vend.lng], { icon: makeIcon('🍽️', 40) }).addTo(map).bindPopup(`<b>${vendor?.businessName || 'Restaurant'}</b>`);
      const customerMark = L.marker([cust.lat, cust.lng], { icon: makeIcon('📍', 36) }).addTo(map).bindPopup('Your location');

      const driverMark = L.marker([vend.lat, vend.lng], {
        icon: L.divIcon({
          html: `<div id="driver-icon" style="width:44px;height:44px;background:linear-gradient(135deg,#FF6B35,#F7931E);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 16px rgba(255,107,53,.5);border:2px solid white;animation:driverPulse 2s ease-in-out infinite">🛵</div>`,
          iconSize: [44, 44], iconAnchor: [22, 22], className: '',
        }),
        zIndexOffset: 1000,
      }).addTo(map);

      // Route line
      const routeLine = L.polyline([[vend.lat, vend.lng], [cust.lat, cust.lng]], {
        color: '#e93e00', weight: 3, opacity: 0.55, dashArray: '8, 6',
      }).addTo(map);

      // Fit both points
      map.fitBounds([[vend.lat, vend.lng], [cust.lat, cust.lng]], { padding: [50, 50] });

      leafletRef.current = { map, driverMark, customerMark, vendorMark, routeLine };
      setMapReady(true);
      setDriverPos(vend);
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Animate driver when status = on_the_way ───────────────────────────
  useEffect(() => {
    if (!mapReady || !custCoords || !vendorCoords) return;

    // Poll for latest order status from DB
    const statusTimer = setInterval(() => {
      const latest = DB.getOrders().find(o => o.id === order.id);
      if (latest && latest.status !== currentStatus) {
        setCurrentStatus(latest.status);
        if (latest.status === 'on_the_way') SoundService.onTheWay();
        if (latest.status === 'ready')      SoundService.foodReady();
        if (latest.status === 'delivered')  { SoundService.delivered(); setArrived(true); }
      }
    }, 2000);

    // Animate driver if on_the_way
    let startTime = null;
    let animFrame = null;

    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000; // seconds
      const t = Math.min(elapsed / totalSecs, 1);
      setProgress(t);
      setEta(Math.max(0, Math.round(totalSecs - elapsed)));

      const pos = lerpCoords(vendorCoords, custCoords, t);
      setDriverPos(pos);
      saveDriverPosition(order.id, pos, t);

      if (leafletRef.current?.driverMark) {
        leafletRef.current.driverMark.setLatLng([pos.lat, pos.lng]);
        // Pan map to keep driver in view
        leafletRef.current.map.panTo([pos.lat, pos.lng], { animate: true, duration: 1 });
      }

      // Travelled + remaining line
      if (leafletRef.current?.routeLine) {
        leafletRef.current.routeLine.setLatLngs([[vendorCoords.lat, vendorCoords.lng], [pos.lat, pos.lng], [custCoords.lat, custCoords.lng]]);
      }

      if (t < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setArrived(true);
        SoundService.delivered();
      }
    };

    let started = false;
    const checkStart = setInterval(() => {
      const latest = DB.getOrders().find(o => o.id === order.id);
      if ((latest?.status === 'on_the_way' || currentStatus === 'on_the_way') && !started) {
        started = true;
        animFrame = requestAnimationFrame(animate);
      }
    }, 1000);

    return () => {
      clearInterval(statusTimer);
      clearInterval(checkStart);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [mapReady, custCoords, vendorCoords, totalSecs, currentStatus]);

  // ── Clean up map on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (leafletRef.current?.map) leafletRef.current.map.remove();
    };
  }, []);

  const dist         = custCoords && driverPos ? distanceMetres(driverPos, custCoords) : null;
  const stage        = STAGES.find(s => s.key === currentStatus) || STAGES[0];
  const isTracking   = ['on_the_way','ready'].includes(currentStatus);
  const pct          = Math.round(progress * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F2', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#1A1A2E', padding: '44px 16px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 17, color: 'white' }}>Track Order</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>#{order.id.slice(0,10).toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${stage.color}20`, border: `1px solid ${stage.color}50`, borderRadius: 20, padding: '5px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color, animation: isTracking ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>{stage.label}</span>
        </div>
      </div>

      {/* Status pipeline */}
      <StatusPipeline status={currentStatus} />

      {/* Map */}
      <div style={{ position: 'relative', flex: 1, minHeight: 320 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 320 }} />

        {/* Map loading overlay */}
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, background: '#E8F4FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 500 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #FF6B35', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>Getting your location...</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Please allow location access when prompted</div>
          </div>
        )}

        {/* Arrived overlay */}
        {arrived && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 600, animation: 'fadeIn .5s ease' }}>
            <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounceIn .6s ease' }}>🎉</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 26, color: 'white', marginBottom: 8 }}>Order Arrived!</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', marginBottom: 24 }}>Enjoy your meal!</div>
            <button onClick={onBack} style={{ background: 'white', border: 'none', borderRadius: 50, padding: '14px 32px', fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 15, color: '#10b981', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        )}
      </div>

      {/* Bottom info card */}
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', boxShadow: '0 -4px 24px rgba(0,0,0,.1)', flexShrink: 0 }}>
        {/* Vendor info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#FF6B35,#F7931E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>
            🍽️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0F0F0F' }}>{vendor?.businessName || 'Restaurant'}</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
              {order.items?.slice(0,2).map(i=>`${i.qty}× ${i.name}`).join(', ')}{order.items?.length>2?` +${order.items.length-2} more`:''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: '#e73e00' }}>GH₵{parseFloat(order.total||0).toFixed(2)}</div>
          </div>
        </div>

        {/* ETA + distance row */}
        {isTracking && !arrived && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#FFF7ED', borderRadius: 14, padding: '14px 16px', border: '1px solid #FED7AA' }}>
                <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Estimated Arrival</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: '#FF6B35' }}>
                  {eta > 0 ? fmtETA(eta) : 'Almost there!'}
                </div>
              </div>
              <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>Distance Away</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 18, color: '#10b981' }}>
                  {dist !== null ? fmtDistance(dist) : '...'}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
                <span>🍽️ {vendor?.businessName}</span>
                <span>{pct}%</span>
                <span>📍 You</span>
              </div>
              <div style={{ height: 8, background: '#F3F4F6', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#FF6B35,#F7931E)', borderRadius: 8, transition: 'width .8s ease' }} />
              </div>
            </div>
          </>
        )}

        {/* Status message */}
        {!isTracking && (
          <div style={{ background: `${stage.color}10`, border: `1px solid ${stage.color}30`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{stage.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F0F0F' }}>{stage.label}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                {currentStatus === 'pending'   && "Your order has been placed. Waiting for vendor to confirm."}
                {currentStatus === 'confirmed' && "Vendor confirmed! They're getting started on your food."}
                {currentStatus === 'preparing' && "Your food is being freshly prepared right now."}
                {currentStatus === 'ready'     && "Your order is ready! Driver will pick it up soon."}
                {currentStatus === 'delivered' && "Your order has been delivered. Enjoy your meal!"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        #driver-icon { animation: driverPulse 2s ease-in-out infinite; }
        @keyframes driverPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes bounceIn { 0%{transform:scale(.3);opacity:0} 55%{transform:scale(1.1)} 80%{transform:scale(.95)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .no-scroll::-webkit-scrollbar { display:none; }
        .no-scroll { scrollbar-width:none; }
      `}</style>
    </div>
  );
}
