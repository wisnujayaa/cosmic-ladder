/* main/tour.js: Two-way tour, side panel, cinematic, ruler, learning hub, tour player.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
/* ================= v9: two-way tour, collapsible panel, cinematic, scale bar, ruler, learning hub ================= */
const LN=window.LEARN;const LU=()=>LN.UI[lang];
const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const nearestLv=sv=>{let b=0,dd=1e9;LV.forEach((Lv,i)=>{const q=Math.abs(Lv.f-sv);if(q<dd){dd=q;b=i}});return b};
/* ---- progress ---- */
let PROG={lv:[],obj:[],best:0};try{const p=JSON.parse(localStorage.getItem('tk3d-prog')||'null');if(p&&Array.isArray(p.lv))PROG=Object.assign(PROG,p)}catch(e){}
function saveProg(){try{localStorage.setItem('tk3d-prog',JSON.stringify(PROG))}catch(e){}}
function progObj(id){if(!id||id.startsWith('__')||PROG.obj.includes(id))return;PROG.obj.push(id);saveProg()}
/* ---- two-way tour ---- */
let tourDir=1,tourRise=false,tourPaused=false,tourFirst=true;
function tourBtns(){const l=LU();const a=touring&&tourDir>0,b=touring&&tourDir<0;$('tour').textContent=a?'■ '+NU().stop:'↗ '+l.tourOut;$('tourBack').textContent=b?'■ '+NU().stop:'↙ '+l.tourIn;$('tour').classList.toggle('primary',!b);$('tourBack').classList.toggle('primary',b)}
function startTour(dir){if(touring&&tourDir===dir){stopTour();return}if(touring)stopTour();MK.sndInit();MK.whoosh(1,dir<0);tourDir=dir;touring=true;setSky(false,true);if(focus!=='Bumi')switchFocus('Bumi');recenter();anchor=null;
  tourRise=false;tourPaused=false;tourFirst=true;tourLvl=-1;if(dir>0&&s>26.9){s=target=7.0}if(dir<0&&s<26.5){target=27.0;tourRise=true}
  if(dir>0)target=Math.max(target,s);
  if(!info.hidden)closeInfo();setMeasure(false,null,null,true);tourBtns()}
function tourEnd(dir){if(!document.body.classList.contains('cine'))toast(dir>0?LU().tourDone:LU().tourHome);if(!poemOn(dir))narrate([dir>0?NS.T[lang].endO:NS.T[lang].endR],{tag:NU().narrator})}
function banner(i){const b=$('lvBanner');if(!b||document.body.classList.contains('cine')&&!touring)return;const Lv=LV[i];b.querySelector('.bx').innerHTML=`10<sup>${Math.round(Lv.f)}</sup> m`;b.querySelector('.bn').textContent=Lv[lang].name;b.classList.remove('show');void b.offsetWidth;b.classList.add('show')}
/* ---- side panel collapse ---- */
const sideTog=$('sideTog');let sideC=innerWidth<=900;try{const v=localStorage.getItem('tk3d-side');if(v!==null)sideC=v==='1'}catch(e){}
function placeTog(){const pl=parseFloat(getComputedStyle(side).paddingLeft)||0;$('strip').style.right=sideC?'0px':(side.offsetWidth-pl+(innerWidth<=900?2:0))+'px'}
function setSide(c){sideC=c;document.body.classList.toggle('sideC',c);sideTog.setAttribute('aria-expanded',String(!c));const t=c?LU().showPanel:LU().hidePanel;sideTog.title=t;sideTog.setAttribute('aria-label',t);try{localStorage.setItem('tk3d-side',c?'1':'0')}catch(e){}placeTog()}
sideTog.onclick=()=>setSide(!sideC);
function buildRail(){const r=$('rail');r.textContent='';LV.forEach((Lv,i)=>{const b=mk('button','',`10^${Math.round(Lv.f)}`);b.type='button';b.title=Lv[lang].name;b.setAttribute('aria-label',Lv[lang].name);b.onclick=()=>{stopTour();setSky(false,true);if(Lv.f<12&&focus!=='Bumi')switchFocus('Bumi');recenter();target=Lv.f;banner(i)};r.appendChild(b)})}
/* ---- cinematic ---- */
function setCine(on,quiet){document.body.classList.toggle('cine',on);if(on&&!quiet)toast(LU().cineHint)}
$('nStyle').onchange=e=>{NSTYLE=e.target.value;try{localStorage.setItem('tk3d-nstyle',NSTYLE)}catch(x){}};$('recBtn').onclick=()=>{MK.sndInit();recMode()};$('introRec').onclick=()=>{hideIntro();MK.sndInit();setTimeout(recMode,350)};
function recMode(){NSTYLE='poem';try{localStorage.setItem('tk3d-nstyle','poem')}catch(e){}applyLang();if(!info.hidden)closeInfo();setCine(true,true);setTimeout(()=>{if(touring)stopTour();startTour(1)},400)}
$('tCine').onclick=()=>setCine(true);$('cineExit').onclick=()=>setCine(false);
/* ---- fullscreen ---- */
if(!document.fullscreenEnabled)$('tFull').hidden=true;
$('tFull').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}};
/* ---- ruler ---- */
let mMode=false,mSel=[],mTick=0;
function mPos(id){if(id==='Matahari')return[0,0,0];if(POS[id])return POS[id];if(id==='JWST')return ESAT.jwst();if(CRAFTPOS[id])return CRAFTPOS[id];if(MOONMAP[id])return moonWorld(MOONMAP[id]);if(SBPOS[id])return SBPOS[id];return null}
function setMeasure(on,a,b,quiet){mMode=on;mSel=[];if(a)mSel.push(a);if(b)mSel.push(b);$('tMeasure').classList.toggle('on',on);$('tMeasure').setAttribute('aria-pressed',String(on));
  if(!on){$('mbox').hidden=true;if(!quiet)toast(LU().mOff);return}
  if(mSel.length===2){$('mbox').hidden=false;updM(true)}else{$('mbox').hidden=true;toast(mSel.length?LU().mPick2(nm(a)):LU().mPick1)}}
