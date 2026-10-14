/* Interactive labs. Each OSN.LAB[name](el) builds controls + a canvas inside el. */
(function () {
const LAB = OSN.LAB, D2R = Math.PI / 180, TAU = Math.PI * 2;
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = () => { const s = getComputedStyle(document.documentElement), g = k => s.getPropertyValue(k).trim(); return { fg: g('--fg'), ink: g('--ink'), muted: g('--muted'), line: g('--line'), acc: g('--accent'), blue: g('--blue'), warn: g('--warn'), ok: g('--ok'), bg: g('--bg'), panel: g('--panel'), sun: g('--sun'), mono: g('--f-mono') || 'monospace', ui: g('--f-ui') || 'sans-serif' }; };
const fmt = (x, d = 2) => { if (!isFinite(x)) return '—'; const a = Math.abs(x); if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const e = Math.floor(Math.log10(a)), m = x / 10 ** e; return m.toFixed(d).replace('.', ',') + ' × 10' + sup(e); } return x.toLocaleString('id-ID', { maximumFractionDigits: d }); };
const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || (c === '-' ? '⁻' : c)).join('');
let uid = 0;

function mkLab(el, cfg) {
  const id = 'lab' + (++uid);
  el.classList.add('lab');
  el.innerHTML = `<div class="lab-head"><span class="eyebrow">Lab interaktif</span><h4>${cfg.title}</h4><p>${cfg.hint}</p></div>
   <div class="lab-body"><div class="lab-canvas"><canvas aria-label="${cfg.title}" role="img"></canvas></div><div class="lab-side"><div class="lab-presets"></div><div class="lab-ctrls"></div><dl class="lab-out"></dl></div></div>`;
  const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), ctrls = el.querySelector('.lab-ctrls'), outEl = el.querySelector('.lab-out'), pre = el.querySelector('.lab-presets');
  const v = {}, inputs = {};
  (cfg.controls || []).forEach(c => {
    const wrap = document.createElement('label'); wrap.className = 'ctrl';
    const iid = `${id}-${c.k}`;
    if (c.type === 'toggle') {
      wrap.innerHTML = `<span class="ctrl-row"><span>${c.label}</span><input type="checkbox" id="${iid}" ${c.val ? 'checked' : ''}></span>`;
      const inp = wrap.querySelector('input'); v[c.k] = !!c.val; inp.onchange = () => { v[c.k] = inp.checked; draw(); }; inputs[c.k] = { set: x => { inp.checked = x; v[c.k] = x; } };
    } else {
      wrap.innerHTML = `<span class="ctrl-row"><span>${c.label}</span><output for="${iid}"></output></span><input type="range" id="${iid}" min="0" max="1000" step="1">`;
      const inp = wrap.querySelector('input'), o = wrap.querySelector('output');
      const toX = val => c.log ? 1000 * (Math.log10(val) - Math.log10(c.min)) / (Math.log10(c.max) - Math.log10(c.min)) : 1000 * (val - c.min) / (c.max - c.min);
      const fromX = x => { let val = c.log ? 10 ** (Math.log10(c.min) + (Math.log10(c.max) - Math.log10(c.min)) * x / 1000) : c.min + (c.max - c.min) * x / 1000; if (c.step) val = Math.round(val / c.step) * c.step; return val; };
      const show = () => { o.textContent = (c.fmt ? c.fmt(v[c.k]) : fmt(v[c.k])) + (c.unit ? ' ' + c.unit : ''); };
      v[c.k] = c.val; inp.value = toX(c.val); show();
      inp.oninput = () => { v[c.k] = fromX(+inp.value); show(); if (cfg.onInput) cfg.onInput(v, c.k); draw(); };
      inputs[c.k] = { set: x => { v[c.k] = x; inp.value = toX(x); show(); } };
    }
    ctrls.appendChild(wrap);
  });
  (cfg.presets || []).forEach(p => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p.label;
    b.onclick = () => { for (const k in p.set) inputs[k] ? inputs[k].set(p.set[k]) : (v[k] = p.set[k]); if (cfg.onPreset) cfg.onPreset(v); draw(); };
    pre.appendChild(b);
  });
  if (!pre.children.length) pre.remove();
  let playing = false, raf = 0, last = 0, visible = true, t = 0;
  if (cfg.anim) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; ctrls.appendChild(b);
    const lab = () => b.textContent = playing ? '❚❚ Jeda' : '▶ Jalankan';
    b.onclick = () => { playing = !playing; lab(); if (playing) loop(); };
    playing = !RM; lab();
    if (cfg.reset) { const r = document.createElement('button'); r.type = 'button'; r.className = 'btn small ghost'; r.textContent = '↺ Ulang'; r.onclick = () => { t = 0; cfg.reset(v); draw(); }; ctrls.appendChild(r); }
  }
  let W = 0, H = 0;
  function size() {
    const box = cv.parentElement, w = box.clientWidth || 480, h = Math.round(Math.min(w * (cfg.aspect || 0.62), 520)), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); W = w; H = h;
  }
  function draw() {
    if (!W) size();
    const C = css(); ctx.clearRect(0, 0, W, H); ctx.font = `12px ${C.ui}`; ctx.textBaseline = 'middle';
    const out = cfg.draw(ctx, W, H, v, C, t) || {};
    outEl.innerHTML = (cfg.outputs || []).map(([k, l]) => `<div><dt>${l}</dt><dd>${out[k] ?? '—'}</dd></div>`).join('');
  }
  function loop(now) {
    if (!playing) return; cancelAnimationFrame(raf);
    raf = requestAnimationFrame(ts => { const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts; if (visible) { t += dt; draw(); } loop(); });
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => { size(); draw(); }).observe(cv.parentElement);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; last = 0; }).observe(el);
  const onTheme = () => { if (el.isConnected) draw(); else window.removeEventListener('osn-theme', onTheme); };
  window.addEventListener('osn-theme', onTheme);
  size(); draw(); if (playing) loop();
  return { v, draw };
}
/* drawing helpers */
const line = (c, x1, y1, x2, y2, col, w = 1, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]); };
const disc = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
const ring = (c, x, y, r, col, w = 1, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]); };
const text = (c, s, x, y, col, align = 'left', font) => { c.fillStyle = col; c.textAlign = align; if (font) c.font = font; c.fillText(s, x, y); };
function axes(c, C, box, xr, yr, opt = {}) {
  const [x0, y0, w, h] = box, X = q => x0 + (opt.xlog ? (Math.log10(q) - Math.log10(xr[0])) / (Math.log10(xr[1]) - Math.log10(xr[0])) : (q - xr[0]) / (xr[1] - xr[0])) * w;
  const Y = q => y0 + h - (opt.ylog ? (Math.log10(q) - Math.log10(yr[0])) / (Math.log10(yr[1]) - Math.log10(yr[0])) : (q - yr[0]) / (yr[1] - yr[0])) * h;
  c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(x0, y0, w, h);
  c.font = `11px ${C.ui}`;
  (opt.xt || []).forEach(q => { const x = X(q); line(c, x, y0 + h, x, y0 + h + 4, C.muted); line(c, x, y0, x, y0 + h, C.line, 0.5, [2, 4]); text(c, opt.xf ? opt.xf(q) : String(q), x, y0 + h + 14, C.muted, 'center'); });
  (opt.yt || []).forEach(q => { const y = Y(q); line(c, x0 - 4, y, x0, y, C.muted); line(c, x0, y, x0 + w, y, C.line, 0.5, [2, 4]); text(c, opt.yf ? opt.yf(q) : String(q), x0 - 7, y, C.muted, 'right'); });
  if (opt.xl) text(c, opt.xl, x0 + w / 2, y0 + h + 30, C.fg, 'center');
  if (opt.yl) { c.save(); c.translate(x0 - (opt.ylo || 42), y0 + h / 2); c.rotate(-Math.PI / 2); text(c, opt.yl, 0, 0, C.fg, 'center'); c.restore(); }
  return { X, Y };
}

