/* main/core.js: Shared helpers, language, renderer + bloom, shaders, layers, time.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
if(!window.THREE||!THREE.EffectComposer){document.body.insertAdjacentHTML('beforeend','<div class="err">Library 3D gagal dimuat / 3D library failed to load.</div>');throw new Error('three.js failed to load')}
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
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'})}catch(e){document.body.insertAdjacentHTML('beforeend','<div class="err">WebGL tidak tersedia / WebGL is not available.</div>');throw e}
renderer.setClearColor(0x05060a,1);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,0.0004,4000);
const controls=new THREE.OrbitControls(camera,cv);
controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.08;controls.rotateSpeed=.55;
camera.position.set(0,.42,1).normalize();
const root=new THREE.Group();scene.add(root);
scene.add(new THREE.AmbientLight(0xffffff,.018));
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

