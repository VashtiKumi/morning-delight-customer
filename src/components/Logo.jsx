// ─── Morning Delight Logo & Mark Components ───────────────────────────
// Usage:
//   <LogoMark size={40} />              — just the icon square
//   <LogoFull light />                  — full logo, light text version
//   <LogoFull dark />                   — full logo, dark text (on cream bg)

export function LogoMark({ size = 40 }) {
  const r = Math.round(size * 0.188); // ~Apple icon rounding ratio
  const s = size;
  // All values proportional to size (base: 512)
  const sc = (v) => (v / 512) * s;

  return (
    <svg width={s} height={s} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: r, display: 'block', flexShrink: 0 }}>
      <defs>
        <radialGradient id={`md-bg-${s}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#2A1E0F"/>
          <stop offset="100%" stopColor="#0f0e2c"/>
        </radialGradient>
        <radialGradient id={`md-sun-${s}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFE8A0"/>
          <stop offset="60%"  stopColor="#e99700"/>
          <stop offset="100%" stopColor="#f17900"/>
        </radialGradient>
        <filter id={`md-rg-${s}`}>
          <feGaussianBlur stdDeviation={Math.max(1, sc(6))}/>
        </filter>
        <filter id={`md-glw-${s}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={Math.max(2, sc(18))} result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="96" fill={`url(#md-bg-${s})`}/>

      {/* Ambient glow */}
      <ellipse cx="256" cy="210" rx="200" ry="160" fill="#fa7d00" opacity="0.07"/>

      {/* Sunrise rays */}
      <line x1="256" y1="330" x2="66"  y2="200" stroke="#faa200" strokeWidth="10" strokeLinecap="round" opacity="0.20" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="452" y2="200" stroke="#ffa600" strokeWidth="10" strokeLinecap="round" opacity="0.20" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="120" y2="142" stroke="#f59f00" strokeWidth="12" strokeLinecap="round" opacity="0.45" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="392" y2="142" stroke="#f09c00" strokeWidth="12" strokeLinecap="round" opacity="0.45" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="176" y2="108" stroke="#ffb300" strokeWidth="14" strokeLinecap="round" opacity="0.70" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="336" y2="108" stroke="#ffb300" strokeWidth="14" strokeLinecap="round" opacity="0.70" filter={`url(#md-rg-${s})`}/>
      <line x1="256" y1="330" x2="256" y2="88"  stroke="#ffbb00" strokeWidth="17" strokeLinecap="round" opacity="0.90" filter={`url(#md-rg-${s})`}/>

      {/* Sun glow rings */}
      <circle cx="256" cy="128" r="58" fill="#f19d00" opacity="0.15" filter={`url(#md-glw-${s})`}/>
      <circle cx="256" cy="128" r="42" fill="#faaf00" opacity="0.25"/>

      {/* Sun */}
      <circle cx="256" cy="128" r="30" fill={`url(#md-sun-${s})`}/>
      <circle cx="245" cy="118" r="10" fill="white" opacity="0.35"/>

      {/* M letterform — depth shadow */}
      <path d="M 90 414 L 90 240 L 256 330 L 422 240 L 422 414"
            fill="none" stroke="#ff4400" strokeWidth="46"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.25"/>

      {/* M letterform — main */}
      <path d="M 90 414 L 90 240 L 256 330 L 422 240 L 422 414"
            fill="none" stroke="white" strokeWidth="44"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.96"/>

      {/* Horizon arc */}
      <path d="M 60 340 Q 256 306 452 340"
            fill="none" stroke="#ffa600" strokeWidth="3"
            strokeLinecap="round" opacity="0.30"/>
    </svg>
  );
}

export function LogoFull({ size = 36, variant = 'light', noTagline = false }) {
  // variant: 'light' (white text), 'dark' (dark text on light bg), 'gold' (gold text)
  const textMain   = variant === 'dark' ? '#1A1A2E' : 'white';
  const textSub    = variant === 'dark' ? '#f34100' : variant === 'gold' ? '#FFE08A' : 'rgba(255,255,255,0.95)';
  const textMorning= variant === 'dark' ? '#f04000' : variant === 'gold' ? '#FFBD3E' : '#FF8C42';
  const ruleOpacity= variant === 'dark' ? '0.4' : '0.55';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <div>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 700,
          fontSize: size * 0.42, letterSpacing: size * 0.12,
          color: textMorning, lineHeight: 1.0, textTransform: 'uppercase',
        }}>
          Morning
        </div>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontWeight: 800,
          fontSize: size * 0.65, letterSpacing: size * 0.02,
          color: textMain, lineHeight: 1.0, textTransform: 'uppercase',
          marginTop: 1,
        }}>
          Delight
        </div>
        {!noTagline && size >= 40 && (
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400, fontSize: Math.max(9, size * 0.22),
            letterSpacing: Math.max(1, size * 0.06),
            color: textSub, opacity: 0.65,
            textTransform: 'uppercase', marginTop: 3,
          }}>
            Fresh Food · Fast Delivery
          </div>
        )}
      </div>
    </div>
  );
}

export default LogoMark;
