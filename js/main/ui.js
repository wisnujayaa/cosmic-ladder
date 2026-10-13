/* main/ui.js: HUD, info panel, camera helpers, fold + view offset, language apply.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
/* ================= HUD ================= */
function fmtLen(m){const u=U().units;if(m<1e9)return nf(m/1e3,m<1e5?1:0)+' '+u.km;if(m<.05*LY){const a=m/AU;return nf(a,a<10?2:0)+' '+u.au}const l=m/LY;if(l<1e6)return nf(l,l<10?1:0)+' '+u.ly;if(l<1e9)return nf(l/1e6,l<1e7?1:0)+' '+u.mly;return nf(l/1e9,1)+' '+u.gly}
function fmtDur(t){const u=U().units,y=t/31557600;if(t<60)return nf(t,t<10?1:0)+' '+u.s;if(t<3600)return nf(t/60,1)+' '+u.min;if(t<86400)return nf(t/3600,1)+' '+u.h;if(y<1)return nf(t/86400,1)+' '+u.d;if(y<1e3)return nf(y,1)+' '+u.y;if(y<1e6)return nf(y/1e3,1)+' '+u.ky;if(y<1e9)return nf(y/1e6,1)+' '+u.my;return nf(y/1e9,2)+' '+u.gy}
const ladder=$('ladder'),focusRow=$('focus');
const FOC=['Matahari','Bumi','Mars','Jupiter','Saturnus','Uranus','Neptunus','Pluto'];
const LV=CT.LEVELS;
let cur=null;
function buildLadder(){ladder.textContent='';LV.forEach(Lv=>{const b=document.createElement('button');b.type='button';const e=document.createElement('span');e.className='e';e.textContent=`10^${Math.round(Lv.f)}`;const t=document.createElement('span');t.textContent=Lv[lang].name;b.append(e,t);
  b.onclick=()=>{stopTour();setSky(false,true);if(Lv.f<12&&focus!=='Bumi')switchFocus('Bumi');recenter();target=Lv.f;banner(LV.indexOf(Lv))};ladder.appendChild(b)});cur=null}
function buildFocus(){focusRow.textContent='';FOC.forEach(n=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=nm(n);b.dataset.n=n;b.onclick=()=>{setSky(false,true);switchFocus(n,FOCUS_S[n]);const L=bodies[n];if(L&&L.ml&&MK.OFFICIAL[n])toast(MK.UI3[lang].moonsCount(nm(n),L.ml.length,MK.OFFICIAL[n]))};focusRow.appendChild(b)});updateFocusButtons()}
function updateFocusButtons(){[...focusRow.children].forEach(b=>b.classList.toggle('on',b.dataset.n===focus))}
function buildChips(){const box=$('chips');box.textContent='';for(const[k,c]of Object.entries(C2.CATS)){const b=document.createElement('button');b.type='button';b.className='chip'+(CAT_ON[k]?'':' off');b.setAttribute('aria-pressed',String(!!CAT_ON[k]));const i=document.createElement('i');i.style.background=c.c;const t=document.createElement('span');t.textContent=c[lang];b.append(i,t);
  b.onclick=()=>{CAT_ON[k]=!CAT_ON[k];try{localStorage.setItem('tk3d-cats',JSON.stringify(CAT_ON))}catch(e){}applyCats();buildChips()};box.appendChild(b)}}