function pickMeasure(id){if(!mPos(id)){toast(LU().mBad);return}if(mSel.length>=2)mSel=[];if(mSel[0]===id)return;mSel.push(id);if(mSel.length===1){$('mbox').hidden=true;toast(LU().mPick2(nm(id)))}else{$('mbox').hidden=false;updM(true)}}
function updM(force){if(!mMode||mSel.length<2)return;if(!force&&++mTick%12)return;const a=mPos(mSel[0]),b=mPos(mSel[1]);if(!a||!b)return;const m=len(sub(a,b));const l=LU();
  $('mT').textContent=`${nm(mSel[0])} ↔ ${nm(mSel[1])}`;
  const rows=[[l.mDist,fmtLen(m)+(m>1e9&&m<.05*LY?` (${nf(m/1e9,1)} ${lang==='id'?'juta km':'million km'})`:'')],[l.mLight,fmtDur(m/299792458)],[l.mVoy+' (17 km/s)',fmtDur(m/17000)],[l.mPlane,fmtDur(m/250)],[l.mCar,fmtDur(m/27.78)]];
  const dl=$('mD');dl.textContent='';for(const[x,y]of rows){dl.append(mk('dt','',x),mk('dd','',y))}}
function projU(m){_v.set((m[0]-tgt[0])*k,(m[1]-tgt[1])*k,(m[2]-tgt[2])*k).applyQuaternion(root.quaternion).project(camera);if(_v.z>1||_v.z<-1)return null;return[(_v.x+1)/2*W,(1-_v.y)/2*H]}
function drawMeasure(){if(!mMode||!mSel.length||skyOn)return;const pts=mSel.map(id=>{const p=mPos(id);return p?projU(p):null});
  octx.save();octx.globalAlpha=.95;octx.strokeStyle='#fc3d21';octx.lineWidth=1.6;
  if(pts.length===2&&pts[0]&&pts[1]){octx.setLineDash([7,5]);octx.beginPath();octx.moveTo(pts[0][0],pts[0][1]);octx.lineTo(pts[1][0],pts[1][1]);octx.stroke();octx.setLineDash([]);
    const a=mPos(mSel[0]),b=mPos(mSel[1]);const t=fmtLen(len(sub(a,b)));const mx=(pts[0][0]+pts[1][0])/2,my=(pts[0][1]+pts[1][1])/2;octx.font='700 12px Inter,Arial,sans-serif';const w=octx.measureText(t).width+14;octx.fillStyle='#fc3d21';octx.fillRect(mx-w/2,my-11,w,22);octx.fillStyle='#fff';octx.textAlign='center';octx.textBaseline='middle';octx.fillText(t,mx,my+.5);octx.textAlign='left';octx.textBaseline='alphabetic'}
  for(const p of pts)if(p){octx.beginPath();octx.arc(p[0],p[1],7,0,Math.PI*2);octx.stroke()}
  octx.restore()}
