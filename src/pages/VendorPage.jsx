// ─── Vendor Detail Page (KFC Dansoman style from screenshots) ────────
import { useState } from 'react';
import DB from '../utils/db';
import { notifyOrderPlaced } from '../utils/notificationService';
import { foodImg, FOOD_IMGS, DELIVERY_FEE, SERVICE_FEE, POINTS_PER_ORDER, REWARD_TIERS } from '../utils/constants';
import PaystackModal from '../components/PaystackModal';

// ── Item detail bottom sheet ──
function ItemSheet({ item, vendor, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState([]);
  const baseExtras = ['Extra Jollof','Extra Chicken','Extra Fried egg','Extra Chilly Sauce','Extra Veggie','Extra Cream'];
  const extraPrice = 36;

  const toggleExtra = (e) => setExtras(x=>x.includes(e)?x.filter(i=>i!==e):[...x,e]);
  const total = (item.price + extras.length*extraPrice) * qty;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, background:'rgba(0,0,0,.4)', backdropFilter:'blur(2px)' }} onClick={onClose} />
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', maxHeight:'90vh', overflow:'auto', animation:'slideUp .35s ease' }}>
        {/* Hero image */}
        <div style={{ height:240, position:'relative', overflow:'hidden', borderRadius:'24px 24px 0 0' }}>
          <img src={foodImg(item)} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src=FOOD_IMGS.Default;}} />
          <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          {/* Info overlay */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top,#1A1A2E 0%,transparent 100%)', padding:'24px 20px 16px' }}>
            {item.popular&&<span className="popular-badge" style={{ marginBottom:8, display:'inline-block' }}>Popular</span>}
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:'white', marginBottom:4 }}>{item.name}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontSize:22, fontWeight:800, color:'#e43d00' }}>GH₵ {item.price?.toFixed(2)}</span>
              {item.discount>0&&<span style={{ fontSize:14, color:'rgba(255,255,255,.5)', textDecoration:'line-through' }}>GH₵{(item.price/(1-item.discount/100)).toFixed(2)}</span>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding:'16px 20px 0' }}>
          <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.6 }}>{item.description}</p>
        </div>

        {/* Extras */}
        <div style={{ padding:'20px 20px 0' }}>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, marginBottom:16 }}>Extra</h3>
          {baseExtras.map(e=>(
            <div key={e} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F3F4F6' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div onClick={()=>toggleExtra(e)} style={{ width:20, height:20, borderRadius:4, border:`2px solid ${extras.includes(e)?'#FF6B35':'#D1D5DB'}`, background:extras.includes(e)?'#FF6B35':'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {extras.includes(e)&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span style={{ fontSize:15 }}>{e}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, color:'#f04000', fontSize:15 }}>+GH₵{extraPrice.toFixed(2)}</div>
                <div style={{ fontSize:11, color:'#9CA3AF', textDecoration:'line-through' }}>GH₵{(extraPrice+20).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom add to cart */}
        <div style={{ padding:'20px 20px 40px', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, background:'#F5F5F5', borderRadius:50, padding:'8px 18px' }}>
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:28, height:28, borderRadius:'50%', background:'white', border:'none', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>−</button>
            <span style={{ fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' }}>{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} style={{ width:28, height:28, borderRadius:'50%', background:'white', border:'none', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>+</button>
          </div>
          <button onClick={()=>{ onAddToCart({...item,qty,extras}); onClose(); }} className="btn-primary" style={{ flex:1, padding:'14px', fontSize:15, borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span>Add</span>
            <span style={{ background:'rgba(255,255,255,.25)', padding:'2px 10px', borderRadius:20, fontWeight:800 }}>GH₵{total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorPage({ vendor, customer, showToast, onBack, onOrderPlaced }) {
  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('All');
  const [selItem,   setSelItem]   = useState(null);
  const [cart,      setCart]      = useState([]);
  const [showCart,  setShowCart]  = useState(false);
  const [showPay,   setShowPay]   = useState(false);
  const [orderType, setOrderType] = useState('now');

  let items = DB.getMenuByVendor(vendor.id).filter(i=>i.available!==false);
  if(cat!=='All') items=items.filter(i=>i.category===cat);
  if(search) items=items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()));

  const cats = ['All',...new Set(DB.getMenuByVendor(vendor.id).map(i=>i.category))];

  const addToCart = (item) => {
    setCart(prev=>{
      const ex=prev.find(c=>c.id===item.id);
      if(ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+(item.qty||1)}:c);
      return [...prev,{...item,qty:item.qty||1,vendorId:vendor.id}];
    });
    showToast(`${item.name} added to cart`,'success');
  };

  const cartCount = cart.reduce((s,c)=>s+c.qty,0);
  const sub   = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const total = sub + DELIVERY_FEE + SERVICE_FEE;

  const handlePaymentSuccess = (ref) => {
    const orderId = DB.genId();
    const txId    = DB.genId();
    const order   = { id:orderId, customerId:customer.id, vendorId:vendor.id, items:cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,category:i.category})), total, sub, deliveryFee:DELIVERY_FEE, serviceFee:SERVICE_FEE, status:'confirmed', orderType, isPreorder:orderType==='preorder', paymentRef:ref, paymentMethod:'MoMo/Paystack', paymentStatus:'paid', createdAt:new Date().toISOString() };
    DB.saveOrder(order);
    DB.saveTransaction({ id:txId, orderId, customerId:customer.id, vendorId:vendor.id, amount:total, sub, deliveryFee:DELIVERY_FEE, serviceFee:SERVICE_FEE, ref, paymentMethod:'MoMo', currency:'GHS', status:'success', createdAt:new Date().toISOString() });

    // Notify the CUSTOMER that their order/preorder was placed
    notifyOrderPlaced(order, vendor, customer);

    // Award points + credits
    const c=DB.findCustomerByEmail(customer.email);
    let unlocked=null;
    if(c){ const old=c.points||0; c.points=old+POINTS_PER_ORDER; c.totalOrders=(c.totalOrders||0)+1; REWARD_TIERS.forEach(t=>{if(old<t.points&&c.points>=t.points){c.credits=(c.credits||0)+t.credit;unlocked=t;}}); DB.saveCustomer(c); }

    // Notification for vendor
    DB.saveNotification({ id:DB.genId(), userId:vendor.id, type:'new_order', title:'New Order!', body:`${customer.name} placed an order — ₵${total.toFixed(2)}`, orderId, read:false, createdAt:new Date().toISOString() });

    setCart([]); setShowCart(false); setShowPay(false);
    showToast(`Order placed! +${POINTS_PER_ORDER} points earned`,'success');
    if(unlocked) showToast(`Reward unlocked! +₵${unlocked.credit} credit`,'success');
    onOrderPlaced&&onOrderPlaced(POINTS_PER_ORDER,unlocked);
    onBack();
  };

  return (
    <div style={{ background:'white', minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ height:200, position:'relative', overflow:'hidden' }}>
        <img src={vendor.coverImg||FOOD_IMGS.Default} alt={vendor.businessName} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src=FOOD_IMGS.Default;}} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,.15),rgba(0,0,0,.55))' }} />
        <button onClick={onBack} style={{ position:'absolute', top:48, left:16, width:38, height:38, borderRadius:'50%', background:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {/* Action icons */}
        <div style={{ position:'absolute', top:48, right:16, display:'flex', gap:10 }}>
          {[['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13'],['M21 21l-4.35-4.35M11 11a8 8 0 1 1 0-16 8 8 0 0 1 0 16']].map((path,i)=>(
            <button key={i} style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2"><path d={path[0]}/></svg>
            </button>
          ))}
        </div>
      </div>

      {/* Vendor info sheet */}
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', marginTop:-24, padding:'20px 20px 0', position:'relative' }}>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, marginBottom:4 }}>{vendor.businessName}</h1>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#6B7280', marginBottom:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fa9e00" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span style={{ fontWeight:700 }}>{vendor.rating||4.4} ({vendor.reviewCount||520}+)</span>
          <span>·</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>GH₵{vendor.deliveryFee||0}.00</span>
          <span>·</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>{vendor.deliveryTime||'25-40'} min</span>
        </div>
        {vendor.specialty&&<div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:20, padding:'4px 12px', fontSize:12, color:'#92400E', fontWeight:600, marginBottom:12 }}>
          Temporarily opened · <span style={{ color:'#FF6B35', textDecoration:'underline' }}>More info</span>
        </div>}

        {/* Offer banners */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:16, paddingBottom:4, scrollbarWidth:'none' }}>
          {['15% off everything on orders over GH₵ 90.00','15% off everything on orders over GH₵ 90.00','15% off everything'].map((offer,i)=>(
            <div key={i} style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:20, padding:'6px 12px', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <span style={{ background:'#e41b00', color:'white', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>%</span>
              <span style={{ fontSize:11, color:'#883400', fontWeight:500, whiteSpace:'nowrap' }}>{offer}</span>
            </div>
          ))}
        </div>

        {/* Category search */}
        <div style={{ background:'#F5F5F5', borderRadius:50, display:'flex', alignItems:'center', padding:'10px 14px', gap:10, marginBottom:16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="All categories" style={{ flex:1, border:'none', background:'transparent', fontSize:14, outline:'none' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="9" y2="12"/></svg>
        </div>

        {/* Category tabs */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:20, paddingBottom:4, scrollbarWidth:'none' }}>
          {cats.map(c=><span key={c} className={`tag-pill ${cat===c?'active':''}`} onClick={()=>setCat(c)} style={{ whiteSpace:'nowrap' }}>{c}</span>)}
        </div>

        {/* Menu sections */}
        {['Most popular','Limited Time Offer','Value Meals'].map(section=>{
          const filtered=items.slice(0,4);
          if(!filtered.length) return null;
          return (
            <div key={section} style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16 }}>{section}</span>
                <span style={{ fontSize:13, color:'#ec3f00', fontWeight:700, cursor:'pointer' }}>All →</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {filtered.map(item=>(
                  <div key={item.id} className="food-card" style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,.07)', cursor:'pointer', border:'1px solid #F3F4F6' }} onClick={()=>setSelItem(item)}>
                    <div style={{ height:110, position:'relative', overflow:'hidden' }}>
                      <img src={foodImg(item)} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src=FOOD_IMGS.Default;}} />
                      {item.discount>0&&<span className="discount-badge" style={{ position:'absolute', top:6, left:6 }}>-{item.discount}%</span>}
                      {item.popular&&<span className="popular-badge" style={{ position:'absolute', top:6, left:6+((item.discount>0)?44:0) }}>Popular</span>}
                    </div>
                    <div style={{ padding:'10px 10px 12px' }}>
                      <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', marginBottom:4 }}>{item.name}</div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, color:'#ee3f00', fontSize:14 }}>GH₵{item.price?.toFixed(2)}</div>
                          {item.discount>0&&<div style={{ fontSize:10, color:'#9CA3AF', textDecoration:'line-through' }}>GH₵{(item.price/(1-item.discount/100)).toFixed(2)}</div>}
                        </div>
                        <button onClick={e=>{e.stopPropagation(); addToCart(item);}} style={{ width:28, height:28, borderRadius:'50%', background:'#FF6B35', border:'none', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart button */}
      {cartCount>0&&(
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)', zIndex:300, width:'calc(100% - 32px)', maxWidth:448 }}>
          <button onClick={()=>setShowCart(true)} className="btn-primary" style={{ width:'100%', padding:'16px 24px', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:15 }}>
            <span style={{ background:'rgba(255,255,255,.25)', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>{cartCount}</span>
            <span>View Cart</span>
            <span style={{ fontWeight:800 }}>GH₵{sub.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item detail sheet */}
      {selItem&&<ItemSheet item={selItem} vendor={vendor} onClose={()=>setSelItem(null)} onAddToCart={addToCart} />}

      {/* Cart sheet */}
      {showCart&&(
        <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, background:'rgba(0,0,0,.4)' }} onClick={()=>setShowCart(false)} />
          <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', maxHeight:'85vh', overflow:'auto', animation:'slideUp .35s ease' }}>
            <div style={{ width:40, height:4, background:'#E5E7EB', borderRadius:4, margin:'0 auto 20px' }} />
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, marginBottom:20 }}>Your Cart</h2>

            {/* Order type toggle */}
            <div style={{ display:'flex', background:'#F5F5F5', borderRadius:50, padding:4, marginBottom:20 }}>
              {['now','preorder'].map(t=>(
                <button key={t} onClick={()=>setOrderType(t)} style={{ flex:1, padding:'10px', borderRadius:46, background:orderType===t?'white':'transparent', border:'none', fontWeight:700, fontSize:13, cursor:'pointer', color:orderType===t?'#FF6B35':'#6B7280', boxShadow:orderType===t?'0 2px 8px rgba(0,0,0,.1)':'none', transition:'all .2s' }}>
                  {t==='now'?'Order Now':'Pre-order Tomorrow'}
                </button>
              ))}
            </div>

            {cart.map(item=>(
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
                <div style={{ width:56, height:56, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                  <img src={foodImg(item)} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{item.name}</div>
                  <div style={{ fontFamily:'Sora,sans-serif', color:'#ff4400', fontWeight:800, fontSize:15 }}>GH₵{(item.price*item.qty).toFixed(2)}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={()=>setCart(c=>c.map(x=>x.id===item.id?{...x,qty:Math.max(0,x.qty-1)}:x).filter(x=>x.qty>0))} style={{ width:28, height:28, borderRadius:'50%', background:'#F5F5F5', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontWeight:700, minWidth:16, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={()=>setCart(c=>c.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x))} style={{ width:28, height:28, borderRadius:'50%', background:'#FF6B35', border:'none', cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                </div>
              </div>
            ))}

            <div style={{ background:'#F9FAFB', borderRadius:14, padding:16, margin:'16px 0' }}>
              {[['Subtotal',`GH₵${sub.toFixed(2)}`],['Delivery Fee',`GH₵${DELIVERY_FEE.toFixed(2)}`],['Service Fee',`GH₵${SERVICE_FEE.toFixed(2)}`]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:14, color:'#6B7280' }}><span>{l}</span><span>{v}</span></div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', borderTop:'1px solid #E5E7EB', marginTop:6, fontWeight:800, fontSize:16 }}>
                <span>Total</span><span style={{ color:'#fc4300' }}>GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'10px 14px', marginBottom:20, fontSize:13, color:'#166534' }}>
              You'll earn +{POINTS_PER_ORDER} reward points for this order!
            </div>

            <button onClick={()=>setShowPay(true)} className="btn-primary" style={{ width:'100%', padding:'16px', fontSize:16, borderRadius:50 }}>
              Proceed to Payment →
            </button>
          </div>
        </div>
      )}

      {/* Paystack */}
      {showPay&&vendor&&<PaystackModal vendor={vendor} total={total} customer={customer} onSuccess={handlePaymentSuccess} onClose={()=>setShowPay(false)} />}
    </div>
  );
}