function levelIndex(){let best=0,dd=1e9;LV.forEach((Lv,i)=>{const q=Math.abs(Lv.f-s);if(q<dd){dd=q;best=i}});return best}
function rate(){return realtime?1:autoRate(s)*Math.pow(10,mulLog)}
function updateHud(){const u=U();
  const span=Math.pow(10,s)*Math.max(W,H)/Math.min(W,H);$('exp').innerHTML=`10<sup>${s.toFixed(1)}</sup><small>${u.meter}</small>`;
  {const x=span*(.01/1.2742e7);$('marble').textContent=EX.UI[lang].marble(x<1?nf(x*100,x<.1?2:1)+' cm':x<1000?nf(x,x<10?1:0)+' m':fmtLen(x))}
  const t=span/299792458;$('span').innerHTML=`${u.fov} ≈ ${fmtLen(span)}`+(t<31557600?` <span class="lt">· ${u.light} ${fmtDur(t)}</span>`:'');
  const yFromNow=(d-nowD())/365.25;let ds;
  if(Math.abs(yFromNow)<8000)ds=new Date(A.J2000+d*864e5).toLocaleString(u.locale,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  else ds=(yFromNow>0?'+':'−')+fmtDur(Math.abs(yFromNow)*31557600)+' '+(yFromNow>0?u.fromNow:u.ago);
  const y=2000+d/365.25;$('date').innerHTML=ds+((y<1800||y>2050)&&s<15.6?`<span class="warn">${u.warn}</span>`:'');
  $('rate').textContent=paused?u.paused:(realtime?u.realRate:u.rate(fmtDur(rate())));
  const i=levelIndex();const bk=(focus!=='Bumi'&&CT.BODY[focus]&&s<t0eff(focus)+.6)?focus:null;const key=(bk||i)+lang;
  const mf=(MOONMAP[focus]&&s<t0eff(focus)+.6)?focus:null;
  if(mf&&cur!=='moon:'+mf+lang){cur='moon:'+mf+lang;const I=getInfo(mf);$('eyebrow').textContent=u.camFocus(I.title);$('lvTitle').textContent=I.title;$('lvDesc').textContent=I.desc;$('lvMove').textContent=I.facts.slice(0,3).map(f=>f[0]+': '+f[1]).join(' · ');$('lvFact').textContent=(I.x&&I.x[0])||'';[...ladder.children].forEach(b=>b.classList.remove('on'))}
  else if(!mf&&key!==cur){cur=key;const Lv=bk?CT.BODY[bk][lang]:LV[i][lang];$('eyebrow').textContent=bk?u.camFocus(nm(bk)):u.level(i+1,LV.length,Math.round(LV[i].f));$('lvTitle').textContent=Lv.name;$('lvDesc').textContent=Lv.desc;$('lvMove').textContent=Lv.move;$('lvFact').textContent=Lv.fact;
    [...ladder.children].forEach((b,j)=>b.classList.toggle('on',!bk&&j===i))}
  $('gmode').hidden=!(s>19.6&&s<23);$('sky').hidden=!(s>16.6&&s<19.9)||!SKY;$('sky').classList.toggle('on',skyOn);
  const z=$('zoom');if(document.activeElement!==z)z.value=s.toFixed(2);updV9()}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2800)}

/* ================= info panel ================= */
const info=$('info'),card=$('card'),side=document.querySelector('.side'),hud=document.querySelector('.hud');
let infoId=null;
const ARROW='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h7M6 2.5 9.5 6 6 9.5" fill="none" stroke="#fff" stroke-width="1.6"/></svg>';
function getInfo(id){const L=lang,u2=U2();
  if(id==='__credits')return{kind:u2.creditsKind,title:u2.creditsTitle,facts:[],desc:'',x:C2.CREDITS[L],refs:[]};
  if(id.startsWith('con:')){const a=id.slice(4);const c=CONS.find(x=>x.a===a)||{n:a,e:''};const F=C2.CON_FAMOUS[a];const f=F?F[L]:null;
    const W='https://en.wikipedia.org/wiki/';const wt={Ori:'Orion_(constellation)',Cru:'Crux',UMa:'Ursa_Major',Sco:'Scorpius',Cas:'Cassiopeia_(constellation)',Cyg:'Cygnus_(constellation)',Tau:'Taurus_(constellation)',Sgr:'Sagittarius_(constellation)'}[a];
    return{kind:u2.constellation,title:f?f.t:c.n,facts:[[L==='id'?'Nama resmi':'Official name',c.n],[L==='id'?'Arti (Inggris)':'Meaning',c.e||'—'],[L==='id'?'Singkatan IAU':'IAU abbreviation',a]],desc:f?f.d:C2.CON_GENERIC[L](c.n,c.e),x:f?f.x:[],
      refs:[wt?['Wikipedia',W+wt]:['Wikipedia',`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(c.n+' constellation')}`]],fly:true}}
  const base=CT.INFO[id],nw=C2.NEW[id],ex=C2.EXTRA[id]||{};
  if(!base&&!nw&&EX.INFO[id]){const e=EX.INFO[id][L];const sb=EX.SB.find(x=>x[0]===id);const kk=sb?sb[1]:(CRAFTPOS[id]||id==='Voyager 2'||id==='New Horizons'?'craft':'orbit');return{kind:EX.KIND[kk][L],title:nm(id),facts:e.f,desc:e.d,x:e.x,refs:EX.INFO[id].refs,fly:true}}
  if(!base&&!nw&&MOONMAP[id]){const r=MK.info(MOONMAP[id],L,nm);r.fly=true;return r}
  if(!base&&!nw)return null;const e=base?base[L]:nw[L];
  const title=L==='en'?(CT.TITLE_EN[id]||nm(id)):(CT.TITLE_ID[id]||id);
  const img=(nw&&nw.img)||ex.img,cap=(nw&&nw.cap)||ex.cap;const x=(nw?nw.x[L]:(ex.x?ex.x[L]:[]))||[];
  return{kind:e.k,title,facts:e.f,desc:e.d,x,img,cap,refs:(nw&&nw.refs)||ex.refs||[],fly:!!(isPlanet(id)||focusObj(id)||(nw&&nw.p.surf)||(base&&base.focus))}}
