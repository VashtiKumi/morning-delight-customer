# Deploy Morning Delight (Customer App) — FREE on Netlify

## What this gives you
- Works on Android phones (Chrome) — shows "Add to Home Screen" automatically
- Works on iPhones (Safari) — tap Share → Add to Home Screen
- Works on any laptop/desktop browser
- Works offline after first visit
- Completely FREE, no App Store fees ever

---

## Step 1 — Build the app (2 minutes)
Open a terminal in this folder and run:
```
npm install
npm run build
```
This creates a `build/` folder with the finished app files.

---

## Step 2 — Host for free on Netlify (5 minutes)

1. Go to **https://netlify.com** and sign up (free, use your Google or GitHub account)
2. Once logged in, click **"Add new site" → "Deploy manually"**
3. Drag your **`build/`** folder onto the Netlify page
4. Done! Netlify gives you a free URL like `https://morning-delight.netlify.app`

That's it. Your app is now live on the internet.

---

## Step 3 — Give customers the link
Share the Netlify URL with your customers. When they open it:

**On Android:**
- Chrome shows a blue "Add to Home Screen" bar at the bottom
- OR they tap the three-dot menu → "Add to Home Screen"
- App icon appears on their home screen like any other app
- Opens fullscreen, no browser bar

**On iPhone (iOS):**
- Open the link in Safari (must be Safari, not Chrome)
- Tap the Share icon at the bottom (box with arrow pointing up)
- Scroll and tap "Add to Home Screen"
- Tap "Add"
- App icon appears on their home screen

---

## Custom domain (optional, still free)
In Netlify settings → Domain Management → Add a custom domain.
If you have a domain name (e.g. `morningdelight.com.gh`) you can point it to Netlify for free.

---

## Updates
Whenever you change the code and want to update the live app:
1. Run `npm run build` again
2. Go to Netlify → Your site → Deploys → Drag the new `build/` folder

The app on users' phones updates automatically on their next visit.

---

## Netlify free tier limits
- 100 GB bandwidth per month (enough for thousands of users)
- Unlimited sites
- Automatic HTTPS
- 300 build minutes/month (if using auto-deploy)
