/* main/frame.js: Category toggles, per-frame layer/position logic, label overlay.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
/* ================= category toggles ================= */
let CAT_ON={};for(const k of Object.keys(C2.CATS))CAT_ON[k]=true;
try{const v=JSON.parse(localStorage.getItem('tk3d-cats')||'null');if(v)CAT_ON=Object.assign(CAT_ON,v)}catch(e){}
function applyCats(){if(typeof ESAT!=='undefined')ESAT.g.visible=!!CAT_ON.craft;if(conMat)conMat.userData.base=CAT_ON.con?.32:0;for(const S of SPRITES)S.spr.visible=!!CAT_ON[S.obj.cat];for(const S of SB){S.line.visible=!!CAT_ON[S.cat];if(S.tailPts)S.tailPts.visible=!!CAT_ON[S.cat]}}

/* ================= frame logic ================= */
let s=7.3,target=7.3,focus='Bumi',galMode=0,galTd=0,tgt=[0,0,0],k=1;
const qEcl=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...eclT([0,0,1])),new THREE.Vector3(0,1,0));
const qId=new THREE.Quaternion();
function updatePositions(){POS.Matahari=[0,0,0];for(const n of PL)POS[n]=sc(eclT(A.planetEcl(n,d)),AU);POS.Bulan=add(POS.Bumi,sc(eclT(A.moonEcl(d)),KM))}
const isPlanet=n=>n==='Matahari'||n==='Bulan'||PL.includes(n);
function bodyT0(n){if(n==='Matahari')return 9;if(n==='Bulan')return 9.6;const mm=MOONMAP[n];if(mm)return Math.log10(mm.a*KM)+.4;if(PL.includes(n)){const a=Math.hypot(...A.planetEcl(n,0));return Math.log10(a*AU)-1.25}const o=focusObj(n);return o?o.view+.6:9}
let holdT0=null;
const t0eff=n=>(n===focus&&holdT0!==null)?Math.max(bodyT0(n),holdT0):bodyT0(n);
function focusObj(id){if(id==='JWST')return{view:9.3,minS:6.8};if(CRAFT.some(c=>c.id===id))return{view:11.6,minS:6.8};if(SBPOS[id]&&!C2.NEW[id]){const sb=EX.SB.find(x=>x[0]===id);return{view:sb&&sb[2]<5?10.6:11.6,minS:6.8}}const mm=MOONMAP[id];if(mm)return{view:Math.max(6.85,Math.log10(Math.max(mm.r*KM*9,1))),minS:Math.max(6.8,Math.log10(mm.r*KM*2.3))};const o=OBJ.find(x=>x.id===id);if(o)return o;if(SBPOS[id])return{view:(C2.NEW[id].view||10.5),minS:6.8};const st=STARS.find(x=>x.n===id);if(st)return{view:16.4,minS:15,three:st.three};
  const G=LGAL.find(x=>x.id===id);if(G)return{view:22.5,minS:20,three:sc(galT(G.p),LY)};const c=CL.find(x=>x.id===id);if(c)return{view:24.4,minS:22.5,three:sc(galT(c.p),MLY)};return null}
function posOf(id){if(POS[id])return POS[id];if(id==='JWST')return ESAT.jwst();if(CRAFTPOS[id])return CRAFTPOS[id];if(MOONMAP[id])return moonWorld(MOONMAP[id]);if(SBPOS[id])return SBPOS[id];const o=focusObj(id);return o&&o.three?o.three:[0,0,0]}
function baseTarget(){const b0=lerp3([0,0,0],GC,ss(19.9,20.9,s));let p=posOf(focus);let t0=t0eff(focus);const mm=MOONMAP[focus];if(mm){p=lerp3(p,POS[mm.pl],ss(t0,t0+1,s));t0=Math.max(bodyT0(mm.pl),t0+1)}return lerp3(p,b0,ss(t0,t0+1.4,s))}
let pan=[0,0,0],panDecay=false,anchor=null,offX=0,offY=0;
const computeTarget=()=>add(baseTarget(),pan);
function applyLayers(){k=1/Math.pow(10,s);
  for(const L of layers){const a=L.winFn(s);L.alpha=a;L.g.visible=a>.004;if(!L.g.visible)continue;const o=L.originFn();
    L.g.position.set((o[0]-tgt[0])*k,(o[1]-tgt[1])*k,(o[2]-tgt[2])*k);L.g.scale.setScalar(L.unit*k);
    for(const m of L.mats){const v=m.userData.base*a;if(m.userData.u)m.uniforms.uOpacity.value=v;else m.opacity=v}}}
