/* OSN Astronomy Academy: shared namespace. Content files call OSN.add(chapter). */
window.OSN = (function () {
  const CH = [];
  const FIG = {};
  const LAB = {};
  /* reference link helpers */
  const L = {
    os: (slug, t) => [`OpenStax Astronomy 2e · ${t}`, 'https://openstax.org/books/astronomy-2e/pages/' + slug, 'Buku teks gratis (EN)'],
    naap: (p, t) => [`NAAP Lab · ${t}`, 'https://astro.unl.edu/naap/' + p, 'Simulasi interaktif (EN)'],
    wen: (p, t) => [`Wikipedia · ${t}`, 'https://en.wikipedia.org/wiki/' + p, 'Ensiklopedia (EN)'],
    wid: (p, t) => [`Wikipedia · ${t}`, 'https://id.wikipedia.org/wiki/' + p, 'Ensiklopedia (ID)'],
    web: (t, u, k) => [t, u, k || 'Situs web']
  };
  return { CH, FIG, LAB, L, R: String.raw, add: c => CH.push(c) };
})();
