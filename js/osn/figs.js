/* Concept figures, generated as inline SVG so geometry is computed, not hand-traced.
   Colours come from CSS classes (.f-*) so both themes work. */
(function () {
const F = OSN.FIG, D2R = Math.PI / 180;

/* --- tiny sphere projector: x = east, y = north, z = up; view rotated by az, tilted by el --- */
function sphere(cx, cy, R, az, el) {
  const ca = Math.cos(az * D2R), sa = Math.sin(az * D2R), ce = Math.cos(el * D2R), se = Math.sin(el * D2R);
  const P = v => { const x1 = v[0] * ca - v[1] * sa, d = v[0] * sa + v[1] * ca; return { X: cx + R * x1, Y: cy - R * (v[2] * ce + d * se), d: d * ce - v[2] * se }; };
  /* polyline split into front (d<=0 is toward viewer) and back segments */
  function curve(fn, t0, t1, n) {
    let front = '', back = '', pf = false, pb = false;
    for (let i = 0; i <= n; i++) {
      const p = P(fn(t0 + (t1 - t0) * i / n)), isBack = p.d > 0.001, c = p.X.toFixed(1) + ' ' + p.Y.toFixed(1);
      if (isBack) { back += (pb ? ' L' : ' M') + c; pb = true; pf = false; } else { front += (pf ? ' L' : ' M') + c; pf = true; pb = false; }
    }
    return { front, back };
  }
  /* great/small circle around unit axis n at angular radius rho (deg) */
  function circ(n, rho) {
    const a = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    let u = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]]; const lu = Math.hypot(...u); u = u.map(q => q / lu);
    const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    const cr = Math.cos(rho * D2R), sr = Math.sin(rho * D2R);
    return t => [0, 1, 2].map(i => n[i] * cr + sr * (u[i] * Math.cos(t) + w[i] * Math.sin(t)));
  }
  /* arc between two unit vectors (great circle) */
  function arc(a, b) {
    const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(dot), so = Math.sin(om) || 1;
    return t => [0, 1, 2].map(i => (Math.sin((1 - t) * om) * a[i] + Math.sin(t * om) * b[i]) / so);
  }
  return { P, curve, circ, arc };
}
OSN.sphere = sphere;
const altaz = (h, A) => [Math.sin(A * D2R) * Math.cos(h * D2R), Math.cos(A * D2R) * Math.cos(h * D2R), Math.sin(h * D2R)];
const path = (c, cls) => (c.back ? `<path class="${cls} f-back" d="${c.back}"/>` : '') + (c.front ? `<path class="${cls}" d="${c.front}"/>` : '');
const dot = (p, r, cls) => `<circle class="${cls}" cx="${p.X.toFixed(1)}" cy="${p.Y.toFixed(1)}" r="${r}"/>`;
const txt = (x, y, s, cls = 'f-txt', anchor = 'middle') => `<text class="${cls}" x="${x.toFixed ? x.toFixed(1) : x}" y="${y.toFixed ? y.toFixed(1) : y}" text-anchor="${anchor}">${s}</text>`;
const svg = (w, h, body, label, cap) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" class="osn-fig">${body}</svg>` + (cap ? `<figcaption>${cap}</figcaption>` : '');
const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f-acc-fill"/></marker><marker id="ahm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f-mut-fill"/></marker></defs>`;