const _w=new THREE.Vector3(),_w2=new THREE.Vector3();
function animateBodies(){const days=d;
  if(sunL.g.visible)sunMesh.rotation.y=(days*24/PHYS.Matahari.rot)%1*TAU;
  for(const n of PL){const L=bodies[n];if(!L||!L.g.visible)continue;const ph=PHYS[n];
    if(n==='Bumi'){L.mesh.rotation.y=A.gmst(days);L.clouds.rotation.y=(days*.03)%TAU;const mp=A.moonEcl(days);L.moonPivot.position.set(mp[0],mp[1],mp[2]);L.g.getWorldPosition(_w);L.moonPivot.lookAt(_w);
      sunL.g.getWorldPosition(_w2);earthMat.uniforms.uSun.value.copy(_w2).sub(_w)}
    else L.mesh.rotation.y=((days*24/ph.rot)%1)*TAU;
    updateMoonsOf(L,days)}
  if(solL.g.visible){propagate(AST,d);AST.attr.needsUpdate=true;propagate(TRO,d);TRO.attr.needsUpdate=true;propagate(KBO,d);KBO.attr.needsUpdate=true}
  if(oortL.g.visible){propagate(OORT,d);OORT.attr.needsUpdate=true}
  if(galL.g.visible){galMat.uniforms.uTime.value=yrs();galMat.uniforms.uTd.value=galTd;galMat.uniforms.uMode.value=galMode}
  /* sky sphere morph */
  const Rly=12*Math.pow(10,s)/LY;
  if(starMat){starMat.uniforms.uMorph.value=skyMorph;starMat.uniforms.uR.value=Rly;conMat.uniforms.uMorph.value=skyMorph;conMat.uniforms.uR.value=Rly;mwMat.uniforms.uMorph.value=1;mwMat.uniforms.uR.value=Rly*1.01;mwMat.userData.base=skyMorph*.5;conMat.userData.base=CAT_ON.con?.38*skyMorph:0;if(oriMat)oriMat.userData.base=.55*(1-skyMorph);
    starMat.uniforms.uSize.value=1.7+skyMorph*.5}
  for(const S of SPRITES){if(S.obj.L!==dsoL)continue;const m=skyMorph;const p=lerp3(sc(S.pdir,S.dist),sc(S.pdir,Rly*.995),m);S.spr.position.set(...p);const w=S.w+(S.ang*Rly*.995-S.w)*m;S.spr.scale.set(w,w,1)}
}

