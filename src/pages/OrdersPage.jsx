// ─── My Orders Page — exact match to design screenshots ───────────────
import { useState } from 'react';
import DB from '../utils/db';

const SC = { pending:'#F59E0B', confirmed:'#FF6B35', preparing:'#7C3AED', ready:'#06b6d4', on_the_way:'#FF6B35', delivered:'#10b981', cancelled:'#EF4444' };
const TABS = ['all','active','completed','cancelled'];

// Document × icon (exactly as in screenshot)
function NoOrdersIcon() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="8" width="62" height="82" rx="6" stroke="#1A1A2E" strokeWidth="5.5"/>
      <line x1="30" y1="32" x2="62" y2="32" stroke="#1A1A2E" strokeWidth="5" strokeLinecap="round"/>
      <line x1="30" y1="46" x2="62" y2="46" stroke="#1A1A2E" strokeWidth="5" strokeLinecap="round"/>
      <line x1="30" y1="60" x2="50" y2="60" stroke="#1A1A2E" strokeWidth="5" strokeLinecap="round"/>
      <path d="M55 8h16l16 16v22" stroke="#1A1A2E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="64" y1="76" x2="90" y2="102" stroke="#1A1A2E" strokeWidth="6" strokeLinecap="round"/>
      <line x1="90" y1="76" x2="64" y2="102" stroke="#1A1A2E" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

export default function OrdersPage({ customer, showToast, onTrack }) {
  const [tab, setTab] = useState('all');
  const [sel, setSel] = useState(null);
  const [, rerender] = useState(0);

  if (!customer) return null;

  let orders = DB.getOrdersByCustomer(customer.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  if (tab === 'active')    orders = orders.filter(o => ['pending','confirmed','preparing','ready'].includes(o.status));
  if (tab === 'completed') orders = orders.filter(o => o.status === 'delivered');
  if (tab === 'cancelled') orders = orders.filter(o => o.status === 'cancelled');

  const cancelOrder = (id) => {
    const o = DB.getOrders().find(x => x.id === id);
    if (o && o.status === 'pending') {
      o.status = 'cancelled';
      DB.saveOrder(o);
      showToast('Order cancelled', 'info');
      rerender(n => n+1);
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh' }} className="page-wrapper">
      {/* Header with food image background */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(26,26,46,.45),rgba(26,26,46,.75))' }} />
        <h1 style={{ position: 'absolute', bottom: 22, left: 20, fontFamily: 'Sora,sans-serif', fontSize: 30, fontWeight: 800, color: 'white' }}>
          My Orders
        </h1>
        {/* Small restaurant logo top-right */}
        <div style={{ position: 'absolute', top: 48, right: 14, width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)' }}>
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'white', padding: '14px 16px 0', borderBottom: '1px solid #F3F4F6' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px 4px', borderRadius: 0, border: 'none', background: 'transparent', color: tab===t ? '#FF6B35' : '#9CA3AF', fontWeight: tab===t ? 700 : 500, fontSize: 13, cursor: 'pointer', borderBottom: `2.5px solid ${tab===t?'#FF6B35':'transparent'}`, transition: 'all .2s', textTransform: 'capitalize', fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Empty state (exact match to screenshot) */}
      {!orders.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center' }}>
          <NoOrdersIcon />
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 20, color: '#0F0F0F', marginTop: 24, marginBottom: 8 }}>
            No orders
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            You don't have any past orders yet.
          </p>
        </div>
      ) : (
        <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => {
            const vendor = DB.getVendorById(o.vendorId);
            const col = SC[o.status] || '#9CA3AF';
            return (
              <div key={o.id} onClick={() => setSel(o)}
                style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.07)', overflow: 'hidden', cursor: 'pointer', border: '1px solid #F3F4F6' }}>
                <div style={{ height: 3, background: `linear-gradient(90deg,${col},${col}80)` }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0F0F0F', marginBottom: 2 }}>{vendor?.businessName || 'Restaurant'}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(o.createdAt).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${col}15`, color: col }}>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                    {o.items?.map(i => `${i.qty}× ${i.name}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 16, color: '#0F0F0F' }}>
                      GH₵{parseFloat(o.total||0).toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap:'wrap' }}>
                      {['confirmed','preparing','ready','on_the_way'].includes(o.status) && onTrack && (
                        <button onClick={e=>{e.stopPropagation();onTrack(o);}}
                          style={{ padding:'6px 14px', background:'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:20, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                          Track Live
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button onClick={e=>{e.stopPropagation();cancelOrder(o.id);}}
                          style={{ padding:'6px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:20, color:'#EF4444', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                          Cancel
                        </button>
                      )}
                      {o.status === 'delivered' && (
                        <button style={{ padding:'6px 14px', background:'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:20, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order detail bottom sheet */}
      {sel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:700, backdropFilter:'blur(3px)' }} onClick={()=>setSel(null)}>
          <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:'20px 20px 44px', width:'100%', maxWidth:480, animation:'slideUp .32s ease' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, background:'#E5E7EB', borderRadius:4, margin:'0 auto 20px' }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17 }}>Order Details</h2>
              <button onClick={()=>setSel(null)} style={{ width:30, height:30, borderRadius:'50%', background:'#F5F5F5', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            {[['Order ID','#'+sel.id.slice(0,10).toUpperCase()],['Vendor',DB.getVendorById(sel.vendorId)?.businessName||'—'],['Status',sel.status],['Total',`GH₵${parseFloat(sel.total||0).toFixed(2)}`],['Payment',sel.paymentRef||'—'],['Date',new Date(sel.createdAt).toLocaleString('en-GH')]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                <span style={{ color:'#9CA3AF' }}>{l}</span>
                <span style={{ fontWeight:600, color:'#0F0F0F', maxWidth:220, textAlign:'right', wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:14 }}>
              {sel.items?.map((item,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#F9FAFB', borderRadius:10, marginBottom:6, fontSize:13 }}>
                  <span>{item.qty}× {item.name}</span>
                  <span style={{ fontWeight:700, color:'#FF6B35' }}>GH₵{(item.price*item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