/* ================= 1. angular size ================= */
LAB.sudut = el => {
  const objs = { Matahari: [1.392e9, 1.496e11], Bulan: [3.474e6, 3.844e8], 'Jupiter (oposisi)': [1.398e8, 6.29e11], ISS: [109, 4.2e5], 'Koin 5 km': [0.025, 5157], 'Andromeda': [2.2e21, 2.4e22] };
  mkLab(el, {
    title: 'Ukuran sudut & pendekatan sudut kecil', hint: 'Atur diameter dan jarak benda. Lingkaran putus-putus di kanan adalah ukuran Bulan purnama (0,52°) sebagai pembanding.', aspect: 0.5,
    controls: [{ k: 'D', label: 'Diameter D', min: 0.01, max: 1e22, log: true, val: 3.474e6, unit: 'm', fmt: x => fmt(x, 2) }, { k: 'd', label: 'Jarak d', min: 1, max: 1e23, log: true, val: 3.844e8, unit: 'm', fmt: x => fmt(x, 2) }],
    presets: Object.entries(objs).map(([n, [D, d]]) => ({ label: n, set: { D, d } })),
    outputs: [['rad', 'θ (radian)'], ['deg', 'θ (derajat)'], ['arc', 'θ (menit/detik busur)'], ['moon', 'Dibanding Bulan']],
    draw(c, W, H, v, C) {
      const th = 2 * Math.atan(v.D / (2 * v.d)), small = v.D / v.d, deg = th / D2R;
      const ex = 40, ey = H / 2, ox = W * 0.58, half = Math.min(H * 0.42, Math.max(3, Math.tan(Math.min(th, 2.6) / 2) * (ox - ex)));
      line(c, ex, ey, ox, ey - half, C.acc, 1.5); line(c, ex, ey, ox, ey + half, C.acc, 1.5); line(c, ox, ey - half, ox, ey + half, C.fg, 3);
      disc(c, ex, ey, 6, C.fg); text(c, 'mata', ex, ey + 18, C.muted, 'center'); text(c, 'D', ox + 8, ey, C.fg); text(c, 'd (tidak sesuai skala)', (ex + ox) / 2, ey + half + 16, C.muted, 'center');
      text(c, 'θ', ex + 34, ey, C.acc, 'left', `bold 14px ${C.ui}`); c.font = `12px ${C.ui}`;
      // sky view: field 2° wide
      const sx = W * 0.83, R0 = Math.min(W * 0.13, H * 0.36), moonR = R0 * 0.52 / 2 / 1, scale = R0 / 1; // field radius = 1°
      ring(c, sx, ey, R0, C.line); const r = Math.min(R0 * 1.4, deg / 2 * scale);
      disc(c, sx, ey, Math.max(r, 0.8), C.blue); ring(c, sx, ey, moonR, C.muted, 1, [3, 3]);
      text(c, 'medan pandang 2°', sx, ey + R0 + 14, C.muted, 'center');
      return { rad: fmt(th, 4), deg: fmt(deg, 4) + '°', arc: deg >= 1 / 60 ? fmt(deg * 60, 2) + '′' : fmt(deg * 3600, 2) + '″', moon: fmt(deg / 0.518, 3) + '×' + (Math.abs(th - small) / th > 0.01 ? ' (sudut besar: pakai tan)' : '') };
    }
  });
};

