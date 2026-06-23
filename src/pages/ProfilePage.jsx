// ─── Customer Profile Page — fully functional ─────────────────────────
// • Fixed header (no overlapping blue circle)
// • My Addresses — real CRUD (add, set primary, delete)
// • Notifications — live toggle for browser notification permission
// • Help & Support — full app guide
// • Payment Methods — info card
import { useState, useEffect } from 'react';
import DB from '../utils/db';
import { enc, REWARD_TIERS } from '../utils/constants';

const GREEN  = '#01165a';
const ORANGE = '#d63900';
const GOLD   = '#f3b600';
const LGRAY  = '#F8F9FA';
const WHITE  = '#FFFFFF';
const NAVY   = '#000033';
const BORDER = '#E5E7EB';
const MUTED  = '#9CA3AF';
const TEXT   = '#0F0F0F';

// ── Shared modal shell ────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center', backdropFilter:'blur(4px)', animation:'fadeIn .2s ease' }}>
      <div style={{ background:WHITE, borderRadius:'24px 24px 0 0', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'20px 20px 40px', animation:'slideUp .3s ease' }}>
        <div style={{ width:40, height:4, background:'#E5E7EB', borderRadius:4, margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:TEXT }}>{title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:LGRAY, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:MUTED }}>×</button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── Addresses Modal ───────────────────────────────────────────────────
