import React, { useState, useMemo, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

/* Single-file prototype app - focused on calibration -> results -> regional builder
   Veg-only sample recipes included. Uses public images and Web Speech API for audio.
*/

const QUESTION_BANK = [
  { tasteKey: 'Spice', common: { brand: 'Kurkure Masala Munch', question: 'How spicy do you find Kurkure Masala Munch?', image: 'https://upload.wikimedia.org/wikipedia/en/5/5b/Kurkure_logo.png' }, South: { brand: 'Gongura Pickle', question: 'How spicy is Gongura Pickle for you?', image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/04/gongura-pickle.jpg' } },
  { tasteKey: 'Tang', common: { brand: "Lay's Magic Masala", question: "How tangy is Lay's Magic Masala for you?", image: 'https://m.media-amazon.com/images/I/71ULmVncyQL._AC_UL480_FMwebp_QL65_.jpg' }, North:{ brand:'Aam Papad', question:'How tangy is Aam Papad for you?', image:'https://www.jiomart.com/images/product/original/490003823/aam-papad.jpg'} },
  { tasteKey: 'Salt', common: { brand: "Lay's Classic Salted", question: "Rate the saltiness of Lay's Classic Salted.", image: 'https://m.media-amazon.com/images/I/81hM6tA77tL._AC_UL480_FMwebp_QL65_.jpg' } },
  { tasteKey: 'Oil', common: { brand: "Haldiram's Sev", question: "Do you find Haldiram's Sev oily?", image: 'https://m.media-amazon.com/images/I/71xDK7pReeL._AC_UL480_FMwebp_QL65_.jpg' } },
  { tasteKey: 'Sweet', common: { brand: 'Parle-G Biscuit', question: 'How sweet is Parle-G biscuit for you?', image: 'https://m.media-amazon.com/images/I/61tB2jKDZBL._AC_UL480_FMwebp_QL65_.jpg' }, West:{ brand:'Chundo (Sweet Mango Pickle)', question:'How sweet is Chundo for you?', image:'https://www.cookingcarnival.com/wp-content/uploads/2022/06/Chhundo-1.jpg' } }
];

const OPTIONS = [
  { emoji: '🥵', label: 'Too Strong', value: 0.6 },
  { emoji: '😋', label: 'Just Right', value: 1.0 },
  { emoji: '😐', label: 'Too Mild', value: 1.4 }
];

const CAL_COLORS = { Spice:'#FF5733', Tang:'#FF8C00', Salt:'#1E90FF', Oil:'#2ECC71', Sweet:'#9B59B6' };

const SAMPLE_RECIPES = [
  { id:'andhra-mango', title:'Andhra Avakaya (Raw Mango Pickle)', region:'South', type:'Pickle', main:'Raw Mango', img:'https://images.unsplash.com/photo-1617191517691-1f8a8b7f6b3b?auto=format&fit=crop&w=800&q=60', procedure:['Wash and dry raw mangoes. Cut into cubes.','Mix salt and turmeric and keep aside.','Roast red chillies and grind to powder.','Heat oil and cool.','Combine and store in jar.'] },
  { id:'sambar-powder', title:'Homestyle Sambar Powder', region:'South', type:'Powder', main:'Spice Mix', img:'https://images.unsplash.com/photo-1621392278833-6e1b6fa0cc0a?auto=format&fit=crop&w=800&q=60', procedure:['Dry roast spices.','Grind to powder.','Store airtight.'] },
  { id:'punjabi-lemon', title:'Punjabi Lemon Pickle', region:'North', type:'Pickle', main:'Lemon', img:'https://images.unsplash.com/photo-1505576391880-7f2f63d7f3b9?auto=format&fit=crop&w=800&q=60', procedure:['Wash lemons and cut into wedges.','Mix with salt and spices.','Pack in jar with oil.'] },
  { id:'garam-masala', title:'Garam Masala Powder', region:'North', type:'Powder', main:'Spices', img:'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=60', procedure:['Dry roast whole spices.','Grind to powder.'] },
  { id:'chundo', title:'Gujarati Chundo (Sweet Mango Pickle)', region:'West', type:'Pickle', main:'Grated Mango', img:'https://images.unsplash.com/photo-1604908177522-2f8f4a5d1b78?auto=format&fit=crop&w=800&q=60', procedure:['Grate mango.','Prepare jaggery syrup.','Mix and store.'] }
];

function Header({onNav}) {
  return <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h1>Indian Pickles & Masala — Prototype</h1><div><button className="btn" onClick={()=>onNav('landing')}>Home</button> <button className="btn" onClick={()=>onNav('calibrate')}>Calibrate</button> <button className="btn" onClick={()=>onNav('builder')}>Builder</button></div></div>;
}

function Landing({onStart}) {
  return <div className="card container" style={{marginTop:16}}><h2>Welcome — Veg Pickles & Masala</h2><p className="small">Calibrate your taste using popular snacks and regional picks, then customize recipes to your palate.</p><div style={{marginTop:12}}><button className="btn" onClick={onStart}>Start Calibration</button></div></div>;
}

function CalibrationFlow({onComplete, onCancel}) {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState(null);
  const [answers, setAnswers] = useState({});
  const questions = useMemo(()=> QUESTION_BANK.map(q=>({ tasteKey:q.tasteKey, item: (region && q[region])? q[region] : q.common })),[region]);

  const total = questions.length;
  function startRegion(r){ setRegion(r); setStep(1); }
  function selectOption(val){ const cur = questions[step-1]; const updated = {...answers, [cur.tasteKey]: val}; setAnswers(updated); if(step < total) setStep(step+1); else setStep(total+1); }

  if(step===0) return <div className="card container"><h3>Choose Region</h3><p className="small">We'll include regional items in calibration.</p><div style={{display:'flex',gap:8,marginTop:8}}>{['North','South','West','East','Central'].map(r=><button key={r} className="btn" onClick={()=>startRegion(r)}>{r}</button>)}</div><div style={{marginTop:8}}><button onClick={onCancel}>Cancel</button></div></div>;

  if(step>=1 && step<=total){
    const q = questions[step-1];
    return <div className="card container"><h3>{q.item.brand}</h3><p className="small">{q.item.question}</p>{q.item.image && <img src={q.item.image} alt="" style={{height:160,objectFit:'contain',display:'block',margin:'12px auto'}} />}<div style={{display:'flex',justifyContent:'center',gap:16}}>{OPTIONS.map(o=><button key={o.label} onClick={()=>selectOption(o.value)} style={{fontSize:28}}>{o.emoji}<div style={{fontSize:12}}>{o.label}</div></button>)}</div><div style={{marginTop:12,display:'flex',justifyContent:'space-between'}}><button onClick={()=> setStep(step>1? step-1:0)}>Back</button><button onClick={()=> setStep(total+1)}>Skip to Summary</button></div></div>;
  }

  // results
  const display = {Spice: answers['Spice']||1, Tang: answers['Tang']||1, Salt: answers['Salt']||1, Oil: answers['Oil']||1, Sweet: answers['Sweet']||1};
  const radarData = Object.keys(display).map(k=>({taste:k, value: display[k]}));

  return <div className="card container"><h3>Your Taste Profile — Summary</h3><div style={{height:300}}><ResponsiveContainer><RadarChart data={radarData}><PolarGrid /><PolarAngleAxis dataKey="taste" /><PolarRadiusAxis domain={[0.5,1.5]} />{radarData.map(d=><Radar key={d.taste} dataKey="value" name={d.taste} stroke={CAL_COLORS[d.taste]} fill={CAL_COLORS[d.taste]} fillOpacity={0.25} />)}</RadarChart></ResponsiveContainer></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{Object.keys(display).map(k=><div key={k} className="card small" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:12,height:12,background:CAL_COLORS[k],borderRadius:4}}></div><div>{k}</div></div><div>{display[k].toFixed(2)}</div></div>)}</div><div style={{marginTop:12,display:'flex',gap:8}}><button className="btn" onClick={()=> onComplete({spiceTolerance:display.Spice,tangTolerance:display.Tang,saltTolerance:display.Salt,oilTolerance:display.Oil,sweetTolerance:display.Sweet})}>Save & Continue</button><button onClick={()=>{setStep(0); setRegion(null); setAnswers({});}}>Redo</button></div></div>;
}

function RecipeBuilder({tasteProfile, onBack}) {
  const profile = tasteProfile || {spiceTolerance:1,tangTolerance:1,saltTolerance:1,oilTolerance:1,sweetTolerance:1};
  const [regionFilter, setRegionFilter] = useState(null);
  const recipes = useMemo(()=> SAMPLE_RECIPES.filter(r=> regionFilter? r.region===regionFilter : true), [regionFilter]);

  useEffect(()=>{ if(tasteProfile && tasteProfile.region) setRegionFilter(tasteProfile.region); }, [tasteProfile]);

  const [selected, setSelected] = useState(recipes[0] || null);
  const [batch, setBatch] = useState(500);
  const [spice, setSpice] = useState(3);
  const [tang, setTang] = useState(3);
  const [salt, setSalt] = useState(3);
  const [oil, setOil] = useState(3);
  const [sweet, setSweet] = useState(1);

  function map(level,type){ const base = {chilli:[4,8,16,24,32], acid:[5,12,25,40,60], salt:[7.5,12,18,24,30], oil:[30,60,120,180,240], sweet:[0,8,16,30,45]}; return base[type][level-1]||0; }
  const proportions = useMemo(()=>{ const factor = batch/500; return { chilli_g: +(map(spice,'chilli')*factor*profile.spiceTolerance).toFixed(1), acid_ml: +(map(tang,'acid')*factor*profile.tangTolerance).toFixed(1), salt_g: +(map(salt,'salt')*factor*profile.saltTolerance).toFixed(1), oil_ml: +(map(oil,'oil')*factor*profile.oilTolerance).toFixed(1), sweet_g: +(map(sweet,'sweet')*factor*profile.sweetTolerance).toFixed(1)} }, [spice,tang,salt,oil,sweet,batch,profile]);

  function playAudio(){ if(!('speechSynthesis' in window)){ alert('TTS not supported'); return; } const text = (selected? selected.procedure.join('. '): 'Follow the steps'); const u = new SpeechSynthesisUtterance(text); u.lang='en-IN'; u.rate=0.95; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }

  return <div className="card container"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><button onClick={onBack}>← Back</button><h3>Recipe Builder</h3><div></div></div><div style={{display:'flex',gap:12}}><div style={{flex:1}}><h4>Recipes {regionFilter? `(${regionFilter})`:''}</h4><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{SAMPLE_RECIPES.filter(r=> regionFilter? r.region===regionFilter : true).map(r=><div key={r.id} className="card small" style={{cursor:'pointer'}} onClick={()=>setSelected(r)}><strong>{r.title}</strong><div className="small">{r.region} • {r.type}</div></div>)}</div><div style={{marginTop:12}}><label className="small">Region filter: <select value={regionFilter||''} onChange={e=> setRegionFilter(e.target.value || null)}><option value="">All</option><option>South</option><option>North</option><option>West</option></select></label></div></div><div style={{width:360}}><h4>Builder</h4><div className="small">Selected: {selected? selected.title: '—'}</div><div style={{marginTop:8}}><label className="small">Batch size (g)<input className="range" type="number" value={batch} onChange={e=> setBatch(Number(e.target.value))} /></label></div><div style={{marginTop:8}}><label className="small">Spice <input className="range" type="range" min={1} max={5} value={spice} onChange={e=> setSpice(Number(e.target.value))} /></label></div><div className="small">Chilli: {proportions.chilli_g} g</div><div className="small">Acid: {proportions.acid_ml} ml</div><div className="small">Salt: {proportions.salt_g} g</div><div className="small">Oil: {proportions.oil_ml} ml</div><div className="small">Sweet: {proportions.sweet_g} g</div><div style={{marginTop:8}}><button className="btn" onClick={playAudio}>Play Audio Instructions</button></div><div style={{marginTop:8}}><button onClick={()=> alert('DIY Kit mock: ingredients compiled — implement checkout in production')}>Build DIY Kit</button></div></div></div></div>;
}

export default function App(){
  const [route, setRoute] = useState('landing');
  const [profile, setProfile] = useState(null);
  return <div className="container"><Header onNav={(r)=> setRoute(r)} />{route==='landing' && <Landing onStart={()=> setRoute('calibrate')} />}{route==='calibrate' && <CalibrationFlow onComplete={(p)=>{ setProfile(p); setRoute('builder'); }} onCancel={()=> setRoute('landing')} />}{route==='builder' && <RecipeBuilder tasteProfile={profile} onBack={()=> setRoute('landing')} />}</div>;
}