/* ================= 2. celestial dome ================= */
LAB.langit = el => {
  mkLab(el, {
    title: 'Lintasan harian bintang di bola langit', hint: 'Ubah lintang pengamat φ dan deklinasi δ. Bagian lintasan di bawah horizon digambar redup. Titik merah bergerak sepanjang lintasan harian.', aspect: 0.72, anim: true,
    controls: [{ k: 'phi', label: 'Lintang pengamat φ', min: -90, max: 90, step: 0.1, val: -6.2, unit: '°', fmt: x => fmt(x, 1) }, { k: 'dec', label: 'Deklinasi bintang δ', min: -90, max: 90, step: 0.1, val: -16.7, unit: '°', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Jakarta', set: { phi: -6.2 } }, { label: 'Tokyo', set: { phi: 35.7 } }, { label: 'Kutub Utara', set: { phi: 90 } }, { label: 'Sirius', set: { dec: -16.7 } }, { label: 'Acrux', set: { dec: -63.1 } }, { label: 'Polaris', set: { dec: 89.3 } }, { label: 'Matahari Juni', set: { dec: 23.44 } }, { label: 'Matahari Des', set: { dec: -23.44 } }],
    outputs: [['hmax', 'Kulminasi atas'], ['hmin', 'Kulminasi bawah'], ['stat', 'Status'], ['dur', 'Lama di atas horizon'], ['az', 'Azimut terbit (dari U)']],
    draw(c, W, H, v, C, t) {
      const R = Math.min(W * 0.36, H * 0.42), cx = W * 0.42, cy = H * 0.52, S = OSN.sphere(cx, cy, R, 25, 20);
      const ph = v.phi * D2R, de = v.dec * D2R;
      const toHz = Hh => { const x = -Math.cos(de) * Math.sin(Hh), y = Math.cos(ph) * Math.sin(de) - Math.sin(ph) * Math.cos(de) * Math.cos(Hh), z = Math.sin(ph) * Math.sin(de) + Math.cos(ph) * Math.cos(de) * Math.cos(Hh); return [x, y, z]; };
      // horizon disc
      c.fillStyle = C.line; c.beginPath(); for (let i = 0; i <= 72; i++) { const p = S.P([Math.sin(i * 5 * D2R), Math.cos(i * 5 * D2R), 0]); i ? c.lineTo(p.X, p.Y) : c.moveTo(p.X, p.Y); } c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
      ring(c, cx, cy, R, C.line);
      const strokeCurve = (fn, n, col, w, dimBelow) => { let prev = null; for (let i = 0; i <= n; i++) { const q = fn(i / n), p = S.P(q); if (prev) { const below = (q[2] + prev.q[2]) / 2 < 0, back = (p.d + prev.p.d) / 2 > 0; c.strokeStyle = col; c.globalAlpha = (below && dimBelow) ? 0.28 : 1; c.lineWidth = w; c.setLineDash(back ? [4, 4] : []); c.beginPath(); c.moveTo(prev.p.X, prev.p.Y); c.lineTo(p.X, p.Y); c.stroke(); } prev = { p, q }; } c.globalAlpha = 1; c.setLineDash([]); };
      strokeCurve(u => [Math.sin(u * TAU), Math.cos(u * TAU), 0], 120, C.muted, 1.5);
      strokeCurve(u => [0, Math.cos(u * TAU), Math.sin(u * TAU)], 120, C.line, 1);                  // meridian
      strokeCurve(u => { const Hh = u * TAU; const x = -Math.sin(Hh), y = -Math.sin(ph) * Math.cos(Hh), z = Math.cos(ph) * Math.cos(Hh); return [x, y, z]; }, 120, C.blue, 1); // celestial equator
      strokeCurve(u => toHz(u * TAU), 160, C.acc, 2.2, true);
      const NP = S.P([0, Math.cos(ph), Math.sin(ph)]), SP = S.P([0, -Math.cos(ph), -Math.sin(ph)]), Z = S.P([0, 0, 1]), O = S.P([0, 0, 0]);
      line(c, NP.X, NP.Y, SP.X, SP.Y, C.blue, 1, [3, 3]); disc(c, NP.X, NP.Y, 3.5, C.blue); disc(c, SP.X, SP.Y, 3.5, C.blue); disc(c, Z.X, Z.Y, 3, C.fg); disc(c, O.X, O.Y, 3, C.fg);
      text(c, 'KLU', NP.X + 6, NP.Y - 8, C.blue); text(c, 'KLS', SP.X + 6, SP.Y + 10, C.blue); text(c, 'zenit', Z.X, Z.Y - 10, C.fg, 'center');
      [[0, 'U'], [90, 'T'], [180, 'S'], [270, 'B']].forEach(([A, s]) => { const p = S.P([Math.sin(A * D2R) * 1.1, Math.cos(A * D2R) * 1.1, 0]); text(c, s, p.X, p.Y, C.fg, 'center', `bold 12px ${C.ui}`); });
      c.font = `12px ${C.ui}`;
      const st = toHz((t * 0.6) % TAU), sp = S.P(st); disc(c, sp.X, sp.Y, 5, st[2] < 0 ? C.muted : C.acc);
      // legend
      const lx = W > 520 ? W * 0.8 : 8, ly = W > 520 ? 24 : H - 46; text(c, '— lintasan bintang', lx, ly, C.acc, 'left'); text(c, '— ekuator langit', lx, ly + 18, C.blue); text(c, '— horizon', lx, ly + 36, C.muted);
      const hmax = 90 - Math.abs(v.phi - v.dec), hmin = Math.abs(v.phi + v.dec) - 90;
      let stat, dur = '—', az = '—';
      if (hmin >= 0) { stat = 'Sirkumpolar (tak pernah terbenam)'; dur = '24 jam'; }
      else if (hmax < 0) { stat = 'Tak pernah terbit'; dur = '0 jam'; }
      else { stat = 'Terbit dan terbenam'; const c0 = -Math.tan(ph) * Math.tan(de); dur = fmt(2 * Math.acos(Math.max(-1, Math.min(1, c0))) / D2R / 15, 2) + ' jam'; const ca = Math.sin(de) / Math.cos(ph); az = Math.abs(ca) <= 1 ? fmt(Math.acos(ca) / D2R, 1) + '°' : '—'; }
      const side = v.dec < v.phi ? 'selatan' : v.dec > v.phi ? 'utara' : 'zenit';
      return { hmax: fmt(hmax, 1) + '° (' + (hmax >= 89.95 ? 'zenit' : 'di ' + side + ')'), hmin: fmt(hmin, 1) + '°', stat, dur, az };
    }
  });
};

/* ================= 3. synodic period & retrograde ================= */
LAB.sinodis = el => {
  let trail = [], conj = 0, lastSep = null, tt = 0;
  mkLab(el, {
    title: 'Periode sinodis & gerak retrograd', hint: 'Dua planet mengorbit Matahari (lingkaran, Kepler III). Grafik bawah: arah planet luar dilihat dari planet dalam. Saat disalip, arahnya mundur (retrograd).', aspect: 0.78, anim: true,
    controls: [{ k: 'P1', label: 'Periode planet dalam P₁', min: 0.2, max: 5, step: 0.001, val: 1, unit: 'th', fmt: x => fmt(x, 3) }, { k: 'P2', label: 'Periode planet luar P₂', min: 0.3, max: 30, step: 0.001, val: 1.881, unit: 'th', fmt: x => fmt(x, 3) }, { k: 'sp', label: 'Kecepatan animasi', min: 0.05, max: 2, val: 0.4, unit: 'th/dtk', fmt: x => fmt(x, 2) }],
    presets: [{ label: 'Bumi–Mars', set: { P1: 1, P2: 1.881 } }, { label: 'Venus–Bumi', set: { P1: 0.615, P2: 1 } }, { label: 'Bumi–Jupiter', set: { P1: 1, P2: 11.86 } }, { label: 'Bumi–Saturnus', set: { P1: 1, P2: 29.46 } }],
    onPreset: () => { trail = []; conj = 0; lastSep = null; tt = 0; }, onInput: (v, k) => { if (k !== 'sp') { trail = []; conj = 0; lastSep = null; tt = 0; } },
    reset: () => { trail = []; conj = 0; lastSep = null; tt = 0; },
    outputs: [['S', 'Periode sinodis S'], ['Sd', 'S (hari)'], ['tt', 'Waktu simulasi'], ['cj', 'Konjungsi/oposisi terhitung']],
    draw(c, W, H, v, C, t) {
      if (v.P2 <= v.P1) v.P2 = v.P1 * 1.05;
      tt = t * v.sp;
      const a1 = Math.pow(v.P1, 2 / 3), a2 = Math.pow(v.P2, 2 / 3), Hs = H * 0.62, R = Math.min(W * 0.45, Hs * 0.45), k = R / a2, cx = W / 2, cy = Hs / 2 + 4;
      const th1 = TAU * tt / v.P1, th2 = TAU * tt / v.P2, p1 = [cx + a1 * k * Math.cos(th1), cy - a1 * k * Math.sin(th1)], p2 = [cx + a2 * k * Math.cos(th2), cy - a2 * k * Math.sin(th2)];
      ring(c, cx, cy, a1 * k, C.line); ring(c, cx, cy, a2 * k, C.line); disc(c, cx, cy, 7, C.sun);
      const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy);
      line(c, p1[0], p1[1], p1[0] + dx / L * R * 2.2, p1[1] + dy / L * R * 2.2, C.muted, 1, [3, 4]);
      disc(c, p1[0], p1[1], 5, C.blue); disc(c, p2[0], p2[1], 5, C.acc);
      // apparent longitude of planet 2 seen from planet 1
      const lam = Math.atan2(-(dy), dx); trail.push([tt, lam]); if (trail.length > 1500) trail.shift();
      const sep = Math.atan2(Math.sin(th2 - th1), Math.cos(th2 - th1)); if (lastSep !== null && Math.sign(sep) !== Math.sign(lastSep) && Math.abs(sep) < 1) conj++; lastSep = sep;
      // strip chart
      const y0 = Hs + 14, h = H - y0 - 22, x0 = 46, w = W - x0 - 12, span = Math.max(3 * 1 / Math.abs(1 / v.P1 - 1 / v.P2), 2);
      c.strokeStyle = C.line; c.strokeRect(x0, y0, w, h); text(c, 'arah tampak planet luar', x0 + 6, y0 + 10, C.muted); text(c, 'waktu →', x0 + w, y0 + h + 12, C.muted, 'right');
      c.strokeStyle = C.acc; c.lineWidth = 1.6; c.beginPath(); let started = false;
      const t0 = Math.max(0, tt - span);
      let pts = [], acc = 0, pl = null; for (const [ti, li] of trail) { if (pl !== null) { let d = li - pl; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; acc += d; } pl = li; if (ti >= t0) pts.push([ti, acc]); }
      if (pts.length > 1) { const lo = Math.min(...pts.map(p => p[1])), hi = Math.max(...pts.map(p => p[1])), rg = Math.max(hi - lo, 0.5); pts.forEach(([ti, a], i) => { const x = x0 + (ti - t0) / span * w, y = y0 + h - (a - lo) / rg * (h - 6) - 3; started ? c.lineTo(x, y) : (c.moveTo(x, y), started = true); }); c.stroke(); }
      const S = 1 / Math.abs(1 / v.P1 - 1 / v.P2);
      return { S: fmt(S, 3) + ' th', Sd: fmt(S * 365.25, 0) + ' hari', tt: fmt(tt, 2) + ' th', cj: String(conj) };
    }
  });
};

/* ================= 4. Kepler orbit ================= */
LAB.kepler = el => {
  mkLab(el, {
    title: 'Hukum Kepler: elips & luas sapuan', hint: 'Sektor berwarna disapu dalam selang waktu yang sama (1/12 periode). Luasnya sama, bentuknya berbeda. Ubah eksentrisitas dan setengah sumbu panjang.', aspect: 0.6, anim: true,
    controls: [{ k: 'e', label: 'Eksentrisitas e', min: 0, max: 0.9, step: 0.01, val: 0.5, fmt: x => fmt(x, 2) }, { k: 'a', label: 'Setengah sumbu panjang a', min: 0.3, max: 40, log: true, val: 1, unit: 'AU', fmt: x => fmt(x, 2) }, { k: 'sec', label: 'Tampilkan sektor', type: 'toggle', val: true }],
    presets: [{ label: 'Bumi', set: { e: 0.017, a: 1 } }, { label: 'Merkurius', set: { e: 0.206, a: 0.387 } }, { label: 'Mars', set: { e: 0.093, a: 1.524 } }, { label: 'Halley', set: { e: 0.9, a: 17.8 } }],
    outputs: [['P', 'Periode'], ['rp', 'Perihelion / aphelion'], ['vp', 'v perihelion / aphelion'], ['ratio', 'v_p / v_a'], ['now', 'Jarak & kecepatan saat ini']],
    draw(c, W, H, v, C, t) {
      const e = v.e, A = Math.min(W * 0.4, H * 0.8 / (2 * Math.sqrt(1 - e * e)) * 1, H * 0.62), B = A * Math.sqrt(1 - e * e), cx = W * 0.48, cy = H / 2, fx = cx + A * e;
      const pos = M => { let E = M; for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return [cx + A * Math.cos(E), cy - B * Math.sin(E), E]; };
      if (v.sec) for (let s = 0; s < 12; s += 2) { c.fillStyle = C.blue; c.globalAlpha = 0.18; c.beginPath(); c.moveTo(fx, cy); for (let i = 0; i <= 30; i++) { const p = pos(TAU * (s + i / 30) / 12); c.lineTo(p[0], p[1]); } c.closePath(); c.fill(); c.globalAlpha = 1; }
      c.strokeStyle = C.fg; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy, A, B, 0, 0, TAU); c.stroke();
      line(c, cx - A, cy, cx + A, cy, C.line, 1, [3, 4]); disc(c, fx, cy, 9, C.sun); disc(c, cx - A * e, cy, 2.5, C.muted);
      const M = (t * 0.5) % TAU, p = pos(M); line(c, fx, cy, p[0], p[1], C.acc, 1); disc(c, p[0], p[1], 6, C.acc);
      text(c, 'perihelion', cx + A + 6, cy - 12, C.muted); text(c, 'aphelion', cx - A - 6, cy - 12, C.muted, 'right');
      const GM = 1.327e20, AU = 1.496e11, a = v.a * AU, rp = a * (1 - e), ra = a * (1 + e), r = a * (1 - e * Math.cos(p[2]));
      const vv = rr => Math.sqrt(GM * (2 / rr - 1 / a)) / 1000, P = Math.pow(v.a, 1.5);
      return { P: P < 2 ? fmt(P * 365.25, 1) + ' hari' : fmt(P, 2) + ' tahun', rp: fmt(v.a * (1 - e), 3) + ' / ' + fmt(v.a * (1 + e), 3) + ' AU', vp: fmt(vv(rp), 1) + ' / ' + fmt(vv(ra), 1) + ' km/s', ratio: fmt((1 + e) / (1 - e), 2) + ' = (1+e)/(1−e)', now: fmt(r / AU, 3) + ' AU · ' + fmt(vv(r), 1) + ' km/s' };
    }
  });
};

