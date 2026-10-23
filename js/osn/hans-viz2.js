/* Visualisations for Hans chapters 5–6 (celestial mechanics, apparent motion). */
(function () {
const F = OSN.FIG, LAB = OSN.LAB, D2R = Math.PI / 180, TAU = Math.PI * 2;
const { txt, svg } = OSN.hfig;
const { mkLab, line, disc, ring, text, fmt } = OSN.labkit;
const arrow = (c, x1, y1, x2, y2, col, w = 1.6) => {
  const L = Math.hypot(x2 - x1, y2 - y1); if (L < 1) return;
  line(c, x1, y1, x2, y2, col, w); const ux = (x2 - x1) / L, uy = (y2 - y1) / L, s = Math.min(7, L * 0.45);
  c.fillStyle = col; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * ux - s * 0.5 * uy, y2 - s * uy + s * 0.5 * ux); c.lineTo(x2 - s * ux + s * 0.5 * uy, y2 - s * uy - s * 0.5 * ux); c.fill();
};
OSN.labkit.arrow = arrow;
/* lit Moon disc for elongation el (0 = new, π = full), northern-hemisphere view: waxing lit on the right */
const moonPhase = (c, x, y, r, el, C) => {
  disc(c, x, y, r, '#2a2f3a'); const wax = Math.sin(el) >= 0, s = wax ? 1 : -1, ce = Math.cos(el);
  c.fillStyle = '#f4efe2'; c.beginPath();
  for (let i = 0; i <= 40; i++) { const t = -Math.PI / 2 + Math.PI * i / 40; c.lineTo(x + s * r * Math.cos(t), y + r * Math.sin(t)); }
  for (let i = 40; i >= 0; i--) { const t = -Math.PI / 2 + Math.PI * i / 40; c.lineTo(x + s * r * ce * Math.cos(t), y + r * Math.sin(t)); }
  c.fill(); ring(c, x, y, r, C.line);
};
OSN.labkit.moonPhase = moonPhase;

/* ---------- Launch speed decides the conic: v = f·√(GM/r0), fired sideways ---------- */
LAB.orbitf = el => {
  let st = null;
  const reset = v => { st = { x: 1, y: 0, vx: 0, vy: v.f, trail: [], done: false, lt: null }; };
  const presets = [[0.25, '0,25'], [Math.SQRT1_2, '√½'], [1, '1'], [Math.sqrt(1.5), '√1,5'], [Math.SQRT2, '√2'], [Math.sqrt(2.5), '√2,5']];
  const lab = mkLab(el, {
    title: 'Satu tembakan, empat bentuk orbit', hint: 'Benda di jarak r₀ ditembakkan tegak lurus arah planet dengan laju v = f·√(GM/r₀). Geser f: lingkaran (f = 1), elips, parabola (f = √2, tepat lolos), hiperbola (f > √2). Garis tipis = orbit untuk nilai-nilai f pada soal 146.', aspect: 0.72, anim: true,
    controls: [{ k: 'f', label: 'Faktor laju f', min: 0.05, max: 1.7, step: 0.005, val: 1, fmt: x => fmt(x, 3) }],
    presets: presets.map(([f, l]) => ({ label: 'f = ' + l, set: { f } })),
    onInput: v => reset(v), onPreset: v => reset(v), reset: v => reset(v),
    draw(c, W, H, v, C, t) {
      if (!st) reset(v);
      const cx = W * 0.44, cy = H * 0.5, s = Math.min(W, H) / 5.2;
      const P = (x, y) => [cx + x * s, cy - y * s];
      ring(c, cx, cy, s, C.line, 1, [3, 5]); text(c, 'r₀', cx + s * 0.7, cy - s * 0.74, C.muted);
      const conic = (f, col, w, dash) => {
        const e = f * f - 1; c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); let pen = false;
        for (let i = 0; i <= 720; i++) { const th = -Math.PI + TAU * i / 720, den = 1 + e * Math.cos(th); if (den <= 0.02) { pen = false; continue; } const r = f * f / den; if (r > 6) { pen = false; continue; } const [X, Y] = P(r * Math.cos(th), r * Math.sin(th)); pen ? c.lineTo(X, Y) : c.moveTo(X, Y); pen = true; }
        c.stroke(); c.setLineDash([]);
      };
      presets.slice(1).forEach(([f]) => conic(f, C.line, 1, [2, 3]));
      if (v.f > 0.3) conic(v.f, C.acc, 2.2);
      else { const [X, Y] = P(1, 0); line(c, X, Y, cx + 10, cy, C.acc, 2.2, [6, 4]); }
      // integrate (GM = 1, r0 = 1)
      const delta = st.lt == null ? 0 : Math.max(0, Math.min(0.05, t - st.lt)); st.lt = t;
      const steps = Math.ceil(delta * 2.6 / 0.002), dt = steps ? delta * 2.6 / steps : 0;
      for (let k = 0; k < steps && !st.done; k++) {
        let r = Math.hypot(st.x, st.y); st.vx -= st.x / r ** 3 * dt / 2; st.vy -= st.y / r ** 3 * dt / 2;
        st.x += st.vx * dt; st.y += st.vy * dt; r = Math.hypot(st.x, st.y);
        st.vx -= st.x / r ** 3 * dt / 2; st.vy -= st.y / r ** 3 * dt / 2;
        if (r < 0.09) { st.done = 'jatuh'; } if (r > 7) st.done = 'lolos';
      }
      if (st.done && !st.pend) { st.pend = true; const me = st; setTimeout(() => { if (st === me) reset(v); }, 900); }
      st.trail.push([st.x, st.y]); if (st.trail.length > 400) st.trail.shift();
      c.strokeStyle = C.sun; c.lineWidth = 1.4; c.beginPath(); st.trail.forEach(([x, y], i) => { const [X, Y] = P(x, y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
      disc(c, cx, cy, 10, C.blue); text(c, 'M', cx, cy + 20, C.muted, 'center');
      const [X0, Y0] = P(1, 0); disc(c, X0, Y0, 3, C.muted); arrow(c, X0, Y0, X0, Y0 - 34 * Math.max(0.25, v.f), C.fg, 1.6); text(c, 'v', X0 + 7, Y0 - 24, C.fg);
      const [X, Y] = P(st.x, st.y); if (X > -20 && X < W + 20 && Y > -20 && Y < H + 20) disc(c, X, Y, 4.5, C.sun);
      const f = v.f, e = Math.abs(f * f - 1), En = f * f / 2 - 1, kind = Math.abs(f - 1) < 0.004 ? 'lingkaran' : Math.abs(f - Math.SQRT2) < 0.006 ? 'parabola' : f < Math.SQRT2 ? 'elips' : 'hiperbola';
      const a = 1 / (2 - f * f);
      return { kind, e: fmt(e, 3), a: kind === 'parabola' ? '∞' : fmt(a, 3) + ' r₀' + (a < 0 ? ' (hiperbola: a negatif)' : ''), E: (En > 1e-3 ? '+' : '') + fmt(En, 3) + ' GMm/r₀ ' + (En < -1e-3 ? '(terikat)' : En > 1e-3 ? '(lepas)' : '(tepat lolos)'), pos: f < 1 ? 'titik tembak = aposentrum' : f > 1 ? 'titik tembak = perisentrum' : 'semua titik sama jauh' };
    },
    outputs: [['kind', 'Bentuk orbit'], ['e', 'Eksentrisitas e = |f² − 1|'], ['a', 'Setengah sumbu a = r₀/(2 − f²)'], ['E', 'Energi total per massa'], ['pos', 'Posisi awal']]
  });
  reset(lab.v);
};

/* ---------- Tidal acceleration field (Moon + Sun) ---------- */
LAB.pasut = el => mkLab(el, {
  title: 'Medan gaya pasang surut', hint: 'Panah = selisih tarikan di permukaan dengan tarikan di pusat Bumi. Hasilnya meregangkan Bumi ke dua arah (menuju dan menjauhi Bulan) dan menekan di sisi samping. Geser umur Bulan: saat Bulan baru/purnama tarikan Matahari menumpuk (pasang purnama), saat kuartir saling melemahkan (pasang perbani).', aspect: 0.66,
  controls: [{ k: 'age', label: 'Umur Bulan (hari)', min: 0, max: 29.5, step: 0.1, val: 0, fmt: x => fmt(x, 1) }, { k: 'sun', label: 'Sertakan Matahari', type: 'toggle', val: true }, { k: 'big', label: 'Lebih-lebihkan tonjolan air', type: 'toggle', val: true }],
  presets: [{ label: 'Bulan baru', set: { age: 0 } }, { label: 'Kuartir I', set: { age: 7.4 } }, { label: 'Purnama', set: { age: 14.8 } }, { label: 'Kuartir III', set: { age: 22.1 } }],
  draw(c, W, H, v, C) {
    const cx = W * 0.42, cy = H * 0.5, R = Math.min(W * 0.2, H * 0.27), th0 = 0, el = TAU * v.age / 29.53, thS = th0 - el, wS = v.sun ? 0.46 : 0;
    const acc = (x, y) => { let ax = 0, ay = 0; [[th0, 1], [thS, wS]].forEach(([th, w]) => { if (!w) return; const nx = Math.cos(th), ny = Math.sin(th), d = x * nx + y * ny; ax += w * (3 * d * nx - x); ay += w * (3 * d * ny - y); }); return [ax, ay]; };
    const bulge = th => { let s = 0; [[th0, 1], [thS, wS]].forEach(([t, w]) => { s += w * (3 * Math.cos(th - t) ** 2 - 1) / 2; }); return s; };
    const k = v.big ? 0.16 : 0.05;
    c.fillStyle = C.blue; c.globalAlpha = 0.22; c.beginPath();
    for (let i = 0; i <= 180; i++) { const th = TAU * i / 180, r = R * (1.08 + k * bulge(th)); const X = cx + r * Math.cos(th), Y = cy - r * Math.sin(th); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }
    c.fill(); c.globalAlpha = 1;
    disc(c, cx, cy, R, C.panel); ring(c, cx, cy, R, C.line, 1.4);
    for (let i = 0; i < 24; i++) { const th = TAU * i / 24, x = Math.cos(th), y = Math.sin(th), [ax, ay] = acc(x, y), X = cx + R * x, Y = cy - R * y; arrow(c, X, Y, X + ax * R * 0.2, Y - ay * R * 0.2, C.acc, 1.5); }
    disc(c, cx, cy, 3, C.muted);
    // Moon & Sun markers
    const mx = Math.min(W - 24, cx + R * 2.3), my = cy; disc(c, mx, my, 9, C.muted); text(c, 'Bulan', mx, my - 18, C.muted, 'center');
    if (v.sun) { const ux = Math.cos(thS), uy = -Math.sin(thS), x1 = cx + R * 1.55 * ux, y1 = cy + R * 1.55 * uy, x2 = cx + R * 1.85 * ux, y2 = cy + R * 1.85 * uy; arrow(c, x1, y1, x2, y2, C.sun, 2.4); const lx = (x1 + x2) / 2 - uy * 18, ly = (y1 + y2) / 2 + ux * 18; text(c, '☉ arah Matahari', lx, ly, C.sun, 'center'); }
    let mx2 = -9, mn = 9; for (let i = 0; i < 360; i++) { const b = bulge(i * D2R); mx2 = Math.max(mx2, b); mn = Math.min(mn, b); }
    const range = (mx2 - mn) / 1.5, ph = v.age < 1.5 || v.age > 28 ? 'Bulan baru' : Math.abs(v.age - 14.8) < 1.5 ? 'Purnama' : Math.abs(v.age - 7.4) < 1.5 ? 'Kuartir I' : Math.abs(v.age - 22.1) < 1.5 ? 'Kuartir III' : 'antara';
    return { el: fmt((el / D2R) % 360, 0) + '°', range: fmt(range, 2) + ' × (Bulan saja)', kind: !v.sun ? 'hanya Bulan' : range > 1.3 ? 'pasang purnama (spring tide)' : range < 0.7 ? 'pasang perbani (neap tide)' : 'peralihan', ph };
  },
  outputs: [['ph', 'Fase'], ['el', 'Elongasi Bulan dari Matahari'], ['range', 'Tinggi pasang relatif'], ['kind', 'Jenis pasang']]
});

/* ---------- Roche limit ---------- */
LAB.roche = el => mkLab(el, {
  title: 'Batas Roche: kapan satelit tercabik', hint: 'Satelit tanpa kekuatan material (tumpukan puing atau cairan) hanya diikat gravitasinya sendiri. Makin dekat ke planet, selisih tarikan planet pada sisi dekat dan jauh satelit makin besar (∝ 1/d³). Di dalam batas Roche, satelit terurai menjadi cincin.', aspect: 0.5,
  controls: [{ k: 'd', label: 'Jarak orbit d', min: 1.05, max: 6, step: 0.01, val: 3.5, unit: 'R planet', fmt: x => fmt(x, 2) }, { k: 'rp', label: 'Rapat massa planet ρₚ', min: 0.5, max: 6, step: 0.01, val: 5.51, unit: 'g/cm³', fmt: x => fmt(x, 2) }, { k: 'rs', label: 'Rapat massa satelit ρₛ', min: 0.3, max: 6, step: 0.01, val: 3.34, unit: 'g/cm³', fmt: x => fmt(x, 2) }],
  presets: [{ label: 'Bulan–Bumi', set: { rp: 5.51, rs: 3.34, d: 3.5 } }, { label: 'Komet SL9–Jupiter', set: { rp: 1.33, rs: 0.5, d: 1.4 } }, { label: 'Es–Saturnus', set: { rp: 0.69, rs: 0.9, d: 2.0 } }, { label: 'Phobos–Mars', set: { rp: 3.93, rs: 1.87, d: 2.76 } }],
  draw(c, W, H, v, C) {
    const q = Math.cbrt(v.rp / v.rs), dF = 2.44 * q, dB = 2.52 * q, s = Math.min((W - 40) / 7, H * 0.4), x0 = 20 + s, cy = H * 0.5;
    const xpos = d => x0 + d * s;
    disc(c, x0, cy, s, C.blue); text(c, 'planet', x0, cy, C.bg, 'center');
    if (dF < 6.2) { line(c, xpos(dF), 12, xpos(dF), H - 20, C.warn, 1.4, [5, 4]); text(c, 'batas Roche', xpos(dF) + 4, 16, C.warn); }
    for (let d = 1; d <= 6; d++) { line(c, xpos(d), H - 18, xpos(d), H - 12, C.muted); text(c, d + 'R', xpos(d), H - 5, C.muted, 'center'); }
    const ratio = (dB / v.d) ** 3, xs = xpos(v.d), rs = Math.max(7, s * 0.16);
    if (v.d > dF) { const st = 1 + 0.55 * Math.min(1, ratio); c.fillStyle = C.muted; c.beginPath(); c.ellipse(xs, cy, rs * st, rs / Math.sqrt(st), 0, 0, TAU); c.fill(); arrow(c, xs - rs * st, cy, xs - rs * st - 18 * ratio - 2, cy, C.acc); arrow(c, xs + rs * st, cy, xs + rs * st + 18 * ratio + 2, cy, C.acc); }
    else { let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 80; i++) { const a = (rnd() - 0.5) * (0.9 + (dF - v.d) * 0.7), rr = v.d * s + (rnd() - 0.5) * 10; disc(c, x0 + rr * Math.cos(a), cy + rr * Math.sin(a), 1.2 + rnd() * 2.2, C.muted); } }
    return { dF: fmt(dF, 2) + ' R', dB: fmt(dB, 2) + ' R', ratio: fmt(ratio, 2) + (ratio > 1 ? ' → tercabik' : ' → utuh'), state: v.d > dF ? 'satelit utuh (meregang)' : 'terurai menjadi cincin/puing' };
  },
  outputs: [['dF', 'Batas Roche fluida (2,44)'], ['dB', 'Model dua bola buku (2,52)'], ['ratio', 'Gaya pasut ÷ gravitasi diri'], ['state', 'Keadaan']]
});

/* ---------- Anomalies: true f, eccentric E, mean M ---------- */
F.anomali = () => {
  const cx = 230, cy = 170, a = 160, e = 0.6, b = a * Math.sqrt(1 - e * e), Fx = cx + a * e, E = 62 * D2R;
  const Qx = cx + a * Math.cos(E), Qy = cy - a * Math.sin(E), Px = Qx, Py = cy - b * Math.sin(E), M = E - e * Math.sin(E), Mx = cx + a * Math.cos(M), My = cy - a * Math.sin(M);
  const fang = Math.atan2(cy - Py, Px - Fx);
  let s = `<circle class="f-line f-dash" cx="${cx}" cy="${cy}" r="${a}"/><ellipse class="f-line f-strong" cx="${cx}" cy="${cy}" rx="${a}" ry="${b.toFixed(1)}"/>`;
  s += `<line class="f-line f-thin" x1="${cx - a - 10}" y1="${cy}" x2="${cx + a + 14}" y2="${cy}"/>`;
  s += `<line class="f-blue" x1="${cx}" y1="${cy}" x2="${Qx.toFixed(1)}" y2="${Qy.toFixed(1)}"/><line class="f-line f-dash" x1="${Qx.toFixed(1)}" y1="${Qy.toFixed(1)}" x2="${Qx.toFixed(1)}" y2="${cy}"/>`;
  s += `<line class="f-acc f-strong" x1="${Fx}" y1="${cy}" x2="${Px.toFixed(1)}" y2="${Py.toFixed(1)}"/><line class="f-warn" x1="${cx}" y1="${cy}" x2="${Mx.toFixed(1)}" y2="${My.toFixed(1)}" stroke-dasharray="5 4"/>`;
  s += `<path class="f-acc" d="M ${Fx + 34} ${cy} A 34 34 0 0 0 ${(Fx + 34 * Math.cos(fang)).toFixed(1)} ${(cy - 34 * Math.sin(fang)).toFixed(1)}"/>`;
  s += `<path class="f-blue" d="M ${cx + 26} ${cy} A 26 26 0 0 0 ${(cx + 26 * Math.cos(E)).toFixed(1)} ${(cy - 26 * Math.sin(E)).toFixed(1)}"/>`;
  s += `<path class="f-warn" d="M ${cx + 46} ${cy} A 46 46 0 0 0 ${(cx + 46 * Math.cos(M)).toFixed(1)} ${(cy - 46 * Math.sin(M)).toFixed(1)}"/>`;
  s += `<circle class="f-sun" cx="${Fx}" cy="${cy}" r="8"/><circle class="f-mut-fill" cx="${cx}" cy="${cy}" r="3"/><circle class="f-acc-fill" cx="${Px.toFixed(1)}" cy="${Py.toFixed(1)}" r="5"/><circle class="f-blue-fill" cx="${Qx.toFixed(1)}" cy="${Qy.toFixed(1)}" r="4"/><circle class="f-warn-fill" cx="${Mx.toFixed(1)}" cy="${My.toFixed(1)}" r="4"/>`;
  s += txt(Fx + 4, cy + 22, 'fokus (Matahari)') + txt(cx - 4, cy + 18, 'pusat C', 'f-txt f-mut-t', 'end') + txt(cx + a + 4, cy - 8, 'perihelion', 'f-txt f-mut-t', 'start');
  s += txt(Px + 10, Py + 16, 'planet P', 'f-txt f-acc-t', 'start') + txt(Qx + 8, Qy - 6, 'Q (pada lingkaran bantu)', 'f-txt f-blue-t', 'start') + txt(Mx + 10, My + 4, 'planet fiktif (gerak rata)', 'f-txt f-warn-t', 'start');
  s += txt(Fx + 42, cy - 12, 'f', 'f-txt f-acc-t f-i') + txt(cx + 34 * Math.cos(E / 2), cy - 34 * Math.sin(E / 2) + 5, 'E', 'f-txt f-blue-t f-i') + txt(cx + 58 * Math.cos(M / 2), cy - 58 * Math.sin(M / 2) + 5, 'M', 'f-txt f-warn-t f-i');
  return svg(580, 350, s, 'Anomali benar, eksentrik dan rata-rata', 'Anomali benar f diukur di fokus; anomali eksentrik E diukur di pusat elips, lewat titik Q pada lingkaran bantu yang tegak di atas planet; anomali rata-rata M milik "planet fiktif" yang bergerak beraturan. Penghubungnya: M = E − e sin E (persamaan Kepler) dan tan(f/2) = √((1+e)/(1−e)) tan(E/2).');
};

/* ---------- Planetary configurations (top view) ---------- */
F.konfigurasi = () => {
  const cx = 260, cy = 190, rE = 115, rI = 67, rO = 165;
  let b = `<circle class="f-line f-dash" cx="${cx}" cy="${cy}" r="${rI}"/><circle class="f-line" cx="${cx}" cy="${cy}" r="${rE}"/><circle class="f-line f-dash" cx="${cx}" cy="${cy}" r="${rO}"/>`;
  const Ex = cx, Ey = cy + rE, pt = (r, deg) => [cx + r * Math.cos(deg * D2R), cy - r * Math.sin(deg * D2R)];
  b += `<circle class="f-sun" cx="${cx}" cy="${cy}" r="13"/><circle class="f-earth" cx="${Ex}" cy="${Ey}" r="7"/>` + txt(Ex + 14, Ey + 16, 'Bumi', 'f-txt', 'start');
  const elAng = Math.asin(rI / rE), tx = rI * Math.cos(Math.PI / 2 - elAng), ty = rI * Math.sin(Math.PI / 2 - elAng);
  const lab = (x, y, s, cls, a = 'middle') => txt(x, y, s, cls || 'f-txt', a);
  const inf = [[cx, cy + rI, 'konjungsi inferior', -1, 16, -6], [cx, cy - rI, 'konjungsi superior', 0, -10, 0], [cx + tx, cy + ty, 'elongasi barat terbesar', 1, -2, 10], [cx - tx, cy + ty, 'elongasi timur terbesar', -1, -2, -10]];
  inf.forEach(([x, y, s, side, dy, dx]) => { b += `<circle class="f-blue-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`; b += lab(x + dx, y + dy, s, 'f-txt f-blue-t', side > 0 ? 'start' : side < 0 ? 'end' : 'middle'); });
  b += `<line class="f-blue f-thin" x1="${Ex}" y1="${Ey}" x2="${(cx + tx).toFixed(1)}" y2="${(cy + ty).toFixed(1)}"/><line class="f-blue f-thin" x1="${Ex}" y1="${Ey}" x2="${(cx - tx).toFixed(1)}" y2="${(cy + ty).toFixed(1)}"/>`;
  const qa = Math.acos(rE / rO), qx = rO * Math.sin(qa), qy = rO * Math.cos(qa);
  const out = [[cx, cy + rO, 'oposisi', 18], [cx, cy - rO, 'konjungsi', 4], [cx + qx, cy + qy, 'kuadratur barat', 0], [cx - qx, cy + qy, 'kuadratur timur', 0]];
  out.forEach(([x, y, s, dy], i) => { b += `<circle class="f-warn-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`; b += lab(x + (i === 2 || i === 1 ? 10 : i === 3 ? -10 : 0), y + (dy || 16), s, 'f-txt f-warn-t', i === 2 || i === 1 ? 'start' : i === 3 ? 'end' : 'middle'); });
  b += `<line class="f-warn f-thin" x1="${(cx - qx).toFixed(1)}" y1="${(cy + qy).toFixed(1)}" x2="${(cx + qx).toFixed(1)}" y2="${(cy + qy).toFixed(1)}"/>`;
  return svg(540, 385, b, 'Konfigurasi planet', 'Biru: planet dalam (Merkurius, Venus) hanya punya konjungsi dan elongasi terbesar, sin(elongasi maks) = a_planet/a_Bumi. Jingga: planet luar bisa beroposisi (terbit saat Matahari terbenam, paling terang) dan berkuadratur (elongasi 90°). Tampak dari utara, semua planet mengorbit berlawanan jarum jam. Barat/timur dihitung di langit pengamat: elongasi barat = tampak pagi, timur = tampak sore.');
};

/* ---------- Moon phase clock: when is the Moon up? ---------- */
LAB.jamfase = el => mkLab(el, {
  title: 'Jam fase Bulan: kapan Bulan terbit?', hint: 'Tampak dari atas kutub utara, Matahari di kanan. Pengamat di ekuator berputar bersama Bumi (berlawanan jarum jam). Garis hijau = horizon pengamat; Bulan di sisi langit (setengah lingkaran tebal) berarti di atas horizon. Inilah "diagram putar" buku: putar pengamat sampai Bulan tepat di horizon timur → itulah jam terbitnya.', aspect: 0.62,
  controls: [{ k: 'age', label: 'Umur Bulan', min: 0, max: 29.5, step: 0.1, val: 7.4, unit: 'hari', fmt: x => fmt(x, 1) }, { k: 'hr', label: 'Jam lokal pengamat', min: 0, max: 24, step: 0.25, val: 18, fmt: x => { const h = Math.floor(x) % 24, m = Math.round((x - Math.floor(x)) * 60); return String(h).padStart(2, '0') + '.' + String(m).padStart(2, '0'); } }],
  presets: [{ label: 'Bulan baru', set: { age: 0 } }, { label: 'Sabit muda', set: { age: 3.5 } }, { label: 'Kuartir I', set: { age: 7.4 } }, { label: 'Purnama', set: { age: 14.8 } }, { label: 'Kuartir III', set: { age: 22.1 } }],
  draw(c, W, H, v, C) {
    const cx = W * 0.4, cy = H * 0.5, R = Math.min(W, H) * 0.13, Rm = Math.min(W * 0.33, H * 0.42), el = TAU * v.age / 29.53;
    for (let i = 0; i < 9; i++) arrow(c, W - 14, 26 + i * (H - 52) / 8, W - 64, 26 + i * (H - 52) / 8, C.sun, 1);
    text(c, 'sinar Matahari', W - 14, 12, C.sun, 'right');
    ring(c, cx, cy, Rm, C.line, 1, [3, 5]);
    // Earth: day side right
    disc(c, cx, cy, R, '#0b1d3a'); c.fillStyle = C.blue; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); c.fill(); ring(c, cx, cy, R, C.line);
    // observer angle: noon -> facing sun (right, angle 0); counterclockwise: 18h at top
    const ob = (v.hr - 12) / 24 * TAU, ox = cx + R * Math.cos(ob), oy = cy - R * Math.sin(ob);
    const tx = -Math.sin(ob), ty = -Math.cos(ob);
    line(c, ox - tx * R * 1.6, oy - ty * R * 1.6, ox + tx * R * 1.6, oy + ty * R * 1.6, C.ok, 2);
    c.strokeStyle = C.ok; c.lineWidth = 3; c.beginPath(); c.arc(ox, oy, R * 0.9, -ob - Math.PI / 2, -ob + Math.PI / 2); c.stroke();
    disc(c, ox, oy, 4, C.acc);
    text(c, 'T', ox + tx * R * 1.75, oy + ty * R * 1.75, C.ok, 'center'); text(c, 'B', ox - tx * R * 1.75, oy - ty * R * 1.75, C.ok, 'center');
    // Moon position: new moon toward sun (angle 0), moving counterclockwise
    const mx = cx + Rm * Math.cos(el), my = cy - Rm * Math.sin(el), mr = 11;
    disc(c, mx, my, mr, '#2a2f3a'); c.fillStyle = '#f4efe2'; c.beginPath(); c.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2); c.fill(); ring(c, mx, my, mr, C.line);
    // altitude of moon for equatorial observer: angle between zenith (ob) and moon direction
    let dh = el - ob; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    const alt = 90 - Math.abs(dh) / D2R, up = alt > 0;
    line(c, ox, oy, mx, my, up ? C.acc : C.muted, 1, [4, 4]);
    // phase thumbnail
    const px = Math.min(W * 0.86, W - 58), py = H * 0.78, pr = Math.min(W, H) * 0.08, k = (1 - Math.cos(el)) / 2;
    moonPhase(c, px, py, pr, el, C);
    text(c, 'dari Bumi (BBU)', px, py + pr + 14, C.muted, 'center');
    const rise = (12 + v.age * 24 / 29.53 - 6 + 48) % 24, tr = (12 + v.age * 24 / 29.53) % 24, set = (tr + 6) % 24, hm = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return String((h + (m === 60 ? 1 : 0)) % 24).padStart(2, '0') + '.' + String(m % 60).padStart(2, '0'); };
    const ph = v.age < 1 || v.age > 28.5 ? 'bulan baru' : v.age < 6.4 ? 'sabit muda (waxing crescent)' : v.age < 8.4 ? 'kuartir pertama' : v.age < 13.8 ? 'cembung awal (waxing gibbous)' : v.age < 15.8 ? 'purnama' : v.age < 21.1 ? 'cembung akhir (waning gibbous)' : v.age < 23.1 ? 'kuartir ketiga' : 'sabit tua (waning crescent)';
    const where = !up ? 'di bawah horizon' : Math.abs(dh) < 0.12 ? 'dekat meridian' : (dh > 0 ? 'di langit timur (naik)' : 'di langit barat (turun)');
    return { ph, alt: fmt(alt, 0) + '° — ' + where, times: hm(rise) + ' / ' + hm(tr) + ' / ' + hm(set), lag: '≈ ' + fmt(v.age * 24 * 60 / 29.53 / 60, 1) + ' jam setelah Matahari' };
  },
  outputs: [['ph', 'Fase'], ['alt', 'Tinggi Bulan (pengamat ekuator)'], ['times', 'Terbit / transit / terbenam'], ['lag', 'Transit tertinggal dari Matahari']]
});

