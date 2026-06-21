// ─── Morning Delight — Customer App Root ─────────────────────────────
import { useState, useEffect, useRef } from 'react';
import useToast from './hooks/useToast';
import DB from './utils/db';
import { seedDemoData } from './utils/seed';
import SoundService from './utils/soundService';
import { checkMorningGreeting, checkNewFoodUploads } from './utils/notificationService';

import Toasts            from './components/Toasts';
import Loader            from './components/Loader';
import BottomNav         from './components/BottomNav';
import AuthPage          from './pages/AuthPage';
import HomePage          from './pages/HomePage';
import VendorPage        from './pages/VendorPage';
import SearchPage        from './pages/SearchPage';
import OrdersPage        from './pages/OrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage       from './pages/ProfilePage';
import TrackingPage      from './pages/TrackingPage';

import './styles/global.css';
import { initInstallPrompt, triggerInstall, isInstalled } from './registerSW';

seedDemoData();

// ── Request browser notification permission on load ────────────────────
function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function pushNotif(title, body, icon = '🍽️') {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}


// ── iOS install guide (Safari doesn't have automatic install prompts) ──
function IOSInstallGuide({ onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:2000, display:'flex', alignItems:'flex-end', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:'24px 24px 40px', width:'100%', maxWidth:480, animation:'slideUp .3s ease' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, background:'#E5E7EB', borderRadius:4, margin:'0 auto 20px' }}/>
        <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, textAlign:'center', marginBottom:6 }}>Add to Home Screen</h2>
        <p style={{ color:'#9CA3AF', fontSize:14, textAlign:'center', marginBottom:24 }}>Install Morning Delight on your iPhone for the best experience</p>
        {[
          ['1', '📤', 'Tap the Share button at the bottom of Safari (the box with an arrow)'],
          ['2', '➕', 'Scroll down and tap "Add to Home Screen"'],
          ['3', '✅', 'Tap "Add" in the top right corner'],
        ].map(([n,icon,text]) => (
          <div key={n} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#FFF7ED', border:'2px solid #FED7AA', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{icon}</div>
            <div style={{ fontSize:14, color:'#374151', lineHeight:1.6, paddingTop:6 }}>{text}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:50, color:'white', fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, cursor:'pointer', marginTop:8 }}>
          Got it!
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen,    setScreen]   = useState('loader');
  const [user,      setUser]     = useState(null);
  const [role,      setRole]     = useState(null);
  const [section,   setSection]  = useState('home');
  const [vendor,    setVendor]   = useState(null);
  const [trackOrder,setTrackOrder] = useState(null); // order being tracked
  const { toasts, showToast } = useToast();

  // Track order statuses to detect changes
  const prevStatuses = useRef({});
  const [showInstall,   setShowInstall]   = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Show iOS install guide for Safari users (iOS doesn't support beforeinstallprompt)
  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari && !isInstalled() && !localStorage.getItem('ios_guide_shown')) {
      setTimeout(() => setShowIOSGuide(true), 4000);
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    if (!isInstalled()) {
      initInstallPrompt(() => setShowInstall(true));
    }
  }, []);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => { SoundService.unlock(); document.removeEventListener('click', unlock); };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  // Check for new food uploads whenever user returns to the tab
  useEffect(() => {
    if (!user || screen !== 'app') return;
    const onFocus = () => checkNewFoodUploads(user.id, showToast);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, screen]);

  // ── Session restore ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      const sess = DB.getSession('cust');
      if (sess?.id) {
        const c = DB.findCustomerByEmail(sess.email);
        if (c) {
          setUser(c); setRole('customer'); setScreen('app'); requestNotifPermission();
          // Check morning greeting and new food on session restore
          setTimeout(() => {
            checkMorningGreeting(c.id, null);
            checkNewFoodUploads(c.id, null);
          }, 2000);
          return;
        }
      }
      setScreen('auth');
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Real-time order status polling (every 2 seconds) ──────────────────
  useEffect(() => {
    if (!user || screen !== 'app') return;

    // Check for new food uploads every 60 seconds while app is open
    const foodPollRef = { lastTs: parseInt(localStorage.getItem(`md_food_checked_${user.id}`) || '0') };
    const foodPoll = setInterval(() => {
      const latestUpload = parseInt(localStorage.getItem('cb_last_new_item_ts') || '0');
      if (latestUpload > foodPollRef.lastTs) {
        checkNewFoodUploads(user.id, showToast);
        foodPollRef.lastTs = Date.now();
      }
    }, 60000);

    const poll = setInterval(() => {
      const myOrders = DB.getOrdersByCustomer(user.id);

      myOrders.forEach(order => {
        const prev = prevStatuses.current[order.id];
        const curr = order.status;

        if (prev && prev !== curr) {
          // Status changed — alert the customer!
          switch (curr) {
            case 'confirmed':
              SoundService.orderConfirmed();
              showToast(`✅ ${DB.getVendorById(order.vendorId)?.businessName} confirmed your order!`, 'success');
              pushNotif('Order Confirmed! 🎉', `${DB.getVendorById(order.vendorId)?.businessName} is preparing your food.`);
              DB.saveNotification({ id:DB.genId(), userId:user.id, type:'order_update', title:'Order Confirmed!', body:`${DB.getVendorById(order.vendorId)?.businessName} confirmed your order. They're getting started!`, orderId:order.id, read:false, createdAt:new Date().toISOString() });
              break;

            case 'preparing':
              SoundService.orderConfirmed();
              showToast(`👨‍🍳 Your food is being prepared!`, 'info');
              pushNotif('Being Prepared 🔥', 'Your order is being freshly cooked right now.');
              break;

            case 'ready':
              SoundService.foodReady();
              showToast(`🎁 Your order is ready! Driver will pick it up soon.`, 'success');
              pushNotif('Order Ready! 🎁', 'Your food is ready. Driver is on the way to you!');
              DB.saveNotification({ id:DB.genId(), userId:user.id, type:'order_update', title:'Food is Ready! 🎁', body:'Your order is ready! The driver will pick it up soon.', orderId:order.id, read:false, createdAt:new Date().toISOString() });
              break;

            case 'on_the_way':
              SoundService.onTheWay();
              showToast(`🛵 Your order is on the way! Open to track live.`, 'success');
              pushNotif('On The Way! 🛵', 'Your driver is on the way. Track their location live!');
              DB.saveNotification({ id:DB.genId(), userId:user.id, type:'order_update', title:'Driver On The Way! 🛵', body:'Your order is on the way. Tap to track the driver live on the map!', orderId:order.id, read:false, createdAt:new Date().toISOString() });
              // Auto-open tracking for this order
              setTrackOrder(order);
              break;

            case 'delivered':
              SoundService.delivered();
              showToast(`🎉 Order delivered! Enjoy your meal!`, 'success');
              pushNotif('Delivered! 🎉', 'Your order has arrived. Enjoy your meal!');
              DB.saveNotification({ id:DB.genId(), userId:user.id, type:'delivered', title:'Order Delivered! 🎉', body:'Your order has been delivered. Enjoy your meal! Remember to rate your vendor.', orderId:order.id, read:false, createdAt:new Date().toISOString() });
              break;
          }
        }
        prevStatuses.current[order.id] = curr;
      });

      // Initialise tracking if not yet set
      myOrders.forEach(o => { if (!prevStatuses.current[o.id]) prevStatuses.current[o.id] = o.status; });
    }, 2000);

    return () => { clearInterval(poll); clearInterval(foodPoll); };
  }, [user, screen]);

  const handleLogin = (u, r) => {
    setUser(u); setRole(r);
    requestNotifPermission();
    if (r === 'customer') {
      setScreen('app');
      // Check morning greeting and new food on fresh login
      setTimeout(() => {
        checkMorningGreeting(u.id, showToast);
        checkNewFoodUploads(u.id, showToast);
      }, 2500);
      return;
    }
    if (r === 'vendor')   { setScreen('app'); showToast('Vendor login — use the Vendor App', 'info'); return; }
    if (r === 'admin')    { setScreen('app'); showToast('Admin login — use the Admin App',   'info'); return; }
  };

  const handleLogout = () => {
    DB.clearSession('cust'); DB.clearSession('vendor'); DB.clearSession('admin');
    setUser(null); setRole(null); setVendor(null); setTrackOrder(null);
    setScreen('auth');
  };

  const refreshUser = () => {
    if (user?.email) { const f = DB.findCustomerByEmail(user.email); if (f) setUser(f); }
  };

  const notifCount = user ? DB.getNotifications(user.id).filter(n => !n.read).length : 0;

  if (screen === 'loader') return <><Loader /><Toasts toasts={toasts} /></>;
  if (screen === 'auth')   return <><AuthPage onLogin={handleLogin} showToast={showToast} hasAccounts={DB.getCustomers().length > 0} /><Toasts toasts={toasts} /></>;

  // Tracking page (full screen)
  if (trackOrder) return (
    <>
      <TrackingPage order={trackOrder} customer={user} onBack={() => setTrackOrder(null)} />
      <Toasts toasts={toasts} />
    </>
  );

  // Viewing a vendor
  if (vendor) return (
    <>
      <VendorPage vendor={vendor} customer={user} showToast={showToast} onBack={() => setVendor(null)} onOrderPlaced={() => refreshUser()} />
      <Toasts toasts={toasts} />
    </>
  );

  return (
    <>
      <div style={{ display:'flex', maxWidth:1280, margin:'0 auto', minHeight:'100vh', position:'relative' }}>
        <style>{`
          @media (min-width:1024px) { .desktop-sidebar{display:flex!important} .bottom-nav{display:none!important} }
        `}</style>

        {/* Desktop sidebar */}
        <div className="desktop-sidebar" style={{ display:'none', width:220, flexShrink:0, background:'white', borderRight:'1px solid #E5E7EB', flexDirection:'column', padding:'24px 12px', position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 8px', marginBottom:32 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#FF6B35,#F7931E)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none"><path d="M20 4L7 11.5V25c0 5.5 5.8 9.2 13 10 7.2-.8 13-4.5 13-10V11.5L20 4z" fill="white" opacity=".9"/><circle cx="20" cy="19" r="5" fill="#FF6B35"/></svg>
            </div>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, color:'#d43900' }}>Morning Delight</span>
          </div>
          {[['home','Home','M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],['search','Breakfast','M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'],['orders','Order History','M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2'],['notifs','Notifications','M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0'],['profile','Account','M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']].map(([id,label,icon])=>(
            <button key={id} onClick={()=>setSection(id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, border:'none', background:section===id?'#FFF7ED':'transparent', color:section===id?'#FF6B35':'#6B7280', fontWeight:section===id?700:500, fontSize:14, cursor:'pointer', width:'100%', textAlign:'left', marginBottom:4, fontFamily:'inherit' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d={icon}/></svg>
              {label}
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex:1, overflowY:'auto', maxWidth:600, margin:'0 auto', position:'relative' }}>
          {section==='home'    && <HomePage     customer={user} setSection={setSection} onSelectVendor={v=>setVendor(v)} />}
          {section==='search'  && <SearchPage   onSelectVendor={v=>setVendor(v)} />}
          {section==='orders'  && <OrdersPage   customer={user} showToast={showToast} onTrack={o=>setTrackOrder(o)} />}
          {section==='notifs'  && <NotificationsPage customer={user} />}
          {section==='profile' && <ProfilePage  customer={user} setCustomer={u=>setUser(u)} showToast={showToast} onLogout={handleLogout} />}
          <BottomNav section={section} setSection={setSection} notifCount={notifCount} />
        </div>
      </div>
      <Toasts toasts={toasts} />
    </>
  );
}