/* ---------- horizon system ---------- */
F.horizon = () => {
  const S = sphere(250, 165, 120, 28, 18), phi = 40, X = altaz(38, 125);
  let b = '<circle class="f-line" cx="250" cy="165" r="120"/>';
  b += path(S.curve(S.circ([0, 0, 1], 90), 0, 2 * Math.PI, 160), 'f-line f-strong');           // horizon
  b += path(S.curve(S.circ([1, 0, 0], 90), 0, 2 * Math.PI, 160), 'f-line f-dash');             // meridian
  const pole = altaz(phi, 0);
  b += path(S.curve(S.circ(pole, 90), 0, 2 * Math.PI, 160), 'f-line f-blue');                   // celestial equator
  b += path(S.curve(S.arc(altaz(0, 125), X), 0, 1, 40), 'f-acc f-strong');                      // altitude arc
  b += path(S.curve(S.arc(altaz(0, 0), altaz(0, 62)), 0, 1, 30), 'f-acc');                      // azimuth arc (two halves)
  b += path(S.curve(S.arc(altaz(0, 62), altaz(0, 125)), 0, 1, 30), 'f-acc');
  const Z = S.P([0, 0, 1]), N = S.P([0, 0, -1]), O = S.P([0, 0, 0]);
  b += `<line class="f-line f-dash" x1="${Z.X}" y1="${Z.Y}" x2="${N.X}" y2="${N.Y}"/>`;
  const Pp = S.P(pole); b += `<line class="f-line" x1="${O.X}" y1="${O.Y}" x2="${Pp.X}" y2="${Pp.Y}"/>`;
  const Xp = S.P(X); b += `<line class="f-line f-thin" x1="${O.X}" y1="${O.Y}" x2="${Xp.X}" y2="${Xp.Y}"/>`;
  b += dot(Z, 3.5, 'f-ink-fill') + dot(N, 3.5, 'f-ink-fill') + dot(Pp, 4, 'f-blue-fill') + dot(Xp, 5, 'f-acc-fill') + dot(O, 3, 'f-ink-fill');
  b += txt(Z.X, Z.Y - 9, 'Zenit') + txt(N.X, N.Y + 18, 'Nadir') + txt(Pp.X - 8, Pp.Y - 8, 'KLU', 'f-txt f-blue-t', 'end') + txt(Xp.X + 10, Xp.Y - 6, 'bintang X', 'f-txt f-acc-t', 'start');
  [[0, 'U'], [90, 'T'], [180, 'S'], [270, 'B']].forEach(([A, s]) => { const p = S.P(altaz(0, A)); b += txt(p.X + (A === 90 ? 12 : A === 270 ? -12 : 0), p.Y + (A === 0 ? -6 : 16), s, 'f-txt f-b'); });
  const hm = S.P(altaz(19, 125)); b += txt(hm.X + 12, hm.Y, 'h', 'f-txt f-acc-t f-i', 'start');
  const am = S.P(altaz(0, 70)); b += txt(am.X + 6, am.Y + 18, 'A', 'f-txt f-acc-t f-i', 'start');
  return svg(500, 304, b, 'Sistem koordinat horizon pada bola langit', 'Tinggi h diukur dari horizon; azimut A dari utara ke timur. Kutub langit setinggi lintang φ.');
};

