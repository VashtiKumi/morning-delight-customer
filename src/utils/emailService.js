// ─────────────────────────────────────────────────────────────────────
//  EmailJS Email Service — Morning Delight
//  Sends real OTP verification emails to users on signup.
//
//  SETUP (one-time, free at emailjs.com):
//  1. Go to https://www.emailjs.com and create a free account
//  2. Connect your Gmail/Outlook under Email Services → note your SERVICE_ID
//  3. Create an Email Template with these variables:
//       {{to_name}}   — recipient's name
//       {{to_email}}  — recipient's email (set as "To Email" field)
//       {{otp_code}}  — the 6-digit code
//       {{app_name}}  — "Morning Delight"
//     Subject: "Your Morning Delight verification code: {{otp_code}}"
//     Body example:
//       Hi {{to_name}}, your verification code is {{otp_code}}. Valid for 10 minutes.
//  4. Note your TEMPLATE_ID and PUBLIC_KEY (Account → API Keys)
//  5. Replace the three values below.
//
//  Until configured, the app falls back to showing the code on screen (demo mode).
// ─────────────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'abcDEFghiJKLmno'

const isConfigured = () =>
  !EMAILJS_SERVICE_ID.startsWith('YOUR_') &&
  !EMAILJS_TEMPLATE_ID.startsWith('YOUR_') &&
  !EMAILJS_PUBLIC_KEY.startsWith('YOUR_');

/**
 * Loads the EmailJS SDK dynamically (only once).
 */
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Sends an OTP email to the user.
 * Returns { sent: true } on success, { sent: false, demo: true, code } when not configured.
 */
export async function sendOTPEmail({ toName, toEmail, otpCode }) {
  if (!isConfigured()) {
    // Demo mode — show code in UI instead
    console.log(`[Demo] OTP for ${toEmail}: ${otpCode}`);
    return { sent: false, demo: true, code: otpCode };
  }

  try {
    await loadEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:  toName,
      to_email: toEmail,
      otp_code: otpCode,
      app_name: 'Morning Delight',
    });
    return { sent: true };
  } catch (err) {
    console.error('EmailJS error:', err);
    // Fallback to demo mode if sending fails
    return { sent: false, demo: true, code: otpCode };
  }
}
