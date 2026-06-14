// ─── Bottom Navigation — exact match to design screenshots ───────────
// Dark pill shape, 5 icons, home button elevated in center

function Icon({ d, size=22, strokeW=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

const TABS = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 12h6M9 16h4',
  },
  {
    id: 'search',
    label: 'Search',
    icon: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  },
  { id: 'home', label: 'Home', home: true },
  {
    id: 'notifs',
    label: 'Alerts',
    icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  },
  {
    id: 'profile',
    label: 'Account',
    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
];

export default function BottomNav({ section, setSection, notifCount = 0 }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = section === tab.id;

        if (tab.home) {
          return (
            <button key={tab.id} className="nav-home-btn" onClick={() => setSection(tab.id)}>
              <div className={`nav-home-inner ${active ? 'active' : ''}`}>
                <svg width="22" height="22" viewBox="0 0 24 24"
                  fill={active ? 'white' : 'rgba(255,255,255,.7)'}
                  stroke={active ? 'white' : 'rgba(255,255,255,.7)'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => setSection(tab.id)}
          >
            <div style={{ position: 'relative' }}>
              <Icon d={tab.icon} size={21} strokeW={active ? 2.5 : 2} />
              {tab.id === 'notifs' && notifCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  background: '#EF4444', color: 'white',
                  fontSize: 8, fontWeight: 800,
                  width: 13, height: 13, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #1A1A2E',
                }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
              {tab.id === 'orders' && active && (
                <span style={{
                  position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--primary)',
                }} />
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