/* ---------- equatorial system with ecliptic ---------- */
F.ekuator = () => {
  const S = sphere(250, 160, 120, 35, 20), eps = 23.44;
  const eq = [0, 0, 1], ecl = [0, -Math.sin(eps * D2R), Math.cos(eps * D2R)];
  let b = '<circle class="f-line" cx="250" cy="160" r="120"/>';
  b += path(S.curve(S.circ(eq, 90), 0, 2 * Math.PI, 160), 'f-line f-strong');
  b += path(S.curve(S.circ(ecl, 90), 0, 2 * Math.PI, 160), 'f-line f-warn');
  const ra = 55, de = 35, X = [Math.cos(de * D2R) * Math.cos(ra * D2R), Math.cos(de * D2R) * Math.sin(ra * D2R), Math.sin(de * D2R)];
  const foot = [Math.cos(ra * D2R), Math.sin(ra * D2R), 0];
  b += path(S.curve(t => [Math.cos(t * ra * D2R), Math.sin(t * ra * D2R), 0], 0, 1, 40), 'f-acc f-strong');
  b += path(S.curve(S.arc(foot, X), 0, 1, 30), 'f-acc f-strong');
  const NP = S.P([0, 0, 1]), SP = S.P([0, 0, -1]), V = S.P([1, 0, 0]), Xp = S.P(X), O = S.P([0, 0, 0]), A = S.P([-1, 0, 0]);
  b += `<line class="f-line f-dash" x1="${NP.X}" y1="${NP.Y}" x2="${SP.X}" y2="${SP.Y}"/><line class="f-line f-thin" x1="${O.X}" y1="${O.Y}" x2="${Xp.X}" y2="${Xp.Y}"/>`;
  b += dot(NP, 4, 'f-ink-fill') + dot(SP, 4, 'f-ink-fill') + dot(V, 5, 'f-warn-fill') + dot(A, 4, 'f-warn-fill') + dot(Xp, 5, 'f-acc-fill');
  b += txt(NP.X, NP.Y - 9, 'KLU') + txt(SP.X, SP.Y + 18, 'KLS') + txt(V.X - 6, V.Y + 18, '♈ titik Aries (α = 0ʰ)', 'f-txt f-warn-t', 'end') + txt(Xp.X + 10, Xp.Y - 4, 'bintang', 'f-txt f-acc-t', 'start');
  const am = S.P([Math.cos(28 * D2R), Math.sin(28 * D2R), 0]); b += txt(am.X + 4, am.Y + 18, 'α', 'f-txt f-acc-t f-i', 'start');
  const dm = S.P(S.arc(foot, X)(0.5)); b += txt(dm.X + 9, dm.Y, 'δ', 'f-txt f-acc-t f-i', 'start');
  const el = S.P(S.circ(ecl, 90)(2.2)); b += txt(el.X + 6, el.Y - 6, 'ekliptika (miring 23,44°)', 'f-txt f-warn-t', 'start');
  const eqL = S.P(S.circ(eq, 90)(3.9)); b += txt(eqL.X - 4, eqL.Y + 16, 'ekuator langit', 'f-txt', 'end');
  return svg(500, 304, b, 'Sistem koordinat ekuator dan ekliptika', 'α diukur ke timur dari titik Aries sepanjang ekuator langit (jam); δ diukur dari ekuator ke arah kutub.');
};

/* ---------- astronomical triangle ---------- */
F.segitiga = () => {
  const S = sphere(250, 165, 125, 90, 14), phi = 40, Pv = altaz(phi, 0), Zv = [0, 0, 1], Xv = altaz(32, 200);
  let b = '<circle class="f-line" cx="250" cy="165" r="125"/>';
  b += path(S.curve(S.circ([0, 0, 1], 90), 0, 2 * Math.PI, 160), 'f-line');
  b += path(S.curve(S.arc(Pv, Zv), 0, 1, 40), 'f-blue f-strong') + path(S.curve(S.arc(Pv, Xv), 0, 1, 40), 'f-acc f-strong') + path(S.curve(S.arc(Zv, Xv), 0, 1, 40), 'f-warn f-strong');
  const P = S.P(Pv), Z = S.P(Zv), X = S.P(Xv);
  b += dot(P, 5, 'f-blue-fill') + dot(Z, 5, 'f-ink-fill') + dot(X, 5, 'f-acc-fill');
  b += txt(P.X - 10, P.Y - 6, 'P (kutub)', 'f-txt f-blue-t', 'end') + txt(Z.X, Z.Y - 10, 'Z (zenit)') + txt(X.X + 10, X.Y + 4, 'X (bintang)', 'f-txt f-acc-t', 'start');
  const m1 = S.P(S.arc(Pv, Zv)(0.5)), m2 = S.P(S.arc(Pv, Xv)(0.5)), m3 = S.P(S.arc(Zv, Xv)(0.5));
  b += txt(m1.X - 8, m1.Y, '90° − φ', 'f-txt f-blue-t', 'end') + txt(m2.X + 2, m2.Y + 18, '90° − δ', 'f-txt f-acc-t') + txt(m3.X + 8, m3.Y - 4, '90° − h', 'f-txt f-warn-t', 'start');
  b += txt(P.X + 14, P.Y + 16, 'H', 'f-txt f-i f-b', 'start') + txt(Z.X + 14, Z.Y + 14, 'A', 'f-txt f-i f-b', 'start');
  const U = S.P(altaz(0, 0)); b += txt(U.X, U.Y - 6, 'U', 'f-txt f-b');
  return svg(500, 306, b, 'Segitiga astronomis kutub, zenit, bintang', 'Sudut di P adalah sudut jam H; sudut di Z adalah azimut A. Terapkan rumus cosinus bola.');
};

