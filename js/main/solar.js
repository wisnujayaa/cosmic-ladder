/* main/solar.js: Solar system: Sun, planets, moons, Earth satellites, small bodies, spacecraft, Oort cloud.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
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
/* ---------- HD textures streamed on demand (level of detail) ---------- */
const HDN=new Set(['moon','mars','mercury','io','europa','ganymede','callisto','pluto','charon','miranda','ariel','umbriel','titania','oberon','earth']);
const HDP={Merkurius:'mercury',Mars:'mars',Jupiter:'jupiter',Saturnus:'saturn',Uranus:'uranus',Neptunus:'neptune',Pluto:'pluto'};
const HDQ=[];let hdTickN=0,hdBusy=0;
function hdAdd(mesh,mat,key){HDQ.push({mesh,mat,key,done:false})}
function hdLoad(e){e.done=true;hdBusy++;const ld=f=>new Promise(res=>new THREE.TextureLoader().load('tex/hd/'+f,t=>{t.anisotropy=renderer.capabilities.getMaxAnisotropy();res(t)},undefined,()=>res(null)));
  const jobs=e.key==='earth'?[ld('earth_day.jpg'),ld('earth_night.jpg'),ld('earth_spec.jpg'),ld('earth_n.jpg')]:[ld(e.key+'.jpg'),HDN.has(e.key)?ld(e.key+'_n.jpg'):Promise.resolve(null)];
  Promise.all(jobs).then(t=>{hdBusy--;const m=e.mat;
    if(e.key==='earth'){if(t[0])m.uniforms.uDay.value=t[0];if(t[1])m.uniforms.uNight.value=t[1];if(t[2])m.uniforms.uSpec.value=t[2];if(t[3]){m.uniforms.uNorm.value=t[3];m.uniforms.uHasN.value=1}return}
    if(m.uniforms&&m.uniforms.uMap){if(t[0])m.uniforms.uMap.value=t[0];return}
    if(t[0]){m.map=t[0];m.color.set(0xd6d6d6)}if(t[1]){m.normalMap=t[1];m.normalScale=new THREE.Vector2(.9,-.9)}m.needsUpdate=true})}
