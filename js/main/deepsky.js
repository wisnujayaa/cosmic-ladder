/* main/deepsky.js: Stars, deep-sky objects, Milky Way, Local Group, Laniakea, cosmic web.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
/* ---------- stars (real catalog, loaded) ---------- */
const starL=layer('stars',LY,A.M_EQ,()=>[0,0,0],s=>Math.max(win(16.9,19.9,.8,s),skyMorph>.01?win(15.6,19.9,.6,s):0));
const STARS=[
 ['Alpha Centauri',219.90,-60.83,4.37],['Proxima Centauri',217.43,-62.68,4.24],['Bintang Barnard',269.45,4.69,5.96],['Wolf 359',164.12,7.01,7.86],['Sirius',101.29,-16.72,8.6],['Epsilon Eridani',53.23,-9.46,10.5],
 ['Procyon',114.83,5.22,11.46],['Tau Ceti',26.02,-15.94,11.9],['Altair',297.70,8.87,16.7],['Vega',279.23,38.78,25],['Arcturus',213.92,19.18,36.7],['Aldebaran',68.98,16.51,65],
 ['Polaris',37.95,89.26,430],['Betelgeuse',88.79,7.41,550],['Bellatrix',81.28,6.35,250],['Rigel',78.63,-8.20,860],['Saiph',86.94,-9.67,650],['Mintaka',83.00,-0.30,1200],['Alnilam',84.05,-1.20,2000],['Alnitak',85.19,-1.94,1260],['Deneb',310.36,45.28,2600]
].map(([n,ra,de,dist])=>({n,dist,dir:A.sph(ra,de),v:sc(A.sph(ra,de),dist),three:sc(eqT(A.sph(ra,de)),dist*LY)}));
let skyMorph=0,skyOn=false,SKY=null;const BRIGHT=[];const CONS=[];
let starMat=null,conMat=null,mwMat=null,oriMat=null,skyBG=null,bgStarMat=null,bgMwMat=null;
function ciRGB(ci){const P=[[-.4,[.61,.71,1]],[0,[.8,.85,1]],[.4,[1,.97,.93]],[.8,[1,.89,.75]],[1.2,[1,.8,.6]],[1.6,[1,.7,.45]],[2.2,[1,.6,.35]]];if(ci<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(ci<=P[i][0]){const t=(ci-P[i-1][0])/(P[i][0]-P[i-1][0]);return P[i-1][1].map((v,j)=>v+(P[i][1][j]-v)*t)}return P[P.length-1][1]}
function buildSky(data){SKY=data;const st=data.stars,N=st.length;const pos=new Float32Array(N*3),dir=new Float32Array(N*3),col=new Float32Array(N*3),size=new Float32Array(N),spk=new Float32Array(N);
  for(let i=0;i<N;i++){const s=st[i];const x=s[0],y=s[1],z=s[2];const l=Math.hypot(x,y,z)||1;pos.set([x,y,z],3*i);dir.set([x/l,y/l,z/l],3*i);const mag=s[3];const c=ciRGB(s[4]);const b=Math.min(1.25,Math.max(.35,1.05-.1*mag));col.set([c[0]*b,c[1]*b,c[2]*b],3*i);
    size[i]=Math.min(3.6,Math.max(.55,2.7-.38*mag));spk[i]=mag<1.2?Math.min(1,(1.2-mag)/2.8):0;if(s[5]&&!STARS.find(x=>x.n===s[5]))BRIGHT.push({n:s[5],v:[x,y,z],dir:[x/l,y/l,z/l]})}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aDir',new THREE.BufferAttribute(dir,3));g.setAttribute('aColor',new THREE.BufferAttribute(col,3));g.setAttribute('aSize',new THREE.BufferAttribute(size,1));g.setAttribute('aSpike',new THREE.BufferAttribute(spk,1));
  starMat=reg(starL,pmat(1.7,1,VS_STAR,FS_STAR));const P=new THREE.Points(g,starMat);P.frustumCulled=false;starL.q.add(P);
  const lp=[],ld=[];for(const c of data.cons){const segs=c.s;let cx=[0,0,0],cd=[0,0,0];for(let k=0;k<segs.length;k++){const s=st[segs[k]];const v=[s[0],s[1],s[2]];const l=len(v);lp.push(...v);ld.push(v[0]/l,v[1]/l,v[2]/l);cx=add(cx,v);cd=add(cd,sc(v,1/l))}
    CONS.push({a:c.a,n:c.n,e:c.e,c3:sc(cx,1/Math.max(1,segs.length)),cd:nrm(cd)})}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lg.setAttribute('aDir',new THREE.Float32BufferAttribute(ld,3));
  conMat=new THREE.ShaderMaterial({uniforms:{uMorph:{value:0},uR:{value:1},uColor:{value:new THREE.Color(C2.CATS.con.c)},uOpacity:{value:.3}},vertexShader:VS_LINE,fragmentShader:FS_LINE,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});conMat.userData.base=.3;conMat.userData.u=true;starL.mats.push(conMat);
  const LS=new THREE.LineSegments(lg,conMat);LS.frustumCulled=false;starL.q.add(LS);
  {const o=data.cons.find(c=>c.a==='Ori');if(o){const op=[];for(const i of o.s)op.push(st[i][0],st[i][1],st[i][2]);const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(op,3));oriMat=reg(starL,lineMat(0xffc27a,.55));const OL=new THREE.LineSegments(og,oriMat);OL.frustumCulled=false;starL.q.add(OL)}}
  /* Milky Way glow on the sky sphere (illustrative distribution, galactic plane) */
  const r=rng(5),mp=[],mc=[],ms=[];for(let i=0;i<14000;i++){let l=gauss(r)*55;if(r()<.35)l=(r()*2-1)*180;const bulge=Math.exp(-Math.abs(l)/25);let b=gauss(r)*(3.2+7*bulge);if(Math.abs(l)<60&&Math.abs(b)<1.3&&r()<.6)continue;
    const v=A.galToEq(A.sph(l,b));mp.push(v[0],v[1],v[2]);const w=.25+.5*bulge*r();mc.push(.8*w,.78*w,.72*w+.05);ms.push(2.2+r()*2.5)}
  const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(mp,3));mg.setAttribute('aDir',new THREE.Float32BufferAttribute(mp,3));mg.setAttribute('aColor',new THREE.Float32BufferAttribute(mc,3));mg.setAttribute('aSize',new THREE.Float32BufferAttribute(ms,1));mg.setAttribute('aSpike',new THREE.Float32BufferAttribute(new Array(ms.length).fill(0),1));
  mwMat=pmat(1.6,0,VS_STAR,FS_STAR);mwMat.userData.base=0;starL.mats.push(mwMat);const MW=new THREE.Points(mg,mwMat);MW.frustumCulled=false;starL.q.add(MW);
  /* sky backdrop at "infinity": the same real stars + Milky Way, visible at every scale */
  skyBG=new THREE.Group();skyBG.quaternion.copy(starL.q.quaternion);root.add(skyBG);
  bgStarMat=pmat(1.25,.8,VS_STAR,FS_STAR);bgStarMat.uniforms.uMorph.value=1;bgStarMat.uniforms.uR.value=1500;const BP=new THREE.Points(g,bgStarMat);BP.frustumCulled=false;BP.renderOrder=-2;skyBG.add(BP);
  bgMwMat=pmat(1.25,.32,VS_STAR,FS_STAR);bgMwMat.uniforms.uMorph.value=1;bgMwMat.uniforms.uR.value=1490;const BM=new THREE.Points(mg,bgMwMat);BM.frustumCulled=false;BM.renderOrder=-3;skyBG.add(BM);

  applyCats()}

