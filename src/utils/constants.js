export const POINTS_PER_ORDER = 4;
export const DELIVERY_FEE = 2.00;
export const SERVICE_FEE  = 1.50;

export const REWARD_TIERS = [
  { points:500,  credit:10, label:'Bronze Star',   color:'#cd7f32' },
  { points:1000, credit:20, label:'Gold Champion', color:'#ffd60a' },
  { points:2000, credit:50, label:'Platinum Elite',color:'#e5e4e2' },
];

export const FOOD_IMGS = {
  Rice:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85',
  Soup:    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=85',
  Snacks:  'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=600&q=85',
  Drinks:  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=85',
  Local:   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=85',
  Chicken: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=600&q=85',
  Pizza:   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85',
  Burger:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85',
  Default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85',
  Hero1:   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=85',
  Hero2:   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=85',
  Hero3:   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=85',
  Banner:  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85',
  Auth:    'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=85',
  VendorBg:'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&q=85',
  AdminBg: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=900&q=85',
};

export const VENDOR_IMGS = {
  v1:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  v2:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  v3:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
};

export const CATEGORIES = ['All','Rice','Soup','Local','Snacks','Drinks','Chicken','Pizza','Burger'];

export function foodImg(item) {
  if(item?.imageData) return item.imageData;
  return FOOD_IMGS[item?.category] || FOOD_IMGS.Default;
}

export const isOrderingOpen = () => { const h=new Date().getHours(); return h>=5&&h<22; };
export const enc = (s) => { try { return btoa(s); } catch { return s; } };
export const dec = (s) => { try { return atob(s); } catch { return s; } };
export const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx';

// Color palette — Morning Delight brand
export const BRAND = {
  primary:  '#FF6B35',
  dark:     '#1A1A2E',
  darkCard: '#16213E',
  accent:   '#F7931E',
  success:  '#10b981',
  text:     '#0F0F0F',
  muted:    '#9CA3AF',
};