/* ---------- sidereal vs solar day ---------- */
F.sidday = () => {
  const cx = 150, cy = 170, Ro = 120, a1 = -60, a2 = -30;
  const E = a => [cx + Ro * Math.cos(a * D2R), cy + Ro * Math.sin(a * D2R)];
  let b = arrowDefs + `<path class="f-line f-dash" d="M ${E(-100)[0]} ${E(-100)[1]} A ${Ro} ${Ro} 0 0 1 ${E(10)[0]} ${E(10)[1]}"/>`;
  b += `<circle class="f-sun" cx="${cx}" cy="${cy}" r="16"/>` + txt(cx, cy + 34, 'Matahari');
  [a1, a2].forEach((a, i) => {
    const [x, y] = E(a); b += `<circle class="f-earth" cx="${x}" cy="${y}" r="11"/>`;
    b += `<line class="f-acc f-strong" x1="${x}" y1="${y}" x2="${x + 70}" y2="${y - 70 * Math.tan(25 * D2R)}" marker-end="url(#ah)"/>`;
    const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy); b += `<line class="f-mut f-strong" x1="${x}" y1="${y}" x2="${x + dx / l * 42}" y2="${y + dy / l * 42}" marker-end="url(#ahm)"/>`;
    b += txt(x - 16, y + 18, i ? 'hari ke-2' : 'hari ke-1', 'f-txt', 'end');
  });
  b += txt(395, 70, 'ke bintang jauh', 'f-txt f-acc-t') + txt(395, 88, '(arah sama: 1 hari sideris)', 'f-cap');
  b += txt(395, 160, 'ke Matahari: butuh', 'f-txt f-mut-t') + txt(395, 178, 'putaran ekstra ~1°', 'f-txt f-mut-t') + txt(395, 196, '≈ 3 menit 56 detik', 'f-cap');
  return svg(500, 292, b, 'Perbedaan hari sideris dan hari Matahari', 'Sudut antara dua posisi Bumi dibesarkan agar terlihat; aslinya ~0,986° per hari.');
};

/* ---------- ellipse anatomy ---------- */
F.elips = () => {
  const cx = 250, cy = 150, a = 190, e = 0.6, bb = a * Math.sqrt(1 - e * e), c = a * e;
  let b = arrowDefs + `<ellipse class="f-line f-strong" cx="${cx}" cy="${cy}" rx="${a}" ry="${bb.toFixed(1)}"/>`;
  b += `<line class="f-line f-dash" x1="${cx - a}" y1="${cy}" x2="${cx + a}" y2="${cy}"/><line class="f-line f-dash" x1="${cx}" y1="${cy - bb}" x2="${cx}" y2="${cy + bb}"/>`;
  b += `<circle class="f-sun" cx="${cx + c}" cy="${cy}" r="10"/><circle class="f-mut-fill" cx="${cx - c}" cy="${cy}" r="3.5"/>`;
  b += `<circle class="f-acc-fill" cx="${cx + a}" cy="${cy}" r="5"/><circle class="f-acc-fill" cx="${cx - a}" cy="${cy}" r="5"/>`;
  b += txt(cx + c, cy - 16, 'Matahari (fokus F₁)') + txt(cx - c, cy - 10, 'F₂', 'f-txt f-mut-t');
  b += txt(cx + a - 4, cy + 22, 'perihelion', 'f-txt f-acc-t', 'end') + txt(cx - a + 4, cy + 22, 'aphelion', 'f-txt f-acc-t', 'start');
  const yb = cy + bb + 22; b += `<line class="f-acc" x1="${cx}" y1="${yb}" x2="${cx + a}" y2="${yb}" marker-start="url(#ah)" marker-end="url(#ah)"/>` + txt(cx + a / 2, yb + 16, 'a (setengah sumbu panjang)', 'f-txt f-acc-t');
  b += txt(cx + 8, cy - bb / 2, 'b', 'f-txt f-i f-b', 'start') + txt(cx + c / 2, cy + 16, 'c = ae', 'f-txt f-i');
  b += `<line class="f-blue f-strong" x1="${cx + c}" y1="${cy + 44}" x2="${cx + a}" y2="${cy + 44}" marker-start="url(#ahm)" marker-end="url(#ahm)"/>` + txt(cx + c + (a - c) / 2, cy + 62, 'r_p = a(1 − e)', 'f-txt f-blue-t');
  return svg(500, 350, b, 'Anatomi elips orbit', 'e = c/a. Lingkaran: e = 0. Orbit Bumi e = 0,017; komet Halley e = 0,967.');
};

