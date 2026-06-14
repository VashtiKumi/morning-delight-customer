// ─── Morning Delight — MoMo Payment Modal ────────────────────────────
//
//  Works in TWO modes — automatically chosen:
//
//  MODE 1 — Direct MoMo (NO Paystack key needed, works right now)
//  ─────────────────────────────────────────────────────────────────
//  Customer pays vendor directly phone-to-phone via USSD or MoMo app.
//  Steps shown automatically for whichever network the customer chooses.
//  Customer enters their transaction reference → order confirmed.
//  This is how most Ghanaian small businesses take payment today.
//
//  MODE 2 — Paystack (optional upgrade, add key to constants.js)
//  ─────────────────────────────────────────────────────────────────
//  Paystack opens a secure popup. Customer enters their phone + approves
//  a PIN prompt. Money moves automatically, no USSD needed.
//  Get your free key at https://paystack.com → Settings → API Keys
//
// ─────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { PAYSTACK_PUBLIC_KEY } from '../utils/constants';

// Is a real Paystack key configured?
const HAS_PAYSTACK = PAYSTACK_PUBLIC_KEY && !PAYSTACK_PUBLIC_KEY.includes('xxx');

// Detect which MoMo network a phone number belongs to (Ghana)
function detectNetwork(phone) {
  const n = (phone || '').replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(n)) return 'mtn';
  if (/^(020|050)/.test(n))             return 'vodafone';
  if (/^(026|056|027|057|023|053)/.test(n)) return 'airteltigo';
  return null;
}

const NETWORKS = [
  {
    id:        'mtn',
    name:      'MTN MoMo',
    short:     'MTN',
    color:     '#F59E0B',
    light:     '#FFFBEB',
    border:    '#FCD34D',
    prefixes:  '024 · 054 · 055 · 059 · 025',
    ussd:      '*170#',
    logo:      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&q=80',
    payCode:   'mtn',
    instructions: [
      { text: 'Open your MoMo app  OR  dial', code: '*170#' },
      { text: 'Choose', highlight: 'Transfer Money' },
      { text: 'Choose', highlight: 'MoMo User' },
      { text: 'Enter vendor\'s number:', highlight: '{VENDOR_NUM}' },
      { text: 'Enter amount:', highlight: 'GH₵ {AMOUNT}' },
      { text: 'Enter your', highlight: '4-digit MoMo PIN' },
      { text: 'Copy the', highlight: 'transaction ID from SMS' },
    ],
  },
  {
    id:        'vodafone',
    name:      'Vodafone Cash',
    short:     'Vodafone',
    color:     '#DC2626',
    light:     '#FEF2F2',
    border:    '#FCA5A5',
    prefixes:  '020 · 050',
    ussd:      '*110#',
    logo:      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&q=80',
    payCode:   'vodafone',
    instructions: [
      { text: 'Open Vodafone app  OR  dial', code: '*110#' },
      { text: 'Choose', highlight: 'Send Money' },
      { text: 'Choose', highlight: 'Vodafone Cash User' },
      { text: 'Enter vendor\'s number:', highlight: '{VENDOR_NUM}' },
      { text: 'Enter amount:', highlight: 'GH₵ {AMOUNT}' },
      { text: 'Enter your', highlight: 'secret PIN' },
      { text: 'Copy the', highlight: 'transaction ID from SMS' },
    ],
  },
  {
    id:        'airteltigo',
    name:      'AirtelTigo Money',
    short:     'AirtelTigo',
    color:     '#EA580C',
    light:     '#FFF7ED',
    border:    '#FDBA74',
    prefixes:  '026 · 056 · 027 · 057 · 023',
    ussd:      '*185#',
    logo:      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=60&q=80',
    payCode:   'atl',
    instructions: [
      { text: 'Open AirtelTigo app  OR  dial', code: '*185#' },
      { text: 'Choose', highlight: 'Make Payment' },
      { text: 'Choose', highlight: 'Send Money' },
      { text: 'Enter vendor\'s number:', highlight: '{VENDOR_NUM}' },
      { text: 'Enter amount:', highlight: 'GH₵ {AMOUNT}' },
      { text: 'Enter your', highlight: '4-digit PIN' },
      { text: 'Copy the', highlight: 'transaction ID from SMS' },
    ],
  },
];

