(()=>{
if(!window.THREE||!THREE.EffectComposer){document.body.insertAdjacentHTML('beforeend','<div class="err">Library 3D gagal dimuat / 3D library failed to load.</div>');return}
const A=window.ASTRO, CT=window.CONTENT, C2=window.CONTENT2, {DEG,AU,LY}=A, TAU=Math.PI*2, KM=1e3, MLY=1e6*LY, GLY=1e9*LY;
const S_MIN=6.8,S_MAX=27.25;
const $=id=>document.getElementById(id);
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const win=(a,b,f,x)=>ss(a-f,a,x)*(1-ss(b,b+f,x));
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R0=rng(2026);
const gauss=(r=R0)=>{let u=0;while(!u)u=r();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*r())};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], sc=(a,k)=>[a[0]*k,a[1]*k,a[2]*k], len=a=>Math.hypot(a[0],a[1],a[2]), nrm=a=>sc(a,1/(len(a)||1)), lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const eclT=v=>A.mv(A.M_ECL,v), eqT=v=>A.mv(A.M_EQ,v), galT=v=>A.mv(A.M_GAL,v);
const RATE=[[6.8,3.6],[7.3,3.86],[9.1,5.37],[11.85,6.32],[13.15,7.58],[13.9,8.0],[15.4,10.0],[16.55,12.4],[18.0,10.0],[19.6,11.5],[21.2,14.55],[27.3,14.55]];
const autoRate=s=>{for(let i=1;i<RATE.length;i++)if(s<=RATE[i][0]){const[a,b]=[RATE[i-1],RATE[i]];return Math.pow(10,a[1]+(b[1]-a[1])*(s-a[0])/(b[0]-a[0]))}return Math.pow(10,RATE[RATE.length-1][1])};

/* ================= language & content ================= */
let lang='id';try{const v=localStorage.getItem('tk3d-lang');if(v==='en'||v==='id')lang=v}catch(e){}
const U=()=>CT.UI[lang], U2=()=>C2.UI2[lang];
const nm=id=>lang==='en'?(CT.NAMES[id]||C2.NAMES_EN[id]||window.EXTRAS.NAMES_EN[id]||id):(window.EXTRAS.NAMES_ID[id]||id);
const nf=(v,dg)=>v.toLocaleString(U().locale,{maximumFractionDigits:dg});

/* ================= renderer + bloom ================= */
const cv=$('gl'),ov=$('ov'),octx=ov.getContext('2d');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'})}catch(e){document.body.insertAdjacentHTML('beforeend','<div class="err">WebGL tidak tersedia / WebGL is not available.</div>');return}
renderer.setClearColor(0x05060a,1);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,0.0004,4000);
const controls=new THREE.OrbitControls(camera,cv);
controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.08;controls.rotateSpeed=.55;
camera.position.set(0,.42,1).normalize();
const root=new THREE.Group();scene.add(root);
scene.add(new THREE.AmbientLight(0xffffff,.06));
const composer=new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene,camera));
const bloom=new THREE.UnrealBloomPass(new THREE.Vector2(256,256),.8,.55,.6);
composer.addPass(bloom);
let W=0,H=0,DPR=1,D=1;
const PMATS=[];
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(DPR);renderer.setSize(W,H,false);composer.setPixelRatio(DPR);composer.setSize(W,H);
  ov.width=W*DPR;ov.height=H*DPR;octx.setTransform(DPR,0,0,DPR,0,0);
  camera.aspect=W/H;camera.updateProjectionMatrix();D=Math.max(1,H/W)*.5/Math.tan(25*DEG)*1.05;const dir=camera.position.clone().normalize();camera.position.copy(dir.multiplyScalar(D));controls.minDistance=controls.maxDistance=D;
  for(const m of PMATS)m.uniforms.uDPR.value=DPR}

const loader=new THREE.TextureLoader();
const TX=n=>{const t=loader.load('tex/'+n);t.anisotropy=4;return t};
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.18,'rgba(255,236,200,.6)');r.addColorStop(.5,'rgba(255,190,110,.12)');r.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();

/* ================= shaders ================= */
const LD_V='#include <common>\n#include <logdepthbuf_pars_vertex>\n', LD_F='#include <common>\n#include <logdepthbuf_pars_fragment>\n';
const VS_PTS=LD_V+`attribute vec3 aColor;attribute float aSize;varying vec3 vC;uniform float uSize,uDPR;
void main(){vC=aColor;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*aSize*uDPR;
#include <logdepthbuf_vertex>
}`;
const VS_GAL=LD_V+`attribute vec3 aColor;attribute vec3 aPol;attribute float aSize;varying vec3 vC;uniform float uSize,uDPR,uTime,uTd,uMode;
void main(){vC=aColor;float r=aPol.x;float v=7.672e-4*r/sqrt(r*r+9.0e6);float wd=v/max(r,1.0);
 float ws=7.672e-4/sqrt(26700.0*26700.0+9.0e6);float th=aPol.y-ws*uTime-(wd-ws)*uTd*uMode;
 vec3 p=vec3(r*cos(th),r*sin(th),aPol.z);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*aSize*uDPR;
#include <logdepthbuf_vertex>
}`;
const FS_PTS=LD_F+`varying vec3 vC;uniform float uOpacity;
void main(){
#include <logdepthbuf_fragment>
vec2 q=gl_PointCoord-0.5;float d=length(q);if(d>0.5)discard;float a=smoothstep(0.5,0.0,d);gl_FragColor=vec4(vC,a*uOpacity);}`;
const VS_STAR=LD_V+`attribute vec3 aColor;attribute float aSize;attribute float aSpike;attribute vec3 aDir;uniform float uSize,uDPR,uMorph,uR;varying vec3 vC;varying float vSp;
void main(){vC=aColor;vSp=aSpike;vec3 p=mix(position,aDir*uR,uMorph);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*aSize*uDPR*(1.0+aSpike*7.0);
#include <logdepthbuf_vertex>
}`;
const FS_STAR=LD_F+`varying vec3 vC;varying float vSp;uniform float uOpacity;
void main(){
#include <logdepthbuf_fragment>
vec2 q=(gl_PointCoord-0.5)*2.0;float r=length(q);float k=1.0+vSp*7.0;float rc=r*k;float a=exp(-rc*rc*2.2);
if(vSp>0.0){float sp=0.0;for(int i=0;i<3;i++){float an=1.5708+float(i)*1.0472;vec2 d=vec2(cos(an),sin(an));float al=abs(dot(q,d));float ac=abs(dot(q,vec2(-d.y,d.x)))*k;sp+=exp(-ac*ac*5.0)*pow(max(1.0-al,0.0),2.2);}
 float h=abs(q.y)*k;sp+=0.3*exp(-h*h*5.0)*pow(max(1.0-abs(q.x),0.0),3.0);a+=vSp*sp*0.85;}
if(a<0.004)discard;gl_FragColor=vec4(vC,min(a,1.0)*uOpacity);}`;
const VS_LINE=LD_V+`attribute vec3 aDir;uniform float uMorph,uR;void main(){vec3 p=mix(position,aDir*uR,uMorph);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
#include <logdepthbuf_vertex>
}`;
const FS_LINE=LD_F+`uniform vec3 uColor;uniform float uOpacity;void main(){
#include <logdepthbuf_fragment>
gl_FragColor=vec4(uColor,uOpacity);}`;
function pmat(size,opacity,vs=VS_PTS,fs=FS_PTS,extra={}){const m=new THREE.ShaderMaterial({uniforms:Object.assign({uSize:{value:size},uDPR:{value:DPR},uOpacity:{value:opacity},uTime:{value:0},uTd:{value:0},uMode:{value:0},uMorph:{value:0},uR:{value:1}},extra),vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});m.userData.base=opacity;m.userData.u=true;PMATS.push(m);return m}
function cloud(pos,cols,sizes,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',pos instanceof Float32Array?new THREE.BufferAttribute(pos,3):new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aColor',new THREE.Float32BufferAttribute(cols,3));
  g.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes||new Array(pos.length/3).fill(1),1));const p=new THREE.Points(g,mat);p.frustumCulled=false;return p}