$('tMeasure').onclick=()=>setMeasure(!mMode);$('mX').onclick=()=>setMeasure(false);
/* ---- try this ---- */
let tryKey=null,tryAct=null;
function doTry(act){if(!act)return;stopTour();
  if(act==='fast'){realtime=false;$('real').classList.remove('on');mulLog=1.6;$('mul').value=1.6;paused=false;applyLang()}
  else if(act.startsWith('m:')){const[,a,b]=act.split(':');setMeasure(true,a,b)}
  else if(act.startsWith('i:'))openInfo(act.slice(2));
  else if(act.startsWith('f:')){const id=act.slice(2);openInfo(id);try{flyTo(id)}catch(e){}}
  else if(act.startsWith('g:')){glOpen=act.slice(2);openHub('gloss')}
  else if(act==='sky'){if(!skyOn){recenter();setSky(true)}}
  else if(act==='gmode'){if(!galMode)$('gmode').click()}
  else if(act==='quiz'){newQuiz('all');openHub('quiz')}}
$('tryBtn').onclick=()=>doTry(tryAct);
/* ---- per-frame UI ---- */
let railCur=-1;
function updV9(){document.body.classList.toggle('touring',touring);const i=levelIndex();if(mMode&&s>16.2)setMeasure(false,null,null,true);
  if(!PROG.lv.includes(i)){PROG.lv.push(i);saveProg()}
  if(railCur!==i){railCur=i;[...$('rail').children].forEach((b,j)=>b.classList.toggle('on',j===i))}
  const tk=i+lang;if(tk!==tryKey){tryKey=tk;const T=LN.TRY[i];tryAct=T?T.act:null;$('tryT').textContent=LU().tryT;$('tryBtn').textContent=T?T.t[lang]:''}
  $('tprog').hidden=!touring;if(touring){const f=Math.min(1,Math.max(0,(s-LV[0].f)/(27-LV[0].f)));$('tprog').firstChild.style.width=(f*100).toFixed(1)+'%';$('tprog').classList.toggle('rev',tourDir<0)}
  const sb=$('scalebar');const show=!skyOn&&skyMorph<.05&&W>600&&!touring;tbarUpd();sb.hidden=!show;
  if(show){const ppm=ppmAt(s);const L=150/ppm;const uu=U().units;let u,um;if(L<1e9){u=uu.km;um=1e3}else if(L<.05*LY){u=uu.au;um=AU}else if(L<1e6*LY){u=uu.ly;um=LY}else if(L<1e9*LY){u=uu.mly;um=1e6*LY}else{u=uu.gly;um=1e9*LY}
    const v=L/um;const p10=Math.pow(10,Math.floor(Math.log10(v)));const mm=v/p10;const nice=(mm>=5?5:mm>=2?2:1)*p10;const px=nice*um*ppm;
    $('sbBar').style.width=px.toFixed(1)+'px';const dec=nice<1?Math.min(6,-Math.floor(Math.log10(nice))):0;$('sbLab').textContent=`${nf(nice,dec)} ${u}`+(um<=AU?` · ${LU().mLight.toLowerCase()} ${(t=>t<1?nf(t*1000,t<.01?2:1)+' ms':fmtDur(t))(nice*um/299792458)}`:'');sb.style.left=(W/2+offX)+'px'}
  $('lvBanner').style.left=(W/2+offX)+'px';placeSubs();updM(false)}