/* ================= 5. Moon phases ================= */
LAB.fase = el => {
  mkLab(el, {
    title: 'Simulator fase Bulan', hint: 'Geser umur Bulan sejak bulan baru. Kiri: tampak atas (sinar Matahari dari kanan). Kanan: Bulan yang terlihat dari Bumi.', aspect: 0.5,
    controls: [{ k: 'age', label: 'Umur Bulan', min: 0, max: 29.53, step: 0.01, val: 7.4, unit: 'hari', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Bulan baru', set: { age: 0 } }, { label: 'Kuartir awal', set: { age: 7.38 } }, { label: 'Purnama', set: { age: 14.77 } }, { label: 'Kuartir akhir', set: { age: 22.15 } }],
    outputs: [['ph', 'Fase'], ['E', 'Elongasi'], ['k', 'Fraksi terang'], ['rise', 'Terbit / transit / terbenam (kira-kira)']],
    draw(c, W, H, v, C, t) {
      const E = v.age / 29.53 * 360, Er = E * D2R, cx = W * 0.27, cy = H / 2, Ro = Math.min(W * 0.2, H * 0.36);
      for (let i = 0; i < 5; i++) { const y = cy - Ro + i * Ro / 2; line(c, W * 0.52, y, W * 0.47, y, C.sun, 1); }
      text(c, 'sinar Matahari', W * 0.5, cy - Ro - 14, C.muted, 'center');
      ring(c, cx, cy, Ro, C.line, 1, [3, 4]); disc(c, cx, cy, 13, C.blue); text(c, 'Bumi', cx, cy + 26, C.muted, 'center');
      const mx = cx + Ro * Math.cos(Er), my = cy - Ro * Math.sin(Er), mr = 9;
      disc(c, mx, my, mr, C.line); c.fillStyle = C.ink; c.beginPath(); c.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill();
      // seen from Earth
      const sx = W * 0.75, R = Math.min(W * 0.17, H * 0.38), k = (1 - Math.cos(Er)) / 2;
      disc(c, sx, cy, R, C.line); c.fillStyle = C.ink;
      const waxing = E <= 180, rx = R * Math.abs(Math.cos(Er));
      c.beginPath(); c.arc(sx, cy, R, -Math.PI / 2, Math.PI / 2, !waxing); c.ellipse(sx, cy, rx, R, 0, Math.PI / 2, -Math.PI / 2, (k > 0.5) === waxing ? false : true); c.fill();
      text(c, waxing ? 'membesar (waxing)' : 'mengecil (waning)', sx, cy + R + 16, C.muted, 'center');
      const ph = v.age < 0.5 || v.age > 29 ? 'Bulan baru' : v.age < 6.9 ? 'Sabit muda' : v.age < 7.9 ? 'Kuartir awal' : v.age < 14.2 ? 'Cembung (membesar)' : v.age < 15.3 ? 'Purnama' : v.age < 21.6 ? 'Cembung (mengecil)' : v.age < 22.7 ? 'Kuartir akhir' : 'Sabit tua';
      const hh = h => { h = ((h % 24) + 24) % 24; const H_ = Math.floor(h), m = Math.round((h - H_) * 60); return String(H_ + (m === 60 ? 1 : 0)).padStart(2, '0') + '.' + String(m % 60).padStart(2, '0'); };
      const lag = E / 15;
      return { ph, E: fmt(E, 0) + '°', k: fmt(k * 100, 0) + '%', rise: hh(6 + lag) + ' / ' + hh(12 + lag) + ' / ' + hh(18 + lag) };
    }
  });
};

/* ================= 6. equilibrium temperature ================= */
LAB.suhu = el => {
  const pl = [['Merkurius', 0.387, 0.088], ['Venus', 0.723, 0.76], ['Bumi', 1, 0.30], ['Mars', 1.524, 0.25], ['Jupiter', 5.2, 0.50], ['Saturnus', 9.58, 0.34], ['Neptunus', 30.1, 0.29]];
  mkLab(el, {
    title: 'Suhu kesetimbangan planet', hint: 'Kurva menunjukkan suhu kesetimbangan terhadap jarak untuk albedo dan luminositas bintang yang dipilih. Pita biru: rentang air cair (273–373 K) pada tekanan 1 atm.', aspect: 0.62,
    controls: [{ k: 'd', label: 'Jarak d', min: 0.1, max: 50, log: true, val: 1, unit: 'AU', fmt: x => fmt(x, 2) }, { k: 'A', label: 'Albedo A', min: 0, max: 0.95, step: 0.01, val: 0.3, fmt: x => fmt(x, 2) }, { k: 'L', label: 'Luminositas bintang', min: 0.01, max: 100, log: true, val: 1, unit: 'L☉', fmt: x => fmt(x, 2) }],
    presets: pl.map(([n, d, A]) => ({ label: n, set: { d, A, L: 1 } })),
    outputs: [['T', 'Suhu kesetimbangan'], ['C', 'Dalam °C'], ['S', 'Fluks (× Bumi)'], ['hz', 'Zona "air cair" (A ini)']],
    draw(c, W, H, v, C) {
      const T0 = 278.3, T = d => T0 * Math.pow(1 - v.A, 0.25) * Math.pow(v.L, 0.25) / Math.sqrt(d);
      const ax = axes(c, C, [56, 14, W - 72, H - 60], [0.1, 50], [20, 1500], { xlog: true, ylog: true, xt: [0.1, 0.3, 1, 3, 10, 30], yt: [30, 100, 300, 1000], xl: 'jarak (AU)', yl: 'T (K)' });
      const y1 = ax.Y(373), y0 = ax.Y(273); c.fillStyle = C.blue; c.globalAlpha = 0.15; c.fillRect(56, y1, W - 72, y0 - y1); c.globalAlpha = 1;
      c.strokeStyle = C.acc; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 100; i++) { const d = 0.1 * Math.pow(500, i / 100), x = ax.X(d), y = Math.max(14, Math.min(H - 46, ax.Y(T(d)))); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      pl.forEach(([n, d, A]) => { const Tp = T0 * Math.pow(1 - A, 0.25) / Math.sqrt(d), x = ax.X(d), y = ax.Y(Tp); disc(c, x, y, 3.5, C.muted); text(c, n, x + 5, y - 9, C.muted); });
      const Tn = T(v.d); disc(c, ax.X(v.d), ax.Y(Tn), 6, C.acc);
      const din = Math.pow(T0 * Math.pow(1 - v.A, 0.25) * Math.pow(v.L, 0.25) / 373, 2), dout = Math.pow(T0 * Math.pow(1 - v.A, 0.25) * Math.pow(v.L, 0.25) / 273, 2);
      return { T: fmt(Tn, 0) + ' K', C: fmt(Tn - 273.15, 0) + ' °C', S: fmt(v.L / v.d / v.d, 3), hz: fmt(din, 2) + ' – ' + fmt(dout, 2) + ' AU' };
    }
  });
};

/* ================= 7. blackbody ================= */
function bbColor(T) { // approximate sRGB of a blackbody (Tanner Helland fit)
  const t = T / 100; let r, g, b;
  r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332); g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755); b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305;
  const k = q => Math.round(Math.max(0, Math.min(255, q))); return `rgb(${k(r)},${k(g)},${k(b)})`;
}
LAB.bendahitam = el => {
  const planck = (l, T) => { const h = 6.626e-34, c = 2.998e8, k = 1.381e-23; return 2 * h * c * c / Math.pow(l, 5) / (Math.exp(h * c / (l * k * T)) - 1); };
  mkLab(el, {
    title: 'Kurva benda hitam', hint: 'Garis putus-putus: Matahari (5772 K). Puncak bergeser sesuai hukum Wien; luas di bawah kurva ∝ T⁴. Pita warna menandai cahaya tampak.', aspect: 0.6,
    controls: [{ k: 'T', label: 'Suhu T', min: 2000, max: 30000, log: true, val: 5772, unit: 'K', fmt: x => fmt(x, 0) }, { k: 'norm', label: 'Skala tetap (bandingkan tinggi)', type: 'toggle', val: false }],
    presets: [{ label: 'Betelgeuse 3500 K', set: { T: 3500 } }, { label: 'Matahari 5772 K', set: { T: 5772 } }, { label: 'Sirius A 9940 K', set: { T: 9940 } }, { label: 'Rigel 12 100 K', set: { T: 12100 } }, { label: 'Bintang O 30 000 K', set: { T: 30000 } }],
    outputs: [['lm', 'λ puncak (Wien)'], ['F', 'Fluks per m² (× Matahari)'], ['col', 'Warna kira-kira'], ['band', 'Puncak di daerah']],
    draw(c, W, H, v, C) {
      const l0 = 100e-9, l1 = 3000e-9, ref = planck(2.898e-3 / 5772, 5772), mx = v.norm ? planck(2.898e-3 / 30000, 30000) : Math.max(planck(2.898e-3 / v.T, v.T), ref) * 1.08;
      const ax = axes(c, C, [52, 14, W - 66, H - 58], [100, 3000], [0, 1], { xt: [400, 700, 1000, 1500, 2000, 2500, 3000], xl: 'panjang gelombang (nm)', yl: 'intensitas', ylo: 22 });
      for (let l = 380; l < 700; l += 4) { c.fillStyle = OSN.wl2rgb(l); c.globalAlpha = 0.35; c.fillRect(ax.X(l), 14, ax.X(l + 4) - ax.X(l) + 0.5, H - 58); } c.globalAlpha = 1;
      const curve = (T, col, w, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (let i = 0; i <= 300; i++) { const l = l0 + (l1 - l0) * i / 300, x = ax.X(l * 1e9), y = Math.max(14, ax.Y(planck(l, T) / mx)); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); };
      curve(5772, C.muted, 1.4, [5, 4]); curve(v.T, C.acc, 2.4);
      const lm = 2.898e-3 / v.T * 1e9; if (lm >= 100 && lm <= 3000) line(c, ax.X(lm), 14, ax.X(lm), H - 44, C.acc, 1, [2, 3]);
      disc(c, W - 34, 34, 16, bbColor(v.T)); ring(c, W - 34, 34, 16, C.line);
      const band = lm < 380 ? 'ultraviolet' : lm <= 700 ? 'cahaya tampak' : 'inframerah';
      return { lm: fmt(lm, 0) + ' nm', F: fmt(Math.pow(v.T / 5772, 4), 3), col: `<span class="swatch" style="background:${bbColor(v.T)}"></span>`, band };
    }
  });
};