const _hv=new THREE.Vector3();
function hdTick(){if(++hdTickN%15||hdBusy>2)return;const f=H/2/Math.tan(camera.fov/2*DEG);
  for(const e of HDQ){if(e.done)continue;const ms=e.mesh;let vis=true;for(let o=ms;o;o=o.parent)if(!o.visible){vis=false;break}if(!vis)continue;
    ms.getWorldPosition(_hv);const dist=_hv.distanceTo(camera.position);if(!ms.geometry.boundingSphere)ms.geometry.computeBoundingSphere();
    const px=ms.geometry.boundingSphere.radius*ms.matrixWorld.getMaxScaleOnAxis()/Math.max(dist,1e-9)*f;if(px>90){hdLoad(e);if(hdBusy>2)return}}}
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
const earthMat=new THREE.ShaderMaterial({uniforms:{uDay:{value:TX('earth_day.jpg')},uNight:{value:TX('earth_night.jpg')},uSpec:{value:TX('earth_spec.jpg')},uNorm:{value:null},uHasN:{value:0},uClouds:{value:TX('earth_clouds.jpg')},uCR:{value:0},uSun:{value:new THREE.Vector3(1,0,0)},uOpacity:{value:1}},transparent:true,
 vertexShader:LD_V+`varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vT;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vT=mat3(modelMatrix)*vec3(position.z,0.0,-position.x);vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform sampler2D uDay,uNight,uSpec,uNorm,uClouds;uniform vec3 uSun;uniform float uOpacity,uHasN,uCR;varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying vec3 vT;
void main(){
#include <logdepthbuf_fragment>
vec3 ng=normalize(vN);vec3 L=normalize(uSun);vec3 V=normalize(cameraPosition-vP);float ndlg=dot(ng,L);
vec3 day=texture2D(uDay,vUv).rgb;vec3 night=texture2D(uNight,vUv).rgb;float spm=texture2D(uSpec,vUv).r;
vec3 n=ng;if(uHasN>0.5){vec3 T=normalize(vT-ng*dot(vT,ng)+1e-6);vec3 B=cross(ng,T);vec3 nm=texture2D(uNorm,vUv).xyz*2.0-1.0;n=normalize(mix(ng,normalize(T*nm.x+B*nm.y+ng*nm.z),1.0-spm));}
float ndl=dot(n,L);float dayK=smoothstep(-0.12,0.2,ndlg);
float cs=texture2D(uClouds,vUv-vec2(uCR,0.0)).r;float shadow=1.0-0.45*cs*dayK;
vec3 Hh=normalize(L+V);float nh=max(dot(ng,Hh),0.0);float fres=0.04+0.96*pow(1.0-max(dot(ng,V),0.0),5.0);
float spec=(pow(nh,160.0)*0.55+pow(nh,24.0)*0.035)*spm*dayK*(0.5+fres)*(1.0-0.85*cs);
vec3 col=day*(0.012+0.95*pow(max(ndl,0.0),0.85))*shadow+spec*vec3(1.0,0.9,0.75);
col+=night*vec3(1.0,0.78,0.45)*1.6*(1.0-dayK)*(1.0-0.6*cs);
float rim=pow(1.0-max(dot(ng,V),0.0),2.5);
col+=vec3(0.30,0.55,1.0)*rim*0.75*smoothstep(-0.2,0.45,ndlg);
col+=vec3(1.0,0.45,0.18)*rim*0.45*exp(-pow(ndlg/0.13,2.0));
col=mix(col,col*vec3(0.92,0.96,1.06)+vec3(0.012,0.02,0.04)*dayK,0.5);
gl_FragColor=vec4(col,uOpacity);}`});
earthMat.userData.base=1;earthMat.userData.u=true;
const ATMOS=[];
function atmoShell(col,sunset,str,powr,back){const m=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:1},uSun:{value:new THREE.Vector3(1,0,0)},uC:{value:new THREE.Color(col)},uS:{value:new THREE.Color(sunset)},uStr:{value:str},uPow:{value:powr}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:back?THREE.BackSide:THREE.FrontSide,
 vertexShader:LD_V+`varying vec3 vNw;varying vec3 vPw;void main(){vNw=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vPw=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform float uOpacity,uStr,uPow;uniform vec3 uSun,uC,uS;varying vec3 vNw;varying vec3 vPw;void main(){
#include <logdepthbuf_fragment>
vec3 n=normalize(vNw);vec3 V=normalize(cameraPosition-vPw);vec3 L=normalize(uSun);float mu=dot(n,V);float ndl=dot(n,L);
float I=`+(back?`pow(max(0.0,-mu),1.15)*2.4`:`pow(1.0-max(mu,0.0),uPow)`)+`;
float sun=smoothstep(-0.32,0.4,ndl);vec3 c=mix(uS,uC,smoothstep(-0.05,0.35,ndl));
gl_FragColor=vec4(c,min(I*sun*uStr,1.0)*uOpacity);}`});m.userData.base=1;m.userData.u=true;return m}
function addAtmo(L,parent,r,col,sunset,str,thick){const out=atmoShell(col,sunset,str,1.0,true),inn=atmoShell(col,sunset,str*.55,3.0,false);
  const a=new THREE.Mesh(new THREE.SphereGeometry(r*(1+thick),64,40),out),b=new THREE.Mesh(new THREE.SphereGeometry(r*(1+thick*.25),64,40),inn);parent.add(a);parent.add(b);L.mats.push(out,inn);ATMOS.push({L,mats:[out,inn],mesh:a})}
