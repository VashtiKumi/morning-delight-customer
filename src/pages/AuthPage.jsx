// ─── Customer Auth Page — Mobile-first modern design ─────────────────
// Colors: White (#FFFFFF), Emerald Green (#2D6A4F), Gold (#F4C430),
//         Light Gray (#F8F9FA)
import { useState, useEffect } from 'react';
import DB from '../utils/db';
import { enc } from '../utils/constants';
import { LogoMark } from '../components/Logo';
import { sendOTPEmail } from '../utils/emailService';

const GREEN     = '#2D6A4F';
const GREEN_D   = '#1B4332';
const GREEN_L   = '#40916C';
const GOLD      = '#F4C430';
const GOLD_D    = '#D4A017';
const WHITE     = '#FFFFFF';
const LGRAY     = '#F8F9FA';
const BORDER    = '#E2E8F0';
const TEXT      = '#0F172A';
const MUTED     = '#64748B';

// ── Responsive hook ────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
}

// ── Input field — two styles: mobile (dark-glass) and desktop (light) ─
function InputField({ label, type='text', placeholder, value, onChange, icon, autoFocus, onKeyDown, dark=false, extra }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;

  const bg     = dark ? 'rgba(255,255,255,0.08)'  : LGRAY;
  const border = dark
    ? `1.5px solid ${focused ? 'rgba(244,196,48,0.6)' : 'rgba(255,255,255,0.12)'}`
    : `1.5px solid ${focused ? GREEN : BORDER}`;
  const color  = dark ? WHITE : TEXT;
  const placeholderColor = dark ? 'rgba(255,255,255,0.35)' : '#9CA3AF';

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontWeight:600,
          fontSize:13, color: dark ? 'rgba(255,255,255,0.7)' : MUTED, marginBottom:8 }}>
          {label}
        </label>
      )}
      <div style={{ position:'relative' }}>
        {icon && (
          <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
            color: dark ? 'rgba(255,255,255,0.4)' : '#9CA3AF', display:'flex', alignItems:'center', zIndex:1 }}>
            {icon}
          </div>
        )}
        <input type={inputType} placeholder={placeholder} value={value}
          onChange={onChange} onKeyDown={onKeyDown} autoFocus={autoFocus}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:'100%', padding: icon ? '14px 44px 14px 44px' : '14px 44px 14px 16px',
            background:bg, border, borderRadius:14, fontSize:15,
            fontFamily:'DM Sans,sans-serif', color, outline:'none',
            transition:'border .2s, box-shadow .2s',
            boxShadow: focused ? (dark ? '0 0 0 3px rgba(244,196,48,0.1)' : `0 0 0 3px rgba(45,106,79,0.1)`) : 'none' }}
        />
        {isPw && (
          <button onClick={() => setShowPw(!showPw)} type="button"
            style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', padding:4,
              color: dark ? 'rgba(255,255,255,0.4)' : '#9CA3AF', display:'flex', alignItems:'center' }}>
            {showPw
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
        {!isPw && icon && <div style={{ width:18, position:'absolute', right:14, top:'50%', transform:'translateY(-50%)' }}/>}
      </div>
      {extra}
    </div>
  );
}

// ── Primary button ─────────────────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled, green=true, style={} }) {
  const bg = green
    ? `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_L} 100%)`
    : `linear-gradient(135deg, ${GOLD_D} 0%, ${GOLD} 100%)`;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'16px', background: disabled ? '#CBD5E1' : bg,
      border:'none', borderRadius:50, color:WHITE,
      fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      boxShadow: disabled ? 'none' : `0 8px 24px rgba(45,106,79,0.35)`,
      transition:'all .2s', letterSpacing:.3, ...style }}>
      {children}
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────
const EmailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 8.74 19.79 19.79 0 0 1 1.61 2.18 2 2 0 0 1 3.6.01h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const PinIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const UserIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// ═══════════════════════════════════════════════════════════════════════
// Mobile screens — full-screen dark-green hero + white card
// ═══════════════════════════════════════════════════════════════════════