/* ---------- Day length through the year ---------- */
LAB.siang = el => mkLab(el, {
  title: 'Panjang siang sepanjang tahun', hint: 'Kurva = panjang siang (cos H₀ = −tan φ tan δ☉, ditambah koreksi refraksi & semidiameter 50′) untuk lintang pilihanmu. Daerah biru = malam. Geser tanggal untuk membaca nilainya; di lintang > 66,5° kurva menyentuh 0 atau 24 jam (malam/siang kutub).', aspect: 0.55,
  controls: [{ k: 'phi', label: 'Lintang φ', min: -90, max: 90, step: 0.1, val: -6.2, unit: '°', fmt: x => fmt(x, 1) }, { k: 'day', label: 'Hari ke- (1 Jan = 1)', min: 1, max: 365, step: 1, val: 172, fmt: x => { const d = new Date(Date.UTC(2025, 0, x)); return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getUTCMonth()]; } }, { k: 'ref', label: 'Refraksi + semidiameter', type: 'toggle', val: true }],
  presets: [{ label: 'Jakarta', set: { phi: -6.2 } }, { label: 'Ekuator', set: { phi: 0 } }, { label: 'Moskow 55,8°', set: { phi: 55.8 } }, { label: 'Tromsø 69,6°', set: { phi: 69.6 } }, { label: 'Kutub Utara', set: { phi: 90 } }, { label: '21 Mar', set: { day: 80 } }, { label: '21 Jun', set: { day: 172 } }, { label: '22 Des', set: { day: 356 } }],
  draw(c, W, H, v, C) {
    const dec = d => 23.44 * Math.sin(TAU * (d - 80) / 365.25), h0 = v.ref ? -0.833 : 0;
    const len = (phi, d) => { const de = dec(d) * D2R, p = phi * D2R, cH = (Math.sin(h0 * D2R) - Math.sin(p) * Math.sin(de)) / (Math.cos(p) * Math.cos(de) || 1e-9); return cH <= -1 ? 24 : cH >= 1 ? 0 : 2 * Math.acos(cH) / D2R / 15; };
    const box = [46, 14, W - 64, H - 50], ax = OSN.labkit.axes || null;
    const { X, Y } = OSN.labkit.axes(c, C, box, [1, 365], [0, 24], { xt: [1, 80, 172, 266, 356], xf: d => ({ 1: 'Jan', 80: '21 Mar', 172: '21 Jun', 266: '23 Sep', 356: '22 Des' })[d], yt: [0, 6, 12, 18, 24], xl: '', yl: 'jam', ylo: 32 });
    c.fillStyle = C.blue; c.globalAlpha = 0.15; c.beginPath(); c.moveTo(X(1), Y(24));
    for (let d = 1; d <= 365; d++) c.lineTo(X(d), Y(len(v.phi, d))); c.lineTo(X(365), Y(24)); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = C.acc; c.lineWidth = 2.2; c.beginPath(); for (let d = 1; d <= 365; d++) { const y = Y(len(v.phi, d)); d === 1 ? c.moveTo(X(d), y) : c.lineTo(X(d), y); } c.stroke();
    line(c, X(1), Y(12), X(365), Y(12), C.muted, 1, [4, 4]);
    const L = len(v.phi, v.day); line(c, X(v.day), Y(0), X(v.day), Y(24), C.fg, 1); disc(c, X(v.day), Y(L), 4.5, C.acc);
    const de = dec(v.day), noon = 90 - Math.abs(v.phi - de), cA = Math.sin(de * D2R) / Math.cos(v.phi * D2R), az = Math.abs(cA) <= 1 ? Math.acos(cA) / D2R : null;
    const hm = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return h + ' j ' + String(m).padStart(2, '0') + ' m'; };
    return { dec: fmt(de, 1) + '°', L: L >= 24 ? '24 jam (Matahari tak terbenam)' : L <= 0 ? '0 (Matahari tak terbit)' : hm(L), noon: fmt(noon, 1) + '° di ' + (de > v.phi ? 'utara' : de < v.phi ? 'selatan' : 'zenit'), az: az == null ? '—' : fmt(az, 1) + '° (terbit), ' + fmt(360 - az, 1) + '° (terbenam)' };
  },
  outputs: [['dec', 'Deklinasi Matahari'], ['L', 'Panjang siang'], ['noon', 'Tinggi Matahari tengah hari'], ['az', 'Azimut terbit/terbenam (dari U)']]
});