function AddressesModal({ customer, onClose, showToast }) {
  const [addresses, setAddresses] = useState(DB.getAddresses(customer.id));
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({ label:'', address:'', landmark:'' });

  const refresh = () => setAddresses(DB.getAddresses(customer.id));

  const add = () => {
    if (!form.label || !form.address) { showToast('Enter a label and address', 'error'); return; }
    const isPrimary = addresses.length === 0;
    DB.saveAddress({ id:DB.genId(), customerId:customer.id, label:form.label.trim(), address:form.address.trim(), landmark:form.landmark.trim(), isPrimary, createdAt:new Date().toISOString() });
    setForm({ label:'', address:'', landmark:'' }); setShowForm(false);
    refresh(); showToast('Address saved!', 'success');
  };

  const setPrimary = (id) => {
    addresses.forEach(a => DB.saveAddress({ ...a, isPrimary: a.id === id }));
    refresh(); showToast('Primary address updated', 'success');
  };

  const del = (id) => {
    DB.deleteAddress(id); refresh(); showToast('Address removed', 'info');
  };

  const inp = { width:'100%', padding:'12px 14px', border:`1.5px solid ${BORDER}`, borderRadius:12, fontSize:14, fontFamily:'DM Sans,sans-serif', outline:'none', background:LGRAY, boxSizing:'border-box' };

  return (
    <Modal title="My Addresses" onClose={onClose}>
      {addresses.length === 0 && !showForm && (
        <div style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📍</div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16, color:TEXT, marginBottom:8 }}>No addresses saved yet</div>
          <p style={{ color:MUTED, fontSize:14, lineHeight:1.6 }}>Add a delivery address so vendors know where to bring your food.</p>
        </div>
      )}

      {addresses.map(a => (
        <div key={a.id} style={{ background: a.isPrimary ? `${GREEN}08` : LGRAY, border:`1.5px solid ${a.isPrimary ? GREEN : BORDER}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, color:TEXT }}>{a.label}</span>
                {a.isPrimary && <span style={{ background:GREEN, color:WHITE, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>Primary</span>}
              </div>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:MUTED, margin:0, lineHeight:1.5 }}>{a.address}</p>
              {a.landmark && <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:MUTED, margin:'3px 0 0' }}>Near: {a.landmark}</p>}
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              {!a.isPrimary && (
                <button onClick={()=>setPrimary(a.id)} style={{ padding:'4px 10px', background:`${GREEN}12`, border:`1px solid ${GREEN}30`, borderRadius:20, color:GREEN, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                  Set primary
                </button>
              )}
              <button onClick={()=>del(a.id)} style={{ width:28, height:28, borderRadius:'50%', background:'#FEF2F2', border:'1px solid #FECACA', color:'#eb0000', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <div style={{ background:LGRAY, borderRadius:14, padding:'16px', marginTop:8 }}>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:MUTED, marginBottom:6 }}>Label (e.g. Home, Hostel)</label>
            <input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="Home" style={inp}/>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:MUTED, marginBottom:6 }}>Full Address</label>
            <input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="e.g. Block C, Room 12, Legon Hall" style={inp}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:MUTED, marginBottom:6 }}>Landmark (optional)</label>
            <input value={form.landmark} onChange={e=>setForm(f=>({...f,landmark:e.target.value}))} placeholder="e.g. Near main gate" style={inp}/>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={add} style={{ flex:1, padding:'12px', background:GREEN, border:'none', borderRadius:50, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>Save Address</button>
            <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'12px', background:LGRAY, border:`1px solid ${BORDER}`, borderRadius:50, color:MUTED, fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowForm(true)} style={{ width:'100%', padding:'13px', background:GREEN, border:'none', borderRadius:50, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:addresses.length?12:0, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Address
        </button>
      )}
    </Modal>
  );
}

// ── Notifications Settings Modal ──────────────────────────────────────
function NotificationsModal({ customer, onClose }) {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      new Notification('Morning Delight 🌅', {
        body: 'Notifications enabled! You\'ll hear about your orders and morning food suggestions.',
        icon: '/icons/icon-192.png',
      });
    }
  };

  const items = [
    { icon:'🌅', label:'Morning Greeting',     desc:'Daily breakfast reminder (6–10 AM)' },
    { icon:'🍽️', label:'New Food Uploads',     desc:'When vendors add new items to their menu' },
    { icon:'✅', label:'Order Confirmation',    desc:'When your order is accepted by the vendor' },
    { icon:'🛵', label:'Driver Updates',        desc:'When your food is on the way' },
    { icon:'🎉', label:'Order Delivered',       desc:'When your food arrives' },
    { icon:'⭐', label:'Rewards & Points',      desc:'When you earn new rewards or unlock credits' },
  ];

  return (
    <Modal title="Notifications" onClose={onClose}>
      {/* Permission toggle */}
      <div style={{ background: permission === 'granted' ? `${GREEN}08` : '#FFF7ED', border:`1.5px solid ${permission==='granted'?GREEN:ORANGE}`, borderRadius:16, padding:'16px 18px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:TEXT, marginBottom:4 }}>
              {permission === 'granted' ? '🔔 Notifications Enabled' : permission === 'denied' ? '🔕 Notifications Blocked' : '🔔 Enable Notifications'}
            </div>
            <div style={{ fontSize:13, color:MUTED }}>
              {permission === 'granted' ? 'You\'ll receive all Morning Delight alerts'
               : permission === 'denied' ? 'Allow in your browser/phone settings to enable'
               : 'Tap below to allow Morning Delight to notify you'}
            </div>
          </div>
          <div style={{ width:48, height:28, borderRadius:14, background: permission==='granted'?GREEN:'#E5E7EB', position:'relative', cursor:'pointer', flexShrink:0, transition:'background .3s' }} onClick={requestPermission}>
            <div style={{ position:'absolute', top:3, left: permission==='granted'?'calc(100% - 25px)':3, width:22, height:22, borderRadius:'50%', background:WHITE, boxShadow:'0 2px 6px rgba(0,0,0,.2)', transition:'left .3s' }}/>
          </div>
        </div>
        {permission !== 'granted' && permission !== 'denied' && (
          <button onClick={requestPermission} style={{ width:'100%', marginTop:14, padding:'11px', background:ORANGE, border:'none', borderRadius:50, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Enable Notifications →
          </button>
        )}
        {permission === 'denied' && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF2F2', borderRadius:10, fontSize:12, color:'#d30000', lineHeight:1.6 }}>
            Notifications are blocked. Go to your browser Settings → Site Settings → Notifications → Allow Morning Delight.
          </div>
        )}
      </div>

      {/* Notification types */}
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:12, color:MUTED, marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>What you'll receive</div>
      {items.map(({ icon, label, desc }) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:`1px solid ${LGRAY}` }}>
          <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:TEXT }}>{label}</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:MUTED, marginTop:2 }}>{desc}</div>
          </div>
          <div style={{ width:8, height:8, borderRadius:'50%', background: permission==='granted'?GREEN:'#E5E7EB', flexShrink:0 }}/>
        </div>
      ))}
    </Modal>
  );
}

// ── Help & Support Modal ──────────────────────────────────────────────
function HelpModal({ onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q:'How do I place an order?', a:'Browse restaurants on the home page or search for a dish. Tap a restaurant to see their menu, add items to your cart, then tap "Pay Now". You\'ll pay via Mobile Money (MTN, Vodafone, AirtelTigo) directly to the vendor.' },
    { q:'How does delivery work?', a:'After you pay, the vendor confirms your order and prepares your food. A driver picks it up and brings it to your location. You can track the driver live on the map once they\'re on the way.' },
    { q:'What payment methods are accepted?', a:'We accept Mobile Money — MTN MoMo (024/054/055/059), Vodafone Cash (020/050), and AirtelTigo Money (026/056). Payment goes directly to the vendor\'s wallet.' },
    { q:'How do I earn reward points?', a:`You earn ${4} points for every order you place. Once you reach milestone points, you unlock GH₵ credits to spend on future orders. Check your progress in your profile.` },
    { q:'Can I preorder food?', a:'Yes! When placing an order, you can choose "Pre-order" and set a delivery time. This is great for scheduling breakfast or lunch in advance.' },
    { q:'How do I track my order?', a:'After placing an order, go to "Orders" in the bottom navigation. Tap "Track Live" when the vendor marks your order as "On the way" to see the driver on a live map.' },
    { q:'What if my order is wrong or delayed?', a:'Contact the vendor directly through the app or reach out to our support team. You can also cancel a pending order before it\'s confirmed.' },
    { q:'How do I add a delivery address?', a:'Go to Profile → My Addresses. You can save multiple addresses (hostel room, lecture hall, etc.) and set one as your primary delivery location.' },
  ];

  return (
    <Modal title="Help & Support" onClose={onClose}>
      {/* Quick contact */}
      <div style={{ background:`linear-gradient(135deg,${NAVY},#16213E)`, borderRadius:16, padding:'18px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ fontSize:36 }}>💬</span>
        <div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, color:WHITE, marginBottom:4 }}>Need help fast?</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>We're a campus food platform. Most questions are answered below.</div>
        </div>
      </div>

      {/* How it works cards */}
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, color:TEXT, marginBottom:12 }}>How It Works</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[['🍳','Browse','Find restaurants and dishes'],['💳','Pay','Pay directly via MoMo'],['🛵','Track','Live GPS delivery tracking'],['⭐','Earn','Get reward points every order']].map(([icon,title,desc])=>(
          <div key={title} style={{ background:LGRAY, borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:TEXT, marginBottom:4 }}>{title}</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:MUTED, lineHeight:1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, color:TEXT, marginBottom:12 }}>Frequently Asked Questions</div>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom:`1px solid ${LGRAY}`, overflow:'hidden' }}>
          <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', cursor:'pointer', gap:12 }}>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:TEXT, lineHeight:1.4, flex:1 }}>{faq.q}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, transform:openFaq===i?'rotate(180deg)':'none', transition:'transform .2s' }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          {openFaq === i && (
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:MUTED, lineHeight:1.7, paddingBottom:14, paddingRight:8, animation:'fadeUp .2s ease' }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}

      {/* App info */}
      <div style={{ marginTop:24, textAlign:'center', padding:'20px', background:LGRAY, borderRadius:14 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:GREEN, marginBottom:4 }}>Morning Delight</div>
        <div style={{ fontSize:12, color:MUTED }}>Campus Food Ordering Platform</div>
        <div style={{ fontSize:11, color:MUTED, marginTop:6 }}>Ghana · Fresh Food · Fast Delivery</div>
      </div>
    </Modal>
  );
}