const GLOBE={};
function globe(src,done){if(GLOBE[src])return done(GLOBE[src]);const img=new Image();img.onload=()=>{const tw=img.width,th=img.height;const c=document.createElement('canvas');c.width=tw;c.height=th;const g=c.getContext('2d');g.drawImage(img,0,0);const T=g.getImageData(0,0,tw,th).data;
  const N=420;const o=document.createElement('canvas');o.width=o.height=N;const og=o.getContext('2d');const out=og.createImageData(N,N);const Dd=out.data;const Lv=[-.55,.35,.76];const ll=Math.hypot(...Lv);const lx=Lv[0]/ll,ly=Lv[1]/ll,lz=Lv[2]/ll;const tilt=.22,ct=Math.cos(tilt),st=Math.sin(tilt);const isSun=src.includes('sun');
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5)/N*2-1,v=1-(y+.5)/N*2;const r2=u*u+v*v;const i=4*(y*N+x);if(r2>1){Dd[i+3]=0;continue}const z=Math.sqrt(1-r2);
    const yy=v*ct+z*st,zz=-v*st+z*ct;const lat=Math.asin(Math.max(-1,Math.min(1,yy)));const lon=Math.atan2(u,zz)+.6;const tx=Math.floor((((lon/(2*Math.PI)+.5)%1)+1)%1*tw);let ty=Math.floor((.5-lat/Math.PI)*th);ty=Math.min(th-1,Math.max(0,ty));const j=4*(ty*tw+tx);
    const nd=Math.max(0,u*lx+v*ly+z*lz);const sh=isSun?1:(.05+1.05*Math.pow(nd,.85));const limb=isSun?(.55+.45*Math.pow(z,.5)):1;const edge=Math.min(1,(1-Math.sqrt(r2))*N*.5);
    Dd[i]=Math.min(255,T[j]*sh*limb);Dd[i+1]=Math.min(255,T[j+1]*sh*limb);Dd[i+2]=Math.min(255,T[j+2]*sh*limb);Dd[i+3]=255*edge}
  og.putImageData(out,0,0);GLOBE[src]=o.toDataURL('image/png');done(GLOBE[src])};img.src=src}
