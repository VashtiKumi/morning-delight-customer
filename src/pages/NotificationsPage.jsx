// ─── Customer Notifications Page ─────────────────────────────────────
import { useEffect } from 'react';
import DB from '../utils/db';

const TYPE_CONFIG = {
  order_placed: { color:'#2D6A4F', bg:'#f0fdf4', border:'#a7f3d0', icon:'✅' },
  order_update: { color:'#0039a3', bg:'#ecfeff', border:'#a5f3fc', icon:'📦' },
  on_the_way:   { color:'#f84200', bg:'#fff7ed', border:'#fed7aa', icon:'🛵' },
  delivered:    { color:'#047900', bg:'#f0fdf4', border:'#bbf7d0', icon:'🎉' },
  morning:      { color:'#ffa200', bg:'#fffbeb', border:'#fde68a', icon:'☀️' },
  new_food:     { color:'#5200df', bg:'#f5f3ff', border:'#ddd6fe', icon:'🍽️' },
  reward:       { color:'#F59E0B', bg:'#fffbeb', border:'#fde68a', icon:'⭐' },
  promo:        { color:'#4300b8', bg:'#f5f3ff', border:'#ddd6fe', icon:'🎁' },
  new_order:    { color:'#f04000', bg:'#fff7ed', border:'#fed7aa', icon:'🔔' },
  system:       { color:'#000f94', bg:'#f9fafb', border:'#E5E7EB', icon:'⚙️' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GH', { day:'numeric', month:'short' });
}

export default function NotificationsPage({ customer }) {
  const notifs = customer ? DB.getNotifications(customer.id) : [];

  // Mark all as read when page opens
  useEffect(() => {
    if (customer) DB.markNotifsRead(customer.id);
  }, [customer?.id]);

  const unread = notifs.filter(n => !n.read).length;

  if (!customer) return null;

  return (
    <div style={{ background:'#F2F2F2', minHeight:'100vh' }} className="page-wrapper">
      {/* Header */}
      <div style={{ background:'white', padding:'48px 16px 16px', borderBottom:'1px solid #F3F4F6', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:'#0F0F0F' }}>Notifications</h1>
          {unread > 0 && (
            <span style={{ background:'#EF4444', color:'white', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>
              {unread} new
            </span>
          )}
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {notifs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔔</div>
            <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:'#0F0F0F', marginBottom:8 }}>All caught up!</h3>
            <p style={{ color:'#9CA3AF', fontSize:14, lineHeight:1.7 }}>
              You'll get notified about your orders, new food uploads, and morning meal suggestions.
            </p>
          </div>
        ) : (
          <>
            {/* Group by day */}
            {groupByDay(notifs).map(({ label, items }) => (
              <div key={label}>
                <div style={{ fontSize:12, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:1, marginBottom:10, marginTop:label !== 'Today' ? 16 : 0 }}>
                  {label}
                </div>
                {items.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  return (
                    <div key={n.id} style={{
                      background: n.read ? 'white' : cfg.bg,
                      borderRadius:16, padding:'14px 16px', marginBottom:10,
                      boxShadow:'0 2px 8px rgba(0,0,0,.05)',
                      borderLeft:`3.5px solid ${n.read ? '#E5E7EB' : cfg.border}`,
                      transition:'background .3s',
                    }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        {/* Icon circle */}
                        <div style={{ width:38, height:38, borderRadius:12, background:`${cfg.color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>
                          {cfg.icon}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
                            <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, color:'#0F0F0F', lineHeight:1.3 }}>{n.title}</span>
                            <span style={{ fontSize:11, color:'#9CA3AF', fontFamily:'DM Sans,sans-serif', flexShrink:0, marginTop:1 }}>{timeAgo(n.createdAt)}</span>
                          </div>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#6B7280', lineHeight:1.55, margin:0 }}>{n.body}</p>
                          {!n.read && (
                            <div style={{ width:6, height:6, borderRadius:'50%', background:cfg.color, marginTop:8 }}/>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function groupByDay(notifs) {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups    = {};

  notifs.forEach(n => {
    const day = new Date(n.createdAt).toDateString();
    const label = day === today ? 'Today' : day === yesterday ? 'Yesterday' : new Date(n.createdAt).toLocaleDateString('en-GH', { day:'numeric', month:'long' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  // Keep Today and Yesterday first
  const order = ['Today','Yesterday'];
  const keys  = Object.keys(groups).sort((a,b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return  1;
    return 0;
  });

  return keys.map(label => ({ label, items: groups[label] }));
}
