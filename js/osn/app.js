/* OSN Astronomy Academy: routing, rendering, practice engine, progress. */
(function () {
const CH = OSN.CH, $ = s => document.querySelector(s), main = $('#main'), nav = $('#nav');
const KEY = 'cl-osn-v1';
let S = { p: {} };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign({ p: {} }, JSON.parse(raw)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const LV = { K: 'OSN-K', P: 'OSN-P', N: 'OSN Nasional' }, TYPE = { mc: 'Pilihan ganda', num: 'Isian angka', essay: 'Uraian' };
const allProblems = () => CH.flatMap(ch => ch.problems.map((p, i) => ({ p, ch, i, id: `${ch.id}-${i}` })));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- MathJax ---------- */
/* long inline formulas cannot line-break in MathJax 3: let them scroll inside their own box instead of widening the page */
const fitMath = node => node && node.querySelectorAll && node.querySelectorAll('mjx-container:not([display="true"])').forEach(m => { const p = m.parentElement; if (p && p.clientWidth && m.getBoundingClientRect().width > p.clientWidth) m.classList.add('mjx-wide'); });
const typeset = node => { const MJ = window.MathJax; if (MJ && MJ.typesetPromise) MJ.typesetPromise([node]).then(() => fitMath(node)).catch(() => {}); else (window.__mjq = window.__mjq || []).push(node); };
window.__mjReady = () => { (window.__mjq || []).forEach(n => window.MathJax.typesetPromise([n]).then(() => fitMath(n)).catch(() => {})); window.__mjq = []; };
window.addEventListener('resize', () => { clearTimeout(fitMath.t); fitMath.t = setTimeout(() => fitMath(document.querySelector('main')), 300); });

/* ---------- number parsing for answers (accepts 6,03e24 · 6.03 × 10^24 · 35 786 · 16.200) ---------- */
function parseNum(str) {
  let s = String(str).trim().replace(/\s+(?=\d)/g, '').replace(/−/g, '-');
  if (!s) return NaN;
  let m = s.match(/^([-+]?[\d.,]+)\s*(?:[x×*·]\s*10\s*\^?\s*([-+]?\d+)|[eE]([-+]?\d+))?$/);
  if (!m) return NaN;
  let a = m[1];
  if (a.includes('.') && a.includes(',')) a = a.replace(/\./g, '').replace(',', '.');
  else if (/^[-+]?\d{1,3}(\.\d{3})+$/.test(a)) a = a.replace(/\./g, '');
  else a = a.replace(',', '.');
  const e = m[2] ?? m[3];
  return parseFloat(a) * (e != null ? Math.pow(10, +e) : 1);
}
const checkNum = (p, x) => isFinite(x) && (p.abs != null ? Math.abs(x - p.a) <= p.abs : Math.abs(x - p.a) <= Math.abs(p.a) * (p.tol ?? 0.02));
const fmtAns = x => { const a = Math.abs(x); if (a !== 0 && (a >= 1e5 || a < 1e-2)) { const e = Math.floor(Math.log10(a)); return (x / 10 ** e).toLocaleString('id-ID', { maximumFractionDigits: 3 }) + ' × 10<sup>' + e + '</sup>'; } return x.toLocaleString('id-ID', { maximumFractionDigits: 3 }); };

function record(id, ok) { const r = S.p[id] || { n: 0 }; r.n++; r.s = ok ? 'ok' : 'bad'; r.at = Date.now(); S.p[id] = r; save(); updateNavCounts(); }
const missed = () => allProblems().filter(x => S.p[x.id] && S.p[x.id].s === 'bad');
const chProgress = ch => { const n = ch.problems.length, ok = ch.problems.filter((p, i) => (S.p[`${ch.id}-${i}`] || {}).s === 'ok').length; return { n, ok }; };

/* ---------- problem card ---------- */
function problemCard(x, opt = {}) {
  const { p, ch, id } = x, card = el('article', 'prob'), st = S.p[id];
  card.dataset.id = id;
  const meta = `<div class="prob-meta"><span class="tag lv-${p.lv}">${LV[p.lv]}</span><span class="tag">${TYPE[p.t]}</span>${opt.showCh ? `<a class="tag link" href="#${ch.id}">Bab ${ch.no} · ${ch.short}</a>` : ''}${st && !opt.exam ? `<span class="tag state-${st.s}">${st.s === 'ok' ? 'pernah benar' : 'perlu diulang'}</span>` : ''}</div>`;
  card.innerHTML = meta + `<div class="prob-q">${opt.num ? `<b class="qn">${opt.num}.</b> ` : ''}${p.q}</div>`;
  const body = el('div', 'prob-a'), fb = el('div', 'prob-fb'); fb.hidden = true;
  const reveal = (ok, extra) => {
    fb.hidden = false;
    fb.innerHTML = (ok == null ? '' : `<p class="verdict ${ok ? 'ok' : 'bad'}">${ok ? 'Benar!' : 'Belum tepat.'}${extra || ''}</p>`) + `<div class="sol"><span class="eyebrow">Pembahasan</span><div>${p.sol}</div></div>`;
    typeset(fb);
  };
  const finish = ok => { if (!opt.exam) { record(id, ok); reveal(ok, extraFor(ok)); } if (opt.onAnswer) opt.onAnswer(ok, card); };
  let extraFor = () => '';
  if (p.t === 'mc') {
    const ol = el('div', 'opts');
    p.o.forEach((o, j) => {
      const b = el('button', 'opt', `<span class="ol">${'ABCD'[j]}</span><span>${o}</span>`); b.type = 'button';
      b.onclick = () => {
        if (card.dataset.done) return; card.dataset.done = 1; const ok = j === p.a; card._ok = ok;
        ol.querySelectorAll('.opt').forEach((q, k) => { q.disabled = true; if (!opt.exam) { if (k === p.a) q.classList.add('ok'); else if (k === j) q.classList.add('bad'); } else if (k === j) q.classList.add('picked'); });
        card._reveal = () => { ol.querySelectorAll('.opt').forEach((q, k) => { if (k === p.a) q.classList.add('ok'); else if (k === j) q.classList.add('bad'); }); record(id, ok); reveal(ok); };
        finish(ok);
      };
      ol.appendChild(b);
    });
    body.appendChild(ol);
  } else if (p.t === 'num') {
    const f = el('form', 'numform'), iid = 'in-' + id;
    f.innerHTML = `<label for="${iid}" class="sr">Jawaban</label><input id="${iid}" inputmode="decimal" autocomplete="off" placeholder="jawabanmu, mis. 6,03e24">${p.unit ? `<span class="unit">${p.unit}</span>` : ''}<button class="btn" type="submit">${opt.exam ? 'Simpan' : 'Periksa'}</button><p class="hint">Toleransi ${p.abs != null ? '±' + String(p.abs).replace('.', ',') : '±' + Math.round((p.tol ?? 0.02) * 100) + '%'}. Tulis koma atau titik desimal; notasi ilmiah boleh (6,03e24 atau 6,03 × 10^24).</p>`;
    const inp = f.querySelector('input');
    extraFor = () => ` Jawaban kunci: <b>${fmtAns(p.a)}${p.unit ? ' ' + p.unit : ''}</b>.`;
    f.onsubmit = ev => {
      ev.preventDefault(); if (card.dataset.done) return; const xv = parseNum(inp.value);
      if (!isFinite(xv)) { f.querySelector('.hint').textContent = 'Angka tidak terbaca. Contoh format: 35786, 0,69, atau 1,9e27.'; return; }
      card.dataset.done = 1; inp.disabled = true; f.querySelector('button').disabled = true; const ok = checkNum(p, xv); card._ok = ok;
      if (opt.exam) { card.classList.add('answered'); card._reveal = () => { record(id, ok); reveal(ok, extraFor(ok)); }; }
      finish(ok);
    };
    body.appendChild(f);
  } else {
    const iid = 'ta-' + id, w = el('div', 'essay');
    w.innerHTML = `<label for="${iid}" class="sr">Coretan jawaban</label><textarea id="${iid}" rows="4" placeholder="Tulis langkah-langkahmu di sini (tersimpan di perangkat ini)…"></textarea><div class="row"><button class="btn" type="button">Lihat pembahasan</button></div>`;
    const ta = w.querySelector('textarea'); try { ta.value = localStorage.getItem('cl-osn-ta-' + id) || ''; } catch (e) {}
    ta.oninput = () => { try { localStorage.setItem('cl-osn-ta-' + id, ta.value); } catch (e) {} };
    w.querySelector('button').onclick = () => {
      reveal(null); const r = el('div', 'row selfcheck', '<span>Bandingkan dengan pembahasan:</span>');
      [['Jawabanku sudah benar', true], ['Perlu diulang', false]].forEach(([l, ok]) => { const b = el('button', 'btn small' + (ok ? '' : ' ghost'), l); b.type = 'button'; b.onclick = () => { record(id, ok); r.innerHTML = `<span class="verdict ${ok ? 'ok' : 'bad'}">${ok ? 'Tercatat sebagai dikuasai.' : 'Masuk daftar "Ulangi yang salah".'}</span>`; }; r.appendChild(b); });
      fb.appendChild(r);
    };
    body.appendChild(w);
  }
  card.append(body, fb);
  return card;
}

/* ---------- nav ---------- */
function buildNav() {
  nav.innerHTML = `<a href="#beranda" data-r="beranda" class="nav-home">Beranda</a><p class="nav-h">Bab materi</p>` +
    CH.map(ch => `<a href="#${ch.id}" data-r="${ch.id}"><span class="nno">${String(ch.no).padStart(2, '0')}</span><span class="nt">${ch.short}</span><span class="npg" data-pg="${ch.id}"></span></a>`).join('') +
    `<p class="nav-h">Latihan</p><a href="#ulang" data-r="ulang">Ulangi yang salah <span class="count" id="missCount"></span></a><a href="#paket" data-r="paket">Paket latihan campuran</a><a href="#konstanta" data-r="konstanta">Tabel konstanta & data</a><p class="nav-h">Pembahasan buku</p><a href="#hans" data-r="hans">Diktat Hans (2006)</a><p class="nav-h">Situs utama</p><a href="index.html">Cosmic Ladder 3D ↗</a>`;
  updateNavCounts();
}
function updateNavCounts() {
  const m = missed().length, mc = $('#missCount'); if (mc) { mc.textContent = m || ''; mc.hidden = !m; }
  CH.forEach(ch => { const g = nav.querySelector(`[data-pg="${ch.id}"]`); if (g) { const { n, ok } = chProgress(ch); g.style.setProperty('--p', (ok / n * 100).toFixed(0) + '%'); g.title = `${ok}/${n} soal dikuasai`; } });
}
const setActive = r => nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.r === r));

/* ---------- views ---------- */
function viewHome() {
  const all = allProblems(), done = all.filter(x => (S.p[x.id] || {}).s === 'ok').length, labs = CH.reduce((a, c) => a + c.sections.filter(s => s.lab).length, 0);
  main.innerHTML = `
  <header class="hero">
    <p class="eyebrow">Cosmic Ladder · Akademi</p>
    <h1>OSN Astronomy Academy</h1>
    <p class="lead">Materi, lab interaktif, dan latihan soal fisika-astronomi untuk persiapan Olimpiade Sains Nasional bidang Astronomi tingkat SMA. Setiap bab dimulai dari konsep paling dasar, dilengkapi visualisasi, contoh soal berpembahasan, dan tautan untuk belajar lebih dalam.</p>
    <div class="row"><a class="btn primary" href="#${CH[0].id}">Mulai dari Bab 1</a><a class="btn" href="#paket">Paket latihan campuran</a><a class="btn ghost" href="#ulang">Ulangi yang salah${missed().length ? ` (${missed().length})` : ''}</a></div>
    <dl class="stats"><div><dt>Bab</dt><dd>${CH.length}</dd></div><div><dt>Soal latihan</dt><dd>${all.length}</dd></div><div><dt>Lab interaktif</dt><dd>${labs}</dd></div><div><dt>Soal dikuasai</dt><dd>${done}<small>/${all.length}</small></dd></div></dl>
  </header>
  <section class="block"><h2>Format OSN Astronomi</h2>
    <p>Silabus OSN Astronomi mengikuti silabus olimpiade internasional (IOAA): teori astrofisika, metode matematis, koordinat & waktu, tata surya, bintang, sistem bintang & galaksi, kosmologi dasar, instrumentasi, serta praktik observasi dan analisis data.</p>
    <div class="tablewrap"><table><thead><tr><th>Tahap</th><th>Bentuk soal</th><th>Jumlah</th><th>Waktu</th></tr></thead><tbody>
      <tr><td><span class="tag lv-K">OSN-K</span> Kabupaten/Kota</td><td>Pilihan ganda & pilihan ganda kompleks</td><td>30</td><td>100 menit</td></tr>
      <tr><td><span class="tag lv-P">OSN-P</span> Provinsi</td><td>Pilihan ganda, PG kompleks, isian singkat</td><td>25</td><td>180 menit</td></tr>
      <tr><td><span class="tag lv-N">OSN Nasional</span></td><td>Teori uraian; analisis data; observasi</td><td>5–10 (teori)</td><td>3 jam + 2–3 jam</td></tr>
    </tbody></table></div>
    <p class="note">Format berdasarkan panduan OSN SMA 2025 (BPTI) seperti dirangkum <a href="https://tirto.id/silabus-olimpiade-cabang-astronomi-osn-sma-2025-jumlah-soal-haow" target="_blank" rel="noopener">tirto.id</a>. Format bisa berubah tiap tahun; selalu cek panduan resmi terbaru. Silabus rinci: <a href="https://ioaastrophysics.org/resources/IOAA%20Syllabus" target="_blank" rel="noopener">IOAA Syllabus</a>.</p>
    <p class="note">Label <span class="tag lv-K">OSN-K</span> <span class="tag lv-P">OSN-P</span> <span class="tag lv-N">OSN Nasional</span> pada soal di situs ini menunjukkan perkiraan tingkat kesulitan, bukan soal resmi.</p>
  </section>
  <section class="block"><h2>Peta bab</h2><div class="chmap">${CH.map(ch => { const { n, ok } = chProgress(ch); return `<a class="chrow" href="#${ch.id}"><span class="chno">${String(ch.no).padStart(2, '0')}</span><span class="chtt"><b>${ch.title}</b><small>${ch.sections.map(s => s.h.split(/[:&,]/)[0].trim()).slice(0, 4).join(' · ')}</small></span><span class="chmeta"><span class="mono">${ch.lv}</span><span class="bar"><i style="width:${(ok / n * 100).toFixed(0)}%"></i></span><small>${ok}/${n} soal</small></span></a>`; }).join('')}</div></section>
  <section class="block"><h2>Cara belajar yang disarankan</h2><ol class="steps">
    <li><b>Baca materi & mainkan labnya.</b> Ubah-ubah nilai sampai kamu bisa menebak hasilnya sebelum melihat angka.</li>
    <li><b>Kerjakan contoh soal sendiri dulu</b>, baru buka pembahasan.</li>
    <li><b>Latihan per bab.</b> Soal OSN-K melatih konsep, OSN-P melatih hitungan, OSN Nasional melatih penurunan dan penalaran panjang.</li>
    <li><b>Ulangi yang salah.</b> Soal yang salah otomatis terkumpul; kerjakan ulang sampai benar.</li>
    <li><b>Paket campuran berwaktu</b> untuk simulasi ujian, lalu kembali ke bab yang lemah.</li></ol>
    <p class="note">Progres tersimpan di browser perangkat ini saja.</p></section>`;
}

function viewChapter(ch) {
  const idx = CH.indexOf(ch), prev = CH[idx - 1], next = CH[idx + 1];
  const toc = ch.sections.map(s => `<a href="#${ch.id}" data-jump="${ch.id}-${s.id}">${s.h}</a>`).join('') + `<a href="#${ch.id}" data-jump="${ch.id}-rumus">Ringkasan rumus</a><a href="#${ch.id}" data-jump="${ch.id}-contoh">Contoh soal</a><a href="#${ch.id}" data-jump="${ch.id}-latihan">Latihan (${ch.problems.length})</a>`;
  main.innerHTML = `<header class="chhead"><p class="eyebrow">Bab ${String(ch.no).padStart(2, '0')} · <span class="mono">${ch.lv}</span></p><h1>${ch.title}</h1><p class="lead">${ch.lead}</p><nav class="toc" aria-label="Isi bab">${toc}</nav></header>`;
  ch.sections.forEach((s, i) => {
    const sec = el('section', 'mat'); sec.id = `${ch.id}-${s.id}`;
    sec.innerHTML = `<h2><span class="secno">${ch.no}.${i + 1}</span> ${s.h}</h2><div class="prose">${s.body}</div>`;
    if (s.fig && OSN.FIG[s.fig]) { const f = el('figure', 'fig', OSN.FIG[s.fig]()); sec.appendChild(f); }
    if (s.lab && OSN.LAB[s.lab]) { const d = el('div'); sec.appendChild(d); try { OSN.LAB[s.lab](d); } catch (e) { d.textContent = 'Lab gagal dimuat.'; console.error(e); } }
    if (s.refs && s.refs.length) sec.appendChild(el('aside', 'refs', `<p class="eyebrow">Pelajari lebih lanjut</p><ul>${s.refs.map(([t, u, k]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a><span>${esc(k || '')}</span></li>`).join('')}</ul>`));
    main.appendChild(sec);
  });
  const fr = el('section', 'mat'); fr.id = `${ch.id}-rumus`;
  fr.innerHTML = `<h2>Ringkasan rumus</h2><div class="tablewrap"><table class="ftable"><tbody>${ch.formulas.map(([l, f]) => `<tr><th>${l}</th><td>\\(${f}\\)</td></tr>`).join('')}</tbody></table></div>`;
  main.appendChild(fr);
  const ex = el('section', 'mat'); ex.id = `${ch.id}-contoh`;
  ex.innerHTML = `<h2>Contoh soal & pembahasan</h2>` + ch.examples.map((e, i) => `<details class="ex"><summary><b>Contoh ${i + 1}.</b> ${e.q}</summary><div class="sol"><span class="eyebrow">Pembahasan</span><div>${e.sol}</div></div></details>`).join('');
  main.appendChild(ex);
  const pr = el('section', 'mat'); pr.id = `${ch.id}-latihan`;
  const { n, ok } = chProgress(ch);
  pr.innerHTML = `<h2>Latihan</h2><p class="note">${ok}/${n} soal sudah pernah kamu jawab benar. Jawaban salah otomatis masuk ke <a href="#ulang">Ulangi yang salah</a>.</p>`;
  const order = ['K', 'P', 'N'];
  ch.problems.map((p, i) => ({ p, ch, i, id: `${ch.id}-${i}` })).sort((a, b) => order.indexOf(a.p.lv) - order.indexOf(b.p.lv)).forEach((x, k) => pr.appendChild(problemCard(x, { num: k + 1 })));
  main.appendChild(pr);
  if (ch.think && ch.think.length) main.appendChild(el('section', 'mat think', `<h2>Pertanyaan pemantik</h2><p class="note">Tidak ada kunci jawaban. Coba diskusikan atau cari tahu dari tautan referensi.</p><ul>${ch.think.map(q => `<li>${q}</li>`).join('')}</ul>`));
  main.appendChild(el('nav', 'pager', `${prev ? `<a href="#${prev.id}" class="btn ghost">← Bab ${prev.no}: ${prev.short}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="btn">Bab ${next.no}: ${next.short} →</a>` : `<a href="#paket" class="btn">Paket latihan campuran →</a>`}`));
  main.querySelectorAll('[data-jump]').forEach(a => a.onclick = ev => { ev.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
}

function viewReview() {
  const list = missed();
  main.innerHTML = `<header class="chhead"><p class="eyebrow">Latihan</p><h1>Ulangi yang salah</h1><p class="lead">Semua soal yang pernah kamu jawab salah (atau kamu tandai "perlu diulang") terkumpul di sini. Jawab benar untuk mengeluarkannya dari daftar.</p></header>`;
  if (!list.length) { main.appendChild(el('div', 'empty', `<p><b>Daftar kosong.</b> Belum ada soal yang salah, atau semuanya sudah kamu perbaiki.</p><a class="btn" href="#paket">Coba paket latihan campuran</a>`)); return; }
  const wrap = el('section', 'mat'); wrap.appendChild(el('p', 'note', `${list.length} soal perlu diulang. Urutan diacak supaya kamu tidak sekadar menghafal posisi.`));
  shuffle(list).forEach((x, k) => wrap.appendChild(problemCard(x, { num: k + 1, showCh: true, onAnswer: (ok, card) => { if (ok) card.classList.add('mastered'); } })));
  main.appendChild(wrap);
}

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
let timerId = 0;
function viewPaket() {
  clearInterval(timerId);
  main.innerHTML = `<header class="chhead"><p class="eyebrow">Latihan</p><h1>Paket latihan campuran</h1><p class="lead">Soal acak lintas bab, tanpa umpan balik sampai kamu menekan "Selesai & nilai". Cocok untuk simulasi ujian. Soal uraian tidak dimasukkan karena dinilai sendiri.</p></header>`;
  const form = el('form', 'paketform');
  form.innerHTML = `<div class="field"><label for="pk-lv">Tingkat</label><select id="pk-lv"><option value="all">Semua tingkat</option><option value="K">OSN-K</option><option value="P">OSN-P</option><option value="N">OSN Nasional</option></select></div>
   <div class="field"><label for="pk-ch">Bab</label><select id="pk-ch"><option value="all">Semua bab</option>${CH.map(c => `<option value="${c.id}">Bab ${c.no} · ${c.short}</option>`).join('')}</select></div>
   <div class="field"><label for="pk-n">Jumlah soal</label><select id="pk-n"><option>10</option><option selected>20</option><option>30</option></select></div>
   <div class="field"><label for="pk-t">Waktu</label><select id="pk-t"><option value="0">Tanpa batas</option><option value="200">200 detik per soal (setara OSN-K)</option><option value="430">7 menit per soal (setara OSN-P)</option></select></div>
   <button class="btn primary" type="submit">Mulai paket</button>`;
  main.appendChild(form);
  const area = el('section', 'mat'); main.appendChild(area);
  form.onsubmit = ev => {
    ev.preventDefault(); clearInterval(timerId);
    const lv = $('#pk-lv').value, chs = $('#pk-ch').value, n = +$('#pk-n').value, per = +$('#pk-t').value;
    let pool = allProblems().filter(x => x.p.t !== 'essay' && (lv === 'all' || x.p.lv === lv) && (chs === 'all' || x.ch.id === chs));
    pool = shuffle(pool).slice(0, n);
    area.innerHTML = '';
    if (!pool.length) { area.appendChild(el('p', 'note', 'Tidak ada soal yang cocok dengan pilihan ini. Longgarkan filternya.')); return; }
    const bar = el('div', 'paketbar'); bar.innerHTML = `<span><b id="pk-done">0</b>/${pool.length} terjawab</span><span id="pk-clock" class="mono"></span><button class="btn small primary" type="button" id="pk-end">Selesai & nilai</button>`;
    area.appendChild(bar);
    const cards = []; let answered = 0;
    pool.forEach((x, k) => { const c = problemCard(x, { num: k + 1, showCh: true, exam: true, onAnswer: () => { answered++; $('#pk-done').textContent = answered; } }); cards.push(c); area.appendChild(c); });
    typeset(area);
    let left = per * pool.length;
    const clock = $('#pk-clock'), tick = () => { if (!per) { clock.textContent = 'tanpa batas waktu'; return; } const m = Math.floor(left / 60), s = left % 60; clock.textContent = `sisa ${m}:${String(s).padStart(2, '0')}`; if (left <= 0) end(); left--; };
    tick(); if (per) timerId = setInterval(tick, 1000);
    const end = () => {
      clearInterval(timerId); let ok = 0;
      cards.forEach(c => { if (c._reveal) { c._reveal(); if (c._ok) ok++; } else { c.classList.add('skipped'); const id = c.dataset.id; record(id, false); const x = pool.find(q => q.id === id); const fb = c.querySelector('.prob-fb'); fb.hidden = false; fb.innerHTML = `<p class="verdict bad">Tidak dijawab.</p><div class="sol"><span class="eyebrow">Pembahasan</span><div>${x.p.sol}</div></div>`; typeset(fb); c.querySelectorAll('button,input').forEach(b => b.disabled = true); } });
      const pct = Math.round(ok / pool.length * 100);
      bar.innerHTML = `<span><b>Nilai: ${ok}/${pool.length}</b> (${pct}%)</span><span>${pct >= 80 ? 'Sangat baik. Naikkan tingkatnya!' : pct >= 50 ? 'Lumayan. Ulangi yang salah, lalu coba lagi.' : 'Kembali ke bab yang lemah dan mainkan labnya.'}</span><button class="btn small" type="button" id="pk-again">Paket baru</button>`;
      $('#pk-again').onclick = () => form.requestSubmit();
      bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    $('#pk-end').onclick = end;
    bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

function viewConst() {
  const K = [['Konstanta gravitasi', 'G', '6,674 × 10⁻¹¹ N m² kg⁻²'], ['Kecepatan cahaya', 'c', '2,998 × 10⁸ m s⁻¹'], ['Konstanta Planck', 'h', '6,626 × 10⁻³⁴ J s'], ['Konstanta Boltzmann', 'k', '1,381 × 10⁻²³ J K⁻¹'], ['Konstanta Stefan–Boltzmann', 'σ', '5,670 × 10⁻⁸ W m⁻² K⁻⁴'], ['Konstanta Wien', 'b', '2,898 × 10⁻³ m K'], ['Massa proton', 'mₚ', '1,673 × 10⁻²⁷ kg'], ['Massa atom hidrogen', 'm_H', '1,674 × 10⁻²⁷ kg'], ['Massa elektron', 'mₑ', '9,109 × 10⁻³¹ kg'], ['Muatan elementer', 'e', '1,602 × 10⁻¹⁹ C'], ['Konstanta Rydberg (H)', 'R_H', '1,097 × 10⁷ m⁻¹'], ['Penampang Thomson', 'σ_T', '6,652 × 10⁻²⁹ m²']];
  const A = [['Satuan astronomi', '1 AU', '1,496 × 10¹¹ m'], ['Parsec', '1 pc', '3,086 × 10¹⁶ m = 206 265 AU = 3,2616 tc'], ['Tahun cahaya', '1 tc', '9,461 × 10¹⁵ m'], ['Massa Matahari', 'M☉', '1,989 × 10³⁰ kg'], ['Jari-jari Matahari', 'R☉', '6,957 × 10⁸ m'], ['Luminositas Matahari', 'L☉', '3,828 × 10²⁶ W'], ['Suhu efektif Matahari', 'T☉', '5772 K'], ['Magnitudo mutlak Matahari', 'M_V / M_bol', '+4,83 / +4,74'], ['Magnitudo semu Matahari', 'm_V', '−26,74'], ['Konstanta Matahari', 'S', '1361 W m⁻²'], ['Massa Bumi', 'M⊕', '5,972 × 10²⁴ kg'], ['Jari-jari Bumi (rata-rata / ekuator)', 'R⊕', '6371 / 6378 km'], ['Massa Bulan', 'M☾', '7,342 × 10²² kg'], ['Jari-jari Bulan', 'R☾', '1737 km'], ['Jarak rata-rata Bumi–Bulan', '', '384 400 km'], ['Kemiringan ekliptika', 'ε', '23,44°'], ['Hari sideris', '', '23ʰ 56ᵐ 04ˢ = 86 164 s'], ['Tahun tropis / sideris', '', '365,2422 / 365,2564 hari'], ['Bulan sinodis / sideris', '', '29,5306 / 27,3217 hari'], ['Satu tahun (Julian)', '', '365,25 hari = 3,156 × 10⁷ s'], ['Konstanta Hubble', 'H₀', '≈ 70 km s⁻¹ Mpc⁻¹ (67–73)'], ['Suhu CMB', 'T₀', '2,725 K'], ['GM Matahari', 'GM☉', '1,327 × 10²⁰ m³ s⁻²'], ['GM Bumi', 'GM⊕', '3,986 × 10¹⁴ m³ s⁻²']];
  const P = [['Merkurius', '0,387', '0,241', '0,206', '0,055', '2440'], ['Venus', '0,723', '0,615', '0,007', '0,815', '6052'], ['Bumi', '1,000', '1,000', '0,017', '1,000', '6371'], ['Mars', '1,524', '1,881', '0,093', '0,107', '3390'], ['Jupiter', '5,203', '11,86', '0,049', '317,8', '69 911'], ['Saturnus', '9,537', '29,46', '0,057', '95,2', '58 232'], ['Uranus', '19,19', '84,01', '0,046', '14,5', '25 362'], ['Neptunus', '30,07', '164,8', '0,010', '17,1', '24 622']];
  const tb = (rows, h) => `<div class="tablewrap"><table class="ktable"><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i >= 1 ? ' class="mono"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  main.innerHTML = `<header class="chhead"><p class="eyebrow">Referensi</p><h1>Tabel konstanta & data</h1><p class="lead">Nilai-nilai yang biasa disediakan di lembar soal olimpiade. Gunakan nilai dari soal jika berbeda.</p></header>
   <section class="mat"><h2>Konstanta fisika</h2>${tb(K, ['Besaran', 'Simbol', 'Nilai'])}</section>
   <section class="mat"><h2>Data astronomi</h2>${tb(A, ['Besaran', 'Simbol', 'Nilai'])}</section>
   <section class="mat"><h2>Data planet</h2>${tb(P, ['Planet', 'a (AU)', 'P (tahun)', 'e', 'Massa (M⊕)', 'Jari-jari (km)'])}<aside class="refs"><p class="eyebrow">Sumber data</p><ul><li><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noopener">NASA Planetary Fact Sheet</a><span>Data planet (EN)</span></li><li><a href="https://physics.nist.gov/cuu/Constants/" target="_blank" rel="noopener">NIST CODATA constants</a><span>Konstanta fisika (EN)</span></li></ul></aside></section>`;
}

/* ---------- router ---------- */
function route() {
  const h = (location.hash || '#beranda').slice(1), ch = CH.find(c => c.id === h);
  clearInterval(timerId);
  let hans = false;
  if (ch) viewChapter(ch); else if (h === 'ulang') viewReview(); else if (h === 'paket') viewPaket(); else if (h === 'konstanta') viewConst(); else if (h.startsWith('hans') && OSN.viewHans && OSN.viewHans(h, main, { el, esc, typeset })) hans = true; else viewHome();
  setActive(ch ? ch.id : hans ? 'hans' : (['ulang', 'paket', 'konstanta'].includes(h) ? h : 'beranda'));
  document.title = (ch ? `Bab ${ch.no}: ${ch.short} · ` : hans ? 'Diktat Hans · ' : '') + 'OSN Astronomy Academy';
  window.scrollTo(0, 0); document.body.classList.remove('navopen');
  typeset(main);
}
buildNav();
window.addEventListener('hashchange', route);
route();

/* ---------- header controls ---------- */
$('#navBtn').onclick = () => document.body.classList.toggle('navopen');
const root = document.documentElement, themeBtn = $('#themeBtn');
const curTheme = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
try { const t = localStorage.getItem('cl-osn-theme'); if (t) root.dataset.theme = t; } catch (e) {}
const themeLabel = () => { themeBtn.textContent = curTheme() === 'dark' ? 'Tema terang' : 'Tema gelap'; };
themeBtn.onclick = () => { root.dataset.theme = curTheme() === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('cl-osn-theme', root.dataset.theme); } catch (e) {} themeLabel(); window.dispatchEvent(new Event('osn-theme')); };
themeLabel();
})();