/* ---------- Stellar evolution tracks on the HR diagram (schematic) ---------- */
const TRACKS = {
  1: { name: '1 M☉ (Matahari)', pts: [[3.61, 1.3, 'Protobintang di jejak Hayashi: mengerut, hampir vertikal turun (konveksi penuh). ~30 juta tahun.'], [3.63, 0.2, 'Jejak Henyey: inti menjadi radiatif, bintang memanas ke kiri.'], [3.75, -0.15, 'ZAMS: pembakaran H di pusat dimulai (rantai p–p).'], [3.77, 0.25, 'Deret utama: ~10 miliar tahun, perlahan makin terang (Matahari kini di sini, umur 4,6 miliar tahun).'], [3.71, 0.45, 'Subraksasa: H di pusat habis, pembakaran H pindah ke kulit; inti He mengerut.'], [3.62, 1.2, 'Cabang raksasa merah: selubung mengembang dan mendingin, luminositas naik ratusan kali (~1 miliar tahun).'], [3.54, 3.35, 'Puncak cabang raksasa merah: inti He terdegenerasi mencapai ~10⁸ K → kilatan helium.'], [3.69, 1.75, 'Cabang horizontal: He terbakar stabil menjadi C dan O di pusat (~100 juta tahun).'], [3.56, 2.6, 'Cabang raksasa asimtotik (AGB): kulit He dan H menyala bergantian, bintang berdenyut dan kehilangan massa.'], [3.52, 3.6, 'Puncak AGB: angin bintang melontarkan selubung.'], [4.4, 3.65, 'Nebula planeter: inti panas tersingkap dan mengionisasi selubung (~10⁴ tahun).'], [5.05, 3.3, 'Inti panas ~100 000 K, berhenti membakar.'], [4.6, -0.5, 'Katai putih C–O: ~0,55 M☉ seukuran Bumi, ditopang tekanan degenerasi elektron.'], [3.9, -3.5, 'Katai putih mendingin perlahan (miliaran tahun) menuju katai hitam.']] },
  5: { name: '5 M☉', pts: [[3.64, 3.0, 'Protobintang: jejak Hayashi singkat.'], [3.70, 2.6, 'Jejak Henyey hampir mendatar ke kiri (~0,7 juta tahun).'], [4.24, 2.75, 'ZAMS: daur CNO, inti konvektif.'], [4.19, 3.05, 'Deret utama (~100 juta tahun).'], [4.22, 3.12, '"Kait" akhir deret utama: kontraksi menyeluruh sesaat.'], [3.66, 3.0, 'Menyeberangi celah Hertzsprung dengan cepat (jarang teramati).'], [3.6, 3.2, 'Raksasa merah: He menyala tanpa kilatan (inti tidak terdegenerasi).'], [3.82, 3.25, 'Loop biru: pembakaran He di pusat, bintang bisa menjadi variabel Cepheid saat melintasi jalur ketidakstabilan.'], [3.6, 3.35, 'Kembali ke merah.'], [3.53, 4.2, 'AGB, kehilangan massa besar.'], [4.6, 4.15, 'Nebula planeter.'], [5.1, 3.6, 'Inti panas.'], [4.7, -0.4, 'Katai putih masif (~0,9 M☉).']] },
  15: { name: '15 M☉', pts: [[3.9, 4.25, 'Protobintang masif: sangat cepat (~0,16 juta tahun), sebagian besar tersembunyi dalam awan debu.'], [4.48, 4.3, 'ZAMS: bintang kelas B0, daur CNO.'], [4.44, 4.6, 'Deret utama (~12 juta tahun).'], [4.2, 4.72, 'Pembakaran He mulai saat bintang masih biru.'], [3.85, 4.8, 'Maharaksasa kuning.'], [3.56, 4.95, 'Maharaksasa merah: berturut-turut membakar C, Ne, O, Si; inti besi terbentuk dalam hitungan hari.'], [3.56, 4.97, 'Inti besi runtuh → supernova tipe II, menyisakan bintang neutron (atau lubang hitam untuk bintang yang lebih masif).']] }
};
LAB.evohr = el => mkLab(el, {
  title: 'Jejak evolusi bintang di diagram H–R', hint: 'Pilih massa awal, lalu geser "tahap" untuk mengikuti perjalanan bintang. Jejak digambar skematik (mengikuti model Iben dan sejenisnya); garis abu-abu = deret utama umur nol (ZAMS). Perhatikan: semakin masif, semakin cepat dan semakin "tinggi" jalurnya.', aspect: 0.66,
  controls: [{ k: 'm', label: 'Massa awal', min: 0, max: 2, step: 1, val: 0, fmt: x => ['1 M☉', '5 M☉', '15 M☉'][Math.round(x)] }, { k: 'p', label: 'Tahap evolusi', min: 0, max: 1, step: 0.002, val: 0.25, fmt: x => Math.round(x * 100) + '%' }],
  presets: [{ label: 'Matahari kini', set: { m: 0, p: 0.24 } }, { label: 'Kilatan He', set: { m: 0, p: 0.47 } }, { label: 'Nebula planeter', set: { m: 0, p: 0.76 } }, { label: 'Cepheid (5 M☉)', set: { m: 1, p: 0.6 } }, { label: 'Supernova (15 M☉)', set: { m: 2, p: 1 } }],
  draw(c, W, H, v, C) {
    const key = [1, 5, 15][Math.round(v.m)], T = TRACKS[key], box = [52, 12, W - 70, H - 46];
    const { X, Y } = OSN.labkit.axes(c, C, box, [5.2, 3.4], [-4, 6], { xt: [5, Math.log10(30000), 4, Math.log10(5000), Math.log10(3000)], xf: q => Math.round(10 ** q / 1000) + ' kK', yt: [-4, -2, 0, 2, 4, 6], yf: q => '10' + ({ '-4': '⁻⁴', '-2': '⁻²', 0: '⁰', 2: '²', 4: '⁴', 6: '⁶' })[q], yl: 'L / L☉', ylo: 40 });
    // ZAMS
    c.strokeStyle = C.muted; c.lineWidth = 6; c.globalAlpha = 0.25; c.beginPath(); [[4.6, 5.2], [4.48, 4.3], [4.24, 2.75], [4.0, 1.6], [3.85, 0.6], [3.75, -0.15], [3.6, -1.3], [3.5, -2.6]].forEach(([a, b], i) => i ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b))); c.stroke(); c.globalAlpha = 1;
    text(c, 'deret utama', X(4.02), Y(1.6) + 16, C.muted, 'left');
    // radius lines
    [[0.01, 'R = 0,01 R☉'], [1, '1 R☉'], [100, '100 R☉']].forEach(([r, l]) => { const yA = lt => 2 * Math.log10(r) + 4 * (lt - Math.log10(5772)); line(c, X(5.2), Y(yA(5.2)), X(3.4), Y(yA(3.4)), C.line, 0.8, [2, 5]); const lt = r === 0.01 ? 4.45 : r === 1 ? 3.62 : 3.47; text(c, l, X(lt) + 3, Y(yA(lt)) - 6, C.muted); });
    const P = T.pts, n = P.length - 1, f = v.p * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    c.strokeStyle = C.acc; c.lineWidth = 1.5; c.setLineDash([4, 3]); c.beginPath(); P.forEach(([a, b], j) => j ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b))); c.stroke(); c.setLineDash([]);
    c.lineWidth = 2.6; c.beginPath(); for (let j = 0; j <= i; j++) { const [a, b] = P[j]; j ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b)); } const xa = P[i][0] + (P[i + 1][0] - P[i][0]) * u, ya = P[i][1] + (P[i + 1][1] - P[i][1]) * u; c.lineTo(X(xa), Y(ya)); c.stroke();
    const col = OSN.labkit.bbColor ? OSN.labkit.bbColor(10 ** xa) : C.sun; disc(c, X(xa), Y(ya), 7, col); ring(c, X(xa), Y(ya), 7, C.fg, 1);
    if (key === 15 && v.p > 0.985) { for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; line(c, X(xa) + 10 * Math.cos(a), Y(ya) + 10 * Math.sin(a), X(xa) + 22 * Math.cos(a), Y(ya) + 22 * Math.sin(a), C.warn, 2); } }
    const Tk = 10 ** xa, L = 10 ** ya, Rr = Math.sqrt(L) / (Tk / 5772) ** 2;
    return { st: P[u < 0.5 ? i : i + 1][2], T: fmt(Tk, 0) + ' K', L: fmt(L, L < 1 ? 4 : 0) + ' L☉', R: fmt(Rr, Rr < 0.1 ? 4 : 1) + ' R☉' };
  },
  outputs: [['st', 'Tahap'], ['T', 'Suhu efektif'], ['L', 'Luminositas'], ['R', 'Jari-jari (dari L = 4πR²σT⁴)']]
});

/* ---------- Cluster HR diagram vs age: main-sequence turn-off ---------- */
LAB.turnoff = el => {
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, stars = [];
  for (let i = 0; i < 420; i++) { const m = 0.3 * Math.pow(1 - rnd() * (1 - Math.pow(60 / 0.3, -1.35)), -1 / 1.35); stars.push({ m, j: rnd() }); }
  return mkLab(el, {
    title: 'Umur gugus dari titik belok (turn-off)', hint: 'Semua bintang gugus lahir bersamaan tetapi bermassa berbeda. Bintang masif menghabiskan hidrogennya lebih cepat (t ≈ 10 miliar tahun × M⁻²·⁵), jadi seiring waktu deret utama "terkikis" dari atas. Massa di titik belok langsung memberi umur gugus.', aspect: 0.66,
    controls: [{ k: 'age', label: 'Umur gugus', min: 1e6, max: 1.3e10, log: true, val: 1e8, fmt: x => x >= 1e9 ? fmt(x / 1e9, 2) + ' miliar th' : fmt(x / 1e6, 0) + ' juta th' }],
    presets: [{ label: 'NGC 2362 (4 juta th)', set: { age: 4e6 } }, { label: 'Pleiades (100 juta)', set: { age: 1e8 } }, { label: 'Hyades (650 juta)', set: { age: 6.5e8 } }, { label: 'M67 (4 miliar)', set: { age: 4e9 } }, { label: 'M13 (12 miliar)', set: { age: 1.2e10 } }],
    draw(c, W, H, v, C) {
      const box = [52, 12, W - 70, H - 46], { X, Y } = OSN.labkit.axes(c, C, box, [4.75, 3.45], [-4, 6], { xt: [Math.log10(40000), Math.log10(20000), 4, Math.log10(5000), Math.log10(3000)], xf: q => Math.round(10 ** q / 1000) + ' kK', yt: [-4, -2, 0, 2, 4, 6], yf: q => '10' + ({ '-4': '⁻⁴', '-2': '⁻²', 0: '⁰', 2: '²', 4: '⁴', 6: '⁶' })[q], yl: 'L / L☉', ylo: 40 });
      const life = m => 1e10 * Math.pow(m, -2.5), mto = Math.pow(v.age / 1e10, -1 / 2.5);
      let nMS = 0, nG = 0, nWD = 0, nR = 0;
      stars.forEach(st => {
        const m = st.m, tl = life(m), L0 = m < 0.43 ? 0.23 * m ** 2.3 : m < 2 ? m ** 4 : m < 20 ? 1.4 * m ** 3.5 : 32000 * m, R0 = m < 1 ? m ** 0.8 : m ** 0.57, T0 = 5772 * Math.pow(L0 / R0 ** 2, 0.25);
        let lt, ll, col;
        if (v.age < tl) { const f = v.age / tl, L = L0 * (1 + 1.1 * f ** 2), T = T0 * (1 - 0.08 * f); lt = Math.log10(T) + (st.j - 0.5) * 0.01; ll = Math.log10(L) + (st.j - 0.5) * 0.06; nMS++; col = OSN.labkit.bbColor ? OSN.labkit.bbColor(T) : C.fg; }
        else if (v.age < tl * 1.12) { const g = (v.age / tl - 1) / 0.12; lt = Math.log10(m > 10 ? 3700 + 12000 * (1 - g) : 5000 - 1300 * g) ; ll = Math.log10(L0) + (m > 10 ? 0.4 : 0.3 + g * 2.2) + (st.j - 0.5) * 0.1; nG++; col = OSN.labkit.bbColor ? OSN.labkit.bbColor(10 ** lt) : C.warn; }
        else if (m < 8) { const age = v.age - tl * 1.12, L = 0.01 * Math.pow(Math.max(age, 1e6) / 1e8, -1.2); ll = Math.max(-4, Math.log10(Math.min(L, 10))); lt = 4.0 + (ll + 4) * 0.12 + (st.j - 0.5) * 0.02; nWD++; col = C.blue; }
        else { nR++; return; }
        disc(c, X(lt), Y(ll), m > 3 ? 3 : 2.2, col);
      });
      const L0to = mto < 2 ? mto ** 4 : 1.4 * mto ** 3.5, Rto = mto < 1 ? mto ** 0.8 : mto ** 0.57, Tto = 5772 * Math.pow(L0to / Rto ** 2, 0.25);
      if (mto < 60) { const y = Y(Math.log10(L0to * 1.6)); line(c, box[0], y, box[0] + box[2], y, C.acc, 1, [5, 4]); text(c, 'titik belok', box[0] + box[2] - 4, y - 8, C.acc, 'right'); }
      const sp = Tto > 30000 ? 'O' : Tto > 10000 ? 'B' : Tto > 7500 ? 'A' : Tto > 6000 ? 'F' : Tto > 5200 ? 'G' : Tto > 3700 ? 'K' : 'M';
      return { mto: fmt(mto, 2) + ' M☉', sp: 'kelas ' + sp + ' (≈ ' + fmt(Tto, 0) + ' K)', n: nMS + ' deret utama · ' + nG + ' raksasa · ' + nWD + ' katai putih · ' + nR + ' sudah menjadi bintang neutron/lubang hitam' };
    },
    outputs: [['mto', 'Massa titik belok'], ['sp', 'Bintang deret utama paling panas'], ['n', 'Populasi']]
  });
};

/* ---------- Fates of stars by mass ---------- */
F.akhirbintang = () => {
  const row = (y, mass, steps, cls) => {
    let b = txt(14, y + 5, mass, 'f-txt f-b', 'start'); let x = 118;
    steps.forEach((st, i) => { const w = st.length * 6.4 + 16; b += `<rect class="${i === steps.length - 1 ? cls : 'f-line'}" x="${x}" y="${y - 13}" width="${w}" height="26" rx="5" fill="none"/>` + txt(x + w / 2, y + 5, st, 'f-txt'); if (i < steps.length - 1) b += `<line class="f-line" x1="${x + w}" y1="${y}" x2="${x + w + 14}" y2="${y}" marker-end="url(#ahf)"/>`; x += w + 16; });
    return b;
  };
  let b = `<defs><marker id="ahf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="f-mut-fill"/></marker></defs>`;
  b += txt(14, 22, 'Massa awal', 'f-txt f-mut-t', 'start') + txt(118, 22, 'Perjalanan (semua dimulai dari awan molekul → protobintang)', 'f-txt f-mut-t', 'start');
  b += row(54, '< 0,08 M☉', ['tak pernah membakar H', 'katai coklat'], 'f-warn');
  b += row(94, '0,08–0,5', ['deret utama (> 100 miliar th)', 'katai putih He*'], 'f-blue');
  b += row(134, '0,5–8', ['deret utama', 'raksasa merah', 'HB/AGB', 'nebula planeter', 'katai putih C–O'], 'f-blue');
  b += row(174, '8–~25', ['deret utama', 'maharaksasa', 'supernova II', 'bintang neutron'], 'f-acc');
  b += row(214, '> ~25', ['deret utama', 'maharaksasa/WR', 'kolaps (± SN)', 'lubang hitam'], 'f-warn');
  b += txt(14, 248, '* belum ada satu pun: umur alam semesta (13,8 miliar th) belum cukup.', 'f-txt f-mut-t', 'start');
  return svg(720, 260, b, 'Nasib akhir bintang menurut massa', 'Batas massa bersifat perkiraan dan bergantung pada metalisitas, rotasi, serta pasangan biner. Katai putih ≤ 1,44 M☉ (batas Chandrasekhar); bintang neutron ≲ 2–3 M☉ (batas Tolman–Oppenheimer–Volkoff).');
};

/* ---------- Gamow peak: why fusion works at "only" 15 million K ---------- */
LAB.gamow = el => mkLab(el, {
  title: 'Puncak Gamow: celah sempit tempat fusi terjadi', hint: 'Biru = peluang inti punya energi E (ekor Maxwell–Boltzmann, e^(−E/kT)): turun cepat. Jingga = peluang menembus penghalang Coulomb secara kuantum (efek terowongan, e^(−√(E_G/E))): naik cepat. Hasil kalinya (merah) hanya besar di jendela sempit: puncak Gamow. Naikkan suhu dan lihat betapa sensitifnya laju fusi.', aspect: 0.6,
  controls: [{ k: 'T', label: 'Suhu inti', min: 5, max: 200, log: true, val: 15.7, unit: 'juta K', fmt: x => fmt(x, 1) }, { k: 'r', label: 'Reaksi', min: 0, max: 2, step: 1, val: 0, fmt: x => ['p + p', 'p + ¹²C (daur CNO)', '⁴He + ⁴He (triple-α)'][Math.round(x)] }],
  presets: [{ label: 'Pusat Matahari', set: { T: 15.7, r: 0 } }, { label: 'Bintang 3 M☉ (CNO)', set: { T: 22, r: 1 } }, { label: 'Inti raksasa merah', set: { T: 100, r: 2 } }],
  draw(c, W, H, v, C) {
    const R3 = [[1, 1, 0.5], [1, 6, 12 / 13], [2, 2, 2]][Math.round(v.r)], [Z1, Z2, mr] = R3; // reduced mass in u
    const EG = 2 * mr * 931.494e3 * (Math.PI * Z1 * Z2 / 137.036) ** 2, kT = 8.617e-5 * v.T * 1e6 / 1000; // keV
    const E0 = Math.pow(EG * kT * kT / 4, 1 / 3), Emax = Math.max(4 * E0, 6 * kT), box = [44, 14, W - 64, H - 54];
    const mb = E => Math.exp(-E / kT), tn = E => Math.exp(-Math.sqrt(EG / E)), pr = E => mb(E) * tn(E);
    const peak = pr(E0), X = E => box[0] + E / Emax * box[2], Y = y => box[1] + box[3] * (1 - y);
    c.strokeStyle = C.line; c.strokeRect(box[0], box[1], box[2], box[3]);
    const curve = (f, col, w, norm) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 1; i <= 300; i++) { const E = Emax * i / 300, y = Math.min(1.05, f(E) / norm); i === 1 ? c.moveTo(X(E), Y(y)) : c.lineTo(X(E), Y(y)); } c.stroke(); };
    curve(mb, C.blue, 2, 1); curve(tn, C.sun, 2, tn(Emax)); 
    c.fillStyle = C.acc; c.globalAlpha = 0.18; c.beginPath(); c.moveTo(X(0), Y(0)); for (let i = 1; i <= 300; i++) { const E = Emax * i / 300; c.lineTo(X(E), Y(pr(E) / peak * 0.9)); } c.lineTo(X(Emax), Y(0)); c.fill(); c.globalAlpha = 1;
    curve(E => pr(E) / peak * 0.9, C.acc, 2.4, 1);
    line(c, X(E0), box[1], X(E0), box[1] + box[3], C.acc, 1, [4, 4]); text(c, 'E₀', X(E0) + 4, box[1] + 12, C.acc);
    line(c, X(kT), box[1] + box[3] - 30, X(kT), box[1] + box[3], C.blue, 1); text(c, 'kT', X(kT) + 3, box[1] + box[3] - 24, C.blue);
    [0, 0.25, 0.5, 0.75, 1].forEach(f => text(c, fmt(Emax * f, 0), X(Emax * f), box[1] + box[3] + 14, C.muted, 'center'));
    text(c, 'energi relatif (keV)', box[0] + box[2] / 2, box[1] + box[3] + 32, C.fg, 'center');
    text(c, 'Maxwell–Boltzmann', box[0] + 6, box[1] + 22, C.blue); text(c, 'terowongan', box[0] + box[2] - 6, box[1] + 22, C.sun, 'right');
    const barrier = 1.44 * Z1 * Z2 / (1.2 * (Math.cbrt(Z1 === 1 ? 1 : 4) + Math.cbrt(Z2 === 1 ? 1 : Z2 === 6 ? 12 : 4))) * 1000; // keV
    const rate = E0 ** 2 * Math.exp(-3 * E0 / kT);
    return { kT: fmt(kT, 2) + ' keV', E0: fmt(E0, 1) + ' keV (' + fmt(E0 / kT, 1) + ' kT)', bar: '≈ ' + fmt(barrier, 0) + ' keV (' + fmt(barrier / E0, 0) + '× E₀)', sens: 'laju ∝ T^' + fmt((3 * E0 / kT - 2) / 3, 1) };
  },
  outputs: [['kT', 'Energi termal rata-rata kT'], ['E0', 'Puncak Gamow E₀'], ['bar', 'Tinggi penghalang Coulomb'], ['sens', 'Kepekaan laju terhadap suhu']]
});

