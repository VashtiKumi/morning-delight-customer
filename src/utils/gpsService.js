// ─── GPS Service — Real Geolocation + Simulated Driver Tracking ───────
//
// How it works:
//   1. Customer's real location → browser Geolocation API
//   2. Vendor location → deterministic Ghana coordinate from businessName
//   3. Driver position → interpolates from vendor → customer over time
//   4. All positions update in localStorage so other tabs can read them
// ─────────────────────────────────────────────────────────────────────

// ── Accra area bounding box ──
const ACCRA_LAT = 5.6037;
const ACCRA_LNG = -0.1870;

// Ghana neighborhoods mapped roughly by vendor specialty
const GH_ZONES = {
  'Local Ghanaian':  { lat: 5.5596, lng: -0.2027 },  // Dansoman
  'Rice & Stew':     { lat: 5.5938, lng: -0.1770 },  // Osu
  'Pizza & Fast Food':{ lat: 5.6503, lng: -0.1869 }, // Legon
  'Snacks & Fast Food':{ lat: 5.5726, lng: -0.2375 },// Kaneshie
  'Chicken & Grills':{ lat: 5.5481, lng: -0.2014 },  // Mallam
  'Soups & Stew':    { lat: 5.6159, lng: -0.1868 },  // Adabraka
  'Drinks & Beverages':{ lat:5.5858, lng:-0.1810 },  // Asylum Down
  'Mixed Menu':      { lat: 5.6037, lng: -0.1870 },  // Accra Central
};

/** Get a deterministic Ghana location for a vendor */
export function getVendorCoords(vendor) {
  // Use specialty mapping if available
  const zone = GH_ZONES[vendor.specialty];
  if (zone) {
    // Small jitter so vendors in same zone don't overlap
    const seed = vendor.id?.charCodeAt(0) || 0;
    return {
      lat: zone.lat + (seed % 30 - 15) * 0.0008,
      lng: zone.lng + (seed % 20 - 10) * 0.0008,
    };
  }
  // Fallback: hash vendor name to get consistent Accra coords
  let h = 0;
  for (let i = 0; i < (vendor.businessName || '').length; i++) h = (h * 31 + vendor.businessName.charCodeAt(i)) & 0xffffffff;
  return {
    lat: ACCRA_LAT + ((h & 0xff) - 128) * 0.0018,
    lng: ACCRA_LNG + (((h >> 8) & 0xff) - 128) * 0.0018,
  };
}

/** Get customer's real GPS position */
export function getCustomerPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: ACCRA_LAT + 0.015, lng: ACCRA_LNG + 0.02, real: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, real: true }),
      ()  => resolve({ lat: ACCRA_LAT + 0.015, lng: ACCRA_LNG + 0.02, real: false }),
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}

/** Linear interpolate between two coordinates */
export function lerpCoords(from, to, t) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

/** Compute distance in metres between two lat/lng points (Haversine) */
export function distanceMetres(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sin2 = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.asin(Math.sqrt(sin2));
}

/** Format metres → human-readable */
export function fmtDistance(m) {
  return m < 950 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
}

/** Format seconds → MM:SS */
export function fmtETA(sec) {
  if (sec <= 0) return 'Arriving now';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s < 10?'0':''}${s} sec` : `${s} sec`;
}

/** Save driver position so customer can read it (both in same browser tab set) */
export function saveDriverPosition(orderId, coords, progress) {
  const key = `cb_driver_${orderId}`;
  localStorage.setItem(key, JSON.stringify({ ...coords, progress, ts: Date.now() }));
}

/** Read driver position for an order */
export function getDriverPosition(orderId) {
  try {
    const raw = localStorage.getItem(`cb_driver_${orderId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