/* ---------- deep-sky objects with photos, in 4 scale bands ---------- */
const dsoL=layer('dso',LY,A.M_EQ,()=>[0,0,0],s=>Math.max(win(16.4,22.4,.7,s),skyMorph>.01?win(15.6,19.9,.6,s):0));
const lgdL=layer('lgdso',LY,A.M_EQ,()=>[0,0,0],s=>win(21.5,24.5,.7,s));
const landL=layer('landso',MLY,A.M_EQ,()=>[0,0,0],s=>win(23.2,25.9,.7,s));
const webdL=layer('webdso',GLY,A.M_EQ,()=>[0,0,0],s=>win(25.8,99,.8,s));
const OBJ=[];
let PHOTOS={};
function bandOf(dist){return dist<30000?[dsoL,1]:dist<5e6?[lgdL,1]:dist<1e9?[landL,1e-6]:[webdL,1e-9]}
function buildDSO(){for(const[id,o]of Object.entries(C2.NEW)){if(!o.p.eq)continue;const[ra,de,dist]=o.p.eq;const[L,k]=bandOf(dist);const dir=A.sph(ra,de);
    const obj={id,cat:o.cat,dist,dir,L,local:sc(dir,dist*k),three:sc(eqT(dir),dist*LY),view:o.view||18,minS:(o.view||18)-1.4};OBJ.push(obj);
    if(o.photo&&PHOTOS[o.photo])addPhoto(obj,o.photo,dist,k)}
  const extra=[['Andromeda','m31',2.5e6],['Triangulum','m33',2.73e6],['Awan Magellan Besar','lmc',163000],['Awan Magellan Kecil','smc',200000]];
  for(const[id,ph,dist]of extra){const[L,k]=bandOf(dist);const P=PHOTOS[ph];if(!P)continue;const obj={id,cat:'gal',dist,dir:A.sph(P.ra,P.dec),L,local:sc(A.sph(P.ra,P.dec),dist*k),photoOnly:true};addPhoto(obj,ph,dist,k)}
  applyCats()}