/* ---------- pp-I chain ---------- */
F.ppchain = () => {
  const P = (x, y) => `<circle class="f-warn-fill" cx="${x}" cy="${y}" r="7"/>`, N = (x, y) => `<circle class="f-blue-fill" cx="${x}" cy="${y}" r="7"/>`;
  const nuc = (x, y, np, nn) => { let b = ''; const pts = [[-5, -5], [5, 5], [5, -5], [-5, 5]]; for (let i = 0; i < np + nn; i++) b += (i < np ? P : N)(x + pts[i][0], y + pts[i][1]); return b; };
  const ar = (x1, x2, y) => `<line class="f-line" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-end="url(#ahp)"/>`;
  let b = `<defs><marker id="ahp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="f-mut-fill"/></marker></defs>`;
  const row = (y, l, eq, out) => txt(16, y + 4, l, 'f-txt f-b', 'start') + txt(310, y + 4, eq, 'f-txt f-mut-t', 'start') + out;
  b += row(40, '①', '~10¹⁰ tahun', nuc(70, 40, 1, 0) + txt(92, 44, '+') + nuc(110, 40, 1, 0) + ar(130, 180, 40) + nuc(200, 40, 1, 1) + txt(222, 44, '+ e⁺ + ν', 'f-txt f-acc-t', 'start'));
  b += row(96, '②', '~1 detik', nuc(70, 96, 1, 1) + txt(92, 100, '+') + nuc(110, 96, 1, 0) + ar(130, 180, 96) + nuc(200, 96, 2, 1) + txt(222, 100, '+ γ', 'f-txt f-acc-t', 'start'));
  b += row(152, '③', '~10⁶ tahun', nuc(70, 152, 2, 1) + txt(92, 156, '+') + nuc(110, 152, 2, 1) + ar(130, 180, 152) + nuc(200, 152, 2, 2) + txt(224, 156, '+', 'f-txt', 'start') + nuc(246, 152, 1, 0) + nuc(272, 152, 1, 0));
  b += txt(16, 196, 'Langkah ① dan ② terjadi dua kali sebelum ③.', 'f-txt', 'start') + txt(16, 216, 'Bersih: 4 ¹H → ⁴He + 2e⁺ + 2ν + 26,7 MeV (0,7% massa).', 'f-txt f-b', 'start');
  b += P(24, 242) + txt(36, 246, 'proton', 'f-txt', 'start') + N(104, 242) + txt(116, 246, 'neutron', 'f-txt', 'start');
  return svg(470, 258, b, 'Rantai proton–proton', 'Langkah pertama memerlukan gaya lemah (sebuah proton berubah menjadi neutron), itulah sebab Matahari "membakar" begitu pelan dan hidup 10 miliar tahun.');
};

/* ---------- Milky Way anatomy (edge-on + face-on) ---------- */
F.galaksi = () => {
  let b = '';
  // edge-on
  const ex = 160, ey = 120;
  b += `<ellipse class="f-line f-dash" cx="${ex}" cy="${ey}" rx="140" ry="98"/>`;
  b += `<ellipse class="f-blue-fill" style="opacity:.35" cx="${ex}" cy="${ey}" rx="128" ry="7"/><ellipse class="f-warn-fill" style="opacity:.55" cx="${ex}" cy="${ey}" rx="26" ry="17"/>`;
  [[60, 60], [250, 70], [90, 190], [220, 175], [150, 34], [40, 130], [275, 140], [170, 205]].forEach(([x, y]) => { b += `<circle class="f-acc-fill" cx="${x}" cy="${y}" r="3.5"/>`; });
  b += `<circle class="f-sun" cx="${ex + 85}" cy="${ey}" r="4"/>` + txt(ex + 85, ey - 12, 'Matahari', 'f-txt');
  b += txt(ex, 14, 'tampak samping (edge-on)', 'f-txt f-b') + txt(ex - 98, ey + 22, 'piringan', 'f-txt f-blue-t') + txt(ex, ey + 34, 'tonjolan', 'f-txt f-warn-t') + txt(ex + 120, 50, 'halo + gugus bola', 'f-txt f-acc-t');
  // face-on spiral
  const fx = 470, fy = 120;
  b += `<circle class="f-line f-thin" cx="${fx}" cy="${fy}" r="104"/>`;
  for (let arm = 0; arm < 2; arm++) { let d = ''; for (let i = 0; i <= 60; i++) { const t = i / 60 * 3.4, r = 18 + 26 * t, a = t * 1.15 + arm * Math.PI; d += (i ? 'L' : 'M') + (fx + r * Math.cos(a)).toFixed(1) + ' ' + (fy + r * Math.sin(a)).toFixed(1); } b += `<path class="f-blue" style="stroke-width:9;opacity:.35" d="${d}"/>`; }
  b += `<ellipse class="f-warn-fill" style="opacity:.6" cx="${fx}" cy="${fy}" rx="24" ry="14" transform="rotate(25 ${fx} ${fy})"/>`;
  const sa = 2.35, sr = 68; b += `<circle class="f-sun" cx="${(fx + sr * Math.cos(sa)).toFixed(1)}" cy="${(fy + sr * Math.sin(sa)).toFixed(1)}" r="4"/>` + txt(fx + sr * Math.cos(sa) - 6, fy + sr * Math.sin(sa) + 16, 'Matahari (8,2 kpc)', 'f-txt', 'end');
  b += txt(fx, 14, 'tampak atas (face-on)', 'f-txt f-b') + txt(fx + 60, fy - 70, 'lengan spiral', 'f-txt f-blue-t') + txt(fx, fy + 4, 'batang', 'f-txt f-warn-t');
  return svg(600, 232, b, 'Struktur Galaksi Bimasakti', 'Piringan (Ø ~30 kpc, tebal ~0,3–1 kpc): bintang populasi I, gas, debu, lengan spiral, gugus terbuka. Tonjolan/batang (Ø ~2–4 kpc) dengan lubang hitam Sgr A* (4 × 10⁶ M☉). Halo bulat (Ø ~100 kpc): bintang populasi II tua dan ~150 gugus bola dengan orbit acak; di luarnya halo materi gelap.');
};

/* ---------- Hubble tuning fork ---------- */
F.garputala = () => {
  const ell = (x, y, e, l) => `<ellipse class="f-warn-fill" style="opacity:.7" cx="${x}" cy="${y}" rx="18" ry="${(18 * (1 - e)).toFixed(1)}"/>` + txt(x, y + 32, l, 'f-txt f-b');
  const spi = (x, y, bar, k, l) => { let d = ''; for (let arm = 0; arm < 2; arm++) { for (let i = 0; i <= 30; i++) { const t = i / 30 * 2.6, r = (bar ? 9 : 5) + (k === 'a' ? 5 : k === 'b' ? 7 : 9) * t, a = t * (k === 'a' ? 1.9 : k === 'b' ? 1.3 : 0.9) + arm * Math.PI; d += (i ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + 0.55 * r * Math.sin(a)).toFixed(1); } } return `<path class="f-blue" d="${d}"/>` + (bar ? `<line class="f-warn" style="stroke-width:4" x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}"/>` : '') + `<ellipse class="f-warn-fill" cx="${x}" cy="${y}" rx="${k === 'a' ? 7 : k === 'b' ? 5 : 3}" ry="${k === 'a' ? 4 : 3}"/>` + txt(x, y + 32, l, 'f-txt f-b'); };
  let b = ell(40, 120, 0, 'E0') + ell(100, 120, 0.3, 'E3') + ell(160, 120, 0.7, 'E7');
  b += `<ellipse class="f-warn-fill" style="opacity:.6" cx="240" cy="120" rx="22" ry="6"/><ellipse class="f-line" cx="240" cy="120" rx="34" ry="9" fill="none"/>` + txt(240, 152, 'S0', 'f-txt f-b');
  b += `<line class="f-line" x1="280" y1="120" x2="310" y2="60"/><line class="f-line" x1="280" y1="120" x2="310" y2="180"/>`;
  b += spi(350, 60, 0, 'a', 'Sa') + spi(430, 60, 0, 'b', 'Sb') + spi(510, 60, 0, 'c', 'Sc');
  b += spi(350, 180, 1, 'a', 'SBa') + spi(430, 180, 1, 'b', 'SBb') + spi(510, 180, 1, 'c', 'SBc');
  b += txt(100, 30, 'eliptik', 'f-txt f-mut-t') + txt(430, 18, 'spiral normal', 'f-txt f-mut-t') + txt(430, 232, 'spiral berbatang', 'f-txt f-mut-t');
  b += `<line class="f-line f-dash" x1="340" y1="248" x2="520" y2="248" marker-end="url(#ahm2)"/><defs><marker id="ahm2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="f-mut-fill"/></marker></defs>` + txt(430, 266, 'tonjolan mengecil, lengan melonggar, gas bertambah', 'f-txt f-mut-t');
  return svg(560, 276, b, 'Diagram garpu tala Hubble', 'Angka En = 10(1 − b/a) menyatakan kepipihan tampak. Hubble menyusunnya kiri ke kanan, tetapi ini klasifikasi bentuk, bukan urutan evolusi. Irregular (Ir) berada di luar garpu tala.');
};

/* ---------- Winding problem vs density wave ---------- */
LAB.lengan = el => {
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, stars = [];
  for (let i = 0; i < 900; i++) stars.push({ r: 0.12 + 0.88 * Math.sqrt(rnd()), a: rnd() * TAU });
  return mkLab(el, {
    title: 'Masalah lilitan vs gelombang kerapatan', hint: 'Kurva rotasi galaksi datar: v hampir tetap, sehingga bintang dalam beredar jauh lebih cepat (ω = v/r). Mode "lengan material": bintang yang mula-mula membentuk lengan akan tergulung makin rapat. Mode "gelombang kerapatan": pola spiral berputar dengan laju pola sendiri; bintang hanya melambat dan berdesakan saat melintasinya, seperti kemacetan di jalan tol.', aspect: 0.7, anim: true,
    controls: [{ k: 'mode', label: 'Gelombang kerapatan (bukan lengan material)', type: 'toggle', val: false }, { k: 'sp', label: 'Kecepatan waktu', min: 0.1, max: 3, step: 0.05, val: 1, fmt: x => fmt(x, 2) + '×' }],
    reset: () => {},
    draw(c, W, H, v, C, t) {
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.46, T = t * v.sp * 0.6;
      disc(c, cx, cy, R * 0.12, C.warn);
      const om = r => 1 / Math.max(r, 0.15), patt = 0.6;
      stars.forEach(st => {
        let a, inArm;
        if (!v.mode) { a = st.a + om(st.r) * T; const a0 = st.a, armPhase = (a0 - Math.log(st.r) * 2.2) % Math.PI; inArm = Math.abs(((armPhase + TAU) % Math.PI) - Math.PI / 2) < 0.22; }
        else { a = st.a + om(st.r) * T; const rel = a - patt * T, ph = (((rel - Math.log(st.r) * 2.2) % Math.PI) + Math.PI) % Math.PI; const dens = Math.cos(2 * (ph - Math.PI / 2)); a += -0.12 * Math.sin(2 * (ph - Math.PI / 2)); inArm = dens > 0.75; }
        const x = cx + R * st.r * Math.cos(a), y = cy + R * st.r * Math.sin(a);
        disc(c, x, y, inArm ? 2.2 : 1.3, inArm ? (v.mode ? C.blue : C.acc) : C.muted);
      });
      const turns = T / (TAU * 0.15) - T / TAU;
      return { what: v.mode ? 'Pola tetap; bintang biru = di lengan saat ini (berganti-ganti)' : 'Lengan tergulung: selisih putaran dalam–luar ≈ ' + fmt(Math.max(0, turns), 1) + ' kali', T: fmt(T * 37, 0) + ' juta tahun (skala kira-kira)' };
    },
    outputs: [['what', 'Yang terlihat'], ['T', 'Waktu']]
  });
};

/* ---------- Tangent-point method (21 cm rotation curve) ---------- */
LAB.tangen = el => mkLab(el, {
  title: 'Metode titik singgung: memetakan rotasi Galaksi dari dalam', hint: 'Kita di Matahari, memandang ke bujur galaksi l. Garis pandang paling dekat ke pusat galaksi di titik singgung (R = R₀ sin l): di sana seluruh kecepatan orbit gas searah garis pandang, sehingga pergeseran Doppler 21 cm terbesar. Tiap l memberi satu titik kurva rotasi.', aspect: 0.62,
  controls: [{ k: 'l', label: 'Bujur galaksi l', min: 5, max: 85, step: 1, val: 30, unit: '°', fmt: x => fmt(x, 0) }, { k: 'R0', label: 'Jarak Matahari ke pusat R₀', min: 7, max: 9, step: 0.1, val: 8.5, unit: 'kpc', fmt: x => fmt(x, 1) }],
  presets: [{ label: 'l = 30° (soal 12)', set: { l: 30, R0: 8.5 } }, { label: 'l = 60°', set: { l: 60 } }],
  draw(c, W, H, v, C) {
    const sc = Math.min(W * 0.62, H * 0.8) / v.R0, gx = W * 0.2, gy = H * 0.88, sx = gx + v.R0 * sc, sy = gy, l = v.l * D2R;
    ring(c, gx, gy, v.R0 * sc, C.line, 1, [3, 5]);
    disc(c, gx, gy, 7, C.warn); text(c, 'pusat Galaksi', gx + 10, gy + 16, C.muted);
    disc(c, sx, sy, 5, C.sun); text(c, 'Matahari', sx - 6, sy + 16, C.sun, 'right');
    const dx = -Math.cos(l), dy = -Math.sin(l), Lmax = v.R0 * 1.9 * sc;
    line(c, sx, sy, sx + dx * Lmax, sy + dy * Lmax, C.muted, 1, [6, 4]);
    const r = v.R0 * Math.cos(l), R = v.R0 * Math.sin(l), tx = sx + dx * r * sc, ty = sy + dy * r * sc;
    ring(c, gx, gy, R * sc, C.blue, 1.4);
    line(c, gx, gy, tx, ty, C.blue, 1.4); disc(c, tx, ty, 5, C.acc);
    arrow(c, tx, ty, tx + dx * 46, ty + dy * 46, C.acc, 2); text(c, 'v orbit ∥ garis pandang', tx + dx * 50 + 4, ty + dy * 50, C.acc);
    text(c, 'l', sx - 28, sy - 6, C.fg);
    const v0 = 220, vr = v0 * (1 - Math.sin(l)); // flat curve: v_r,max = v(R) - v0 sin l
    return { r: fmt(r, 2) + ' kpc', R: fmt(R, 2) + ' kpc', vr: 'v(R) − V₀ sin l = ' + fmt(vr, 0) + ' km/s (untuk kurva datar 220 km/s)' };
  },
  outputs: [['r', 'Jarak titik singgung dari Matahari r = R₀ cos l'], ['R', 'Jarak dari pusat R = R₀ sin l'], ['vr', 'Kecepatan radial maksimum']]
});

/* ---------- Expanding universe: Hubble's law from every galaxy ---------- */
LAB.ekspansi = el => {
  let s = 9; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, gal = [];
  for (let i = 0; i < 46; i++) gal.push([rnd() * 2 - 1, rnd() * 2 - 1]);
  let pick = 0; gal.forEach((g, i) => { if (Math.hypot(...g) < Math.hypot(...gal[pick])) pick = i; });
  const lab = mkLab(el, {
    title: 'Roti kismis kosmik: semua galaksi menjauh dari semua', hint: 'Geser faktor skala a(t). Semua jarak membesar dengan faktor yang sama, jadi dari galaksi mana pun (klik untuk memilih "rumah"), galaksi lain menjauh dengan kecepatan sebanding jaraknya: hukum Hubble. Tidak ada pusat pemuaian; panah = perpindahan sejak a = 1.', aspect: 0.62,
    controls: [{ k: 'a', label: 'Faktor skala a', min: 1, max: 1.6, step: 0.005, val: 1.25, fmt: x => fmt(x, 3) }],
    draw(c, W, H, v, C) {
      const pw = Math.min(W * 0.62, W - 170), cx = pw / 2, cy = H / 2, S = Math.min(pw, H) * 0.19, home = gal[pick];
      c.save(); c.beginPath(); c.rect(0, 0, pw, H); c.clip();
      const P = (g, a) => [cx + (g[0] - home[0]) * a * S, cy + (g[1] - home[1]) * a * S];
      const pts = [];
      gal.forEach((g, i) => { const [x0, y0] = P(g, 1), [x1, y1] = P(g, v.a); if (i !== pick) { line(c, x0, y0, x1, y1, C.line, 1); arrow(c, x0 + (x1 - x0) * 0.6, y0 + (y1 - y0) * 0.6, x1, y1, C.muted, 1); } disc(c, x1, y1, i === pick ? 6 : 3.4, i === pick ? C.acc : C.blue); const d0 = Math.hypot(g[0] - home[0], g[1] - home[1]); pts.push([d0 * v.a, d0 * (v.a - 1)]); });
      text(c, 'rumah kita', P(home, v.a)[0] + 9, P(home, v.a)[1] - 8, C.acc); c.restore();
      // v-d plot
      const bx = pw + 16, bw = W - bx - 12, by = 18, bh = H - 60; c.strokeStyle = C.line; c.strokeRect(bx, by, bw, bh);
      const dm = 2.9 * v.a, vm = 2.9 * 0.6;
      pts.forEach(([d, dv]) => disc(c, bx + d / dm * bw, by + bh - dv / vm * bh, 2.6, C.blue));
      line(c, bx, by + bh, bx + bw, by + bh - (dm * (v.a - 1) / v.a) / vm * bh, C.acc, 1.4, [4, 3]);
      text(c, 'jarak', bx + bw / 2, by + bh + 14, C.muted, 'center'); c.save(); c.translate(bx - 6, by + bh / 2); c.rotate(-Math.PI / 2); text(c, 'perpindahan (∝ kecepatan)', 0, 0, C.muted, 'center'); c.restore();
      return { H: 'kemiringan = (a − 1)/a = ' + fmt((v.a - 1) / v.a, 3), z: fmt(v.a - 1, 3) + ' (cahaya dari a = 1 diterima pada a)' };
    },
    outputs: [['H', 'Garis lurus v ∝ d dari setiap galaksi'], ['z', 'Pergeseran merah z = a_kini/a_dulu − 1']]
  });
  const cv = el.querySelector('canvas');
  cv.style.cursor = 'pointer';
  cv.addEventListener('click', ev => { const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, W = r.width, H = r.height, pw = Math.min(W * 0.62, W - 170), S = Math.min(pw, H) * 0.19, home = gal[pick]; let best = -1, bd = 1e9; gal.forEach((g, i) => { const gx = pw / 2 + (g[0] - home[0]) * lab.v.a * S, gy = H / 2 + (g[1] - home[1]) * lab.v.a * S, d = Math.hypot(gx - x, gy - y); if (d < bd) { bd = d; best = i; } }); if (bd < 24) { pick = best; lab.draw(); } });
};