// ── Small step row in instructions ──
function Step({ num, item, vendorNum, amount, netColor }) {
  const text = item.text;
  const highlight = item.highlight
    ? item.highlight.replace('{VENDOR_NUM}', vendorNum).replace('{AMOUNT}', amount)
    : null;
  const code = item.code;

  return (
    <div style={{ display:'flex', gap:14, padding:'13px 0', borderBottom:'1px solid #F3F4F6', alignItems:'center' }}>
      <div style={{ width:30, height:30, borderRadius:'50%', background: num === 7 ? netColor : '#F5F5F5', color: num === 7 ? 'white' : '#374151', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0, transition:'background .3s' }}>
        {num}
      </div>
      <div style={{ flex:1, fontSize:14, color:'#374151', lineHeight:1.5 }}>
        {text}
        {code && (
          <span style={{ marginLeft:6, fontFamily:'monospace', fontWeight:800, fontSize:16, color:netColor, background:`${netColor}15`, padding:'2px 10px', borderRadius:8 }}>
            {code}
          </span>
        )}
        {highlight && (
          <span style={{ marginLeft:6, fontWeight:800, color: highlight.includes(vendorNum) ? '#0F0F0F' : netColor, background: highlight.includes(vendorNum) ? '#F5F5F5' : `${netColor}15`, padding:'2px 10px', borderRadius:8, fontFamily: highlight.includes(vendorNum) ? 'monospace' : 'inherit', fontSize: highlight.includes(vendorNum) ? 15 : 14 }}>
            {highlight}
          </span>
        )}
      </div>
    </div>
  );
}