function MobileHero({ title, subtitle, logoSize=72 }) {
  return (
    <div style={{ position:'relative', background:`linear-gradient(160deg, ${GREEN_D} 0%, ${GREEN} 60%, ${GREEN_L} 100%)`,
      paddingTop:'max(56px,env(safe-area-inset-top))', paddingBottom:40,
      display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
      paddingLeft:24, paddingRight:24, overflow:'hidden' }}>
      {/* Gold glow */}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
        width:280, height:180, borderRadius:'50%',
        background:`radial-gradient(ellipse, rgba(244,196,48,0.18) 0%, transparent 70%)`,
        pointerEvents:'none' }} />
      {/* Logo */}
      <div style={{ marginBottom:20, position:'relative', zIndex:1 }}>
        <LogoMark size={logoSize} />
      </div>
      {title && (
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:28,
          color:WHITE, margin:0, lineHeight:1.2, position:'relative', zIndex:1 }}>
          {title}
        </h1>
      )}
      {subtitle && (
        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:15,
          color:'rgba(255,255,255,0.7)', margin:'8px 0 0', position:'relative', zIndex:1 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MobileCard({ children }) {
  return (
    <div style={{ background:WHITE, borderRadius:'28px 28px 0 0',
      padding:'32px 24px 40px', flex:1, overflowY:'auto' }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main AuthPage
// ═══════════════════════════════════════════════════════════════════════
export default function AuthPage({ onLogin, showToast, hasAccounts }) {
  const isMobile = useIsMobile();
  const [screen,   setScreen]   = useState(hasAccounts ? 'login' : 'onboard');
  const [regStep,  setRegStep]  = useState(1);
  const [sending,  setSending]  = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [emailSent,setEmailSent] = useState(false);

  const [form, setForm] = useState({ name:'', phone:'', email:'', location:'Accra', password:'', confirm:'' });
  const [login, setLogin] = useState({ email:'', password:'' });
  const [otp,   setOtp]   = useState(['','','','','','']);

  const upd  = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const updL = (k,v) => setLogin(f => ({ ...f, [k]:v }));

  const handleLogin = () => {
    const e = login.email.trim().toLowerCase();
    if (!e || !login.password) { showToast('Please fill in all fields','error'); return; }
    const c = DB.findCustomerByEmail(e);
    if (c && c.password === enc(login.password)) {
      if (!c.verified) { showToast('Please verify your email first','error'); return; }
      DB.saveSession('cust',{id:c.id,email:c.email}); onLogin(c,'customer'); return;
    }
    const v = DB.findVendorByEmail(e);
    if (v && v.password === enc(login.password)) { DB.saveSession('vendor',{id:v.id,email:v.email}); onLogin(v,'vendor'); return; }
    const admin = DB.getAdmin();
    if (admin?.email===e && admin.password===enc(login.password)) { DB.saveSession('admin',{email:admin.email}); onLogin(admin,'admin'); return; }
    showToast('Incorrect email or password','error');
  };

  const handleSendOTP = async () => {
    if (!form.name||!form.phone||!form.email||!form.password) { showToast('Please fill all fields','error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters','error'); return; }
    if (form.password !== form.confirm) { showToast('Passwords do not match','error'); return; }
    if (DB.findCustomerByEmail(form.email)) { showToast('Email already registered','error'); return; }
    setSending(true);
    const code = DB.genCode(); DB.setVC(form.email, code);
    const result = await sendOTPEmail({ toName:form.name, toEmail:form.email, otpCode:code });
    setSending(false);
    if (result.sent) { setEmailSent(true); setDemoCode(''); } else { setDemoCode(result.code); }
    setRegStep(2);
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length < 6) { showToast('Enter the 6-digit code','error'); return; }
    if (!DB.verifyVC(form.email, entered)) { showToast('Invalid or expired code','error'); return; }
    const customer = { id:DB.genId(), name:form.name, email:form.email.toLowerCase(),
      phone:form.phone, location:form.location, password:enc(form.password),
      verified:true, joinDate:new Date().toISOString(), points:0, credits:0, totalOrders:0, role:'customer' };
    DB.saveCustomer(customer); DB.saveSession('cust',{id:customer.id,email:customer.email});
    onLogin(customer,'customer'); showToast(`Welcome, ${customer.name.split(' ')[0]}!`,'success');
  };

  const handleOtpChange = (i,v) => {
    const n=[...otp]; n[i]=v.replace(/\D/g,'').slice(-1); setOtp(n);
    if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };
  const handleOtpKey = (i,e) => {
    if (e.key==='Backspace' && !otp[i] && i>0) document.getElementById(`otp-${i-1}`)?.focus();
    if (e.key==='Enter' && otp.join('').length===6) handleVerify();
  };
  const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    setOtp([...p.padEnd(6,'').split('')]); e.preventDefault();
  };

  const handleResend = async () => {
    setSending(true);
    const code = DB.genCode(); DB.setVC(form.email, code);
    const result = await sendOTPEmail({ toName:form.name, toEmail:form.email, otpCode:code });
    setSending(false);
    if (result.sent) { showToast('New code sent!','success'); setEmailSent(true); setDemoCode(''); }
    else { setDemoCode(result.code); showToast('Demo code shown below','info'); }
  };

  // ═══ ONBOARD ════════════════════════════════════════════════════════
  if (screen === 'onboard') {
    if (isMobile) return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
        background:`linear-gradient(160deg,${GREEN_D},${GREEN})` }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'60px 24px 32px', textAlign:'center' }}>
          <div style={{ marginBottom:24 }}><LogoMark size={80}/></div>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:30, color:WHITE,
            marginBottom:12, lineHeight:1.2 }}>Welcome to<br/>Morning Delight</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15, lineHeight:1.7, maxWidth:280, marginBottom:40 }}>
            Fresh campus food — breakfast, lunch and more, delivered fast
          </p>
          {/* Feature cards */}
          <div style={{ display:'flex', gap:12, width:'100%', maxWidth:320, marginBottom:40 }}>
            {[['🍳','Fresh Food'],['⚡','Fast Delivery']].map(([icon,label])=>(
              <div key={label} style={{ flex:1, background:'rgba(255,255,255,0.1)',
                backdropFilter:'blur(8px)', borderRadius:18, padding:'18px 12px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                border:'1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize:28 }}>{icon}</span>
                <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:WHITE }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'0 24px 48px', display:'flex', flexDirection:'column', gap:12 }}>
          <PrimaryBtn onClick={()=>setScreen('register')} green={false} style={{
            background:`linear-gradient(135deg,${GOLD_D},${GOLD})`,
            boxShadow:`0 8px 24px rgba(244,196,48,0.35)`, color:'#1a1a1a' }}>
            Get Started →
          </PrimaryBtn>
          <button onClick={()=>setScreen('login')} style={{ padding:'14px', background:'rgba(255,255,255,0.1)',
            border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:50, color:WHITE,
            fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, cursor:'pointer' }}>
            Sign In
          </button>
        </div>
      </div>
    );
    // Desktop onboard
    return (
      <div style={{ minHeight:'100vh', background:WHITE, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'40px 32px', textAlign:'center' }}>
        <LogoMark size={80}/>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:24, color:TEXT, marginTop:20, marginBottom:10 }}>
          Welcome to Morning Delight
        </h1>
        <p style={{ color:MUTED, fontSize:15, lineHeight:1.65, maxWidth:300, marginBottom:40 }}>
          Fresh campus food — breakfast, lunch and more, fast delivery across campus
        </p>
        <div style={{ display:'flex', gap:16, width:'100%', maxWidth:340, marginBottom:40 }}>
          {[['🍳','Fresh Food'],['⚡','Fast Delivery']].map(([icon,label])=>(
            <div key={label} style={{ flex:1, background:`${GREEN}10`, borderRadius:16, padding:'20px 12px',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10, border:`1.5px solid ${GREEN}25` }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <span style={{ fontSize:14, fontWeight:600, color:TEXT }}>{label}</span>
            </div>
          ))}
        </div>
        <PrimaryBtn onClick={()=>setScreen('register')} style={{ maxWidth:340 }}>Get Started →</PrimaryBtn>
        <p style={{ color:MUTED, fontSize:14, marginTop:20 }}>
          Have an account?{' '}<span onClick={()=>setScreen('login')} style={{ color:GREEN, fontWeight:700, cursor:'pointer' }}>Sign In</span>
        </p>
      </div>
    );
  }

  // ═══ OTP VERIFY ═════════════════════════════════════════════════════
  if (screen === 'register' && regStep === 2) {
    const Content = () => (
      <>
        <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:isMobile?24:22,
          color: isMobile?WHITE:TEXT, textAlign:'center', marginBottom:8 }}>Verify Email</h2>
        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, textAlign:'center',
          color: isMobile?'rgba(255,255,255,0.65)':MUTED, marginBottom:6 }}>
          Enter the 6-digit code sent to
        </p>
        <p style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, textAlign:'center',
          color: isMobile?GOLD:GREEN, marginBottom:20 }}>{form.email}</p>
        {emailSent && <div style={{ background:`${GREEN}12`, border:`1px solid ${GREEN}30`, borderRadius:12, padding:'10px 16px', marginBottom:16, fontSize:13, color:GREEN, textAlign:'center' }}>Code sent to your email inbox ✓</div>}
        {demoCode && <div style={{ background:`${GOLD}20`, border:`1px solid ${GOLD}50`, borderRadius:12, padding:'12px 16px', marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:12, color:GOLD_D, marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>Demo code (EmailJS not configured)</div>
          <div style={{ fontFamily:'DM Sans,monospace', fontWeight:800, fontSize:24, letterSpacing:8, color:TEXT }}>{demoCode}</div>
        </div>}
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:24, maxWidth:320, margin:'0 auto 24px' }} onPaste={handleOtpPaste}>
          {otp.map((v,i)=>(
            <input
              key={i}
              id={`otp-${i}`}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={v}
              placeholder="0"
              autoFocus={i===0}
              onChange={e=>handleOtpChange(i,e.target.value)}
              onKeyDown={e=>handleOtpKey(i,e)}
              style={{
                width: 'min(44px, calc((100vw - 96px) / 6))',
                height: 52,
                border: `2.5px solid ${v ? (isMobile ? GOLD : GREEN) : isMobile ? 'rgba(255,255,255,0.35)' : '#CBD5E1'}`,
                borderRadius:14,
                textAlign:'center',
                fontSize:22,
                fontWeight:800,
                color: isMobile ? (v ? GOLD : 'rgba(255,255,255,0.4)') : (v ? TEXT : '#CBD5E1'),
                background: isMobile ? 'rgba(255,255,255,0.1)' : WHITE,
                outline:'none',
                transition:'border-color .15s, color .15s',
                boxShadow: v ? (isMobile ? `0 0 0 3px rgba(244,196,48,0.2)` : `0 0 0 3px rgba(45,106,79,0.15)`) : 'none',
                fontFamily:'DM Sans,monospace',
                caretColor: isMobile ? GOLD : GREEN,
              }}
            />
          ))}
        </div>
        <PrimaryBtn onClick={handleVerify} style={isMobile?{boxShadow:`0 8px 24px rgba(244,196,48,0.3)`}:{}}>
          Verify &amp; Continue
        </PrimaryBtn>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, marginTop:16,
          color: isMobile?'rgba(255,255,255,0.5)':MUTED }}>
          Didn't receive code?{' '}
          <span onClick={sending?undefined:handleResend}
            style={{ color: isMobile?GOLD:GREEN, fontWeight:700, cursor:'pointer', opacity:sending?.5:1 }}>
            {sending?'Sending...':'Resend'}
          </span>
        </p>
        <button onClick={()=>setRegStep(1)} style={{ display:'block', margin:'12px auto 0', background:'none', border:'none',
          color: isMobile?'rgba(255,255,255,0.45)':MUTED, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
          ← Back
        </button>
      </>
    );
    if (isMobile) return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${GREEN_D},${GREEN})` }}>
        <MobileHero title="Verify Email" logoSize={56}/>
        <MobileCard><Content/></MobileCard>
      </div>
    );
    return (
      <div style={{ minHeight:'100vh', background:LGRAY, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'32px 28px', textAlign:'center' }}>
        <LogoMark size={64}/>
        <div style={{ background:WHITE, borderRadius:24, padding:36, maxWidth:400, width:'100%', marginTop:24, boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
          <Content/>
        </div>
      </div>
    );
  }

  // ═══ REGISTER STEP 1 ════════════════════════════════════════════════
  if (screen === 'register' && regStep === 1) {
    const FormContent = ({dark}) => (
      <>
        <InputField label="Full Name" placeholder="Kwame Mensah" value={form.name} onChange={e=>upd('name',e.target.value)} icon={<UserIcon/>} dark={dark} autoFocus/>
        <InputField label="Phone Number" type="tel" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={e=>upd('phone',e.target.value)} icon={<PhoneIcon/>} dark={dark}/>
        <InputField label="Email Address" type="email" placeholder="kwame@gmail.com" value={form.email} onChange={e=>upd('email',e.target.value)} icon={<EmailIcon/>} dark={dark}/>
        <InputField label="Location" placeholder="Accra" value={form.location} onChange={e=>upd('location',e.target.value)} icon={<PinIcon/>} dark={dark}/>
        <InputField label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={e=>upd('password',e.target.value)} icon={<LockIcon/>} dark={dark}/>
        <InputField label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e=>upd('confirm',e.target.value)} icon={<LockIcon/>} dark={dark}/>
        <PrimaryBtn onClick={handleSendOTP} disabled={sending} style={{ marginTop:8, ...(dark?{background:`linear-gradient(135deg,${GOLD_D},${GOLD})`, color:'#1a1a1a', boxShadow:`0 8px 24px rgba(244,196,48,0.35)`}:{}) }}>
          {sending ? 'Sending code...' : 'Continue →'}
        </PrimaryBtn>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, marginTop:16,
          color: dark?'rgba(255,255,255,0.5)':MUTED }}>
          Have an account?{' '}
          <span onClick={()=>setScreen('login')} style={{ color: dark?GOLD:GREEN, fontWeight:700, cursor:'pointer' }}>Sign In</span>
        </p>
      </>
    );
    if (isMobile) return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${GREEN_D},${GREEN})` }}>
        <MobileHero title="Personal Details" subtitle="Tell us about yourself" logoSize={56}/>
        <MobileCard>
          <FormContent dark={false}/>
        </MobileCard>
      </div>
    );
    return (
      <div style={{ minHeight:'100vh', background:LGRAY, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ background:WHITE, borderRadius:24, padding:40, maxWidth:460, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
            <LogoMark size={56}/>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:TEXT, marginTop:16, marginBottom:4 }}>Personal Details</h2>
            <p style={{ color:MUTED, fontSize:14 }}>Tell us about yourself</p>
          </div>
          <FormContent dark={false}/>
        </div>
      </div>
    );
  }

  // ═══ LOGIN ══════════════════════════════════════════════════════════
  if (isMobile) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${GREEN_D},${GREEN})` }}>
      <MobileHero title="Welcome Back" subtitle="Sign in to continue" logoSize={68}/>
      <MobileCard>
        <InputField label="Email Address" type="email" placeholder="you@example.com"
          value={login.email} onChange={e=>updL('email',e.target.value)} icon={<EmailIcon/>} autoFocus/>
        <InputField label="Password" type="password" placeholder="Enter your password"
          value={login.password} onChange={e=>updL('password',e.target.value)}
          icon={<LockIcon/>} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
          extra={<div style={{ textAlign:'right', marginTop:6 }}>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:GREEN, fontWeight:600, cursor:'pointer' }}>
              Forgot password?
            </span>
          </div>}/>
        <div style={{ height:8 }}/>
        <PrimaryBtn onClick={handleLogin}>
          Sign in
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </PrimaryBtn>
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
          <div style={{ flex:1, height:1, background:BORDER }}/>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:MUTED }}>or continue with</span>
          <div style={{ flex:1, height:1, background:BORDER }}/>
        </div>
        <div style={{ background:LGRAY, border:`1px solid ${BORDER}`, borderRadius:14, padding:'12px 16px', fontSize:12, color:MUTED, lineHeight:1.7, fontFamily:'DM Sans,sans-serif', marginBottom:20 }}>
          Demo: any vendor → ama@demo.com / demo123<br/>
          Admin → admin@morningdelight.com / Admin@2024
        </div>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED }}>
          Don't have an account?{' '}
          <span onClick={()=>{setScreen('register');setRegStep(1);}} style={{ color:GREEN, fontWeight:700, cursor:'pointer' }}>Sign up</span>
        </p>
      </MobileCard>
    </div>
  );

  // Desktop login
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:WHITE }}>
      {/* Left panel */}
      <div style={{ background:`linear-gradient(160deg,${GREEN_D},${GREEN})`, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:60, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:`rgba(244,196,48,0.12)` }}/>
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:340 }}>
          <div style={{ marginBottom:28 }}><LogoMark size={88}/></div>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:28, color:WHITE, marginBottom:12 }}>Morning Delight</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', lineHeight:1.7, fontSize:15, marginBottom:36 }}>
            Order fresh campus food — breakfast, lunch and more, delivered fast across campus.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['🍳','Fresh Food'],['⚡','Fast Delivery'],['📍','GPS Tracking'],['⭐','Rewards']].map(([i,l])=>(
              <div key={l} style={{ background:'rgba(255,255,255,0.1)', borderRadius:14, padding:'14px 10px',
                textAlign:'center', border:'1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{i}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, color:WHITE }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:TEXT, marginBottom:6 }}>Welcome Back</h2>
          <p style={{ color:MUTED, fontSize:14, marginBottom:32 }}>Sign in to your account</p>
          <InputField label="Email Address" type="email" placeholder="you@example.com"
            value={login.email} onChange={e=>updL('email',e.target.value)} icon={<EmailIcon/>} autoFocus/>
          <InputField label="Password" type="password" placeholder="Enter your password"
            value={login.password} onChange={e=>updL('password',e.target.value)}
            icon={<LockIcon/>} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
          <div style={{ textAlign:'right', marginBottom:24 }}>
            <span style={{ color:GREEN, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' }}>Forgot password?</span>
          </div>
          <PrimaryBtn onClick={handleLogin}>
            Sign in
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </PrimaryBtn>
          <div style={{ background:LGRAY, border:`1px solid ${BORDER}`, borderRadius:14, padding:'12px 16px', marginTop:20, fontSize:12, color:MUTED, lineHeight:1.8 }}>
            Demo: ama@demo.com / demo123 · Admin: admin@morningdelight.com / Admin@2024
          </div>
          <p style={{ textAlign:'center', fontSize:14, color:MUTED, marginTop:20, fontFamily:'DM Sans,sans-serif' }}>
            New here?{' '}
            <span onClick={()=>{setScreen('register');setRegStep(1);}} style={{ color:GREEN, fontWeight:700, cursor:'pointer' }}>Create Account</span>
          </p>
        </div>
      </div>
    </div>
  );
}