/* ================= 8. parallax + distance modulus ================= */
LAB.paralaks = el => {
  mkLab(el, {
    title: 'Paralaks bintang', hint: 'Bumi di dua posisi (Januari & Juli). Bintang dekat tampak bergeser terhadap bintang latar. Gambar tidak sesuai skala: pergeseran nyata selalu < 1″.', aspect: 0.62, anim: true,
    controls: [{ k: 'd', label: 'Jarak bintang d', min: 1.3, max: 1000, log: true, val: 4, unit: 'pc', fmt: x => fmt(x, 2) }, { k: 'm', label: 'Magnitudo semu m (modulus jarak)', min: -2, max: 20, step: 0.1, val: 5, fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Proxima 1,30 pc', set: { d: 1.301 } }, { label: 'Sirius 2,64 pc', set: { d: 2.64 } }, { label: 'Vega 7,68 pc', set: { d: 7.68 } }, { label: 'Betelgeuse ~168 pc', set: { d: 168 } }],
    outputs: [['p', 'Paralaks p = 1/d'], ['ly', 'Jarak'], ['M', 'Magnitudo mutlak M = m − 5 log d + 5'], ['dm', 'Modulus jarak m − M']],
    draw(c, W, H, v, C, t) {
      const sx = W * 0.32, sy = H * 0.8, Ro = Math.min(W * 0.16, H * 0.16), py = H * 0.8 - (H * 0.62) * (1 - Math.log10(v.d / 1.3) / Math.log10(1000 / 1.3) * 0.7);
      const s = (Math.sin(t * 1.2) + 1) / 2, ex = sx + Ro * (s * 2 - 1);
      ring(c, sx, sy, Ro, C.line, 1, [3, 4]); disc(c, sx, sy, 8, C.sun); disc(c, sx - Ro, sy, 5, C.blue); disc(c, sx + Ro, sy, 5, C.blue); disc(c, ex, sy, 6, C.blue);
      text(c, 'Januari', sx - Ro, sy + 16, C.muted, 'center'); text(c, 'Juli', sx + Ro, sy + 16, C.muted, 'center'); text(c, '1 AU', sx + Ro / 2, sy - 10, C.muted, 'center');
      disc(c, sx, py, 5, C.acc); text(c, 'bintang dekat', sx + 10, py, C.acc);
      line(c, sx - Ro, sy, sx, py, C.muted, 1, [3, 3]); line(c, sx + Ro, sy, sx, py, C.muted, 1, [3, 3]); line(c, sx, sy, sx, py, C.line, 1);
      text(c, 'p', sx + 4, py + 22, C.acc, 'left', `italic 13px ${C.ui}`); c.font = `12px ${C.ui}`;
      // sky inset
      const bx = W * 0.62, bw = W * 0.34, by = 18, bh = H * 0.5; c.strokeStyle = C.line; c.strokeRect(bx, by, bw, bh); text(c, 'langit yang terlihat', bx + bw / 2, by + bh + 14, C.muted, 'center');
      const rnd = OSN._stars || (OSN._stars = Array.from({ length: 40 }, (_, i) => [((i * 97) % 100) / 100, ((i * 57 + 13) % 100) / 100, 0.6 + ((i * 31) % 10) / 10]));
      rnd.forEach(([x, y, r]) => disc(c, bx + x * bw, by + y * bh, r, C.muted));
      const shift = Math.min(0.42, 0.42 * 1.3 / v.d) * (s * 2 - 1); disc(c, bx + bw / 2 - shift * bw, by + bh / 2, 4.5, C.acc);
      const p = 1 / v.d, M = v.m - 5 * Math.log10(v.d) + 5;
      return { p: fmt(p, 4) + '″ = ' + fmt(p * 1000, 1) + ' mas', ly: fmt(v.d, 2) + ' pc = ' + fmt(v.d * 3.2616, 2) + ' tc = ' + fmt(v.d * 206265, 0) + ' AU', M: fmt(M, 2), dm: fmt(v.m - M, 2) };
    }
  });
};

/* ================= 9. HR diagram ================= */
LAB.hr = el => {
  const stars = [['Matahari', 1, 5772], ['Sirius A', 25.4, 9940], ['Sirius B', 0.056, 25000], ['Vega', 40, 9600], ['Proxima', 0.0017, 3040], ['Betelgeuse', 1e5, 3600], ['Rigel', 1.2e5, 12100], ['Aldebaran', 440, 3900], ['Arcturus', 170, 4290], ['Spica', 20500, 25300], ['Polaris', 1260, 6000], ['Procyon B', 0.00049, 7740]];
  const msL = M => M < 0.43 ? 0.23 * Math.pow(M, 2.3) : M < 2 ? Math.pow(M, 4) : 1.4 * Math.pow(M, 3.5);
  const msR = M => M < 1 ? Math.pow(M, 0.8) : Math.pow(M, 0.57);
  const msT = M => 5772 * Math.pow(msL(M) / (msR(M) ** 2), 0.25);
  mkLab(el, {
    title: 'Diagram Hertzsprung–Russell', hint: 'Garis tipis diagonal: jari-jari konstan. Geser massa bintang deret utama untuk melihat posisinya, jari-jari, dan umurnya (relasi pendekatan).', aspect: 0.72,
    controls: [{ k: 'M', label: 'Massa bintang deret utama', min: 0.1, max: 40, log: true, val: 1, unit: 'M☉', fmt: x => fmt(x, 2) }],
    presets: [{ label: '0,2 M☉', set: { M: 0.2 } }, { label: '1 M☉', set: { M: 1 } }, { label: '2 M☉', set: { M: 2 } }, { label: '10 M☉', set: { M: 10 } }, { label: '30 M☉', set: { M: 30 } }],
    outputs: [['L', 'Luminositas'], ['T', 'Suhu efektif'], ['R', 'Jari-jari'], ['t', 'Umur deret utama ≈ 10¹⁰ M/L tahun'], ['cls', 'Kelas spektrum kira-kira']],
    draw(c, W, H, v, C) {
      const box = [58, 14, W - 74, H - 58], xr = [40000, 2500], yr = [1e-4, 1e6];
      const X = T => box[0] + (Math.log10(xr[0]) - Math.log10(T)) / (Math.log10(xr[0]) - Math.log10(xr[1])) * box[2];
      const Y = L => box[1] + box[3] - (Math.log10(L) - Math.log10(yr[0])) / (Math.log10(yr[1]) - Math.log10(yr[0])) * box[3];
      c.strokeStyle = C.line; c.strokeRect(...box); c.font = `11px ${C.ui}`;
      [30000, 10000, 6000, 4000, 3000].forEach(T => { const x = X(T); line(c, x, box[1] + box[3], x, box[1] + box[3] + 4, C.muted); text(c, T.toLocaleString('id-ID'), x, box[1] + box[3] + 14, C.muted, 'center'); });
      [1e-4, 1e-2, 1, 1e2, 1e4, 1e6].forEach(L => { const y = Y(L); line(c, box[0] - 4, y, box[0], y, C.muted); text(c, '10' + sup(Math.log10(L)), box[0] - 7, y, C.muted, 'right'); });
      text(c, 'suhu efektif (K) — makin panas ke kiri', box[0] + box[2] / 2, box[1] + box[3] + 30, C.fg, 'center');
      c.save(); c.translate(16, box[1] + box[3] / 2); c.rotate(-Math.PI / 2); text(c, 'L / L☉', 0, 0, C.fg, 'center'); c.restore();
      c.save(); c.beginPath(); c.rect(...box); c.clip();
      [0.01, 0.1, 1, 10, 100, 1000].forEach(Rr => { const lbl = Rr <= 100; c.strokeStyle = C.line; c.setLineDash([2, 4]); c.beginPath(); [40000, 2500].forEach((T, i) => { const L = Rr * Rr * Math.pow(T / 5772, 4); i ? c.lineTo(X(T), Y(L)) : c.moveTo(X(T), Y(L)); }); c.stroke(); c.setLineDash([]); const Tl = 2900, Ll = Rr * Rr * Math.pow(Tl / 5772, 4); if (lbl && Ll > 2e-4 && Ll < 5e5) text(c, Rr + ' R☉', X(Tl) - 4, Y(Ll) - 8, C.muted, 'right'); });
      c.strokeStyle = C.blue; c.lineWidth = 7; c.globalAlpha = 0.25; c.beginPath(); for (let i = 0; i <= 80; i++) { const M = 0.08 * Math.pow(60 / 0.08, i / 80); i ? c.lineTo(X(msT(M)), Y(msL(M))) : c.moveTo(X(msT(M)), Y(msL(M))); } c.stroke(); c.globalAlpha = 1;
      stars.forEach(([n, L, T]) => { disc(c, X(T), Y(L), 4, bbColor(T)); ring(c, X(T), Y(L), 4, C.line); text(c, n, X(T) + 7, Y(L) - 7, C.muted); });
      const L = msL(v.M), T = msT(v.M), R = msR(v.M); disc(c, X(T), Y(L), 8, C.acc); ring(c, X(T), Y(L), 11, C.acc, 1.5);
      c.restore();
      text(c, 'deret utama', X(9000) + 6, Y(msL(2.2)) + 28, C.blue); text(c, 'raksasa', X(4600), Y(40), C.muted, 'center'); text(c, 'katai putih', X(15000), Y(0.0015) + 18, C.muted, 'center');
      const life = 1e10 * v.M / L, cls = T > 30000 ? 'O' : T > 10000 ? 'B' : T > 7500 ? 'A' : T > 6000 ? 'F' : T > 5200 ? 'G' : T > 3700 ? 'K' : 'M';
      return { L: fmt(L, 3) + ' L☉', T: fmt(T, 0) + ' K', R: fmt(R, 2) + ' R☉', t: life > 1e9 ? fmt(life / 1e9, 2) + ' miliar tahun' : fmt(life / 1e6, 1) + ' juta tahun', cls: cls + 'V' };
    }
  });
};

/* ================= 10. transit / eclipsing binary ================= */
LAB.transit = el => {
  mkLab(el, {
    title: 'Kurva cahaya transit & biner gerhana', hint: 'Benda kecil mengorbit bintang. Kecerahan permukaan 0 = planet (satu minimum); lebih besar = bintang pendamping (muncul minimum sekunder).', aspect: 0.78, anim: true,
    controls: [{ k: 'k', label: 'Rasio jari-jari R₂/R₁', min: 0.02, max: 0.6, step: 0.005, val: 0.1, fmt: x => fmt(x, 3) }, { k: 'b', label: 'Parameter dampak b', min: 0, max: 1.2, step: 0.01, val: 0.2, fmt: x => fmt(x, 2) }, { k: 'J', label: 'Kecerahan permukaan pendamping', min: 0, max: 1, step: 0.01, val: 0, fmt: x => fmt(x, 2) }, { k: 'ld', label: 'Penggelapan tepi (limb darkening)', type: 'toggle', val: true }],
    presets: [{ label: 'Jupiter panas', set: { k: 0.1, b: 0.2, J: 0 } }, { label: 'Bumi (diperbesar)', set: { k: 0.03, b: 0.1, J: 0 } }, { label: 'Biner gerhana', set: { k: 0.5, b: 0.15, J: 0.45 } }, { label: 'Grazing', set: { k: 0.12, b: 1.02, J: 0 } }],
    outputs: [['dep', 'Kedalaman maksimum'], ['k2', '(R₂/R₁)²'], ['sec', 'Minimum sekunder']],
    draw(c, W, H, v, C, t) {
      const aR = 4, u = v.ld ? 0.6 : 0, I = r => 1 - u * (1 - Math.sqrt(Math.max(0, 1 - r * r)));
      const tot = Math.PI * (1 - u / 3), N = 24;
      const occ = (x, y, rad) => { let s = 0, n = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const px = -1 + 2 * (i + 0.5) / N, py = -1 + 2 * (j + 0.5) / N; if (px * px + py * py > 1) continue; n++; const X = x + px * rad, Y = y + py * rad, r = Math.hypot(X, Y); if (r < 1) s += I(r); } return n ? s / n * Math.PI * rad * rad : 0; };
      const flux = ph => { const x = aR * Math.sin(TAU * ph), front = Math.cos(TAU * ph) > 0, y = v.b; const F1 = tot, F2 = v.J * Math.PI * v.k * v.k;
        if (front) return (F1 - occ(x, y, v.k) + F2) / (F1 + F2);
        const d = Math.hypot(x, y); let cov = 0; if (d < 1 - v.k) cov = 1; else if (d < 1 + v.k) { const r = v.k, R = 1, a = Math.acos((d * d + r * r - R * R) / (2 * d * r)), b2 = Math.acos((d * d + R * R - r * r) / (2 * d * R)); cov = (r * r * (a - Math.sin(2 * a) / 2) + R * R * (b2 - Math.sin(2 * b2) / 2)) / (Math.PI * r * r); }
        return (F1 + F2 * (1 - cov)) / (F1 + F2); };
      const ph = (t * 0.06) % 1, sx = W / 2, sy = H * 0.24, Rs = Math.min(H * 0.17, W * 0.12);
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, Rs); g.addColorStop(0, C.sun); g.addColorStop(1, v.ld ? 'rgba(200,110,40,0.75)' : C.sun);
      const x = aR * Math.sin(TAU * ph), front = Math.cos(TAU * ph) > 0, cx2 = sx + x * Rs, cy2 = sy - v.b * Rs, comp = v.J > 0 ? C.blue : C.ink;
      if (!front) disc(c, cx2, cy2, v.k * Rs, comp);
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, Rs, 0, TAU); c.fill();
      if (front) disc(c, cx2, cy2, v.k * Rs, v.J > 0 ? C.blue : '#111');
      // light curve
      const y0 = H * 0.5, h = H * 0.42, x0 = 54, w = W - x0 - 14;
      let mn = 1, sec = 1; const pts = []; for (let i = 0; i <= 400; i++) { const p = i / 400 - 0.25, f = flux(p); pts.push(f); if (Math.abs(p) < 0.2) mn = Math.min(mn, f); else sec = Math.min(sec, f); }
      const lo = Math.min(mn, sec) - (1 - Math.min(mn, sec)) * 0.15 - 1e-5, Y = f => y0 + (1 - f) / (1 - lo) * h;
      c.strokeStyle = C.line; c.strokeRect(x0, y0 - 6, w, h + 12); text(c, '1,00', x0 - 6, Y(1), C.muted, 'right'); text(c, fmt(lo, 4), x0 - 6, Y(lo), C.muted, 'right'); text(c, 'fase orbit →', x0 + w, y0 + h + 18, C.muted, 'right');
      c.strokeStyle = C.acc; c.lineWidth = 2; c.beginPath(); pts.forEach((f, i) => { const X = x0 + i / 400 * w; i ? c.lineTo(X, Y(f)) : c.moveTo(X, Y(f)); }); c.stroke();
      let pc = ph + 0.25; if (pc >= 1) pc -= 1; disc(c, x0 + pc * w, Y(flux(ph)), 4.5, C.fg);
      return { dep: fmt((1 - mn) * 100, 3) + '%', k2: fmt(v.k * v.k * 100, 3) + '%', sec: v.J > 0 ? fmt((1 - sec) * 100, 3) + '%' : 'tidak ada (planet gelap)' };
    }
  });
};

