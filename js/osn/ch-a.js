/* Chapters 1–4: math tools, celestial sphere, time, celestial mechanics */
(function () {
const { R, L, add } = OSN;

/* ============================== BAB 1 ============================== */
add({
 id: 'matematika', no: 1, title: 'Alat Matematika Astronom', short: 'Alat matematika', lv: 'K · P · N',
 lead: R`Astronomi adalah ilmu tentang benda yang tak bisa disentuh. Kita tidak bisa menaruh bintang di timbangan atau mengukur galaksi dengan meteran, jadi semua yang kita ketahui datang dari cahaya + matematika. Bab ini menyiapkan "kotak perkakas" yang akan dipakai di semua bab berikutnya: notasi ilmiah, sudut, logaritma, vektor, dan cara jujur melaporkan ralat.`,
 sections: [
  { id: 'notasi', h: 'Notasi ilmiah & orde besaran',
    body: R`<p><b>Kenapa perlu?</b> Jarak ke Matahari 149.600.000.000 m, massa elektron 0,000…911 kg (30 nol). Menulis angka seperti itu rawan salah hitung nol. Notasi ilmiah menulisnya sebagai \(a \times 10^n\) dengan \(1 \le a < 10\): jarak Matahari \(= 1{,}496 \times 10^{11}\) m.</p>
    <p>Aturan yang paling sering dipakai: \(10^a \cdot 10^b = 10^{a+b}\), \(10^a / 10^b = 10^{a-b}\), \((10^a)^b = 10^{ab}\).</p>
    <p><b>Orde besaran</b> adalah pangkat sepuluh terdekat. Di OSN, sebelum menghitung detail, biasakan <i>menebak orde</i>-nya dulu (estimasi Fermi). Kalau jawaban akhirmu meleset 3 orde dari tebakan, hampir pasti ada satuan yang salah.</p>
    <div class="tip"><b>Angka sakti untuk estimasi:</b> 1 tahun ≈ \(\pi \times 10^7\) s · 1 AU ≈ \(1{,}5 \times 10^{11}\) m · 1 pc ≈ \(3{,}1 \times 10^{16}\) m ≈ 3,26 tc · \(R_\odot \approx 109\,R_\oplus\) · \(M_\odot \approx 3{,}3\times10^5\,M_\oplus\).</div>`,
    refs: [L.os('1-4-numbers-in-astronomy', '1.4 Numbers in Astronomy'), L.web('Fermi problem (Wikipedia)', 'https://en.wikipedia.org/wiki/Fermi_problem', 'Ensiklopedia (EN)')] },
  { id: 'sudut', h: 'Sudut, radian, dan pendekatan sudut kecil',
    body: R`<p>Di langit kita hanya bisa mengukur <b>arah</b>, jadi ukuran benda langit dinyatakan sebagai <b>sudut</b>. Satuan: 1° = 60′ (menit busur), 1′ = 60″ (detik busur). Satu lingkaran = 360° = \(2\pi\) radian.</p>
    <p>Bayangkan busur lingkaran berjari-jari \(d\). Panjang busur \(s = d\,\theta\) jika \(\theta\) dalam radian. Untuk benda jauh, diameter benda \(D\) hampir sama dengan busur itu, sehingga:</p>
    \[ \theta\,(\text{rad}) \approx \frac{D}{d} \qquad 1\ \text{rad} = 57{,}296^\circ = 206\,265'' \]
    <p>Inilah <b>pendekatan sudut kecil</b> (berlaku baik untuk \(\theta \lesssim 10^\circ\), karena \(\tan\theta \approx \sin\theta \approx \theta\)). Angka 206 265 akan muncul terus: ia adalah jembatan dari detik busur ke radian, dan juga alasan 1 parsec = 206 265 AU.</p>
    <p>Coba di lab: Matahari dan Bulan sama-sama tampak ~0,5° karena Matahari ~400× lebih besar <i>dan</i> ~400× lebih jauh.</p>`,
    lab: 'sudut',
    refs: [L.wen('Small-angle_approximation', 'Small-angle approximation'), L.wen('Angular_diameter', 'Angular diameter')] },
  { id: 'log', h: 'Logaritma: penggaris untuk rentang raksasa',
    body: R`<p>Kecerahan bintang yang bisa kita lihat berbeda sampai \(10^{10}\) kali; jarak benda langit dari \(10^8\) m sampai \(10^{26}\) m. Logaritma "memampatkan" rentang itu: \(\log_{10} x\) menjawab "10 pangkat berapa = \(x\)?".</p>
    <p>Sifat penting: \(\log(ab) = \log a + \log b\), \(\log(a/b) = \log a - \log b\), \(\log a^n = n\log a\). Karena itu, <b>hubungan pangkat menjadi garis lurus</b> di skala log: jika \(y = k x^n\) maka \(\log y = \log k + n \log x\). Kemiringan garisnya adalah pangkat \(n\). Trik ini sangat sering muncul di soal analisis data OSN (misalnya membuktikan hukum Kepler III dari data planet).</p>
    <p>Mata manusia juga "logaritmik": perbedaan terang yang terasa sama sebenarnya rasio yang sama. Itu sebabnya skala magnitudo (Bab 8) memakai log.</p>`,
    refs: [L.wen('Logarithmic_scale', 'Logarithmic scale'), L.wen('Log%E2%80%93log_plot', 'Log–log plot')] },
  { id: 'vektor', h: 'Vektor: memecah gerak menjadi komponen',
    body: R`<p>Bintang bergerak ke segala arah, tapi kita hanya bisa mengukur dua komponen secara terpisah: <b>kecepatan radial</b> \(v_r\) (sepanjang garis pandang, dari efek Doppler) dan <b>kecepatan tangensial</b> \(v_t\) (tegak lurus garis pandang, dari pergeseran posisi). Keduanya saling tegak lurus, jadi kecepatan ruang:</p>
    \[ v = \sqrt{v_r^2 + v_t^2}, \qquad \tan\psi = \frac{v_t}{v_r} \]
    <p>Perkalian titik \(\vec a\cdot\vec b = |a||b|\cos\theta\) dipakai untuk mencari sudut antara dua arah, misalnya sudut antara arah gerak dan garis pandang, atau (dalam bentuk vektor satuan) jarak sudut antara dua bintang.</p>`,
    refs: [L.wen('Proper_motion', 'Proper motion'), L.wen('Dot_product', 'Dot product')] },
  { id: 'ralat', h: 'Statistik, ralat, dan garis terbaik',
    body: R`<p>Tidak ada pengukuran yang sempurna. Babak nasional OSN punya sesi <b>analisis data</b>, dan nilai besar datang dari melaporkan ralat dengan benar.</p>
    <ul><li><b>Rata-rata</b> \(\bar x = \frac{1}{n}\sum x_i\), <b>simpangan baku</b> \(s = \sqrt{\frac{\sum (x_i-\bar x)^2}{n-1}}\) (sebaran satu pengukuran), <b>galat baku rata-rata</b> \(s/\sqrt n\) (seberapa yakin kita pada rata-ratanya).</li>
    <li><b>Ralat relatif</b> \(\Delta x / x\). Untuk \(y = x^a z^b\), cara ralat maksimum: \(\frac{\Delta y}{y} = |a|\frac{\Delta x}{x} + |b|\frac{\Delta z}{z}\). Cara kuadratur (ralat acak saling bebas): \(\sqrt{(a\,\Delta x/x)^2 + (b\,\Delta z/z)^2}\).</li>
    <li><b>Garis terbaik</b>: plot data, tarik garis yang meninggalkan titik seimbang di atas dan di bawah. Untuk ralat kemiringan, tarik juga garis paling curam dan paling landai yang masih masuk akal.</li></ul>
    <p>Pangkat memperbesar ralat: luminositas \(L \propto R^2 T^4\), jadi ralat 1% pada suhu menjadi 4% pada \(L\).</p>`,
    refs: [L.wen('Propagation_of_uncertainty', 'Propagation of uncertainty'), L.wen('Standard_error', 'Standard error'), L.web('IOAA Syllabus (bagian Data Analysis)', 'https://ioaastrophysics.org/resources/IOAA%20Syllabus', 'Silabus resmi (EN)')] }
 ],
 formulas: [
  ['Sudut kecil', R`\theta\,(\text{rad}) = D/d`], ['Konversi', R`1\ \text{rad} = 206\,265''`], ['Log pangkat', R`y=kx^n \Rightarrow \log y = \log k + n\log x`],
  ['Galat baku', R`\sigma_{\bar x} = s/\sqrt n`], ['Ralat maksimum', R`\frac{\Delta y}{y} = \sum |a_i|\frac{\Delta x_i}{x_i}`]
 ],
 examples: [
  { q: R`Bulan berdiameter 3474 km dan berjarak 384 400 km. Berapa diameter sudutnya dalam menit busur?`,
    sol: R`\(\theta = 3474/384\,400 = 9{,}04\times10^{-3}\) rad. Kalikan \(206\,265''\): \(\theta = 1864'' = 31{,}1'\). Hampir sama dengan Matahari (32′). Itulah sebabnya gerhana total bisa terjadi.` },
  { q: R`Tunjukkan bahwa 1 parsec ≈ 3,26 tahun cahaya.`,
    sol: R`1 pc adalah jarak saat 1 AU tampak sebesar 1″: \(d = 1\,\text{AU}/(1/206\,265) = 206\,265\) AU \(= 206\,265 \times 1{,}496\times10^{11} = 3{,}086\times10^{16}\) m. Bagi dengan 1 tc \(= 9{,}461\times10^{15}\) m → 3,26.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Diameter Matahari \(1{,}392\times10^6\) km dan jaraknya \(1{,}496\times10^8\) km. Diameter sudut Matahari dari Bumi kira-kira…`,
    o: ['0,05°', '0,53°', '5,3°', '32°'], a: 1, sol: R`\(\theta = 1{,}392\times10^6 / 1{,}496\times10^8 = 9{,}30\times10^{-3}\) rad \(\times 57{,}3 = 0{,}533^\circ \approx 32'\). Pilihan "32°" adalah jebakan satuan: yang benar 32 <i>menit</i> busur.` },
  { t: 'num', lv: 'K', q: R`Sebuah koin berdiameter 2,5 cm tampak sebesar 1″. Berapa jarak koin itu (dalam km)?`,
    a: 5.16, tol: 0.02, unit: 'km', v: () => 0.025 * 206265 / 1000,
    sol: R`\(d = D/\theta = 0{,}025\ \text{m} \times 206\,265 = 5157\) m ≈ 5,16 km. Resolusi 1″ (batas "seeing" atmosfer di banyak observatorium) setara melihat koin dari 5 km!` },
  { t: 'mc', lv: 'K', q: R`Banyaknya detik dalam satu tahun paling dekat dengan…`,
    o: [R`\(8{,}6\times10^4\)`, R`\(3\times10^5\)`, R`\(3\times10^7\)`, R`\(3\times10^9\)`], a: 2, sol: R`\(365{,}25 \times 86\,400 = 3{,}156\times10^7\) s \(\approx \pi\times10^7\) s. \(8{,}6\times10^4\) adalah detik dalam sehari.` },
  { t: 'mc', lv: 'K', q: R`Jari-jari Matahari ~109 kali jari-jari Bumi. Berapa banyak Bumi yang (secara volume) muat di dalam Matahari?`,
    o: ['109', R`\(1{,}2\times10^4\)`, R`\(1{,}3\times10^6\)`, R`\(1{,}3\times10^9\)`], a: 2, sol: R`Volume \(\propto R^3\): \(109^3 = 1{,}295\times10^6\). Sekitar 1,3 juta Bumi.` },
  { t: 'num', lv: 'P', q: R`Berapa \(\log_{10}\) dari rasio diameter alam semesta teramati (\(8{,}8\times10^{26}\) m) terhadap diameter proton (\(1{,}7\times10^{-15}\) m)? Jawab sampai 1 desimal.`,
    a: 41.7, abs: 0.1, v: () => Math.log10(8.8e26 / 1.7e-15),
    sol: R`\(\log(8{,}8\times10^{26}) - \log(1{,}7\times10^{-15}) = 26{,}944 - (-14{,}770) = 41{,}71\). Sekitar 42 orde besaran memisahkan benda terkecil dan terbesar yang kita kenal.` },
  { t: 'num', lv: 'P', q: R`Periode sebuah bandul diukur lima kali: 10,2; 10,4; 9,9; 10,1; 10,4 s. Berapa galat baku rata-ratanya (dalam detik)?`,
    a: 0.095, tol: 0.06, unit: 's', v: () => { const x = [10.2, 10.4, 9.9, 10.1, 10.4], m = x.reduce((a, b) => a + b) / 5, s = Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / 4); return s / Math.sqrt(5); },
    sol: R`Rata-rata 10,20 s. Simpangan: 0; 0,2; −0,3; −0,1; 0,2 → jumlah kuadrat 0,18. \(s = \sqrt{0{,}18/4} = 0{,}212\) s. Galat baku \(= 0{,}212/\sqrt5 = 0{,}095\) s. Laporkan: \(T = 10{,}20 \pm 0{,}09\) s.` },
  { t: 'mc', lv: 'P', q: R`Luminositas \(L = 4\pi R^2 \sigma T^4\). Jika ralat relatif \(R\) adalah 2% dan \(T\) adalah 1%, ralat relatif maksimum \(L\) adalah…`,
    o: ['3%', '6%', '8%', '12%'], a: 2, sol: R`\(\Delta L/L = 2(2\%) + 4(1\%) = 8\%\). (Dengan kuadratur: \(\sqrt{4^2+4^2} = 5{,}7\%\).) Perhatikan suhu, walau ralatnya kecil, menyumbang sama besar karena pangkat 4.` },
  { t: 'num', lv: 'P', q: R`Sebuah bintang menjauh dengan kecepatan radial 30 km/s dan punya kecepatan tangensial 40 km/s. Berapa sudut (derajat) antara arah geraknya dan garis pandang?`,
    a: 53.1, abs: 0.3, unit: '°', v: () => Math.atan2(40, 30) * 180 / Math.PI,
    sol: R`\(\tan\psi = v_t/v_r = 40/30\) → \(\psi = 53{,}1^\circ\). Kecepatan ruangnya \(\sqrt{30^2+40^2} = 50\) km/s.` },
  { t: 'essay', lv: 'N', q: R`Data planet: Merkurius \(a = 0{,}387\) AU, \(T = 0{,}241\) th; Neptunus \(a = 30{,}07\) AU, \(T = 164{,}8\) th. Jelaskan bagaimana grafik \(\log T\) terhadap \(\log a\) dapat membuktikan hukum Kepler III, lalu hitung kemiringannya dari dua planet ini.`,
    sol: R`Jika \(T = k a^n\), maka \(\log T = \log k + n\log a\): garis lurus dengan kemiringan \(n\). Kemiringan \(= \frac{\log 164{,}8 - \log 0{,}241}{\log 30{,}07 - \log 0{,}387} = \frac{2{,}217 - (-0{,}618)}{1{,}478 - (-0{,}412)} = \frac{2{,}835}{1{,}890} = 1{,}50\). Jadi \(T \propto a^{3/2}\), atau \(T^2 \propto a^3\). Dengan semua planet, titik-titiknya akan tepat segaris; dalam satuan tahun dan AU, perpotongan \(\log k = 0\) (karena Bumi: \(a=1, T=1\)).` }
 ],
 think: ['Kenapa 1 radian "alami" (tanpa angka 360 yang dipilih manusia)?', 'Kalau seeing di Bosscha ~2″, benda sekecil apa di Bulan yang masih bisa dibedakan?']
});

/* ============================== BAB 2 ============================== */
add({
 id: 'koordinat', no: 2, title: 'Bola Langit & Sistem Koordinat', short: 'Bola langit', lv: 'K · P · N',
 lead: R`Langit terlihat seperti kubah raksasa tempat bintang "tertempel". Itu ilusi, karena bintang punya jarak yang sangat berbeda. Tapi ilusi ini berguna: kalau yang kita butuhkan hanya <i>arah</i>, semua benda bisa dianggap menempel di bola berjari-jari tak hingga. Bab ini mengajarkan alamat benda di bola itu, dan cara menerjemahkan antar sistem alamat dengan trigonometri bola.`,
 sections: [
  { id: 'bola', h: 'Bola langit dan titik-titik pentingnya',
    body: R`<p>Pengamat berada di pusat bola langit. Titik tepat di atas kepala disebut <b>zenit</b>, di bawah kaki <b>nadir</b>. Lingkaran besar 90° dari zenit adalah <b>horizon</b>. Sumbu rotasi Bumi, jika diperpanjang, menusuk bola langit di <b>kutub langit utara (KLU)</b> dan <b>kutub langit selatan (KLS)</b>. Perpanjangan ekuator Bumi menjadi <b>ekuator langit</b>.</p>
    <p><b>Meridian</b> adalah lingkaran besar melalui kedua kutub langit dan zenit, membelah langit menjadi timur dan barat. Saat benda melintasi meridian, ia <b>berkulminasi</b> (mencapai tinggi maksimum).</p>
    <p>Karena Bumi berputar ke timur, seluruh bola langit tampak berputar ke barat mengelilingi kutub langit sekali per hari sideris.</p>`,
    fig: 'horizon',
    refs: [L.wid('Bola_langit', 'Bola langit'), L.os('2-1-the-sky-above', '2.1 The Sky Above'), L.naap('motion1/motion1.html', 'Basic Coordinates & Seasons')] },
  { id: 'horizon', h: 'Sistem horizon (tinggi–azimut)',
    body: R`<p>Sistem paling intuitif: <b>tinggi</b> \(h\) (altitude), sudut dari horizon ke benda (0° di horizon, 90° di zenit), dan <b>azimut</b> \(A\), arah sepanjang horizon. Konvensi OSN/IOAA yang umum: diukur dari <b>utara ke timur</b> (U = 0°, T = 90°, S = 180°, B = 270°); selalu baca konvensi di soal. Jarak zenit \(z = 90^\circ - h\).</p>
    <p>Kelemahannya: koordinat ini <b>lokal</b> dan <b>berubah tiap saat</b>. Bintang yang sama punya \((h, A)\) berbeda di Jakarta dan Jayapura, dan berubah dari menit ke menit. Cocok untuk mengarahkan teleskop, buruk untuk katalog.</p>`,
    refs: [L.wen('Horizontal_coordinate_system', 'Horizontal coordinate system')] },
  { id: 'ekuator', h: 'Sistem ekuator (asensio rekta–deklinasi)',
    body: R`<p>Sistem "alamat tetap" untuk katalog bintang. <b>Deklinasi</b> \(\delta\): sudut dari ekuator langit (+ ke utara, − ke selatan), seperti lintang. <b>Asensio rekta</b> \(\alpha\): seperti bujur, diukur ke timur dari <b>titik Aries</b> (titik vernal equinox, tempat Matahari melintasi ekuator langit ke utara sekitar 20 Maret), dalam satuan jam: 24 jam = 360°, jadi 1 jam = 15°.</p>
    <p>Kenapa jam? Karena langit berputar 15° per jam sideris. Variasi lokalnya adalah <b>sudut jam</b> \(H\): berapa lama sejak benda melewati meridian. Hubungannya dengan waktu sideris lokal (Bab 3): \(H = \text{LST} - \alpha\).</p>
    <p>Koordinat \((\alpha, \delta)\) bintang hampir konstan, hanya bergeser perlahan karena presesi (~50″ per tahun), jadi katalog selalu menyebut epoknya, misalnya J2000.0.</p>`,
    fig: 'ekuator',
    refs: [L.wen('Equatorial_coordinate_system', 'Equatorial coordinate system'), L.naap('motion2/motion2.html', 'The Rotating Sky')] },
  { id: 'ekliptika', h: 'Ekliptika, musim, dan zodiak',
    body: R`<p><b>Ekliptika</b> adalah lintasan tahunan Matahari di bola langit, cerminan orbit Bumi. Bidangnya miring \(\varepsilon = 23{,}44^\circ\) terhadap ekuator langit (kemiringan sumbu Bumi). Keduanya berpotongan di dua titik: <b>vernal equinox</b> (\(\alpha = 0^h\), ~20 Mar) dan <b>autumnal equinox</b> (\(\alpha = 12^h\), ~23 Sep). Titik terjauh di utara: <b>solstis Juni</b> (\(\alpha = 6^h, \delta = +23{,}44^\circ\)); di selatan: <b>solstis Desember</b> (\(\alpha = 18^h, \delta = -23{,}44^\circ\)).</p>
    <p>Deklinasi Matahari kira-kira \(\delta_\odot \approx 23{,}44^\circ \sin\left(\frac{360^\circ}{365}(N - 80)\right)\), dengan \(N\) nomor hari dalam tahun. Planet dan Bulan selalu dekat ekliptika (orbitnya hampir sebidang), di pita yang disebut <b>zodiak</b>.</p>
    <p>Untuk koordinat ekliptika \((\lambda, \beta)\), lintang ekliptika \(\beta\) Matahari selalu 0.</p>`,
    refs: [L.os('4-2-the-seasons', '4.2 The Seasons'), L.naap('motion3/motion3.html', 'Motions of the Sun')] },
  { id: 'relasi', h: 'Rumus kunci: lintang, kulminasi, sirkumpolar',
    body: R`<p><b>Tinggi kutub langit = lintang pengamat.</b> Di khatulistiwa (φ = 0) kedua kutub langit di horizon; di kutub utara (φ = 90°) KLU di zenit. Dari Jakarta (φ ≈ −6,2°), KLS berada 6,2° di atas horizon selatan, jadi Polaris (δ ≈ +89,3°) tidak terlihat.</p>
    <p><b>Tinggi kulminasi atas</b> benda dengan deklinasi δ dari lintang φ:</p>
    \[ h_\text{maks} = 90^\circ - |\varphi - \delta| \]
    <p>(di selatan zenit jika δ < φ, di utara jika δ > φ). <b>Sirkumpolar</b> (tak pernah terbenam): untuk pengamat utara, \(\delta > 90^\circ - \varphi\); untuk pengamat selatan, \(\delta < -(90^\circ - |\varphi|)\). Benda tak pernah terbit bila syarat sebaliknya terpenuhi di kutub seberang.</p>
    <p>Mainkan lab di bawah: ubah lintang dan deklinasi, lihat lintasan harian bintang berubah dari terbit–terbenam menjadi sirkumpolar.</p>`,
    lab: 'langit',
    refs: [L.wen('Circumpolar_star', 'Circumpolar star'), L.wid('Bola_langit', 'Bola langit')] },
  { id: 'trig', h: 'Trigonometri bola & segitiga astronomis',
    body: R`<p>Di permukaan bola, "garis lurus" adalah busur lingkaran besar, dan segitiganya punya sisi berupa <i>sudut</i>. Untuk segitiga bola dengan sisi \(a, b, c\) dan sudut di hadapannya \(A, B, C\), <b>rumus cosinus</b>:</p>
    \[ \cos a = \cos b\cos c + \sin b \sin c \cos A \]
    <p><b>Segitiga astronomis</b> menghubungkan kutub langit (P), zenit (Z), dan bintang (X). Sisinya: PZ = 90° − φ, PX = 90° − δ, ZX = 90° − h; sudut di P adalah sudut jam H. Rumus cosinus langsung memberi:</p>
    \[ \sin h = \sin\varphi\sin\delta + \cos\varphi\cos\delta\cos H \]
    <p>Saat terbit/terbenam (h = 0, abaikan refraksi): \(\cos H_0 = -\tan\varphi\tan\delta\). Panjang "siang" benda \(= 2H_0/15^\circ\) jam. Jarak sudut dua bintang (segitiga P–X₁–X₂):</p>
    \[ \cos\theta = \sin\delta_1\sin\delta_2 + \cos\delta_1\cos\delta_2\cos(\alpha_1-\alpha_2) \]`,
    fig: 'segitiga',
    refs: [L.wen('Spherical_trigonometry', 'Spherical trigonometry'), L.wen('Hour_angle', 'Hour angle')] }
 ],
 formulas: [
  ['Kulminasi atas', R`h = 90^\circ - |\varphi-\delta|`], ['Tinggi benda', R`\sin h = \sin\varphi\sin\delta + \cos\varphi\cos\delta\cos H`],
  ['Terbit/terbenam', R`\cos H_0 = -\tan\varphi\tan\delta`], ['Azimut terbit (dari U)', R`\cos A = \sin\delta/\cos\varphi`],
  ['Jarak sudut', R`\cos\theta = \sin\delta_1\sin\delta_2 + \cos\delta_1\cos\delta_2\cos\Delta\alpha`]
 ],
 examples: [
  { q: R`Di mana dan setinggi apa Matahari saat tengah hari pada solstis Desember, dilihat dari Jakarta (φ = −6,2°)?`,
    sol: R`δ☉ = −23,44°. \(h = 90^\circ - |-6{,}2^\circ - (-23{,}44^\circ)| = 90^\circ - 17{,}24^\circ = 72{,}8^\circ\). Karena δ < φ, Matahari di sebelah <b>selatan</b> zenit. Pada solstis Juni (δ = +23,44°) Matahari ada di utara, 60,4° tingginya.` },
  { q: R`Kenapa di Indonesia Matahari bisa tepat di zenit, sedangkan di Jepang tidak pernah?`,
    sol: R`Zenit berarti h = 90°, yaitu δ☉ = φ. δ☉ hanya bergerak di antara −23,44° dan +23,44°, jadi hanya pengamat di daerah tropis (|φ| ≤ 23,44°) yang mengalaminya. Jakarta mengalaminya dua kali setahun (sekitar awal Maret dan awal Oktober, saat δ☉ = −6,2°). Tokyo (φ = 35,7°) tidak pernah.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Dari Jakarta (φ = −6,2°), berapa tinggi kutub langit selatan di atas horizon?`, o: ['0°', '6,2°', '23,4°', '83,8°'], a: 1, sol: R`Tinggi kutub langit = |lintang| = 6,2°, di arah selatan.` },
  { t: 'num', lv: 'K', q: R`Berapa tinggi kulminasi atas Sirius (δ = −16,7°) dilihat dari Jakarta (φ = −6,2°)? (derajat)`, a: 79.5, abs: 0.2, unit: '°', v: () => 90 - Math.abs(-6.2 + 16.7),
    sol: R`\(h = 90^\circ - |-6{,}2^\circ + 16{,}7^\circ| = 90^\circ - 10{,}5^\circ = 79{,}5^\circ\), di sebelah selatan zenit.` },
  { t: 'mc', lv: 'K', q: R`Bagi pengamat di lintang +60°, bintang manakah yang sirkumpolar?`, o: ['δ = +20°', 'δ = +35°', 'δ = 0°', 'δ = −35°'], a: 1, sol: R`Syarat sirkumpolar: δ > 90° − 60° = 30°. Hanya δ = +35° yang memenuhi.` },
  { t: 'num', lv: 'P', q: R`Berapa tinggi Matahari saat tengah hari pada solstis Juni di Jakarta (φ = −6,2°)? (derajat)`, a: 60.4, abs: 0.2, unit: '°', v: () => 90 - Math.abs(-6.2 - 23.44),
    sol: R`\(h = 90^\circ - |-6{,}2^\circ - 23{,}44^\circ| = 90^\circ - 29{,}64^\circ = 60{,}4^\circ\), di arah <b>utara</b>.` },
  { t: 'mc', lv: 'P', q: R`Bagaimana perilaku bintang δ = −60° bagi pengamat di Jakarta (φ = −6,2°)?`,
    o: ['Tidak pernah terbit', 'Sirkumpolar', 'Terbit-terbenam; berkulminasi 36,2° di selatan', 'Terbit-terbenam; berkulminasi 53,8° di selatan'], a: 2,
    sol: R`Sirkumpolar butuh δ < −83,8°, jadi bintang ini terbit dan terbenam. \(h = 90^\circ - |-6{,}2^\circ + 60^\circ| = 36{,}2^\circ\), di selatan (δ < φ).` },
  { t: 'num', lv: 'P', q: R`Berapa jam Matahari berada di atas horizon di lintang +60° saat solstis Juni? (Abaikan refraksi dan ukuran piringan Matahari.)`, a: 18.5, abs: 0.1, unit: 'jam', v: () => 2 * Math.acos(-Math.tan(60 * Math.PI / 180) * Math.tan(23.44 * Math.PI / 180)) * 180 / Math.PI / 15,
    sol: R`\(\cos H_0 = -\tan 60^\circ \tan 23{,}44^\circ = -1{,}732 \times 0{,}4335 = -0{,}751\) → \(H_0 = 138{,}7^\circ\). Lama siang \(= 2 \times 138{,}7^\circ / 15^\circ = 18{,}5\) jam. Dengan refraksi (~34′) dan piringan (~16′), aslinya sekitar 18 jam 50 menit.` },
  { t: 'num', lv: 'N', q: R`Betelgeuse: α = 5h55m10s, δ = +7°24′25″. Rigel: α = 5h14m32s, δ = −8°12′06″. Berapa jarak sudut keduanya? (derajat)`, a: 18.6, abs: 0.1, unit: '°',
    v: () => { const r = Math.PI / 180, a = (40 + 38 / 60) / 60 * 15 * r, d1 = (7 + 24 / 60 + 25 / 3600) * r, d2 = -(8 + 12 / 60 + 6 / 3600) * r; return Math.acos(Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(a)) / r; },
    sol: R`Δα = 40m38s = 0,6772 jam × 15 = 10,158°. \(\cos\theta = \sin(7{,}407^\circ)\sin(-8{,}202^\circ) + \cos(7{,}407^\circ)\cos(8{,}202^\circ)\cos(10{,}158^\circ) = -0{,}0184 + 0{,}9661 = 0{,}9477\) → θ = 18,6°. Kira-kira dua kepalan tangan pada lengan lurus.` },
  { t: 'essay', lv: 'N', q: R`Turunkan rumus azimut terbit benda (diukur dari utara ke timur) dari segitiga astronomis, lalu hitung azimut terbit Matahari saat solstis Juni di Jakarta (φ = −6,2°).`,
    sol: R`Pada segitiga PZX, terapkan rumus cosinus untuk sisi PX dengan sudut di Z (yaitu azimut A): \(\cos(90^\circ-\delta) = \cos(90^\circ-\varphi)\cos(90^\circ-h) + \sin(90^\circ-\varphi)\sin(90^\circ-h)\cos A\). Saat terbit h = 0: \(\sin\delta = \cos\varphi\cos A\) → \(\cos A = \sin\delta/\cos\varphi\). Untuk solstis Juni: \(\cos A = \sin 23{,}44^\circ/\cos 6{,}2^\circ = 0{,}3978/0{,}9942 = 0{,}4001\) → A = 66,4°. Matahari terbit 23,6° di utara titik timur. (Rumus ini berlaku untuk kedua belahan; ia hanya bergantung pada |φ|.)` }
 ],
 think: ['Kenapa koordinat ekuator dipilih untuk katalog, padahal sistem horizon lebih mudah dibayangkan?', 'Di lintang berapa semua bintang di langit pernah terlihat sepanjang tahun?']
});

/* ============================== BAB 3 ============================== */
add({
 id: 'waktu', no: 3, title: 'Waktu, Kalender & Periode', short: 'Waktu', lv: 'K · P · N',
 lead: R`"Satu hari" ternyata punya beberapa definisi, dan selisihnya justru menjadi sumber soal OSN favorit. Bab ini membedakan hari Matahari dan hari sideris, menjelaskan waktu sideris lokal untuk mencari kapan bintang terlihat, zona waktu dan persamaan waktu, Julian Date, serta periode sinodis.`,
 sections: [
  { id: 'hari', h: 'Hari Matahari vs hari sideris',
    body: R`<p><b>Hari sideris</b> = satu putaran Bumi terhadap bintang jauh = 23j 56m 4,1d. <b>Hari Matahari</b> (rata-rata) = dari tengah hari ke tengah hari = 24j.</p>
    <p>Kenapa beda? Selama sehari, Bumi juga maju ~1° di orbitnya (360°/365,25 hari). Jadi agar Matahari kembali ke meridian, Bumi harus berputar 360° + ~0,986°. Ekstra itu butuh ~3m 56d. Dalam setahun, Bumi berputar 366,25 kali terhadap bintang tapi hanya 365,25 kali terhadap Matahari: tepat satu putaran "hilang" karena orbit.</p>
    <p>Akibat praktis: bintang terbit ~4 menit lebih awal setiap malam (2 jam per bulan), sehingga rasi yang terlihat malam hari berganti sepanjang tahun.</p>`,
    fig: 'sidday',
    refs: [L.os('4-3-keeping-time', '4.3 Keeping Time'), L.wid('Waktu_sideris', 'Waktu sideris')] },
  { id: 'lst', h: 'Waktu sideris lokal & sudut jam',
    body: R`<p><b>Waktu sideris lokal (LST)</b> didefinisikan sebagai asensio rekta yang sedang berada di meridian. Jadi: jika LST = 5h30m, bintang dengan α = 5h30m sedang berkulminasi. <b>Sudut jam</b> \(H = \text{LST} - \alpha\): positif berarti benda sudah lewat meridian (di barat).</p>
    <p>Cara cepat memperkirakan LST: saat equinox September (~22 Sep), Matahari di α ≈ 12h, jadi pada tengah malam LST ≈ 0h. LST tengah malam maju ~2 jam per bulan (~4 menit per hari). Rumus presisi waktu sideris Greenwich:</p>
    \[ \text{GMST} \approx 18{,}6974 + 24{,}06571\,D \pmod{24} \ \text{jam} \]
    <p>dengan \(D\) = hari sejak JD 2451545,0 (termasuk pecahan). Lalu \(\text{LST} = \text{GMST} + \lambda/15^\circ\) (bujur timur positif).</p>`,
    refs: [L.wen('Sidereal_time', 'Sidereal time'), L.wen('Hour_angle', 'Hour angle')] },
  { id: 'zona', h: 'Zona waktu & persamaan waktu',
    body: R`<p>Waktu Matahari lokal berbeda 4 menit untuk setiap 1° bujur (24 jam/360°). Agar praktis, wilayah dibagi zona: WIB = UT+7 (meridian acuan 105° BT), WITA = UT+8 (120° BT), WIT = UT+9 (135° BT). Jakarta (106,8° BT) berada 1,8° di timur meridian WIB, jadi tengah hari Matahari rata-rata di sana terjadi 7,2 menit <i>sebelum</i> 12.00 WIB.</p>
    <p>Matahari sungguhan juga tidak selalu tepat waktu. <b>Persamaan waktu</b> (EoT) = waktu Matahari sejati − waktu Matahari rata-rata, berkisar −14 menit (Februari) sampai +16 menit (awal November). Dua penyebabnya: orbit Bumi elips (Bumi lebih cepat di perihelion, Januari) dan kemiringan ekliptika. Jika kamu memotret Matahari tiap hari pada jam yang sama, posisinya membentuk angka 8: <b>analema</b>.</p>
    \[ t_\text{transit} = 12^h - \frac{\lambda - \lambda_\text{zona}}{15^\circ}\ \text{jam} - \text{EoT} \]`,
    refs: [L.wen('Equation_of_time', 'Equation of time'), L.wen('Analemma', 'Analemma')] },
  { id: 'kalender', h: 'Tahun, kalender, dan Julian Date',
    body: R`<p>Ada beberapa "tahun": <b>tahun sideris</b> 365,2564 hari (terhadap bintang), <b>tahun tropis</b> 365,2422 hari (equinox ke equinox, dasar musim), <b>tahun anomalistik</b> 365,2596 hari (perihelion ke perihelion). Tahun tropis lebih pendek karena presesi menggeser titik equinox ke barat ~50″ per tahun.</p>
    <p>Kalender Masehi Gregorian mendekati tahun tropis dengan aturan kabisat: habis dibagi 4, kecuali habis dibagi 100, kecuali lagi habis dibagi 400. Rata-ratanya 365,2425 hari. Kalender Hijriah murni lunar: 12 bulan sinodis ≈ 354,37 hari, ~11 hari lebih pendek dari tahun Masehi.</p>
    <p><b>Julian Date</b> (JD) menghitung hari secara berurutan sejak 1 Januari 4713 SM siang, tanpa bulan dan tahun, sehingga selisih waktu cukup dikurangkan. Acuan modern: JD 2451545,0 = 1 Januari 2000 pukul 12.00 TT (epok J2000.0). JD dimulai pukul 12.00 UT, bukan tengah malam, supaya satu malam pengamatan tidak berganti tanggal.</p>`,
    refs: [L.os('4-4-the-calendar', '4.4 The Calendar'), L.wen('Julian_day', 'Julian day')] },
  { id: 'sinodis', h: 'Periode sinodis & gerak retrograd',
    body: R`<p><b>Periode sideris</b> \(P\) = waktu satu putaran orbit terhadap bintang. <b>Periode sinodis</b> \(S\) = waktu antara dua konfigurasi sama yang dilihat dari Bumi (misalnya oposisi ke oposisi). Bayangkan dua pelari di lintasan melingkar: pelari cepat "menyalip" pelari lambat setiap kali selisih putarannya genap satu.</p>
    \[ \frac{1}{S} = \left|\frac{1}{P_1} - \frac{1}{P_2}\right| \]
    <p>Untuk Mars (P = 1,881 th): \(1/S = 1 - 1/1{,}881\) → S = 2,135 th ≈ 780 hari. Itu sebabnya peluncuran ke Mars hanya efisien tiap ~26 bulan. Saat Bumi menyalip planet luar (sekitar oposisi), planet itu tampak bergerak mundur ke barat terhadap bintang: <b>gerak retrograd</b>, ilusi perspektif, bukan planet benar-benar berbalik.</p>`,
    lab: 'sinodis',
    refs: [L.wen('Orbital_period#Synodic_period', 'Synodic period'), L.wen('Apparent_retrograde_motion', 'Apparent retrograde motion')] }
 ],
 formulas: [
  ['Hari sideris', R`1\ \text{hari sid.} = 23^h56^m04^s`], ['Sudut jam', R`H = \text{LST} - \alpha`], ['LST', R`\text{LST} = \text{GMST} + \lambda/15^\circ`],
  ['Periode sinodis', R`1/S = |1/P_1 - 1/P_2|`], ['Tahun tropis', R`365{,}2422\ \text{hari}`]
 ],
 examples: [
  { q: R`Dari periode sideris Bulan 27,32 hari, hitung periode fasenya (bulan sinodis).`,
    sol: R`Bulan dan Bumi sama-sama mengelilingi Matahari "searah": \(1/S = 1/27{,}32 - 1/365{,}25 = 0{,}036603 - 0{,}002738 = 0{,}033866\) → S = 29,53 hari. Itulah panjang bulan dalam kalender Hijriah (29 atau 30 hari).` },
  { q: R`Kapan rasi Scorpius (α ≈ 16h–17h) paling baik diamati tengah malam?`,
    sol: R`Benda berkulminasi tengah malam saat LST tengah malam = α-nya. LST tengah malam ≈ 0h pada ~22 Sep dan bertambah 2 jam/bulan; 16,5h tercapai ~8,25 bulan kemudian, yaitu awal Juni. Benar: Scorpius menghiasi langit malam Juni–Juli, dan dari Indonesia ia melintas tinggi dekat zenit.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Hari sideris lebih pendek dari hari Matahari rata-rata sekitar…`, o: ['4 detik', '3 menit 56 detik', '1 jam', '12 menit'], a: 1, sol: R`Bumi harus berputar ekstra ~0,986° tiap hari untuk menghadap Matahari lagi: \(0{,}986^\circ \times 4\) menit/° ≈ 3m56s.` },
  { t: 'num', lv: 'K', q: R`Periode sideris Mars 1,881 tahun. Berapa periode sinodisnya (dalam hari)?`, a: 780, tol: 0.01, unit: 'hari', v: () => 1 / (1 - 1 / 1.881) * 365.25,
    sol: R`\(1/S = 1/1 - 1/1{,}881 = 0{,}4684\) → S = 2,135 th × 365,25 = 780 hari.` },
  { t: 'num', lv: 'P', q: R`Pada saat LST = 8h30m, berapa sudut jam (dalam jam desimal) bintang dengan α = 6h45m?`, a: 1.75, abs: 0.02, unit: 'jam', v: () => 8.5 - 6.75,
    sol: R`\(H = 8^h30^m - 6^h45^m = 1^h45^m = 1{,}75\) jam. Positif → bintang sudah melewati meridian 1j 45m yang lalu, kini di langit barat.` },
  { t: 'mc', lv: 'P', q: R`Bintang dengan α = 18h berkulminasi tepat tengah malam sekitar bulan…`, o: ['Maret', 'Juni', 'September', 'Desember'], a: 1, sol: R`Tengah malam, Matahari berada di seberang meridian: α☉ ≈ 18h − 12h = 6h, yaitu solstis Juni. (Cara lain: LST tengah malam ≈ 0h pada ~22 Sep, +2 jam/bulan → 18h sekitar 9 bulan kemudian = Juni.)` },
  { t: 'num', lv: 'P', q: R`Jakarta berbujur 106,8° BT (zona WIB, 105° BT). Pada awal November EoT = +16,4 menit. Matahari melintasi meridian Jakarta pukul 11.xx WIB. Berapa xx (menit)?`, a: 36.4, abs: 0.6, unit: 'menit', v: () => 60 - 1.8 * 4 - 16.4,
    sol: R`Koreksi bujur: (106,8 − 105) × 4 = 7,2 menit lebih awal. EoT positif berarti Matahari sejati mendahului: 16,4 menit lebih awal lagi. 12.00 − 7,2 − 16,4 menit = 11.36,4 WIB.` },
  { t: 'num', lv: 'P', q: R`JD 2451545,0 adalah 1 Januari 2000 pukul 12.00. Berapa JD pada 1 Januari 2026 pukul 12.00?`, a: 2461042, abs: 0.5, v: () => 2451545 + 26 * 365 + 7,
    sol: R`Dari 2000 ke 2026 ada 26 tahun; tahun kabisat yang terlewati: 2000, 2004, …, 2024 = 7. Jumlah hari = 26 × 365 + 7 = 9497. JD = 2451545 + 9497 = 2461042,0.` },
  { t: 'mc', lv: 'K', q: R`Mengapa awal Ramadan maju sekitar 11 hari setiap tahun Masehi?`, o: ['Karena tahun kabisat', 'Karena 12 bulan sinodis ≈ 354 hari, lebih pendek dari tahun tropis', 'Karena presesi sumbu Bumi', 'Karena orbit Bulan elips'], a: 1, sol: R`12 × 29,53 = 354,4 hari. Selisihnya dengan 365,24 hari ≈ 10,9 hari, sehingga bulan Hijriah "berjalan mundur" melewati semua musim dalam ~33 tahun.` },
  { t: 'essay', lv: 'N', q: R`Hitung berapa tahun yang dibutuhkan kalender Julian (rata-rata 365,25 hari) dan kalender Gregorian (365,2425 hari) untuk menyimpang satu hari dari tahun tropis (365,2422 hari). Jelaskan mengapa reformasi Gregorian (1582) menghapus 10 hari.`,
    sol: R`Julian: selisih 365,25 − 365,2422 = 0,0078 hari/tahun → 1/0,0078 ≈ 128 tahun per hari. Gregorian: 0,0003 hari/tahun → ~3300 tahun per hari. Dari Konsili Nicea (325 M, saat aturan Paskah ditetapkan) sampai 1582 ada ~1257 tahun → 1257 × 0,0078 ≈ 9,8 ≈ 10 hari. Equinox Maret sudah bergeser ke ~11 Maret, sehingga 10 hari dihapus (4 Okt 1582 langsung diikuti 15 Okt) untuk mengembalikannya ke ~21 Maret.` }
 ],
 think: ['Kalau Bumi berotasi ke barat (berlawanan dengan orbitnya), mana yang lebih panjang: hari sideris atau hari Matahari?', 'Kenapa Venus punya periode sinodis (584 hari) lebih panjang dari periode orbitnya sendiri?']
});

/* ============================== BAB 4 ============================== */
add({
 id: 'mekanika', no: 4, title: 'Mekanika Benda Langit', short: 'Mekanika', lv: 'K · P · N',
 lead: R`Satu hukum gravitasi menjelaskan apel jatuh, Bulan mengorbit, dan galaksi berputar. Bab ini adalah "mesin" untuk menimbang planet dan bintang, menghitung kecepatan wahana, dan merancang perjalanan antarplanet. Hampir setiap babak OSN punya minimal satu soal dari sini.`,
 sections: [
  { id: 'newton', h: 'Hukum gravitasi Newton',
    body: R`<p>Dua massa saling tarik dengan gaya \(F = \dfrac{G M m}{r^2}\), \(G = 6{,}674\times10^{-11}\) N m² kg⁻². Kuadrat terbalik artinya: jarak 2× → gaya 1/4×. Di permukaan planet bermassa \(M\) dan jari-jari \(R\): \(g = GM/R^2\) (Bumi 9,8 m/s², Bulan 1,62 m/s²).</p>
    <p>Di astronomi, \(G\) dan \(M\) sering muncul berpasangan sebagai \(GM\) (parameter gravitasi), yang diketahui jauh lebih teliti daripada \(G\) atau \(M\) sendiri: \(GM_\odot = 1{,}327\times10^{20}\) m³/s², \(GM_\oplus = 3{,}986\times10^{14}\) m³/s².</p>
    <p>Newton juga menunjukkan bola bersimetri bola menarik seolah semua massanya terpusat di titik pusat. Itulah alasan kita boleh memperlakukan planet dan bintang sebagai titik.</p>`,
    refs: [L.os('3-3-newtons-universal-law-of-gravitation', "3.3 Newton's Universal Law of Gravitation"), L.os('3-2-newtons-great-synthesis', "3.2 Newton's Great Synthesis")] },
  { id: 'kepler', h: 'Tiga hukum Kepler & anatomi elips',
    body: R`<p><b>Hukum I:</b> orbit berbentuk elips dengan Matahari di salah satu fokus. Elips punya setengah sumbu panjang \(a\), eksentrisitas \(e\) (0 = lingkaran), jarak fokus ke pusat \(c = ae\), setengah sumbu pendek \(b = a\sqrt{1-e^2}\). Jarak terdekat (perihelion) \(r_p = a(1-e)\), terjauh (aphelion) \(r_a = a(1+e)\).</p>
    <p><b>Hukum II:</b> garis Matahari–planet menyapu luas yang sama dalam waktu yang sama. Ini adalah kekekalan momentum sudut: \(r_p v_p = r_a v_a\). Planet ngebut di perihelion, lambat di aphelion.</p>
    <p><b>Hukum III:</b> \(P^2 \propto a^3\). Dalam satuan tahun dan AU untuk benda mengelilingi Matahari: \(P^2 = a^3\).</p>
    <p>Di lab, geser eksentrisitas dan perhatikan sektor-sektor berwarna: luasnya sama, tapi bentuknya berbeda.</p>`,
    fig: 'elips', lab: 'kepler',
    refs: [L.os('3-1-the-laws-of-planetary-motion', '3.1 The Laws of Planetary Motion'), L.wid('Hukum_Gerakan_Planet_Kepler', 'Hukum Gerakan Planet Kepler'), L.naap('pos/pos.html', 'Planetary Orbit Simulator')] },
  { id: 'kepler3', h: 'Kepler III versi Newton: menimbang benda langit',
    body: R`<p>Newton menurunkan hukum Kepler III lengkap dengan massanya. Untuk dua benda yang saling mengorbit:</p>
    \[ P^2 = \frac{4\pi^2}{G(M+m)}\,a^3 \]
    <p>Artinya: <b>ukur periode dan jarak sebuah satelit, maka kamu bisa menimbang benda induknya.</b> Begitulah kita tahu massa Bumi (dari Bulan), Jupiter (dari Io), Matahari (dari Bumi), bahkan lubang hitam di pusat galaksi (dari bintang S2).</p>
    <p>Bentuk praktis dengan satuan Matahari: \(P^2[\text{th}] = \dfrac{a^3[\text{AU}]}{(M+m)[M_\odot]}\). Untuk orbit lingkaran, \(v = \sqrt{GM/r}\) dan \(P = 2\pi r / v\).</p>`,
    refs: [L.os('3-4-orbits-in-the-solar-system', '3.4 Orbits in the Solar System'), L.wen("Kepler%27s_laws_of_planetary_motion", "Kepler's laws")] },
  { id: 'energi', h: 'Energi orbit, vis-viva, & kecepatan lepas',
    body: R`<p>Energi total per satuan massa orbit adalah \(\varepsilon = \frac{v^2}{2} - \frac{GM}{r} = -\frac{GM}{2a}\). Negatif berarti terikat. Dari sini lahir <b>persamaan vis-viva</b>, rumus paling serbaguna di bab ini:</p>
    \[ v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right) \]
    <p>Kasus khusus: orbit lingkaran (\(r = a\)): \(v_c = \sqrt{GM/r}\). Lepas (energi = 0, \(a \to \infty\)): \(v_\text{esc} = \sqrt{2GM/r} = \sqrt2\,v_c\). Bumi: \(v_\text{esc}\) = 11,2 km/s.</p>
    <p>Energi menentukan bentuk lintasan: \(\varepsilon < 0\) elips, \(= 0\) parabola, \(> 0\) hiperbola (seperti 'Oumuamua dan 3I/ATLAS).</p>`,
    refs: [L.wen('Vis-viva_equation', 'Vis-viva equation'), L.wen('Escape_velocity', 'Escape velocity'), L.os('3-5-motions-of-satellites-and-spacecraft', '3.5 Motions of Satellites and Spacecraft')] },
  { id: 'hohmann', h: 'Transfer Hohmann: jalan termurah antarplanet',
    body: R`<p>Untuk pindah dari orbit lingkaran \(r_1\) ke \(r_2\) dengan bahan bakar minimum (dua dorongan), wahana menempuh setengah elips yang perihelionnya \(r_1\) dan aphelionnya \(r_2\). Setengah sumbu panjangnya \(a_t = (r_1 + r_2)/2\), dan waktu tempuhnya setengah periode elips itu:</p>
    \[ t = \frac12 \sqrt{\frac{4\pi^2 a_t^3}{GM}} \quad\Longrightarrow\quad t[\text{th}] = \tfrac12 a_t^{3/2}[\text{AU}] \]
    <p>Dorongan pertama di \(r_1\): \(\Delta v_1 = \sqrt{GM/r_1}\left(\sqrt{\frac{2r_2}{r_1+r_2}} - 1\right)\). Bumi ke Mars: \(a_t\) = 1,262 AU → t ≈ 259 hari. Jadwal peluncuran harus pas agar Mars tiba di titik aphelion bersamaan dengan wahana.</p>`,
    fig: 'hohmann',
    refs: [L.wen('Hohmann_transfer_orbit', 'Hohmann transfer orbit'), L.os('3-5-motions-of-satellites-and-spacecraft', '3.5 Motions of Satellites and Spacecraft')] },
  { id: 'duabenda', h: 'Pusat massa, gaya pasang, batas Roche, titik Lagrange',
    body: R`<p>Dua benda sebenarnya sama-sama mengorbit <b>pusat massa</b> (barisenter): \(r_1 = a\,\frac{m_2}{m_1+m_2}\). Pusat massa Matahari–Jupiter berada sedikit di luar permukaan Matahari. Goyangan bintang di sekitar barisenter inilah yang dipakai untuk menemukan eksoplanet (Bab 10).</p>
    <p><b>Gaya pasang</b> adalah <i>selisih</i> tarikan antara sisi dekat dan sisi jauh benda berjari-jari \(R\): \(\Delta a \approx \dfrac{2GMR}{d^3}\). Perhatikan pangkat 3: gaya pasang melemah jauh lebih cepat daripada gravitasi.</p>
    <p>Jika satelit terlalu dekat, gaya pasang mengalahkan gravitasinya sendiri dan ia tercabik: <b>batas Roche</b> \(d \approx 2{,}44\,R_M(\rho_M/\rho_m)^{1/3}\) (untuk satelit cair). <b>Titik Lagrange</b> L1–L5 adalah lima titik tempat benda kecil bisa "diam" relatif terhadap dua benda besar; JWST berada di sekitar L2 Matahari–Bumi.</p>`,
    refs: [L.wen('Roche_limit', 'Roche limit'), L.wen('Lagrange_point', 'Lagrange point'), L.wen('Barycenter_(astronomy)', 'Barycenter'), L.os('4-6-ocean-tides-and-the-moon', '4.6 Ocean Tides and the Moon')] }
 ],
 formulas: [
  ['Gravitasi', R`F = GMm/r^2`], ['Kepler III', R`P^2 = \frac{4\pi^2 a^3}{G(M+m)}`], ['Vis-viva', R`v^2 = GM(2/r - 1/a)`],
  ['Kec. orbit & lepas', R`v_c=\sqrt{GM/r},\ v_\text{esc}=\sqrt{2GM/r}`], ['Perihelion/aphelion', R`r_{p,a} = a(1\mp e)`], ['Pasang', R`\Delta a \approx 2GMR/d^3`]
 ],
 examples: [
  { q: R`Hitung massa Matahari dari orbit Bumi (a = 1 AU, P = 1 tahun).`,
    sol: R`\(M = \dfrac{4\pi^2 a^3}{G P^2} = \dfrac{4\pi^2 (1{,}496\times10^{11})^3}{6{,}674\times10^{-11}\,(3{,}156\times10^7)^2} = 1{,}99\times10^{30}\) kg. Massa Bumi diabaikan (3 per sejuta massa Matahari).` },
  { q: R`ISS mengorbit 420 km di atas permukaan Bumi. Berapa kecepatan dan periodenya?`,
    sol: R`r = 6371 + 420 = 6791 km. \(v = \sqrt{3{,}986\times10^{14}/6{,}791\times10^6} = 7{,}66\) km/s. \(P = 2\pi r/v = 2\pi(6{,}791\times10^6)/7660 = 5570\) s ≈ 93 menit.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Jika jarak antara dua benda dijadikan 3 kali semula, gaya gravitasinya menjadi…`, o: ['3×', '1/3×', '1/9×', '9×'], a: 2, sol: R`\(F \propto 1/r^2\): \((1/3)^2 = 1/9\).` },
  { t: 'num', lv: 'P', q: R`Bulan mengorbit Bumi dengan a = 384 400 km dan periode sideris 27,32 hari. Hitung massa sistem Bumi–Bulan (kg).`, a: 6.03e24, tol: 0.02, unit: 'kg', v: () => 4 * Math.PI ** 2 * 3.844e8 ** 3 / (6.674e-11 * (27.32 * 86400) ** 2),
    sol: R`\(M + m = \dfrac{4\pi^2 a^3}{GP^2} = \dfrac{39{,}48 \times (3{,}844\times10^8)^3}{6{,}674\times10^{-11} \times (2{,}360\times10^6)^2} = 6{,}03\times10^{24}\) kg. Massa Bumi sendiri 5,97 × 10²⁴ kg; sisanya (~1,2%) adalah Bulan.` },
  { t: 'num', lv: 'P', q: R`Berapa ketinggian orbit geostasioner di atas khatulistiwa (km)? Gunakan periode 86 164 s, \(GM_\oplus = 3{,}986\times10^{14}\) m³/s², R⊕ = 6378 km.`, a: 35786, tol: 0.005, unit: 'km', v: () => Math.cbrt(3.986e14 * 86164 ** 2 / (4 * Math.PI ** 2)) / 1000 - 6378,
    sol: R`\(r = \left(\dfrac{GM P^2}{4\pi^2}\right)^{1/3} = 42\,164\) km dari pusat. Tinggi = 42 164 − 6378 = 35 786 km. Periodenya harus hari <i>sideris</i>, bukan 24 jam.` },
  { t: 'num', lv: 'K', q: R`Massa Bulan \(7{,}342\times10^{22}\) kg, jari-jari 1737 km. Berapa kecepatan lepas dari permukaannya (km/s)?`, a: 2.38, tol: 0.01, unit: 'km/s', v: () => Math.sqrt(2 * 6.674e-11 * 7.342e22 / 1.7374e6) / 1000,
    sol: R`\(v = \sqrt{2GM/R} = \sqrt{2 \times 6{,}674\times10^{-11} \times 7{,}342\times10^{22} / 1{,}737\times10^6} = 2375\) m/s ≈ 2,38 km/s. Karena kecil, Bulan tak mampu menahan atmosfer.` },
  { t: 'num', lv: 'P', q: R`Berapa hari waktu tempuh transfer Hohmann dari Bumi (1 AU) ke Mars (1,524 AU)?`, a: 259, tol: 0.01, unit: 'hari', v: () => (2.524 / 2) ** 1.5 / 2 * 365.25,
    sol: R`\(a_t = (1 + 1{,}524)/2 = 1{,}262\) AU. Periode elips \(= 1{,}262^{1{,}5} = 1{,}418\) th. Waktu tempuh = setengahnya = 0,709 th = 259 hari.` },
  { t: 'num', lv: 'P', q: R`Komet Halley: a = 17,8 AU, e = 0,967. Berapa kecepatannya di perihelion (km/s)? \(GM_\odot = 1{,}327\times10^{20}\) m³/s².`, a: 54.5, tol: 0.015, unit: 'km/s', v: () => { const AU = 1.496e11, r = 17.8 * (1 - 0.967) * AU, A = 17.8 * AU; return Math.sqrt(1.327e20 * (2 / r - 1 / A)) / 1000; },
    sol: R`\(r_p = 17{,}8(1 - 0{,}967) = 0{,}587\) AU \(= 8{,}79\times10^{10}\) m. Vis-viva: \(v^2 = 1{,}327\times10^{20}\left(\frac{2}{8{,}79\times10^{10}} - \frac{1}{2{,}66\times10^{12}}\right) = 2{,}97\times10^9\) → v = 54,5 km/s. Di aphelion (35 AU) hanya ~0,9 km/s!` },
  { t: 'num', lv: 'N', q: R`Jupiter: a = 7,785 × 10⁸ km, massa = M☉/1047,6. Berapa jarak pusat massa Matahari–Jupiter dari pusat Matahari, dalam satuan R☉ (6,957 × 10⁵ km)?`, a: 1.07, tol: 0.01, unit: 'R☉', v: () => 7.785e8 / 1048.6 / 6.957e5,
    sol: R`\(r_\odot = a\,\dfrac{m_J}{M_\odot + m_J} = \dfrac{7{,}785\times10^8}{1048{,}6} = 7{,}42\times10^5\) km = 1,07 R☉. Pusat massanya sedikit di luar permukaan Matahari, jadi Matahari "bergoyang" dengan periode 11,9 tahun.` },
  { t: 'mc', lv: 'P', q: R`Satelit di orbit lingkaran rendah tiba-tiba kecepatannya dinaikkan menjadi √2 kali semula (searah gerak). Lintasannya menjadi…`, o: ['Lingkaran yang lebih besar', 'Elips', 'Parabola: tepat lepas', 'Jatuh ke Bumi'], a: 2, sol: R`\(v_\text{esc} = \sqrt2\,v_c\) di jarak yang sama. Energi total menjadi nol → lintasan parabola, tepat lolos dari gravitasi Bumi.` },
  { t: 'num', lv: 'N', q: R`Io mengorbit Jupiter dengan a = 421 700 km dan P = 1,769 hari. Hitung massa Jupiter (kg).`, a: 1.90e27, tol: 0.02, unit: 'kg', v: () => 4 * Math.PI ** 2 * 4.217e8 ** 3 / (6.674e-11 * (1.769 * 86400) ** 2),
    sol: R`\(M = \dfrac{4\pi^2 (4{,}217\times10^8)^3}{6{,}674\times10^{-11}(1{,}528\times10^5)^2} = 1{,}90\times10^{27}\) kg ≈ 318 massa Bumi.` },
  { t: 'essay', lv: 'N', q: R`Jelaskan asal rumus percepatan pasang \(\Delta a \approx 2GMR/d^3\), lalu perkirakan batas Roche Saturnus (R = 58 232 km, ρ = 687 kg/m³) untuk bulan es (ρ = 917 kg/m³) memakai \(d = 2{,}44 R(\rho_M/\rho_m)^{1/3}\). Bandingkan dengan tepi luar cincin A (~136 800 km).`,
    sol: R`Percepatan di sisi dekat \(GM/(d-R)^2\), di pusat \(GM/d^2\). Selisihnya \(\approx \frac{GM}{d^2}\left[(1 - R/d)^{-2} - 1\right] \approx \frac{GM}{d^2}\cdot\frac{2R}{d} = \frac{2GMR}{d^3}\) (deret Taylor \((1-x)^{-2} \approx 1 + 2x\)). Batas Roche: \(2{,}44 \times (687/917)^{1/3} \times 58\,232 = 2{,}44 \times 0{,}908 \times 58\,232 \approx 129\,000\) km. Cincin utama Saturnus memang hampir seluruhnya berada di dalam ~129 000–137 000 km: materi di sana tak bisa menggumpal menjadi bulan. Bulan-bulan kecil seperti Pan bertahan di dalamnya karena kekuatan material, bukan hanya gravitasi.` }
 ],
 think: ['Kenapa astronaut di ISS melayang padahal gravitasi di sana masih ~90% gravitasi permukaan?', 'Wahana ke Matahari justru butuh Δv lebih besar daripada keluar tata surya. Kenapa?']
});
})();