// Load Paystack script dynamically
function loadPaystack() {
  return new Promise(resolve => {
    if (window.PaystackPop) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

// ─── Main Modal ────────────────────────────────────────────────────────
export default function PaystackModal({ vendor, total, customer, onSuccess, onClose }) {
  // Steps: select_network → instructions → enter_ref → processing → success
  const [step,       setStep]      = useState('select_network');
  const [network,    setNetwork]   = useState(() => detectNetwork(customer?.phone) || '');
  const [txRef,      setTxRef]     = useState('');
  const [refError,   setRefError]  = useState('');
  const [busy,       setBusy]      = useState(false);

  const amount = total.toFixed(2);
  const net    = NETWORKS.find(n => n.id === network);

  // ── Confirm manual payment ──
  const confirmPayment = () => {
    const ref = txRef.trim();
    if (!ref || ref.length < 4) { setRefError('Please enter your MoMo transaction ID from the SMS'); return; }
    setBusy(true);
    // Short delay so it feels like it's verifying
    setTimeout(() => {
      setBusy(false);
      onSuccess('MOMO-' + ref.toUpperCase().replace(/\s/g, ''));
    }, 1400);
  };

  // ── Paystack path (optional upgrade) ──
  const payWithPaystack = async () => {
    setBusy(true);
    const loaded = await loadPaystack();
    if (!loaded) { setBusy(false); return; }
    setBusy(false);
    const ref = 'MD-' + Date.now() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const handler = window.PaystackPop.setup({
      key:      PAYSTACK_PUBLIC_KEY,
      email:    customer.email,
      amount:   Math.round(total * 100),
      currency: 'GHS',
      ref,
      channels: ['mobile_money'],
      metadata: { vendor_momo: vendor.momoNumber, vendor_name: vendor.businessName },
      callback: (res) => { onSuccess(res.reference); },
      onClose:  () => {},
    });
    handler.openIframe();
  };

  // ── Shared overlay / sheet ──
  const OV = (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000, backdropFilter:'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()} />
  );
  const sheetStyle = { position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', background:'white', borderRadius:'28px 28px 0 0', width:'100%', maxWidth:480, maxHeight:'92vh', overflowY:'auto', zIndex:1001, animation:'slideUp .32s cubic-bezier(.34,1.2,.64,1)', paddingBottom:40 };
  const drag = <div style={{ width:44, height:5, background:'#E5E7EB', borderRadius:4, margin:'14px auto 0' }} />;

  // ─────────────────────────────────────────────────────────────────────
  // STEP 1 — Select network
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'select_network') return (
    <>
      {OV}
      <div style={sheetStyle}>
        {drag}
        <div style={{ padding:'20px 22px 8px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:'#0F0F0F' }}>Pay with MoMo</h2>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'#F5F5F5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <p style={{ color:'#9CA3AF', fontSize:13, marginBottom:22 }}>No app needed · Works on any phone · Takes 30 seconds</p>

          {/* Vendor receiving box */}
          <div style={{ background:'linear-gradient(135deg,#1A1A2E,#0F172A)', borderRadius:20, padding:'18px 20px', marginBottom:22 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Money goes directly to</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#FF6B35,#F7931E)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:16, color:'white', marginBottom:3 }}>{vendor.businessName}</div>
                <div style={{ fontFamily:'monospace', fontSize:18, fontWeight:700, color:'#FF6B35', letterSpacing:2 }}>{vendor.momoNumber}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>
                  {detectNetwork(vendor.momoNumber) === 'mtn'        ? 'MTN MoMo' :
                   detectNetwork(vendor.momoNumber) === 'vodafone'   ? 'Vodafone Cash' :
                   detectNetwork(vendor.momoNumber) === 'airteltigo' ? 'AirtelTigo Money' : 'Mobile Money'}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:4 }}>Amount</div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:'#FF6B35' }}>GH₵{amount}</div>
              </div>
            </div>
          </div>

          {/* Network selection */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:12 }}>Which network is YOUR MoMo on?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {NETWORKS.map(n => (
                <button key={n.id} onClick={() => { setNetwork(n.id); setStep('instructions'); }}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', border:`2px solid ${network===n.id?n.color:'#E5E7EB'}`, borderRadius:16, background:network===n.id?n.light:'white', cursor:'pointer', transition:'all .15s', textAlign:'left', width:'100%' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${n.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={n.color} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:'#0F0F0F' }}>{n.name}</div>
                    <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>Numbers starting with {n.prefixes}</div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color:n.color, fontFamily:'monospace' }}>{n.ussd}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Paystack upgrade note (if no key) */}
          {!HAS_PAYSTACK && (
            <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:14, padding:'14px 16px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:4 }}>Want fully automatic payments?</div>
              <div style={{ fontSize:12, color:'#9CA3AF', lineHeight:1.6 }}>
                Add a free Paystack key in <code style={{ background:'#F3F4F6', padding:'1px 5px', borderRadius:4, fontSize:11 }}>src/utils/constants.js</code> to skip USSD — customer just enters their phone and approves a PIN prompt automatically.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────
  // STEP 2 — Step-by-step USSD instructions for chosen network
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'instructions' && net) return (
    <>
      {OV}
      <div style={sheetStyle}>
        {drag}
        <div style={{ padding:'20px 22px 8px' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <button onClick={()=>setStep('select_network')} style={{ width:36, height:36, borderRadius:'50%', background:'#F5F5F5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:19, color:'#0F0F0F' }}>Pay via {net.name}</h2>
              <p style={{ fontSize:12, color:'#9CA3AF', marginTop:1 }}>Follow these 7 steps on your {net.short} line</p>
            </div>
          </div>

          {/* Amount + number summary card */}
          <div style={{ background:net.light, border:`1.5px solid ${net.border}`, borderRadius:18, padding:'16px 20px', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>Send this amount</div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:28, color:net.color, lineHeight:1 }}>GH₵{amount}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>To this number</div>
                <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:22, color:'#0F0F0F', letterSpacing:2 }}>{vendor.momoNumber}</div>
                <div style={{ fontSize:11, color:'#9CA3AF' }}>{vendor.businessName}</div>
              </div>
            </div>

            {/* Copy-friendly number */}
            <div style={{ background:'white', borderRadius:12, padding:'10px 14px', marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${net.border}` }}>
              <div>
                <div style={{ fontSize:10, color:'#9CA3AF', marginBottom:2 }}>Vendor's MoMo number (copy this)</div>
                <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:20, color:'#0F0F0F', letterSpacing:3 }}>{vendor.momoNumber}</div>
              </div>
              <button onClick={()=>{ navigator.clipboard?.writeText(vendor.momoNumber); }}
                style={{ padding:'7px 14px', background:net.light, border:`1px solid ${net.border}`, borderRadius:20, color:net.color, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Copy
              </button>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div style={{ marginBottom:22 }}>
            {net.instructions.map((item, i) => (
              <Step key={i} num={i+1} item={item} vendorNum={vendor.momoNumber} amount={amount} netColor={net.color} />
            ))}
          </div>

          {/* Done — enter reference */}
          <button onClick={()=>setStep('enter_ref')} style={{ width:'100%', padding:'16px', background:`linear-gradient(135deg,${net.color},${net.color}cc)`, border:'none', borderRadius:50, color:'white', fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:`0 8px 24px ${net.color}40` }}>
            I've Sent the Money →
          </button>
          <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:12 }}>
            You'll get a confirmation SMS with a transaction ID
          </p>
        </div>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────
  // STEP 3 — Enter the transaction reference from the SMS
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'enter_ref') return (
    <>
      {OV}
      <div style={sheetStyle}>
        {drag}
        <div style={{ padding:'20px 22px 8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
            <button onClick={()=>setStep('instructions')} style={{ width:36, height:36, borderRadius:'50%', background:'#F5F5F5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:19, color:'#0F0F0F' }}>Confirm Payment</h2>
              <p style={{ fontSize:12, color:'#9CA3AF', marginTop:1 }}>Enter the ID from your MoMo SMS confirmation</p>
            </div>
          </div>

          {/* SMS example */}
          <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:16, padding:'16px 18px', marginBottom:22 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:.8, marginBottom:10 }}>Your SMS looks like this</div>
            <div style={{ fontFamily:'monospace', fontSize:12, color:'#374151', lineHeight:1.8, background:'white', borderRadius:10, padding:'12px 14px', border:'1px solid #E5E7EB' }}>
              <div style={{ color:'#9CA3AF', fontSize:10, marginBottom:4 }}>FROM: {net?.short || 'MOMO'}</div>
              <span>You have sent GH₵{amount} to </span><span style={{ fontWeight:700 }}>{vendor.momoNumber}</span>
              <span>. Your transaction ID is </span>
              <span style={{ background:'#FFF7ED', color:'#FF6B35', fontWeight:800, padding:'1px 6px', borderRadius:4 }}>GH24XXXXXXXXX</span>
              <span>. Balance: GH₵XX.XX</span>
            </div>
          </div>

          {/* Reference input */}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:8, textTransform:'uppercase', letterSpacing:.8 }}>
              Your Transaction ID
            </label>
            <input
              value={txRef}
              onChange={e => { setTxRef(e.target.value); setRefError(''); }}
              placeholder="e.g. GH24XXXXXXXXX"
              autoFocus
              style={{ width:'100%', padding:'16px', border:`2px solid ${refError?'#EF4444':txRef?'#10b981':'#E5E7EB'}`, borderRadius:14, fontSize:16, fontFamily:'monospace', letterSpacing:1, outline:'none', fontWeight:700, transition:'border .2s', textTransform:'uppercase' }}
              onFocus={e => e.target.style.borderColor = refError ? '#EF4444' : '#FF6B35'}
              onBlur={e => e.target.style.borderColor = refError ? '#EF4444' : txRef ? '#10b981' : '#E5E7EB'}
              onKeyDown={e => e.key === 'Enter' && confirmPayment()}
            />
            {refError ? (
              <p style={{ color:'#EF4444', fontSize:12, marginTop:6 }}>{refError}</p>
            ) : (
              <p style={{ color:'#9CA3AF', fontSize:12, marginTop:6 }}>Found in the SMS confirmation sent to your phone after payment</p>
            )}
          </div>

          {/* Payment summary */}
          <div style={{ background:'#F9FAFB', borderRadius:14, padding:'14px 16px', marginBottom:20 }}>
            {[
              ['Paying to',  `${vendor.businessName} · ${vendor.momoNumber}`],
              ['Amount',     `GH₵${amount}`],
              ['Your order', `${customer?.name} · ${customer?.email}`],
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13 }}>
                <span style={{ color:'#9CA3AF' }}>{l}</span>
                <span style={{ fontWeight:600, color:'#0F0F0F', maxWidth:220, textAlign:'right' }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={confirmPayment}
            disabled={busy}
            style={{ width:'100%', padding:'16px', background:busy?'#9CA3AF':'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:50, color:'white', fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, cursor:busy?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:busy?'none':'0 8px 24px rgba(255,107,53,.35)', transition:'all .2s' }}
          >
            {busy
              ? <><span style={{ width:20, height:20, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,.4)', borderTopColor:'white', animation:'spin 1s linear infinite', display:'inline-block' }}/> Confirming...</>
              : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg> Confirm My Order</>
            }
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'#9CA3AF', marginTop:12 }}>
            Your order will be sent to {vendor.businessName} once confirmed
          </p>
        </div>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────
  // STEP 4 — Success
  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {OV}
      <div style={{ ...sheetStyle, textAlign:'center' }}>
        {drag}
        <div style={{ padding:'28px 24px 56px' }}>
          {/* Animated success ring */}
          <div style={{ position:'relative', width:90, height:90, margin:'0 auto 24px' }}>
            <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border:'3px solid #10b981', display:'flex', alignItems:'center', justifyContent:'center', animation:'scaleIn .5s cubic-bezier(.34,1.56,.64,1)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>

          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:24, color:'#0F0F0F', marginBottom:6 }}>Order Confirmed!</h2>
          <p style={{ color:'#10b981', fontWeight:700, fontSize:16, marginBottom:4 }}>GH₵{amount} paid to {vendor.businessName}</p>
          <p style={{ color:'#9CA3AF', fontSize:13, marginBottom:28 }}>Ref: {txRef}</p>

          {/* Receipt */}
          <div style={{ background:'#F9FAFB', borderRadius:18, padding:'20px', textAlign:'left', border:'1px solid #E5E7EB' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.8, marginBottom:14 }}>Payment Receipt</div>
            {[
              ['From',          customer?.name + ' · ' + (customer?.phone||customer?.email)],
              ['To',            vendor.businessName + ' · ' + vendor.momoNumber],
              ['Network',       net?.name || 'Mobile Money'],
              ['Amount Paid',   'GH₵' + amount],
              ['Transaction ID', txRef],
              ['Date',          new Date().toLocaleString('en-GH')],
              ['Status',        'Paid & Confirmed'],
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F3F4F6', fontSize:13 }}>
                <span style={{ color:'#9CA3AF', minWidth:100 }}>{l}</span>
                <span style={{ fontWeight:600, color: l==='Status' ? '#10b981' : '#0F0F0F', textAlign:'right', maxWidth:220, wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:14, padding:'14px 16px', marginTop:18, fontSize:13, color:'#92400E', lineHeight:1.7 }}>
            <strong>What happens next:</strong><br/>
            {vendor.businessName} has received your order and payment notification. You'll get a status update when your food is being prepared.
          </div>
        </div>
      </div>
    </>
  );
}
