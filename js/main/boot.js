/* main/boot.js: Boot: data loading and the render loop.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
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
  {const gw=ss(19.3,20.1,s)*(1-ss(22.4,23.2,s));bloom.strength=.3+.55*ss(9,16,s)-.15*ss(20.5,22,s)-.55*gw;bloom.threshold=.86-.3*ss(9,16,s)+.32*gw}
  {const cd=camera.position.clone().normalize();const rot=prevCam?Math.acos(Math.min(1,cd.dot(prevCam)))/Math.max(dt,1e-3):0;const side=prevCam?Math.sign(prevCam.x*cd.z-prevCam.z*cd.x):0;prevCam=cd;MK.sndUpdate(Math.abs(s-sPrev)/Math.max(dt,1e-3)+(panDecay?.4:0),Math.sign(s-sPrev),rot,side*Math.min(1,rot))}
  layoutOffset(dt);applyLayers();animateBodies();controls.update();composer.render();drawOverlay();drawMeasure();updateHud();
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
