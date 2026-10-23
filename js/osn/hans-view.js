/* "Pembahasan Diktat Hans": companion pages for Hans Gunawan's olympiad module (2006).
   Problems are restated in our own words (same data, same numbering) with original worked solutions. */
(function () {
/* x^{..} and x_{..} written outside MathJax delimiters become <sup>/<sub>. */
const PR = s => s == null ? s : String(s).split(/(\\\(.*?\\\)|\\\[.*?\\\]|\$\$.*?\$\$)/s).map((x, i) => i % 2 ? x : x.replace(/\^\{([^{}\\]*)\}/g, '<sup>$1</sup>').replace(/_\{([^{}\\]*)\}/g, '<sub>$1</sub>').replace(/\^\(([^()]*)\)/g, '<sup>$1</sup>').replace(/\^([−-]?\d+(?:,\d+)?)/g, '<sup>$1</sup>')).join('');
const BOOK = 'Modul Persiapan Olimpiade Astronomi (edisi revisi), Hans Gunawan, 2006';
OSN.viewHans = function (h, main, ui) {
  const { el, esc, typeset } = ui, H = OSN.HANS.slice().sort((a, b) => a.no - b.no);
  const count = c => c.groups.reduce((a, g) => a + g.items.length, 0);
  const strip = cur => `<nav class="hstrip" aria-label="Bab diktat">${H.map(c => `<a href="#hans-${c.key || c.no}" class="${cur === c ? 'on' : ''}" title="${esc(c.title)}">${c.key ? c.short : c.no}</a>`).join('')}</nav>`;
  if (h === 'hans') {
    const tot = H.reduce((a, c) => a + count(c), 0);
    main.innerHTML = `<header class="chhead"><p class="eyebrow">Pembahasan buku</p><h1>Pembahasan Diktat Hans</h1>
      <p class="lead">Pendamping belajar untuk <i>${BOOK}</i>, diktat yang banyak dipakai generasi peserta OSN Astronomi. Setiap bab berisi ringkasan materi dengan penjelasan baru, visualisasi untuk konsep yang abstrak, dan pembahasan soal-soalnya.</p>
      <dl class="stats"><div><dt>Bab dibahas</dt><dd>${H.filter(c => !c.key).length}<small>/16</small></dd></div><div><dt>Soal dibahas</dt><dd>${tot}</dd></div><div><dt>Kumpulan soal</dt><dd>${H.filter(c => c.key).length}</dd></div><div><dt>Tahun buku</dt><dd>2006</dd></div></dl></header>
      <section class="block"><h2>Cara memakai</h2><ul class="hnotes">
        <li>Nomor soal mengikuti buku (R = review, E = esai, PG = pilihan ganda), jadi kamu bisa mengerjakan dari buku lalu mencocokkan di sini.</li>
        <li>Soal ditulis ulang dengan kata-kata sendiri, dengan data dan angka yang sama. Teks asli tidak disalin.</li>
        <li>Buku ini terbit 2006. Bila ada data yang sudah usang atau soal yang keliru, pembahasan memberi catatan bertanda <span class="tag state-bad">catatan</span>.</li>
        <li>Coba kerjakan dulu, baru buka pembahasan. Untuk pilihan ganda, klik opsi untuk langsung memeriksa.</li></ul></section>
      <section class="block"><h2>Daftar bab</h2><div class="chmap">${H.map(c => `<a class="chrow" href="#hans-${c.key || c.no}"><span class="chno">${c.key ? '★' : String(c.no).padStart(2, '0')}</span><span class="chtt"><b>${c.title}</b><small>${c.topics.map(t => t.h).slice(0, 4).join(' · ')}</small></span><span class="chmeta"><span class="mono">${count(c)} soal</span></span></a>`).join('')}</div>
      </section>`;
    return true;
  }
  const key = h.slice(5), c = H.find(x => String(x.key || x.no) === key);
  if (!c) return false;
  const idx = H.indexOf(c), prev = H[idx - 1], next = H[idx + 1];
  main.innerHTML = strip(c) + `<header class="chhead"><p class="eyebrow">Diktat Hans · ${c.key ? 'Kumpulan soal' : 'Bab ' + c.no}</p><h1>${c.title}</h1><p class="lead">${PR(c.summary)}</p>
    ${c.acad && c.acad.length ? `<p class="note">Materi terkait di Akademi: ${c.acad.map(id => { const ch = OSN.CH.find(x => x.id === id); return ch ? `<a href="#${ch.id}">Bab ${ch.no} · ${ch.short}</a>` : ''; }).join(' · ')}</p>` : ''}
    <nav class="toc" aria-label="Isi">${c.topics.length ? `<a href="#hans-${key}" data-jump="h-materi">Ringkasan materi</a>` : ''}${c.groups.map((g, i) => `<a href="#hans-${key}" data-jump="h-g${i}">${g.name} (${g.items.length})</a>`).join('')}</nav></header>`;
  if (c.topics.length) {
    const sec = el('section', 'mat'); sec.id = 'h-materi'; sec.innerHTML = '<h2>Ringkasan materi</h2>';
    c.topics.forEach(t => {
      const box = el('div', 'htopic', `<h3>${t.h}</h3><div class="prose">${PR(t.body)}</div>`);
      if (t.fig && OSN.FIG[t.fig]) box.appendChild(el('figure', 'fig', OSN.FIG[t.fig]()));
      if (t.lab && OSN.LAB[t.lab]) { const d = el('div'); box.appendChild(d); try { OSN.LAB[t.lab](d); } catch (e) { console.error(e); } }
      sec.appendChild(box);
    });
    main.appendChild(sec);
  }
  const tools = el('div', 'hfilter', `<label for="hq" class="sr">Cari soal</label><input id="hq" type="search" placeholder="Cari soal di bab ini (mis. paralaks, magnitudo)…"><button class="btn small ghost" type="button" id="hopen">Buka semua pembahasan</button>`);
  main.appendChild(tools);
  c.groups.forEach((g, gi) => {
    const sec = el('section', 'mat hgroup'); sec.id = 'h-g' + gi;
    sec.innerHTML = `<h2>${g.name}</h2>${g.intro ? `<p class="note">${g.intro}</p>` : ''}`;
    g.items.forEach(it => sec.appendChild(card(it, g, ui)));
    main.appendChild(sec);
  });
  main.appendChild(el('nav', 'pager', `${prev ? `<a href="#hans-${prev.key || prev.no}" class="btn ghost">← ${prev.key ? prev.short : 'Bab ' + prev.no}</a>` : '<a href="#hans" class="btn ghost">← Daftar bab</a>'}${next ? `<a href="#hans-${next.key || next.no}" class="btn">${next.key ? next.short : 'Bab ' + next.no + ': ' + next.title} →</a>` : '<a href="#hans" class="btn">Daftar bab →</a>'}`));
  main.appendChild(el('p', 'note hcredit', `Sumber soal: ${BOOK}. Soal ditulis ulang; pembahasan oleh Cosmic Ladder.`));
  main.querySelectorAll('[data-jump]').forEach(a => a.onclick = ev => { ev.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const q = main.querySelector('#hq'), norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  q.oninput = () => { const v = norm(q.value.trim()); main.querySelectorAll('.hcard').forEach(k => { k.hidden = v && !norm(k.dataset.text).includes(v); }); };
  main.querySelector('#hopen').onclick = () => { main.querySelectorAll('.hcard').forEach(k => k._open && k._open()); };
  return true;
};

function card(it, g, ui) {
  const { el, typeset } = ui, k = el('article', 'prob hcard');
  k.dataset.text = (it.n + ' ' + it.q.replace(/<[^>]+>/g, ' ') + ' ' + (it.o || []).join(' ')).slice(0, 2000);
  k.innerHTML = `<div class="prob-meta"><span class="tag hnum">${it.n}</span>${it.o ? '<span class="tag">Pilihan ganda</span>' : ''}${it.note ? '<span class="tag state-bad">catatan</span>' : ''}</div><div class="prob-q">${PR(it.q)}</div>`;
  const fb = el('div', 'prob-fb'); fb.hidden = true;
  let opened = false;
  const open = (pick) => {
    if (opened) return; opened = true;
    if (it.o) k.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === it.k) b.classList.add('ok'); else if (j === pick) b.classList.add('bad'); });
    fb.hidden = false;
    fb.innerHTML = (pick != null ? `<p class="verdict ${pick === it.k ? 'ok' : 'bad'}">${pick === it.k ? 'Benar!' : 'Belum tepat.'}</p>` : '') +
      `<div class="sol"><span class="eyebrow">Jawaban</span><div class="hans-a">${PR(it.a)}</div>${it.s ? `<span class="eyebrow">Pembahasan</span><div>${PR(it.s)}</div>` : ''}${it.note ? `<p class="hnote"><b>Catatan:</b> ${PR(it.note)}</p>` : ''}</div>`;
    if (btn) btn.remove();
    typeset(fb);
  };
  k._open = () => open(null);
  let btn = null;
  if (it.o) {
    const ol = el('div', 'opts');
    it.o.forEach((o, j) => { const b = el('button', 'opt', `<span class="ol">${'ABCDE'[j]}</span><span>${PR(o)}</span>`); b.type = 'button'; b.onclick = () => open(j); ol.appendChild(b); });
    k.appendChild(ol);
  }
  btn = el('button', 'btn small' + (it.o ? ' ghost' : ''), it.o ? 'Lihat jawaban saja' : 'Lihat pembahasan'); btn.type = 'button'; btn.onclick = () => open(null);
  const row = el('div', 'row'); row.appendChild(btn); k.appendChild(row); k.appendChild(fb);
  return k;
}
})();