/* ================= 11. galaxy rotation curve ================= */
LAB.rotasi = el => {
  const obs = [[1, 210], [2, 220], [3, 215], [4, 210], [5, 215], [6, 222], [8.2, 230], [10, 228], [12, 226], [14, 224], [16, 222], [18, 221], [20, 220], [22, 218], [25, 215]];
  mkLab(el, {
    title: 'Kurva rotasi galaksi & materi gelap', hint: 'Titik: kurva rotasi mirip Bima Sakti (disederhanakan). Garis putus-putus: kontribusi materi terlihat (tonjolan + piringan) dan halo. Atur halo agar cocok dengan data.', aspect: 0.62,
    controls: [{ k: 'Mb', label: 'Massa tonjolan', min: 0, max: 4e10, step: 1e9, val: 1e10, unit: 'M☉', fmt: x => fmt(x, 1) }, { k: 'Md', label: 'Massa piringan', min: 0, max: 1.2e11, step: 1e9, val: 6.5e10, unit: 'M☉', fmt: x => fmt(x, 1) }, { k: 'vh', label: 'Kecepatan asimtotik halo', min: 0, max: 260, step: 1, val: 205, unit: 'km/s', fmt: x => fmt(x, 0) }, { k: 'r', label: 'Jari-jari penanda r', min: 1, max: 25, step: 0.1, val: 8.2, unit: 'kpc', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Tanpa materi gelap', set: { vh: 0 } }, { label: 'Dengan halo', set: { Mb: 1e10, Md: 6.5e10, vh: 205 } }],
    outputs: [['v', 'v(r) model'], ['M', 'Massa tercakup M(<r)'], ['vis', 'Fraksi materi terlihat'], ['P', 'Periode orbit di r']],
    draw(c, W, H, v, C) {
      const G = 4.30091e-6; // kpc (km/s)^2 / Msun
      const rd = 3, rc = 4;
      const vb = r => Math.sqrt(G * v.Mb / r), vd = r => { const x = r / rd; return Math.sqrt(G * v.Md * (1 - Math.exp(-x) * (1 + x)) / r); }, vhf = r => v.vh * Math.sqrt(Math.max(0, 1 - rc / r * Math.atan(r / rc)));
      const vt = r => Math.sqrt(vb(r) ** 2 + vd(r) ** 2 + vhf(r) ** 2);
      const ax = axes(c, C, [52, 14, W - 66, H - 58], [0, 26], [0, 300], { xt: [0, 5, 10, 15, 20, 25], yt: [0, 100, 200, 300], xl: 'jarak dari pusat r (kpc)', yl: 'v (km/s)' });
      const plot = (f, col, w, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (let i = 1; i <= 200; i++) { const r = 0.2 + 25.8 * i / 200, x = ax.X(r), y = Math.max(14, ax.Y(f(r))); i > 1 ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); };
      plot(r => Math.sqrt(vb(r) ** 2 + vd(r) ** 2), C.warn, 1.5, [5, 4]); plot(vhf, C.blue, 1.5, [5, 4]); plot(vt, C.acc, 2.4);
      obs.forEach(([r, vv]) => { disc(c, ax.X(r), ax.Y(vv), 3.5, C.fg); });
      line(c, ax.X(v.r), 14, ax.X(v.r), H - 44, C.muted, 1, [2, 3]);
      text(c, 'terlihat', ax.X(24), ax.Y(Math.sqrt(vb(24) ** 2 + vd(24) ** 2)) - 10, C.warn, 'right'); text(c, 'halo', ax.X(24), ax.Y(vhf(24)) + 12, C.blue, 'right'); text(c, 'total', ax.X(24), ax.Y(vt(24)) - 10, C.acc, 'right');
      const V = vt(v.r), M = V * V * v.r / G, Mv = (vb(v.r) ** 2 + vd(v.r) ** 2) * v.r / G, P = 2 * Math.PI * v.r * 3.086e16 / V / 3.156e7 / 1e6;
      return { v: fmt(V, 0) + ' km/s', M: fmt(M, 2) + ' M☉', vis: fmt(Mv / M * 100, 0) + '%', P: fmt(P, 0) + ' juta tahun' };
    }
  });
};

/* ================= 12. Hubble diagram ================= */
LAB.hubble = el => {
  const data = (() => { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; return Array.from({ length: 14 }, (_, i) => { const d = 8 + i * 13 + r() * 8; return [d, 70 * d + (r() - 0.5) * 2 * 380]; }); })();
  const best = data.reduce((a, [d, v]) => a + d * v, 0) / data.reduce((a, [d]) => a + d * d, 0);
  mkLab(el, {
    title: 'Ukur konstanta Hubble sendiri', hint: 'Titik: data galaksi tiruan (jarak dari Cepheid/supernova, kecepatan dari redshift) dengan ralat realistis. Geser H₀ sampai garis paling cocok, atau tekan "Garis terbaik".', aspect: 0.62,
    controls: [{ k: 'H0', label: 'Konstanta Hubble H₀', min: 40, max: 100, step: 0.1, val: 55, unit: 'km/s/Mpc', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Garis terbaik', set: { H0: Math.round(best * 10) / 10 } }, { label: 'Hubble 1929 (~500)', set: { H0: 100 } }],
    outputs: [['H', 'H₀ pilihanmu'], ['tH', 'Waktu Hubble 1/H₀'], ['rms', 'Sebaran residual (rms)'], ['best', 'Regresi melalui titik asal']],
    draw(c, W, H, v, C) {
      const ax = axes(c, C, [62, 14, W - 76, H - 58], [0, 200], [0, 15000], { xt: [0, 50, 100, 150, 200], yt: [0, 5000, 10000, 15000], yf: q => (q / 1000) + 'k', xl: 'jarak (Mpc)', yl: 'kecepatan resesi (km/s)', ylo: 50 });
      line(c, ax.X(0), ax.Y(0), ax.X(200), Math.max(14, ax.Y(v.H0 * 200)), C.acc, 2);
      let ss = 0; data.forEach(([d, vv]) => { const yf = ax.Y(v.H0 * d); line(c, ax.X(d), ax.Y(vv), ax.X(d), yf, C.line, 1); disc(c, ax.X(d), ax.Y(vv), 4, C.fg); ss += (vv - v.H0 * d) ** 2; });
      return { H: fmt(v.H0, 1) + ' km/s/Mpc', tH: fmt(977.8 / v.H0, 2) + ' miliar tahun', rms: fmt(Math.sqrt(ss / data.length), 0) + ' km/s', best: fmt(best, 1) + ' km/s/Mpc' };
    }
  });
};

/* ================= 13. telescope ================= */
LAB.teleskop = el => {
  mkLab(el, {
    title: 'Kalkulator & diagram teleskop', hint: 'Diagram refraktor sederhana: objektif membentuk bayangan di titik fokus, okuler memperbesarnya. Semua besaran dihitung dari nilai yang kamu atur.', aspect: 0.42,
    controls: [{ k: 'D', label: 'Diameter bukaan D', min: 20, max: 1000, log: true, val: 200, unit: 'mm', fmt: x => fmt(x, 0) }, { k: 'f', label: 'Panjang fokus objektif', min: 200, max: 5000, log: true, val: 1200, unit: 'mm', fmt: x => fmt(x, 0) }, { k: 'fe', label: 'Panjang fokus okuler', min: 3, max: 40, step: 0.5, val: 25, unit: 'mm', fmt: x => fmt(x, 1) }, { k: 'lam', label: 'Panjang gelombang λ', min: 400, max: 800, step: 1, val: 550, unit: 'nm', fmt: x => fmt(x, 0) }],
    presets: [{ label: 'Binokular 50 mm', set: { D: 50, f: 200, fe: 28 } }, { label: 'Dobson 200 mm', set: { D: 200, f: 1200, fe: 25 } }, { label: 'Zeiss Bosscha 600 mm', set: { D: 600, f: 10700, fe: 25 } }],
    outputs: [['N', 'Rasio fokus N = f/D'], ['M', 'Perbesaran'], ['ep', 'Pupil keluar D/M'], ['lg', 'Daya kumpul (× mata 7 mm)'], ['res', 'Daya pisah 1,22λ/D'], ['ml', 'Magnitudo batas ≈ 6 + 5 log(D/7)'], ['ps', 'Skala bidang']],
    draw(c, W, H, v, C) {
      const tot = v.f + v.fe, sc = (W - 60) / tot, x0 = 30, cy = H / 2, hD = Math.min(H * 0.38, 18 + Math.log10(v.D) * 18), xf = x0 + v.f * sc, xe = xf + v.fe * sc, he = Math.max(6, hD * v.fe / v.f * 1.4 + 6);
      line(c, 8, cy, W - 8, cy, C.line, 1, [3, 4]);
      c.strokeStyle = C.blue; c.lineWidth = 3; c.beginPath(); c.ellipse(x0, cy, 5, hD, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(xe, cy, 3, he, 0, 0, TAU); c.stroke();
      [-1, 1].forEach(s => { line(c, 6, cy + s * hD, x0, cy + s * hD, C.sun, 1.4); line(c, x0, cy + s * hD, xf, cy, C.sun, 1.4); const ye = cy - s * hD * v.fe / v.f; line(c, xf, cy, xe, ye, C.sun, 1.4); line(c, xe, ye, W - 6, ye, C.sun, 1.4); });
      disc(c, xf, cy, 3, C.acc); text(c, 'titik fokus', xf, cy + hD * 0.55 + 14, C.acc, 'center'); text(c, 'objektif (f = ' + Math.round(v.f) + ' mm)', x0 + 4, cy - hD - 10, C.muted); text(c, 'okuler', xe, cy - he - 10, C.muted, 'center');
      const M = v.f / v.fe, th = 1.22 * v.lam * 1e-9 / (v.D / 1000) * 206265;
      return { N: 'f/' + fmt(v.f / v.D, 1), M: fmt(M, 0) + '×' + (M > 2 * v.D ? ' (melebihi ~2×D: "kosong")' : ''), ep: fmt(v.D / M, 1) + ' mm' + (v.D / M > 7 ? ' (> pupil mata!)' : ''), lg: fmt((v.D / 7) ** 2, 0) + '×', res: fmt(th, 2) + '″' + (th < 1 ? ' (dibatasi seeing ~1″)' : ''), ml: fmt(6 + 5 * Math.log10(v.D / 7), 1), ps: fmt(206265 / v.f, 1) + '″/mm' };
    }
  });
};
})();
