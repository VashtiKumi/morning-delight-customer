const COLORS = { success:'#10b981', error:'#EF4444', info:'#FF6B35', warning:'#F59E0B' };
export default function Toasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:8, width:'calc(100% - 32px)', maxWidth:420, pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:COLORS[t.type]||'#333', color:'white', borderRadius:14, padding:'13px 18px', fontSize:14, fontWeight:600, boxShadow:`0 6px 20px ${COLORS[t.type]||'#333'}40`, animation:'fadeUp .3s ease', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,.7)', flexShrink:0 }} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
