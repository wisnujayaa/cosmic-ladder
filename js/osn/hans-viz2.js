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
    const px = W * 0.86, py = H * 0.78, pr = Math.min(W, H) * 0.08, k = (1 - Math.cos(el)) / 2;
    moonPhase(c, px, py, pr, el, C);
    text(c, 'tampak dari Bumi (BBU)', px, py + pr + 14, C.muted, 'center');
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
})();