/* ================= overlay ================= */
const _v=new THREE.Vector3();
function proj(m){_v.set((m[0]-tgt[0])*k,(m[1]-tgt[1])*k,(m[2]-tgt[2])*k).applyQuaternion(root.quaternion).project(camera);if(_v.z>1||_v.z<-1||Math.abs(_v.x)>1.3||Math.abs(_v.y)>1.3)return null;return[(_v.x+1)/2*W,(1-_v.y)/2*H]}
function projW(wv){_v.copy(wv).project(camera);if(_v.z>1||Math.abs(_v.x)>1.3||Math.abs(_v.y)>1.3)return null;return[(_v.x+1)/2*W,(1-_v.y)/2*H]}
const pxPerM=()=>Math.min(W,H)/Math.pow(10,s);
const HITS=[];let hoverId=null;const BODYPX=[];
const C_INK='#ffffff',C_SIL='#c7cdd8',C_RED='#fc3d21',C_SUN='#ffd27a';
function hasInfo(id){return !!(CT.INFO[id]||C2.NEW[id]||MOONMAP[id]||EX.INFO[id]||(id&&id.startsWith('con:')))}
const LBOX=[];function lfree(x,y,w,h){for(const b of LBOX)if(x<b[0]+b[2]&&x+w>b[0]&&y<b[1]+b[3]&&y+h>b[1])return false;LBOX.push([x,y,w,h]);return true}
function label(p,text,a,col,dx,dy,size,id,weight){if(!p||a<.04)return;col=col||C_INK;dx=dx===undefined?9:dx;dy=dy===undefined?-8:dy;size=size||12;
  octx.globalAlpha=Math.min(1,a);octx.font=`${weight||600} ${size}px Inter,"Helvetica Neue",Arial,sans-serif`;const x=p[0]+dx,y=p[1]+dy;
  octx.shadowColor='rgba(0,0,0,.85)';octx.shadowBlur=4;octx.fillStyle=col;octx.fillText(text,x,y);octx.shadowBlur=0;
  if(id&&a>.3&&hasInfo(id)){const w=octx.measureText(text).width;HITS.push([x-4,y-size-4,w+8,size+10,id,1],[p[0]-11,p[1]-11,22,22,id,0]);if(id===hoverId){octx.fillStyle=C_RED;octx.fillRect(x,y+3,w,2)}}}
function dot(p,r,col,a){if(!p||a<.03)return;octx.globalAlpha=Math.min(1,a);octx.fillStyle=col;octx.beginPath();octx.arc(p[0],p[1],r,0,TAU);octx.fill()}
function ring(p,r,col,a,lw){if(!p||a<.03)return;octx.globalAlpha=Math.min(1,a);octx.strokeStyle=col;octx.lineWidth=lw||1.2;octx.beginPath();octx.arc(p[0],p[1],r,0,TAU);octx.stroke()}
function marker(p,cat,a,isBH){if(!p||a<.03)return;const c=C2.CATS[cat].c;octx.globalAlpha=Math.min(1,a);octx.strokeStyle=c;octx.fillStyle=c;octx.lineWidth=1.4;const[x,y]=p;
  if(cat==='neb'){octx.beginPath();octx.arc(x,y,6,0,TAU);octx.stroke()}
  else if(cat==='clu'){octx.setLineDash([2,3]);octx.beginPath();octx.arc(x,y,7,0,TAU);octx.stroke();octx.setLineDash([])}
  else if(cat==='rem'){if(isBH){octx.beginPath();octx.arc(x,y,6,0,TAU);octx.stroke();octx.fillStyle='#000';octx.beginPath();octx.arc(x,y,4,0,TAU);octx.fill()}else{octx.beginPath();octx.moveTo(x,y-6);octx.lineTo(x+6,y);octx.lineTo(x,y+6);octx.lineTo(x-6,y);octx.closePath();octx.stroke()}}
  else if(cat==='exo'){octx.beginPath();octx.arc(x,y,3,0,TAU);octx.fill();octx.beginPath();octx.ellipse(x,y,8,3,-.4,0,TAU);octx.stroke()}
  else if(cat==='imp'){octx.beginPath();octx.moveTo(x-5,y-5);octx.lineTo(x+5,y+5);octx.moveTo(x+5,y-5);octx.lineTo(x-5,y+5);octx.stroke()}
  else if(cat==='gal'){octx.beginPath();octx.ellipse(x,y,8,4,.5,0,TAU);octx.stroke()}
  else{octx.beginPath();octx.arc(x,y,2.5,0,TAU);octx.fill()}}
const ORION=/Betel|Bella|Rigel|Saiph|Mint|Alnil|Alnit/;
const SURF=Object.entries(C2.NEW).filter(([,o])=>o.p.surf).map(([id,o])=>({id,body:o.p.surf[0],lat:o.p.surf[1]*DEG,lon:o.p.surf[2]*DEG}));
function surfWorld(st){const L=bodies[st.body==='Bulan'?'Bumi':st.body];if(!L||!L.g.visible)return null;const mesh=st.body==='Bulan'?L.moon:L.mesh;const r=st.body==='Bulan'?1737.4:PHYS[st.body].r;
  const v=new THREE.Vector3(Math.cos(st.lat)*Math.cos(st.lon)*r,Math.sin(st.lat)*r,-Math.cos(st.lat)*Math.sin(st.lon)*r);mesh.localToWorld(v);const c=new THREE.Vector3();mesh.getWorldPosition(c);
  const n=v.clone().sub(c).normalize();const toCam=camera.position.clone().sub(v).normalize();return{v,n,vis:n.dot(toCam),rpx:r*KM*pxPerM()}}
