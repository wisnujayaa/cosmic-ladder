/* main/input.js: Pointer/keyboard input, info extras, events timeline, search.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
/* ================= input ================= */
const clamp=v=>Math.min(S_MAX,Math.max(S_MIN,v));
function stopTour(){if(!touring)return;touring=false;tourPaused=false;NAR.saved=null;narStop();tourHold=false;tourBtns()}
function zoomAt(dz,cx,cy){stopTour();
  if(skyOn){fovT=Math.min(75,Math.max(6,fovT*Math.pow(10,dz*.9)));return}
  target=clamp(target+dz);if(cx===undefined){anchor=null;return}
  if(dz<0){if(panDecay){anchor=null;return}let best=null,bd=26;for(const[n,x,y]of BODYPX){const q=Math.hypot(x-cx,y-cy);if(q<bd){bd=q;best=n}}
    if(best&&best!==focus){const fo=isPlanet(best)?null:focusObj(best);if(!isPlanet(best)&&!fo){anchor=null;return}switchFocus(best);if(fo&&target<fo.minS)target=fo.minS;toast(U().tSnap(nm(best)));return}
    const fp=BODYPX.find(b=>b[0]===focus);if(fp&&Math.hypot(fp[1]-cx,fp[2]-cy)<70){anchor=null;return}}
  if(!panDecay)anchor={vx:cx-(W/2+offX),vy:cy-(H/2+offY)}}
cv.addEventListener('wheel',e=>{e.preventDefault();const dy=e.deltaMode===1?e.deltaY*16:e.deltaY;zoomAt(dy*.0016,e.clientX,e.clientY)},{passive:false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
const ptrs=new Map();let pinch=null,mid=null,panning=null,down=null;
cv.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,[e.clientX,e.clientY]);down={x:e.clientX,y:e.clientY,t:performance.now()};
  if(e.pointerType==='mouse'&&(e.button===2||e.shiftKey)){panning=[e.clientX,e.clientY];stopTour()}
  if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];down=null}});
cv.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId)){hoverId=hitAt(e.clientX,e.clientY);cv.style.cursor=hoverId?'pointer':'';return}
  ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(panning){panBy(e.clientX-panning[0],e.clientY-panning[1]);panning=[e.clientX,e.clientY];return}
  if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()];const dd=Math.hypot(a[0]-b[0],a[1]-b[1]);const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];panBy(m[0]-mid[0],m[1]-mid[1]);zoomAt((pinch-dd)*.01,m[0],m[1]);pinch=dd;mid=m}});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2){pinch=null;mid=null}if(ptrs.size===0)panning=null;
  if(down&&e.type==='pointerup'){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.t<450){const id=hitAt(e.clientX,e.clientY);if(id){if(mMode)pickMeasure(id);else openInfo(id)}}}down=null};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key;
  if(k==='Escape'&&!info.hidden){closeInfo();return}
  if(k==='ArrowDown'||k==='-'||k==='PageDown'){e.preventDefault();zoomAt(.25)}else if(k==='ArrowUp'||k==='+'||k==='='||k==='PageUp'){e.preventDefault();zoomAt(-.25)}
  else if(k===' '){e.preventDefault();if(touring)tourPause(!tourPaused);else $('play').click()}
  else if(k.length===1&&'wasdWASD'.includes(k)){const m={w:[0,40],s:[0,-40],a:[40,0],d:[-40,0]}[k.toLowerCase()];panBy(m[0],m[1])}
  else if(k==='c'||k==='C')recenter()});
$('zoom').addEventListener('input',e=>{stopTour();anchor=null;target=+e.target.value});
$('next').onclick=()=>{stopTour();anchor=null;setSky(false,true);const i=LV.findIndex(Lv=>Lv.f>s+.05);target=i<0?S_MAX:LV[i].f};
$('prev').onclick=()=>{stopTour();anchor=null;setSky(false,true);let i=-1;LV.forEach((Lv,j)=>{if(Lv.f<s-.05)i=j});target=i<0?S_MIN:LV[i].f};
$('recenter').onclick=recenter;
$('sky').onclick=()=>{if(!skyOn){recenter()}setSky(!skyOn)};
$('play').onclick=()=>{paused=!paused;applyLang()};
$('today').onclick=()=>{d=nowD();toast(U().tToday)};
$('real').onclick=()=>{realtime=!realtime;$('real').classList.toggle('on',realtime)};
$('mul').addEventListener('input',e=>{mulLog=+e.target.value;if(realtime){realtime=false;$('real').classList.remove('on')}});
$('gmode').onclick=()=>{galMode=galMode?0:1;galTd=0;$('gmode').classList.toggle('on',!!galMode);$('gmode').textContent=galMode?U().gmodeBack:U().gmode;toast(galMode?U().tDiff:U().tPat)};
$('tour').onclick=()=>{if(touring){stopTour();return}MK.sndInit();MK.whoosh(1,false);touring=true;setSky(false,true);if(focus!=='Bumi')switchFocus('Bumi');recenter();if(s>26.9){s=target=7.0}$('tour').textContent=U().tourPause};

