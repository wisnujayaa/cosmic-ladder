/* main/narration.js: Narration engine, deep links, intro.
   The main/*.js files are classic scripts sharing one global scope; load them in the order listed in index.html. */
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