/* ---- learning hub ---- */
let hubTab='quiz',glOpen=null,QZ=null;
function openHub(tab,keep){if(tab)hubTab=tab;infoId='__hub';$('inListen').hidden=true;const l=LU();$('inHero').hidden=true;$('inKind').textContent=l.hubKind;$('inTitle').textContent=l.hubTitle;['inFacts','inDesc','inXWrap','inRWrap','inCtl'].forEach(k=>$(k).hidden=true);clearInterval(liveTimer);
  const st=info.scrollTop;const box=$('inExtra');box.textContent='';const tabs=mk('div','tabs');tabs.setAttribute('role','tablist');
  for(const k of['quiz','gloss','prog','keys']){const b=mk('button','tab'+(k===hubTab?' on':''),l.tabs[k]);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(k===hubTab));b.onclick=()=>openHub(k);tabs.appendChild(b)}
  box.appendChild(tabs);const body=mk('div','hubb');box.appendChild(body);({quiz:renderQuiz,gloss:renderGloss,prog:renderProg,keys:renderKeys})[hubTab](body);
  info.hidden=false;card.hidden=true;info.scrollTop=keep?st:0;stopTour();setHash(null)}
function goTo(g){if(!g)return;if(g.id){try{flyTo(g.id)}catch(e){}}else{setSky(false,true);if(focus!=='Bumi')switchFocus('Bumi');recenter();anchor=null;target=g.s;banner(nearestLv(g.s))}if(innerWidth<=900)closeInfo()}
function newQuiz(scope){const li=levelIndex();let idx=LN.QUIZ.map((q,i)=>i);if(scope==='lv'){let f=idx.filter(i=>LN.QUIZ[i].lv===li);if(f.length<2)f=idx.filter(i=>Math.abs(LN.QUIZ[i].lv-li)<=1);idx=f}QZ={scope,list:shuf(idx),i:0,c:0,ans:null,perm:null}}
function renderQuiz(box){if(!QZ)newQuiz('all');const l=LU();const n=QZ.list.length;
  const sc=mk('div','row qscope');for(const k of['all','lv']){const b=mk('button','btn'+(QZ.scope===k?' on':''),k==='all'?l.allQ:l.levelQ);b.type='button';b.onclick=()=>{newQuiz(k);openHub('quiz',true)};sc.appendChild(b)}box.appendChild(sc);
  const head=mk('div','qhead');head.append(mk('span','',l.qOf(Math.min(QZ.i+1,n),n)),mk('span','',l.score(QZ.c,n)));box.appendChild(head);
  const bar=mk('div','pbar');const bi=document.createElement('i');bi.style.width=(100*Math.min(QZ.i+(QZ.ans!==null?1:0),n)/n)+'%';bar.appendChild(bi);box.appendChild(bar);
  if(QZ.i>=n){const p=QZ.c/n;const pc=Math.round(100*p);if(pc>PROG.best){PROG.best=pc;saveProg()}box.appendChild(mk('p','qq',l.done(QZ.c,n)));box.appendChild(mk('p','desc',l.doneMsg(p)));const b=mk('button','btn primary',l.again);b.type='button';b.onclick=()=>{newQuiz(QZ.scope);openHub('quiz',true)};box.appendChild(b);return}
  const q=LN.QUIZ[QZ.list[QZ.i]];if(!QZ.perm)QZ.perm=shuf(q.o.map((x,i)=>i));
  const lvl=mk('p','eyebrow',`${l.lvIdx} · 10^${Math.round(LV[q.lv].f)} · ${LV[q.lv][lang].name}`);box.appendChild(lvl);box.appendChild(mk('p','qq',q.q[lang]));
  const ol=mk('div','qopts');const letters='ABCD';QZ.perm.forEach((pi,j)=>{const b=mk('button','qopt');b.type='button';b.append(mk('span','ql',letters[j]),mk('span','',q.o[pi][lang]));
    if(QZ.ans!==null){b.disabled=true;if(pi===q.a)b.classList.add('ok');else if(pi===QZ.ans)b.classList.add('bad')}
    b.onclick=()=>{if(QZ.ans!==null)return;QZ.ans=pi;if(pi===q.a){QZ.c++;try{MK.chime()}catch(e){}}openHub('quiz',true)};ol.appendChild(b)});box.appendChild(ol);
  if(QZ.ans!==null){const ok=QZ.ans===q.a;box.appendChild(mk('p','qv '+(ok?'ok':'bad'),ok?l.right:l.wrong));box.appendChild(mk('p','desc',q.e[lang]));
    const row=mk('div','row');const g=mk('button','btn',l.see+' →');g.type='button';g.onclick=()=>goTo(q.go);const nx=mk('button','btn primary',l.next);nx.type='button';nx.onclick=()=>{QZ.i++;QZ.ans=null;QZ.perm=null;openHub('quiz',true)};row.append(nx,g);box.appendChild(row);setTimeout(()=>nx.focus({preventScroll:true}),30)}}
