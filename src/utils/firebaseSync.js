// ─── Firebase Sync Engine ─────────────────────────────────────────────
//
// How it works:
//  1. On init: pulls ALL Firestore data into localStorage (one-time catch-up)
//  2. Sets up real-time listeners on critical collections
//  3. When another device writes data, Firebase listener fires →
//     updates localStorage → dispatches 'md-sync' event → React re-renders
//  4. Every DB write goes to localStorage (sync) AND Firestore (async)
//
// This means:
//  • Customer orders on THEIR phone → vendor's app sees it immediately
//  • Vendor posts food on THEIR phone → customer's app sees it in seconds
//  • Admin sees everything from every device in real time
//
// ─────────────────────────────────────────────────────────────────────

import { db, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from './firebase';

// ── Firestore collection names ────────────────────────────────────────
export const COLLECTIONS = {
  cb_customers:      'customers',
  cb_vendors:        'vendors',
  cb_menus:          'menuItems',
  cb_orders:         'orders',
  cb_transactions:   'transactions',
  cb_notifs:         'notifications',
  cb_subscriptions:  'subscriptions',
  cb_billing_cycles: 'billingCycles',
  cb_addresses:      'addresses',
  cb_reviews:        'reviews',
  cb_favs:           'favourites',
};

// ── Broadcast a sync event so React components know to re-render ──────
function broadcast(key) {
  window.dispatchEvent(new CustomEvent('md-sync', { detail: { key } }));
}

// ── Write a single document to Firestore ─────────────────────────────
export async function fsWrite(lsKey, id, data) {
  try {
    const colName = COLLECTIONS[lsKey];
    if (!colName || !id) return;
    // Remove undefined values (Firestore rejects them)
    const clean = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, colName, String(id)), clean, { merge: true });
  } catch (e) {
    // Network offline or config not set — fail silently, localStorage still works
    if (!e.message?.includes('Firebase')) {
      console.debug('Firebase write skipped:', e.message);
    }
  }
}

// ── Delete a document from Firestore ─────────────────────────────────
export async function fsDelete(lsKey, id) {
  try {
    const colName = COLLECTIONS[lsKey];
    if (!colName || !id) return;
    await deleteDoc(doc(db, colName, String(id)));
  } catch (e) {
    console.debug('Firebase delete skipped:', e.message);
  }
}

// ── Load ALL data from Firestore into localStorage ────────────────────
export async function fsLoadAll() {
  for (const [lsKey, colName] of Object.entries(COLLECTIONS)) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap.empty) continue;
      const items = snap.docs.map(d => d.data());
      // Merge with existing localStorage (Firebase is source of truth)
      localStorage.setItem(lsKey, JSON.stringify(items));
    } catch (e) {
      // If Firebase isn't configured yet, skip silently
    }
  }
  broadcast('all');
}

// ── Real-time listeners — update localStorage when any device writes ──
const unsubscribers = [];

export function fsListen(lsKeys) {
  // Cancel any existing listeners
  unsubscribers.forEach(u => u());
  unsubscribers.length = 0;

  lsKeys.forEach(lsKey => {
    const colName = COLLECTIONS[lsKey];
    if (!colName) return;

    try {
      const unsub = onSnapshot(
        collection(db, colName),
        (snap) => {
          const items = snap.docs.map(d => d.data());
          localStorage.setItem(lsKey, JSON.stringify(items));
          broadcast(lsKey);
        },
        (err) => {
          // Ignore errors (Firebase not configured, offline, etc.)
          console.debug('Firebase listener error:', err.message);
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      // Ignore setup errors
    }
  });
}

// ── Initialise: load data then start listeners ────────────────────────
export async function fsInit(listenKeys) {
  try {
    await fsLoadAll();
    if (listenKeys?.length) {
      fsListen(listenKeys);
    }
  } catch (e) {
    // App still works with localStorage if Firebase fails
    console.debug('Firebase init skipped:', e.message);
  }
}
