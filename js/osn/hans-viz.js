/* Extra figures and labs for the Hans companion pages. */
(function () {
const F = OSN.FIG, LAB = OSN.LAB, D2R = Math.PI / 180, TAU = Math.PI * 2;
const txt = (x, y, s, cls = 'f-txt', a = 'middle') => `<text class="${cls}" x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="${a}">${s}</text>`;
const svg = (w, h, b, label, cap) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" class="osn-fig">${b}</svg>` + (cap ? `<figcaption>${cap}</figcaption>` : '');
OSN.hfig = { txt, svg };

/* Sun–Earth–planet triangle (cosine rule) */
F.segiplanet = () => {
  const S = [140, 190], E = [420, 190], th = 18 * D2R, c = 150, P = [E[0] - c * Math.cos(th), E[1] - c * Math.sin(th)];
  let b = `<line class="f-line f-strong" x1="${S[0]}" y1="${S[1]}" x2="${E[0]}" y2="${E[1]}"/><line class="f-acc f-strong" x1="${E[0]}" y1="${E[1]}" x2="${P[0]}" y2="${P[1]}"/><line class="f-blue f-strong" x1="${S[0]}" y1="${S[1]}" x2="${P[0]}" y2="${P[1]}"/>`;
  b += `<circle class="f-sun" cx="${S[0]}" cy="${S[1]}" r="14"/><circle class="f-earth" cx="${E[0]}" cy="${E[1]}" r="8"/><circle class="f-warn-fill" cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="7"/>`;
  b += `<path class="f-acc" d="M ${E[0] - 46} ${E[1]} A 46 46 0 0 1 ${(E[0] - 46 * Math.cos(th)).toFixed(1)} ${(E[1] - 46 * Math.sin(th)).toFixed(1)}"/>`;
  b += txt(S[0], S[1] + 32, 'Matahari') + txt(E[0], E[1] + 26, 'Bumi') + txt(P[0], P[1] - 14, 'Venus');
  b += txt((S[0] + E[0]) / 2, S[1] + 20, 'b = 1 AU (diketahui)', 'f-txt f-b') + txt((E[0] + P[0]) / 2 + 6, (E[1] + P[1]) / 2 - 12, 'c (radar)', 'f-txt f-acc-t') + txt((S[0] + P[0]) / 2, (S[1] + P[1]) / 2 - 14, 'a = ?', 'f-txt f-blue-t f-b');
  b += txt(E[0] - 60, E[1] - 8, 'θ', 'f-txt f-acc-t f-i');
  return svg(520, 230, b, 'Segitiga Matahari–Bumi–Venus', 'Dengan jarak Bumi–Venus c dan sudut pisah θ, jarak Matahari–Venus didapat dari aturan cosinus: a² = b² + c² − 2bc cos θ.');
};

const K = OSN.labkit || {};
const { mkLab, line, disc, ring, text, axes, fmt } = K;
const SER = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund' };

/* Hydrogen atom: energy levels and transitions */
LAB.atomH = el => mkLab(el, {
  title: 'Tangga energi atom hidrogen', hint: 'Pilih tingkat atas n dan tingkat bawah m. Turun = atom memancarkan foton (garis emisi); naik = atom menyerap foton (garis absorpsi). Pita di bawah menunjukkan posisi garis pada spektrum tampak.', aspect: 0.7,
  controls: [{ k: 'n', label: 'Tingkat atas n', min: 2, max: 8, step: 1, val: 3, fmt: x => String(x) }, { k: 'm', label: 'Tingkat bawah m', min: 1, max: 5, step: 1, val: 2, fmt: x => String(x) }, { k: 'abs', label: 'Mode absorpsi (naik)', type: 'toggle', val: false }],
  presets: [{ label: 'Hα', set: { n: 3, m: 2 } }, { label: 'Hβ', set: { n: 4, m: 2 } }, { label: 'Hγ', set: { n: 5, m: 2 } }, { label: 'Lyα', set: { n: 2, m: 1 } }, { label: 'Paα', set: { n: 4, m: 3 } }, { label: 'Brα', set: { n: 5, m: 4 } }],
  draw(c, W, H, v, C) {
    let n = v.n, m = v.m; if (m >= n) m = n - 1;
    const E = k => -13.6 / (k * k), top = 20, bot = H - 92, Y = e => top + (bot - top) * Math.sqrt(e / -13.6), x0 = 70, x1 = W * 0.62;
    for (let k = 1; k <= 8; k++) { const y = Y(E(k)), on = k === n || k === m; line(c, x0, y, x1, y, on ? C.fg : C.line, on ? 2 : 1); if (k <= 4 || on) { text(c, 'n=' + k, x0 - 8, y, on ? C.fg : C.muted, 'right'); text(c, fmt(E(k), 2) + ' eV', x1 + 6, y, C.muted); } }
    line(c, x0, Y(0), x1, Y(0), C.muted, 1, [4, 4]); text(c, '0 eV (terionisasi)', x1 + 6, Y(0) - 10, C.muted);
    const lam = 1 / (1.0968e7 * (1 / (m * m) - 1 / (n * n))) * 1e9, vis = lam >= 380 && lam <= 700, col = vis ? OSN.wl2rgb(lam) : (lam < 380 ? C.blue : C.warn);
    const ax = x0 + (x1 - x0) * (0.18 + 0.12 * (m - 1)), ya = Y(E(n)), yb = Y(E(m)), from = v.abs ? yb : ya, to = v.abs ? ya : yb;
    line(c, ax, from, ax, to + (to > from ? -8 : 8), col, 3); c.fillStyle = col; c.beginPath(); const d = to > from ? 1 : -1; c.moveTo(ax, to); c.lineTo(ax - 6, to - 10 * d); c.lineTo(ax + 6, to - 10 * d); c.fill();
    // wavy photon
    c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); const py = (ya + yb) / 2; for (let i = 0; i <= 60; i++) { const x = ax + 12 + i * 2.2, y = py + 6 * Math.sin(i * 0.9); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    text(c, v.abs ? 'foton diserap' : 'foton dipancarkan', ax + 20, py - 16, col);
    // spectrum strip
    const sx = 30, sw = W - 60, sy = H - 56, sh = 22, L0 = 350, L1 = 750, X = l => sx + (l - L0) / (L1 - L0) * sw;
    for (let l = 380; l < 700; l += 2) { c.fillStyle = OSN.wl2rgb(l); c.globalAlpha = v.abs ? 1 : 0.18; c.fillRect(X(l), sy, X(l + 2) - X(l) + 0.5, sh); } c.globalAlpha = 1;
    c.strokeStyle = C.line; c.lineWidth = 1; c.strokeRect(sx, sy, sw, sh);
    [400, 500, 600, 700].forEach(l => text(c, l + ' nm', X(l), sy + sh + 12, C.muted, 'center'));
    if (vis) { line(c, X(lam), sy - 4, X(lam), sy + sh + 4, v.abs ? '#000' : col, v.abs ? 3 : 4); }
    else text(c, (lam < 380 ? '← garis di ultraviolet (' : 'garis di inframerah (') + fmt(lam, 1) + ' nm)' + (lam < 380 ? '' : ' →'), lam < 380 ? sx + 4 : sx + sw - 4, sy - 12, lam < 380 ? C.blue : C.warn, lam < 380 ? 'left' : 'right');
    const dE = E(n) - E(m), reg = lam < 10 ? 'sinar-X' : lam < 380 ? 'ultraviolet' : lam <= 700 ? 'cahaya tampak' : 'inframerah';
    return { lam: fmt(lam, 1) + ' nm = ' + fmt(lam * 10, 0) + ' Å', dE: fmt(dE, 3) + ' eV', ser: 'Deret ' + (SER[m] || ('m = ' + m)) + (m !== v.m ? ' (m disesuaikan < n)' : ''), reg, lim: fmt(m * m / 1.0968e7 * 1e10, 0) + ' Å' };
  },
  outputs: [['lam', 'Panjang gelombang λ'], ['dE', 'Energi foton ΔE'], ['ser', 'Deret'], ['reg', 'Daerah spektrum'], ['lim', 'Batas deret (n → ∞)']]
});

/* Balmer-line strength vs temperature: Boltzmann × Saha */
LAB.balmer = el => {
  const k = 8.617e-5, kSI = 1.380649e-23, me = 9.109e-31, h = 6.626e-34;
  const frac = (T, Pe) => { const r21 = 4 * Math.exp(-10.2 / (k * T)), s = (2 * Math.PI * me * kSI * T / h / h) ** 1.5 * Math.exp(-13.6 / (k * T)) * kSI * T / Pe; return { r21, ion: s / (1 + s), f: r21 / (1 + r21) / (1 + s) }; };
  mkLab(el, {
    title: 'Boltzmann × Saha: kenapa Balmer berpuncak di kelas A', hint: 'Kurva oranye: fraksi atom H yang sudah tereksitasi ke n = 2 (Boltzmann, naik terus). Kurva biru: fraksi H yang masih netral (Saha, turun). Hasil kalinya (kurva tebal) = atom yang bisa membuat garis Balmer. Geser suhu dan tekanan elektron.', aspect: 0.62,
    controls: [{ k: 'T', label: 'Suhu fotosfer T', min: 4000, max: 25000, step: 50, val: 5800, unit: 'K', fmt: x => fmt(x, 0) }, { k: 'Pe', label: 'Tekanan elektron Pe', min: 1, max: 200, log: true, val: 20, unit: 'N/m²', fmt: x => fmt(x, 1) }],
    presets: [{ label: 'Matahari (G2)', set: { T: 5800 } }, { label: 'Vega (A0)', set: { T: 9600 } }, { label: 'Rigel (B8)', set: { T: 12100 } }, { label: 'Kelas B0', set: { T: 25000 } }, { label: 'Kelas K (4500 K)', set: { T: 4500 } }],
    draw(c, W, H, v, C) {
      const ax = axes(c, C, [56, 14, W - 72, H - 60], [4000, 25000], [0, 1], { xt: [5000, 10000, 15000, 20000, 25000], xf: q => (q / 1000) + 'k', yt: [0, 0.5, 1], xl: 'suhu (K)', yl: 'nilai relatif', ylo: 40 });
      let peak = [0, 0], N = 220; const pts = [];
      for (let i = 0; i <= N; i++) { const T = 4000 + 21000 * i / N, q = frac(T, v.Pe); pts.push([T, q]); if (q.f > peak[1]) peak = [T, q.f]; }
      const mx2 = Math.max(...pts.map(p => p[1].r21 / (1 + p[1].r21)));
      const curve = (fn, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([T, q], i) => { const y = ax.Y(fn(q)); i ? c.lineTo(ax.X(T), y) : c.moveTo(ax.X(T), y); }); c.stroke(); };
      curve(q => q.r21 / (1 + q.r21) / mx2, C.warn, 1.6); curve(q => 1 - q.ion, C.blue, 1.6); curve(q => q.f / peak[1], C.fg, 3);
      line(c, ax.X(peak[0]), 14, ax.X(peak[0]), H - 46, C.acc, 1, [4, 4]); text(c, 'puncak ≈ ' + fmt(peak[0], 0) + ' K', ax.X(peak[0]) + 6, 26, C.acc);
      const q = frac(v.T, v.Pe); disc(c, ax.X(v.T), ax.Y(q.f / peak[1]), 6, C.acc);
      text(c, 'n=2 (Boltzmann, diskalakan)', W - 22, ax.Y(0.95), C.warn, 'right'); text(c, 'H netral (Saha)', 64, ax.Y(0.08) , C.blue);
      return { r: fmt(q.r21, 3), ion: fmt(q.ion * 100, 2) + '%', f: fmt(q.f, 2), rel: fmt(q.f / peak[1] * 100, 1) + '% dari puncak', pk: fmt(peak[0], 0) + ' K' };
    },
    outputs: [['r', 'N₂/N₁ (Boltzmann)'], ['ion', 'H terionisasi (Saha)'], ['f', 'Fraksi H di n = 2'], ['rel', 'Kekuatan Balmer relatif'], ['pk', 'Suhu puncak (Pe ini)']]
  });
};

/* Space motion: radial, tangential, proper-motion components */
F.gerakdiri = () => {
  const S = [70, 200], B = [380, 120], ang = Math.atan2(B[1] - S[1], B[0] - S[0]), u = [Math.cos(ang), Math.sin(ang)], nrm = [Math.sin(ang), -Math.cos(ang)];
  const vr = [B[0] + 95 * u[0], B[1] + 95 * u[1]], vt = [B[0] + 70 * nrm[0], B[1] + 70 * nrm[1]], V = [B[0] + 95 * u[0] + 70 * nrm[0], B[1] + 95 * u[1] + 70 * nrm[1]];
  const ar = (a, b, cls) => `<line class="${cls} f-strong" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" marker-end="url(#hgArr)"/>`;
  let b = `<defs><marker id="hgArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>`;
  b += `<line class="f-line f-dash" x1="${S[0]}" y1="${S[1]}" x2="${(B[0] + 160 * u[0]).toFixed(1)}" y2="${(B[1] + 160 * u[1]).toFixed(1)}"/>`;
  b += `<line class="f-line f-thin f-dash" x1="${vr[0].toFixed(1)}" y1="${vr[1].toFixed(1)}" x2="${V[0].toFixed(1)}" y2="${V[1].toFixed(1)}"/><line class="f-line f-thin f-dash" x1="${vt[0].toFixed(1)}" y1="${vt[1].toFixed(1)}" x2="${V[0].toFixed(1)}" y2="${V[1].toFixed(1)}"/>`;
  b += `<g style="color:var(--blue)">${ar(B, vr, 'f-blue')}</g><g style="color:var(--warn)">${ar(B, vt, 'f-warn')}</g><g style="color:var(--accent)">${ar(B, V, 'f-acc')}</g>`;
  b += `<circle class="f-sun" cx="${S[0]}" cy="${S[1]}" r="10"/><circle class="f-ink-fill" cx="${B[0]}" cy="${B[1]}" r="6"/>`;
  b += txt(S[0], S[1] + 26, 'Matahari (kita)') + txt(B[0] - 4, B[1] + 22, 'bintang') + txt((S[0] + B[0]) / 2, (S[1] + B[1]) / 2 + 22, 'd = 1/p (pc)', 'f-txt f-mut-t');
  b += txt(vr[0] - 10, vr[1] + 22, 'v_r (Doppler)', 'f-txt f-blue-t') + txt(vt[0] - 4, vt[1] - 10, 'v_t = 4,74 μd', 'f-txt f-warn-t') + txt(V[0] + 14, V[1] - 8, 'V', 'f-txt f-acc-t f-b', 'start');
  // sky inset
  const cx = 660, cy = 150, L = 56;
  b += `<rect class="f-line" x="${cx - 95}" y="${cy - 105}" width="190" height="200" rx="10" fill="none"/>`;
  b += txt(cx, cy - 86, 'di langit (dilihat dari Bumi)', 'f-txt f-mut-t');
  b += `<g style="color:var(--muted)">${ar([cx, cy], [cx, cy - L], 'f-line')}${ar([cx, cy], [cx - L, cy], 'f-line')}</g>`;
  b += txt(cx, cy - L - 8, 'U (δ+)') + txt(cx - L - 4, cy - 12, 'T (α+)', 'f-txt', 'end');
  b += `<g style="color:var(--accent)">${ar([cx, cy], [cx - 50, cy - 40], 'f-acc')}</g><line class="f-line f-thin f-dash" x1="${cx - 50}" y1="${cy - 40}" x2="${cx - 50}" y2="${cy}"/><line class="f-line f-thin f-dash" x1="${cx - 50}" y1="${cy - 40}" x2="${cx}" y2="${cy - 40}"/>`;
  b += txt(cx - 60, cy - 46, 'μ', 'f-txt f-acc-t f-b') + txt(cx - 25, cy + 16, 'μ_α cos δ') + txt(cx + 8, cy - 30, 'μ_δ', 'f-txt', 'start');
  b += txt(cx, cy + 50, 'μ² = (μ_α cos δ)² + μ_δ²', 'f-txt f-b') + txt(cx, cy + 72, 'V² = v_r² + v_t²', 'f-txt f-b');
  return svg(780, 270, b, 'Komponen gerak bintang', 'Kecepatan ruang V terurai menjadi v_r (sepanjang garis pandang, diukur dari pergeseran Doppler) dan v_t (tegak lurus, terlihat sebagai gerak diri μ). Di langit, μ terurai lagi ke arah timur (μ_α cos δ) dan utara (μ_δ). Perhatikan: T di kiri karena kita menatap langit dari dalam bola.');
};

/* P Cygni profile from an expanding shell */
F.pcygni = () => {
  const cx = 170, cy = 140;
  let b = `<circle class="f-line f-dash" cx="${cx}" cy="${cy}" r="100" fill="none"/><circle class="f-line f-dash" cx="${cx}" cy="${cy}" r="78" fill="none"/>`;
  b += `<rect x="${cx - 32}" y="${cy + 30}" width="64" height="78" class="f-blue-fill" opacity=".18"/>`;
  b += `<circle class="f-sun" cx="${cx}" cy="${cy}" r="32"/>`;
  [0, 45, 90, 135, 180, 225, 270, 315].forEach(a => { const r = a * D2R, x1 = cx + 82 * Math.cos(r), y1 = cy + 82 * Math.sin(r), x2 = cx + 102 * Math.cos(r), y2 = cy + 102 * Math.sin(r); b += `<line class="f-acc f-strong" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" marker-end="url(#hpArr)"/>`; });
  b = `<defs><marker id="hpArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>` + b;
  b += txt(cx, cy + 4, 'bintang') + txt(cx, cy + 122, 'kolom di depan bintang:', 'f-txt f-blue-t') + txt(cx, cy + 136, 'menyerap & mendekati kita', 'f-txt f-blue-t');
  b += txt(cx + 108, cy - 4, 'sisi selubung:', 'f-txt f-acc-t', 'start') + txt(cx + 108, cy + 12, 'memancar', 'f-txt f-acc-t', 'start');
  b += `<line class="f-line" x1="${cx}" y1="${cy + 148}" x2="${cx}" y2="${cy + 176}" marker-end="url(#hpArr)"/>` + txt(cx + 8, cy + 172, 'ke pengamat', 'f-txt f-mut-t', 'start');
  // profile
  const x0 = 360, x1 = 670, yc = 170, X = t => x0 + (t + 1) / 2 * (x1 - x0);
  let d = ''; for (let i = 0; i <= 200; i++) { const t = -1 + 2 * i / 200, em = 70 * Math.exp(-(((t - 0.05) / 0.28) ** 2)), ab = t < 0 ? 55 * Math.exp(-(((t + 0.42) / 0.14) ** 2)) : 0, y = yc - em + ab; d += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + y.toFixed(1); }
  b += `<line class="f-line f-dash" x1="${x0}" y1="${yc}" x2="${x1}" y2="${yc}"/><line class="f-line f-thin f-dash" x1="${X(0)}" y1="60" x2="${X(0)}" y2="${yc + 70}"/>`;
  b += `<path d="${d}" class="f-acc f-strong" fill="none"/>`;
  b += txt(X(0), yc + 102, 'λ₀ (diam)') + txt(X(-0.5), yc - 22, 'absorpsi bergeser biru', 'f-txt f-blue-t') + txt(X(0.32), 106, 'emisi', 'f-txt f-acc-t') + txt(x1 - 4, yc - 10, 'kontinum', 'f-txt f-mut-t', 'end');
  b += `<line class="f-blue f-strong" x1="${X(-0.42)}" y1="${yc + 70}" x2="${X(0)}" y2="${yc + 70}"/>` + txt((X(-0.42) + X(0)) / 2, yc + 86, 'Δλ → v angin', 'f-txt f-blue-t');
  b += txt((x0 + x1) / 2, 40, 'Profil garis yang teramati', 'f-txt f-b') + txt(x0, yc + 124, '← biru', 'f-txt f-mut-t', 'start') + txt(x1, yc + 124, 'merah →', 'f-txt f-mut-t', 'end');
  return svg(700, 330, b, 'Profil P Cygni', 'Selubung yang mengembang memancarkan garis emisi dari segala sisi (terpusat di λ₀), tetapi gas di depan piringan bintang menyerap cahaya bintang sambil bergerak ke arah kita, sehingga lekuk absorpsinya muncul di sisi biru.');
};

/* Sidereal time: why stars return 4 minutes earlier each day */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dlabel = n => { n = Math.round(n); let m = 0; while (n > MD[m]) { n -= MD[m]; m = (m + 1) % 12; } return n + ' ' + MON[m]; };
const hms = h => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return H + 'h' + String(M).padStart(2, '0') + 'm'; };
LAB.jambintang = el => mkLab(el, {
  title: 'Jam bintang: kenapa bintang terbit 4 menit lebih awal tiap hari', hint: 'Tampak atas tata surya (dari kutub utara ekliptika). Panah ♈ menunjuk titik Aries, arahnya tetap terhadap bintang. Garis oranye = meridian pengamat (arah "atas kepala" saat tengah malam/siang). Waktu sideris lokal = sudut meridian diukur dari arah ♈. Geser tanggal dan jam; tekan ▶ untuk memutar Bumi.', aspect: 0.66, anim: true,
  controls: [{ k: 'day', label: 'Tanggal', min: 1, max: 365, step: 1, val: 80, fmt: dlabel }, { k: 't', label: 'Jam lokal (waktu matahari menengah)', min: 0, max: 24, step: 0.05, val: 21, fmt: hms }, { k: 'ra', label: 'Asensiorekta bintang α', min: 0, max: 24, step: 0.05, val: 6.75, fmt: hms }],
  presets: [{ label: '21 Mar 00:00', set: { day: 80, t: 0 } }, { label: '22 Jun 00:00', set: { day: 173, t: 0 } }, { label: '23 Sep 00:00', set: { day: 266, t: 0 } }, { label: '22 Des 00:00', set: { day: 356, t: 0 } }, { label: 'Sirius (6h45m)', set: { ra: 6.75 } }, { label: 'Antares (16h29m)', set: { ra: 16.48 } }],
  draw(c, W, H, v, C, tt) {
    if (tt) { v.t += 0.04; if (v.t >= 24) { v.t -= 24; v.day = v.day % 365 + 1; } }
    const dd = v.day - 80 + v.t / 24, lamS = dd * 360 / 365.2422, lst = (lamS / 15 + v.t - 12 + 48) % 24;
    const cx = W * 0.56, cy = H * 0.54, R = Math.min(W * 0.26, H * 0.34), a = (lamS + 180) * D2R, ex = cx + R * Math.cos(a), ey = cy - R * Math.sin(a);
    ring(c, cx, cy, R, C.line, 1, [3, 4]); disc(c, cx, cy, 14, C.sun); text(c, 'Matahari', cx, cy + 26, C.muted, 'center');
    // Aries arrows (fixed direction)
    line(c, cx + 20, cy, W - 8, cy, C.muted, 1, [6, 4]); text(c, '♈ arah titik Aries →', W - 8, cy - 14, C.muted, 'right');
    // month ticks
    [[80, 'Mar'], [173, 'Jun'], [266, 'Sep'], [356, 'Des']].forEach(([n, l]) => { const q = ((n - 80) * 360 / 365.2422 + 180) * D2R; text(c, l, cx + (R + 16) * Math.cos(q), cy - (R + 16) * Math.sin(q) + (Math.abs(Math.sin(q)) < 0.3 ? 18 : 0), C.muted, 'center'); });
    // Earth with night side
    const re = 15; disc(c, ex, ey, re, C.blue); c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(ex, ey, re, -(lamS + 90) * D2R, -(lamS + 270) * D2R, true); c.fill();
    const m = (lamS + (v.t - 12) * 15) * D2R, mx = Math.cos(m), my = -Math.sin(m), L = Math.min(R * 0.8, 120);
    line(c, ex, ey, ex + mx * L, ey + my * L, C.warn, 2.4); disc(c, ex + mx * re, ey + my * re, 3.5, C.warn);
    line(c, ex, ey, ex + L * 0.85, ey, C.muted, 1, [3, 3]);
    const sa = v.ra * 15 * D2R; line(c, ex, ey, ex + Math.cos(sa) * L * 0.9, ey - Math.sin(sa) * L * 0.9, C.acc, 1.6, [2, 3]); disc(c, ex + Math.cos(sa) * L * 0.9, ey - Math.sin(sa) * L * 0.9, 4, C.acc);
    c.strokeStyle = C.warn; c.lineWidth = 1.2; c.beginPath(); c.arc(ex, ey, 30, 0, -m, true); c.stroke();
    const lab = (s, x, y, col, right) => text(c, s, Math.max(6, Math.min(W - 6, x)), Math.max(10, Math.min(H - 8, y)), col, x < 70 ? 'left' : x > W - 70 ? 'right' : right ? 'left' : 'right'); lab('meridian', ex + mx * (L + 8), ey + my * (L + 8), C.warn, mx > 0); lab('bintang', ex + Math.cos(sa) * (L * 0.9 + 10), ey - Math.sin(sa) * (L * 0.9 + 10), C.acc, Math.cos(sa) > 0);
    // right panel: clocks
    const px = 12, fs = 17, ha = ((lst - v.ra + 36) % 24) - 12;
    if (W >= 520) {
    text(c, 'Jam matahari', px, 14, C.muted); text(c, hms(v.t), px, 32, C.fg, 'left', `bold ${fs}px ${C.mono}`);
    text(c, 'Jam bintang (LST)', px, 56, C.muted, 'left', `12px ${C.ui}`); text(c, hms(lst), px, 74, C.warn, 'left', `bold ${fs}px ${C.mono}`);
    text(c, 'Sudut jam bintang', px, 98, C.muted, 'left', `12px ${C.ui}`); text(c, (ha >= 0 ? '+' : '−') + hms(Math.abs(ha)), px, 116, C.acc, 'left', `bold ${fs}px ${C.mono}`);
    }
    c.font = `12px ${C.ui}`;
    const tr = ((v.ra - lst) * 0.99727 + v.t + 48) % 24;
    return { sol: hms(v.t) + ' tgl ' + dlabel(v.day), lst: hms(lst), lst0: hms((dd - v.t / 24) * 24 / 365.2422 + 12), ha: (ha >= 0 ? 'HA = +' : 'HA = −') + hms(Math.abs(ha)) + (Math.abs(ha) < 0.05 ? ' (tepat di meridian)' : ha > 0 ? ' (di barat meridian)' : ' (di timur meridian)'), tr: hms(tr) + ' waktu lokal', sun: 'λ☉ ≈ ' + fmt(((lamS % 360) + 360) % 360, 1) + '°, α☉ ≈ ' + hms(lamS / 15) };
  },
  outputs: [['sol', 'Jam matahari'], ['lst', 'Waktu sideris lokal'], ['lst0', 'LST pukul 00:00 tanggal ini'], ['ha', 'Sudut jam bintang'], ['tr', 'Bintang berkulminasi atas pukul'], ['sun', 'Posisi Matahari (kira-kira)']]
});