const SPRITES=[];
function addPhoto(obj,ph,dist,k){const P=PHOTOS[ph];const m=reg(obj.L,new THREE.SpriteMaterial({map:loader.load('img/sky_'+ph+'.jpg'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.85}),.85);
  const spr=new THREE.Sprite(m);const pdir=A.sph(P.ra,P.dec);const w=P.w*DEG*dist*k;spr.position.set(...sc(pdir,dist*k));spr.scale.set(w,w,1);obj.L.q.add(spr);SPRITES.push({spr,obj,pdir,ang:P.w*DEG,dist:dist*k,w})}

/* ---------- Milky Way (ly, galactic, shader-rotated) ---------- */
const galL=layer('galaxy',LY,A.M_GAL,()=>GC,s=>win(19.6,24.9,.9,s));
let galMat=null,galPlane=null,galPlaneMat=null;
const GAL_HALF=2800/1078*26700; /* NASA/JPL-Caltech (R. Hurt) face-on map: 1078 px = Sun-centre distance */
function galPoints(pol,cols,sz){const n=sz.length;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));geo.setAttribute('aColor',new THREE.Float32BufferAttribute(cols,3));geo.setAttribute('aPol',new THREE.Float32BufferAttribute(pol,3));geo.setAttribute('aSize',new THREE.Float32BufferAttribute(sz,1));
  galMat=reg(galL,pmat(1.5,.1,VS_GAL));const pts=new THREE.Points(geo,galMat);pts.frustumCulled=false;galL.q.add(pts)}
function galProcedural(){const pos=[],cols=[],pol=[],sz=[];const r=rng(77),g=()=>gauss(r);const k=1/Math.tan(14*DEG);const barAng=Math.PI-27*DEG;
 const push=(x,y,z,col,s)=>{pol.push(Math.hypot(x,y),Math.atan2(y,x),z);cols.push(...col);sz.push(s)};
 const warm=C('#ffd2a0'),blue=C('#bcd2ff'),dim=C('#8a98c4'),pink=C('#ff7fa8');
 for(let i=0;i<60000;i++){const p=r();
  if(p<.13){const rad=Math.abs(g())*2600;const t=r()*TAU;push(rad*Math.cos(t),rad*Math.sin(t),g()*1300,warm.map(c=>c*(.6+.4*r())),1.1)}
  else if(p<.22){const x=g()*6500,y=g()*1700;push(x*Math.cos(barAng)-y*Math.sin(barAng),x*Math.sin(barAng)+y*Math.cos(barAng),g()*700,warm.map(c=>c*(.55+.4*r())),1)}
  else if(p<.78){const rad=6000+44000*Math.pow(r(),.9);const arm=(i%4)*TAU/4;const t=arm+Math.log(rad/6000)*k+g()*.2;const sp=g()*900;const col=r()<.05?pink:blue;
    push(rad*Math.cos(t)+sp*Math.cos(t+1.57),rad*Math.sin(t)+sp*Math.sin(t+1.57),g()*320,col.map(c=>c*(.5+.5*r())),r()<.05?2.2:1)}
  else{const rad=-10000*Math.log(1-r()*.995);if(rad>56000)continue;const t=r()*TAU;push(rad*Math.cos(t),rad*Math.sin(t),g()*650,dim.map(c=>c*(.4+.4*r())),.9)}}
 galPoints(pol,cols,sz)}
