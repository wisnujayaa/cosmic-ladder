/* Chapters 9–13: stars, binaries & exoplanets, galaxies & ISM, cosmology, instruments & observing */
(function () {
const { R, L, add } = OSN;

/* ============================== BAB 9 ============================== */
add({
 id: 'bintang', no: 9, title: 'Sifat & Evolusi Bintang', short: 'Bintang', lv: 'K · P · N',
 lead: R`Semua bintang pada dasarnya adalah bola gas yang menyeimbangkan dua hal: gravitasi yang ingin meremas, dan tekanan panas dari fusi yang ingin mengembang. Massa awal hampir sepenuhnya menentukan nasibnya: seberapa terang, seberapa lama hidup, dan bagaimana ia mati. Diagram HR adalah peta untuk semua itu.`,
 sections: [
  { id: 'spektral', h: 'Klasifikasi spektrum: OBAFGKM',
    body: R`<p>Annie Jump Cannon dan tim Harvard (awal 1900-an) mengurutkan ratusan ribu spektrum bintang. Cecilia Payne (1925) kemudian menunjukkan bahwa urutan itu adalah urutan <b>suhu</b>, bukan komposisi: O (>30 000 K, biru), B, A (~10 000 K), F, G (Matahari, 5800 K), K, M (<3500 K, merah). Tiap kelas dibagi 0–9: Matahari <b>G2</b>.</p>
    <p>Kelas luminositas MK menambahkan ukuran: I (maharaksasa), II, III (raksasa), IV, V (deret utama/katai). Matahari = <b>G2V</b>, Betelgeuse = M1–M2 Ia, Sirius A = A1V. Garis yang dominan berubah sesuai suhu: helium terionisasi di O, hidrogen Balmer di A, logam terionisasi di F–G, molekul (TiO) di M.</p>`,
    refs: [L.wid('Klasifikasi_bintang', 'Klasifikasi bintang'), L.os('17-3-the-spectra-of-stars-and-brown-dwarfs', '17.3 The Spectra of Stars')] },
  { id: 'hr', h: 'Diagram Hertzsprung–Russell',
    body: R`<p>Plot luminositas (atau magnitudo mutlak) terhadap suhu (atau kelas spektrum, atau B − V), dengan suhu <b>menurun ke kanan</b>. Bintang tidak tersebar acak: ~90% berada di pita diagonal <b>deret utama</b> (bintang yang membakar hidrogen di inti). Di kanan atas ada <b>raksasa</b> dan <b>maharaksasa</b> (dingin tapi terang → sangat besar); di kiri bawah <b>katai putih</b> (panas tapi redup → sangat kecil).</p>
    <p>Karena \(L = 4\pi R^2\sigma T^4\), garis-garis jari-jari konstan memotong diagram secara diagonal. Posisi bintang di diagram langsung memberi ukurannya.</p>
    <p>Di lab, ubah massa bintang deret utama dan lihat letaknya, jari-jari, dan umurnya berubah.</p>`,
    lab: 'hr',
    refs: [L.os('18-4-the-h-r-diagram', '18.4 The H–R Diagram'), L.wid('Diagram_Hertzsprung-Russell', 'Diagram Hertzsprung-Russell'), L.naap('hr/hr.html', 'Hertzsprung-Russell Diagram')] },
  { id: 'massa', h: 'Hubungan massa–luminositas & umur deret utama',
    body: R`<p>Untuk bintang deret utama (kira-kira 0,5–20 M☉), luminositas naik tajam dengan massa:</p>
    \[ \frac{L}{L_\odot} \approx \left(\frac{M}{M_\odot}\right)^{3{,}5} \]
    <p>Bahan bakar ∝ M, laju konsumsi ∝ L, jadi umur deret utama:</p>
    \[ t \approx t_\odot\left(\frac{M}{M_\odot}\right)^{-2{,}5}, \quad t_\odot \approx 10^{10}\ \text{tahun} \]
    <p>Bintang 10 M☉ hidup hanya ~30 juta tahun; katai merah 0,5 M☉ hidup ~57 miliar tahun, lebih lama dari umur alam semesta. Paradoksnya: bintang dengan bahan bakar lebih banyak justru mati lebih cepat, karena membakarnya jauh lebih boros.</p>`,
    refs: [L.wen('Mass%E2%80%93luminosity_relation', 'Mass–luminosity relation'), L.os('18-2-measuring-stellar-masses', '18.2 Measuring Stellar Masses')] },
  { id: 'dalam', h: 'Kesetimbangan hidrostatik & bagian dalam bintang',
    body: R`<p>Setiap lapisan bintang menahan berat lapisan di atasnya dengan tekanan dari bawah: <b>kesetimbangan hidrostatik</b>, \(dP/dr = -G M(r)\rho/r^2\). Dari analisis dimensi kita bisa memperkirakan tekanan pusat \(P_c \sim GM^2/R^4\) dan suhu pusat dari teorema virial:</p>
    \[ kT_c \sim \frac{G M m_p}{R} \]
    <p>Untuk Matahari ini memberi ~2 × 10⁷ K, dekat dengan nilai model (1,57 × 10⁷ K) dan cukup untuk fusi hidrogen. Energi merambat keluar lewat <b>radiasi</b> (di daerah yang tidak terlalu buram) atau <b>konveksi</b> (di daerah buram atau dengan gradien suhu curam). Bintang massa rendah punya selubung konvektif; bintang masif punya inti konvektif.</p>`,
    refs: [L.wen('Hydrostatic_equilibrium', 'Hydrostatic equilibrium'), L.wen('Virial_theorem', 'Virial theorem')] },
  { id: 'evolusi', h: 'Evolusi & akhir hidup bintang',
    body: R`<p><b>Kelahiran:</b> awan molekul runtuh → protobintang → fusi hidrogen dimulai → deret utama. <b>Setelah hidrogen inti habis:</b> inti menyusut dan memanas, selubung mengembang → <b>raksasa merah</b>; helium kemudian berfusi menjadi karbon.</p>
    <p><b>Bintang massa rendah</b> (< ~8 M☉ awal): melepaskan selubung sebagai <b>nebula planeter</b>, intinya menjadi <b>katai putih</b> (seukuran Bumi, ditopang tekanan degenerasi elektron, maksimum 1,4 M☉ = batas Chandrasekhar).</p>
    <p><b>Bintang masif:</b> fusi berlanjut sampai besi, inti runtuh → <b>supernova tipe II</b>, menyisakan <b>bintang neutron</b> (~20 km, 1,4–2 M☉) atau <b>lubang hitam</b> jika terlalu masif. Jari-jari cakrawala peristiwa \(R_s = 2GM/c^2\): ~3 km per massa Matahari.</p>`,
    refs: [L.os('22-1-evolution-from-the-main-sequence-to-red-giants', '22.1 Evolution from the Main Sequence to Red Giants'), L.wen('Stellar_evolution', 'Stellar evolution'), L.wen('Chandrasekhar_limit', 'Chandrasekhar limit')] },
  { id: 'variabel', h: 'Bintang variabel: lilin standar',
    body: R`<p><b>Cepheid</b> adalah raksasa kuning yang berdenyut secara teratur. Henrietta Leavitt (1912) menemukan bahwa periode denyutnya sebanding dengan luminositasnya: <b>relasi periode–luminositas</b>. Ukur periodenya → dapat M → bandingkan dengan m → jarak. Dengan Cepheid, Hubble (1924) membuktikan Andromeda adalah galaksi lain.</p>
    <p>Mekanismenya ("katup κ"): helium terionisasi di lapisan tertentu menjadi lebih buram saat ditekan, memerangkap panas, lalu mendorong lapisan keluar, dan siklus berulang. <b>RR Lyrae</b> (periode < 1 hari) punya magnitudo mutlak hampir sama (\(M_V \approx +0{,}6\)), berguna untuk mengukur jarak gugus bola.</p>`,
    refs: [L.os('19-3-variable-stars-one-key-to-cosmic-distances', '19.3 Variable Stars: One Key to Cosmic Distances'), L.wen('Cepheid_variable', 'Cepheid variable')] }
 ],
 formulas: [['Massa–luminositas', R`L \propto M^{3{,}5}`], ['Umur deret utama', R`t \approx 10^{10}(M/M_\odot)^{-2{,}5}\ \text{th}`], ['Jari-jari dari L, T', R`R/R_\odot = \sqrt{L/L_\odot}(T_\odot/T)^2`], ['Suhu pusat (virial)', R`kT_c \sim GMm_p/R`], ['Schwarzschild', R`R_s = 2GM/c^2`]],
 examples: [
  { q: R`Bintang raksasa merah: T = 3500 K, L = 1000 L☉. Berapa jari-jarinya, dan apakah orbit Bumi muat di dalamnya?`,
    sol: R`\(R = \sqrt{1000}\,(5772/3500)^2 = 31{,}6 \times 2{,}72 = 86\,R_\odot\) ≈ 0,40 AU. Orbit Merkurius (0,39 AU) tertelan, Bumi belum. Raksasa merah yang lebih besar (seperti Matahari di puncak fase raksasanya) bisa mencapai ~1 AU.` },
  { q: R`Kenapa katai putih yang lebih masif justru lebih kecil?`,
    sol: R`Katai putih ditopang tekanan degenerasi elektron, yang tidak bergantung suhu. Tambah massa → gravitasi lebih kuat → elektron harus dipadatkan lebih rapat untuk menahan → jari-jari mengecil (\(R \propto M^{-1/3}\)). Di batas 1,4 M☉, tekanan itu tak cukup lagi.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Kelas spektrum dan luminositas Matahari adalah…`, o: ['A0V', 'G2V', 'G2III', 'K5V'], a: 1, sol: R`Matahari adalah bintang deret utama (V) kelas G2, suhu efektif ~5800 K.` },
  { t: 'mc', lv: 'K', q: R`Urutan kelas spektrum dari terpanas ke terdingin adalah…`, o: ['A B F G K M O', 'O B A F G K M', 'M K G F A B O', 'O A B F K G M'], a: 1, sol: R`OBAFGKM (jembatan keledai klasik: "Oh Be A Fine Girl/Guy, Kiss Me").` },
  { t: 'num', lv: 'P', q: R`Dengan \(t \propto M^{-2{,}5}\) dan umur Matahari 10 miliar tahun, berapa umur deret utama bintang 10 M☉ (juta tahun)?`, a: 31.6, tol: 0.01, unit: 'juta th', v: () => 1e4 * 10 ** -2.5,
    sol: R`\(t = 10^{10} \times 10^{-2{,}5} = 3{,}16\times10^7\) tahun = 31,6 juta tahun. Bintang seperti ini sudah mati sebelum sempat meninggalkan awan kelahirannya jauh-jauh.` },
  { t: 'num', lv: 'P', q: R`Dengan \(L \propto M^{3{,}5}\), berapa luminositas bintang deret utama 2 M☉ (L☉)?`, a: 11.3, tol: 0.01, unit: 'L☉', v: () => 2 ** 3.5,
    sol: R`\(L = 2^{3{,}5} = 11{,}3\,L_\odot\).` },
  { t: 'num', lv: 'P', q: R`Berapa jari-jari Schwarzschild lubang hitam 10 M☉ (km)?`, a: 29.5, tol: 0.01, unit: 'km', v: () => 2 * 6.674e-11 * 10 * 1.989e30 / 2.998e8 ** 2 / 1000,
    sol: R`\(R_s = 2GM/c^2 = 2 \times 6{,}674\times10^{-11} \times 1{,}989\times10^{31}/(2{,}998\times10^8)^2 = 29{,}5\) km.` },
  { t: 'mc', lv: 'K', q: R`Di diagram HR, katai putih terletak di…`, o: ['Kanan atas', 'Kiri atas', 'Kiri bawah', 'Kanan bawah'], a: 2, sol: R`Panas (kiri) tapi redup (bawah), karena sangat kecil.` },
  { t: 'num', lv: 'N', q: R`Relasi Cepheid: \(M_V = -2{,}43(\log P - 1) - 4{,}05\) (P dalam hari). Sebuah Cepheid berperiode 10 hari punya magnitudo rata-rata V = 12,0 (abaikan ekstingsi). Berapa jaraknya (pc)?`, a: 16200, tol: 0.02, unit: 'pc', v: () => 10 ** ((12 + 4.05 + 5) / 5),
    sol: R`log P = 1 → \(M_V = -4{,}05\). \(5\log d = 12{,}0 + 4{,}05 + 5 = 21{,}05\) → d = 10^{4,21} = 16 200 pc ≈ 16 kpc.` },
  { t: 'num', lv: 'P', q: R`Perkirakan suhu pusat Matahari dengan \(T \sim GMm_p/(kR)\) (K).`, a: 2.3e7, tol: 0.05, unit: 'K', v: () => 6.674e-11 * 1.989e30 * 1.673e-27 / (1.381e-23 * 6.957e8),
    sol: R`\(T = \dfrac{6{,}674\times10^{-11} \times 1{,}989\times10^{30} \times 1{,}673\times10^{-27}}{1{,}381\times10^{-23} \times 6{,}957\times10^8} = 2{,}3\times10^7\) K. Model rinci memberi 1,57 × 10⁷ K: estimasi orde besaran yang sangat baik.` },
  { t: 'mc', lv: 'K', q: R`Sisa akhir bintang bermassa awal 20 M☉ kemungkinan besar adalah…`, o: ['Katai putih', 'Katai coklat', 'Bintang neutron atau lubang hitam', 'Nebula planeter saja'], a: 2, sol: R`Bintang > ~8 M☉ berakhir dengan supernova runtuh-inti yang menyisakan bintang neutron atau, untuk inti sangat masif, lubang hitam.` },
  { t: 'essay', lv: 'N', q: R`Turunkan \(t \propto M^{-2{,}5}\) dari \(L \propto M^{3{,}5}\). Lalu tunjukkan bahwa belum ada katai merah 0,5 M☉ yang pernah meninggalkan deret utama di alam semesta kita.`,
    sol: R`Bahan bakar yang tersedia sebanding dengan massa (E ∝ M), dan laju pemakaiannya adalah luminositas. Jadi \(t \propto E/L \propto M/M^{3{,}5} = M^{-2{,}5}\). Untuk 0,5 M☉: \(t = 10^{10} \times 0{,}5^{-2{,}5} = 5{,}7\times10^{10}\) tahun, jauh di atas umur alam semesta (1,38 × 10¹⁰ tahun). (Kenyataannya katai merah sepenuhnya konvektif sehingga bisa membakar hampir semua hidrogennya, dan umurnya bahkan triliunan tahun.)` }
 ],
 think: ['Kenapa tidak ada bintang dengan massa 1000 M☉, atau 0,01 M☉?', 'Kalau kamu melihat gugus bintang yang deret utamanya "terpotong" di kelas F, apa yang bisa kamu simpulkan tentang umurnya?']
});

/* ============================== BAB 10 ============================== */
add({
 id: 'biner', no: 10, title: 'Bintang Ganda & Eksoplanet', short: 'Biner & eksoplanet', lv: 'P · N',
 lead: R`Lebih dari separuh bintang mirip Matahari punya pasangan. Bagi astronom ini kabar baik: bintang ganda adalah satu-satunya cara langsung untuk menimbang bintang. Teknik yang sama (goyangan dan gerhana) kini dipakai untuk menemukan ribuan planet di bintang lain.`,
 sections: [
  { id: 'jenis', h: 'Jenis-jenis bintang ganda',
    body: R`<ul><li><b>Visual:</b> kedua bintang terlihat terpisah di teleskop; orbitnya bisa digambar langsung (contoh Sirius A–B, periode 50 tahun).</li>
    <li><b>Astrometrik:</b> hanya satu bintang terlihat, tapi jalurnya bergelombang karena ditarik pasangan tak terlihat (Sirius B ditemukan begini oleh Bessel, 1844).</li>
    <li><b>Spektroskopik:</b> terlalu dekat untuk dipisahkan, tapi garis spektrumnya bergeser bolak-balik akibat Doppler.</li>
    <li><b>Gerhana:</b> bidang orbitnya hampir sejajar garis pandang, sehingga keduanya bergantian saling menutupi dan kecerahan total turun berkala (Algol).</li></ul>`,
    refs: [L.os('18-2-measuring-stellar-masses', '18.2 Measuring Stellar Masses'), L.wen('Binary_star', 'Binary star')] },
  { id: 'visual', h: 'Menimbang bintang dari orbit visual',
    body: R`<p>Kepler III dalam satuan tahun, AU, dan massa Matahari:</p>
    \[ M_1 + M_2 = \frac{a^3}{P^2}, \qquad a\,[\text{AU}] = \frac{a''}{p''} \]
    <p>Sudut setengah sumbu panjang \(a''\) diubah menjadi AU memakai paralaks \(p''\). Masing-masing bintang mengorbit pusat massa dengan \(a_1, a_2\) (\(a = a_1 + a_2\)), dan <b>perbandingan massa</b> \(M_1/M_2 = a_2/a_1\): bintang yang lebih berat bergerak di lingkaran lebih kecil, seperti orang dewasa dan anak di jungkat-jungkit.</p>`,
    refs: [L.os('18-2-measuring-stellar-masses', '18.2 Measuring Stellar Masses'), L.wen('Binary_star#Visual_binaries', 'Visual binaries')] },
  { id: 'spektroskopik', h: 'Kurva kecepatan radial',
    body: R`<p>Untuk orbit lingkaran, kecepatan radial tiap bintang berubah sinusoidal dengan amplitudo \(K_1\) dan \(K_2\) di sekitar kecepatan pusat massa \(\gamma\). Karena momentum seimbang: \(M_1/M_2 = K_2/K_1\).</p>
    <p>Jika orbit dilihat tepat dari samping (\(i = 90^\circ\)), jari-jari orbit \(a = P(K_1 + K_2)/2\pi\), dan massa total</p>
    \[ M_1 + M_2 = \frac{P(K_1+K_2)^3}{2\pi G} \]
    <p>Umumnya inklinasi tidak diketahui, sehingga yang didapat \((M_1+M_2)\sin^3 i\), batas bawah massa. Itulah kenapa biner yang juga <b>bergerhana</b> sangat berharga: gerhana memastikan \(i \approx 90^\circ\).</p>`,
    fig: 'rv',
    refs: [L.wen('Binary_star#Spectroscopic_binaries', 'Spectroscopic binaries'), L.naap('ebs/ebs.html', 'Eclipsing Binary Stars')] },
  { id: 'gerhana', h: 'Kurva cahaya biner gerhana',
    body: R`<p>Saat bintang kecil lewat di depan/belakang bintang besar, terlihat dua minimum per periode: <b>primer</b> (lebih dalam, saat bintang yang lebih panas tertutup) dan <b>sekunder</b>. Kedalaman minimum memberi rasio suhu (luminositas per luas).</p>
    <p>Durasi fase gerhana memberi jari-jari. Jika kecepatan relatif \(v\) diketahui (dari kurva kecepatan radial), dan \(t_1\) = kontak pertama, \(t_2\) = gerhana penuh dimulai, \(t_3\) = gerhana penuh berakhir:</p>
    \[ R_\text{kecil} = \frac{v(t_2 - t_1)}{2}, \qquad R_\text{besar} = \frac{v(t_3 - t_1)}{2} \]`,
    lab: 'transit',
    refs: [L.naap('ebs/ebs.html', 'Eclipsing Binary Stars'), L.wen('Eclipsing_binary', 'Eclipsing binary')] },
  { id: 'eksoplanet', h: 'Eksoplanet: transit, kecepatan radial, zona layak huni',
    body: R`<p><b>Metode transit</b>: planet melintas di depan bintang, meredupkan dengan kedalaman \(\delta = (R_p/R_*)^2\). Jupiter di depan Matahari: 1%; Bumi: 84 ppm (0,0084%). Memberi <b>jari-jari</b> planet. Wahana Kepler dan TESS menemukan ribuan planet dengan cara ini.</p>
    <p><b>Metode kecepatan radial</b>: bintang bergoyang di sekitar barisenter, \(M_* v_* = m_p v_p\). Jupiter membuat Matahari bergoyang 12,5 m/s; Bumi hanya 9 cm/s. Memberi <b>massa minimum</b> \(m_p\sin i\). Dengan keduanya, kita dapat massa jenis: berbatu atau gas?</p>
    <p><b>Zona layak huni</b>: jarak di mana air bisa cair. Fluks setara Bumi tercapai pada \(d \approx \sqrt{L/L_\odot}\) AU. Di sekitar katai merah, zona ini sangat dekat bintang (planet cenderung terkunci pasang).</p>`,
    refs: [L.os('21-4-planets-beyond-the-solar-system-search-and-discovery', '21.4 Planets beyond the Solar System'), L.wid('Planet_ekstrasurya', 'Planet luar surya'), L.naap('esp/esp.html', 'Extrasolar Planets')] }
 ],
 formulas: [['Massa biner visual', R`M_1+M_2 = a^3/P^2`], ['Rasio massa', R`M_1/M_2 = a_2/a_1 = K_2/K_1`], ['Massa biner spektroskopik', R`M_1+M_2 = \frac{P(K_1+K_2)^3}{2\pi G\sin^3 i}`], ['Kedalaman transit', R`\delta = (R_p/R_*)^2`], ['Zona layak huni', R`d \approx \sqrt{L/L_\odot}\ \text{AU}`]],
 examples: [
  { q: R`Kenapa metode transit hanya menemukan sebagian kecil planet yang ada?`,
    sol: R`Transit hanya terlihat jika orbit hampir sebidang dengan garis pandang. Peluangnya ≈ \(R_*/a\): untuk planet seperti Bumi di sekitar bintang seperti Matahari, \(R_\odot/1\,\text{AU} = 0{,}5\%\). Dari 200 sistem seperti tata surya, rata-rata hanya satu yang memperlihatkan transit "Bumi".` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Biner spektroskopik terdeteksi melalui…`, o: ['Pemisahan visual di teleskop', 'Pergeseran Doppler periodik garis spektrum', 'Perubahan warna permanen', 'Paralaks'], a: 1, sol: R`Garis spektrum bergeser bolak-balik saat bintang mendekat dan menjauh di orbitnya.` },
  { t: 'num', lv: 'P', q: R`Sistem Sirius: setengah sumbu panjang sudut 7,50″, paralaks 0,379″, periode 50,1 tahun. Berapa massa totalnya (M☉)?`, a: 3.09, tol: 0.02, unit: 'M☉', v: () => (7.5 / 0.379) ** 3 / 50.1 ** 2,
    sol: R`\(a = 7{,}50/0{,}379 = 19{,}8\) AU. \(M = 19{,}8^3/50{,}1^2 = 7750/2510 = 3{,}09\,M_\odot\) (Sirius A ≈ 2,06, Sirius B ≈ 1,02).` },
  { t: 'mc', lv: 'P', q: R`Dalam sebuah biner, bintang A berjarak 6,6 AU dan bintang B 13,2 AU dari pusat massa. Perbandingan massa \(M_A/M_B\) adalah…`, o: ['1/2', '1', '2', '4'], a: 2, sol: R`\(M_A/M_B = a_B/a_A = 13{,}2/6{,}6 = 2\). Bintang yang lebih berat lebih dekat ke pusat massa.` },
  { t: 'num', lv: 'P', q: R`Berapa kedalaman transit Bumi di depan Matahari, dalam ppm? (R⊕ = 6371 km, R☉ = 695 700 km)`, a: 84, tol: 0.02, unit: 'ppm', v: () => (6371 / 695700) ** 2 * 1e6,
    sol: R`\(\delta = (6371/695\,700)^2 = 8{,}4\times10^{-5}\) = 84 ppm. Mengukur penurunan 0,008% butuh fotometri dari luar angkasa.` },
  { t: 'num', lv: 'P', q: R`Transit sedalam 1,0% teramati pada bintang berjari-jari 0,8 R☉. Berapa jari-jari planet dalam jari-jari Jupiter? (R☉ = 9,95 R_J)`, a: 0.80, tol: 0.02, unit: 'R_J', v: () => 0.1 * 0.8 * 695700 / 69911,
    sol: R`\(R_p/R_* = \sqrt{0{,}01} = 0{,}1\) → \(R_p = 0{,}08\,R_\odot = 0{,}08 \times 9{,}95 = 0{,}80\,R_J\).` },
  { t: 'num', lv: 'P', q: R`Jupiter mengorbit dengan kecepatan 13,06 km/s dan massanya M☉/1047,6. Berapa amplitudo goyangan Matahari (m/s)?`, a: 12.5, tol: 0.01, unit: 'm/s', v: () => 13.06e3 / 1047.6,
    sol: R`Momentum: \(M_\odot v_\odot = m_J v_J\) → \(v_\odot = 13\,060/1047{,}6 = 12{,}5\) m/s, kira-kira kecepatan lari cepat. Spektrograf modern bisa mengukur < 1 m/s.` },
  { t: 'num', lv: 'N', q: R`Biner spektroskopik bergerhana (i ≈ 90°), orbit lingkaran: P = 10 hari, K₁ = 50 km/s, K₂ = 100 km/s. Berapa massa total sistem (M☉)?`, a: 3.50, tol: 0.02, unit: 'M☉', v: () => 864000 * 1.5e5 ** 3 / (2 * Math.PI * 6.674e-11) / 1.989e30,
    sol: R`\(M = \dfrac{P(K_1+K_2)^3}{2\pi G} = \dfrac{864\,000 \times (1{,}5\times10^5)^3}{2\pi \times 6{,}674\times10^{-11}} = 6{,}95\times10^{30}\) kg = 3,50 M☉. Rasio \(M_1/M_2 = K_2/K_1 = 2\) → M₁ = 2,33 M☉, M₂ = 1,17 M☉.` },
  { t: 'mc', lv: 'K', q: R`Bintang dengan luminositas 4 L☉. Planet yang menerima fluks sama seperti Bumi harus berjarak…`, o: ['0,5 AU', '1 AU', '2 AU', '4 AU'], a: 2, sol: R`Fluks ∝ L/d²; sama dengan Bumi jika \(d = \sqrt{4} = 2\) AU.` },
  { t: 'mc', lv: 'P', q: R`Gabungan metode transit dan kecepatan radial memungkinkan kita menghitung…`, o: ['Umur planet', 'Massa jenis rata-rata planet', 'Warna planet', 'Jumlah bulan planet'], a: 1, sol: R`Transit → jari-jari (dan memastikan i ≈ 90°), kecepatan radial → massa. Massa ÷ volume = massa jenis, petunjuk apakah planet berbatu, air, atau gas.` },
  { t: 'essay', lv: 'N', q: R`Biner gerhana dilihat tepat dari samping. Kecepatan relatif kedua bintang 200 km/s. Dari kurva cahaya: dari kontak pertama ke awal gerhana penuh 1,5 jam; dari kontak pertama ke akhir gerhana penuh 6,0 jam. Tentukan jari-jari kedua bintang (R☉) dan jelaskan geometrinya.`,
    sol: R`Antara kontak pertama dan awal gerhana penuh, bintang kecil bergerak sejauh diameternya sendiri: \(2R_k = 200 \times 5400 = 1{,}08\times10^6\) km → \(R_k = 5{,}4\times10^5\) km = 0,78 R☉. Antara kontak pertama dan akhir gerhana penuh, tepi depan bintang kecil bergerak dari tepi dekat ke tepi jauh bintang besar: \(2R_b = 200 \times 21\,600 = 4{,}32\times10^6\) km → \(R_b = 2{,}16\times10^6\) km = 3,1 R☉. (Gerhana penuh hanya terjadi jika bintang kecil sepenuhnya tertutup/di depan piringan besar, sehingga kurvanya punya dasar datar.)` }
 ],
 think: ['Kenapa planet raksasa yang mengorbit dekat bintang ("Jupiter panas") paling dulu ditemukan, padahal jarang?', 'Bisakah alien di bintang lain menemukan Bumi dengan metode transit? Dari arah mana saja?']
});

/* ============================== BAB 11 ============================== */
add({
 id: 'galaksi', no: 11, title: 'Bima Sakti, Medium Antarbintang & Galaksi', short: 'Galaksi', lv: 'P · N',
 lead: R`Matahari hanyalah satu dari ratusan miliar bintang di Bima Sakti. Bab ini membahas bagaimana kita memetakan galaksi dari dalam, bagaimana rotasinya membongkar adanya materi gelap, apa yang mengisi ruang antarbintang, dan bagaimana galaksi lain diklasifikasikan.`,
 sections: [
  { id: 'struktur', h: 'Struktur Bima Sakti',
    body: R`<p>Komponen utama: <b>piringan</b> tipis (~1000 tc tebal, ~100 000 tc lebar) berisi bintang muda, gas, debu, dan lengan spiral; <b>tonjolan pusat</b> berpalang; dan <b>halo</b> bulat berisi bintang tua serta ~150 <b>gugus bola</b>. Di pusatnya ada lubang hitam Sagittarius A* (~4 juta M☉).</p>
    <p>Matahari berada ~8,2 kpc (~26 700 tc) dari pusat. Harlow Shapley (1918) pertama kali menyadari kita tidak di pusat: gugus bola berpusat di arah Sagittarius, bukan di sekitar Matahari.</p>`,
    refs: [L.os('25-1-the-architecture-of-the-galaxy', '25.1 The Architecture of the Galaxy'), L.web('NASA · Milky Way', 'https://science.nasa.gov/resource/the-milky-way-galaxy/', 'Situs NASA (EN)')] },
  { id: 'rotasi', h: 'Kurva rotasi & materi gelap',
    body: R`<p>Untuk bintang di orbit lingkaran berjari-jari \(r\), gravitasi massa di dalamnya menyediakan gaya sentripetal: \(v^2/r = GM(r)/r^2\), sehingga</p>
    \[ M(r) = \frac{v^2 r}{G} \]
    <p>Matahari (v ≈ 230 km/s, r = 8,2 kpc) → M ≈ 10¹¹ M☉ di dalam orbitnya. Jika sebagian besar massa adalah bintang yang terpusat, kecepatan di luar harusnya turun seperti \(v \propto r^{-1/2}\) (Keplerian). Kenyataannya kurva rotasi <b>datar</b> jauh di luar piringan bintang: \(v\) ≈ konstan → \(M \propto r\). Ada massa tak terlihat yang jauh lebih besar dari bintang dan gas: <b>halo materi gelap</b> (Vera Rubin, 1970-an).</p>`,
    lab: 'rotasi',
    refs: [L.os('25-3-the-mass-of-the-galaxy', '25.3 The Mass of the Galaxy'), L.wen('Galaxy_rotation_curve', 'Galaxy rotation curve'), L.wid('Materi_gelap', 'Materi gelap')] },
  { id: 'ism', h: 'Medium antarbintang & garis 21 cm',
    body: R`<p>Ruang antarbintang tidak kosong: ~1 atom per cm³ rata-rata, ditambah debu (~1% massa). Bentuknya: <b>awan HI</b> (hidrogen netral, dingin), <b>daerah HII</b> (hidrogen terionisasi oleh bintang O–B, berpendar merah Hα), <b>awan molekul</b> (H₂, CO; tempat kelahiran bintang), dan gas korona sangat panas dari supernova.</p>
    <p>Hidrogen netral memancarkan <b>garis 21 cm</b> (1420 MHz) ketika spin elektronnya membalik. Transisinya sangat jarang per atom, tapi hidrogen sangat banyak, dan gelombang radio menembus debu. Pergeseran Doppler garis ini memetakan lengan spiral dan kurva rotasi Bima Sakti.</p>
    <p><b>Debu</b> meredupkan dan memerahkan bintang (Bab 8), dan dari arah pusat galaksi bisa meredupkan cahaya tampak ~30 magnitudo.</p>`,
    refs: [L.wen('Interstellar_medium', 'Interstellar medium'), L.wen('Hydrogen_line', 'Hydrogen line (21 cm)')] },
  { id: 'gugus', h: 'Gugus bintang & umur dari titik belok',
    body: R`<p><b>Gugus terbuka</b> (ratusan–ribuan bintang muda di piringan, contoh Pleiades) dan <b>gugus bola</b> (ratusan ribu bintang tua di halo, contoh Omega Centauri). Semua anggota gugus lahir bersamaan pada jarak yang sama, jadi diagram HR-nya sangat bersih.</p>
    <p>Bintang masif meninggalkan deret utama lebih dulu, sehingga deret utama gugus tua "terkelupas" dari atas. Massa bintang di <b>titik belok</b> (turn-off) memberi umur: \(t \approx 10^{10}(M_\text{TO}/M_\odot)^{-2{,}5}\) tahun. Gugus bola punya titik belok ~0,8–0,9 M☉ → umur 12–13 miliar tahun, termasuk benda tertua di galaksi.</p>`,
    refs: [L.wen('Star_cluster', 'Star cluster'), L.wen('Turnoff_point', 'Turnoff point')] },
  { id: 'jenisgalaksi', h: 'Klasifikasi galaksi & inti galaksi aktif',
    body: R`<p>Diagram garpu tala Hubble: <b>elips</b> E0 (bulat) sampai E7 (lonjong), bintang tua, sedikit gas; <b>spiral</b> Sa–Sc (tonjolan besar → kecil, lengan rapat → longgar) dan <b>spiral berpalang</b> SBa–SBc; <b>lentikular</b> S0; dan <b>tak beraturan</b>. Bima Sakti diperkirakan SBbc.</p>
    <p><b>Inti galaksi aktif</b> (AGN) dan <b>kuasar</b> ditenagai materi yang jatuh ke lubang hitam supermasif. Batas atas luminositas akresi adalah <b>luminositas Eddington</b>, saat tekanan radiasi menyamai gravitasi:</p>
    \[ L_\text{Edd} = \frac{4\pi G M m_p c}{\sigma_T} \approx 3{,}3\times10^4\left(\frac{M}{M_\odot}\right) L_\odot \]`,
    refs: [L.os('26-2-types-of-galaxies', '26.2 Types of Galaxies'), L.wen('Hubble_sequence', 'Hubble sequence'), L.wen('Eddington_luminosity', 'Eddington luminosity')] }
 ],
 formulas: [['Massa dari rotasi', R`M(r) = v^2r/G`], ['Periode galaksi', R`P = 2\pi r/v`], ['Umur titik belok', R`t \approx 10^{10}M_\text{TO}^{-2{,}5}\ \text{th}`], ['Eddington', R`L_\text{Edd} = 4\pi GMm_pc/\sigma_T`]],
 examples: [
  { q: R`Jika semua massa Bima Sakti terpusat di tengah, berapa kecepatan rotasi di 16,4 kpc (dua kali jarak Matahari)?`,
    sol: R`Keplerian: \(v \propto r^{-1/2}\) → \(230/\sqrt2 = 163\) km/s. Hasil pengamatan tetap ~220–230 km/s. Massa di dalam 16,4 kpc harus ~2× massa di dalam 8,2 kpc, padahal cahaya bintang di sana sangat sedikit.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Posisi Matahari di Bima Sakti adalah…`, o: ['Di pusat galaksi', 'Di piringan, sekitar 8 kpc dari pusat', 'Di halo, jauh di atas piringan', 'Di tepi terluar piringan'], a: 1, sol: R`Matahari berada di piringan, ~8,2 kpc dari pusat, di dekat Lengan Orion.` },
  { t: 'num', lv: 'P', q: R`Matahari mengorbit pusat galaksi dengan v = 230 km/s pada r = 8,2 kpc. Berapa massa di dalam orbitnya (M☉)?`, a: 1.0e11, tol: 0.03, unit: 'M☉', v: () => 2.3e5 ** 2 * 8.2e3 * 3.086e16 / 6.674e-11 / 1.989e30,
    sol: R`\(M = \dfrac{(2{,}3\times10^5)^2 \times 8{,}2\times10^3 \times 3{,}086\times10^{16}}{6{,}674\times10^{-11}} = 2{,}0\times10^{41}\) kg ≈ \(1{,}0\times10^{11}\,M_\odot\).` },
  { t: 'num', lv: 'P', q: R`Berapa juta tahun satu kali Matahari mengelilingi pusat galaksi (v = 230 km/s, r = 8,2 kpc)?`, a: 219, tol: 0.015, unit: 'juta th', v: () => 2 * Math.PI * 8.2e3 * 3.086e16 / 2.3e5 / 3.156e7 / 1e6,
    sol: R`\(P = 2\pi r/v = 2\pi \times 2{,}53\times10^{20}/2{,}3\times10^5 = 6{,}9\times10^{15}\) s ≈ 219 juta tahun ("tahun galaksi").` },
  { t: 'mc', lv: 'K', q: R`Garis 21 cm sangat berguna untuk memetakan galaksi karena…`, o: ['Paling terang di cahaya tampak', 'Gelombang radio menembus debu dan hidrogen netral sangat melimpah', 'Hanya dipancarkan bintang muda', 'Tidak terpengaruh efek Doppler'], a: 1, sol: R`Gelombang radio tidak diserap debu, dan HI ada di mana-mana di piringan. Pergeseran Doppler-nya justru dimanfaatkan untuk mengukur kecepatan.` },
  { t: 'num', lv: 'K', q: R`Panjang gelombang garis hidrogen netral 21,106 cm. Berapa frekuensinya (MHz)?`, a: 1420, tol: 0.003, unit: 'MHz', v: () => 2.998e8 / 0.21106 / 1e6,
    sol: R`\(\nu = c/\lambda = 2{,}998\times10^8/0{,}21106 = 1{,}420\times10^9\) Hz = 1420 MHz.` },
  { t: 'mc', lv: 'P', q: R`Kurva rotasi galaksi yang datar (v konstan terhadap r) berarti massa yang tercakup…`, o: ['Konstan', 'Sebanding dengan r', 'Sebanding dengan r²', 'Turun terhadap r'], a: 1, sol: R`\(M(r) = v^2r/G\); dengan v konstan, \(M \propto r\). Massa terus bertambah jauh melampaui daerah tempat bintang berada → materi gelap.` },
  { t: 'num', lv: 'N', q: R`Hitung luminositas Eddington lubang hitam 10⁸ M☉, dalam L☉. (m_p = 1,673 × 10⁻²⁷ kg, σ_T = 6,652 × 10⁻²⁹ m², L☉ = 3,828 × 10²⁶ W)`, a: 3.3e12, tol: 0.03, unit: 'L☉', v: () => 4 * Math.PI * 6.674e-11 * 1e8 * 1.989e30 * 1.673e-27 * 2.998e8 / 6.652e-29 / 3.828e26,
    sol: R`\(L = \dfrac{4\pi \times 6{,}674\times10^{-11} \times 1{,}989\times10^{38} \times 1{,}673\times10^{-27} \times 2{,}998\times10^8}{6{,}652\times10^{-29}} = 1{,}26\times10^{39}\) W ≈ \(3{,}3\times10^{12}\,L_\odot\), lebih terang dari seluruh galaksi induknya. Begitulah kuasar terlihat dari miliaran tahun cahaya.` },
  { t: 'num', lv: 'P', q: R`Titik belok deret utama sebuah gugus bola berada di 0,9 M☉. Dengan \(t \approx 10^{10}M^{-2{,}5}\) tahun, perkirakan umurnya (miliar tahun).`, a: 13.0, tol: 0.02, unit: 'miliar th', v: () => 10 * 0.9 ** -2.5,
    sol: R`\(t = 10^{10} \times 0{,}9^{-2{,}5} = 1{,}30\times10^{10}\) tahun = 13 miliar tahun. Ini perkiraan kasar; model evolusi bintang yang lengkap juga memperhitungkan komposisi (bintang gugus bola miskin logam).` },
  { t: 'mc', lv: 'K', q: R`Galaksi dengan bentuk bulat telur, didominasi bintang tua, dan hampir tanpa gas adalah galaksi…`, o: ['Spiral', 'Spiral berpalang', 'Elips', 'Tak beraturan'], a: 2, sol: R`Galaksi elips (E0–E7): sedikit gas sehingga hampir tidak ada pembentukan bintang baru, dan warnanya kemerahan.` },
  { t: 'essay', lv: 'N', q: R`Pada r = 8,2 kpc, v = 230 km/s; pada r = 20 kpc, v masih 220 km/s. Hitung massa tercakup di kedua jari-jari dan jelaskan mengapa ini bukti materi gelap, jika massa bintang dan gas yang terlihat total ~6 × 10¹⁰ M☉.`,
    sol: R`\(M(8{,}2) = 1{,}0\times10^{11}\,M_\odot\). \(M(20) = (2{,}2\times10^5)^2 \times 20\times10^3 \times 3{,}086\times10^{16}/6{,}674\times10^{-11}/1{,}989\times10^{30} = 2{,}25\times10^{11}\,M_\odot\). Massa terlihat hanya ~6 × 10¹⁰ M☉, dan hampir semuanya berada di dalam ~15 kpc. Jadi di dalam 20 kpc ada ~1,6 × 10¹¹ M☉ yang tidak memancarkan cahaya. Dengan v datar, M terus naik ∝ r sampai radius halo (~200 kpc), memberi total ~10¹² M☉: sebagian besar massa galaksi adalah materi gelap.` }
 ],
 think: ['Kalau materi gelap tidak berinteraksi dengan cahaya, kenapa ia tidak runtuh menjadi piringan tipis seperti gas?', 'Bagaimana kita tahu arah pusat galaksi padahal tertutup debu?']
});

/* ============================== BAB 12 ============================== */
add({
 id: 'kosmologi', no: 12, title: 'Kosmologi Dasar', short: 'Kosmologi', lv: 'P · N',
 lead: R`Kosmologi bertanya tentang alam semesta sebagai satu kesatuan: apakah ia berubah, seberapa tua, dari apa isinya. Jawaban modern bertumpu pada tiga pengamatan: galaksi menjauh (hukum Hubble), sisa cahaya Big Bang (CMB), dan kelimpahan hidrogen–helium.`,
 sections: [
  { id: 'hubble', h: 'Hukum Hubble–Lemaître',
    body: R`<p>Lemaître (1927) dan Hubble (1929) menemukan bahwa galaksi jauh menjauh dengan kecepatan sebanding jaraknya:</p>
    \[ v = H_0\,d \]
    <p>\(H_0 \approx 70\) km/s/Mpc (pengukuran CMB memberi ~67, Cepheid–supernova ~73; perbedaan ini disebut "ketegangan Hubble"). Ini bukan berarti kita di pusat: di alam semesta yang mengembang seragam, setiap pengamat melihat hal yang sama, seperti kismis di adonan roti yang mengembang.</p>
    <p>Di lab, tarik garis terbaik melalui data galaksi untuk mengukur \(H_0\) sendiri.</p>`,
    lab: 'hubble',
    refs: [L.os('26-5-the-expanding-universe', '26.5 The Expanding Universe'), L.wid('Hukum_Hubble', 'Hukum Hubble')] },
  { id: 'redshift', h: 'Pergeseran merah kosmologis & faktor skala',
    body: R`<p>Redshift \(z = (\lambda_\text{obs} - \lambda_\text{emit})/\lambda_\text{emit}\). Untuk galaksi jauh, ini bukan Doppler biasa melainkan <b>regangan ruang</b>: panjang gelombang ikut membesar bersama alam semesta.</p>
    \[ 1 + z = \frac{\lambda_\text{obs}}{\lambda_\text{emit}} = \frac{a_0}{a(t)} \]
    <p>\(a(t)\) adalah <b>faktor skala</b>: z = 1 berarti saat cahaya dipancarkan, jarak antargalaksi setengah dari sekarang. Untuk z kecil, \(v \approx cz\). Untuk z besar, "kecepatan" dan "jarak" butuh definisi yang hati-hati.</p>`,
    refs: [L.wen('Redshift', 'Redshift'), L.wen('Scale_factor_(cosmology)', 'Scale factor')] },
  { id: 'umur', h: 'Umur alam semesta & waktu Hubble',
    body: R`<p>Jika galaksi selalu menjauh dengan kecepatan tetap, waktu yang dibutuhkan untuk sampai ke jarak sekarang adalah \(t = d/v = 1/H_0\), disebut <b>waktu Hubble</b>. Untuk \(H_0\) = 70 km/s/Mpc: 14,0 miliar tahun. Hasil model lengkap (perlambatan oleh materi, lalu percepatan oleh energi gelap) adalah 13,8 miliar tahun, kebetulan dekat sekali.</p>
    <p>Konversi penting: 1 Mpc = 3,086 × 10¹⁹ km, jadi \(H_0\) = 70 km/s/Mpc = 2,27 × 10⁻¹⁸ s⁻¹.</p>`,
    refs: [L.os('29-1-the-age-of-the-universe', '29.1 The Age of the Universe'), L.wen('Hubble%27s_law#Hubble_time', 'Hubble time')] },
  { id: 'cmb', h: 'Radiasi latar belakang gelombang mikro kosmik (CMB)',
    body: R`<p>Sampai ~380 000 tahun setelah Big Bang, alam semesta adalah plasma panas yang buram. Saat suhu turun ke ~3000 K, elektron bergabung dengan proton (<b>rekombinasi</b>, z ≈ 1100) dan cahaya bebas melintas. Cahaya itu kini teregang 1100× menjadi benda hitam bersuhu</p>
    \[ T_0 = 2{,}725\ \text{K}, \qquad T(z) = T_0(1+z) \]
    <p>Puncak Wien-nya ~1,06 mm (gelombang mikro). Ditemukan tak sengaja oleh Penzias & Wilson (1965). Fluktuasinya hanya ~1 per 100 000, tapi itulah bibit seluruh galaksi; satelit COBE, WMAP, dan Planck memetakannya.</p>`,
    refs: [L.os('29-4-the-cosmic-microwave-background', '29.4 The Cosmic Microwave Background'), L.wen('Cosmic_microwave_background', 'Cosmic microwave background')] },
  { id: 'isi', h: 'Isi alam semesta: materi, materi gelap, energi gelap',
    body: R`<p>Kerapatan yang membuat alam semesta "datar" disebut <b>kerapatan kritis</b>:</p>
    \[ \rho_c = \frac{3H_0^2}{8\pi G} \approx 9{,}2\times10^{-27}\ \text{kg/m}^3 \]
    <p>Setara ~5,5 atom hidrogen per m³. Komposisi saat ini: ~5% materi biasa, ~27% materi gelap (bukti: kurva rotasi, gugus galaksi, lensa gravitasi), ~68% <b>energi gelap</b> (bukti: supernova tipe Ia jauh lebih redup dari perkiraan, 1998 → pengembangan dipercepat).</p>
    <p><b>Lensa gravitasi</b>: massa membelokkan cahaya (relativitas umum), menghasilkan busur atau cincin Einstein. Dari distorsinya kita bisa memetakan materi gelap di gugus galaksi.</p>`,
    refs: [L.wen('Friedmann_equations#Density_parameter', 'Critical density'), L.wen('Gravitational_lens', 'Gravitational lens'), L.wid('Materi_gelap', 'Materi gelap')] }
 ],
 formulas: [['Hubble', R`v = H_0 d`], ['Redshift', R`1+z = \lambda_\text{obs}/\lambda_\text{emit} = a_0/a`], ['Waktu Hubble', R`t_H = 1/H_0`], ['Suhu CMB', R`T = 2{,}725(1+z)\ \text{K}`], ['Kerapatan kritis', R`\rho_c = 3H_0^2/8\pi G`]],
 examples: [
  { q: R`Kenapa langit malam gelap, padahal alam semesta mungkin tak terbatas dan penuh bintang (paradoks Olbers)?`,
    sol: R`Alam semesta punya umur terbatas (13,8 miliar tahun), jadi cahaya dari bintang yang sangat jauh belum sampai, dan bintang pun tidak bersinar selamanya. Selain itu, pengembangan meregangkan cahaya jauh ke panjang gelombang yang lebih panjang dan meredupkannya. Langit gelap adalah petunjuk bahwa alam semesta punya awal.` }
 ],
 problems: [
  { t: 'num', lv: 'K', q: R`Galaksi menjauh 7000 km/s. Dengan H₀ = 70 km/s/Mpc, berapa jaraknya (Mpc)?`, a: 100, tol: 0.01, unit: 'Mpc', v: () => 7000 / 70,
    sol: R`\(d = v/H_0 = 7000/70 = 100\) Mpc ≈ 326 juta tahun cahaya.` },
  { t: 'num', lv: 'P', q: R`Hitung waktu Hubble untuk H₀ = 70 km/s/Mpc (miliar tahun). (1 Mpc = 3,086 × 10¹⁹ km)`, a: 13.97, tol: 0.01, unit: 'miliar th', v: () => 1 / (70 / 3.086e19) / 3.156e7 / 1e9,
    sol: R`\(H_0 = 70/3{,}086\times10^{19} = 2{,}27\times10^{-18}\) s⁻¹. \(1/H_0 = 4{,}41\times10^{17}\) s = 13,97 miliar tahun.` },
  { t: 'num', lv: 'P', q: R`CMB bersuhu 2,725 K. Di panjang gelombang berapa puncaknya (mm)?`, a: 1.063, tol: 0.01, unit: 'mm', v: () => 2.898e-3 / 2.725 * 1e3,
    sol: R`\(\lambda = 2{,}898\times10^{-3}/2{,}725 = 1{,}06\times10^{-3}\) m = 1,06 mm.` },
  { t: 'num', lv: 'P', q: R`Berapa suhu CMB saat rekombinasi (z = 1100)? (K)`, a: 3000, tol: 0.01, unit: 'K', v: () => 2.725 * 1101,
    sol: R`\(T = 2{,}725 \times (1 + 1100) = 3000\) K, cukup dingin agar atom hidrogen netral terbentuk.` },
  { t: 'num', lv: 'N', q: R`Hitung kerapatan kritis untuk H₀ = 70 km/s/Mpc (kg/m³).`, a: 9.2e-27, tol: 0.02, unit: 'kg/m³', v: () => { const H = 70 / 3.086e19; return 3 * H * H / (8 * Math.PI * 6.674e-11); },
    sol: R`\(\rho_c = \dfrac{3(2{,}27\times10^{-18})^2}{8\pi \times 6{,}674\times10^{-11}} = 9{,}2\times10^{-27}\) kg/m³ ≈ 5,5 massa proton per m³.` },
  { t: 'mc', lv: 'K', q: R`Pergeseran merah kosmologis galaksi jauh terutama disebabkan oleh…`, o: ['Galaksi bergerak menembus ruang seperti peluru', 'Ruang itu sendiri mengembang dan meregangkan cahaya', 'Debu antargalaksi', 'Gravitasi galaksi kita'], a: 1, sol: R`Panjang gelombang ikut meregang bersama faktor skala: \(1 + z = a_0/a\).` },
  { t: 'num', lv: 'P', q: R`Garis Lyman-α (121,6 nm) dari sebuah kuasar teramati di 486,4 nm. Berapa z-nya?`, a: 3.0, abs: 0.01, v: () => 486.4 / 121.6 - 1,
    sol: R`\(1 + z = 486{,}4/121{,}6 = 4{,}0\) → z = 3,0. Garis UV itu bergeser sampai ke cahaya biru. Saat itu alam semesta berukuran 1/4 dari sekarang.` },
  { t: 'mc', lv: 'P', q: R`Saat alam semesta berada pada z = 1, suhu CMB dan jarak antargalaksi (relatif terhadap sekarang) adalah…`, o: ['2,7 K; sama', '5,45 K; setengah', '1,36 K; dua kali', '5,45 K; dua kali'], a: 1, sol: R`\(a = 1/(1+z) = 1/2\): jarak setengah, suhu dua kali (\(T \propto 1/a\)) = 5,45 K.` },
  { t: 'essay', lv: 'N', q: R`Data lima galaksi (d dalam Mpc, v dalam km/s): (20; 1500), (45; 3100), (80; 5700), (120; 8200), (160; 11 400). Tentukan H₀ dengan regresi melalui titik asal (\(H = \sum dv/\sum d^2\)), lalu waktu Hubble-nya.`,
    sol: R`\(\sum dv = 30\,000 + 139\,500 + 456\,000 + 984\,000 + 1\,824\,000 = 3\,433\,500\). \(\sum d^2 = 400 + 2025 + 6400 + 14\,400 + 25\,600 = 48\,825\). \(H_0 = 70{,}3\) km/s/Mpc. Waktu Hubble = 977,8/70,3 = 13,9 miliar tahun (trik: \(1/H_0\) dalam miliar tahun ≈ 977,8 dibagi H₀ dalam km/s/Mpc). Sebaran titik di sekitar garis berasal dari gerak diri galaksi (~ratusan km/s) dan ralat jarak.` }
 ],
 think: ['Kalau semua galaksi menjauh dari kita, kenapa Andromeda justru mendekat?', 'Apakah tata surya ikut mengembang bersama alam semesta?']
});

/* ============================== BAB 13 ============================== */
add({
 id: 'instrumen', no: 13, title: 'Teleskop, Instrumen & Observasi', short: 'Instrumen & observasi', lv: 'K · P · N',
 lead: R`Astronomi adalah ilmu pengamatan. Babak nasional OSN memuat tes observasi (langit nyata atau planetarium) dan analisis data, jadi selain rumus teleskop kamu juga harus akrab dengan langit malam itu sendiri. Bab ini menggabungkan keduanya.`,
 sections: [
  { id: 'teleskop', h: 'Teleskop: daya kumpul, perbesaran, rasio fokus',
    body: R`<p>Tugas utama teleskop adalah <b>mengumpulkan cahaya</b>, bukan memperbesar. Daya kumpul ∝ luas bukaan ∝ \(D^2\). Teleskop 20 cm mengumpulkan \((200/7)^2 \approx 800\)× lebih banyak cahaya daripada pupil mata (7 mm).</p>
    <p><b>Perbesaran</b> \(M = f_\text{ob}/f_\text{ok}\) (fokus objektif ÷ fokus okuler). <b>Rasio fokus</b> \(N = f/D\) (f/5 "cepat", cocok untuk objek redup yang luas; f/15 "lambat", cocok untuk planet). <b>Skala bidang</b> di bidang fokus: \(206\,265/f\) detik busur per satuan panjang f.</p>
    <p>Refraktor memakai lensa (bisa aberasi kromatik); reflektor memakai cermin (semua teleskop riset besar adalah reflektor karena cermin bisa ditopang dari belakang).</p>`,
    lab: 'teleskop',
    refs: [L.os('6-1-telescopes', '6.1 Telescopes'), L.wid('Teleskop', 'Teleskop')] },
  { id: 'resolusi', h: 'Daya pisah, seeing, & magnitudo batas',
    body: R`<p>Gelombang cahaya yang melewati bukaan melingkar mengalami difraksi, sehingga bintang tampak sebagai piringan Airy. Dua titik terpisah jika jaraknya minimal (kriteria Rayleigh):</p>
    \[ \theta = 1{,}22\,\frac{\lambda}{D}\ \text{rad} \]
    <p>Teleskop 20 cm di 550 nm: 0,69″. Tapi turbulensi atmosfer (<b>seeing</b>) biasanya membatasi resolusi ke ~1″ dari darat; <b>optik adaptif</b> dan teleskop luar angkasa mengatasinya.</p>
    <p><b>Magnitudo batas</b> naik dengan daya kumpul: jika mata telanjang mencapai m = 6, teleskop berdiameter D mencapai kira-kira \(m \approx 6 + 5\log(D/7\,\text{mm})\).</p>`,
    refs: [L.wen('Angular_resolution', 'Angular resolution'), L.wen('Astronomical_seeing', 'Astronomical seeing'), L.os('6-2-telescopes-today', '6.2 Telescopes Today')] },
  { id: 'gelombang', h: 'Detektor, multi-panjang gelombang, & interferometri',
    body: R`<p><b>CCD</b> menangkap 80–90% foton (mata ~1%) dan bisa menumpuk cahaya lama. Tiap panjang gelombang perlu tempat yang tepat: radio dan optik dari darat; inframerah dari puncak gunung kering atau luar angkasa; UV, sinar-X, gamma hanya dari luar angkasa (diserap atmosfer).</p>
    <p>Teleskop radio butuh ukuran sangat besar karena λ panjang (θ ∝ λ/D). Solusinya <b>interferometri</b>: menggabungkan sinyal antena berjarak \(B\) (baseline) sehingga resolusi setara teleskop selebar B: \(\theta \approx \lambda/B\). Event Horizon Telescope memakai baseline seukuran Bumi untuk memotret bayangan lubang hitam M87*.</p>
    <p><b>Polusi cahaya</b> menaikkan kecerahan langit dan mengurangi magnitudo batas; itu sebabnya observatorium dibangun jauh dari kota.</p>`,
    refs: [L.os('6-3-visible-light-detectors-and-instruments', '6.3 Visible-Light Detectors and Instruments'), L.os('6-4-radio-telescopes', '6.4 Radio Telescopes'), L.os('6-5-observations-outside-earths-atmosphere', "6.5 Observations outside Earth's Atmosphere")] },
  { id: 'langit', h: 'Observasi mata telanjang & peta langit',
    body: R`<p><b>Mengukur sudut dengan tangan</b> (lengan lurus): kelingking ~1°, tiga jari ~5°, kepalan ~10°, jengkal ~20°. <b>Memperkirakan magnitudo</b>: bandingkan dengan dua bintang pembanding yang magnitudonya diketahui, satu sedikit lebih terang dan satu sedikit lebih redup, lalu interpolasi.</p>
    <p><b>Penunjuk arah dari Indonesia:</b> rasi <b>Crux</b> (Salib Selatan) dan dua bintang Penunjuk (α dan β Centauri): perpanjang sumbu panjang Crux ~4,5× panjangnya untuk menemukan kutub langit selatan. Sabuk <b>Orion</b> menunjuk ke Sirius (bawah-kiri) dan Aldebaran (atas-kanan). Pada malam Juni–Agustus, <b>Scorpius</b> dan Sagittarius (arah pusat galaksi) melintas tinggi.</p>
    <p>Latih diri dengan <b>planisfer</b> (peta langit putar) atau perangkat lunak planetarium, lalu cocokkan dengan langit nyata. Pelajari rasi, bintang terang beserta nama dan magnitudonya, serta objek Messier yang terang.</p>`,
    refs: [L.web('Stellarium Web (planetarium daring)', 'https://stellarium-web.org/', 'Aplikasi gratis'), L.wen('Crux', 'Crux (Salib Selatan)'), L.web('IAU · The Constellations', 'https://www.iau.org/IAU/IAU/Astronomy-FAQs/Constellations.aspx', 'Situs IAU (EN)')] }
 ],
 formulas: [['Daya kumpul', R`\propto D^2`], ['Perbesaran', R`M = f_\text{ob}/f_\text{ok}`], ['Rasio fokus', R`N = f/D`], ['Rayleigh', R`\theta = 1{,}22\lambda/D`], ['Skala bidang', R`s = 206\,265/f\ \ ''/\text{satuan}`], ['Interferometer', R`\theta \approx \lambda/B`]],
 examples: [
  { q: R`Kenapa memperbesar planet sampai 1000× dengan teleskop 10 cm tidak berguna?`,
    sol: R`Resolusi teleskop 10 cm ~1,4″. Mata bisa membedakan ~1′ = 60″. Perbesaran ~50–200× sudah cukup membuat detail terkecil terlihat oleh mata; lebih dari ~2× diameter dalam mm (~200×) hanya membesarkan gambar buram ("empty magnification") sekaligus meredupkannya.` }
 ],
 problems: [
  { t: 'num', lv: 'K', q: R`Berapa kali daya kumpul cahaya teleskop 20 cm dibanding pupil mata 7 mm?`, a: 816, tol: 0.01, unit: '×', v: () => (200 / 7) ** 2,
    sol: R`\((200/7)^2 = 816\).` },
  { t: 'num', lv: 'K', q: R`Teleskop dengan fokus objektif 1200 mm memakai okuler 25 mm. Berapa perbesarannya?`, a: 48, tol: 0.005, unit: '×', v: () => 1200 / 25,
    sol: R`\(M = 1200/25 = 48\times\).` },
  { t: 'num', lv: 'P', q: R`Berapa daya pisah (detik busur) teleskop berdiameter 20 cm pada λ = 550 nm?`, a: 0.69, tol: 0.015, unit: '″', v: () => 1.22 * 5.5e-7 / 0.2 * 206265,
    sol: R`\(\theta = 1{,}22 \times 5{,}5\times10^{-7}/0{,}2 = 3{,}36\times10^{-6}\) rad × 206 265 = 0,69″.` },
  { t: 'mc', lv: 'K', q: R`Teleskop berdiameter 200 mm dengan panjang fokus 1200 mm punya rasio fokus…`, o: ['f/0,17', 'f/6', 'f/12', 'f/24'], a: 1, sol: R`N = f/D = 1200/200 = 6.` },
  { t: 'num', lv: 'P', q: R`Teleskop dengan panjang fokus 2000 mm memotret Bulan (diameter sudut 31′). Berapa diameter bayangan Bulan di bidang fokus (mm)?`, a: 18.0, tol: 0.01, unit: 'mm', v: () => 1860 / (206265 / 2000),
    sol: R`Skala bidang = 206 265/2000 = 103,1″/mm. 31′ = 1860″ → 1860/103,1 = 18,0 mm. (Cara lain: \(f\,\theta = 2000 \times 9{,}02\times10^{-3} = 18{,}0\) mm.)` },
  { t: 'num', lv: 'P', q: R`Interferometer ALMA dengan baseline 16 km mengamati di λ = 1 mm. Berapa resolusinya (miliarcdetik busur, mas)?`, a: 12.9, tol: 0.01, unit: 'mas', v: () => 1e-3 / 16000 * 206265e3,
    sol: R`\(\theta = \lambda/B = 10^{-3}/1{,}6\times10^4 = 6{,}25\times10^{-8}\) rad = 0,0129″ = 12,9 mas, lebih tajam dari Hubble.` },
  { t: 'mc', lv: 'K', q: R`Teleskop sinar-X harus ditempatkan di luar angkasa karena…`, o: ['Sinar-X terlalu lemah', 'Atmosfer Bumi menyerap sinar-X', 'Sinar-X dipantulkan Bulan', 'Gravitasi membelokkan sinar-X'], a: 1, sol: R`Atmosfer hanya transparan di jendela optik dan radio. Sinar-X diserap di atmosfer atas (untungnya bagi kehidupan).` },
  { t: 'mc', lv: 'K', q: R`Dari Indonesia, rasi yang paling membantu menemukan arah selatan di malam hari adalah…`, o: ['Ursa Major', 'Crux (Salib Selatan)', 'Cassiopeia', 'Leo'], a: 1, sol: R`Perpanjangan sumbu panjang Crux mengarah ke kutub langit selatan; turunkan garis tegak lurus ke horizon untuk titik selatan.` },
  { t: 'num', lv: 'P', q: R`Jika batas mata telanjang m = 6 dengan pupil 7 mm, perkirakan magnitudo batas teleskop berdiameter 100 mm.`, a: 11.8, abs: 0.1, v: () => 6 + 5 * Math.log10(100 / 7),
    sol: R`\(m = 6 + 5\log(100/7) = 6 + 5(1{,}155) = 11{,}8\). (Setiap faktor 10 pada diameter → faktor 100 cahaya → +5 magnitudo.)` },
  { t: 'essay', lv: 'N', q: R`Untuk teleskop 200 mm: (a) berapa perbesaran minimum agar pupil keluar (D/M) tidak melebihi 7 mm? (b) Jika seeing 1″ dan mata bisa membedakan 1′, berapa perbesaran yang cukup untuk melihat semua detail yang diizinkan atmosfer? (c) Mengapa perbesaran 600× tidak disarankan?`,
    sol: R`(a) \(M_\text{min} = 200/7 \approx 29\times\); di bawah itu sebagian cahaya terbuang karena pupil keluar lebih lebar dari pupil mata. (b) Agar 1″ tampak 60″: M ≈ 60×; dalam praktik 100–150× nyaman. (c) Di 600× gambar 1″ menjadi 10′, jauh lebih besar dari yang dibutuhkan mata, sementara kecerahan per luas turun ∝ 1/M² dan getaran serta turbulensi ikut diperbesar. Batas praktis ~2× diameter dalam mm = 400×, dan hanya pada malam dengan seeing sangat baik.` }
 ],
 think: ['Kenapa bintang berkelip tapi planet tidak (atau jauh lebih sedikit)?', 'Kalau kamu hanya punya binokular 7×50, objek apa saja yang sudah bisa diamati untuk latihan OSN?']
});
})();