function renderGloss(box){const l=LU();const inp=mk('input','gfilter');inp.type='search';inp.placeholder=l.glFilter;inp.setAttribute('aria-label',l.glFilter);const list=mk('div','gl-list');const want=glOpen;
  const draw=()=>{list.textContent='';const q=norm(inp.value.trim());for(const g of LN.GLOSS){const t=g.t[lang];if(q&&!norm(t+' '+g.d[lang]).includes(q))continue;const det=document.createElement('details');det.className='gl';if(want===g.k)det.open=true;
    det.appendChild(mk('summary','',t));const dv=mk('div','gld');dv.appendChild(mk('p','',g.d[lang]));const ex=mk('p','glex');ex.append(mk('b','',l.example+': '),document.createTextNode(g.ex[lang]));dv.appendChild(ex);
    if(g.go){const bt=mk('button','btn',l.see+' →');bt.type='button';bt.onclick=()=>goTo(g.go);dv.appendChild(bt)}det.appendChild(dv);list.appendChild(det);if(want===g.k)setTimeout(()=>det.scrollIntoView({block:'start'}),60)}};
  inp.addEventListener('input',draw);box.append(inp,list);draw();glOpen=null}
function renderProg(box){const l=LU();if(!SIDX)buildIdx();
  const row=(lab,val,frac)=>{const d=mk('div','prow');const h=mk('div','qhead');h.append(mk('span','',lab),mk('b','',val));const bar=mk('div','pbar');const i=document.createElement('i');i.style.width=(100*Math.min(1,frac)).toFixed(0)+'%';bar.appendChild(i);d.append(h,bar);return d};
  box.appendChild(row(l.progLv,`${PROG.lv.length}/${LV.length}`,PROG.lv.length/LV.length));
  const dots=mk('div','chips');LV.forEach((Lv,i)=>{const b=mk('button','chip'+(PROG.lv.includes(i)?'':' off'));b.type='button';const ic=document.createElement('i');ic.style.background=PROG.lv.includes(i)?'var(--red)':'#555';b.append(ic,mk('span','',`10^${Math.round(Lv.f)} ${Lv[lang].name}`));b.onclick=()=>goTo({s:Lv.f});dots.appendChild(b)});box.appendChild(dots);
  const tot=SIDX.filter(x=>x.cat==='planet'||x.cat==='moon'||x.cat==='obj'||x.cat==='con').length;
  box.appendChild(row(l.progObj,`${PROG.obj.length}/${tot}`,PROG.obj.length/tot));
  box.appendChild(row(l.progQ,PROG.best?PROG.best+'%':l.progNone,PROG.best/100));
  const r=mk('button','btn',l.progReset);r.type='button';r.onclick=()=>{PROG={lv:[levelIndex()],obj:[],best:0};saveProg();openHub('prog',true)};box.appendChild(r)}
function renderKeys(box){const t=mk('table','keys');for(const[a,b]of LU().keys){const tr=mk('tr');const k=mk('td');k.appendChild(mk('kbd','',a));tr.append(k,mk('td','',b));t.appendChild(tr)}box.appendChild(t)}
$('tLearn').onclick=()=>{if(infoId==='__hub')closeInfo();else openHub()};$('tHelp').onclick=()=>openHub('keys');
/* ---- keys ---- */
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase();
  if(k==='t')startTour(1);else if(k==='r')startTour(-1);else if(k==='m')setMeasure(!mMode);else if(k==='l')$('tLearn').click();else if(k==='p')setSide(!sideC);else if(k==='h')setCine(!document.body.classList.contains('cine'));else if(e.key==='?')openHub('keys')});
function applyV9(){const l=LU();tourBtns();applyNar();document.querySelectorAll('[data-k5]').forEach(e=>{e.textContent=l[e.dataset.k5]});$('introBack').textContent=l.introBack;
  for(const[id,key]of[['tLearn','learn'],['tMeasure','measure'],['tCine','cine'],['tFull','full'],['tHelp','help']]){$(id).title=l[key];$(id).setAttribute('aria-label',l[key])}
  $('cineExit').setAttribute('aria-label',l.cine);$('mX').setAttribute('aria-label',l.mClose);buildRail();railCur=-1;tryKey=null;setSide(sideC);if(mMode&&mSel.length===2)updM(true)}