/* Atmospheric refraction lifts objects near the horizon */
F.refraksi = () => {
  const gx = 40, gy = 230, W = 640;
  let b = `<path d="M 20 ${gy} Q 320 ${gy - 14} 620 ${gy}" class="f-earthsurf"/>`;
  [0, 1, 2, 3].forEach(i => { b += `<path d="M 20 ${gy - 30 - i * 32} Q 320 ${gy - 44 - i * 32} 620 ${gy - 30 - i * 32}" class="f-line f-thin f-dash" fill="none"/>`; });
  b += txt(30, gy - 142, 'lapisan udara: makin renggang ke atas', 'f-txt f-mut-t', 'start');
  const ox = 120, oy = gy - 6;
  b += `<circle class="f-ink-fill" cx="${ox}" cy="${oy}" r="5"/>` + txt(ox, oy + 20, 'pengamat');
  // true ray (curved) and apparent direction
  b += `<path d="M ${ox} ${oy} Q 330 ${oy - 62} 600 ${oy - 82}" class="f-acc f-strong" fill="none"/>`;
  b += `<line class="f-acc f-dash" x1="${ox}" y1="${oy}" x2="560" y2="${oy - 150}"/>`;
  b += `<line class="f-line f-dash" x1="${ox}" y1="${oy}" x2="620" y2="${oy}"/>` + txt(620, oy - 8, 'horizon', 'f-txt f-mut-t', 'end');
  b += `<circle class="f-sun" cx="610" cy="${oy - 84}" r="10"/>` + txt(624, oy - 102, 'posisi benar', 'f-txt', 'end');
  b += `<circle class="f-sun" cx="570" cy="${oy - 153}" r="10" opacity=".45"/>` + txt(590, oy - 174, 'posisi tampak (lebih tinggi)', 'f-txt f-acc-t', 'end');
  b += txt(330, oy - 40, 'berkas cahaya dibelokkan', 'f-txt f-acc-t');
  b += txt(gx + 300, 18, 'R = z − z′ ≈ k tan z′ (k ≈ 58″);  di horizon R ≈ 34′–35′', 'f-txt f-b');
  return svg(W, 270, b, 'Refraksi atmosfer', 'Cahaya dari benda langit dibelokkan saat memasuki udara yang makin rapat, sehingga kita melihat benda itu lebih tinggi dari posisi sebenarnya. Di horizon pembelokannya ~35′, lebih besar dari diameter Matahari (32′): saat piringan Matahari "tampak" baru menyentuh horizon, sebenarnya ia sudah seluruhnya di bawah horizon. (Kelengkungan berkas dilebih-lebihkan.)');
};
})();