function lineMat(color,opacity){const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});m.userData.base=opacity;return m}
const C=h=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]};

/* ================= layers ================= */
const layers=[];
function layer(name,unit,frameM,originFn,winFn){const g=new THREE.Group();const q=new THREE.Group();
  const m4=new THREE.Matrix4().set(frameM[0][0],frameM[0][1],frameM[0][2],0,frameM[1][0],frameM[1][1],frameM[1][2],0,frameM[2][0],frameM[2][1],frameM[2][2],0,0,0,0,1);
  q.quaternion.setFromRotationMatrix(m4);g.add(q);root.add(g);const L={name,unit,g,q,originFn,winFn,mats:[],alpha:0};layers.push(L);return L}
function reg(L,mat,base){if(base!==undefined)mat.userData.base=base;if(mat.userData.base===undefined)mat.userData.base=mat.opacity??1;L.mats.push(mat);return mat}

/* ================= time ================= */
const nowD=()=>(Date.now()-A.J2000)/864e5;
let d=nowD(),paused=false,realtime=false,mulLog=0;
const yrs=()=>d/365.25;
const dayOf=iso=>(Date.parse(iso)-A.J2000)/864e5;

/* ================= solar system data ================= */
const POS={};
const PL=['Merkurius','Venus','Bumi','Mars','Jupiter','Saturnus','Uranus','Neptunus','Pluto'];
const PCOL={Merkurius:'#bdb5aa',Venus:'#ead29e',Bumi:'#7fb6ff',Mars:'#ff8a5c',Jupiter:'#e3c29a',Saturnus:'#ecd9a2',Uranus:'#a2dbe3',Neptunus:'#7c9cff',Pluto:'#d2c0a8'};
const GC_GAL=[26700,0,0];const GC=sc(galT(GC_GAL),LY);
const PHYS={
 Matahari:{r:695700,rot:609.12,pole:[286.13,63.87]},Merkurius:{r:2439.7,rot:1407.6,pole:[281.01,61.42],tex:'mercury.jpg'},Venus:{r:6051.8,rot:-5832.5,pole:[272.76,67.16],tex:'venus.jpg'},
 Bumi:{r:6371.0,rot:23.9345,pole:[0,90]},Mars:{r:3389.5,rot:24.6229,pole:[317.68,52.89],tex:'mars.jpg'},Jupiter:{r:69911,rot:9.925,pole:[268.06,64.50],obl:.06487,tex:'jupiter.jpg'},
 Saturnus:{r:58232,rot:10.656,pole:[40.59,83.54],obl:.09796,tex:'saturn.jpg'},Uranus:{r:25362,rot:-17.24,pole:[257.31,-15.18],obl:.0229,tex:'uranus.jpg'},
 Neptunus:{r:24622,rot:16.11,pole:[299.36,43.46],obl:.0171,tex:'neptune.jpg'},Pluto:{r:1188.3,rot:-153.29,pole:[132.99,-6.16],col:'#cdb79c'},Bulan:{r:1737.4}
};
const FOCUS_S={Bulan:6.95,Matahari:9.45,Merkurius:7.3,Venus:7.6,Bumi:7.3,Mars:7.9,Jupiter:9.7,Saturnus:9.95,Uranus:9.35,Neptunus:9.0,Pluto:8.35};
const MAXA={Bumi:1.6e6,Mars:23463,Jupiter:2.45e7,Saturnus:2.7e7,Uranus:2.05e7,Neptunus:5.1e7,Pluto:64738};
function poleBasis(name){const p=PHYS[name].pole;const Y=A.eqToEcl(A.sph(p[0],p[1]));let X;
  if(name==='Bumi')X=[1,0,0];else{X=[-Y[1],Y[0],0];const n=Math.hypot(...X);X=n<1e-6?[1,0,0]:sc(X,1/n)}
  const Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]];
  return new THREE.Matrix4().set(X[0],Y[0],Z[0],0,X[1],Y[1],Z[1],0,X[2],Y[2],Z[2],0,0,0,0,1)}

/* ---------- Sun ---------- */
const sunL=layer('sun',KM,A.M_ECL,()=>[0,0,0],s=>win(-9,17.2,.8,s));
const light=new THREE.PointLight(0xfff4e6,1.25,0,0);sunL.q.add(light);
const sunSpin=new THREE.Group();sunSpin.quaternion.setFromRotationMatrix(poleBasis('Matahari'));sunL.q.add(sunSpin);
const NOISE_GL=`float hash3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vnoise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
const sunMat=new THREE.ShaderMaterial({uniforms:{uMap:{value:TX('sun.jpg')},uTime:{value:0},uOpacity:{value:1}},transparent:true,
 vertexShader:LD_V+`varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vUv=uv;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+NOISE_GL+`uniform sampler2D uMap;uniform float uTime,uOpacity;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){
#include <logdepthbuf_fragment>
float mu=max(dot(normalize(vN),normalize(vV)),0.0);vec3 p=normalize(vP);
float g=vnoise(p*70.0+vec3(0.0,0.0,uTime*0.12))*0.55+vnoise(p*170.0-vec3(uTime*0.2))*0.3+vnoise(p*9.0+uTime*0.01)*0.15;
vec3 tex=texture2D(uMap,vUv).rgb;vec3 col=tex*(0.7+0.6*g);
float limb=0.38+0.62*pow(mu,0.55);col*=limb*vec3(1.6,1.32,1.0);
col+=vec3(1.0,0.5,0.12)*pow(1.0-mu,4.0)*0.5;
gl_FragColor=vec4(col,uOpacity);}`});
sunMat.userData.base=1;sunMat.userData.u=true;sunL.mats.push(sunMat);