/* ================= info extras: size, weight, live distance ================= */
let liveTimer=null;
function radiusOf(id){if(id==='Matahari')return PHYS.Matahari.r;if(id==='Bulan')return 1737.4;if(PL.includes(id))return PHYS[id].r;const m=MOONMAP[id];if(m)return(m.r>2.01||m.pl==='Pluto'||m.pl==='Uranus'||m.pl==='Neptunus')?m.r:null;const sb=EX.SB.find(x=>x[0]===id);if(sb&&sb[8])return sb[8]/2;return null}
function liveDistM(id){if(id==='Bumi'||id==='GEO'||id==='GPS'||id==='ISS'||id==='Hubble')return null;let p=null;if(id==='JWST')p=ESAT.jwst();else if(POS[id])p=POS[id];else if(MOONMAP[id])p=moonWorld(MOONMAP[id]);else if(SBPOS[id])p=SBPOS[id];else if(CRAFTPOS[id])p=CRAFTPOS[id];if(!p)return null;return len(sub(p,POS.Bumi))}
let wkg=60;try{const v=+localStorage.getItem('tk3d-wkg');if(v>0)wkg=v}catch(e){}
function renderExtra(id){const box=$('inExtra');box.textContent='';clearInterval(liveTimer);const u3=EX.UI[lang];
  const r=radiusOf(id);
  if(r&&id!=='Bumi'){const sec=document.createElement('div');sec.className='xsec';const h=document.createElement('p');h.className='sub';h.textContent=u3.size;sec.appendChild(h);
    const re=6371,mx=Math.max(re,r),k=44/mx,rE=Math.max(1.2,re*k),rO=Math.max(1.2,r*k);const ratio=r/re;const rs=ratio>=10?nf(ratio,0):ratio>=1?nf(ratio,1):nf(ratio,ratio<.01?4:2);
    const NS='http://www.w3.org/2000/svg';const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 400 120');svg.setAttribute('class','sizesvg');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${u3.size}: ${rs}× ${u3.earth}`);
    const cx1=40+44,cx2=200+60;const el=(tag,at)=>{const e=document.createElementNS(NS,tag);for(const a in at)e.setAttribute(a,at[a]);svg.appendChild(e);return e};
    el('line',{x1:20,y1:100,x2:380,y2:100,class:'base'});
    el('circle',{cx:cx1,cy:100-rE,r:rE,class:'cE'});el('circle',{cx:cx2,cy:100-rO,r:rO,class:'cO'});
    const t1=el('text',{x:cx1,y:116,'text-anchor':'middle'});t1.textContent=u3.earth;const t2=el('text',{x:cx2,y:116,'text-anchor':'middle'});t2.textContent=`${$('inTitle').textContent} · ${rs}×`;
    sec.appendChild(svg);box.appendChild(sec)}
  const g=EX.GRAV[id];
  if(g){const sec=document.createElement('div');sec.className='xsec';const h=document.createElement('p');h.className='sub';h.textContent=u3.weight;const row=document.createElement('label');row.className='wrow';row.htmlFor='wkg';
    const sp=document.createElement('span');sp.textContent=u3.weightIn;const inp=document.createElement('input');inp.type='number';inp.id='wkg';inp.min='1';inp.max='500';inp.value=wkg;row.append(sp,inp);
    const out=document.createElement('p');out.className='wout';const upd=()=>{const v=Math.max(0,+inp.value||0);wkg=v||wkg;try{localStorage.setItem('tk3d-wkg',String(wkg))}catch(e){}out.textContent=u3.weightOut(nf(v*g,v*g<10?1:0),nf(g,g<.1?3:2))};inp.addEventListener('input',upd);upd();
    sec.append(h,row,out);box.appendChild(sec)}
  if(liveDistM(id)!=null){const dl=document.createElement('dl');dl.className='facts live';const a1=document.createElement('dt'),b1=document.createElement('dd'),a2=document.createElement('dt'),b2=document.createElement('dd');a1.textContent=u3.distNow;a2.textContent=u3.lightNow;dl.append(a1,b1,a2,b2);const lu=LU();const TR=[[lu.mVoy+' (17 km/s)',17000],[lu.mPlane,250],[lu.mCar,27.78]].map(([t,v])=>{const x=document.createElement('dt'),y=document.createElement('dd');x.textContent=t;dl.append(x,y);return[y,v]});box.appendChild(dl);
    const upd=()=>{const m=liveDistM(id);if(m==null)return;b1.textContent=fmtLen(m);b2.textContent=fmtDur(m/299792458);for(const[y,v]of TR)y.textContent=fmtDur(m/v)};upd();liveTimer=setInterval(upd,400)}
}
/* ================= events timeline ================= */
function openEvents(){infoId='__events';$('inListen').hidden=true;const u3=EX.UI[lang];$('inHero').hidden=true;$('inKind').textContent=u3.eventsKind;$('inTitle').textContent=u3.eventsTitle;$('inFacts').hidden=true;$('inDesc').hidden=true;$('inXWrap').hidden=true;$('inRWrap').hidden=true;$('inCtl').hidden=true;clearInterval(liveTimer);
  const box=$('inExtra');box.textContent='';const ul=document.createElement('div');ul.className='evlist';
  for(const ev of EX.EVENTS){const b=document.createElement('button');b.type='button';b.className='ev';const dt=document.createElement('span');dt.className='evd';dt.textContent=new Date(ev[0]).toLocaleDateString(U().locale,{day:'numeric',month:'short',year:'numeric'});const tx=document.createElement('span');tx.textContent=ev[3][lang];const ar=document.createElement('span');ar.className='arrow';ar.innerHTML=ARROW;b.append(dt,tx,ar);
    b.onclick=()=>{d=dayOf(ev[0]);paused=true;applyLang();setSky(false,true);switchFocus(ev[1],ev[2]);toast(ev[3][lang]);if(innerWidth<=900)closeInfo()};ul.appendChild(b)}
  box.appendChild(ul);info.hidden=false;card.hidden=true;info.scrollTop=0;stopTour()}