$('tour').onclick=()=>startTour(1);$('tourBack').onclick=()=>startTour(-1);
$('introBack').onclick=()=>{hideIntro();MK.sndInit();setTimeout(()=>startTour(-1),350)};
addEventListener('resize',()=>placeTog());


/* ---- tour player: pause / chapters / subtitles placement ---- */
function chapTag(li){const n=LV.length;const k=tourDir>0?li+1:n-li;return NU().chap(k,n,LV[li][lang].name)}
function tourPause(p){if(!touring)return;tourPaused=p;if(p){NAR.saved={q:NAR.q.slice(),i:NAR.i,tag:NAR.tag,active:NAR.active};NAR.tok++;clearTimeout(NAR.timer);clearInterval(NAR.wTimer);try{SS&&SS.cancel()}catch(e){}duck(false);toast(NU().paused)}
  else{const sv=NAR.saved;NAR.saved=null;if(sv&&sv.active)narrate(sv.q,{from:sv.i,hold:true,tag:sv.tag});else tourHold=false}tbarUpd(true)}
function tourSkip(d){if(!touring)return;tourPaused=false;NAR.saved=null;tourRise=false;narStop(true);const li=levelIndex();let ni;if(d>0)ni=li+tourDir;else ni=Math.abs(s-LV[li].f)<.2?li-tourDir:li;ni=Math.max(0,Math.min(LV.length-1,ni));target=LV[ni].f;tourLvl=-2;MK.whoosh(.7,(ni-li)*tourDir<0?tourDir>0:tourDir<0);tbarUpd(true)}
const ICO={prev:'<path d="M6 5v14M18 5l-9 7 9 7z"/>',next:'<path d="M18 5v14M6 5l9 7-9 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="M7 4l13 8-13 8z"/>',stop:'<rect x="6" y="6" width="12" height="12"/>'};
const svgI=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
let tbState='';
function tbarUpd(force){const tb=$('tbar');tb.hidden=!touring||document.body.classList.contains('cine');if(!touring)return;const li=levelIndex();const st=li+'|'+tourPaused+'|'+lang+'|'+tourDir;if(st!==tbState||force){tbState=st;$('tbLab').textContent=chapTag(li);const pb=$('tbPlay');pb.innerHTML=svgI(tourPaused?'play':'pause');pb.title=tourPaused?NU().play:NU().pause;pb.setAttribute('aria-label',pb.title)}
  const L=W/2+offX;tb.style.left=L+'px';subs.style.left=L+'px';if(W>900){const avail=W-(info.hidden?card:info).getBoundingClientRect().right-(sideC?60:side.getBoundingClientRect().width)-48;subs.style.maxWidth=Math.max(320,Math.min(720,avail))+'px'}}
function placeSubs(){if(touring)return;const L=W/2+offX;subs.style.left=L+'px';if(W>900){const avail=W-(info.hidden?card:info).getBoundingClientRect().right-(sideC?60:side.getBoundingClientRect().width)-48;subs.style.maxWidth=Math.max(320,Math.min(720,avail))+'px'}}
function applyNar(){$('nStyle').value=NSTYLE;const n=NU();$('ccBtn').textContent=(CC?'▣ ':'□ ')+n.cc;$('ccBtn').classList.toggle('on',CC);$('ccBtn').setAttribute('aria-pressed',String(CC));document.querySelectorAll('[data-k6]').forEach(e=>{e.textContent=n[e.dataset.k6]});$('voiceTest').textContent=n.test;$('rateV').textContent=NRATE.toFixed(2)+'×';$('voiceSel').setAttribute('aria-label',n.voice);
  for(const[id,k,ic]of[['tbPrev','prev','prev'],['tbNext','next','next'],['tbStop','stop','stop']]){const b=$(id);b.innerHTML=svgI(ic);b.title=n[k];b.setAttribute('aria-label',n[k])}fillVoices();setListen(listenOn);tbarUpd(true)}
$('tbPrev').onclick=()=>tourSkip(-1);$('tbNext').onclick=()=>tourSkip(1);$('tbPlay').onclick=()=>tourPause(!tourPaused);$('tbStop').onclick=()=>stopTour();
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;if(e.key===']')tourSkip(1);else if(e.key==='[')tourSkip(-1)});