/* stars sampled from the NASA map's brightness, so the 3D particles follow the real arms; flat map gives the fine detail */
fetch('data/mw_pts.bin').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>{const f=new Float32Array(b);const n=f.length/7;const pol=new Float32Array(n*3),cols=new Float32Array(n*3),sz=new Float32Array(n);
  for(let i=0;i<n;i++){pol[3*i]=f[7*i];pol[3*i+1]=f[7*i+1];pol[3*i+2]=f[7*i+2];cols[3*i]=f[7*i+3];cols[3*i+1]=f[7*i+4];cols[3*i+2]=f[7*i+5];sz[i]=f[7*i+6]}galPoints(pol,cols,sz)}).catch(galProcedural);
{galPlaneMat=new THREE.ShaderMaterial({uniforms:{uMap:{value:TX('milkyway.jpg')},uOpacity:{value:1}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:LD_V+`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
#include <logdepthbuf_vertex>
}`,
  fragmentShader:LD_F+`uniform sampler2D uMap;uniform float uOpacity;varying vec2 vUv;void main(){
#include <logdepthbuf_fragment>
vec3 c=texture2D(uMap,vUv).rgb;float m=max(c.r,max(c.g,c.b));float a=smoothstep(0.015,0.32,m);gl_FragColor=vec4(c*0.92,a*uOpacity);}`});
 galPlaneMat.userData.base=.96;galPlaneMat.userData.u=true;galL.mats.push(galPlaneMat);
 galPlane=new THREE.Mesh(new THREE.PlaneGeometry(2*GAL_HALF,2*GAL_HALF,1,1),galPlaneMat);galPlane.renderOrder=-1;galL.q.add(galPlane);hdAdd(galPlane,galPlaneMat,'milkyway');
 const core=new THREE.Sprite(reg(galL,new THREE.SpriteMaterial({map:glowTex,color:0xffe2b8,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),.08));core.scale.setScalar(12000);galL.q.add(core)}

/* ---------- Local Group ---------- */
const lgL=layer('lg',LY,A.M_GAL,()=>[0,0,0],s=>win(21.9,24.5,.8,s));
const lbd=(l,b,dist)=>sc(A.sph(l,b),dist);
const LGAL=[
 {id:'Andromeda',cat:'M31',p:lbd(121.17,-21.57,2.5e6),R:105000,N:16000,arms:2,nrm:[.25,-.6,.76],col:'#ffe2bd'},
 {id:'Triangulum',cat:'M33',p:lbd(133.61,-31.33,2.73e6),R:30000,N:3500,arms:2,nrm:[-.3,.4,.87],col:'#cfe0ff'},
 {id:'Awan Magellan Besar',p:lbd(280.47,-32.89,163000),R:7000,N:2400,blob:true,col:'#dfe8ff'},
 {id:'Awan Magellan Kecil',p:lbd(302.8,-44.3,200000),R:3500,N:1200,blob:true,col:'#dfe8ff'}
];
{const pos=[],cols=[],sz=[];const r=rng(88),g=()=>gauss(r);
 for(const G of LGAL){let u=[1,0,0],v=[0,1,0];if(G.nrm){const n=nrm(G.nrm);u=nrm([n[1],-n[0],0]);v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]];G.n3=n}
  const c=C(G.col);for(let i=0;i<G.N;i++){let x,y,z;if(G.blob){x=g()*G.R*.6;y=g()*G.R*.4;z=g()*G.R*.3}else{const p=r();if(p<.2){const rad=Math.abs(g())*G.R*.08;const t=r()*TAU;x=rad*Math.cos(t);y=rad*Math.sin(t);z=g()*G.R*.03}else{const rad=G.R*(.08+.92*Math.pow(r(),.9));const t=(i%G.arms)*TAU/G.arms+Math.log(rad/(G.R*.08))*4.2+g()*.25;x=rad*Math.cos(t);y=rad*Math.sin(t);z=g()*G.R*.012}}
   const w=add(add(sc(u,x),sc(v,y)),G.n3?sc(G.n3,z):[0,0,z]);pos.push(...add(G.p,w));cols.push(...c.map(k=>k*(.5+.5*r())));sz.push(1)}}
 for(let i=0;i<80;i++){const host=i%2?LGAL[0].p:GC_GAL;const dd=(250000+r()*1100000);const z=2*r()-1,t=r()*TAU,q=Math.sqrt(1-z*z);pos.push(host[0]+dd*q*Math.cos(t),host[1]+dd*q*Math.sin(t),host[2]+dd*z);cols.push(.8,.85,1);sz.push(2.2)}
 lgL.q.add(cloud(pos,cols,sz,reg(lgL,pmat(1.5,.4))))}