/* ---------- Scale factor a(t) for different universes ---------- */
LAB.skala = el => mkLab(el, {
  title: 'Sejarah faktor skala a(t)', hint: 'Persamaan Friedmann dengan materi (Ω_m) dan energi gelap (Ω_Λ), semuanya dinormalkan ke hari ini (a = 1, t = 0 di sumbu = sekarang). Garis putus-putus = pemuaian konstan dengan laju sekarang (umur = waktu Hubble 1/H₀). Gravitasi materi memperlambat (umur < 1/H₀); energi gelap mempercepat (umur bisa ≈ atau > 1/H₀).', aspect: 0.6,
  controls: [{ k: 'm', label: 'Ω_materi', min: 0, max: 3, step: 0.01, val: 0.31, fmt: x => fmt(x, 2) }, { k: 'L', label: 'Ω_Λ (energi gelap)', min: 0, max: 1.5, step: 0.01, val: 0.69, fmt: x => fmt(x, 2) }, { k: 'H', label: 'H₀', min: 50, max: 100, step: 0.5, val: 67.7, unit: 'km/s/Mpc', fmt: x => fmt(x, 1) }],
  presets: [{ label: 'Model standar (Planck)', set: { m: 0.31, L: 0.69 } }, { label: 'Einstein–de Sitter', set: { m: 1, L: 0 } }, { label: 'Tertutup (Ω = 2)', set: { m: 2, L: 0 } }, { label: 'Terbuka (Ω = 0,3)', set: { m: 0.3, L: 0 } }, { label: 'Kosong', set: { m: 0, L: 0 } }],
  draw(c, W, H, v, C) {
    const tH = 977.8 / v.H, k = 1 - v.m - v.L, E = a => Math.sqrt(Math.max(1e-12, v.m / a ** 3 + v.L + k / a ** 2));
    // integrate backwards and forwards in units of 1/H0
    const back = [], fwd = []; let a = 1, t = 0, dt = 0.002, ok = true;
    while (a > 0.002 && t > -3) { const da = a * E(a) * dt; a -= da; t -= dt; back.push([t, a]); if (!isFinite(a)) break; }
    const age = -t;
    a = 1; t = 0; let ad = 1;
    for (let i = 0; i < 1500 && a > 0.002 && a < 6; i++) { const h2 = v.m / a ** 3 + v.L + k / a ** 2; if (h2 <= 0) ad = -ad; a += ad * a * Math.sqrt(Math.abs(h2)) * dt; t += dt; fwd.push([t, a]); }
    const box = [46, 12, W - 60, H - 52], tmin = -1.6, tmax = 1.6, X = q => box[0] + (q - tmin) / (tmax - tmin) * box[2], Y = q => box[1] + box[3] * (1 - q / 3);
    c.strokeStyle = C.line; c.strokeRect(box[0], box[1], box[2], box[3]);
    line(c, X(0), box[1], X(0), box[1] + box[3], C.muted, 1, [2, 4]); text(c, 'sekarang', X(0) + 4, box[1] + 12, C.muted);
    line(c, X(-1), Y(0), X(2), Y(3), C.muted, 1, [6, 4]);
    c.strokeStyle = C.acc; c.lineWidth = 2.4; c.beginPath(); let pen = false; back.slice().reverse().concat([[0, 1]], fwd).forEach(([tt, aa]) => { if (tt < tmin || tt > tmax || aa > 3.05) { pen = false; return; } const x = X(tt), y = Y(aa); pen ? c.lineTo(x, y) : c.moveTo(x, y); pen = true; }); c.stroke();
    [-1, 0, 1].forEach(q => text(c, fmt(q * tH, 1), X(q), box[1] + box[3] + 14, C.muted, 'center'));
    text(c, 'waktu dari sekarang (miliar tahun)', box[0] + box[2] / 2, box[1] + box[3] + 30, C.fg, 'center');
    [0, 1, 2, 3].forEach(q => text(c, String(q), box[0] - 6, Y(q), C.muted, 'right'));
    const q0 = v.m / 2 - v.L, fate = fwd.length && fwd[fwd.length - 1][1] < 1 ? 'mengerut kembali (Big Crunch)' : q0 < 0 ? 'mengembang dipercepat selamanya' : 'mengembang selamanya, melambat';
    return { age: fmt(age * tH, 2) + ' miliar tahun (' + fmt(age, 2) + ' × 1/H₀)', geo: Math.abs(k) < 0.01 ? 'datar (Ω = 1)' : k < 0 ? 'tertutup, lengkung positif (Ω > 1)' : 'terbuka, lengkung negatif (Ω < 1)', q: fmt(q0, 2) + (q0 < 0 ? ' (dipercepat)' : ' (diperlambat)'), fate, tH: fmt(tH, 2) + ' miliar tahun', rc: fmt(1.878e-29 * (v.H / 100) ** 2, 2) + ' g/cm³' };
  },
  outputs: [['age', 'Umur alam semesta'], ['tH', 'Waktu Hubble 1/H₀'], ['geo', 'Geometri'], ['q', 'Parameter perlambatan q₀ = Ω_m/2 − Ω_Λ'], ['fate', 'Nasib'], ['rc', 'Kerapatan kritis 3H₀²/8πG']]
});

/* ---------- Three geometries ---------- */
F.geometri = () => {
  let b = '';
  // sphere
  b += `<circle class="f-line" cx="90" cy="100" r="62"/><ellipse class="f-line f-dash" cx="90" cy="100" rx="62" ry="18"/>`;
  b += `<path class="f-acc f-strong" d="M 90 40 Q 60 80 42 108 Q 90 128 138 108 Q 120 80 90 40 Z" fill="none"/>`;
  b += txt(90, 186, 'lengkung positif', 'f-txt f-b') + txt(90, 204, 'Ω > 1, tertutup', 'f-txt f-mut-t') + txt(90, 222, 'Σ sudut > 180°', 'f-txt f-acc-t');
  // flat
  b += `<polygon class="f-line" points="190,140 340,140 360,70 210,70" fill="none"/><polygon class="f-acc f-strong" points="225,128 320,128 270,82" fill="none"/>`;
  b += txt(275, 186, 'datar', 'f-txt f-b') + txt(275, 204, 'Ω = 1', 'f-txt f-mut-t') + txt(275, 222, 'Σ sudut = 180°', 'f-txt f-acc-t');
  // saddle
  let d = ''; for (let i = -4; i <= 4; i++) { let p = ''; for (let j = -10; j <= 10; j++) { const x = j / 10, y = i / 4, z = (x * x - y * y) * 0.45; p += (j > -10 ? 'L' : 'M') + (470 + x * 70 + y * 22).toFixed(1) + ' ' + (100 + y * 26 - z * 50).toFixed(1); } d += p; }
  b += `<path class="f-line f-thin" d="${d}"/><path class="f-acc f-strong" d="M 425 104 Q 470 96 515 104 Q 492 96 470 72 Q 448 96 425 104 Z" fill="none"/>`;
  b += txt(470, 186, 'lengkung negatif', 'f-txt f-b') + txt(470, 204, 'Ω < 1, terbuka', 'f-txt f-mut-t') + txt(470, 222, 'Σ sudut < 180°', 'f-txt f-acc-t');
  return svg(560, 232, b, 'Tiga geometri alam semesta', 'Analogi dua dimensi: permukaan bola, bidang, dan pelana. Pengukuran fluktuasi CMB (WMAP, Planck) menunjukkan alam semesta kita sangat dekat dengan datar: Ω_total = 1,00 ± 0,002.');
};

