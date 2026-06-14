// ─── Morning Delight — Unified DB Layer (shared across all 3 apps) ───
const DB = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)) ?? []; } catch { return []; } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  getObj: (k)    => { try { return JSON.parse(localStorage.getItem(k)) ?? {}; } catch { return {}; } },
  genId:  ()     => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  genCode:()     => Math.floor(100000 + Math.random() * 900000).toString(),

  // ── Customers ──
  getCustomers:        ()    => DB.get('cb_customers'),
  saveCustomer:        (c)   => { const l=DB.getCustomers(); const i=l.findIndex(x=>x.id===c.id); i>-1?l[i]=c:l.push(c); DB.set('cb_customers',l); },
  findCustomerByEmail: (e)   => DB.getCustomers().find(c=>c.email===e?.toLowerCase()),
  getCustomerById:     (id)  => DB.getCustomers().find(c=>c.id===id),

  // ── Vendors ──
  getVendors:        ()   => DB.get('cb_vendors'),
  saveVendor:        (v)  => { const l=DB.getVendors(); const i=l.findIndex(x=>x.id===v.id); i>-1?l[i]=v:l.push(v); DB.set('cb_vendors',l); },
  findVendorByEmail: (e)  => DB.getVendors().find(v=>v.email===e?.toLowerCase()),
  getVendorById:     (id) => DB.getVendors().find(v=>v.id===id),

  // ── Menus ──
  getMenus:       ()    => DB.get('cb_menus'),
  getAllMenuItems: ()    => DB.get('cb_menus').filter(m=>m.available!==false),
  getMenuByVendor:(vid) => DB.get('cb_menus').filter(m=>m.vendorId===vid),
  saveMenuItem:   (item)=> { const l=DB.getMenus(); const i=l.findIndex(x=>x.id===item.id); i>-1?l[i]=item:l.push(item); DB.set('cb_menus',l); },
  deleteMenuItem: (id)  => DB.set('cb_menus', DB.getMenus().filter(m=>m.id!==id)),

  // ── Orders ──
  getOrders:            ()    => DB.get('cb_orders'),
  getOrdersByCustomer:  (id)  => DB.getOrders().filter(o=>o.customerId===id),
  getOrdersByVendor:    (id)  => DB.getOrders().filter(o=>o.vendorId===id),
  saveOrder:            (o)   => { const l=DB.getOrders(); const i=l.findIndex(x=>x.id===o.id); i>-1?l[i]=o:l.push(o); DB.set('cb_orders',l); },

  // ── Transactions (every payment event) ──
  getTransactions:           ()    => DB.get('cb_transactions'),
  getTransactionsByCustomer: (id)  => DB.getTransactions().filter(t=>t.customerId===id),
  getTransactionsByVendor:   (id)  => DB.getTransactions().filter(t=>t.vendorId===id),
  saveTransaction:           (tx)  => { const l=DB.getTransactions(); const i=l.findIndex(x=>x.id===tx.id); i>-1?l[i]=tx:l.push(tx); DB.set('cb_transactions',l); },


  // ── Subscriptions (3-week trial → 10% bi-weekly commission) ──
  getSubscriptions:           ()    => DB.get('cb_subscriptions'),
  getSubscriptionByVendor:    (vid) => DB.get('cb_subscriptions').find(s=>s.vendorId===vid),
  saveSubscription:           (s)   => { const l=DB.get('cb_subscriptions'); const i=l.findIndex(x=>x.id===s.id); i>-1?l[i]=s:l.push(s); DB.set('cb_subscriptions',l); },

  // ── Billing Cycles (auto-calculated every 14 days after trial) ──
  getBillingCycles:           ()    => DB.get('cb_billing_cycles'),
  getBillingCyclesByVendor:   (vid) => DB.get('cb_billing_cycles').filter(c=>c.vendorId===vid),
  saveBillingCycle:           (c)   => { const l=DB.get('cb_billing_cycles'); const i=l.findIndex(x=>x.id===c.id); i>-1?l[i]=c:l.push(c); DB.set('cb_billing_cycles',l); },

  // ── Notifications ──
  getNotifications:     (uid)  => DB.get('cb_notifs').filter(n=>n.userId===uid),
  saveNotification:     (n)    => { const l=DB.get('cb_notifs'); l.unshift(n); DB.set('cb_notifs', l.slice(0,50)); },
  markNotifsRead:       (uid)  => { const l=DB.get('cb_notifs').map(n=>n.userId===uid?{...n,read:true}:n); DB.set('cb_notifs',l); },

  // ── Reviews ──
  getReviews:          ()    => DB.get('cb_reviews'),
  getReviewsByVendor:  (vid) => DB.get('cb_reviews').filter(r=>r.vendorId===vid),
  saveReview:          (r)   => { const l=DB.getReviews(); l.unshift(r); DB.set('cb_reviews',l); },

  // ── Favourites ──
  getFavourites:  (cid) => DB.get('cb_favs').filter(f=>f.customerId===cid),
  toggleFavourite:(cid,vendorId) => {
    const l=DB.get('cb_favs'); const idx=l.findIndex(f=>f.customerId===cid&&f.vendorId===vendorId);
    if(idx>-1) l.splice(idx,1); else l.push({customerId:cid,vendorId,id:DB.genId()});
    DB.set('cb_favs',l);
  },
  isFavourite:(cid,vid)=>DB.get('cb_favs').some(f=>f.customerId===cid&&f.vendorId===vid),

  // ── Addresses ──
  getAddresses: (cid) => DB.get('cb_addresses').filter(a=>a.customerId===cid),
  saveAddress:  (a)   => { const l=DB.get('cb_addresses'); const i=l.findIndex(x=>x.id===a.id); i>-1?l[i]=a:l.push(a); DB.set('cb_addresses',l); },
  deleteAddress:(id)  => DB.set('cb_addresses', DB.get('cb_addresses').filter(a=>a.id!==id)),

  // ── Admin ──
  getAdmin:  ()  => DB.getObj('cb_admin'),
  saveAdmin: (a) => DB.set('cb_admin', a),

  // ── Email verification ──
  setVC:    (email,code) => { const c=DB.getObj('cb_vcodes'); c[email]={code,exp:Date.now()+600000}; DB.set('cb_vcodes',c); },
  verifyVC: (email,code) => { const c=DB.getObj('cb_vcodes'); const e=c[email]; if(!e||Date.now()>e.exp) return false; return e.code===code; },

  // ── Sessions ──
  getSession:    (role)    => DB.getObj(`cb_sess_${role}`),
  saveSession:   (role, d) => DB.set(`cb_sess_${role}`, d),
  clearSession:  (role)    => DB.set(`cb_sess_${role}`, {}),
};

export default DB;