/* ---------- Hohmann transfer ---------- */
F.hohmann = () => {
  const cx = 230, cy = 165, r1 = 70, r2 = 140, at = (r1 + r2) / 2, ct = at - r1, bt = Math.sqrt(r1 * r2);
  let b = arrowDefs + `<circle class="f-line" cx="${cx}" cy="${cy}" r="${r1}"/><circle class="f-line" cx="${cx}" cy="${cy}" r="${r2}"/>`;
  b += `<path class="f-acc f-strong" d="M ${cx + r1} ${cy} A ${at} ${bt.toFixed(1)} 0 0 0 ${cx - r2} ${cy}"/>`;
  b += `<path class="f-acc f-dash" d="M ${cx - r2} ${cy} A ${at} ${bt.toFixed(1)} 0 0 0 ${cx + r1} ${cy}"/>`;
  b += `<circle class="f-sun" cx="${cx}" cy="${cy}" r="12"/><circle class="f-earth" cx="${cx + r1}" cy="${cy}" r="8"/><circle class="f-mars" cx="${cx - r2}" cy="${cy}" r="7"/>`;
  b += `<line class="f-acc f-strong" x1="${cx + r1}" y1="${cy}" x2="${cx + r1}" y2="${cy - 44}" marker-end="url(#ah)"/>` + txt(cx + r1 + 8, cy - 30, 'Δv₁', 'f-txt f-acc-t f-b', 'start');
  b += `<line class="f-acc f-strong" x1="${cx - r2}" y1="${cy}" x2="${cx - r2}" y2="${cy + 40}" marker-end="url(#ah)"/>` + txt(cx - r2 - 8, cy + 34, 'Δv₂', 'f-txt f-acc-t f-b', 'end');
  b += txt(cx + r1 + 4, cy + 22, 'Bumi saat berangkat', 'f-txt', 'start') + txt(cx - r2 + 6, cy - 12, 'Mars saat tiba', 'f-txt', 'start');
  b += txt(cx, cy - r2 - 8, 'orbit Mars r₂', 'f-txt f-mut-t') + txt(cx + 10, cy + r1 - 8, 'orbit Bumi r₁', 'f-txt f-mut-t', 'start');
  b += txt(415, 120, 'a_t = (r₁ + r₂)/2', 'f-txt f-b') + txt(415, 142, 'waktu = ½ periode', 'f-txt') + txt(415, 160, 'elips transfer', 'f-txt');
  return svg(500, 318, b, 'Orbit transfer Hohmann Bumi ke Mars', 'Wahana menempuh setengah elips (garis tegas). Mars harus berada di titik aphelion saat wahana tiba.');
};

