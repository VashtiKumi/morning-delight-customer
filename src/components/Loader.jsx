import { useState, useEffect } from 'react';
import { LogoMark } from './Logo';
import { FOOD_IMGS } from '../utils/constants';
const SLIDES = [FOOD_IMGS.Hero1, FOOD_IMGS.Hero2, FOOD_IMGS.Hero3];
export default function Loader() {
  const [prog, setProg]   = useState(0);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const p = setInterval(() => setProg(v => Math.min(v + 1.8, 100)), 40);
    const s = setInterval(() => setSlide(v => (v+1)%SLIDES.length), 1000);
    return () => { clearInterval(p); clearInterval(s); };
  }, []);
  return (
    <div style={{ minHeight:'100vh', background:'#060641', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      {SLIDES.map((src,i) => <img key={i} src={src} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:slide===i?.2:0, transition:'opacity 1s ease', filter:'blur(1.5px)' }} />)}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgb(2, 2, 48),rgba(26,26,46,.94))' }} />
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:32, width:'100%', maxWidth:360 }}>
        {/* M Shield */}
        <div style={{ width:90, height:90, margin:'0 auto 24px', animation:'float 3s ease-in-out infinite', filter:'drop-shadow(0 8px 32px rgba(255,107,53,.5))' }}>
          <LogoMark size={90}/>
        </div>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:36, fontWeight:800, background:'linear-gradient(135deg,#FF6B35,#F7931E)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>
          Morning Delight
        </h1>
        <p style={{ color:'rgba(255, 255, 255, 0.9)', fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:44 }}>
          Campus Food Ordering
        </p>
        <div style={{ width:'100%', height:4, background:'rgba(255,255,255,.1)', borderRadius:4, overflow:'hidden', marginBottom:20 }}>
          <div style={{ height:'100%', width:`${prog}%`, background:'linear-gradient(90deg,#FF6B35,#F7931E)', borderRadius:4, transition:'width .04s' }} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          {SLIDES.map((_,i) => <div key={i} style={{ width:i===slide?20:6, height:6, borderRadius:3, background:i===slide?'#FF6B35':'rgba(255,255,255,.2)', transition:'all .4s' }} />)}
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}
