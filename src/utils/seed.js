// ─── Demo data seeder ────────────────────────────────────────────────
// Called once on app first load. Creates demo vendors + menu items.
import DB from './db';
import { enc } from './constants';

export function seedDemoData() {
  if(localStorage.getItem('cb_seeded_v4')) return;

  // Seed admin
  if(!DB.getAdmin()?.email) {
    DB.saveAdmin({ email:'admin@morningdelight.com', password:enc('Admin@2024'), name:'System Admin' });
  }

  const v1=DB.genId(), v2=DB.genId(), v3=DB.genId();

  DB.saveVendor({ id:v1, ownerName:'Ama Owusu',    businessName:"Ama's Kitchen",    email:'ama@demo.com',   momoNumber:'0244123456', password:enc('demo123'), specialty:'Local Ghanaian', rating:4.4, reviewCount:296, deliveryTime:'35-50', deliveryFee:0, minOrder:8,  verified:true,  active:true, joinDate:new Date().toISOString(), role:'vendor', coverImg:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', logoImg:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80' });
  DB.saveVendor({ id:v2, ownerName:'Kofi Mensah',   businessName:"Kofi's Grill",     email:'kofi@demo.com',  momoNumber:'0551987654', password:enc('demo123'), specialty:'Rice & Stew',    rating:4.2, reviewCount:180, deliveryTime:'25-40', deliveryFee:0, minOrder:10, verified:true,  active:true, joinDate:new Date().toISOString(), role:'vendor', coverImg:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', logoImg:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80' });
  DB.saveVendor({ id:v3, ownerName:'Papa Joe',       businessName:"Papa's Pizza",      email:'papa@demo.com',  momoNumber:'0208765432', password:enc('demo123'), specialty:'Pizza & Fast Food', rating:4.5, reviewCount:412, deliveryTime:'20-35', deliveryFee:0, minOrder:15, verified:true, active:true, joinDate:new Date().toISOString(), role:'vendor', coverImg:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', logoImg:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80' });

  // Menu items are NOT seeded — vendors must post their own food through the vendor portal.
  // This ensures the customer app shows "Coming Soon" until real vendors post their menus.
  // Demo vendors can log in and add their own menu items via the vendor app.

  // ── Seed trial subscriptions for demo vendors ──
  if (!localStorage.getItem('cb_subscriptions') || JSON.parse(localStorage.getItem('cb_subscriptions')||'[]').length === 0) {
    const subNow = new Date();
    const trialSubs = [
      { id:'sub_'+v1, vendorId:v1, trialStart: new Date(subNow - 5*86400000).toISOString(),  trialEnd: new Date(+subNow + 16*86400000).toISOString(), status:'trial', createdAt: new Date(subNow - 5*86400000).toISOString()  },
      { id:'sub_'+v2, vendorId:v2, trialStart: new Date(subNow - 18*86400000).toISOString(), trialEnd: new Date(+subNow + 3*86400000).toISOString(),  status:'trial', createdAt: new Date(subNow - 18*86400000).toISOString() },
      { id:'sub_'+v3, vendorId:v3, trialStart: new Date(subNow - 25*86400000).toISOString(), trialEnd: new Date(+subNow - 4*86400000).toISOString(),  status:'active', createdAt: new Date(subNow - 25*86400000).toISOString() },
    ];
    localStorage.setItem('cb_subscriptions', JSON.stringify(trialSubs));
  }

  localStorage.setItem('cb_seeded_v4','1');
}