/* ---------- eclipse geometry ---------- */
F.gerhana = () => {
  const sx = 70, sy = 160, Rs = 60, mx = 300, Rm = 16, Ru = Rs, tipX = mx + (mx - sx) * Rm / (Rs - Rm);
  const t1 = [sx, sy - Rs], t2 = [sx, sy + Rs];
  let b = `<circle class="f-sun" cx="${sx}" cy="${sy}" r="${Rs}"/>` + txt(sx, sy + Rs + 20, 'Matahari');
  /* umbra: outer tangents converge to tip */
  b += `<path class="f-umbra" d="M ${mx} ${sy - Rm} L ${tipX.toFixed(1)} ${sy} L ${mx} ${sy + Rm} Z"/>`;
  const slopeP = (Rs + Rm) / (mx - sx), pend = 480, yU = sy - Rm - slopeP * (pend - mx), yD = sy + Rm + slopeP * (pend - mx);
  b += `<path class="f-penumbra" d="M ${mx} ${sy - Rm} L ${pend} ${yU.toFixed(1)} L ${pend} ${yD.toFixed(1)} L ${mx} ${sy + Rm} Z"/>`;
  b += `<line class="f-line f-thin" x1="${t1[0]}" y1="${t1[1]}" x2="${tipX}" y2="${sy}"/><line class="f-line f-thin" x1="${t2[0]}" y1="${t2[1]}" x2="${tipX}" y2="${sy}"/>`;
  b += `<line class="f-line f-thin f-dash" x1="${t1[0]}" y1="${t1[1]}" x2="${pend}" y2="${yD.toFixed(1)}"/><line class="f-line f-thin f-dash" x1="${t2[0]}" y1="${t2[1]}" x2="${pend}" y2="${yU.toFixed(1)}"/>`;
  b += `<circle class="f-moon" cx="${mx}" cy="${sy}" r="${Rm}"/>` + txt(mx, sy - Rm - 10, 'Bulan');
  b += `<path class="f-earthsurf" d="M ${tipX - 2} 40 Q ${tipX - 30} ${sy} ${tipX - 2} 280"/>`;
  b += txt(tipX + 14, 60, 'permukaan Bumi', 'f-txt', 'start');
  b += txt(mx + 40, sy + 4, 'umbra', 'f-txt f-b', 'start') + txt(440, sy - 70, 'penumbra', 'f-txt f-mut-t');
  return svg(500, 294, b, 'Geometri umbra dan penumbra gerhana Matahari', 'Di dalam umbra: gerhana total. Di penumbra: gerhana sebagian. Tidak sesuai skala.');
};

/* ---------- tides ---------- */
F.pasang = () => {
  let b = arrowDefs;
  b += `<ellipse class="f-water" cx="150" cy="140" rx="92" ry="68"/><circle class="f-earth" cx="150" cy="140" r="60"/>` + `<circle class="f-moon" cx="330" cy="140" r="16"/>` + txt(330, 172, 'Bulan');
  b += `<line class="f-acc f-strong" x1="215" y1="140" x2="250" y2="140" marker-end="url(#ah)"/><line class="f-acc f-strong" x1="85" y1="140" x2="50" y2="140" marker-end="url(#ah)"/>`;
  b += `<line class="f-acc" x1="150" y1="78" x2="150" y2="96" marker-end="url(#ah)"/><line class="f-acc" x1="150" y1="202" x2="150" y2="184" marker-end="url(#ah)"/>`;
  b += txt(150, 230, 'dua tonjolan pasang') + txt(150, 246, 'gaya pasang = selisih tarikan', 'f-cap');
  /* spring & neap mini */
  const mini = (x, y, neap, label) => {
    let s = `<circle class="f-sun" cx="${x - 40}" cy="${y}" r="9"/><ellipse class="f-water" cx="${x + 10}" cy="${y}" rx="${neap ? 14 : 20}" ry="${neap ? 17 : 12}"/><circle class="f-earth" cx="${x + 10}" cy="${y}" r="11"/>`;
    s += neap ? `<circle class="f-moon" cx="${x + 10}" cy="${y - 34}" r="5"/>` : `<circle class="f-moon" cx="${x + 46}" cy="${y}" r="5"/>`;
    return s + txt(x + 4, y + 34, label, 'f-txt');
  };
  b += mini(420, 70, false, 'pasang purnama') + mini(420, 190, true, 'pasang perbani');
  return svg(500, 274, b, 'Tonjolan pasang surut dan pasang purnama/perbani', 'Pasang purnama saat Matahari–Bumi–Bulan segaris; perbani saat tegak lurus.');
};