const atmoMat=null;
const RING_U=`uniform vec3 uSun,uC,uRN;uniform float uKm,uR;`;
const ringMat=new THREE.ShaderMaterial({uniforms:{uTex:{value:TX('saturn_ring.png')},uOpacity:{value:1},uSun:{value:new THREE.Vector3(1,0,0)},uC:{value:new THREE.Vector3()},uRN:{value:new THREE.Vector3(0,1,0)},uKm:{value:1},uR:{value:58232}},transparent:true,side:THREE.DoubleSide,depthWrite:false,
 vertexShader:LD_V+`varying vec2 vP;varying vec3 vPw;void main(){vP=position.xy;vec4 wp=modelMatrix*vec4(position,1.0);vPw=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+RING_U+`uniform sampler2D uTex;uniform float uOpacity;varying vec2 vP;varying vec3 vPw;void main(){
#include <logdepthbuf_fragment>
float r=length(vP);float u=(r-74500.0)/(140220.0-74500.0);if(u<0.0||u>1.0)discard;vec4 t=texture2D(uTex,vec2(u,0.5));
vec3 L=normalize(uSun);vec3 D=(vPw-uC)/uKm;float tc=-dot(D,L);float sh=1.0;
if(tc>0.0){vec3 cl=D+L*tc;float py=dot(cl,uRN);vec3 q=cl-uRN*py+uRN*py/0.902;if(length(q)<uR)sh=0.04;}
float lit=abs(dot(L,uRN));float side=sign(dot(L,uRN))*sign(dot(cameraPosition-vPw,uRN));
float b=(0.35+0.65*pow(lit,0.35))*(side>0.0?1.0:0.42);
gl_FragColor=vec4(t.rgb*1.05*b*sh,t.a*uOpacity*(side>0.0?1.0:0.85));}`});
ringMat.userData.base=1;ringMat.userData.u=true;
const satMat=new THREE.ShaderMaterial({uniforms:{uMap:{value:TX('saturn.jpg')},uRing:{value:ringMat.uniforms.uTex.value},uOpacity:{value:1},uSun:{value:new THREE.Vector3(1,0,0)},uC:{value:new THREE.Vector3()},uRN:{value:new THREE.Vector3(0,1,0)},uKm:{value:1},uR:{value:58232}},transparent:true,
 vertexShader:LD_V+`varying vec2 vUv;varying vec3 vNv;varying vec3 vPw;varying vec3 vVv;void main(){vUv=uv;vNv=normalize(normalMatrix*normal);vec4 wp=modelMatrix*vec4(position,1.0);vPw=wp.xyz;vec4 mv=viewMatrix*wp;vVv=-mv.xyz;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+RING_U+`uniform sampler2D uMap,uRing;uniform float uOpacity;varying vec2 vUv;varying vec3 vNv;varying vec3 vPw;varying vec3 vVv;void main(){
#include <logdepthbuf_fragment>
vec3 L=normalize(uSun);vec3 Lv=normalize((viewMatrix*vec4(L,0.0)).xyz);vec3 n=normalize(vNv);float ndl=max(dot(n,Lv),0.0);float mu=max(dot(n,normalize(vVv)),0.0);
float sh=1.0;float dn=dot(L,uRN);if(abs(dn)>1e-4){float t=dot(uC-vPw,uRN)/dn;if(t>0.0){vec3 Q=vPw+L*t;float r=length(Q-uC)/uKm;float u=(r-74500.0)/(140220.0-74500.0);if(u>0.0&&u<1.0)sh=1.0-0.88*texture2D(uRing,vec2(u,0.5)).a;}}
vec3 tex=texture2D(uMap,vUv).rgb;vec3 col=tex*(0.012+1.0*pow(ndl,0.9)*sh)*(0.78+0.22*pow(mu,0.35));
gl_FragColor=vec4(col,uOpacity);}`});
satMat.userData.base=1;satMat.userData.u=true;
const moonTex=TX('moon.jpg');
const PH=o=>new THREE.MeshPhongMaterial(Object.assign({shininess:1,specular:0x000000,color:0xd6d6d6,transparent:true},o));
const moonMat=(spec,L)=>reg(L,spec.endsWith('.jpg')?PH({map:TX(spec)}):PH({color:spec}),1);
for(const name of PL){const L=planetLayer(name);const ph=PHYS[name];
  const eq=new THREE.Group();eq.quaternion.setFromRotationMatrix(poleBasis(name));L.q.add(eq);L.eq=eq;
  let mat;if(name==='Bumi'){mat=earthMat;L.mats.push(earthMat)}else if(name==='Saturnus'){mat=satMat;L.mats.push(satMat)}else mat=reg(L,PH({map:TX(ph.tex||'pluto.jpg')}),1);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(ph.r,128,96),mat);mesh.scale.y=1-(ph.obl||0);eq.add(mesh);L.mesh=mesh;if(HDP[name])hdAdd(mesh,mat,HDP[name]);
  if(name==='Bumi'){const cm=new THREE.ShaderMaterial({uniforms:{uMap:{value:TX('earth_clouds.jpg')},uSun:earthMat.uniforms.uSun,uOpacity:{value:1}},transparent:true,depthWrite:false,
 vertexShader:LD_V+`varying vec2 vUv;varying vec3 vN;varying vec3 vP;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;
#include <logdepthbuf_vertex>
}`,
 fragmentShader:LD_F+`uniform sampler2D uMap;uniform vec3 uSun;uniform float uOpacity;varying vec2 vUv;varying vec3 vN;varying vec3 vP;void main(){
#include <logdepthbuf_fragment>
vec3 n=normalize(vN);vec3 L=normalize(uSun);float ndl=dot(n,L);float a=texture2D(uMap,vUv).r;
float lit=smoothstep(-0.08,0.35,ndl);vec3 c=mix(vec3(1.0,0.55,0.3),vec3(1.0),smoothstep(0.0,0.3,ndl))*(0.03+0.97*lit);
gl_FragColor=vec4(c,a*0.92*uOpacity);}`});cm.userData.base=.85;cm.userData.u=true;L.mats.push(cm);
    const cl=new THREE.Mesh(new THREE.SphereGeometry(ph.r*1.006,128,96),cm);mesh.add(cl);L.clouds=cl;
    addAtmo(L,L.q,ph.r,'#5f9dff','#ff7a3a',1.0,.03);hdAdd(mesh,earthMat,'earth');
    L.moonPivot=new THREE.Group();L.q.add(L.moonPivot);const mmMat=reg(L,PH({map:moonTex}),1);const mm=new THREE.Mesh(new THREE.SphereGeometry(1737.4,128,96),mmMat);hdAdd(mm,mmMat,'moon');mm.rotation.y=-Math.PI/2;L.moonPivot.add(mm);L.moon=mm;
    const pts=[];for(let k=0;k<=256;k++)pts.push(...A.moonEcl(k/256*27.321661));const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));L.q.add(new THREE.Line(og,reg(L,lineMat(0x9cb4d8,.3))))}
  if(name==='Saturnus'){const ring=new THREE.Mesh(new THREE.RingGeometry(74500,140220,256,1),ringMat);L.mats.push(ringMat);ring.rotation.x=-Math.PI/2;ring.renderOrder=3;eq.add(ring);L.ring=ring}
  const AT={Venus:['#fff1cf','#ffb070',1.1,.04],Mars:['#ffb59a','#ff8a5a',.45,.02],Jupiter:['#e8d6b8','#d99a6a',.35,.012],Saturnus:['#f0e2bf','#d9a46a',.32,.012],Uranus:['#a9e6f0','#7fc4d8',.5,.02],Neptunus:['#7fa6ff','#5d7fe0',.5,.02]}[name];if(AT)addAtmo(L,eq,ph.r,AT[0],AT[1],AT[2],AT[3]);
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
const MOONTEX={Io:'io.jpg',Europa:'europa.jpg',Ganymede:'ganymede.jpg',Callisto:'callisto.jpg',Titan:'titan.jpg',Triton:'triton.jpg',Charon:'charon.jpg',Mimas:'mimas.jpg',Enceladus:'enceladus.jpg',Tethys:'tethys.jpg',Dione:'dione.jpg',Rhea:'rhea.jpg',Iapetus:'iapetus.jpg',Miranda:'miranda.jpg',Ariel:'ariel.jpg',Umbriel:'umbriel.jpg',Titania:'titania.jpg',Oberon:'oberon.jpg'};
const MOONCOL={Enceladus:'#f2f6fa',Mimas:'#c9c6c0',Tethys:'#e6e4df',Dione:'#d9d6d0',Rhea:'#cdc8c0',Iapetus:'#a89a82',Hyperion:'#c2a98a',Phoebe:'#5d5650',Miranda:'#bdbab4',Ariel:'#c9c5bf',Umbriel:'#8a8680',Titania:'#bdb2a6',Oberon:'#a99d92',Charon:'#a59c94',Proteus:'#7d7872',Nereid:'#9a958f',Amalthea:'#b5634a',Phobos:'#8a8178',Deimos:'#9b9084',Janus:'#bdb7ad',Epimetheus:'#bdb7ad',Puck:'#7f7a74',Sycorax:'#a37c66',Himalia:'#8f877d'};
function moonLocal(m,days,Efix){let E;if(Efix!==undefined&&Efix!==null)E=Efix;else{const M=m.M0+TAU*((days/m.P)%1);E=A.kepler(((M%TAU)+TAU+Math.PI)%TAU-Math.PI,m.e)}
  const xp=m.a*(Math.cos(E)-m.e),yp=m.a*Math.sqrt(1-m.e*m.e)*Math.sin(E);const B=m.B;return[B[0]*xp+B[3]*yp,B[2]*xp+B[5]*yp,-(B[1]*xp+B[4]*yp)]}
