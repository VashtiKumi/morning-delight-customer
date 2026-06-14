// ─── Food item card displayed on Home and Menu pages ────────────────
import DB from '../utils/db';
import { foodImg, FOOD_IMGS } from '../utils/constants';

export default function FoodCard({ item, onAdd }) {
  const vendor = DB.getVendorById(item.vendorId);

  return (
    <div
      className="food-card"
      style={{ background: '#13131a', border: '1px solid #1c1c26', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s' }}
    >
      {/* Food image */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <img
          src={foodImg(item)}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s ease' }}
          onError={(e) => { e.target.src = FOOD_IMGS.Default; }}
          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.55) 100%)' }} />
        {/* Vendor badge */}
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
          {vendor?.businessName}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f0f5', marginBottom: 4 }}>{item.name}</div>
        <div style={{ fontSize: 11, color: '#4a4a60', marginBottom: 12, lineHeight: 1.5 }}>{item.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: '#ff6b35' }}>₵{item.price}</span>
          <button
            onClick={onAdd}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff6b35', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .15s', lineHeight: 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