/* ---------- three kinds of spectra ---------- */
F.spektrum = () => {
  const x0 = 40, w = 420, l0 = 380, l1 = 700, X = l => x0 + (l - l0) / (l1 - l0) * w, H = [656.3, 486.1, 434.0, 410.2];
  let stops = ''; for (let i = 0; i <= 10; i++) { const l = l0 + (l1 - l0) * i / 10; stops += `<stop offset="${i * 10}%" stop-color="${wl2rgb(l)}"/>`; }
  let b = `<defs><linearGradient id="rb" x1="0" x2="1">${stops}</linearGradient></defs>`;
  const row = (y, label, kind) => {
    let s = txt(x0, y - 8, label, 'f-txt f-b', 'start');
    if (kind === 'em') { s += `<rect x="${x0}" y="${y}" width="${w}" height="34" class="f-black"/>`; H.forEach(l => s += `<rect x="${X(l) - 1.5}" y="${y}" width="3" height="34" fill="${wl2rgb(l)}"/>`); }
    else { s += `<rect x="${x0}" y="${y}" width="${w}" height="34" fill="url(#rb)"/>`; if (kind === 'ab') H.forEach(l => s += `<rect x="${X(l) - 1.5}" y="${y}" width="3" height="34" fill="#000"/>`); }
    return s;
  };
  b += row(30, 'Kontinu: benda padat/gas padat panas', 'ko') + row(100, 'Emisi: gas tipis panas', 'em') + row(170, 'Absorpsi: gas dingin di depan sumber kontinu', 'ab');
  H.forEach((l, i) => b += txt(X(l), 226, ['Hα', 'Hβ', 'Hγ', 'Hδ'][i], 'f-txt f-b') + txt(X(l), 242, l.toFixed(0), 'f-cap'));
  b += txt(x0, 266, '380 nm', 'f-cap', 'start') + txt(x0 + w, 266, '700 nm', 'f-cap', 'end');
  return svg(500, 278, b, 'Spektrum kontinu, emisi, dan absorpsi hidrogen', 'Garis emisi dan absorpsi hidrogen muncul di panjang gelombang yang sama (deret Balmer).');
};
function wl2rgb(l) {
  let r = 0, g = 0, b = 0;
  if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
  const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 680 ? 0.3 + 0.7 * (700 - l) / 20 : 1;
  const c = v => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
OSN.wl2rgb = wl2rgb;

/* ---------- radial velocity curves ---------- */
F.rv = () => {
  const x0 = 60, x1 = 460, y0 = 150, k = 1.1, K1 = 40, K2 = 80;
  let p1 = '', p2 = '';
  for (let i = 0; i <= 120; i++) { const ph = i / 60, x = x0 + (x1 - x0) * i / 120; p1 += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + (y0 - k * K1 * Math.sin(2 * Math.PI * ph)).toFixed(1); p2 += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + (y0 + k * K2 * Math.sin(2 * Math.PI * ph)).toFixed(1); }
  let b = arrowDefs + `<line class="f-line" x1="${x0}" y1="40" x2="${x0}" y2="260"/><line class="f-line f-dash" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}"/>`;
  b += `<path class="f-blue f-strong" d="${p1}"/><path class="f-acc f-strong" d="${p2}"/>`;
  b += `<line class="f-blue" x1="${x0 + 50}" y1="${y0}" x2="${x0 + 50}" y2="${y0 - k * K1}" marker-end="url(#ahm)"/>` + txt(x0 + 56, y0 - k * K1 / 2, 'K₁', 'f-txt f-blue-t f-b', 'start');
  b += `<line class="f-acc" x1="${x0 + 150}" y1="${y0}" x2="${x0 + 150}" y2="${y0 - k * K2}" marker-end="url(#ah)"/>` + txt(x0 + 156, y0 - k * K2 / 2, 'K₂', 'f-txt f-acc-t f-b', 'start');
  b += txt(x1, y0 - 6, 'γ (kecepatan pusat massa)', 'f-cap', 'end') + txt(x0 - 8, 48, 'v_r', 'f-txt f-i', 'end') + txt(x1, 276, 'waktu (2 periode)', 'f-cap', 'end');
  return svg(500, 288, b, 'Kurva kecepatan radial bintang ganda spektroskopik', 'Bintang bermassa besar (biru) bergoyang dengan amplitudo kecil: M₁/M₂ = K₂/K₁.');
};
})();
