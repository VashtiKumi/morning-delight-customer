// ─── Sound Service — Web Audio API (no files needed) ──────────────────
// All sounds generated mathematically. Works in all browsers.
// Rule: Must be called after a user gesture (browser policy).
// Call SoundService.unlock() on first click to pre-warm AudioContext.

let _ctx = null;

function ctx() {
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(freq, start, dur, vol = 0.25, type = 'sine') {
  const c = ctx(); if (!c) return;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0,   c.currentTime + start);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.06);
}

const SoundService = {
  /** Pre-warm AudioContext after first user click */
  unlock() { try { ctx(); } catch(e){} },

  /**
   * VENDOR — New order arrived (loud, urgent square-wave alarm)
   * Plays two bursts of double-beep so vendor definitely hears it
   */
  newOrder() {
    try {
      [0, 0.45, 0.90].forEach(off => {
        tone(880,  off,       0.15, 0.42, 'square');
        tone(1100, off + 0.2, 0.15, 0.42, 'square');
      });
    } catch(e) {}
  },

  /** CUSTOMER — Order confirmed by vendor (bright upward chime) */
  orderConfirmed() {
    try {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.38, 0.2));
    } catch(e) {}
  },

  /** CUSTOMER — Food is being prepared (gentle double-ding) */
  preparing() {
    try {
      tone(784,  0,    0.28, 0.2);
      tone(1047, 0.22, 0.38, 0.18);
    } catch(e) {}
  },

  /** CUSTOMER — Food is ready for pickup (three-note rising fanfare) */
  foodReady() {
    try {
      tone(880,  0,    0.15, 0.28);
      tone(1047, 0.17, 0.15, 0.28);
      tone(1319, 0.34, 0.48, 0.24);
    } catch(e) {}
  },

  /**
   * CUSTOMER — Driver on the way (exciting alert — louder + longer)
   * Also auto-opens GPS tracking, so make it unmissable
   */
  onTheWay() {
    try {
      tone(660,  0,    0.12, 0.3, 'triangle');
      tone(784,  0.14, 0.12, 0.3, 'triangle');
      tone(880,  0.28, 0.12, 0.3, 'triangle');
      tone(1047, 0.42, 0.48, 0.32, 'triangle');
      tone(880,  0.42, 0.48, 0.2,  'sine');     // harmony
    } catch(e) {}
  },

  /** CUSTOMER — Order delivered (celebratory ascending arpeggio) */
  delivered() {
    try {
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        tone(f, i * 0.1, 0.45, 0.18);
      });
    } catch(e) {}
  },

  /** Play the right sound for any status string */
  forStatus(status) {
    switch (status) {
      case 'confirmed':  return this.orderConfirmed();
      case 'preparing':  return this.preparing();
      case 'ready':      return this.foodReady();
      case 'on_the_way': return this.onTheWay();
      case 'delivered':  return this.delivered();
      default:           return this.preparing();
    }
  },
};

export default SoundService;