function drawOverlay(){
  octx.clearRect(0,0,W,H);HITS.length=0;BODYPX.length=0;LBOX.length=0;const ppm=pxPerM();const L_=U().lab,un=U().units;const sky=skyMorph;
  const aS=sunL.alpha*(1-sky);if(aS>.03){const p=proj([0,0,0]);const rpx=PHYS.Matahari.r*KM*ppm;if(rpx<3)dot(p,3,C_SUN,aS);if(p)BODYPX.push(['Matahari',p[0],p[1]]);label(p,nm('Matahari'),aS*win(9.7,15.8,.6,s),C_SUN,Math.max(9,rpx*.8),-Math.max(8,rpx*.8),13,'Matahari',700)}
  for(const n of PL){const L=bodies[n];const p=proj(POS[n]);if(!p)continue;const rpx=PHYS[n].r*KM*ppm;const orbpx=Math.hypot(...A.planetEcl(n,0))*AU*ppm;
    const isF=n===focus&&s<t0eff(n)+1.4;const aMark=isF?1:Math.max(solL.alpha,L?L.alpha:0)*ss(4,14,orbpx)*(1-ss(W*.9,W*1.5,orbpx));
    if(rpx<1.4&&aMark>.03)dot(p,1.2,PCOL[n],aMark*.85);if(aMark>.1||rpx>3)BODYPX.push([n,p[0],p[1]]);
    const big=rpx>40;const aLab=big?(L?L.alpha:0):(isF?1:aMark*ss(20,48,orbpx));label(p,nm(n),aLab,PCOL[n],Math.max(9,rpx*.75),-Math.max(8,rpx*.75),13,n,700);
    if(L&&L.alpha>.03){if(L.ml){L.eq.updateMatrixWorld();const smallQ=[];for(const m of L.ml){const r=m.a*KM*ppm;const isF=m.name===focus;const am=isF?1:L.alpha*ss(16,40,r)*(1-ss(W*1.5,W*3,r));if(am<.03)continue;_w.set(m.loc[0],m.loc[1],m.loc[2]).applyMatrix4(L.eq.matrixWorld);const q=projW(_w);if(!q)continue;
        if(m.mesh){if(m.r*KM*ppm<2.5)dot(q,1.8,C_INK,am);if(m.r>=100)BODYPX.push([m.name,q[0],q[1]]);octx.font='500 11px Inter,Arial,sans-serif';if(isF||lfree(q[0]+7,q[1]-17,octx.measureText(m.name).width+4,15))label(q,m.name,am,C_SIL,7,-6,11,m.name,isF?700:500)}else smallQ.push([m,q,am])}
      octx.font='500 10px Inter,Arial,sans-serif';for(const[m,q,am]of smallQ){if(am<.25)continue;const w=octx.measureText(m.name).width;if(m.name===focus||lfree(q[0]+5,q[1]-14,w+4,13))label(q,m.name,am*.8,m.i>90?'#ffb59c':'#b9d4ff',5,-4,10,m.name,500)}}
      if(n==='Bumi'){const r=384400*KM*ppm;const am=L.alpha*ss(16,40,r)*(1-ss(W*1.5,W*3,r));L.moon.getWorldPosition(_w);const q=projW(_w);if(q){if(1737*KM*ppm<2.5)dot(q,1.8,'#ddd',am);label(q,nm('Bulan'),am,C_SIL,9,-8,12,'Bulan',600);BODYPX.push(['Bulan',q[0],q[1]])}}}}
  ESAT.draw();
  /* surface sites */
  if(CAT_ON.imp)for(const st of SURF){const w=surfWorld(st);if(!w||w.vis<.08||w.rpx<55)continue;const a=ss(55,110,w.rpx)*ss(.08,.3,w.vis);const q=projW(w.v);marker(q,'imp',a);label(q,nm(st.id),a,'#ffb27a',8,-7,11,st.id,600)}
  if(solL.alpha>.03&&sky<.5){const lab=(a,au,text,col,ang,id)=>{const v=sc(eclT([au*Math.cos(ang),au*Math.sin(ang),0]),AU);label(proj(v),text,solL.alpha*a,col,0,0,11,id,500)};
    lab(ss(60,140,3*AU*ppm)*(1-ss(W,2*W,3*AU*ppm)),2.9,nm('Sabuk asteroid'),'#d8c8ad',2.2,'Sabuk asteroid');
    const LJ=A.planetEcl('Jupiter',d);const ang=Math.atan2(LJ[1],LJ[0]);const aT=ss(60,140,5.2*AU*ppm)*(1-ss(W*1.2,2.5*W,5.2*AU*ppm));lab(aT,5.4,L_.l4,'#b4dba0',ang+60*DEG,'Trojan');lab(aT,5.4,L_.l5,'#b4dba0',ang-60*DEG,'Trojan');
    lab(ss(60,140,44*AU*ppm)*(1-ss(W*1.2,2.5*W,44*AU*ppm)),46,nm('Sabuk Kuiper'),C_SIL,.8,'Sabuk Kuiper');
    const aH=win(13.3,15.6,.6,s);if(CAT_ON.craft)for(const c of CRAFT){if(!CRAFTPOS[c.id])continue;const vp=proj(CRAFTPOS[c.id]);const rp=c.dist*AU*ppm;const ac=c.id===focus?1:Math.max(aH,solL.alpha*ss(20,60,rp)*(1-ss(W*2,W*4,rp)));dot(vp,1.8,'#ff9f6e',ac);if(vp)BODYPX.push([c.id,vp[0],vp[1]]);label(vp,`${c.id} (~${Math.round(c.dist)} AU)`,ac,'#ffc4a6',9,-8,12,c.id,600)}
    label(proj(sc(eclT([0,0,1]),125*AU)),L_.helio,aH,C_SIL,8,0,12,'Heliopause',500)}
  /* comets & NEOs */
  if(solL.alpha>.03||(bodies.Bumi&&bodies.Bumi.alpha>.03))for(const S of SB){if(!CAT_ON[S.cat]||!SBPOS[S.id])continue;const p=proj(SBPOS[S.id]);if(!p)continue;const r=len(S.cur);const rp=r*AU*ppm;
    if(S.id==='Parker Solar Probe'&&d<PSP0)continue;const isF=S.id===focus;const a=isF?1:solL.alpha*ss(20,60,rp)*(1-ss(W*2,W*4,rp));if(a<.03)continue;const col=S.cat==='craft'?'#ff9f6e':S.kind==='dwarf'?'#eedcb4':S.comet?'#dfe9ff':'#ffcf9e';dot(p,S.comet?1.6:1.3,col,a*.9);BODYPX.push([S.id,p[0],p[1]]);label(p,nm(S.id),a,col,8,-7,12,S.id,S.kind==='dwarf'?700:600)}
  if(oortL.alpha>.03&&sky<.5){const a=oortL.alpha;label(proj(sc(eclT([0,0,1]),100000*AU)),L_.oortOut,a,C_SIL,8,0,12,'Tepi luar Awan Oort',500);label(proj(sc(eclT([0,0,1]),2000*AU)),L_.oortIn,a*ss(40,100,2000*AU*ppm),C_SIL,8,0,12,'Tepi dalam',500)}
  /* stars */
  const Rm=12*Math.pow(10,s);
  const skyPos=(dirEq,distLy)=>lerp3(sc(eqT(dirEq),distLy*LY),sc(eqT(dirEq),Rm),sky);
  if(starL.alpha>.03){for(const st of STARS){const r=st.dist*LY*ppm;const a=starL.alpha*Math.max(sky,ss(30,75,r)*(1-ss(W*.9,W*1.6,r)));label(proj(skyPos(st.dir,st.dist)),`${nm(st.n)}${sky>.5?'':` · ${nf(st.dist,2)} ${un.lyS}`}`,a,ORION.test(st.n)?'#ffd9a0':C_INK,7,-6,11,st.n,500)}
    if(sky>.3)for(const b of BRIGHT)label(proj(skyPos(b.dir,len(b.v))),b.n,starL.alpha*sky*.8,C_SIL,6,-5,10,null,500);
    if(CAT_ON.con&&sky>.3)for(const c of CONS){const p=proj(skyPos(c.cd,0));label(p,c.n,starL.alpha*sky*.9,'#9fb0ff',-octx.measureText(c.n).width/2,0,11,'con:'+c.a,700)}
    if(sky<.5){const p=proj([0,0,0]);ring(p,9,C_RED,starL.alpha*(1-sky));label(p,nm('Matahari'),starL.alpha*(1-sky),C_INK,13,4,12,'Matahari',700)}}
  /* deep-sky objects */
  for(const o of OBJ){if(!CAT_ON[o.cat]||!o.L.g.visible)continue;const isF=o.id===focus;let p,a;
    if(o.L===dsoL&&sky>.01){p=proj(skyPos(o.dir,o.dist));a=o.L.alpha*sky}
    else{p=proj(o.three);const r=o.dist*LY*ppm;a=o.L.alpha*(isF?1:ss(25,70,r)*(1-ss(W*1.6,W*3,r)))*(1-sky)}
    if(!p||a<.03)continue;marker(p,o.cat,a,/BH|Cygnus X/.test(o.id));BODYPX.push([o.id,p[0],p[1]]);label(p,nm(o.id),a,C2.CATS[o.cat].c,10,-8,12,o.id,600)}
  if(galL.alpha>.03){const a=win(19.9,22.2,.6,s);const ws=7.672e-4/Math.hypot(26700,3000);const ph=Math.PI-ws*yrs();
    const sunNow=add(GC,sc(galT([26700*Math.cos(ph),26700*Math.sin(ph),0]),LY));const p=proj(sunNow);ring(p,9,C_RED,a,1.6);label(p,L_.sunHere,a,C_INK,13,4,12,'Matahari',700);label(proj(GC),L_.gc,a,'#ffd9a8',10,22,12,'Pusat galaksi',600)}
  if(lgL.alpha>.03){const a=lgL.alpha;for(const G of LGAL)label(proj(sc(galT(G.p),LY)),nm(G.id)+(G.cat?` (${G.cat})`:''),a*(G.blob?win(21.5,22.6,.5,s):1),C_INK,10,-8,12,G.id,600);label(proj(GC),nm('Bima Sakti'),a*ss(22.3,22.9,s),'#ffd9a8',10,-8,12,'Bima Sakti',700)}
  if(lanL.alpha>.03){const a=lanL.alpha;for(const c of CL)label(proj(sc(galT(c.p),MLY)),`${nm(c.id)} (~${nf(c.d,0)} ${un.mlyS})`,a,C_INK,10,-6,11,c.id,500);const p=proj([0,0,0]);ring(p,9,C_RED,a,1.6);label(p,L_.lg,a,C_INK,13,4,12,'Local Group',700);
    label(proj(sc(galT(add(LAN_C,[0,0,260])),MLY)),L_.lan,a,'#ff9a85',-150,-8,12,'Batas Laniakea',600)}
  if(webL.alpha>.03){const a=webL.alpha;const p=proj([0,0,0]);ring(p,9,C_RED,a,1.6);label(p,L_.us,a,C_INK,13,4,12,'Kita',700);
    label(proj(sc(galT([0,0,OBS]),GLY)),L_.edge,a,'#ffb48f',-190,-14,12,'Batas alam semesta teramati',600);label(proj(sc(galT([0,0,-OBS]),GLY)),L_.cmb,a*.8,'#ffb48f',-110,24,11,'Cahaya latar belakang kosmik',500)}
  octx.globalAlpha=1}