/* ================= search ================= */
let SIDX=null;const qIn=$('q'),qRes=$('qres');let qSel=0,qList=[];
const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function buildIdx(){const m=new Map();const addI=(id,cat)=>{if(!m.has(id))m.set(id,cat)};['Matahari',...PL,'Bulan'].forEach(n=>addI(n,'planet'));Object.keys(MOONMAP).forEach(k=>addI(k,'moon'));Object.keys(CT.INFO).forEach(k=>addI(k,'obj'));Object.keys(C2.NEW).forEach(k=>addI(k,'obj'));Object.keys(EX.INFO).forEach(k=>addI(k,'obj'));STARS.forEach(s=>addI(s.n,'star'));CONS.forEach(c=>addI('con:'+c.a,'con'));window.LEARN.GLOSS.forEach(g=>addI('gl:'+g.k,'term'));
  SIDX=[...m].map(([id,cat])=>{let lab;if(cat==='term'){const g=window.LEARN.GLOSS.find(x=>'gl:'+x.k===id);lab=g.t[lang]}else if(cat==='con'){const c=CONS.find(x=>x.a===id.slice(4));lab=c?c.n+(c.e?' · '+c.e:''):id}else{const n=nm(id);lab=n!==id?`${n} · ${id}`:n}return{id,cat,lab,key:norm(lab)}})}
function runSearch(){const q=norm(qIn.value.trim());qRes.textContent='';if(!q){qRes.hidden=true;return}if(!SIDX)buildIdx();
  qList=SIDX.filter(it=>it.key.includes(q)).sort((a,b)=>(a.key.startsWith(q)?0:1)-(b.key.startsWith(q)?0:1)||a.lab.length-b.lab.length).slice(0,8);qSel=0;
  if(!qList.length){const li=document.createElement('li');li.className='none';li.textContent=EX.UI[lang].noRes;qRes.appendChild(li)}
  qList.forEach((it,i)=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.className='qi'+(i===0?' sel':'');const t=document.createElement('span');t.textContent=it.lab;const c=document.createElement('span');c.className='qc';c.textContent=EX.UI[lang].cat[it.cat];b.append(t,c);b.onmousedown=e=>{e.preventDefault();choose(it.id)};li.appendChild(b);qRes.appendChild(li)});qRes.hidden=false}
function choose(id){qIn.value='';qRes.hidden=true;qIn.blur();if(id.startsWith('gl:')){glOpen=id.slice(3);openHub('gloss');return}openInfo(id);if(getInfo(id)&&getInfo(id).fly!==false)flyTo(id)}
qIn.addEventListener('input',runSearch);qIn.addEventListener('focus',()=>{SIDX=null;runSearch()});qIn.addEventListener('blur',()=>setTimeout(()=>qRes.hidden=true,150));
qIn.addEventListener('keydown',e=>{const items=[...qRes.querySelectorAll('.qi')];if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;qSel=(qSel+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((b,i)=>b.classList.toggle('sel',i===qSel))}
  else if(e.key==='Enter'){if(qList[qSel])choose(qList[qSel].id)}else if(e.key==='Escape'){qIn.value='';qRes.hidden=true;qIn.blur()}});
addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==qIn&&e.target.tagName!=='INPUT'){e.preventDefault();qIn.focus()}});