/* ---------- Telescope optical layouts ---------- */
F.teleskoptipe = () => {
  const ray = (pts, cls = 'f-warn') => `<polyline class="${cls}" fill="none" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
  let b = '';
  // refractor
  b += txt(20, 22, 'Refraktor (lensa)', 'f-txt f-b', 'start');
  b += `<ellipse class="f-blue" cx="60" cy="70" rx="5" ry="30" fill="none"/><line class="f-line f-thin" x1="20" y1="70" x2="250" y2="70"/>`;
  [-22, 0, 22].forEach(y => { b += ray([[20, 70 + y], [60, 70 + y], [200, 70]]); });
  b += `<circle class="f-acc-fill" cx="200" cy="70" r="3"/>` + txt(200, 90, 'fokus', 'f-txt f-acc-t') + `<ellipse class="f-blue" cx="230" cy="70" rx="3" ry="9" fill="none"/>` + txt(232, 54, 'okuler', 'f-txt f-mut-t');
  // Newtonian
  b += txt(290, 22, 'Newtonian', 'f-txt f-b', 'start');
  b += `<path class="f-blue f-strong" d="M 500 38 Q 510 70 500 102" fill="none"/><line class="f-line f-thin" x1="290" y1="70" x2="505" y2="70"/><line class="f-line" x1="370" y1="62" x2="386" y2="78"/>`;
  [-24, 24].forEach(y => { b += ray([[290, 70 + y], [502, 70 + y], [378, 70], [378, 30]]); });
  b += `<circle class="f-acc-fill" cx="378" cy="30" r="3"/>` + txt(392, 34, 'fokus (samping tabung)', 'f-txt f-acc-t', 'start') + txt(500, 118, 'cermin primer parabola', 'f-txt f-mut-t', 'end');
  // Cassegrain
  b += txt(20, 152, 'Cassegrain (Schmidt-Cassegrain: + pelat koreksi di depan)', 'f-txt f-b', 'start');
  b += `<path class="f-blue f-strong" d="M 220 168 Q 230 200 220 232" fill="none"/><line class="f-line f-thin" x1="20" y1="200" x2="280" y2="200"/><path class="f-blue f-strong" d="M 112 190 Q 108 200 112 210" fill="none"/>`;
  [-26, 26].forEach(y => { b += ray([[20, 200 + y], [222, 200 + y], [112, 200 + y * 0.28], [262, 200]]); });
  b += `<rect class="f-line" x="214" y="194" width="10" height="12" fill="none"/><circle class="f-acc-fill" cx="262" cy="200" r="3"/>` + txt(262, 222, 'fokus', 'f-txt f-acc-t') + txt(112, 240, 'sekunder cembung', 'f-txt f-mut-t');
  ['Cermin: tanpa aberasi kromatik,', 'ditopang dari belakang,', 'bisa sangat besar.', 'Lensa: aberasi kromatik,', 'melendut, menyerap UV;', 'refraktor terbesar ±1 m.'].forEach((t, i) => { b += txt(310, 172 + i * 17 + (i > 2 ? 6 : 0), t, i === 0 || i === 3 ? 'f-txt f-b' : 'f-txt', 'start'); });
  return svg(560, 272, b, 'Jenis teleskop optik', 'Cassegrain melipat jalur cahaya sehingga panjang fokus besar dalam tabung pendek; Schmidt memberi medan pandang lebar untuk survei.');
};

/* ---------- Diffraction: Airy pattern and the Rayleigh criterion ---------- */
LAB.difraksi = el => mkLab(el, {
  title: 'Daya pisah: kapan dua bintang tampak dua?', hint: 'Cahaya bintang (sumber titik) melewati bukaan bundar menjadi pola Airy: cakram pusat dengan cincin-cincin redup. Dua bintang terpisah bila jaraknya ≥ jari-jari cakram pusat, θ = 1,22 λ/D (kriteria Rayleigh). Di Bumi, turbulensi udara (seeing ~1″) biasanya lebih membatasi daripada difraksi.', aspect: 0.55,
  controls: [{ k: 'sep', label: 'Jarak sudut kedua bintang', min: 0.05, max: 3, step: 0.01, val: 1.0, unit: '″', fmt: x => fmt(x, 2) }, { k: 'D', label: 'Diameter bukaan D', min: 20, max: 1000, log: true, val: 120, unit: 'mm', fmt: x => fmt(x, 0) }, { k: 'lam', label: 'Panjang gelombang λ', min: 400, max: 700, step: 5, val: 550, unit: 'nm', fmt: x => fmt(x, 0) }, { k: 'see', label: 'Tambahkan seeing 1″ (atmosfer)', type: 'toggle', val: false }],
  presets: [{ label: 'Teropong 50 mm', set: { D: 50 } }, { label: 'Teleskop 120 mm, 1″', set: { D: 120, sep: 1 } }, { label: 'Bosscha 600 mm', set: { D: 600, sep: 0.3 } }],
  draw(c, W, H, v, C) {
    const th = 1.22 * v.lam * 1e-9 / (v.D / 1000) * 206265, sig = v.see ? 1 / 2.355 : 0;
    const J1 = x => { if (x > 12) return Math.sqrt(2 / (Math.PI * x)) * Math.cos(x - 3 * Math.PI / 4); let s = 0, k = 0; const h = x / 2; for (k = 0; k < 30; k++) { s += (k % 2 ? -1 : 1) * Math.pow(h, 2 * k + 1) / (fac(k) * fac(k + 1)); } return s; }, fac = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
    const airy = x => { const u = 3.8317 * x / th; if (Math.abs(u) < 1e-6) return 1; if (Math.abs(u) > 25) return 0; const j = 2 * J1(u) / u; return j * j; };
    const prof = x => { if (!sig) return airy(x); let s = 0, n = 0; for (let k = -12; k <= 12; k++) { const d = k * sig / 4, w = Math.exp(-d * d / (2 * sig * sig)); s += w * airy(x - d); n += w; } return s / n; };
    const span = Math.max(3 * th, v.sep * 1.6, sig ? 3 : 0), box = [30, 16, W - 60, H * 0.62], X = q => box[0] + box[2] / 2 + q / span * box[2] / 2, Y = q => box[1] + box[3] * (1 - q / 1.05);
    c.strokeStyle = C.line; c.strokeRect(box[0], box[1], box[2], box[3]);
    const f1 = x => prof(x + v.sep / 2), f2 = x => prof(x - v.sep / 2);
    let peak = 0; for (let i = 0; i <= 300; i++) { const x = -span + 2 * span * i / 300; peak = Math.max(peak, f1(x) + f2(x)); }
    [[f1, C.blue], [f2, C.warn], [x => f1(x) + f2(x), C.acc]].forEach(([f, col], j) => { c.strokeStyle = col; c.lineWidth = j === 2 ? 2.4 : 1.3; c.beginPath(); for (let i = 0; i <= 300; i++) { const x = -span + 2 * span * i / 300, y = f(x) / peak; i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)); } c.stroke(); });
    const dip = (f1(0) + f2(0)) / peak;
    // 2D image strip
    const iy = box[1] + box[3] + 12, ih = H - iy - 8, iw = ih * 2.2, ix = W / 2 - iw / 2, img = c.createImageData(Math.max(1, Math.round(iw)), Math.max(1, Math.round(ih)));
    for (let yy = 0; yy < img.height; yy++) for (let xx = 0; xx < img.width; xx++) { const ax = (xx / img.width - 0.5) * 2 * span * (iw / box[2]) * (box[2] / iw), ay = (yy / img.height - 0.5) * 2 * span * (ih / iw), r1 = Math.hypot(ax + v.sep / 2, ay), r2 = Math.hypot(ax - v.sep / 2, ay), I = Math.min(1, Math.sqrt((prof(r1) + prof(r2)) / peak)), o = 4 * (yy * img.width + xx); img.data[o] = img.data[o + 1] = 255 * I; img.data[o + 2] = 235 * I + 20 * I; img.data[o + 3] = 255; }
    c.putImageData(img, Math.round(ix), Math.round(iy));
    const res = v.sep >= th * 0.999 && (!sig || v.sep >= 1), lim = v.see ? Math.max(th, 1) : th;
    return { th: fmt(th, 3) + '″ (≈ 140/D mm)', lim: fmt(lim, 2) + '″' + (v.see && th < 1 ? ' (dibatasi seeing)' : ''), dip: dip < 0.99 ? 'lembah ' + fmt(dip * 100, 0) + '% dari puncak' : 'tak ada lembah', res: dip < 0.81 ? 'terpisah jelas' : dip < 0.99 ? 'baru terpisah (≈ batas Rayleigh)' : 'melebur jadi satu' };
  },
  outputs: [['th', 'Batas difraksi 1,22 λ/D'], ['lim', 'Daya pisah efektif'], ['dip', 'Kecerlangan di tengah'], ['res', 'Hasil']]
});

/* ---------- Aperture photometry on the book's CCD frame ---------- */
LAB.fotometri = el => {
  const G = [[236, 253, 269, 233, 267, 281, 251, 285, 296], [286, 239, 291, 256, 250, 249, 264, 261, 282], [268, 275, 230, 263, 848, 257, 251, 250, 256], [268, 265, 269, 862, 982, 854, 268, 264, 261], [274, 279, 877, 951, 1509, 975, 878, 268, 272], [234, 246, 248, 831, 993, 851, 257, 254, 259], [267, 262, 281, 282, 863, 264, 260, 244, 248], [245, 244, 240, 230, 268, 245, 248, 269, 265], [246, 247, 268, 262, 271, 269, 260, 248, 241]];
  return mkLab(el, {
    title: 'Fotometri apertur pada citra CCD', hint: 'Data cacah 9×9 piksel dari contoh buku. Lingkaran dalam (apertur) memuat cahaya bintang + langit; cincin luar dipakai untuk menaksir langit per piksel. Cahaya bintang = jumlah di apertur − (rata-rata langit × jumlah piksel apertur). Coba kecilkan apertur sampai sebagian cahaya bintang terbuang.', aspect: 0.62,
    controls: [{ k: 'r', label: 'Jari-jari apertur', min: 0.5, max: 3, step: 0.1, val: 2.1, unit: 'piksel', fmt: x => fmt(x, 1) }, { k: 'r1', label: 'Cincin langit, jari-jari dalam', min: 2.15, max: 4, step: 0.05, val: 2.2, unit: 'piksel', fmt: x => fmt(x, 1) }, { k: 'r2', label: 'Cincin langit, jari-jari luar', min: 3, max: 6, step: 0.1, val: 6, unit: 'piksel', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Seperti buku', set: { r: 2.1, r1: 2.2, r2: 6 } }, { label: 'Apertur terlalu kecil', set: { r: 1.0 } }],
    draw(c, W, H, v, C) {
      const n = 9, cs = Math.min((W - 20) / n * 0.62, (H - 20) / n), ox = 10, oy = (H - cs * n) / 2;
      let sky = 0, ns = 0, sum = 0, na = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const d = Math.hypot(i - 4, j - 4), val = G[i][j]; if (d <= v.r) { sum += val; na++; } else if (d >= v.r1 && d <= v.r2) { sky += val; ns++; } }
      const mean = ns ? sky / ns : 0, star = sum - mean * na;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const val = G[i][j], t = Math.min(1, Math.max(0, (Math.log(val) - Math.log(220)) / (Math.log(1509) - Math.log(220)))), g = Math.round(20 + 235 * t); c.fillStyle = `rgb(${g},${g},${Math.min(255, g + 15)})`; c.fillRect(ox + j * cs, oy + i * cs, cs - 1, cs - 1); const d = Math.hypot(i - 4, j - 4); text(c, String(val), ox + j * cs + cs / 2, oy + i * cs + cs / 2, t > 0.5 ? '#111' : '#ddd', 'center', `${Math.max(8, Math.min(11, cs / 3.6))}px ${C.mono}`); if (d <= v.r) { c.strokeStyle = C.acc; c.lineWidth = 2; c.strokeRect(ox + j * cs + 1, oy + i * cs + 1, cs - 3, cs - 3); } else if (d >= v.r1 && d <= v.r2) { c.fillStyle = C.blue; c.globalAlpha = 0.18; c.fillRect(ox + j * cs, oy + i * cs, cs - 1, cs - 1); c.globalAlpha = 1; } }
      c.font = `12px ${C.ui}`;
      const cx = ox + 4.5 * cs, cy = oy + 4.5 * cs; ring(c, cx, cy, v.r * cs, C.acc, 1.5); ring(c, cx, cy, v.r1 * cs, C.blue, 1, [4, 3]); ring(c, cx, cy, v.r2 * cs, C.blue, 1, [4, 3]);
      return { sky: fmt(mean, 1) + ' per piksel (' + ns + ' piksel)', ap: na + ' piksel, jumlah ' + fmt(sum, 0), star: fmt(star, 0) + ' cacah', m: fmt(-2.5 * Math.log10(Math.max(star, 1)), 2) + ' (magnitudo instrumen)' };
    },
    outputs: [['sky', 'Langit rata-rata'], ['ap', 'Apertur'], ['star', 'Cahaya bintang'], ['m', 'm_ins = −2,5 log C']]
  });
};

/* ================= Bab 12: Matahari dan tata surya ================= */
/* ---------- Solar interior + atmosphere cross-section ---------- */
F.matahari = () => {
  const cx = 235, cy = 262, R = 180, rc = R * 0.25, rr = R * 0.71;
  const arc = (r, cls, extra = '') => `<path class="${cls}" ${extra} d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z"/>`;
  let b = '';
  // corona streamers
  [-60, -25, 15, 50].forEach(a => { const t = (a - 90) * D2R, x1 = cx + (R + 4) * Math.cos(t), y1 = cy + (R + 4) * Math.sin(t), x2 = cx + (R + 70) * Math.cos(t), y2 = cy + (R + 70) * Math.sin(t); b += `<line class="f-warn f-thin" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-dasharray="3 4"/>`; });
  b += `<path class="f-line f-dash" d="M ${cx - R - 40} ${cy} A ${R + 40} ${R + 40} 0 0 1 ${cx + R + 40} ${cy}"/>`;
  b += arc(R + 7, 'f-acc', 'fill="none" stroke-width="4" opacity="0.55"');
  b += `<path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="#f2b33d" opacity="0.55"/>`;
  b += `<path d="M ${cx - rr} ${cy} A ${rr} ${rr} 0 0 1 ${cx + rr} ${cy} Z" fill="#f4c55c" opacity="0.9"/>`;
  b += `<path d="M ${cx - rc} ${cy} A ${rc} ${rc} 0 0 1 ${cx + rc} ${cy} Z" fill="#fff2b0"/>`;
  b += `<line class="f-line" x1="${cx - R - 50}" y1="${cy}" x2="${cx + R + 50}" y2="${cy}"/>`;
  // convection cells (left half), radiative zigzag (right half)
  for (let i = 0; i < 7; i++) { const a = (195 + i * 21) * D2R, rm = (rr + R) / 2, x = cx + rm * Math.cos(a), y = cy + rm * Math.sin(a); b += `<circle class="f-line" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${((R - rr) / 2 - 4).toFixed(1)}" fill="none" stroke-dasharray="4 3"/>`; }
  let z = `M ${cx + rc + 4} ${cy - 6}`; for (let i = 1; i <= 14; i++) { const r = rc + 4 + (rr - rc - 8) * i / 14, a = -(18 + (i % 2 ? 9 : 0)) * D2R; z += ` L ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; }
  b += `<path class="f-blue" fill="none" d="${z}"/>`;
  const lab = (x, y, s, cls = 'f-txt', a = 'start') => txt(x, y, s, cls, a);
  b += lab(cx, cy - 22, 'inti', 'f-txt f-b', 'middle') + lab(cx, cy - 7, '15 juta K', 'f-txt', 'middle');
  b += lab(cx + 8, cy - rc - 30, 'zona radiatif', 'f-txt f-b', 'middle') + lab(cx + 8, cy - rc - 15, 'foton "berjalan acak"', 'f-txt f-blue-t', 'middle');
  b += lab(cx - 92, cy - 128, 'zona', 'f-txt f-b', 'middle') + lab(cx - 92, cy - 113, 'konveksi', 'f-txt f-b', 'middle');
  const ann = [[cy - 196, 'Fotosfer · 400 km · 5800 K', 'granulasi, bintik'], [cy - 160, 'Kromosfer · 2000 km · ~10⁴ K', 'merah Hα; spikula'], [cy - 124, 'Korona · jutaan km · 1–2 juta K', 'angin surya; saat GMT, di sinar-X']];
  ann.forEach(([y, a, s], i) => { b += lab(455, y, a, 'f-txt f-b') + lab(430, y + 15, s, 'f-txt f-mut-t'); });
  b += `<line class="f-line f-thin" x1="${cx + 90}" y1="${cy - 156}" x2="450" y2="${cy - 200}"/><line class="f-acc f-thin" x1="${cx + 115}" y1="${cy - 147}" x2="450" y2="${cy - 164}"/><line class="f-warn f-thin" x1="${cx + 161}" y1="${cy - 135}" x2="450" y2="${cy - 128}"/>`;
  b += lab(455, cy - 70, 'Batas 0,25 R: inti', 'f-txt') + lab(455, cy - 54, 'Batas 0,71 R: awal konveksi', 'f-txt') + lab(455, cy - 30, 'Foton dari inti butuh ~10⁵ tahun', 'f-txt f-mut-t') + lab(455, cy - 15, 'untuk sampai di fotosfer.', 'f-txt f-mut-t');
  return svg(700, 272, b, 'Struktur Matahari', 'Separuh atas penampang Matahari: inti (energi dibangkitkan), zona radiatif (energi merambat sebagai radiasi), zona konveksi (gas panas naik, dingin turun → granulasi di fotosfer). Di atasnya atmosfer: fotosfer, kromosfer, korona. Anehnya suhu naik lagi di atas fotosfer; korona dipanasi oleh medan magnet (gelombang dan "nanoflare"), bukan oleh radiasi dari bawah.');
};

/* deterministic pseudo-random */
const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* ---------- Sunspot cycle: butterfly diagram + Hale polarity ---------- */
LAB.kupu = el => {
  const SP = []; const r = rng(7);
  const amp = ph => { const u = (ph + 0.08) / 1.13; return u < 0 || u > 1 ? 0 : Math.sin(Math.PI * Math.pow(u, 0.75)) ** 2; };
  // three cycles of 11 yr, each spot: time, latitude, hemisphere, cycle index; each cycle overlaps the next by ~1.5 yr
  for (let k = -1; k < 4; k++) for (let i = 0; i < 1400; i++) { const ph = r() * 1.15 - 0.08, t = 11 * k + ph * 11; if (r() > amp(ph)) continue; const lat = (35 - 29 * Math.min(1, Math.max(0, ph))) + (r() - 0.5) * 12, s = r() < 0.5 ? 1 : -1; SP.push([t, s * Math.max(2, lat), k]); }
  return mkLab(el, {
    title: 'Siklus 11 tahun dan diagram kupu-kupu', hint: 'Atas: setiap titik = satu kelompok bintik (lintang vs waktu). Awal siklus bintik muncul di lintang ±30°–35°, makin lama makin dekat ekuator (hukum Spörer) → bentuk sayap kupu-kupu. Bawah: bilangan bintik. Kanan: Matahari pada saat terpilih; merah = polaritas utara (+), biru = selatan (−), bintik pendahulu di depan arah rotasi. Polaritas pendahulu berbalik setiap siklus → siklus magnetik 22 tahun.', aspect: 0.62,
    controls: [{ k: 't', label: 'Waktu', min: 0, max: 33, step: 0.05, val: 5.5, unit: 'tahun', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Minimum', set: { t: 0.2 } }, { label: 'Awal siklus', set: { t: 1.5 } }, { label: 'Maksimum', set: { t: 5 } }, { label: 'Akhir siklus', set: { t: 10 } }, { label: 'Siklus berikutnya', set: { t: 16 } }],
    draw(c, W, H, v, C) {
      const pw = W * 0.66, box = [44, 10, pw - 50, H * 0.5], { X, Y } = OSN.labkit.axes(c, C, box, [0, 33], [-45, 45], { xt: [0, 11, 22, 33], yt: [-40, -20, 0, 20, 40], yf: q => q + '°', yl: 'lintang', ylo: 34 });
      SP.forEach(([t, lat, k]) => { if (t < 0 || t > 33) return; c.fillStyle = t <= v.t ? (k % 2 ? C.blue : C.acc) : C.line; c.fillRect(X(t) - 1, Y(lat) - 1, 2.2, 2.2); });
      const box2 = [44, box[1] + box[3] + 14, pw - 50, H - box[3] - 52], ss = t => { let s = 0; for (let k = -1; k < 4; k++) { const ph = (t - 11 * k) / 11; s += 160 * amp(ph); } return s; };
      const A2 = OSN.labkit.axes(c, C, box2, [0, 33], [0, 200], { xt: [0, 11, 22, 33], xf: q => q + ' th', yt: [0, 100, 200], yl: 'R', ylo: 34 });
      c.strokeStyle = C.acc; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 330; i++) { const t = i / 10; i ? c.lineTo(A2.X(t), A2.Y(ss(t))) : c.moveTo(A2.X(t), A2.Y(ss(t))); } c.stroke();
      line(c, X(v.t), box[1], X(v.t), box2[1] + box2[3], C.fg, 1);
      // Sun disc
      const sx = pw + (W - pw) / 2, sy = H * 0.42, sr = Math.min((W - pw) / 2 - 10, H * 0.32);
      disc(c, sx, sy, sr, '#f2c45a'); ring(c, sx, sy, sr, C.line);
      line(c, sx - sr, sy, sx + sr, sy, 'rgba(0,0,0,0.25)', 1, [3, 3]);
      const now = SP.filter(([t]) => Math.abs(t - v.t) < 0.25);
      now.forEach(([t, lat, k], i) => { const lon = ((i * 137.5) % 120 - 60) * D2R, la = lat * D2R, x = sx + sr * Math.cos(la) * Math.sin(lon), y = sy - sr * Math.sin(la); const lead = (k % 2 === 0) === (lat > 0); const cl = lead ? '#d9483b' : '#3b6fd9', cf = lead ? '#3b6fd9' : '#d9483b'; disc(c, x + 5, y, 2.6, cl); disc(c, x - 5, y, 2.6, cf); });
      arrow(c, sx - sr * 0.5, sy + sr + 14, sx + sr * 0.5, sy + sr + 14, C.muted, 1.2); text(c, 'arah rotasi', sx, sy + sr + 28, C.muted, 'center');
      const k = Math.floor(v.t / 11), ph = v.t / 11 - k, lats = now.map(s => Math.abs(s[1])), ml = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : NaN;
      return { ph: fmt(ph * 11, 1) + ' tahun sejak minimum (siklus ke-' + (k + 1) + ')', R: '≈ ' + fmt(ss(v.t), 0), lat: isFinite(ml) ? '≈ ' + fmt(ml, 0) + '°' : 'hampir tak ada bintik', pol: 'belahan utara: pendahulu ' + (k % 2 === 0 ? '(+) utara' : '(−) selatan') + '; selatan: kebalikannya' };
    },
    outputs: [['ph', 'Fase siklus'], ['R', 'Bilangan bintik (model)'], ['lat', 'Lintang rata-rata bintik'], ['pol', 'Hukum polaritas Hale']]
  });
};

/* ---------- Babcock dynamo: differential rotation winds up the field ---------- */
LAB.dinamo = el => mkLab(el, {
  title: 'Rotasi diferensial menggulung medan magnet', hint: 'Garis-garis medan mula-mula membentang utara–selatan (poloidal). Ekuator berotasi ~25 hari, dekat kutub ~35 hari, sehingga garis medan tertarik ke timur di ekuator dan tergulung melingkari Matahari (toroidal). Medan yang makin rapat dan kuat mengapung (daya apung magnetik) menembus fotosfer sebagai pasangan bintik berpolaritas berlawanan. Inilah model dinamo Babcock.', aspect: 0.6,
  controls: [{ k: 't', label: 'Waktu sejak medan lurus', min: 0, max: 900, step: 1, val: 120, unit: 'hari', fmt: x => fmt(x, 0) }, { k: 'n', label: 'Jumlah garis medan', min: 3, max: 12, step: 1, val: 7, fmt: x => fmt(x, 0) }],
  presets: [{ label: 'Awal', set: { t: 0 } }, { label: '1 putaran ekuator', set: { t: 25.4 } }, { label: '~4 bulan', set: { t: 120 } }, { label: '~2 tahun', set: { t: 730 } }],
  draw(c, W, H, v, C) {
    const cx = W * 0.36, cy = H * 0.5, R = Math.min(W * 0.3, H * 0.44), Om = p => { const s = Math.sin(p) ** 2; return 14.713 - 2.396 * s - 1.787 * s * s; }; // deg/day (Snodgrass)
    disc(c, cx, cy, R, '#f2c45a'); ring(c, cx, cy, R, C.line);
    for (const la of [-60, -30, 0, 30, 60]) { const y = cy - R * Math.sin(la * D2R), hw = R * Math.cos(la * D2R); line(c, cx - hw, y, cx + hw, y, 'rgba(0,0,0,0.15)', 1, [2, 4]); }
    const ref = Om(Math.PI / 2 * 0.9);
    for (let j = 0; j < v.n; j++) {
      const l0 = -90 + 180 * (j + 0.5) / v.n; c.strokeStyle = j % 2 ? '#b8322a' : '#7a1f8a'; c.lineWidth = 1.6; c.beginPath(); let pen = false;
      for (let i = 0; i <= 400; i++) { const p = (-88 + 176 * i / 400) * D2R, lon = (l0 + (Om(p) - ref) * v.t) * D2R, x = Math.cos(p) * Math.sin(lon), z = Math.cos(p) * Math.cos(lon), y = Math.sin(p); if (z < 0) { pen = false; continue; } const X = cx + R * x, Y = cy - R * y; pen ? c.lineTo(X, Y) : c.moveTo(X, Y); pen = true; }
      c.stroke();
    }
    // side panel: rotation profile
    const bx = W * 0.72, bw = W * 0.24, by = 20, bh = H - 60, { X, Y } = OSN.labkit.axes(c, C, [bx, by, bw, bh], [24, 36], [-90, 90], { xt: [25, 30, 35], xf: q => q + ' h', yt: [-60, -30, 0, 30, 60], yf: q => q + '°' });
    c.strokeStyle = C.acc; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 90; i++) { const p = -88 + 176 * i / 90, P = 360 / Om(p * D2R); i ? c.lineTo(X(P), Y(p)) : c.moveTo(X(P), Y(p)); } c.stroke();
    text(c, 'periode rotasi', bx + bw / 2, by + bh + 30, C.fg, 'center');
    const lead = (Om(0) - Om(60 * D2R)) * v.t;
    return { eq: fmt(360 / Om(0), 1) + ' hari; lintang 60°: ' + fmt(360 / Om(60 * D2R), 1) + ' hari', lead: fmt(lead, 0) + '° = ' + fmt(lead / 360, 2) + ' putaran', note: lead / 360 < 0.5 ? 'medan masih hampir poloidal' : lead / 360 < 3 ? 'medan mulai tergulung (toroidal) di lintang rendah' : 'gulungan rapat → medan kuat mengapung menjadi bintik' };
  },
  outputs: [['eq', 'Periode di ekuator'], ['lead', 'Ekuator mendahului lintang 60°'], ['note', 'Keadaan medan']]
});

/* ---------- Inferior planet: elongation, phase, size, brightness ---------- */
LAB.planetdalam = el => mkLab(el, {
  title: 'Venus dan Merkurius: elongasi, fase, ukuran, terang', hint: 'Kiri: tampak atas (Bumi diam di bawah, Matahari di tengah). θ = sudut di Matahari antara Bumi dan planet. Kanan: wujud planet di teleskop dengan ukuran sebenarnya relatif (∝ 1/jarak). Perhatikan: saat sabit planet paling besar (paling dekat), saat hampir purnama paling kecil (di balik Matahari), dan terang maksimum Venus jatuh di antaranya (sabit lebar, elongasi ~39°). Purnama penuh tak pernah terlihat karena saat itu planet tepat di belakang Matahari.', aspect: 0.56,
  controls: [{ k: 'a', label: 'Jarak planet ke Matahari', min: 0.3, max: 0.95, step: 0.001, val: 0.723, unit: 'SA', fmt: x => fmt(x, 3) }, { k: 'th', label: 'Sudut θ (Bumi–Matahari–planet)', min: -180, max: 180, step: 0.5, val: 46, unit: '°', fmt: x => fmt(x, 1) }],
  presets: [{ label: 'Venus', set: { a: 0.723 } }, { label: 'Merkurius', set: { a: 0.387 } }, { label: 'Konjungsi inferior', set: { th: 0.5 } }, { label: 'Elongasi terbesar', set: { th: 999 } }, { label: 'Konjungsi superior', set: { th: 180 } }, { label: 'Soal 21 (el. 30°)', set: { a: 0.7233, th: 13.73 } }],
  onPreset: v => { if (v.th === 999) v.th = Math.acos(v.a) / D2R; },
  draw(c, W, H, v, C) {
    const th = v.th * D2R, cx = W * 0.3, cy = H * 0.45, s = Math.min(W * 0.26, H * 0.42), E = [cx, cy + s], P = [cx + v.a * s * Math.sin(th), cy + v.a * s * Math.cos(th)];
    ring(c, cx, cy, s, C.line); ring(c, cx, cy, v.a * s, C.line, 1, [3, 4]);
    line(c, E[0], E[1], cx, cy, C.sun, 1.2); line(c, E[0], E[1], P[0], P[1], C.acc, 1.6);
    disc(c, cx, cy, 11, C.sun); disc(c, E[0], E[1], 6, C.blue); disc(c, P[0], P[1], 5, C.warn);
    text(c, 'Bumi', E[0] + 10, E[1] + 12, C.fg); text(c, 'planet', P[0] + 8, P[1] - 8, C.warn);
    const dx = P[0] - E[0], dy = P[1] - E[1], d = Math.hypot(dx, dy) / s, elong = Math.acos(((cx - E[0]) * dx + (cy - E[1]) * dy) / (s * d * s)) / D2R;
    const cosA = ((E[0] - P[0]) * (cx - P[0]) + (E[1] - P[1]) * (cy - P[1])) / (d * s * v.a * s), alpha = Math.acos(Math.max(-1, Math.min(1, cosA))), k = (1 + Math.cos(alpha)) / 2;
    c.strokeStyle = C.acc; c.lineWidth = 1; c.beginPath(); const a0 = Math.atan2(cy - E[1], cx - E[0]), a1 = Math.atan2(dy, dx); c.arc(E[0], E[1], 34, Math.min(a0, a1), Math.max(a0, a1)); c.stroke();
    // telescope view
    const tx = W * 0.75, ty = H * 0.36, rmax = Math.min(W * 0.2, H * 0.3), rp = Math.min(rmax, rmax * (1 - v.a) / d * 0.95);
    ring(c, tx, ty, rmax + 6, C.line, 1, [2, 4]);
    const east = dx < 0; // planet appears east of Sun (evening) if to the left in this view (Earth looking up, east = left)
    disc(c, tx, ty, rp, '#2a2f3a'); c.fillStyle = '#f4efe2'; c.beginPath();
    const sgn = east ? 1 : -1; // lit side faces the Sun: evening star -> Sun to the west (right)
    for (let i = 0; i <= 40; i++) { const t = -Math.PI / 2 + Math.PI * i / 40; c.lineTo(tx + sgn * rp * Math.cos(t), ty + rp * Math.sin(t)); }
    for (let i = 40; i >= 0; i--) { const t = -Math.PI / 2 + Math.PI * i / 40; c.lineTo(tx - sgn * rp * Math.cos(alpha) * Math.cos(t) * 1 * 1, ty + rp * Math.sin(t)); }
    c.fill();
    const B = k / (d * d), Bmax = (() => { let m = 0; for (let i = 1; i < 720; i++) { const t = i * D2R / 2, px = v.a * Math.sin(t), py = v.a * Math.cos(t), dd = Math.hypot(px, py - 1), ca = (-(px) * (0 - px) + (1 - py) * (0 - py)) / (dd * v.a); const kk = (1 + Math.max(-1, Math.min(1, ca))) / 2; m = Math.max(m, kk / (dd * dd)); } return m; })();
    text(c, east ? 'bintang senja (timur Matahari)' : 'bintang fajar (barat Matahari)', tx, ty + rmax + 20, C.muted, 'center');
    c.fillStyle = C.sun; c.fillRect(tx - rmax, H - 18, 2 * rmax * B / Bmax, 7); c.strokeStyle = C.line; c.strokeRect(tx - rmax, H - 18, 2 * rmax, 7); text(c, 'terang relatif', tx, H - 26, C.muted, 'center');
    return { el: fmt(elong, 1) + '° (maks ' + fmt(Math.asin(v.a) / D2R, 1) + '°)', d: fmt(d, 3) + ' SA = ' + fmt(d * 149.6, 1) + ' juta km', k: fmt(k * 100, 0) + '% (sudut fase ' + fmt(alpha / D2R, 0) + '°)', B: fmt(100 * B / Bmax, 0) + '% dari terang maksimum' };
  },
  outputs: [['el', 'Elongasi'], ['d', 'Jarak dari Bumi'], ['k', 'Bagian piringan yang terang'], ['B', 'Kecerlangan (≈ k/d²)']]
});

/* ---------- Where can liquid water exist? ---------- */
LAB.zonaair = el => mkLab(el, {
  title: 'Di mana air bisa cair?', hint: 'Suhu kesetimbangan planet yang berotasi cepat dan memancar sebagai benda hitam: T = 278,6 K × (1 − A)^¼ × (L/L☉)^¼ / √d(SA). Pita biru = 273–373 K (air cair pada tekanan 1 atm). Tambahkan efek rumah kaca untuk melihat bagaimana atmosfer menggeser hasilnya; naikkan L untuk melihat zona bergeser keluar saat Matahari menua.', aspect: 0.55,
  controls: [{ k: 'A', label: 'Albedo A', min: 0, max: 0.8, step: 0.01, val: 0, fmt: x => fmt(x, 2) }, { k: 'g', label: 'Pemanasan rumah kaca ΔT', min: 0, max: 500, step: 1, val: 0, unit: 'K', fmt: x => fmt(x, 0) }, { k: 'L', label: 'Luminositas Matahari', min: 0.7, max: 3, step: 0.01, val: 1, unit: 'L☉', fmt: x => fmt(x, 2) }],
  presets: [{ label: 'Benda hitam (soal 47)', set: { A: 0, g: 0, L: 1 } }, { label: 'Albedo Bumi 0,3', set: { A: 0.3, g: 0 } }, { label: 'Bumi + rumah kaca 33 K', set: { A: 0.3, g: 33 } }, { label: 'Matahari muda 0,7 L☉', set: { L: 0.7 } }],
  draw(c, W, H, v, C) {
    const box = [52, 12, W - 70, H - 50], { X, Y } = OSN.labkit.axes(c, C, box, [0.2, 40], [20, 900], { xlog: true, ylog: true, xt: [0.3, 1, 3, 10, 30], xf: q => String(q).replace('.', ','), yt: [30, 100, 300, 900], yf: q => q + ' K', xl: 'jarak dari Matahari (SA)', yl: 'suhu', ylo: 40 });
    c.fillStyle = C.blue; c.globalAlpha = 0.16; c.fillRect(box[0], Y(373), box[2], Y(273) - Y(373)); c.globalAlpha = 1;
    const T = d => 278.6 * Math.pow(1 - v.A, 0.25) * Math.pow(v.L, 0.25) / Math.sqrt(d) + v.g;
    c.strokeStyle = C.acc; c.lineWidth = 2.2; c.beginPath(); for (let i = 0; i <= 200; i++) { const d = 0.2 * Math.pow(200, i / 200); i ? c.lineTo(X(d), Y(T(d))) : c.moveTo(X(d), Y(T(d))); } c.stroke();
    const pl = [['Merkurius', 0.387, 440], ['Venus', 0.723, 737], ['Bumi', 1, 288], ['Mars', 1.524, 210], ['Jupiter', 5.2, 165], ['Saturnus', 9.54, 134], ['Uranus', 19.2, 76], ['Neptunus', 30.1, 72]];
    pl.forEach(([n, d, t]) => { const x = X(d); line(c, x, box[1], x, box[1] + box[3], C.line, 0.6, [2, 3]); disc(c, x, Y(t), 4, C.warn); const rt = x > box[0] + box[2] - 70; text(c, n, x + (rt ? -4 : 4), Y(t) - 9, C.muted, rt ? 'right' : 'left'); });
    const k = 278.6 * Math.pow(1 - v.A, 0.25) * Math.pow(v.L, 0.25), din = 373 - v.g > 0 ? (k / (373 - v.g)) ** 2 : Infinity, dout = 273 - v.g > 0 ? (k / (273 - v.g)) ** 2 : Infinity;
    if (isFinite(din) && isFinite(dout)) { c.fillStyle = C.acc; c.globalAlpha = 0.18; c.fillRect(X(Math.max(0.2, din)), box[1], X(Math.min(40, dout)) - X(Math.max(0.2, din)), box[3]); c.globalAlpha = 1; }
    return { zone: isFinite(dout) ? fmt(din, 2) + ' – ' + fmt(dout, 2) + ' SA' : 'dengan ΔT sebesar ini air cair hanya di luar ' + fmt(din, 1) + ' SA', TE: fmt(T(1), 0) + ' K (Bumi nyata ±288 K)', note: 'titik oranye = suhu permukaan/awan sebenarnya' };
  },
  outputs: [['zone', 'Zona air cair'], ['TE', 'Suhu di 1 SA'], ['note', 'Keterangan']]
});

/* ---------- Comet orbit and its two tails ---------- */
LAB.komet = el => mkLab(el, {
  title: 'Komet: orbit lonjong dan dua ekor', hint: 'Geser posisi komet di orbitnya. Komet menghabiskan hampir seluruh waktunya jauh dan beku (lihat "waktu dari perihelion"). Di dalam ~3 SA es menyublim: muncul koma dan ekor. Ekor ion (biru, lurus) didorong angin surya tepat menjauhi Matahari; ekor debu (kuning, melengkung) didorong tekanan radiasi tetapi tertinggal di orbit. Saat menjauhi Matahari, ekor justru berada di DEPAN komet.', aspect: 0.62,
  controls: [{ k: 'q', label: 'Jarak perihelion q', min: 0.1, max: 2, step: 0.01, val: 0.59, unit: 'SA', fmt: x => fmt(x, 2) }, { k: 'e', label: 'Eksentrisitas e', min: 0.3, max: 0.985, step: 0.001, val: 0.967, fmt: x => fmt(x, 3) }, { k: 'nu', label: 'Posisi (anomali benar)', min: -179, max: 179, step: 0.5, val: -60, unit: '°', fmt: x => fmt(x, 1) }],
  presets: [{ label: 'Halley', set: { q: 0.586, e: 0.967 } }, { label: 'Keluarga Jupiter', set: { q: 1.3, e: 0.6 } }, { label: 'Encke', set: { q: 0.34, e: 0.848 } }, { label: 'Mendekat', set: { nu: -70 } }, { label: 'Perihelion', set: { nu: 0 } }, { label: 'Menjauh', set: { nu: 70 } }],
  draw(c, W, H, v, C) {
    const a = v.q / (1 - v.e), P = Math.pow(a, 1.5), nu = v.nu * D2R, r = a * (1 - v.e * v.e) / (1 + v.e * Math.cos(nu));
    const E = 2 * Math.atan2(Math.sqrt(1 - v.e) * Math.sin(nu / 2), Math.sqrt(1 + v.e) * Math.cos(nu / 2)), tp = (E - v.e * Math.sin(E)) / TAU * P;
    const view = Math.min(a * (1 + v.e), 6), bb = Math.max(1.1, Math.min(6, a * Math.sqrt(1 - v.e * v.e))), s = Math.min(W * 0.85 / (view + v.q + 0.3), H * 0.9 / (2 * bb)), sx = W * 0.92 - v.q * s, sy = H / 2;
    const Pt = (rr, f) => [sx + rr * Math.cos(f) * s, sy - rr * Math.sin(f) * s];
    [[1, C.blue, 'Bumi'], [5.2, C.warn, 'Jupiter']].forEach(([R, col, n]) => { ring(c, sx, sy, R * s, col, 1, [3, 4]); text(c, n, sx - R * s * 0.71, sy - R * s * 0.71 - 4, col); });
    c.strokeStyle = C.line; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i <= 400; i++) { const f = -Math.PI + TAU * i / 400, rr = a * (1 - v.e * v.e) / (1 + v.e * Math.cos(f)); const [X, Y] = Pt(rr, f); i ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke();
    arrow(c, ...Pt(a * (1 - v.e * v.e) / (1 + v.e * Math.cos(-0.5)), -0.5), ...Pt(a * (1 - v.e * v.e) / (1 + v.e * Math.cos(-0.3)), -0.3), C.muted, 1.2);
    disc(c, sx, sy, 7, C.sun);
    const [X, Y] = Pt(r, nu), L = r < 3 ? Math.min(2.2, 0.6 / (r * r)) : 0, ux = Math.cos(nu), uy = -Math.sin(nu);
    if (L > 0.01) {
      const vn = Math.hypot(Math.sin(nu), v.e + Math.cos(nu)), tx = -Math.sin(nu) / vn, ty = -(v.e + Math.cos(nu)) / vn;
      c.strokeStyle = '#e8c35a'; c.lineCap = 'round';
      for (let w = 0; w < 3; w++) { c.lineWidth = 7 - 2 * w; c.globalAlpha = 0.25 + 0.2 * w; c.beginPath(); c.moveTo(X, Y); for (let i = 1; i <= 20; i++) { const u = i / 20, d = L * 0.75 * u * s; c.lineTo(X + d * ux - tx * d * 0.45 * u, Y + d * uy - ty * d * 0.45 * u); } c.stroke(); }
      c.globalAlpha = 1; c.lineCap = 'butt'; line(c, X, Y, X + ux * L * s, Y + uy * L * s, '#5b9bff', 2);
    }
    if (X > W - 4 || X < 4 || Y < 4 || Y > H - 4) { const cx2 = Math.max(10, Math.min(W - 10, X)), cy2 = Math.max(10, Math.min(H - 10, Y)); disc(c, cx2, cy2, 3, C.muted); text(c, 'komet di luar bingkai', cx2 + (cx2 < W / 2 ? 8 : -8), cy2 + 14, C.muted, cx2 < W / 2 ? 'left' : 'right'); }
    else disc(c, X, Y, L > 0.01 ? 4.5 : 2.5, L > 0.01 ? '#d8ecff' : C.muted);
    const vel = 29.78 * Math.sqrt(2 / r - 1 / a), tq = Math.abs(tp);
    return { P: fmt(a, 2) + ' SA; P = ' + fmt(P, 1) + ' tahun (' + (P < 200 ? 'periode pendek' : 'periode panjang') + ')', Q: fmt(a * (1 + v.e), 1) + ' SA', r: fmt(r, 2) + ' SA, v = ' + fmt(vel, 1) + ' km/s', t: (tq < 1 ? fmt(tq * 365.25, 0) + ' hari ' : fmt(tq, 1) + ' tahun ') + (tp < 0 ? 'sebelum' : 'sesudah') + ' perihelion', tail: L > 0.01 ? 'aktif, ekor menjauhi Matahari' : 'beku, tanpa ekor (r > 3 SA)' };
  },
  outputs: [['P', 'Setengah sumbu panjang a'], ['Q', 'Aphelion'], ['r', 'Posisi sekarang'], ['t', 'Waktu dari perihelion'], ['tail', 'Ekor']]
});

/* ---------- Sidereal vs solar day ---------- */
LAB.harisurya = el => mkLab(el, {
  title: 'Hari sideris vs hari matahari', hint: 'Panah hitam = satu titik di permukaan planet. Satu hari sideris: panah kembali menunjuk arah bintang yang sama (sejajar arah awal). Satu hari matahari: panah kembali menunjuk Matahari. Karena planet juga berjalan di orbitnya, untuk rotasi searah revolusi planet harus berputar sedikit lebih jauh: 1/S = 1/P_rot − 1/P_orb. Untuk rotasi retrograd (Venus) tandanya plus.', aspect: 0.6,
  controls: [{ k: 'pr', label: 'Periode rotasi (sideris)', min: 0.5, max: 6000, log: true, val: 2000, unit: 'jam', fmt: x => fmt(x, x < 10 ? 2 : 0) }, { k: 'po', label: 'Periode revolusi', min: 100, max: 20000, log: true, val: 6000, unit: 'jam', fmt: x => fmt(x, 0) }, { k: 'ret', label: 'Rotasi retrograd', type: 'toggle', val: false }, { k: 'f', label: 'Waktu (dalam satuan hari matahari)', min: 0, max: 2, step: 0.005, val: 1, fmt: x => fmt(x, 3) }],
  presets: [{ label: 'Soal 27 (2000/6000 jam)', set: { pr: 2000, po: 6000, ret: false } }, { label: 'Bumi', set: { pr: 23.934, po: 8766, ret: false } }, { label: 'Merkurius', set: { pr: 1407.5, po: 2111.3, ret: false } }, { label: 'Venus', set: { pr: 5832.5, po: 5392.7, ret: true } }, { label: 'Mars', set: { pr: 24.623, po: 16488, ret: false } }],
  draw(c, W, H, v, C) {
    const sg = v.ret ? -1 : 1, inv = sg / v.pr - 1 / v.po, S = Math.abs(1 / inv), tt = v.f * (isFinite(S) ? S : v.po);
    const cx = W * 0.4, cy = H * 0.52, R = Math.min(W * 0.3, H * 0.4), orb = TAU * tt / v.po, spin = sg * TAU * tt / v.pr;
    ring(c, cx, cy, R, C.line, 1, [3, 4]); disc(c, cx, cy, 13, C.sun);
    // trail of planet positions at each full solar day
    const n = Math.min(12, Math.floor(v.f));
    const draw1 = (o, sp, col, alpha) => { const px = cx + R * Math.cos(o), py = cy - R * Math.sin(o); c.globalAlpha = alpha; disc(c, px, py, 9, C.blue); const ax = Math.cos(sp), ay = -Math.sin(sp); arrow(c, px, py, px + ax * 30, py + ay * 30, col, 2); c.globalAlpha = 1; return [px, py]; };
    draw1(0, Math.PI, C.fg, 0.35); text(c, 'awal (tengah hari)', cx + R, cy + 26, C.muted, 'center');
    // at t=0 marker points to Sun: start angle = π (pointing from planet at angle 0 toward centre)
    const [px, py] = draw1(orb, Math.PI + spin, C.fg, 1);
    line(c, px, py, cx, cy, C.sun, 1, [2, 3]);
    const ang = ((Math.PI + spin) - (orb + Math.PI)) / TAU, sidN = Math.abs(spin) / TAU, solN = Math.abs(ang);
    line(c, px, py, px - 30, py, C.muted, 1, [2, 3]); text(c, 'arah awal', px - 6, py - 16, C.muted, 'right');
    return { S: isFinite(S) ? fmt(S, 1) + ' jam = ' + fmt(S / 24, 2) + ' hari Bumi' : 'tak hingga (rotasi sinkron)', sid: fmt(sidN, 2) + ' kali (hari sideris)', sol: fmt(solN, 2) + ' kali (hari matahari)', diff: isFinite(S) ? fmt((S - v.pr) * (Math.abs(S - v.pr) < 1 ? 3600 : 1), 2) + (Math.abs(S - v.pr) < 1 ? ' detik' : ' jam') : '—' };
  },
  outputs: [['S', 'Hari matahari S'], ['sid', 'Sudah berotasi'], ['sol', 'Matahari sudah lewat meridian'], ['diff', 'S − hari sideris']]
});

/* ================= Bab 13: Gerhana ================= */
/* ---------- Umbra, penumbra, antumbra (not to scale) ---------- */
F.bayangan = () => {
  const S = [70, 140], Rs = 52, M = [330, 140], Rm = 14;
  // external tangents → umbra apex; internal tangents → penumbra
  const d = M[0] - S[0], L = d * Rm / (Rs - Rm), apex = M[0] + L;
  let b = `<circle class="f-sun" cx="${S[0]}" cy="${S[1]}" r="${Rs}"/><circle class="f-moon" cx="${M[0]}" cy="${M[1]}" r="${Rm}"/>`;
  const aU = Math.asin((Rs - Rm) / d), aP = Math.asin((Rs + Rm) / d);
  const ext = up => { const y0 = S[1] + (up ? -1 : 1) * Rs * Math.cos(aU), x0 = S[0] + Rs * Math.sin(aU), y1 = M[1] + (up ? -1 : 1) * Rm * Math.cos(aU), x1 = M[0] + Rm * Math.sin(aU); return [x0, y0, x1, y1]; };
  const int = up => { const y0 = S[1] + (up ? -1 : 1) * Rs * Math.cos(aP), x0 = S[0] + Rs * Math.sin(aP), y1 = M[1] - (up ? -1 : 1) * Rm * Math.cos(aP), x1 = M[0] - Rm * Math.sin(aP); return [x0, y0, x1, y1]; };
  const ext2 = (p, X) => { const [x0, y0, x1, y1] = p, t = (X - x0) / (x1 - x0); return [X, y0 + t * (y1 - y0)]; };
  const Xe = 620; const eu = ext(true), ed = ext(false), iu = int(true), id = int(false);
  const [, uyA] = ext2(eu, apex), pu = ext2(iu, Xe), pd = ext2(id, Xe), au = ext2(eu, Xe), ad = ext2(ed, Xe);
  b += `<polygon class="f-penumbra" points="${eu[2].toFixed(1)},${eu[3].toFixed(1)} ${Xe},${Math.min(pu[1], pd[1]).toFixed(1)} ${Xe},${Math.max(pu[1], pd[1]).toFixed(1)} ${ed[2].toFixed(1)},${ed[3].toFixed(1)}"/>`;
  b += `<polygon class="f-umbra" points="${eu[2].toFixed(1)},${eu[3].toFixed(1)} ${apex.toFixed(1)},${M[1]} ${ed[2].toFixed(1)},${ed[3].toFixed(1)}"/>`;
  b += `<polygon class="f-penumbra" opacity="0.9" points="${apex.toFixed(1)},${M[1]} ${au[0]},${au[1].toFixed(1)} ${ad[0]},${ad[1].toFixed(1)}"/>`;
  [eu, ed].forEach(p => { const q = ext2(p, Xe); b += `<line class="f-line f-thin" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0]}" y2="${q[1].toFixed(1)}"/>`; });
  [iu, id].forEach(p => { const q = ext2(p, Xe); b += `<line class="f-line f-thin f-dash" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0]}" y2="${q[1].toFixed(1)}"/>`; });
  // Earth surfaces at three distances
  [[apex - 40, 'GMT'], [apex + 55, 'GMC']].forEach(([x, l]) => { b += `<path class="f-earth" d="M ${x} ${M[1] - 46} A 70 70 0 0 0 ${x} ${M[1] + 46}" fill="none" stroke-width="3"/>` + txt(x + 6, M[1] + 64, l, 'f-txt f-b'); });
  b += txt(S[0], S[1] + Rs + 22, 'Matahari') + txt(M[0], M[1] + 32, 'Bulan');
  b += txt((M[0] + apex) / 2 + 4, M[1] - 30, 'umbra', 'f-txt f-b') + txt(apex + 78, M[1] + 4, 'antumbra', 'f-txt f-b', 'start') + txt(565, 94, 'penumbra (GMS)', 'f-txt f-b') + txt(565, 196, 'penumbra (GMS)', 'f-txt f-b');
  return svg(640, 280, b, 'Umbra, penumbra, antumbra', 'Garis singgung luar (tegas) membatasi umbra yang meruncing ke satu titik; di baliknya antumbra. Garis singgung dalam (putus-putus) membatasi penumbra. Bumi di dalam umbra → gerhana total; di antumbra (umbra tak sampai karena Bulan jauh) → cincin; di penumbra → sebagian. Panjang umbra Bulan ≈ 374 000 km, hampir sama dengan jarak Bumi–Bulan; itulah sebabnya kedua jenis bisa terjadi. Tidak berskala.');
};

