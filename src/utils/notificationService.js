// ─── Customer Notification Service ───────────────────────────────────
// Handles three automatic notification types:
//
//  1. Morning greeting (6 AM – 10:30 AM, once per day)
//     → "Good morning! What would you like to eat today?"
//
//  2. New food uploads (checked every time app opens or regains focus)
//     → "3 new items added to Ama's Kitchen!"
//
//  3. Order / preorder placed (fired immediately on payment success)
//     → "Order placed! Waiting for vendor confirmation…"
//
// No backend needed. Uses localStorage + Web Notifications API.
// ─────────────────────────────────────────────────────────────────────

import DB from './db';
import SoundService from './soundService';

// ── Push a native browser notification ──────────────────────────────
function push(title, body, tag = 'md-notif', icon = '/icons/icon-192.png') {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon, badge: '/icons/icon-72.png', tag, vibrate: [200, 100, 200] });
  }
}

// ── Save to in-app notification bell ─────────────────────────────────
function saveInApp(userId, type, title, body, extra = {}) {
  DB.saveNotification({
    id: DB.genId(), userId, type, title, body,
    read: false, createdAt: new Date().toISOString(), ...extra,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 1. MORNING GREETING
// ═══════════════════════════════════════════════════════════════════════
const GREETINGS = [
  { title: 'Good morning! ☀️', body: 'What would you like to eat today? Fresh food is waiting for you!' },
  { title: 'Rise & eat! 🍳',   body: 'Start your day right — order a hot breakfast from Morning Delight.' },
  { title: 'Morning hunger? 🌅', body: 'Jollof rice, light soup, kelewele... tap to order now!' },
  { title: 'Good morning! ☕',  body: 'Your favourite food is just a tap away. What are you craving?' },
  { title: 'Time to fuel up! 🔥', body: 'Fresh food from campus restaurants, delivered to you.' },
];

export function checkMorningGreeting(userId, showToast) {
  const now   = new Date();
  const hour  = now.getHours();
  const today = now.toDateString();

  // Only fire between 6:00 AM and 10:30 AM
  if (hour < 6 || (hour === 10 && now.getMinutes() > 30) || hour > 10) return false;

  const key  = `md_morning_${userId}`;
  const last = localStorage.getItem(key);
  if (last === today) return false; // already shown today

  // Mark as shown today
  localStorage.setItem(key, today);

  // Pick a random greeting
  const { title, body } = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

  // Get customer name for personalised message
  const customer = DB.getCustomerById(userId);
  const firstName = customer?.name?.split(' ')[0] || '';
  const personalTitle = firstName ? `Good morning, ${firstName}! ☀️` : title;

  // Play a gentle wake-up chime
  SoundService.unlock();
  setTimeout(() => SoundService.orderConfirmed(), 300);

  // Browser notification
  push(personalTitle, body, 'morning-greeting');

  // In-app notification
  saveInApp(userId, 'morning', personalTitle, body);

  // In-app toast (brief, friendly)
  showToast?.(`${personalTitle} ${body.split('!')[0]}!`, 'info');

  return true;
}

// ═══════════════════════════════════════════════════════════════════════
// 2. NEW FOOD UPLOAD NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════
export function checkNewFoodUploads(userId, showToast) {
  if (!userId) return;

  const key     = `md_food_checked_${userId}`;
  const lastTs  = parseInt(localStorage.getItem(key) || '0', 10);
  const nowTs   = Date.now();

  // Update last-checked timestamp
  localStorage.setItem(key, nowTs.toString());

  // First visit ever — don't flood with "all existing food is new"
  if (lastTs === 0) return;

  const allItems  = DB.getAllMenuItems();
  const newItems  = allItems.filter(item => {
    const t = new Date(item.createdAt).getTime();
    return t > lastTs && t <= nowTs;
  });

  if (newItems.length === 0) return;

  // Group by vendor
  const byVendor = {};
  newItems.forEach(item => {
    const v = DB.getVendorById(item.vendorId);
    if (!v) return;
    if (!byVendor[v.id]) byVendor[v.id] = { vendor: v, items: [] };
    byVendor[v.id].items.push(item);
  });

  const vendorEntries = Object.values(byVendor);
  if (vendorEntries.length === 0) return;

  // Compose message
  let title, body;
  if (vendorEntries.length === 1) {
    const { vendor, items } = vendorEntries[0];
    title = `🍽️ New food at ${vendor.businessName}!`;
    body  = `${items.length} new item${items.length > 1 ? 's' : ''} just added — ${items.slice(0, 2).map(i => i.name).join(', ')}${items.length > 2 ? ` +${items.length - 2} more` : ''}.`;
  } else {
    const total = newItems.length;
    title = `🍽️ ${total} new item${total > 1 ? 's' : ''} just added!`;
    body  = vendorEntries.map(({ vendor, items }) => `${vendor.businessName} (+${items.length})`).join(', ');
  }

  // Play a subtle alert sound
  SoundService.unlock();
  setTimeout(() => SoundService.foodReady(), 200);

  // Browser notification
  push(title, body, 'new-food');

  // In-app notification (save once, for the newest batch)
  saveInApp(userId, 'new_food', title, body);

  // Toast
  showToast?.(`${title} ${vendorEntries[0]?.vendor.businessName || ''}`, 'success');
}

// ═══════════════════════════════════════════════════════════════════════
// 3. ORDER / PREORDER PLACED — called from VendorPage after payment
// ═══════════════════════════════════════════════════════════════════════
export function notifyOrderPlaced(order, vendor, customer) {
  if (!customer?.id) return;

  const isPreorder = order.isPreorder;
  const vName      = vendor?.businessName || 'the restaurant';
  const items      = order.items?.slice(0, 2).map(i => `${i.qty}× ${i.name}`).join(', ') || '';
  const more       = (order.items?.length || 0) > 2 ? ` +${order.items.length - 2} more` : '';

  const title = isPreorder ? '📅 Pre-order Confirmed!' : '✅ Order Placed!';
  const body  = isPreorder
    ? `Your pre-order from ${vName} (${items}${more}) has been confirmed. You'll be notified when it's ready.`
    : `Your order from ${vName} (${items}${more}) has been placed! Total: GH₵${parseFloat(order.total || 0).toFixed(2)}. Waiting for confirmation.`;

  // Play confirmation sound
  SoundService.unlock();
  setTimeout(() => SoundService.orderConfirmed(), 100);

  // Browser notification
  push(title, body, 'order-placed');

  // In-app notification (visible in notification bell)
  saveInApp(customer.id, 'order_placed', title, body, { orderId: order.id });
}

// ═══════════════════════════════════════════════════════════════════════
// 4. TRIGGER from vendor MenuPage when new item is saved
//    (Call this from vendor-app whenever saveMenuItem is called)
// ═══════════════════════════════════════════════════════════════════════
export function recordNewFoodUpload() {
  // Store the timestamp of the latest upload so customer app can detect it
  localStorage.setItem('cb_last_new_item_ts', Date.now().toString());
}
