# Morning Delight — Customer App

Student-facing food ordering app for Morning Delight campus platform.

## Quick Start

```bash
npm install
npm start        # opens on http://localhost:3000
```

## Demo Credentials
- Register a new student account, OR log in with any account you created

## File Structure
```
src/
├── App.jsx                   ← Root component, session handling, screen flow
├── index.js                  ← React entry point
├── styles/
│   └── global.css            ← Fonts, animations, utility classes
├── utils/
│   ├── db.js                 ← Shared localStorage database layer
│   └── constants.js          ← Images, reward tiers, helpers
├── hooks/
│   └── useToast.js           ← Toast notification hook
├── components/
│   ├── Loader.jsx            ← Animated loading screen with image carousel
│   ├── Sidebar.jsx           ← Navigation sidebar with SVG icons
│   ├── FoodCard.jsx          ← Food item card with image + add-to-cart
│   ├── PaystackModal.jsx     ← Paystack MoMo payment flow (4 steps)
│   ├── RewardPopup.jsx       ← Reward unlock notification popup
│   └── Toasts.jsx            ← Toast notification renderer
└── pages/
    ├── AuthPage.jsx          ← Login + register with email verification
    ├── HomePage.jsx          ← Featured items + reward progress banner
    ├── MenuPage.jsx          ← Full menu with search and category filters
    ├── CartPage.jsx          ← Cart, order type, checkout → Paystack
    ├── OrdersPage.jsx        ← Order history with edit/cancel for pre-orders
    ├── RewardsPage.jsx       ← CampusBite Rewards — points, tiers, credits
    └── ProfilePage.jsx       ← Update phone + password
```

## Paystack Integration
To go live with real payments:
1. Get your public key from https://dashboard.paystack.com
2. Replace `PAYSTACK_PUBLIC_KEY` in `src/utils/constants.js`
3. Set up a backend POST `/api/pay` that calls Paystack's charge API server-side
4. See `src/components/PaystackModal.jsx` for full instructions and the request shape

## Shared Data
All three apps (Customer, Vendor, Admin) share `localStorage` keys prefixed with `cb_`.
Open all three in different tabs of the same browser and data flows live between them.
