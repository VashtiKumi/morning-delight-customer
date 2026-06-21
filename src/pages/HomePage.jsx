// ─── Customer Home Page — Dark navy theme, fully dynamic ─────────────
// Sections pull live data from DB. Vendors with no menu items show
// "Coming Soon" instead of a broken card.
import { useState, useEffect } from 'react';
import DB from '../utils/db';
import { foodImg, FOOD_IMGS } from '../utils/constants';
import { LogoMark } from '../components/Logo';

// ── Design tokens ─────────────────────────────────────────────────────
const NAVY    = '#00004b';
const NAVY2   = '#000152';
const NAVY3   = '#08004d';
const ORANGE  = '#fc4300';
const ORANGE2 = '#f18100';
const GREEN   = '#168300';
const WHITE   = '#FFFFFF';
const MUTED   = 'rgba(255, 255, 255, 0.84)';

// ── Category sections to display ──────────────────────────────────────
const CATEGORY_SECTIONS = [
  { cat:'Rice',    label:'Rice & Stew',      img:'Rice' },
  { cat:'Soup',    label:'Soups & Stew',     img:'Soup' },
  { cat:'Local',   label:'Local Ghanaian',   img:'Local' },
  { cat:'Snacks',  label:'Snacks',           img:'Snacks' },
  { cat:'Chicken', label:'Chicken & Grills', img:'Chicken' },
  { cat:'Pizza',   label:'Pizza & Burgers',  img:'Pizza' },
  { cat:'Drinks',  label:'Drinks',           img:'Drinks' },
  { cat:'Burger',  label:'Burgers',          img:'Burger' },
];

// ── Star ──────────────────────────────────────────────────────────────
const Star = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffa200">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ── Scooter icon ──────────────────────────────────────────────────────
const Scooter = () => (
  <svg width="12" height="10" viewBox="0 0 24 18" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM16 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/>
    <path d="M5 14H3V9l3-4h6l2 5M19 14h-3l-2-5h4l2 2v3z"/>
  </svg>
);

// ── Horizontal scroll container ───────────────────────────────────────
function HScroll({ children }) {
  return (
    <div className="no-scroll" style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4 }}>
      {children}
    </div>
  );
}