const sunMesh=new THREE.Mesh(new THREE.SphereGeometry(PHYS.Matahari.r,64,40),sunMat);sunSpin.add(sunMesh);
{const spr=new THREE.Sprite(reg(sunL,new THREE.SpriteMaterial({map:glowTex,color:0xffd08a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),.95));spr.scale.setScalar(PHYS.Matahari.r*7);sunL.q.add(spr)}

/* ---------- planets ---------- */
const bodies={};
function planetLayer(name){const maxA=Math.max(PHYS[name].r*6,MAXA[name]||0);const top=Math.log10(maxA*KM*2)+1.4;
  const L=layer(name,KM,A.M_ECL,()=>POS[name],s=>win(-9,top,.8,s));L.top=top;bodies[name]=L;return L}
const earthMat=new THREE.ShaderMaterial({uniforms:{uDay:{value:TX('earth_day.jpg')},uNight:{value:TX('earth_night.jpg')},uSpec:{value:TX('earth_spec.jpg')},uSun:{value:new THREE.Vector3(1,0,0)},uOpacity:{value:1}},transparent:true,
 vertexShader:LD_V+`varying vec2 vUv;varying vec3 vN;varying vec3 vP;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform sampler2D uDay,uNight,uSpec;uniform vec3 uSun;uniform float uOpacity;varying vec2 vUv;varying vec3 vN;varying vec3 vP;
void main(){
#include <logdepthbuf_fragment>
vec3 n=normalize(vN);vec3 L=normalize(uSun);float ndl=dot(n,L);vec3 V=normalize(cameraPosition-vP);
vec3 day=texture2D(uDay,vUv).rgb;vec3 night=texture2D(uNight,vUv).rgb;float spm=texture2D(uSpec,vUv).r;
float dayK=smoothstep(-0.10,0.22,ndl);vec3 Hh=normalize(L+V);float spec=pow(max(dot(n,Hh),0.0),60.0)*spm*0.5*dayK;
vec3 col=day*(0.015+0.92*pow(max(ndl,0.0),0.9))+spec*vec3(1.0,0.93,0.8)+night*vec3(1.0,0.8,0.5)*1.5*(1.0-dayK);
float rim=pow(1.0-max(dot(n,V),0.0),3.0);col+=vec3(0.32,0.58,1.0)*rim*0.7*smoothstep(-0.25,0.5,ndl);
gl_FragColor=vec4(col,uOpacity);}`});
earthMat.userData.base=1;earthMat.userData.u=true;
const atmoMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,
 vertexShader:LD_V+`varying float vI;void main(){vec3 n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vI=pow(max(0.0,-dot(n,normalize(-mv.xyz))),1.2)*2.6;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform float uOpacity;varying float vI;void main(){
#include <logdepthbuf_fragment>
gl_FragColor=vec4(0.35,0.62,1.0,min(vI,1.0)*uOpacity);}`});
atmoMat.userData.base=1;atmoMat.userData.u=true;
const ringMat=new THREE.ShaderMaterial({uniforms:{uTex:{value:TX('saturn_ring.png')},uOpacity:{value:1}},transparent:true,side:THREE.DoubleSide,depthWrite:false,
 vertexShader:LD_V+`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform sampler2D uTex;uniform float uOpacity;varying vec2 vP;void main(){
#include <logdepthbuf_fragment>
float r=length(vP);float u=(r-74500.0)/(140220.0-74500.0);if(u<0.0||u>1.0)discard;vec4 t=texture2D(uTex,vec2(u,0.5));gl_FragColor=vec4(t.rgb*0.95,t.a*uOpacity);}`});
ringMat.userData.base=1;ringMat.userData.u=true;
const moonTex=TX('moon.jpg');
const moonMat=(spec,L)=>reg(L,spec.endsWith('.jpg')?new THREE.MeshLambertMaterial({map:TX(spec),transparent:true}):new THREE.MeshLambertMaterial({color:spec,transparent:true}),1);
for(const name of PL){const L=planetLayer(name);const ph=PHYS[name];
  const eq=new THREE.Group();eq.quaternion.setFromRotationMatrix(poleBasis(name));L.q.add(eq);L.eq=eq;
  let mat;if(name==='Bumi'){mat=earthMat;L.mats.push(earthMat)}else mat=reg(L,ph.tex?new THREE.MeshLambertMaterial({map:TX(ph.tex),transparent:true}):new THREE.MeshLambertMaterial({color:ph.col,transparent:true}),1);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(ph.r,96,64),mat);mesh.scale.y=1-(ph.obl||0);eq.add(mesh);L.mesh=mesh;
  if(name==='Bumi'){const cl=new THREE.Mesh(new THREE.SphereGeometry(ph.r*1.008,96,64),reg(L,new THREE.MeshLambertMaterial({color:0xffffff,alphaMap:TX('earth_clouds.jpg'),transparent:true,depthWrite:false}),.75));mesh.add(cl);L.clouds=cl;
    const atm=new THREE.Mesh(new THREE.SphereGeometry(ph.r*1.045,64,40),atmoMat);L.mats.push(atmoMat);L.q.add(atm);
    L.moonPivot=new THREE.Group();L.q.add(L.moonPivot);const mm=new THREE.Mesh(new THREE.SphereGeometry(1737.4,64,40),reg(L,new THREE.MeshLambertMaterial({map:moonTex,transparent:true}),1));mm.rotation.y=-Math.PI/2;L.moonPivot.add(mm);L.moon=mm;
    const pts=[];for(let k=0;k<=256;k++)pts.push(...A.moonEcl(k/256*27.321661));const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));L.q.add(new THREE.Line(og,reg(L,lineMat(0x9cb4d8,.3))))}
  if(name==='Saturnus'){const ring=new THREE.Mesh(new THREE.RingGeometry(74500,140220,192,1),ringMat);L.mats.push(ringMat);ring.rotation.x=-Math.PI/2;eq.add(ring)}
  L.moons=[];
  for(const m of []){const[mn,a,P,r,spec,inc]=m;const orb=new THREE.Group();if(inc)orb.rotation.x=inc*DEG;eq.add(orb);
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),moonMat(spec,L));orb.add(mesh);
    const pts=[];for(let k=0;k<=128;k++){const t=k/128*TAU;pts.push(a*Math.cos(t),0,-a*Math.sin(t))}
    const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));orb.add(new THREE.Line(og,reg(L,lineMat(0x9cb4d8,.25))));
    L.moons.push({name:mn,a,P,r,mesh,ph:0})}
}

/* ---------- all known moons (data-driven: JPL mean elements + Wikipedia tables) ---------- */
const MK=window.MOONKIT;for(const k in MK.BODY)CT.BODY[k]=MK.BODY[k];
const MOONMAP={};const MOONLIST=[];
const MOONTEX={Io:'io.jpg',Europa:'europa.jpg',Ganymede:'ganymede.jpg',Callisto:'callisto.jpg',Titan:'titan.jpg',Triton:'triton.jpg'};
const MOONCOL={Enceladus:'#f2f6fa',Mimas:'#c9c6c0',Tethys:'#e6e4df',Dione:'#d9d6d0',Rhea:'#cdc8c0',Iapetus:'#a89a82',Hyperion:'#c2a98a',Phoebe:'#5d5650',Miranda:'#bdbab4',Ariel:'#c9c5bf',Umbriel:'#8a8680',Titania:'#bdb2a6',Oberon:'#a99d92',Charon:'#a59c94',Proteus:'#7d7872',Nereid:'#9a958f',Amalthea:'#b5634a',Phobos:'#8a8178',Deimos:'#9b9084',Janus:'#bdb7ad',Epimetheus:'#bdb7ad',Puck:'#7f7a74',Sycorax:'#a37c66',Himalia:'#8f877d'};
function moonLocal(m,days,Efix){let E;if(Efix!==undefined&&Efix!==null)E=Efix;else{const M=m.M0+TAU*((days/m.P)%1);E=A.kepler(((M%TAU)+TAU+Math.PI)%TAU-Math.PI,m.e)}
  const xp=m.a*(Math.cos(E)-m.e),yp=m.a*Math.sqrt(1-m.e*m.e)*Math.sin(E);const B=m.B;return[B[0]*xp+B[3]*yp,B[2]*xp+B[5]*yp,-(B[1]*xp+B[4]*yp)]}
function buildMoons(rows){for(const r of rows){const[pl,name,a,e,i,O,w,M0,P,rad,yr,g]=r;const L=bodies[pl];if(!L)continue;
    const m={pl,name,a,e,i,O,w,M0:M0*DEG,P,r:rad,yr,g,B:A.basis(w*DEG,O*DEG,i*DEG),L,loc:[0,0,0]};MOONMAP[name]=m;MOONLIST.push(m);(L.ml||(L.ml=[])).push(m)}
  for(const pl of Object.keys(MAXA)){const L=bodies[pl];if(!L||!L.ml)continue;L.qc=L.q.quaternion.clone().multiply(L.eq.quaternion);
    const sp=[],scol=[],segs=[],segsIn=[];L.small=[];
    for(const m of L.ml){const big=m.r>=40||!!MOONTEX[m.name];const n=big?160:64;const pts=[];for(let k=0;k<=n;k++)pts.push(moonLocal(m,0,k/n*TAU));
      if(big){const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));m.lmat=reg(L,lineMat(0x9cb4d8,m.i>90?.2:.28));L.eq.add(new THREE.Line(og,m.lmat));
        const tex=MOONTEX[m.name];const mat=tex?new THREE.MeshLambertMaterial({map:TX(tex),transparent:true}):new THREE.MeshLambertMaterial({map:moonTex,color:new THREE.Color(MOONCOL[m.name]||'#b9b3aa'),transparent:true});
        m.mesh=new THREE.Mesh(new THREE.SphereGeometry(m.r,m.r>500?48:24,m.r>500?32:16),reg(L,mat,1));if(m.name==='Hyperion')m.mesh.scale.set(1.3,.85,1);L.eq.add(m.mesh)}
      else{m.si=L.small.length;L.small.push(m);sp.push(0,0,0);scol.push(...(m.i>90?[1,.66,.52]:[.7,.86,1]));const arr=m.a>3e6?segs:segsIn;for(let k=0;k<n;k++)arr.push(...pts[k],...pts[k+1]);if(m.a>3e6)L.outerMinA=Math.min(L.outerMinA||1e12,m.a*(1-m.e))}}
    L.sysA=Math.max(...L.ml.map(m=>m.a));if(L.small.length){L.smallPos=new Float32Array(sp);L.smallMat=reg(L,pmat(1.8,.9));const pc=cloud(L.smallPos,scol,new Array(L.small.length).fill(1),L.smallMat);L.smallAttr=pc.geometry.attributes.position;L.eq.add(pc);
      for(const[arr,op,outer]of[[segs,.08,true],[segsIn,.16,false]]){if(!arr.length)continue;const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const mt=reg(L,lineMat(0x8fa6c8,op));if(outer)L.outerMat=mt;else L.inMat=mt;const LS=new THREE.LineSegments(sg,mt);LS.frustumCulled=false;L.eq.add(LS)}}}}