const CAP_EN=[['Foto:','Photo:'],['olah:','processing:'],['berbasis data','based on'],['berbasis citra','based on'],['Peta permukaan','Surface map'],['Seluruh Nebula Elang','The whole Eagle Nebula'],['Sebagian LMC','Part of the LMC'],['lapisan awan','cloud layer'],['Badai heksagonal kutub utara','North polar hexagon storm'],['Bintik Merah Raksasa','Great Red Spot'],['Bintik Gelap Raksasa','Great Dark Spot'],['Buzz Aldrin di Bulan','Buzz Aldrin on the Moon'],[' dan ',' and ']];
const capL=c=>{if(lang!=='en'||!c)return c||'';let r=c;for(const[a,b]of CAP_EN)r=r.split(a).join(b);return r};
function openInfo(id){const I=getInfo(id);if(!I)return;infoId=id;progObj(id);const u2=U2();
  $('inKind').textContent=I.kind;$('inTitle').textContent=I.title;
  if(I.img){const hero=$('inHero');const isTex=I.img.startsWith('tex/');hero.classList.toggle('globe',isTex);$('inImg').alt=I.title;$('inCap').textContent=capL(I.cap);hero.hidden=false;
    if(isTex){$('inImg').removeAttribute('src');const want=id;globe(I.img,u=>{if(infoId===want)$('inImg').src=u})}else $('inImg').src=I.img}else $('inHero').hidden=true;
  const dl=$('inFacts');dl.textContent='';for(const[a,b]of I.facts){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;dl.append(dt,dd)}dl.hidden=!I.facts.length;
  $('inDesc').textContent=I.desc;$('inDesc').hidden=!I.desc;
  $('inXT').textContent=id==='__credits'?u2.creditsKind:u2.facts;const xl=$('inX');xl.textContent='';for(const t of I.x){const li=document.createElement('li');li.textContent=t;xl.appendChild(li)}$('inXWrap').hidden=!I.x.length;
  $('inRT').textContent=u2.refs;const rf=$('inRefs');rf.textContent='';for(const[t,u]of I.refs){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';const sp=document.createElement('span');sp.textContent=t;const ar=document.createElement('span');ar.className='arrow';ar.innerHTML=ARROW;a.append(sp,ar);rf.appendChild(a)}$('inRWrap').hidden=!I.refs.length;
  $('inFly').textContent=u2.fly;$('inCtl').hidden=!I.fly;$('inListen').hidden=id==='__credits';if(listenOn&&infoId!==id)narStop();setListen(false);renderExtra(id);if(id!=='__credits')setHash(id);info.hidden=false;card.hidden=true;info.scrollTop=0;stopTour()}
function closeInfo(){if(listenOn)narStop();info.hidden=true;card.hidden=false;infoId=null;clearInterval(liveTimer);$('inExtra').textContent='';setHash(null)}
$('inClose').onclick=closeInfo;$('credBtn').onclick=()=>openInfo('__credits');
function flyTo(id){
  if(['ISS','Hubble','GEO','GPS'].includes(id)){setSky(false,true);switchFocus('Bumi',{ISS:7.25,Hubble:7.25,GEO:8.15,GPS:7.95}[id]);return}
  if(id.startsWith('con:')){const c=CONS.find(x=>x.a===id.slice(4));if(!c)return;if(s<16.8||s>19.6){recenter();target=18}setSky(true);const v=new THREE.Vector3(...eqT(c.cd)).applyQuaternion(root.quaternion).multiplyScalar(-1).normalize();camera.position.copy(v.multiplyScalar(D));return}
  const nw=C2.NEW[id];
  if(nw&&nw.p.surf){const body=nw.p.surf[0]==='Bulan'?'Bumi':nw.p.surf[0];setSky(false,true);const st=SURF.find(x=>x.id===id);const r=nw.p.surf[0]==='Bulan'?1737.4:PHYS[body].r;
    const fb=nw.p.surf[0]==='Bulan'?'Bulan':body;switchFocus(fb,Math.log10(r*KM*3.1));const w=surfWorld(st);if(w)camera.position.copy(w.n.clone().multiplyScalar(D));return}
  const base=CT.INFO[id];const tgtId=(isPlanet(id)||id==='Bulan')?id:(base&&base.focus&&!focusObj(id)?base.focus:id);setSky(false,true);
  const fo=focusObj(tgtId);switchFocus(tgtId,isPlanet(tgtId)?FOCUS_S[tgtId]:fo.view)}
$('inFly').onclick=()=>{if(infoId){flyTo(infoId);if(window.innerWidth<=900)closeInfo()}};
function hitAt(x,y){for(const pass of[1,0])for(let i=HITS.length-1;i>=0;i--){const h=HITS[i];if(h[5]===pass&&x>=h[0]&&x<=h[0]+h[2]&&y>=h[1]&&y<=h[1]+h[3])return h[4]}return null}

/* ================= camera: pan, zoom-to-cursor, snap, focus ================= */
const ppmAt=sv=>H/(2*D*Math.tan(camera.fov/2*DEG)*Math.pow(10,sv));
function camAxes(){const qi=root.quaternion.clone().invert();return[new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).applyQuaternion(qi),new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion).applyQuaternion(qi)]}
function panBy(dx,dy){if(skyOn)return;const[R,Up]=camAxes();const m=1/ppmAt(s);pan[0]-=(R.x*dx-Up.x*dy)*m;pan[1]-=(R.y*dx-Up.y*dy)*m;pan[2]-=(R.z*dx-Up.z*dy)*m;panDecay=false;anchor=null}
function switchFocus(n,jumpS){if(jumpS!==undefined&&(n!==focus||Math.abs(jumpS-s)>.5))MK.whoosh(.8,jumpS<s);const old=computeTarget();focus=n;holdT0=n==='Matahari'?null:s+.05;updateFocusButtons();const nb=baseTarget();pan=sub(old,nb);panDecay=true;anchor=null;if(jumpS!==undefined){stopTour();target=jumpS}}
function recenter(){panDecay=true;anchor=null}
let fovT=50;
function setSky(on,quiet){if(on===skyOn)return;skyOn=on;if(!quiet)MK.whoosh(.6,on);if(!on)fovT=50;if(!quiet)toast(on?U2().skyOn:U2().skyOff);$('sky').classList.toggle('on',on)}