function buildMoons(rows){for(const r of rows){const[pl,name,a,e,i,O,w,M0,P,rad,yr,g]=r;const L=bodies[pl];if(!L)continue;
    const m={pl,name,a,e,i,O,w,M0:M0*DEG,P,r:rad,yr,g,B:A.basis(w*DEG,O*DEG,i*DEG),L,loc:[0,0,0]};MOONMAP[name]=m;MOONLIST.push(m);(L.ml||(L.ml=[])).push(m)}
  for(const pl of Object.keys(MAXA)){const L=bodies[pl];if(!L||!L.ml)continue;L.qc=L.q.quaternion.clone().multiply(L.eq.quaternion);
    const sp=[],scol=[],segs=[],segsIn=[];L.small=[];
    for(const m of L.ml){const big=m.r>=40||!!MOONTEX[m.name];const n=big?160:64;const pts=[];for(let k=0;k<=n;k++)pts.push(moonLocal(m,0,k/n*TAU));
      if(big){const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));m.lmat=reg(L,lineMat(0x9cb4d8,m.i>90?.2:.28));L.eq.add(new THREE.Line(og,m.lmat));
        const tex=MOONTEX[m.name];const mat=tex?PH({map:TX(tex)}):PH({map:moonTex,color:new THREE.Color(MOONCOL[m.name]||'#b9b3aa')});
        m.mesh=new THREE.Mesh(new THREE.SphereGeometry(m.r,m.r>500?96:24,m.r>500?64:16),reg(L,mat,1));if(tex)hdAdd(m.mesh,mat,tex.replace('.jpg',''));if(m.name==='Titan')addAtmo(L,m.mesh,m.r,'#e0a050','#b86420',.45,.07);if(m.name==='Hyperion')m.mesh.scale.set(1.3,.85,1);L.eq.add(m.mesh)}
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