// ── Section heading — white text for dark background ──────────────────
function SectionHead({ title, sub, onAll }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:WHITE }}>{title}</span>
        <button onClick={onAll} style={{ background:'none', border:'none', color:ORANGE, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:2 }}>
          All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      {sub && <div style={{ fontSize:12, color:MUTED, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ── Coming Soon card — shown for vendors with no menu items ───────────
function ComingSoonCard({ vendor, width=168 }) {
  return (
    <div style={{ width, flexShrink:0, borderRadius:14, overflow:'hidden' }}>
      <div style={{ height:108, background:NAVY3, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, border:`1px solid rgba(255,255,255,0.08)`, borderBottom:'none' }}>
        <span style={{ fontSize:30 }}>⏳</span>
        <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:'uppercase' }}>Coming Soon</span>
      </div>
      <div style={{ padding:'9px 10px 11px', background:WHITE }}>
        <div style={{ fontWeight:700, fontSize:13, color:'#0F0F0F', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {vendor?.businessName || 'New Restaurant'}
        </div>
        <div style={{ fontSize:11, color:'#9CA3AF' }}>Menu being prepared</div>
      </div>
    </div>
  );
}

// ── Vendor card — shows cover photo, rating, delivery info ────────────
function VendorCard({ vendor, onSelect, hasItems, itemCover, width=168 }) {
  const [fav, setFav] = useState(false);

  // No menu items yet → Coming Soon card
  if (!hasItems) return <ComingSoonCard vendor={vendor} width={width}/>;

  // Pick best cover image: vendor's own image → fallback by specialty
  const specialtyImgMap = {
    'Rice & Stew':        FOOD_IMGS.Rice,    'Local Ghanaian': FOOD_IMGS.Local,
    'Soups & Stew':       FOOD_IMGS.Soup,    'Snacks & Fast Food': FOOD_IMGS.Snacks,
    'Chicken & Grills':   FOOD_IMGS.Chicken, 'Pizza & Burgers': FOOD_IMGS.Pizza,
    'Drinks & Beverages': FOOD_IMGS.Drinks,  'Mixed Menu': FOOD_IMGS.Default,
  };
  // Priority: vendor's own cover → uploaded food item image → specialty fallback → default
  const cover = vendor.coverImg || itemCover || specialtyImgMap[vendor.specialty] || FOOD_IMGS.Default;

  return (
    <div className="card card-press" onClick={() => onSelect(vendor)}
      style={{ width, flexShrink:0, borderRadius:14, overflow:'hidden', cursor:'pointer' }}>
      {/* Photo */}
      <div style={{ height:108, position:'relative', overflow:'hidden', background:'#F0F0F0' }}>
        <img src={cover} alt={vendor.businessName}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => { e.target.src = FOOD_IMGS.Default; }} />
        {/* Heart */}
        <button onClick={e => { e.stopPropagation(); setFav(!fav); }}
          style={{ position:'absolute', top:7, right:7, width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.92)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={fav?'#EF4444':'none'} stroke={fav?'#EF4444':'#9CA3AF'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* Rating */}
        <div style={{ position:'absolute', bottom:7, right:7, background:'rgba(255,255,255,.95)', borderRadius:20, padding:'2px 7px', display:'flex', alignItems:'center', gap:3 }}>
          <Star />
          <span style={{ fontSize:10, fontWeight:700 }}>{vendor.rating||4.4}({vendor.reviewCount||0})</span>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding:'9px 10px 11px' }}>
        <div style={{ fontWeight:700, fontSize:13, color:'#0F0F0F', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {vendor.businessName}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#6B7280' }}>
          <Scooter />
          {vendor.deliveryFee === 0 ? (
            <>
              <span style={{ color:'#EF4444', fontWeight:600, textDecoration:'line-through', fontSize:10 }}>GH₵8.00</span>
              <span style={{ color:GREEN, fontWeight:700 }}>GH₵0.00</span>
            </>
          ) : (
            <span style={{ color:'#6B7280' }}>GH₵{parseFloat(vendor.deliveryFee||0).toFixed(2)}</span>
          )}
          <span style={{ color:'#E5E7EB' }}>·</span>
          <span>{vendor.deliveryTime||'35-50'} m</span>
        </div>
      </div>
    </div>
  );
}

// ── Promo banner ──────────────────────────────────────────────────────
function PromoBanner({ title, sub, cta, bg, img, onClick }) {
  return (
    <div onClick={onClick} style={{ background:bg, borderRadius:14, padding:'14px', display:'flex', justifyContent:'space-between', alignItems:'center', overflow:'hidden', flexShrink:0, width:170, cursor:'pointer', position:'relative' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:12, color:WHITE, lineHeight:1.3, marginBottom:4 }}>{title}</div>
        {sub && <div style={{ fontSize:10, color:'rgba(255,255,255,.7)', marginBottom:8, lineHeight:1.4 }}>{sub}</div>}
        <div style={{ fontSize:10, fontWeight:700, color:WHITE, textDecoration:'underline' }}>{cta}</div>
      </div>
      {img && <img src={img} alt="" style={{ width:50, height:50, objectFit:'cover', borderRadius:8, flexShrink:0, marginLeft:8 }} onError={e=>{e.target.style.display='none';}} />}
    </div>
  );
}

// ── Coming Soon section (when no vendors have items in a category) ─────
function ComingSoonSection({ categoryLabel }) {
  return (
    <HScroll>
      {[1,2,3].map(i => (
        <div key={i} style={{ width:168, flexShrink:0, borderRadius:14, overflow:'hidden' }}>
          <div style={{ height:108, background:NAVY3, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, border:'1px solid rgba(255,255,255,0.06)', borderBottom:'none' }}>
            <span style={{ fontSize:30 }}>⏳</span>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:'uppercase' }}>Coming Soon</span>
          </div>
          <div style={{ padding:'9px 10px 11px', background:WHITE }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#0F0F0F', marginBottom:3 }}>New Restaurant</div>
            <div style={{ fontSize:11, color:'#9CA3AF' }}>Opening in {categoryLabel}</div>
          </div>
        </div>
      ))}
    </HScroll>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main HomePage
// ═══════════════════════════════════════════════════════════════════════
export default function HomePage({ customer, setSection, onSelectVendor }) {
  const [slide, setSlide] = useState(0);
  const [, tick] = useState(0);

  // Auto-rotate hero banner every 4s
  useEffect(() => {
    const t = setInterval(() => setSlide(v => (v + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  // Re-render when window regains focus (catches vendor menu updates)
  useEffect(() => {
    const onFocus = () => tick(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // ── Live data ────────────────────────────────────────────────────────
  const allVendors  = DB.getVendors().filter(v => v.active !== false);
  const allItems    = DB.getAllMenuItems();

  // Which vendors actually have menu items posted
  const vendorIdsWithItems = new Set(allItems.map(i => i.vendorId));
  const hasItems = (vid) => vendorIdsWithItems.has(vid);

  // Get the best image for a vendor card — first item with an uploaded photo
  const getItemCover = (vid) => {
    const item = allItems.find(i => i.vendorId === vid && i.imageData && i.available !== false);
    return item?.imageData || null;
  };

  // Top vendors for "In the Spotlight" — sorted by rating, up to 6
  const spotlightVendors = [...allVendors]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  // Most popular — vendors with most menu items, up to 5
  const popularVendors = [...allVendors]
    .sort((a, b) => {
      const aCount = allItems.filter(i => i.vendorId === a.id).length;
      const bCount = allItems.filter(i => i.vendorId === b.id).length;
      return bCount - aCount || (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 5);

  // Per-category: vendors who have items in that category
  const vendorsByCategory = (cat) => {
    const ids = new Set(allItems.filter(i => i.category === cat).map(i => i.vendorId));
    return allVendors.filter(v => ids.has(v.id));
  };

  const banners = [
    { bg:`linear-gradient(135deg,${ORANGE} 0%,${ORANGE2} 100%)`,  text:'FUEL YOUR DAY.\nDELICIOUSLY SIMPLE', img:FOOD_IMGS.Banner },
    { bg:`linear-gradient(135deg,${NAVY2} 0%,${NAVY3} 100%)`,     text:'BREAKFAST MEALS\nFAST & FRESH',       img:FOOD_IMGS.Hero2 },
    { bg:'linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)',        text:'GRAB YOUR\nFAVOURITE BURGER',        img:FOOD_IMGS.Pizza },
  ];

  return (
    <div style={{ background:NAVY, minHeight:'100vh' }} className="page-wrapper">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div style={{ background:NAVY, paddingTop:'max(44px,env(safe-area-inset-top))', paddingBottom:14, paddingLeft:16, paddingRight:16, position:'sticky', top:0, zIndex:200, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {/* Row 1: Logo + Location + Avatar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <LogoMark size={36}/>
            <div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:10, color:ORANGE, lineHeight:1.0, letterSpacing:2, textTransform:'uppercase' }}>Morning</div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, color:WHITE, lineHeight:1.1, textTransform:'uppercase' }}>Delight</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={ORANGE}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:WHITE, lineHeight:1.1 }}>{customer?.location||'Accra'}</div>
              </div>
            </div>
            <button onClick={()=>setSection('profile')} style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${ORANGE},${ORANGE2})`, border:'2px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
          </div>
        </div>
        {/* Search bar */}
        <div onClick={()=>setSection('search')} style={{ background:'rgba(255,255,255,0.08)', borderRadius:50, display:'flex', alignItems:'center', padding:'10px 14px', gap:10, cursor:'pointer', border:'1px solid rgba(255,255,255,0.1)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ flex:1, color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'DM Sans,sans-serif' }}>Breakfast, Lunch, Fast-food...</span>
          <div style={{ width:28, height:28, borderRadius:8, background:ORANGE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="9" y2="12"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ padding:'16px 16px 0', maxWidth:760, margin:'0 auto' }}>

        {/* Hero banner — rotating */}
        <div style={{ position:'relative', borderRadius:18, overflow:'hidden', marginBottom:22, height:155 }}>
          {banners.map((b, i) => (
            <div key={i} style={{ position:'absolute', inset:0, background:b.bg, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', opacity:slide===i?1:0, transition:'opacity .7s ease', zIndex:slide===i?1:0 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:WHITE, lineHeight:1.25, whiteSpace:'pre-line', marginBottom:12 }}>{b.text}</div>
                <button onClick={()=>setSection('search')} style={{ background:WHITE, border:'none', borderRadius:20, padding:'7px 16px', fontSize:12, fontWeight:700, color:ORANGE, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Order Now</button>
              </div>
              <img src={b.img} alt="" style={{ width:100, height:120, objectFit:'cover', borderRadius:12, flexShrink:0, marginLeft:12 }} onError={e=>{e.target.style.display='none';}}/>
            </div>
          ))}
          {/* Dots */}
          <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5, zIndex:10 }}>
            {banners.map((_, i) => (
              <div key={i} onClick={()=>setSlide(i)} style={{ width:i===slide?18:6, height:6, borderRadius:3, background:i===slide?WHITE:'rgba(255,255,255,.4)', transition:'all .3s', cursor:'pointer' }}/>
            ))}
          </div>
        </div>

        {/* ── In the Spotlight ─────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <SectionHead title="In the Spotlight" sub="Sponsored" onAll={()=>setSection('search')}/>
          <HScroll>
            {spotlightVendors.length > 0 ? (
              spotlightVendors.map(v => (
                <VendorCard key={v.id} vendor={v} onSelect={onSelectVendor} hasItems={hasItems(v.id)} itemCover={getItemCover(v.id)}/>
              ))
            ) : (
              // No vendors registered yet — show coming soon placeholders
              [1,2,3].map(i => <ComingSoonCard key={i} vendor={{ businessName:`Restaurant ${i}` }}/>)
            )}
          </HScroll>
        </div>

        {/* ── Most Popular ─────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <SectionHead title="Most Popular" onAll={()=>setSection('search')}/>
          <HScroll>
            {popularVendors.length > 0 ? (
              popularVendors.map(v => (
                <VendorCard key={v.id} vendor={v} onSelect={onSelectVendor} hasItems={hasItems(v.id)} itemCover={getItemCover(v.id)}/>
              ))
            ) : (
              [1,2,3].map(i => <ComingSoonCard key={i} vendor={{ businessName:`Restaurant ${i}` }}/>)
            )}
          </HScroll>
        </div>

        {/* ── Promo banners ────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <HScroll>
            <PromoBanner title="Local Meals" sub="Affordable & delicious" cta="Tap to Order" bg={NAVY2} img={FOOD_IMGS.Local} onClick={()=>setSection('search')}/>
            <PromoBanner title="Breakfast Meals" sub="Fast & fresh every morning" cta="Click to order" bg={ORANGE} img={FOOD_IMGS.Rice} onClick={()=>setSection('search')}/>
            <PromoBanner title="Burgers & Pizza" sub="Quick campus delivery" cta="Click to order" bg="#7c3aed" img={FOOD_IMGS.Pizza} onClick={()=>setSection('search')}/>
          </HScroll>
        </div>

        {/* ── Dynamic category sections ────────────────────────────────── */}
        {CATEGORY_SECTIONS.map(({ cat, label, img }) => {
          const catVendors = vendorsByCategory(cat);

          // Only show category section if at least 1 vendor has items there
          // OR if we want to show "Coming Soon" for categories even when empty:
          // Show section if vendors exist (even without items)
          if (allVendors.length === 0) return null;

          return (
            <div key={cat} style={{ marginBottom:24 }}>
              <SectionHead title={label} onAll={()=>setSection('search')}/>
              {catVendors.length > 0 ? (
                <HScroll>
                  {catVendors.map(v => (
                    <VendorCard key={v.id} vendor={v} onSelect={onSelectVendor} hasItems={true} itemCover={getItemCover(v.id)}/>
                  ))}
                </HScroll>
              ) : (
                // No vendor has items in this category yet
                <HScroll>
                  {[1,2].map(i => (
                    <div key={i} style={{ width:168, flexShrink:0, borderRadius:14, overflow:'hidden' }}>
                      <div style={{ height:108, background:NAVY3, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, border:'1px solid rgba(255,255,255,0.06)', borderBottom:'none', position:'relative', overflow:'hidden' }}>
                        <img src={FOOD_IMGS[img]||FOOD_IMGS.Default} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }}/>
                        <span style={{ fontSize:28, position:'relative', zIndex:1 }}>⏳</span>
                        <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:'uppercase', position:'relative', zIndex:1 }}>Coming Soon</span>
                      </div>
                      <div style={{ padding:'9px 10px 11px', background:WHITE }}>
                        <div style={{ fontWeight:700, fontSize:13, color:'#0F0F0F', marginBottom:3 }}>New {label}</div>
                        <div style={{ fontSize:11, color:'#9CA3AF' }}>Vendors opening soon</div>
                      </div>
                    </div>
                  ))}
                </HScroll>
              )}
            </div>
          );
        })}

        {/* ── No vendors at all ────────────────────────────────────────── */}
        {allVendors.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', marginBottom:24 }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🍽️</div>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:WHITE, marginBottom:8 }}>Coming Soon</div>
            <div style={{ fontSize:14, color:MUTED, lineHeight:1.7, maxWidth:260, margin:'0 auto' }}>
              Restaurants are registering. Check back soon for fresh food across campus!
            </div>
          </div>
        )}

        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