/* ================= fold + view offset ================= */
function setFold(f){card.classList.toggle('folded',f);$('fold').innerHTML=(f?U().show:U().hide)+` <span class="arrow" style="width:20px;height:20px;transform:rotate(${f?-90:90}deg)">${ARROW}</span>`;$('fold').setAttribute('aria-expanded',String(!f));try{localStorage.setItem('tk3d-fold',f?'1':'0')}catch(e){}}
let foldPref=null;try{foldPref=localStorage.getItem('tk3d-fold')}catch(e){}
$('fold').onclick=()=>setFold(!card.classList.contains('folded'));
function layoutOffset(dt){const c=(info.hidden?card:info).getBoundingClientRect(),sd=side.getBoundingClientRect(),hd=hud.getBoundingClientRect();let tx=0,ty=0;const cine=document.body.classList.contains('cine');
  if(cine){}else if(W>900){tx=(c.right+12+(W-(sideC?30:sd.width)))/2-W/2}else{const top=Math.max(hd.bottom,sideC?0:sd.bottom)+8;const bot=touring?H-150:c.top;ty=(top+bot)/2-H/2}
  if(skyOn){tx*=.3;ty*=.3}
  const f=Math.min(1,dt*5);offX+=(tx-offX)*f;offY+=(ty-offY)*f;camera.setViewOffset(W,H,-offX,-offY,W,H)}

/* ================= language apply ================= */
const coarse=matchMedia('(pointer: coarse)').matches;
let touring=false;
function applyLang(){const u=U(),u2=U2();document.documentElement.lang=lang;
  document.querySelectorAll('[data-k]').forEach(el=>{el.textContent=u[el.dataset.k]});document.querySelectorAll('[data-k2]').forEach(el=>{el.textContent=u2[el.dataset.k2]});
  document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  $('help').textContent=coarse?u.helpTouch:u.help;$('play').textContent=paused?'▶ '+u.resume:'❙❙ '+u.pause;
  $('prev').textContent='← '+u.zin;$('next').textContent=u.zout+' →';$('gmode').textContent=galMode?u.gmodeBack:u.gmode;$('inClose').innerHTML=`${u.close} <span class="arrow" style="width:20px;height:20px;background:#2b2e36">✕</span>`;
  $('snd').textContent=(MK.SND.on?'♪ ':'× ')+MK.UI3[lang].sound;$('snd').classList.toggle('on',MK.SND.on);$('snd').setAttribute('aria-pressed',String(MK.SND.on));
  {const u3=EX.UI[lang];$('q').placeholder=u3.search;$('narr').textContent=(NARR?'◉ ':'○ ')+u3.narr;$('narr').classList.toggle('on',NARR);$('evBtn').textContent=u3.events;document.querySelectorAll('[data-k4]').forEach(el=>{el.textContent=u3[el.dataset.k4]});SIDX=null}
  cv.setAttribute('aria-label',u.ariaSky);setFold(card.classList.contains('folded'));buildLadder();buildFocus();buildChips();applyV9();if(infoId){if(infoId==='__events')openEvents();else if(infoId==='__hub')openHub(null,true);else openInfo(infoId)}}
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem('tk3d-lang',lang)}catch(e){}applyLang()});

