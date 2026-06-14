// ─── Service Worker Registration ────────────────────────────────────
// Registers the PWA service worker so the app:
//   • Works offline
//   • Loads instantly on repeat visits
//   • Can receive push notifications
//   • Shows "Add to Home Screen" prompt on Android

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — show a subtle banner
            showUpdateBanner();
          }
        });
      });

      console.log('[PWA] Service worker registered');
    } catch (err) {
      console.error('[PWA] Service worker registration failed:', err);
    }
  });
}

function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.id    = 'pwa-update-banner';
  banner.style.cssText = [
    'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
    'background:#FF6B35', 'color:white', 'padding:10px 20px',
    'border-radius:50px', 'font-size:14px', 'font-weight:700',
    'box-shadow:0 4px 16px rgba(255,107,53,.5)', 'z-index:9999',
    'cursor:pointer', 'white-space:nowrap',
  ].join(';');
  banner.textContent = '🔄 New version available — tap to refresh';
  banner.onclick = () => window.location.reload();
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 8000);
}

// ── "Install app" prompt handler ─────────────────────────────────────
// Android Chrome shows this automatically; we capture it to show our own UI
let deferredPrompt = null;

export function initInstallPrompt(onReady) {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    onReady?.();
  });
}

export async function triggerInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