/* ---------- Eclipse as seen: solar (Sun & Moon discs) or lunar (Moon in Earth's shadow) ---------- */
LAB.gerhana = el => mkLab(el, {
  title: 'Gerhana dilihat dari Bumi', hint: 'Mode Matahari: piringan Bulan (gelap) melintas di depan Matahari. Total bila diameter sudut Bulan ≥ Matahari (Bulan dekat/perige), cincin bila lebih kecil (Bulan di apoge). Mode Bulan: Bulan melintasi penumbra (abu muda) dan umbra Bumi (merah gelap). β = jarak pusat Bulan dari garis pusat (lintang ekliptika saat konjungsi/oposisi); waktu digeser untuk melihat kontak I–IV.', aspect: 0.56,
  controls: [{ k: 'lun', label: 'Mode gerhana Bulan', type: 'toggle', val: false }, { k: 'dm', label: 'Jarak Bumi–Bulan', min: 356400, max: 406700, step: 100, val: 384400, unit: 'km', fmt: x => Math.round(x).toLocaleString('id-ID') }, { k: 'ds', label: 'Jarak Bumi–Matahari', min: 147.1, max: 152.1, step: 0.05, val: 149.6, unit: 'juta km', fmt: x => fmt(x, 2) }, { k: 'beta', label: 'β (jarak pusat dari garis sentral)', min: 0, max: 100, step: 0.5, val: 10, unit: '′', fmt: x => fmt(x, 1) }, { k: 't', label: 'Waktu dari puncak', min: -200, max: 200, step: 1, val: 0, unit: 'menit', fmt: x => fmt(x, 0) }],
  presets: [{ label: 'GMT (perige)', set: { lun: false, dm: 357000, beta: 3 } }, { label: 'GMC (apoge)', set: { lun: false, dm: 406000, beta: 3 } }, { label: 'GMS', set: { lun: false, beta: 26 } }, { label: 'GB total', set: { lun: true, beta: 5 } }, { label: 'GB sebagian', set: { lun: true, beta: 50 } }, { label: 'GB penumbra', set: { lun: true, beta: 75 } }],
  onPreset: v => { v.t = 0; },
  draw(c, W, H, v, C) {
    const as = x => Math.atan(x) * 206265 / 60; // arcmin
    const sS = as(696000 / (v.ds * 1e6)), sM = as(1737.4 / v.dm), pM = Math.asin(6378 / v.dm) * 206265 / 60, pS = 8.794 / 60;
    const x = v.t * (v.lun ? 0.55 : 0.51), y = v.beta;
    const cx = W / 2, cy = H / 2, scale = Math.min(W, H) / (v.lun ? 190 : 80);
    c.fillStyle = '#05070d'; c.fillRect(0, 0, W, H);
    let out;
    if (!v.lun) {
      disc(c, cx, cy, sS * scale, '#ffd86b');
      const d = Math.hypot(x, y); disc(c, cx + x * scale, cy - y * scale, sM * scale, '#141821');
      if (d + sS <= sM && sM >= sS) { for (let i = 0; i < 20; i++) ring(c, cx, cy, sS * scale * (1.02 + i * 0.05), `rgba(220,230,255,${0.12 - i * 0.005})`, 3); }
      const mag = Math.max(0, (sS + sM - d) / (2 * sS));
      const type = d >= sS + sM ? 'tidak ada (Bulan tak menyentuh Matahari)' : d <= sM - sS ? 'TOTAL' : d <= sS - sM ? 'CINCIN' : 'sebagian';
      const ov = (() => { const r1 = sS, r2 = sM; if (d >= r1 + r2) return 0; if (d <= Math.abs(r1 - r2)) return Math.min(1, (Math.min(r1, r2) / r1) ** 2); const a1 = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), a2 = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2)), k = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)); return (a1 + a2 - k) / (Math.PI * r1 * r1); })();
      text(c, 'Barat', 10, cy, '#8a93a6'); text(c, 'Timur', W - 10, cy, '#8a93a6', 'right'); arrow(c, cx - 40, H - 16, cx + 40, H - 16, '#8a93a6', 1.2); text(c, 'Bulan bergerak ke timur', cx, H - 26, '#8a93a6', 'center');
      out = { size: 'Matahari ' + fmt(2 * sS, 2) + '′, Bulan ' + fmt(2 * sM, 2) + '′ (rasio ' + fmt(sM / sS, 3) + ')', type, mag: fmt(mag, 3) + ' (bagian diameter tertutup)', obs: fmt(ov * 100, 1) + '% luas piringan' };
    } else {
      const rU = 1.02 * pM + pS - sS, rP = 1.02 * pM + pS + sS;
      disc(c, cx, cy, rP * scale, 'rgba(120,130,150,0.35)'); disc(c, cx, cy, rU * scale, 'rgba(120,30,20,0.55)'); ring(c, cx, cy, rU * scale, '#a44', 1);
      const mx = cx + x * scale, my = cy - y * scale, d = Math.hypot(x, y);
      // Moon brightness depends on where it is
      const inU = d < rU - sM, inPartU = d < rU + sM, inP = d < rP + sM;
      disc(c, mx, my, sM * scale, inU ? '#7a2a1c' : '#e9e4d6');
      if (!inU && inPartU) { c.save(); c.beginPath(); c.arc(mx, my, sM * scale, 0, TAU); c.clip(); disc(c, cx, cy, rU * scale, '#7a2a1c'); c.restore(); }
      if (!inU && inP) { c.save(); c.beginPath(); c.arc(mx, my, sM * scale, 0, TAU); c.clip(); c.globalAlpha = 0.35; disc(c, cx, cy, rP * scale, '#333'); c.restore(); c.globalAlpha = 1; }
      text(c, 'Barat', 10, cy, '#8a93a6'); text(c, 'Timur', W - 10, cy, '#8a93a6', 'right'); text(c, 'umbra', cx, cy + rU * scale - 12, '#e7a59a', 'center'); text(c, 'penumbra', cx, cy + rP * scale - 12, '#c8cedb', 'center');
      const type = d >= rP + sM ? 'tidak ada' : d <= rU - sM ? 'TOTAL (seluruh Bulan di umbra)' : d < rU + sM ? 'sebagian (umbral)' : d <= rP - sM ? 'penumbra total' : 'penumbra';
      out = { size: 'umbra ' + fmt(rU, 1) + '′ (' + fmt(rU * 60, 0) + '″), penumbra ' + fmt(rP, 1) + '′; Bulan ' + fmt(sM, 1) + '′', type, mag: fmt(Math.max(0, (rU + sM - d) / (2 * sM)), 3) + ' (magnitudo umbral)', obs: 'Bulan merah karena cahaya Matahari dibiaskan dan disaring atmosfer Bumi' };
    }
    return out;
  },
  outputs: [['size', 'Ukuran sudut (jari-jari/diameter)'], ['type', 'Jenis saat ini'], ['mag', 'Magnitudo'], ['obs', 'Keterangan']]
});