function updateMoonsOf(L,days){if(!L.ml)return;const ppm=pxPerM();const sysPx=L.sysA*KM*ppm;
  if(L.smallMat)L.smallMat.userData.base=.9*ss(60,220,sysPx);
  if(L.outerMat){const lo=Math.log10(L.outerMinA*KM);L.outerMat.userData.base=.08*ss(lo-.9,lo-.2,s)*ss(80,260,sysPx)}
  for(const m of L.ml)if(m.lmat)m.lmat.userData.base=(m.i>90?.2:.28)*ss(10,40,m.a*KM*ppm);
  if(L.inMat)L.inMat.userData.base=.16*ss(20,60,3e5*KM*ppm);for(const m of L.ml){const p=moonLocal(m,days);m.loc=p;if(m.mesh){m.mesh.position.set(p[0],p[1],p[2]);m.mesh.rotation.y=Math.atan2(p[0],p[2])}else{L.smallPos[3*m.si]=p[0];L.smallPos[3*m.si+1]=p[1];L.smallPos[3*m.si+2]=p[2]}}if(L.smallAttr)L.smallAttr.needsUpdate=true}
const _mv=new THREE.Vector3();
function moonWorld(m){const p=moonLocal(m,d);_mv.set(p[0],p[1],p[2]).applyQuaternion(m.L.qc||m.L.q.quaternion).multiplyScalar(KM);return add(POS[m.pl],[_mv.x,_mv.y,_mv.z])}
fetch('data/moons.json').then(r=>r.json()).then(buildMoons).catch(()=>{});
/* ---------- spacecraft around Earth (illustrative phases) + JWST at L2 ---------- */
const ESAT=(()=>{const L=bodies.Bumi;const g=new THREE.Group();L.eq.add(g);const R=6371;const list=[];
  const addS=(id,r,inc,node,P,ph)=>list.push({id,r,inc:inc*DEG,node:node*DEG,P,ph});
  addS('ISS',R+420,51.64,40,92.9/1440,0);addS('Hubble',R+535,28.47,160,95.4/1440,2.1);
  for(let p=0;p<6;p++)for(let k=0;k<4;k++)addS('GPS',26560,55,p*60,.49863,k*TAU/4+p*.5);
  for(let k=0;k<72;k++)addS('GEO',42164,.05,0,.99727,k*TAU/72+(R0()-.5)*.06);
  const _q=new THREE.Quaternion(),_e=new THREE.Euler();
  const loc=(o,t)=>{const v=new THREE.Vector3(o.r*Math.cos(t),0,-o.r*Math.sin(t));v.applyAxisAngle(new THREE.Vector3(1,0,0),o.inc);v.applyAxisAngle(new THREE.Vector3(0,1,0),o.node);return v};
  const pos=new Float32Array(list.length*3),cols=[];for(const o of list){const c=o.id==='ISS'||o.id==='Hubble'?[1,.75,.55]:o.id==='GPS'?[.6,1,.75]:[1,.62,.42];cols.push(...c)}
  const mat=reg(L,pmat(2.0,.95));const P=cloud(pos,cols,list.map(o=>o.id==='GEO'?.7:1),mat);g.add(P);
  const mk=(r,inc,node,op,col)=>{const pts=[];for(let k=0;k<=128;k++)pts.push(...loc({r,inc,node},k/128*TAU).toArray());const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const m=reg(L,lineMat(col,op));g.add(new THREE.Line(gg,m));return m};
  const lines={ISS:mk(R+420,51.64*DEG,40*DEG,.35,0xffb48a),Hubble:mk(R+535,28.47*DEG,160*DEG,.35,0xffb48a),GEO:mk(42164,0,0,.18,0xff9f6e)};lines.GPS=[];for(let p=0;p<6;p++)lines.GPS.push(mk(26560,55*DEG,p*60*DEG,.1,0x9cf0b8));
  /* JWST halo around Sun–Earth L2 (ecliptic frame) */
  const l2=new THREE.Group();L.q.add(l2);const halo=[];for(let k=0;k<=128;k++){const t=k/128*TAU;halo.push(8e5*Math.cos(t),2.6e5*Math.sin(t),0)}const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(halo,3));const hmat=reg(L,lineMat(0xffd27a,.35));l2.add(new THREE.Line(hg,hmat));
  const jw=new THREE.Mesh(new THREE.SphereGeometry(4e3,8,6),reg(L,new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true}),1));l2.add(jw);
  let jwEcl=[0,0,0];
  function update(){if(!L.g.visible)return;const ppm=pxPerM();list.forEach((o,i)=>{const v=loc(o,o.ph+TAU*((d/o.P)%1));pos[3*i]=v.x;pos[3*i+1]=v.y;pos[3*i+2]=v.z;o.v=v});P.geometry.attributes.position.needsUpdate=true;
    mat.userData.base=.95*ss(6,30,26560*KM*ppm);lines.ISS.userData.base=lines.Hubble.userData.base=.35*ss(25,70,(R+500)*KM*ppm)*(1-ss(W*.8,W*2,(R+500)*KM*ppm));lines.GEO.userData.base=.18*ss(12,40,42164*KM*ppm);for(const m of lines.GPS)m.userData.base=.1*ss(12,40,26560*KM*ppm);
    const E=A.planetEcl('Bumi',d);const u=nrm(E);const e1=nrm([-u[1],u[0],0]);const e2=[u[1]*e1[2]-u[2]*e1[1],u[2]*e1[0]-u[0]*e1[2],u[0]*e1[1]-u[1]*e1[0]];
    l2.position.set(u[0]*1.5e6,u[1]*1.5e6,u[2]*1.5e6);l2.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...e1),new THREE.Vector3(...e2),new THREE.Vector3(...u)));
    const th=TAU*((d/182)%1);jw.position.set(8e5*Math.cos(th),2.6e5*Math.sin(th),0);const wv=add(sc(e1,8e5*Math.cos(th)),sc(e2,2.6e5*Math.sin(th)));jwEcl=add(sc(u,1.5e6),wv);hmat.userData.base=.35*ss(15,50,8e5*KM*ppm)}
  function jwst(){return add(POS.Bumi,sc(eclT(jwEcl),KM))}
  function draw(){if(!L.g.visible||!CAT_ON.craft||L.alpha<.05)return;const ppm=pxPerM();L.eq.updateMatrixWorld();
    const lab=(o,id,a,txt)=>{if(!o.v||a<.04)return;_w.copy(o.v).applyMatrix4(L.eq.matrixWorld);const q=projW(_w);if(!q)return;label(q,txt||nm(id),a,'#ffb48a',7,-6,11,id,600)};
    const aL=ss(40,90,(R+500)*KM*ppm)*(1-ss(W,W*2.2,(R+500)*KM*ppm))*L.alpha;lab(list[0],'ISS',aL,'ISS');lab(list[1],'Hubble',aL,'Hubble');
    lab(list.find(o=>o.id==='GPS'),'GPS',ss(30,90,26560*KM*ppm)*(1-ss(W,W*2.5,26560*KM*ppm))*L.alpha);lab(list.find(o=>o.id==='GEO'),'GEO',ss(30,90,42164*KM*ppm)*(1-ss(W*1.2,W*3,42164*KM*ppm))*L.alpha);
    const jp=proj(jwst());const aj=(focus==='JWST'?1:ss(25,70,1.5e9*ppm)*(1-ss(W*1.5,W*4,1.5e9*ppm)))*L.alpha;if(jp&&aj>.04){dot(jp,1.6,'#ffd27a',aj);BODYPX.push(['JWST',jp[0],jp[1]]);label(jp,'JWST (L2)',aj,'#ffd27a',8,-7,12,'JWST',700)}}
  return{g,update,draw,jwst}})();


