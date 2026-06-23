// ─── Morning Delight — DB Layer with Firebase sync ────────────────────
// Reads:  always from localStorage (fast, synchronous, works offline)
// Writes: localStorage FIRST (instant) + Firebase async (syncs to cloud)
// Result: Every customer, vendor and admin sees the same data everywhere
// ─────────────────────────────────────────────────────────────────────

import { fsWrite, fsDelete } from './firebaseSync';

const DB = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)) ?? []; } catch { return []; } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  getObj: (k)    => { try { return JSON.parse(localStorage.getItem(k)) ?? {}; } catch { return {}; } },
  genId:  ()     => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  genCode:()     => Math.floor(100000 + Math.random() * 900000).toString(),

  // ── Customers ──
  getCustomers:        ()    => DB.get('cb_customers'),
  findCustomerByEmail: (e)   => DB.getCustomers().find(c => c.email === e?.toLowerCase()),
  getCustomerById:     (id)  => DB.getCustomers().find(c => c.id === id),
  saveCustomer: (c) => {
    const l = DB.getCustomers(); const i = l.findIndex(x => x.id === c.id);
    i > -1 ? l[i] = c : l.push(c); DB.set('cb_customers', l);
    fsWrite('cb_customers', c.id, c);
  },

  // ── Vendors ──
  getVendors:        ()   => DB.get('cb_vendors'),
  findVendorByEmail: (e)  => DB.getVendors().find(v => v.email === e?.toLowerCase()),
  getVendorById:     (id) => DB.getVendors().find(v => v.id === id),
  saveVendor: (v) => {
    const l = DB.getVendors(); const i = l.findIndex(x => x.id === v.id);
    i > -1 ? l[i] = v : l.push(v); DB.set('cb_vendors', l);
    fsWrite('cb_vendors', v.id, v);
  },

  // ── Menus ──
  getMenus:        ()    => DB.get('cb_menus'),
  getAllMenuItems:  ()    => DB.get('cb_menus').filter(m => m.available !== false),
  getMenuByVendor: (vid) => DB.get('cb_menus').filter(m => m.vendorId === vid),
  saveMenuItem: (item) => {
    const l = DB.getMenus(); const i = l.findIndex(x => x.id === item.id);
    i > -1 ? l[i] = item : l.push(item); DB.set('cb_menus', l);
    fsWrite('cb_menus', item.id, item);
  },
  deleteMenuItem: (id) => {
    DB.set('cb_menus', DB.getMenus().filter(m => m.id !== id));
    fsDelete('cb_menus', id);
  },

  // ── Orders ──
  getOrders:           ()   => DB.get('cb_orders'),
  getOrdersByCustomer: (id) => DB.getOrders().filter(o => o.customerId === id),
  getOrdersByVendor:   (id) => DB.getOrders().filter(o => o.vendorId === id),
  saveOrder: (o) => {
    const l = DB.getOrders(); const i = l.findIndex(x => x.id === o.id);
    i > -1 ? l[i] = o : l.push(o); DB.set('cb_orders', l);
    fsWrite('cb_orders', o.id, o);
  },

  // ── Transactions ──
  getTransactions:           ()   => DB.get('cb_transactions'),
  getTransactionsByCustomer: (id) => DB.getTransactions().filter(t => t.customerId === id),
  getTransactionsByVendor:   (id) => DB.getTransactions().filter(t => t.vendorId === id),
  saveTransaction: (tx) => {
    const l = DB.getTransactions(); const i = l.findIndex(x => x.id === tx.id);
    i > -1 ? l[i] = tx : l.push(tx); DB.set('cb_transactions', l);
    fsWrite('cb_transactions', tx.id, tx);
  },

  // ── Subscriptions ──
  getSubscriptions:        ()    => DB.get('cb_subscriptions'),
  getSubscriptionByVendor: (vid) => DB.get('cb_subscriptions').find(s => s.vendorId === vid),
  saveSubscription: (s) => {
    const l = DB.get('cb_subscriptions'); const i = l.findIndex(x => x.id === s.id);
    i > -1 ? l[i] = s : l.push(s); DB.set('cb_subscriptions', l);
    fsWrite('cb_subscriptions', s.id, s);
  },

  // ── Billing Cycles ──
  getBillingCycles:         ()    => DB.get('cb_billing_cycles'),
  getBillingCyclesByVendor: (vid) => DB.get('cb_billing_cycles').filter(c => c.vendorId === vid),
  saveBillingCycle: (c) => {
    const l = DB.get('cb_billing_cycles'); const i = l.findIndex(x => x.id === c.id);
    i > -1 ? l[i] = c : l.push(c); DB.set('cb_billing_cycles', l);
    fsWrite('cb_billing_cycles', c.id, c);
  },

  // ── Notifications ──
  getNotifications: (uid) => DB.get('cb_notifs').filter(n => n.userId === uid),
  markNotifsRead:   (uid) => {
    const l = DB.get('cb_notifs').map(n => n.userId === uid ? { ...n, read: true } : n);
    DB.set('cb_notifs', l);
    // Mark each notification read in Firestore too
    l.filter(n => n.userId === uid).forEach(n => fsWrite('cb_notifs', n.id, n));
  },
  saveNotification: (n) => {
    const l = DB.get('cb_notifs'); l.unshift(n); DB.set('cb_notifs', l.slice(0, 100));
    fsWrite('cb_notifs', n.id, n);
  },

  // ── Reviews ──
  getReviews:         ()    => DB.get('cb_reviews'),
  getReviewsByVendor: (vid) => DB.get('cb_reviews').filter(r => r.vendorId === vid),
  saveReview: (r) => {
    const l = DB.getReviews(); l.unshift(r); DB.set('cb_reviews', l);
    fsWrite('cb_reviews', r.id, r);
  },

  // ── Favourites ──
  getFavourites:   (cid)          => DB.get('cb_favs').filter(f => f.customerId === cid),
  isFavourite:     (cid, vid)     => DB.get('cb_favs').some(f => f.customerId === cid && f.vendorId === vid),
  toggleFavourite: (cid, vendorId) => {
    const l = DB.get('cb_favs');
    const idx = l.findIndex(f => f.customerId === cid && f.vendorId === vendorId);
    if (idx > -1) {
      const removed = l.splice(idx, 1)[0];
      DB.set('cb_favs', l);
      fsDelete('cb_favs', removed.id);
    } else {
      const fav = { customerId: cid, vendorId, id: DB.genId() };
      l.push(fav); DB.set('cb_favs', l);
      fsWrite('cb_favs', fav.id, fav);
    }
  },

  // ── Addresses ──
  getAddresses:  (cid) => DB.get('cb_addresses').filter(a => a.customerId === cid),
  saveAddress: (a) => {
    const l = DB.get('cb_addresses'); const i = l.findIndex(x => x.id === a.id);
    i > -1 ? l[i] = a : l.push(a); DB.set('cb_addresses', l);
    fsWrite('cb_addresses', a.id, a);
  },
  deleteAddress: (id) => {
    DB.set('cb_addresses', DB.get('cb_addresses').filter(a => a.id !== id));
    fsDelete('cb_addresses', id);
  },

  // ── Admin ──
  getAdmin:  ()  => DB.getObj('cb_admin'),
  saveAdmin: (a) => {
    DB.set('cb_admin', a);
    fsWrite('cb_admin', 'config', a);
  },

  // ── Verification codes (local only — short-lived OTPs) ──
  setVC:    (email, code) => {
    const c = DB.getObj('cb_vcodes');
    c[email] = { code, exp: Date.now() + 600000 };
    DB.set('cb_vcodes', c);
  },
  verifyVC: (email, code) => {
    const c = DB.getObj('cb_vcodes');
    const e = c[email];
    if (!e || Date.now() > e.exp) return false;
    return e.code === code;
  },

  // ── Sessions (local per device — intentionally NOT synced) ──
  getSession:   (role)    => DB.getObj(`cb_sess_${role}`),
  saveSession:  (role, d) => DB.set(`cb_sess_${role}`, d),
  clearSession: (role)    => DB.set(`cb_sess_${role}`, {}),
};

export default DB;