/* ---------- Laniakea ---------- */
const lanL=layer('lan',MLY,A.M_GAL,()=>[0,0,0],s=>win(24.1,25.8,.8,s));
const CL=[
 {id:'Gugus Virgo',d:54,p:lbd(283.8,74.5,54),sig:3.5,N:1100},{id:'Gugus Hydra',d:160,p:lbd(269.6,26.5,160),sig:6,N:500},{id:'Gugus Centaurus',d:170,p:lbd(302.4,21.6,170),sig:7,N:600},
 {id:'Gugus Norma, dekat Great Attractor',d:220,p:lbd(325.3,-7.3,220),sig:9,N:900},{id:'Supergugus Perseus–Pisces',d:250,p:lbd(150.6,-13.3,240),sig:14,N:900},{id:'Gugus Coma',d:320,p:lbd(58,88,320),sig:9,N:700}
];
{const pos=[],cols=[],sz=[];const r=rng(99),g=()=>gauss(r);const push=(p,c)=>{pos.push(...p);cols.push(...c);sz.push(1)};
 for(const c of CL)for(let i=0;i<c.N;i++)push(add(c.p,[g()*c.sig,g()*c.sig,g()*c.sig]),[.85,.88,1].map(k=>k*(.5+.5*r())));
 const nodes=[[0,0,0],...CL.map(c=>c.p)];for(let i=0;i<22;i++){const rr=60+r()*560,z=2*r()-1,t=r()*TAU,q=Math.sqrt(1-z*z);nodes.push([rr*q*Math.cos(t),rr*q*Math.sin(t),rr*z])}
 for(let i=0;i<nodes.length;i++){const a=nodes[i];const best=nodes.map((b,j)=>[Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),j]).filter(x=>x[1]!==i).sort((x,y)=>x[0]-y[0]).slice(0,2);
   for(const[,j]of best){const b=nodes[j];for(let k=0;k<160;k++)push(add(lerp3(a,b,r()),[g()*7,g()*7,g()*7]),[.7,.78,1].map(x=>x*(.4+.5*r())))}}
 for(let i=0;i<2500;i++){const rr=900*Math.cbrt(r()),z=2*r()-1,t=r()*TAU,q=Math.sqrt(1-z*z);push([rr*q*Math.cos(t),rr*q*Math.sin(t),rr*z],[.55,.6,.8])}
 lanL.q.add(cloud(pos,cols,sz,reg(lanL,pmat(1.6,.6))))}
const LAN_C=sc(CL[3].p,.45);
{const geo=new THREE.IcosahedronGeometry(260,3);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.16*Math.sin(3*Math.atan2(y,x)+.6)+.1*Math.sin(4*z/260+1);p.setXYZ(i,LAN_C[0]+x*f,LAN_C[1]+y*f,LAN_C[2]+z*f*.8)}
 lanL.q.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo),reg(lanL,lineMat(0xfc3d21,.05))))}

/* ---------- cosmic web ---------- */
const webL=layer('web',GLY,A.M_GAL,()=>[0,0,0],s=>win(25.9,99,.9,s));
const OBS=46.5;
{const r=rng(123),N=2600,nodes=[];for(let i=0;i<N;i++){const rr=OBS*.985*Math.cbrt(r()),z=2*r()-1,t=r()*TAU,q=Math.sqrt(1-z*z);nodes.push([rr*q*Math.cos(t),rr*q*Math.sin(t),rr*z])}
 const seg=[];for(let i=0;i<N;i++){const a=nodes[i];const bd=[1e99,1e99,1e99],bj=[-1,-1,-1];for(let j=0;j<N;j++){if(j===i)continue;const b=nodes[j];const q=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(q<bd[2]){let t=2;while(t>0&&q<bd[t-1]){bd[t]=bd[t-1];bj[t]=bj[t-1];t--}bd[t]=q;bj[t]=j}}for(let k=0;k<3;k++){const j=bj[k];if(j>i||k===0)seg.push(...a,...nodes[j])}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(seg,3));webL.q.add(new THREE.LineSegments(g,reg(webL,lineMat(0x7f9cff,.22))));
 webL.q.add(cloud(nodes.flat(),nodes.flatMap(()=>[.9,.93,1]),null,reg(webL,pmat(2,.9))));
 const cmb=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:LD_V+`varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*normal);vF=pow(1.0-abs(dot(n,normalize(-mv.xyz))),2.5);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:LD_F+`varying float vF;uniform float uOpacity;void main(){
#include <logdepthbuf_fragment>
gl_FragColor=vec4(1.0,0.5,0.3,(0.05+vF*0.75)*uOpacity);}`});
 cmb.userData.base=1;cmb.userData.u=true;webL.mats.push(cmb);webL.q.add(new THREE.Mesh(new THREE.SphereGeometry(OBS,64,40),cmb))}