/* ---------- solar system layer (AU, ecliptic) ---------- */
const solL=layer('solar',AU,A.M_ECL,()=>[0,0,0],s=>win(10.1,15.6,.8,s));
for(const n of PL){const pts=A.orbitPts(n,360);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));solL.q.add(new THREE.Line(g,reg(solL,lineMat(new THREE.Color(PCOL[n]).multiplyScalar(.7),n==='Pluto'?.25:.4))))}
function bodySet(n){return{n,a:new Float64Array(n),e:new Float64Array(n),M0:new Float64Array(n),nm:new Float64Array(n),B:new Float64Array(n*6),pos:new Float32Array(n*3)}}
function setBody(S,k,a,e,i,O,w,M0){S.a[k]=a;S.e[k]=e;S.M0[k]=M0;S.nm[k]=TAU/(365.25*Math.pow(a,1.5));S.B.set(A.basis(w,O,i),k*6)}
function propagate(S,d){const{a,e,M0,nm,B,pos}=S;for(let k=0;k<S.n;k++){const M=(M0[k]+nm[k]*d)%TAU;const E=A.kepler(M>Math.PI?M-TAU:M,e[k]);const xp=a[k]*(Math.cos(E)-e[k]),yp=a[k]*Math.sqrt(1-e[k]*e[k])*Math.sin(E);const b=k*6;
  pos[3*k]=B[b]*xp+B[b+3]*yp;pos[3*k+1]=B[b+1]*xp+B[b+4]*yp;pos[3*k+2]=B[b+2]*xp+B[b+5]*yp}}
const rayleigh=sig=>sig*Math.sqrt(-2*Math.log(1-R0()*0.999));
const KIRK=[2.502,2.825,2.958,3.279];
const AST=bodySet(5200);
for(let k=0;k<AST.n;k++){let a;do{a=2.1+R0()*1.2}while(KIRK.some(g=>Math.abs(a-g)<(g===3.279?.03:.018)));setBody(AST,k,a,Math.min(.35,rayleigh(.11)),rayleigh(7)*DEG,R0()*TAU,R0()*TAU,R0()*TAU)}
const TRO=bodySet(900);
{const[j]=A.EL.Jupiter;const LJ=j[3]*DEG;for(let k=0;k<TRO.n;k++){const side=k%2?1:-1;const O=R0()*TAU,w=R0()*TAU;const lam=LJ+side*60*DEG+gauss()*12*DEG;setBody(TRO,k,5.2029+gauss()*.04,Math.min(.15,rayleigh(.05)),rayleigh(11)*DEG,O,w,lam-O-w)}}
const KBO=bodySet(3600);
for(let k=0;k<KBO.n;k++){const p=R0();let a,e,i;if(p<.25){a=39.4+gauss()*.15;e=.1+R0()*.2;i=rayleigh(10)}else if(p<.7){a=42+R0()*5;e=R0()*.08;i=rayleigh(2.5)}else{a=40+R0()*50;e=R0()*.45;i=rayleigh(16);if(a*(1-e)<30)e=1-30/a}
  setBody(KBO,k,a,e,i*DEG,R0()*TAU,R0()*TAU,R0()*TAU)}