/* ---------- Eclipse seasons: Sun's distance from the node at each new/full moon ---------- */
LAB.musimgerhana = el => mkLab(el, {
  title: 'Musim gerhana: mengapa tidak tiap bulan?', hint: 'Lingkaran = sudut Matahari dari titik simpul (node) orbit Bulan. Gerhana Matahari hanya mungkin bila saat bulan baru Matahari berada dalam ±18,5° dari salah satu node (jingga); gerhana Bulan bila saat purnama dalam ±12,2° (biru). Tiap lunasi Matahari maju 30,67° relatif node (node mundur 19,3°/tahun), jadi dalam satu musim selalu ada minimal satu gerhana Matahari, dan musim datang tiap 173,3 hari. Geser "awal" untuk mencoba tahun lain.', aspect: 0.62,
  controls: [{ k: 'p0', label: 'Sudut Matahari–node di bulan baru pertama', min: 0, max: 360, step: 0.5, val: 340, unit: '°', fmt: x => fmt(x, 1) }, { k: 'n', label: 'Jumlah lunasi ditampilkan', min: 6, max: 26, step: 1, val: 13, fmt: x => fmt(x, 0) }],
  presets: [{ label: '5 GM dalam 13 lunasi', set: { p0: 343.5, n: 13 } }, { label: 'Tahun biasa', set: { p0: 300, n: 12 } }, { label: '1 Saros = 223 lunasi', set: { n: 26 } }],
  draw(c, W, H, v, C) {
    const cx = W * 0.32, cy = H * 0.5, R = Math.min(W * 0.27, H * 0.38), step = 360 * 29.530589 / 346.620;
    const pt = (deg, r) => [cx + r * Math.sin(deg * D2R), cy - r * Math.cos(deg * D2R)];
    const wedge = (c0, half, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); for (let a = c0 - half; a <= c0 + half; a += 1) c.lineTo(...pt(a, R)); c.closePath(); c.fill(); };
    [0, 180].forEach(n => { wedge(n, 18.5, 'rgba(232,140,40,0.28)'); wedge(n, 12.2, 'rgba(80,140,255,0.3)'); });
    ring(c, cx, cy, R, C.line); text(c, 'node naik', ...pt(0, R + 12), C.muted, 'center'); const [qx, qy] = pt(180, R + 14); text(c, 'node turun', qx, qy + 4, C.muted, 'center');
    const ev = []; const sol = [], lun = [];
    for (let k = 0; k < v.n; k++) {
      const a = (v.p0 + k * step) % 360, b = (a + step / 2) % 360;
      const dn = Math.min(a % 180, 180 - a % 180), df = Math.min(b % 180, 180 - b % 180);
      const [x1, y1] = pt(a, R * (0.55 + 0.4 * k / Math.max(1, v.n))); disc(c, x1, y1, 4, dn < 18.5 ? C.warn : C.muted);  text(c, String(k + 1), x1 + 6, y1 - 6, C.muted);
      const [x2, y2] = pt(b, R * (0.5 + 0.4 * k / Math.max(1, v.n))); ring(c, x2, y2, 3.5, df < 12.2 ? C.blue : C.line, 1.5);
      if (dn < 18.5) sol.push(k + 1); if (df < 12.2) lun.push(k + 1);
    }
    // timeline
    const bx = W * 0.64, bw = W * 0.33, by = 20, bh = H - 50; c.font = `11px ${C.ui}`;
    text(c, 'lunasi ke-, hari ke-', bx, by - 6, C.muted); text(c, '● baru  ○ purnama', bx, H - 8, C.muted);
    for (let k = 0; k < v.n; k++) { const y = by + 10 + k * (bh - 10) / v.n, isS = sol.includes(k + 1), isL = lun.includes(k + 1); text(c, (k + 1) + '. hari ' + fmt(k * 29.53, 0), bx, y, C.muted); if (isS) text(c, 'GM', bx + bw * 0.62, y, C.warn); if (isL) text(c, 'GB', bx + bw * 0.82, y, C.blue); }
    const yrs = v.n * 29.53 / 365.25;
    return { sol: sol.length + ' kali (lunasi ' + (sol.join(', ') || '—') + ')', lun: lun.length + ' kali (lunasi ' + (lun.join(', ') || '—') + ')', span: fmt(v.n * 29.53, 0) + ' hari ≈ ' + fmt(yrs, 2) + ' tahun', saros: '223 lunasi × 30,67° = ' + fmt((223 * step) % 360, 2) + '° lewat 18 putaran → hampir kembali ke posisi sama' };
  },
  outputs: [['sol', 'Gerhana Matahari'], ['lun', 'Gerhana Bulan (umbral)'], ['span', 'Rentang waktu'], ['saros', 'Mengapa Saros berulang']]
});
})();
