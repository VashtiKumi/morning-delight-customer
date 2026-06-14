// ─── Search / Browse Page — White theme, live vendor list ────────────
// Shows all active vendors. If vendor has no menu items → "No menu yet" badge.
// Category filter only shows vendors who have items in that category.
import { useState } from 'react';
import DB from '../utils/db';
import { FOOD_IMGS } from '../utils/constants';

const GREEN = '#2D6A4F';  // Emerald green for active filter
const CATS  = ['All','Rice','Soup','Local','Snacks','Drinks','Chicken','Pizza','Burger'];

export default function SearchPage({ onSelectVendor }) {
  const [q,   setQ]   = useState('');
  const [cat, setCat] = useState('All');

  const allVendors = DB.getVendors().filter(v => v.active !== false);
  const allItems   = DB.getAllMenuItems();
  const vendorIdsWithItems = new Set(allItems.map(i => i.vendorId));
  const hasItems = (vid) => vendorIdsWithItems.has(vid);
  // Get first uploaded food image for a vendor
  const getItemCover = (vid) => allItems.find(i => i.vendorId===vid && i.imageData && i.available!==false)?.imageData || null;

  // Specialty image map
  const specialtyImgMap = {
    'Rice & Stew':        FOOD_IMGS.Rice,    'Local Ghanaian': FOOD_IMGS.Local,
    'Soups & Stew':       FOOD_IMGS.Soup,    'Snacks & Fast Food': FOOD_IMGS.Snacks,
    'Chicken & Grills':   FOOD_IMGS.Chicken, 'Pizza & Burgers': FOOD_IMGS.Pizza,
    'Drinks & Beverages': FOOD_IMGS.Drinks,  'Mixed Menu': FOOD_IMGS.Default,
  };

  // Filter vendors
  let filtered = [...allVendors];
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter(v =>
      v.businessName?.toLowerCase().includes(lq) ||
      v.specialty?.toLowerCase().includes(lq) ||
      allItems.some(i => i.vendorId === v.id && i.name?.toLowerCase().includes(lq))
    );
  }
  if (cat !== 'All') {
    const vendorIdsInCat = new Set(
      allItems.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).map(i => i.vendorId)
    );
    filtered = filtered.filter(v => vendorIdsInCat.has(v.id));
  }

  return (
    <div style={{ background:'white', minHeight:'100vh' }} className="page-wrapper">

      {/* Search header */}
      <div style={{ background:'white', padding:'48px 16px 12px', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid #F3F4F6' }}>
        <div style={{ background:'#F5F5F5', borderRadius:50, display:'flex', alignItems:'center', padding:'12px 16px', gap:10, marginBottom:12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={q} onChange={e=>setQ(e.target.value)} autoFocus
            placeholder="Search restaurants or dishes..."
            style={{ flex:1, border:'none', background:'transparent', fontSize:15, outline:'none', color:'#0F0F0F', fontFamily:'DM Sans,sans-serif' }}/>
          {q && <button onClick={()=>setQ('')} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>}
        </div>
        {/* Category pills */}
        <div className="no-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {CATS.map(c => (
            <span key={c} onClick={()=>setCat(c)}
              style={{ display:'inline-block', padding:'7px 14px', borderRadius:50, fontSize:13, fontFamily:'DM Sans,sans-serif', fontWeight:cat===c?700:500, cursor:'pointer', flexShrink:0, transition:'all .15s',
                background: cat===c ? GREEN : '#F3F4F6',
                color:       cat===c ? 'white' : '#374151',
                border:      cat===c ? `1px solid ${GREEN}` : '1px solid transparent' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding:'16px' }}>
        <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:16, fontFamily:'DM Sans,sans-serif' }}>
          {filtered.length} restaurant{filtered.length!==1?'s':''} found
          {cat!=='All' && ` in "${cat}"`}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(v => {
            const cover = v.coverImg || getItemCover(v.id) || specialtyImgMap[v.specialty] || FOOD_IMGS.Default;
            const vHasItems = hasItems(v.id);
            return (
              <div key={v.id} onClick={()=>onSelectVendor(v)}
                style={{ display:'flex', gap:14, background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)', cursor:'pointer', border:'1px solid #F3F4F6', padding:12, position:'relative', opacity: vHasItems?1:.85 }}>
                <div style={{ width:80, height:80, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#F0F0F0', position:'relative' }}>
                  <img src={cover} alt={v.businessName} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src=FOOD_IMGS.Default;}}/>
                  {/* Coming Soon overlay on thumbnail */}
                  {!vHasItems && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12 }}>
                      <span style={{ fontSize:18 }}>⏳</span>
                    </div>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:3 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#0F0F0F', fontFamily:'DM Sans,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.businessName}</div>
                    {!vHasItems && (
                      <span style={{ flexShrink:0, fontSize:10, fontWeight:700, color:'#9CA3AF', background:'#F3F4F6', border:'1px solid #E5E7EB', borderRadius:20, padding:'2px 8px', fontFamily:'DM Sans,sans-serif' }}>
                        Coming soon
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>{v.specialty}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, flexWrap:'wrap' }}>
                    {/* Rating */}
                    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontWeight:700, color:'#0F0F0F' }}>{v.rating||4.4}</span>
                      <span style={{ color:'#9CA3AF' }}>({v.reviewCount||0})</span>
                    </div>
                    <span style={{ color:'#E5E7EB' }}>·</span>
                    <span style={{ color:'#9CA3AF', fontFamily:'DM Sans,sans-serif' }}>{v.deliveryTime||'35-50'} min</span>
                    <span style={{ color:'#E5E7EB' }}>·</span>
                    <span style={{ color:v.deliveryFee===0?GREEN:'#6B7280', fontWeight:v.deliveryFee===0?700:400, fontFamily:'DM Sans,sans-serif' }}>
                      {v.deliveryFee===0 ? 'Free delivery' : `GH₵${v.deliveryFee} delivery`}
                    </span>
                  </div>
                  {/* Items count hint */}
                  {vHasItems && (
                    <div style={{ marginTop:5, fontSize:11, color:'#9CA3AF', fontFamily:'DM Sans,sans-serif' }}>
                      {allItems.filter(i=>i.vendorId===v.id).length} items on menu
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px 20px', color:'#9CA3AF' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16, color:'#374151', marginBottom:8 }}>
                {q || cat !== 'All' ? 'No matches found' : 'No restaurants yet'}
              </div>
              <div style={{ fontSize:13, color:'#9CA3AF', lineHeight:1.7, maxWidth:260, margin:'0 auto' }}>
                {q ? `No restaurants or dishes matching "${q}"` :
                 cat !== 'All' ? `No restaurants serving ${cat} yet. Coming soon!` :
                 'Vendors are registering. Check back soon!'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