// ── Payment Methods Modal ─────────────────────────────────────────────
function PaymentModal({ onClose }) {
  const methods = [
    { icon:'📱', name:'MTN MoMo', prefix:'024 / 054 / 055 / 059', color:'#FFCC00', bg:'#FFFBEB' },
    { icon:'📱', name:'Vodafone Cash', prefix:'020 / 050', color:'#be0000', bg:'#FEF2F2' },
    { icon:'📱', name:'AirtelTigo Money', prefix:'026 / 056 / 027', color:'#f36500', bg:'#FFF7ED' },
  ];
  return (
    <Modal title="Payment Methods" onClose={onClose}>
      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED, marginBottom:20, lineHeight:1.6 }}>
        Morning Delight uses Mobile Money for all payments. Your payment goes directly to the vendor's MoMo wallet — fast, safe, and instant.
      </p>
      {methods.map(m => (
        <div key={m.name} style={{ background:m.bg, border:`1.5px solid ${m.color}30`, borderRadius:14, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{m.icon}</div>
          <div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:TEXT }}>{m.name}</div>
            <div style={{ fontSize:13, color:MUTED, marginTop:2, fontFamily:'DM Sans,monospace' }}>{m.prefix}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:16, padding:'14px 16px', background:LGRAY, borderRadius:14, fontSize:13, color:MUTED, lineHeight:1.7, fontFamily:'DM Sans,sans-serif' }}>
        💡 When you order, you'll get step-by-step MoMo payment instructions for your network. Enter your transaction reference to confirm payment.
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main ProfilePage
// ═══════════════════════════════════════════════════════════════════════
export default function ProfilePage({ customer, setCustomer, showToast, onLogout }) {
  const [editing,    setEditing]  = useState(false);
  const [modal,      setModal]    = useState(null); // 'addresses'|'notifications'|'help'|'payment'
  const [form, setForm] = useState({ name:customer?.name||'', phone:customer?.phone||'', location:customer?.location||'', newPass:'' });

  if (!customer) return null;

  const orders  = DB.getOrdersByCustomer(customer.id);
  const spent   = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+parseFloat(o.total||0),0);
  const nextTier = REWARD_TIERS.find(t=>(customer.points||0)<t.points);
  const pct      = nextTier ? Math.min(((customer.points||0)/nextTier.points)*100,100) : 100;

  // Avatar initials from name
  const initials = customer.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'U';

  const save = () => {
    const updated = { ...customer, name:form.name, phone:form.phone, location:form.location };
    if (form.newPass.length >= 6) updated.password = enc(form.newPass);
    DB.saveCustomer(updated); setCustomer(updated); setEditing(false);
    setForm(f=>({...f,newPass:''}));
    showToast('Profile saved!', 'success');
  };

  const inp = { width:'100%', padding:'13px 16px', border:`1.5px solid ${BORDER}`, borderRadius:12, fontSize:14, background:LGRAY, fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box' };

  const MENU = [
    { label:'My Addresses',    icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', color:ORANGE,  modal:'addresses' },
    { label:'Payment Methods', icon:'M1 4h22v16H1zM1 8h22',                                                                    color:'#000657', modal:'payment' },
    { label:'Notifications',   icon:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',               color:GOLD,      modal:'notifications' },
    { label:'Help & Support',  icon:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01',                                        color:'#4500bb', modal:'help' },
  ];

  return (
    <div style={{ background:LGRAY, minHeight:'100vh' }} className="page-wrapper">

      {/* ── Header — clean, no decorative circles that bleed ── */}
      <div style={{ background:NAVY, padding:'max(48px,env(safe-area-inset-top)) 20px 80px', position:'', overflow:'hidden' }}>
        {/* Decorative arc — fully inside header, overflow:hidden clips it */}
        <div style={{ position:'absolute', top:-60, right:-40, width:160, height:160, borderRadius:'50%', background:`${ORANGE}10`, pointerEvents:'none' }}/>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE, marginBottom:4 }}>My Account</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, fontFamily:'DM Sans,sans-serif' }}>Manage your profile &amp; settings</p>
      </div>

      <div style={{ padding:'0 16px', marginTop:-56 }}>

        {/* ── Profile card — floats up over header ── */}
        <div style={{ background:WHITE, borderRadius:20, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,.1)', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            {/* Avatar with initials */}
            <div style={{ width:62, height:62, borderRadius:'50%', background:`linear-gradient(135deg,${GREEN},#40916C)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE }}>{initials}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:TEXT }}>{customer.name}</div>
              <div style={{ color:MUTED, fontSize:12, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'DM Sans,sans-serif' }}>{customer.email}</div>
              <div style={{ color:MUTED, fontSize:12, fontFamily:'DM Sans,sans-serif' }}>{customer.location||'Accra'}</div>
            </div>
            <button onClick={()=>setEditing(!editing)} style={{ width:36, height:36, borderRadius:'50%', background:'#FFF7ED', border:`1px solid ${ORANGE}40`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[['Orders',orders.length,ORANGE],['GH₵ Spent',spent.toFixed(0),GREEN],['Points',customer.points||0,GOLD]].map(([l,v,c])=>(
              <div key={l} style={{ background:LGRAY, borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <div style={{ fontFamily:'Sora,sans-serif', fontSize:19, fontWeight:800, color:c }}>{v}</div>
                <div style={{ fontSize:11, color:MUTED, marginTop:2, fontFamily:'DM Sans,sans-serif' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Edit form ── */}
        {editing && (
          <div style={{ background:WHITE, borderRadius:20, padding:20, marginBottom:14, animation:'fadeUp .3s ease', boxShadow:'0 4px 16px rgba(0,0,0,.06)' }}>
            <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, marginBottom:16, color:TEXT }}>Edit Profile</h3>
            {[['Full Name','name','text'],['Phone','phone','tel'],['Location','location','text'],['New Password (optional)','newPass','password']].map(([l,k,t])=>(
              <div key={k} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:MUTED, marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={inp} placeholder={k==='newPass'?'Leave blank to keep current':''}/>
              </div>
            ))}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={save} style={{ flex:1, padding:'13px', background:GREEN, border:'none', borderRadius:50, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>Save Changes</button>
              <button onClick={()=>setEditing(false)} style={{ flex:1, padding:'13px', background:LGRAY, border:`1px solid ${BORDER}`, borderRadius:50, color:MUTED, fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── Rewards progress ── */}
        {nextTier && (
          <div style={{ background:`linear-gradient(135deg,${NAVY},#16213E)`, borderRadius:20, padding:20, marginBottom:14, position:'relative', overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,.15)' }}>
            <div style={{ position:'absolute', bottom:-20, right:-10, width:70, height:70, borderRadius:'50%', background:`${ORANGE}18`, pointerEvents:'none' }}/>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:1, fontFamily:'DM Sans,sans-serif' }}>Rewards Progress</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, color:WHITE, fontSize:18 }}>{customer.points||0} pts</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontFamily:'DM Sans,sans-serif' }}>/{nextTier.points} for GH₵{nextTier.credit}</span>
            </div>
            <div style={{ height:8, background:'rgba(255,255,255,.12)', borderRadius:8 }}>
              <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${ORANGE},${GOLD})`, borderRadius:8, transition:'width 1s ease' }}/>
            </div>
          </div>
        )}

        {/* ── Menu items — all clickable ── */}
        {MENU.map(({ label, icon, color, modal: m }) => (
          <div key={label} onClick={()=>setModal(m)}
            style={{ background:WHITE, borderRadius:16, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:14, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'transform .1s', active:{ transform:'scale(.98)' } }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(.98)'}
            onMouseUp={e=>e.currentTarget.style.transform='none'}
            onTouchStart={e=>e.currentTarget.style.transform='scale(.98)'}
            onTouchEnd={e=>e.currentTarget.style.transform='none'}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d={icon}/></svg>
            </div>
            <span style={{ flex:1, fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, color:TEXT }}>{label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        ))}

        <button onClick={onLogout} style={{ width:'100%', padding:'14px', background:'#FEF2F2', border:`1px solid #FECACA`, borderRadius:16, color:'#EF4444', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:4 }}>
          Sign Out
        </button>
        <div style={{ height:8 }}/>
      </div>

      {/* ── Modals ── */}
      {modal === 'addresses'     && <AddressesModal customer={customer} onClose={()=>setModal(null)} showToast={showToast}/>}
      {modal === 'notifications' && <NotificationsModal customer={customer} onClose={()=>setModal(null)}/>}
      {modal === 'help'          && <HelpModal onClose={()=>setModal(null)}/>}
      {modal === 'payment'       && <PaymentModal onClose={()=>setModal(null)}/>}
    </div>
  );
}