function smallCloud(S,L,col,size,op){const cols=[],c=C(col);for(let k=0;k<S.n;k++){const v=.6+.4*R0();cols.push(c[0]*v,c[1]*v,c[2]*v)}const p=cloud(S.pos,cols,null,reg(L,pmat(size,op)));S.attr=p.geometry.attributes.position;L.q.add(p);return p}
smallCloud(AST,solL,'#cbb79a',1.6,.75);smallCloud(TRO,solL,'#9fd28a',1.8,.85);smallCloud(KBO,solL,'#a9c4ef',1.6,.7);
const helioMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:LD_V+`varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*normal);vF=pow(1.0-abs(dot(n,normalize(-mv.xyz))),3.0);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:LD_F+`varying float vF;uniform float uOpacity;void main(){
#include <logdepthbuf_fragment>
gl_FragColor=vec4(0.45,0.65,1.0,vF*0.55*uOpacity);}`});
helioMat.userData.base=1;helioMat.userData.u=true;solL.mats.push(helioMat);
solL.q.add(new THREE.Mesh(new THREE.SphereGeometry(120,64,40),helioMat));
const V1DIR=A.eqToEcl(A.sph(257.5,12.0));

/* ---------- comets & near-Earth asteroids ---------- */
const GK=0.01720209895;
function keplerH(M,e){let H=Math.asinh(M/e);for(let k=0;k<40;k++){const dH=(e*Math.sinh(H)-H-M)/(e*Math.cosh(H)-1);H-=dH;if(Math.abs(dH)<1e-12)break}return H}
const SB=[];const SBPOS={};
for(const[id,o]of Object.entries(C2.NEW)){if(!o.p.orbit)continue;const el=o.p.orbit;const e=el.e;const a=el.a!==undefined?el.a:el.q/(1-e);
  const S={id,cat:o.cat,e,a,B:A.basis(el.w*DEG,el.O*DEG,el.i*DEG),n:GK/Math.pow(Math.abs(a),1.5),comet:id.startsWith('Komet')||id.startsWith('3I')};
  if(el.Tp){S.t0=dayOf(el.Tp);S.M0=0}else{S.t0=dayOf(el.near);const E0=sc(eclT(A.planetEcl('Bumi',S.t0)),1);let best=1e9,bm=0;
    for(let k=0;k<3600;k++){const M=k/3600*TAU;const p=sbLocal(S,M);const dd=Math.hypot(p[0]-A.planetEcl('Bumi',S.t0)[0],p[1]-A.planetEcl('Bumi',S.t0)[1],p[2]-A.planetEcl('Bumi',S.t0)[2]);if(dd<best){best=dd;bm=M}}S.M0=bm}
  SB.push(S)}
/* ---------- extra small bodies (JPL SBDB) + far spacecraft ---------- */
const EX=window.EXTRAS;
for(const r of EX.SB){const[id,kind,a,e,i,O,w,tp,diam]=r;SB.push({id,cat:kind==='craft'?'craft':'sml',kind,e,a,B:A.basis(w*DEG,O*DEG,i*DEG),n:GK/Math.pow(a,1.5),comet:false,t0:tp-2451545.0,M0:0,diam,ex:true})}
const PSP0=dayOf('2018-08-12T07:31Z');
const CRAFT=[{id:'Voyager 1',dir:V1DIR_E(),d0:166.5,v:3.57,y0:2025,from:1981},{id:'Voyager 2',dir:A.eqToEcl(A.sph(302,-58.5)),d0:116.2,v:3.23,y0:2017.85,from:1990},{id:'New Horizons',dir:A.eqToEcl(A.sph(287.5,-20.6)),d0:60,v:2.9,y0:2024.75,from:2016}];
function V1DIR_E(){return A.eqToEcl(A.sph(257.5,12.0))}
const CRAFTPOS={};
function updCraft(){const yr=yrs()+2000;for(const c of CRAFT){if(yr<c.from){delete CRAFTPOS[c.id];continue}c.dist=c.d0+c.v*(yr-c.y0);CRAFTPOS[c.id]=sc(eclT(c.dir),c.dist*AU)}}

function sbLocal(S,M){const{a,e,B}=S;let xp,yp;if(e<1){const E=A.kepler(((M%TAU)+TAU+Math.PI)%TAU-Math.PI,e);xp=a*(Math.cos(E)-e);yp=a*Math.sqrt(1-e*e)*Math.sin(E)}else{const Hh=keplerH(M,e);xp=a*(Math.cosh(Hh)-e);yp=-a*Math.sqrt(e*e-1)*Math.sinh(Hh)}
  return[B[0]*xp+B[3]*yp,B[1]*xp+B[4]*yp,B[2]*xp+B[5]*yp]}
const sbAt=(S,dd)=>sbLocal(S,S.M0+S.n*(dd-S.t0));
const TAILN=44;
for(const S of SB){const pts=[];if(S.e<1){for(let k=0;k<=360;k++){const M=k/360*TAU;pts.push(...sbLocal(S,M))}}else{for(let k=0;k<=240;k++){const Hh=-2.6+5.2*k/240;const{a,e,B}=S;const xp=a*(Math.cosh(Hh)-e),yp=-a*Math.sqrt(e*e-1)*Math.sinh(Hh);pts.push(B[0]*xp+B[3]*yp,B[1]*xp+B[4]*yp,B[2]*xp+B[5]*yp)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));S.lmat=reg(solL,lineMat(new THREE.Color(C2.CATS[S.cat].c).multiplyScalar(.55),.35));S.line=new THREE.Line(g,S.lmat);solL.q.add(S.line);
  if(S.comet){S.tail=new Float32Array(TAILN*2*3);const cols=[],sz=[];for(let k=0;k<TAILN;k++){const f=1-k/TAILN;cols.push(.55*f,.75*f,1*f);sz.push(2.6*f+.6)}for(let k=0;k<TAILN;k++){const f=1-k/TAILN;cols.push(1*f,.9*f,.7*f);sz.push(3.2*f+.6)}
    S.tailPts=cloud(S.tail,cols,sz,reg(solL,pmat(1.3,.38)));solL.q.add(S.tailPts)}}
function updateSmallBodies(){updCraft();for(const S of SB){const p=sbAt(S,d);SBPOS[S.id]=sc(eclT(p),AU);S.cur=p;
  if(S.tail){const r=len(p);const u=nrm(p);const v=nrm(sub(sbAt(S,d+1),p));const Lion=r<7?Math.min(1.1,.32*Math.pow(1.6/r,2)):0;const dDir=nrm(sub(u,sc(v,.45)));const t=S.tail;
    for(let k=0;k<TAILN;k++){const f=k/(TAILN-1);for(let j=0;j<3;j++){t[3*k+j]=p[j]+u[j]*Lion*f;t[3*(TAILN+k)+j]=p[j]+dDir[j]*Lion*.75*f+(-v[j])*Lion*.08*f*f}}S.tailPts.geometry.attributes.position.needsUpdate=true}}}

/* ---------- Oort cloud ---------- */
const oortL=layer('oort',AU,A.M_ECL,()=>[0,0,0],s=>win(15.3,17.3,.7,s));
const OORT=bodySet(4500);
for(let k=0;k<OORT.n;k++){const a=2000*Math.pow(50,Math.pow(R0(),.75));setBody(OORT,k,a,R0()*.7,Math.acos(2*R0()-1),R0()*TAU,R0()*TAU,R0()*TAU)}
smallCloud(OORT,oortL,'#b8cff5',1.5,.6);

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
let galMat;
{const pos=[],cols=[],pol=[],sz=[];const r=rng(77),g=()=>gauss(r);const k=1/Math.tan(14*DEG);const barAng=Math.PI-27*DEG;
 const push=(x,y,z,col,s)=>{pol.push(Math.hypot(x,y),Math.atan2(y,x),z);pos.push(0,0,0);cols.push(...col);sz.push(s)};
 const warm=C('#ffd2a0'),blue=C('#bcd2ff'),dim=C('#8a98c4'),pink=C('#ff7fa8');
 for(let i=0;i<60000;i++){const p=r();
  if(p<.13){const rad=Math.abs(g())*2600;const t=r()*TAU;push(rad*Math.cos(t),rad*Math.sin(t),g()*1300,warm.map(c=>c*(.6+.4*r())),1.1)}
  else if(p<.22){const x=g()*6500,y=g()*1700;push(x*Math.cos(barAng)-y*Math.sin(barAng),x*Math.sin(barAng)+y*Math.cos(barAng),g()*700,warm.map(c=>c*(.55+.4*r())),1)}
  else if(p<.78){const rad=6000+44000*Math.pow(r(),.9);const arm=(i%4)*TAU/4;const t=arm+Math.log(rad/6000)*k+g()*.2;const sp=g()*900;const col=r()<.05?pink:blue;
    push(rad*Math.cos(t)+sp*Math.cos(t+1.57),rad*Math.sin(t)+sp*Math.sin(t+1.57),g()*320,col.map(c=>c*(.5+.5*r())),r()<.05?2.2:1)}
  else{const rad=-10000*Math.log(1-r()*.995);if(rad>56000)continue;const t=r()*TAU;push(rad*Math.cos(t),rad*Math.sin(t),g()*650,dim.map(c=>c*(.4+.4*r())),.9)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('aColor',new THREE.Float32BufferAttribute(cols,3));geo.setAttribute('aPol',new THREE.Float32BufferAttribute(pol,3));geo.setAttribute('aSize',new THREE.Float32BufferAttribute(sz,1));
 galMat=reg(galL,pmat(1.7,.34,VS_GAL));const pts=new THREE.Points(geo,galMat);pts.frustumCulled=false;galL.q.add(pts);
 const core=new THREE.Sprite(reg(galL,new THREE.SpriteMaterial({map:glowTex,color:0xffd9a8,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),.35));core.scale.setScalar(16000);galL.q.add(core)}

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
  if(cine){}else if(W>900){tx=(c.right+12+(W-(sideC?30:sd.width)))/2-W/2}else{const top=Math.max(hd.bottom,sideC?0:sd.bottom)+8;ty=(top+c.top)/2-H/2}
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
/* ================= narration ================= */
let NARR=true;try{if(localStorage.getItem('tk3d-narr')==='0')NARR=false}catch(e){}
let tourHold=false,holdTimer=null;
/* ---- narration engine: sentence queue, karaoke subtitles, voice picker, ducking, timed fallback ---- */
const NS=window.NARRS;const NU=()=>NS.UI[lang];const SS=window.speechSynthesis||null;
let CC=true;try{if(localStorage.getItem('tk3d-cc')==='0')CC=false}catch(e){}
let NRATE=1;try{const v=+localStorage.getItem('tk3d-rate');if(v>=.7&&v<=1.5)NRATE=v}catch(e){}
const NAR={q:[],i:0,tok:0,active:false,u:null,timer:null,wTimer:null,hold:false,tag:'',words:[],bound:false,onDone:null};
function vScore(v){const n=v.name;return(/natural|neural|premium|enhanced|online/i.test(n)?4:0)+(/google/i.test(n)?3:0)+(/siri|samantha|daniel|damayanti/i.test(n)?2:0)+(v.localService?0:1)}
function voicesFor(l){if(!SS)return[];const pre=l==='en'?'en':'id';return SS.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().replace('_','-').startsWith(pre)).sort((a,b)=>vScore(b)-vScore(a))}
function pickVoice(){const vs=voicesFor(lang);if(!vs.length)return null;let want=null;try{want=localStorage.getItem('tk3d-voice-'+lang)}catch(e){}return(want&&vs.find(v=>v.name===want))||vs[0]}
function duck(on){const S=MK.SND;if(S.ctx&&S.master&&S.on)S.master.gain.setTargetAtTime(on?.32:.9,S.ctx.currentTime,.35)}
const subs=$('subs'),subT=$('subT'),subTag=$('subTag');
function subShow(text){if(!CC){subs.hidden=true;return}subTag.textContent=NAR.tag;subT.textContent='';subT.classList.remove('kara');NAR.words=[];const re=/\S+/g;let m;while((m=re.exec(text))){const sp=mk('span','w',m[0]);NAR.words.push([m.index,sp]);subT.append(sp,document.createTextNode(' '))}subs.hidden=false;subs.classList.remove('out');void subs.offsetWidth;subs.classList.add('in')}
function subWord(k){subT.classList.add('kara');NAR.words.forEach(([,sp],j)=>{sp.classList.toggle('said',j<k);sp.classList.toggle('now',j===k)})}
function subHide(){subs.classList.remove('in');subs.classList.add('out');setTimeout(()=>{if(!NAR.active)subs.hidden=true},450)}
function wordTicker(ms){clearInterval(NAR.wTimer);const n=NAR.words.length;if(!n)return;let k=0;subWord(0);const per=Math.max(120,ms/n);NAR.wTimer=setInterval(()=>{if(NAR.bound){clearInterval(NAR.wTimer);return}k++;if(k>=n){clearInterval(NAR.wTimer);subWord(n);return}subWord(k)},per)}
function estMs(t){const w=t.split(/\s+/).length;return Math.max(1500,w*(lang==='id'?410:360)/NRATE+350)}
function narStop(keepSubs){NAR.tok++;NAR.active=false;clearTimeout(NAR.timer);clearInterval(NAR.wTimer);try{SS&&SS.cancel()}catch(e){}duck(false);if(NAR.hold){tourHold=false;NAR.hold=false}clearTimeout(holdTimer);if(!keepSubs)subHide();setListen(false)}
function narrate(lines,opt){opt=opt||{};narStop(true);const useVoice=NARR&&SS&&pickVoice();if(!useVoice&&!CC){if(opt.onDone)opt.onDone();return false}
  NAR.q=lines.filter(Boolean).flatMap(t=>t.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g)||[t]).map(t=>t.trim()).filter(Boolean);NAR.i=opt.from||0;NAR.tag=opt.tag||NU().narrator;NAR.onDone=opt.onDone||null;NAR.active=true;NAR.hold=!!opt.hold;
  if(NAR.hold){tourHold=true;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{tourHold=false},90000)}if(useVoice)duck(true);narNext(NAR.tok);return true}
function narNext(tok){if(tok!==NAR.tok)return;if(NAR.i>=NAR.q.length){NAR.active=false;duck(false);if(NAR.hold){tourHold=false;NAR.hold=false}clearTimeout(holdTimer);subHide();setListen(false);const f=NAR.onDone;NAR.onDone=null;if(f)f();return}
  const t=NAR.q[NAR.i];NAR.bound=false;const adv=()=>{if(tok!==NAR.tok)return;NAR.i++;NAR.timer=setTimeout(()=>narNext(tok),60)};
  const v=NARR&&SS?pickVoice():null;const ms=estMs(t);
  if(!v){subShow(t);NAR.timer=setTimeout(adv,ms+250);return}
  try{try{SS.resume()}catch(e){}const u=new SpeechSynthesisUtterance(t);NAR.u=u;u.voice=v;u.lang=v.lang;u.rate=NRATE;u.pitch=lang==='en'?.96:1;u.volume=1;let started=false,done=false;
    const finish=()=>{if(done)return;done=true;clearTimeout(wd);clearTimeout(cap);if(!started)subShow(t);adv()};
    u.onstart=()=>{if(tok!==NAR.tok)return;started=true;subShow(t)};
    u.onboundary=e=>{if(tok!==NAR.tok||!started)return;if(e.name&&e.name!=='word')return;NAR.bound=true;let k=0;for(let j=0;j<NAR.words.length;j++)if(NAR.words[j][0]<=e.charIndex)k=j;subWord(k)};
    u.onend=finish;u.onerror=e=>{if(e&&e.error==='interrupted'||e&&e.error==='canceled')return;finish()};
    const wd=setTimeout(()=>{if(!started&&!done){done=true;try{SS.cancel()}catch(x){}subShow(t);NAR.timer=setTimeout(adv,ms+250)}},2500);
    const cap=setTimeout(finish,ms*2.6+4000);
    SS.speak(u)}catch(e){subShow(t);NAR.timer=setTimeout(adv,ms+250)}}
function speak(text,opt){return narrate([text],opt)}
function levelLines(li,dir,first){const S=NS.L[li][lang];const T=NS.T[lang];const out=[];if(first)out.push(dir>0?T.startO:T.startR);out.push(dir>0?S.o:S.r,...S.c);return out}
/* voice picker + rate */
function fillVoices(){const sel=$('voiceSel');if(!sel)return;const vs=voicesFor(lang);sel.textContent='';const o0=mk('option','',NU().auto);o0.value='';sel.appendChild(o0);let want='';try{want=localStorage.getItem('tk3d-voice-'+lang)||''}catch(e){}
  for(const v of vs){const o=mk('option','',`${v.name} (${v.lang})`);o.value=v.name;if(v.name===want)o.selected=true;sel.appendChild(o)}sel.disabled=!vs.length;$('voiceNote').hidden=!!vs.length||!SS;$('voiceNote').textContent=NU().none}
if(SS){SS.onvoiceschanged=fillVoices;setTimeout(fillVoices,600)}
$('voiceSel').onchange=e=>{try{localStorage.setItem('tk3d-voice-'+lang,e.target.value)}catch(x){}narrate([NU().testLine],{tag:NU().narrator})};
$('rateIn').value=NRATE;$('rateIn').oninput=e=>{NRATE=+e.target.value;$('rateV').textContent=NRATE.toFixed(2)+'×';try{localStorage.setItem('tk3d-rate',String(NRATE))}catch(x){}};$('rateIn').onchange=()=>narrate([NU().testLine],{tag:NU().narrator});
$('voiceTest').onclick=()=>{MK.sndInit();narrate([NU().testLine],{tag:NU().narrator})};
$('ccBtn').onclick=()=>{CC=!CC;try{localStorage.setItem('tk3d-cc',CC?'1':'0')}catch(e){}if(!CC)subs.hidden=true;else if(NAR.active&&NAR.q[NAR.i])subShow(NAR.q[NAR.i]);applyLang();toast(CC?NU().ccOn:NU().ccOff)};
$('narr').onclick=()=>{NARR=!NARR;try{localStorage.setItem('tk3d-narr',NARR?'1':'0')}catch(e){}if(!NARR){try{SS&&SS.cancel()}catch(e){}}applyLang();toast(NARR?EX.UI[lang].narrOn:EX.UI[lang].narrOff)};
/* listen button in the info panel */
let listenOn=false;function setListen(on){listenOn=on;const b=$('inListen');if(b){b.textContent=(on?'■ ':'🔊 ')+(on?NU().stopL:NU().listen);b.classList.toggle('on',on)}}
$('inListen').onclick=()=>{if(listenOn){narStop();return}MK.sndInit();const I=infoId&&!infoId.startsWith('__')?getInfo(infoId):null;if(!I)return;const ok=narrate([I.title+'.',I.desc,...(I.x||[]).slice(0,3)],{tag:I.title});if(ok)setListen(true)};

$('evBtn').onclick=openEvents;
/* ================= deep links ================= */
const slug=id=>norm(id).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function setHash(id){try{history.replaceState(null,'',id?'#'+slug(id):location.pathname+location.search)}catch(e){}}
/* ================= intro ================= */
const intro=$('intro');
function hideIntro(){intro.classList.add('gone');setTimeout(()=>intro.hidden=true,700)}
$('introTour').onclick=()=>{hideIntro();MK.sndInit();setTimeout(()=>$('tour').click(),350)};
$('introFree').onclick=()=>{hideIntro();MK.sndInit()};

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
function tourEnd(dir){toast(dir>0?LU().tourDone:LU().tourHome);narrate([dir>0?NS.T[lang].endO:NS.T[lang].endR],{tag:NU().narrator})}
function banner(i){const b=$('lvBanner');if(!b||document.body.classList.contains('cine')&&!touring)return;const Lv=LV[i];b.querySelector('.bx').innerHTML=`10<sup>${Math.round(Lv.f)}</sup> m`;b.querySelector('.bn').textContent=Lv[lang].name;b.classList.remove('show');void b.offsetWidth;b.classList.add('show')}
/* ---- side panel collapse ---- */
const sideTog=$('sideTog');let sideC=innerWidth<=900;try{const v=localStorage.getItem('tk3d-side');if(v!==null)sideC=v==='1'}catch(e){}
function placeTog(){const pl=parseFloat(getComputedStyle(side).paddingLeft)||0;$('strip').style.right=sideC?'0px':(side.offsetWidth-pl+(innerWidth<=900?2:0))+'px'}
function setSide(c){sideC=c;document.body.classList.toggle('sideC',c);sideTog.setAttribute('aria-expanded',String(!c));const t=c?LU().showPanel:LU().hidePanel;sideTog.title=t;sideTog.setAttribute('aria-label',t);try{localStorage.setItem('tk3d-side',c?'1':'0')}catch(e){}placeTog()}
sideTog.onclick=()=>setSide(!sideC);
function buildRail(){const r=$('rail');r.textContent='';LV.forEach((Lv,i)=>{const b=mk('button','',`10^${Math.round(Lv.f)}`);b.type='button';b.title=Lv[lang].name;b.setAttribute('aria-label',Lv[lang].name);b.onclick=()=>{stopTour();setSky(false,true);if(Lv.f<12&&focus!=='Bumi')switchFocus('Bumi');recenter();target=Lv.f;banner(i)};r.appendChild(b)})}
/* ---- cinematic ---- */
function setCine(on){document.body.classList.toggle('cine',on);if(on)toast(LU().cineHint)}
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
function updV9(){const i=levelIndex();if(mMode&&s>16.2)setMeasure(false,null,null,true);
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
function applyNar(){const n=NU();$('ccBtn').textContent=(CC?'▣ ':'□ ')+n.cc;$('ccBtn').classList.toggle('on',CC);$('ccBtn').setAttribute('aria-pressed',String(CC));document.querySelectorAll('[data-k6]').forEach(e=>{e.textContent=n[e.dataset.k6]});$('voiceTest').textContent=n.test;$('rateV').textContent=NRATE.toFixed(2)+'×';$('voiceSel').setAttribute('aria-label',n.voice);
  for(const[id,k,ic]of[['tbPrev','prev','prev'],['tbNext','next','next'],['tbStop','stop','stop']]){const b=$(id);b.innerHTML=svgI(ic);b.title=n[k];b.setAttribute('aria-label',n[k])}fillVoices();setListen(listenOn);tbarUpd(true)}
$('tbPrev').onclick=()=>tourSkip(-1);$('tbNext').onclick=()=>tourSkip(1);$('tbPlay').onclick=()=>tourPause(!tourPaused);$('tbStop').onclick=()=>stopTour();
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;if(e.key===']')tourSkip(1);else if(e.key==='[')tourSkip(-1)});
/* ================= boot ================= */
addEventListener('resize',resize);
updatePositions();{const v=new THREE.Vector3(...eclT(sc(A.planetEcl('Bumi',d),-1))).normalize().applyQuaternion(qEcl);v.applyAxisAngle(new THREE.Vector3(0,1,0),75*DEG);v.y+=.35;camera.position.copy(v.normalize())}
resize();
setFold(foldPref===null?innerWidth<=900:foldPref==='1');
applyLang();
fetch('data/sky.json').then(r=>r.json()).then(buildSky).catch(()=>{});
fetch('data/photos.json').then(r=>r.json()).then(p=>{PHOTOS=p;buildDSO()}).catch(()=>{PHOTOS={};buildDSO()});
if(location.hash&&location.hash.length>1){intro.hidden=true;const want=location.hash.slice(1);setTimeout(()=>{buildIdx();const it=SIDX.find(x=>slug(x.id)===want);if(it){openInfo(it.id);flyTo(it.id)}},3000)}
setTimeout(()=>{if(intro.hidden)toast(U().tHint)},2500);
let last=performance.now(),tourLvl=-1,prevCam=null;
addEventListener('pointerdown',()=>{if(MK.SND.on)MK.sndInit()},{capture:true});addEventListener('keydown',()=>{if(MK.SND.on)MK.sndInit()},{capture:true});
$('snd').onclick=()=>{MK.sndSet(!MK.SND.on);applyLang();toast(MK.SND.on?MK.UI3[lang].soundOn:MK.UI3[lang].soundOff)};
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(touring&&tourRise){if(s>26.85){tourRise=false;target=27}}
  else if(touring&&tourPaused){}
  else if(touring){let dd=9;for(const Lv of LV)dd=Math.min(dd,Math.abs(Lv.f-target));const v=(tourHold&&dd<.06)?0:.16+.8*ss(.15,.9,dd);target=clamp(target+tourDir*v*dt);
    if(tourDir>0&&target>=27){target=27;stopTour();MK.chime();tourEnd(1)}else if(tourDir<0&&target<=LV[0].f){target=LV[0].f;stopTour();MK.chime();tourEnd(-1)}
    const li=levelIndex();if(touring&&li!==tourLvl){if(tourLvl>=0)MK.whoosh(.9,tourDir<0);tourLvl=li;banner(li);narrate(levelLines(li,tourDir,tourFirst),{hold:true,tag:`10^${Math.round(LV[li].f)} m · ${LV[li][lang].name}`});tourFirst=false}}else if(!touring)tourLvl=-1;
  const fo=isPlanet(focus)?null:focusObj(focus);const minS=fo?fo.minS:Math.log10((PHYS[focus]?PHYS[focus].r:6371)*KM*2.3);if(target<minS)target=minS;
  if(skyOn&&(target>19.7||target<16.7)){setSky(false,true)}
  const sPrev=s;const pl0=len(pan);const tEff=(panDecay&&pl0>0)?Math.max(target,Math.log10(pl0*2.2)):target;s+=(tEff-s)*Math.min(1,dt*(tEff>target+.05?3.5:6));
  skyMorph+=((skyOn?1:0)-skyMorph)*Math.min(1,dt*2.2);if(Math.abs(skyMorph-(skyOn?1:0))<.002)skyMorph=skyOn?1:0;
  if(Math.abs(camera.fov-fovT)>.01){camera.fov+=(fovT-camera.fov)*Math.min(1,dt*6);camera.updateProjectionMatrix()}
  if(anchor&&s!==sPrev){const[R,Up]=camAxes();const f=1/ppmAt(sPrev)-1/ppmAt(s);pan[0]+=(R.x*anchor.vx-Up.x*anchor.vy)*f;pan[1]+=(R.y*anchor.vx-Up.y*anchor.vy)*f;pan[2]+=(R.z*anchor.vx-Up.z*anchor.vy)*f}
  if(anchor&&Math.abs(target-s)<.002)anchor=null;
  if(holdT0!==null&&s>holdT0+1.6)holdT0=null;
  if(panDecay){pan=sc(pan,Math.exp(-dt*2.4));if(len(pan)*ppmAt(s)<.3){pan=[0,0,0];panDecay=false}}
  if(!paused){const step=rate()*dt/86400;d+=step;if(galMode)galTd+=step/365.25}
  if(s<15.6&&Math.abs(d-nowD())>365.25*5000){d=nowD();toast(U().tReset)}
  updatePositions();updateSmallBodies();ESAT.update();sunMat.uniforms.uTime.value=now/1000;
  if(bgStarMat){const f=(1-ss(16.3,17.0,s))*(1-skyMorph);bgStarMat.uniforms.uOpacity.value=.8*f;bgMwMat.uniforms.uOpacity.value=.3*f}
  root.quaternion.copy(qEcl).slerp(qId,ss(16.6,19.6,s));
  tgt=computeTarget();
  bloom.strength=.3+.55*ss(9,16,s)-.15*ss(20.5,22,s);bloom.threshold=.86-.3*ss(9,16,s);
  {const cd=camera.position.clone().normalize();const rot=prevCam?Math.acos(Math.min(1,cd.dot(prevCam)))/Math.max(dt,1e-3):0;const side=prevCam?Math.sign(prevCam.x*cd.z-prevCam.z*cd.x):0;prevCam=cd;MK.sndUpdate(Math.abs(s-sPrev)/Math.max(dt,1e-3)+(panDecay?.4:0),Math.sign(s-sPrev),rot,side*Math.min(1,rot))}
  layoutOffset(dt);applyLayers();animateBodies();controls.update();composer.render();drawOverlay();drawMeasure();updateHud();
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();
