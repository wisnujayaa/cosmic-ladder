/* Chapters 5–8: Earth–Moon–Sun, the Sun & solar system, radiation, photometry & distance */
(function () {
const { R, L, add } = OSN;

/* ============================== BAB 5 ============================== */
add({
 id: 'bumibulan', no: 5, title: 'Sistem Bumi–Bulan–Matahari', short: 'Bumi–Bulan', lv: 'K · P',
 lead: R`Fase Bulan, gerhana, pasang surut, dan musim adalah fenomena yang bisa kamu amati sendiri tanpa alat. Semuanya lahir dari geometri tiga benda: di mana Matahari, Bumi, dan Bulan berada, dan bagaimana mereka miring satu sama lain.`,
 sections: [
  { id: 'fase', h: 'Fase Bulan',
    body: R`<p>Bulan selalu setengah tersinari Matahari. Yang berubah adalah <b>berapa bagian dari belahan terang itu yang menghadap kita</b>. Sudut Bulan–Bumi–Matahari disebut <b>elongasi</b> \(E\). Fraksi piringan yang terang:</p>
    \[ k = \frac{1 - \cos E}{2} \]
    <p>E = 0° bulan baru (k = 0), 90° kuartir (k = ½), 180° purnama (k = 1). Karena Bulan bergerak ke timur ~12°/hari relatif terhadap Matahari, ia terbit ~50 menit lebih lambat tiap hari. Pola waktu yang sering ditanyakan: <b>kuartir awal</b> terbit sekitar tengah hari dan terbenam tengah malam; <b>purnama</b> terbit saat Matahari terbenam; <b>kuartir akhir</b> terbit tengah malam.</p>
    <p>Bulan sabit muda selalu tampak di barat setelah magrib, dengan sisi terang menghadap Matahari yang baru terbenam.</p>`,
    lab: 'fase',
    refs: [L.os('4-5-phases-and-motions-of-the-moon', '4.5 Phases and Motions of the Moon'), L.wid('Fase_bulan', 'Fase bulan'), L.naap('lps/lps.html', 'Lunar Phase Simulator')] },
  { id: 'gerhana', h: 'Gerhana: umbra, penumbra, dan musim gerhana',
    body: R`<p>Benda yang disinari sumber cahaya besar membentuk dua bayangan: <b>umbra</b> (sumber tertutup penuh) yang berbentuk kerucut, dan <b>penumbra</b> (tertutup sebagian) yang melebar. Panjang kerucut umbra benda berjari-jari \(r\) pada jarak \(D\) dari Matahari (jari-jari \(R_\odot\)):</p>
    \[ L_\text{umbra} = \frac{D\,r}{R_\odot - r} \]
    <p>Umbra Bulan panjangnya ~374 000 km, hampir pas dengan jarak Bumi–Bulan (356 000–407 000 km). Jika Bulan dekat (perigee), ujung umbra menyentuh Bumi → <b>gerhana Matahari total</b>; jika jauh, tidak sampai → <b>gerhana cincin</b>.</p>
    <p>Orbit Bulan miring ~5,1° terhadap ekliptika, jadi gerhana hanya terjadi saat bulan baru/purnama jatuh dekat <b>titik simpul</b> (perpotongan kedua bidang), ~2 musim gerhana per tahun. Pola gerhana berulang tiap <b>saros</b> ≈ 18 tahun 11 hari 8 jam.</p>`,
    fig: 'gerhana',
    refs: [L.os('4-7-eclipses-of-the-sun-and-moon', '4.7 Eclipses of the Sun and Moon'), L.wid('Gerhana', 'Gerhana'), L.wen('Saros_(astronomy)', 'Saros cycle')] },
  { id: 'pasang', h: 'Pasang surut',
    body: R`<p>Gaya pasang (Bab 4) meregangkan Bumi sepanjang garis Bumi–Bulan, membentuk dua tonjolan air: satu menghadap Bulan, satu di sisi berlawanan. Bumi berputar melewati keduanya, sehingga kebanyakan pantai mengalami dua pasang naik per ~24 jam 50 menit.</p>
    <p>Matahari juga menimbulkan pasang, kekuatannya ~46% dari Bulan. Saat bulan baru dan purnama keduanya segaris → <b>pasang purnama</b> (spring tide, tinggi). Saat kuartir saling tegak lurus → <b>pasang perbani</b> (neap tide, rendah).</p>
    <p>Gesekan pasang memperlambat rotasi Bumi (~2 ms per abad) dan mendorong Bulan menjauh (3,8 cm/tahun). Proses yang sama, sudah selesai pada Bulan, membuatnya <b>terkunci pasang</b>: periode rotasi = periode orbit.</p>`,
    fig: 'pasang',
    refs: [L.os('4-6-ocean-tides-and-the-moon', '4.6 Ocean Tides and the Moon'), L.wid('Pasang_surut', 'Pasang surut')] },
  { id: 'musim', h: 'Musim & insolasi',
    body: R`<p>Musim bukan karena jarak Bumi–Matahari (Bumi justru paling dekat pada awal Januari). Penyebabnya kemiringan sumbu 23,44°: belahan yang condong ke Matahari menerima sinar lebih tegak dan siang lebih panjang.</p>
    <p>Sinar yang datang dengan tinggi \(h\) tersebar ke luas yang lebih besar: daya per satuan luas tanah \(= S\sin h\). Pada h = 30°, tiap meter persegi tanah hanya menerima separuh dibanding saat Matahari di zenit. Ditambah lagi, sinar rendah menembus atmosfer lebih tebal.</p>
    <p>Di daerah tropis seperti Indonesia, variasi sudut dan panjang hari kecil, sehingga musim lebih ditentukan oleh angin muson (hujan/kemarau) daripada suhu.</p>`,
    refs: [L.os('4-2-the-seasons', '4.2 The Seasons'), L.naap('motion1/motion1.html', 'Basic Coordinates & Seasons')] },
  { id: 'presesi', h: 'Presesi, nutasi, dan librasi',
    body: R`<p><b>Presesi:</b> tarikan Matahari dan Bulan pada tonjolan khatulistiwa Bumi membuat sumbu Bumi berputar seperti gasing miring, satu siklus ~25 800 tahun. Akibatnya titik equinox bergeser ~50,3″/tahun ke barat, bintang kutub berganti (Vega sekitar tahun 14 000), dan koordinat katalog perlu epok.</p>
    <p><b>Nutasi:</b> goyangan kecil (amplitudo ~9″, periode 18,6 tahun) di atas presesi, akibat presesi bidang orbit Bulan.</p>
    <p><b>Librasi:</b> walau terkunci pasang, kita bisa melihat ~59% permukaan Bulan dari waktu ke waktu karena orbit Bulan elips (librasi bujur), bidang orbitnya miring (librasi lintang), dan kita mengamati dari permukaan Bumi yang berputar (librasi diurnal).</p>`,
    refs: [L.wen('Axial_precession', 'Axial precession'), L.wen('Libration', 'Libration')] }
 ],
 formulas: [['Fraksi terang', R`k = (1-\cos E)/2`], ['Umbra', R`L = Dr/(R_\odot - r)`], ['Pasang Matahari/Bulan', R`\frac{M_\odot}{M_m}\left(\frac{d_m}{d_\odot}\right)^3 \approx 0{,}46`], ['Insolasi', R`I = S\sin h`]],
 examples: [
  { q: R`Kamu melihat Bulan sabit tipis di ufuk barat sesaat setelah Matahari terbenam. Apakah bulan itu sedang membesar atau mengecil?`,
    sol: R`Bulan di dekat Matahari di sisi timurnya (terbenam setelah Matahari) berarti elongasi kecil di timur: beberapa hari setelah bulan baru. Bulan <b>membesar</b> (hilal/waxing crescent). Bulan sabit tua terlihat di timur sebelum subuh.` },
  { q: R`Kenapa gerhana Bulan total bisa berlangsung sampai ~1 jam 40 menit, sedangkan gerhana Matahari total paling lama ~7,5 menit?`,
    sol: R`Bayangan Bumi di jarak Bulan lebarnya ~2,6 diameter Bulan, sehingga Bulan butuh waktu lama melintasinya. Sebaliknya, ujung umbra Bulan di Bumi hanya ratusan km dan bergerak cepat (>1700 km/jam). Gerhana Bulan juga terlihat dari seluruh sisi malam Bumi.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Bulan pada fase kuartir awal terbit sekitar pukul…`, o: ['06.00', '12.00', '18.00', '24.00'], a: 1, sol: R`Kuartir awal: elongasi 90° timur, jadi Bulan tertinggal ~6 jam dari Matahari: terbit ~12.00, di meridian ~18.00, terbenam ~24.00.` },
  { t: 'mc', lv: 'K', q: R`Gerhana Bulan hanya bisa terjadi saat fase…`, o: ['Bulan baru', 'Kuartir awal', 'Purnama', 'Kuartir akhir'], a: 2, sol: R`Bulan harus berada di belakang Bumi (di seberang Matahari) agar masuk bayangan Bumi: itu fase purnama.` },
  { t: 'num', lv: 'P', q: R`Hitung panjang kerucut umbra Bulan (km). Jari-jari Bulan 1737 km, Matahari 696 000 km, jarak Bulan–Matahari 1,496 × 10⁸ km.`, a: 374300, tol: 0.01, unit: 'km', v: () => 1.496e8 * 1737 / (696000 - 1737),
    sol: R`\(L = \dfrac{1{,}496\times10^8 \times 1737}{696\,000 - 1737} = 3{,}74\times10^5\) km. Jarak permukaan Bumi ke Bulan berkisar ~350 000–400 000 km, jadi ada gerhana total (Bulan dekat) dan gerhana cincin (Bulan jauh).` },
  { t: 'num', lv: 'P', q: R`Hitung rasio kekuatan pasang Matahari terhadap Bulan. (M☉ = 1,989 × 10³⁰ kg, Mbulan = 7,342 × 10²² kg, dbulan = 3,844 × 10⁸ m, d☉ = 1,496 × 10¹¹ m)`, a: 0.46, tol: 0.02, v: () => (1.989e30 / 7.342e22) * (3.844e8 / 1.496e11) ** 3,
    sol: R`Gaya pasang ∝ \(M/d^3\). Rasio \(= \dfrac{1{,}989\times10^{30}}{7{,}342\times10^{22}} \times \left(\dfrac{3{,}844\times10^8}{1{,}496\times10^{11}}\right)^3 = 2{,}71\times10^7 \times 1{,}70\times10^{-8} = 0{,}46\). Matahari jauh lebih masif tapi pangkat 3 jarak membuatnya kalah.` },
  { t: 'num', lv: 'P', q: R`Berapa fraksi piringan Bulan yang terang saat elongasinya 60°?`, a: 0.25, abs: 0.01, v: () => (1 - Math.cos(Math.PI / 3)) / 2,
    sol: R`\(k = (1 - \cos 60^\circ)/2 = (1 - 0{,}5)/2 = 0{,}25\). Seperempat piringan: sabit yang cukup tebal.` },
  { t: 'mc', lv: 'K', q: R`Saat Matahari setinggi 30°, energi yang diterima tiap m² tanah dibanding saat Matahari di zenit (abaikan atmosfer) adalah…`, o: ['30%', '50%', '87%', '100%'], a: 1, sol: R`\(I = S\sin h = S\sin 30^\circ = 0{,}5\,S\).` },
  { t: 'mc', lv: 'K', q: R`Siklus berulangnya pola gerhana yang serupa (saros) kira-kira…`, o: ['1 tahun', '8 tahun', '18 tahun 11 hari', '33 tahun'], a: 2, sol: R`Saros = 223 bulan sinodis ≈ 242 bulan drakonik ≈ 18 th 11 h 8 j, saat posisi Matahari, Bulan, dan simpul berulang hampir sama.` },
  { t: 'mc', lv: 'P', q: R`Berapa persen permukaan Bulan yang bisa diamati dari Bumi berkat librasi?`, o: ['50%', '59%', '75%', '100%'], a: 1, sol: R`Librasi bujur, lintang, dan diurnal memperlihatkan "intip" di tepi-tepi Bulan sehingga total ~59% permukaan pernah terlihat.` },
  { t: 'essay', lv: 'N', q: R`Hitung panjang umbra Bumi dan lebarnya pada jarak Bulan (384 400 km), dinyatakan dalam diameter Bulan (3474 km). Jelaskan mengapa Bulan saat gerhana total tampak merah, tidak hilang.`,
    sol: R`\(L = \dfrac{1{,}496\times10^8 \times 6371}{696\,000 - 6371} = 1{,}38\times10^6\) km. Lebar kerucut mengecil linear: \(2R_\oplus(1 - 384\,400/1{,}38\times10^6) = 12\,742 \times 0{,}722 = 9200\) km ≈ 2,65 diameter Bulan. Bulan tetap terlihat karena atmosfer Bumi membiaskan cahaya Matahari ke dalam umbra. Cahaya biru lebih banyak dihamburkan (hamburan Rayleigh), sehingga yang tersisa merah-jingga, seolah semua matahari terbit dan terbenam di Bumi menyinari Bulan.` }
 ],
 think: ['Seperti apa "fase Bumi" yang dilihat astronaut di Bulan saat di Bumi sedang purnama?', 'Mengapa gerhana Matahari total akan punah ratusan juta tahun lagi?']
});

/* ============================== BAB 6 ============================== */
add({
 id: 'tatasurya', no: 6, title: 'Matahari & Tata Surya', short: 'Matahari & planet', lv: 'K · P · N',
 lead: R`Matahari adalah satu-satunya bintang yang bisa kita pelajari dari dekat, dan planet-planet adalah laboratorium alami untuk fisika. Bab ini menjawab: dari mana energi Matahari, seberapa banyak yang sampai ke tiap planet, berapa suhu planet, dan kenapa sebagian planet punya atmosfer sementara yang lain tidak.`,
 sections: [
  { id: 'struktur', h: 'Struktur & aktivitas Matahari',
    body: R`<p>Dari dalam ke luar: <b>inti</b> (~15 juta K, tempat fusi), <b>zona radiatif</b> (energi merambat sebagai foton yang terus diserap dan dipancarkan ulang), <b>zona konvektif</b> (plasma mendidih seperti air di panci), lalu <b>fotosfer</b> (~5800 K, "permukaan" yang kita lihat), <b>kromosfer</b>, dan <b>korona</b> (lebih dari 1 juta K; mengapa sepanas itu masih diteliti).</p>
    <p>Puncak sel konveksi terlihat sebagai <b>granulasi</b>. <b>Bintik Matahari</b> adalah daerah bermedan magnet kuat yang menghambat konveksi, sehingga lebih dingin (~4000 K) dan tampak gelap relatif terhadap sekelilingnya. Jumlahnya naik-turun dalam <b>siklus ~11 tahun</b>. Matahari berotasi diferensial: ~25 hari di khatulistiwa, ~35 hari dekat kutub; terlihat dari gerak bintik.</p>`,
    refs: [L.os('15-1-the-structure-and-composition-of-the-sun', '15.1 The Structure and Composition of the Sun'), L.web('NASA · Sun', 'https://science.nasa.gov/sun/', 'Situs NASA (EN)')] },
  { id: 'konstanta', h: 'Konstanta Matahari & luminositas',
    body: R`<p>Di luar atmosfer pada jarak 1 AU, tiap m² yang menghadap Matahari menerima <b>konstanta Matahari</b> \(S = 1361\) W/m². Energi ini tersebar merata ke kulit bola berjari-jari \(d\), jadi:</p>
    \[ L_\odot = 4\pi d^2 S = 4\pi(1{,}496\times10^{11})^2 (1361) = 3{,}83\times10^{26}\ \text{W} \]
    <p>Sebaliknya, fluks di planet berjarak \(d\) AU adalah \(S/d^2\): di Mars 586 W/m², di Jupiter ~50 W/m², di Neptunus ~1,5 W/m².</p>
    <p>Ini <b>hukum kuadrat terbalik</b>, sama seperti gravitasi, karena luas permukaan bola sebanding \(d^2\).</p>`,
    refs: [L.wen('Solar_constant', 'Solar constant'), L.os('16-1-sources-of-sunshine-thermal-and-gravitational-energy', '16.1 Sources of Sunshine')] },
  { id: 'energi', h: 'Sumber energi: fusi & skala waktu',
    body: R`<p>Di inti, rantai proton–proton menggabungkan 4 inti hidrogen menjadi 1 helium. Massa helium 0,7% lebih kecil dari 4 proton; selisih itu menjadi energi \(E = \Delta m\,c^2\). Matahari mengubah ~4 juta ton massa menjadi energi tiap detik.</p>
    <p><b>Umur nuklir</b>: jika ~10% hidrogen (di inti) bisa dibakar, \(t \approx \dfrac{0{,}1 \times 0{,}007\,M_\odot c^2}{L_\odot} \approx 10^{10}\) tahun.</p>
    <p>Sebelum fusi dikenal, Kelvin dan Helmholtz menduga Matahari bersinar karena menyusut perlahan (energi gravitasi). <b>Skala Kelvin–Helmholtz</b> \(t_{KH} \sim GM^2/(RL) \approx 3\times10^7\) tahun, terlalu singkat dibanding umur batuan Bumi. Kontradiksi ini jadi petunjuk bahwa ada sumber energi lain: nuklir.</p>`,
    refs: [L.os('16-1-sources-of-sunshine-thermal-and-gravitational-energy', '16.1 Sources of Sunshine'), L.wen('Proton%E2%80%93proton_chain', 'Proton–proton chain'), L.wen('Kelvin%E2%80%93Helmholtz_mechanism', 'Kelvin–Helmholtz mechanism')] },
  { id: 'suhu', h: 'Suhu kesetimbangan planet & albedo',
    body: R`<p>Planet menyerap sinar Matahari pada penampang \(\pi R_p^2\), memantulkan sebagian (fraksi <b>albedo</b> \(A\)), dan memancarkan kembali panas dari seluruh permukaan \(4\pi R_p^2\) sebagai benda hitam. Saat masuk = keluar:</p>
    \[ (1-A)\frac{L_\odot}{4\pi d^2}\pi R_p^2 = 4\pi R_p^2\sigma T^4 \;\Rightarrow\; T = T_\odot (1-A)^{1/4}\sqrt{\frac{R_\odot}{2d}} \]
    <p>Ukuran planet tidak berpengaruh! Bumi (A = 0,30): T ≈ 255 K = −18 °C, padahal rata-rata nyatanya ~288 K. Selisih 33 K itulah <b>efek rumah kaca</b> alami. Venus lebih ekstrem: T kesetimbangan ~230 K (albedo tinggi) tapi permukaannya 735 K.</p>`,
    lab: 'suhu',
    refs: [L.wen('Planetary_equilibrium_temperature', 'Planetary equilibrium temperature'), L.naap('habitablezones/habitablezones.html', 'Habitable Zones')] },
  { id: 'atmosfer', h: 'Retensi atmosfer & benda kecil',
    body: R`<p>Molekul gas bergerak acak dengan kecepatan rata-rata kuadrat \(v_\text{rms} = \sqrt{3kT/m}\). Aturan praktis: planet menahan suatu gas selama miliaran tahun jika \(v_\text{esc} \gtrsim 6\,v_\text{rms}\). Hidrogen (ringan) mudah lolos dari Bumi, sedangkan N₂ dan O₂ bertahan. Jupiter, dengan \(v_\text{esc}\) = 60 km/s dan suhu rendah, menahan hidrogen; Bulan tak menahan apa pun.</p>
    <p><b>Benda kecil</b>: sabuk asteroid (2,1–3,3 AU), Sabuk Kuiper (30–50 AU), Awan Oort (hipotetis, ~2000–100 000 AU). Komet periode pendek dari Sabuk Kuiper, periode panjang dari Awan Oort. <b>Hujan meteor</b> terjadi saat Bumi melintasi debu komet; meteornya tampak memancar dari satu titik, <b>radian</b>, efek perspektif seperti rel kereta yang bertemu di kejauhan.</p>`,
    refs: [L.naap('atmosphere/atmosphere.html', 'Atmospheric Retention'), L.os('7-1-overview-of-our-planetary-system', '7.1 Overview of Our Planetary System')] }
 ],
 formulas: [['Luminositas', R`L = 4\pi d^2 S`], ['Suhu kesetimbangan', R`T = T_\odot(1-A)^{1/4}\sqrt{R_\odot/2d}`], ['Kecepatan termal', R`v_\text{rms} = \sqrt{3kT/m}`], ['Umur nuklir', R`t \approx 0{,}1\cdot0{,}007\,Mc^2/L`], ['Kelvin–Helmholtz', R`t_{KH} \sim GM^2/RL`]],
 examples: [
  { q: R`Kenapa suhu kesetimbangan tidak bergantung pada jari-jari planet?`,
    sol: R`Daya yang diserap ∝ penampang \(\pi R^2\), daya yang dipancarkan ∝ luas permukaan \(4\pi R^2\). Keduanya sebanding \(R^2\), jadi \(R\) saling coret. Kerikil hitam dan planet hitam di jarak yang sama punya suhu kesetimbangan yang sama.` },
  { q: R`Apakah Bumi bisa menahan helium? (T eksosfer ~1000 K, m_He = 6,64 × 10⁻²⁷ kg)`,
    sol: R`\(v_\text{rms} = \sqrt{3 \times 1{,}381\times10^{-23} \times 1000/6{,}64\times10^{-27}} = 2{,}5\) km/s. \(6 v_\text{rms} = 15\) km/s > 11,2 km/s, jadi helium lolos perlahan. Itu sebabnya helium langka di atmosfer, dan kita menambangnya dari gas alam.` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Lapisan Matahari yang kita lihat sebagai "permukaan" disebut…`, o: ['Korona', 'Kromosfer', 'Fotosfer', 'Zona konvektif'], a: 2, sol: R`Fotosfer (~5800 K) adalah lapisan tempat gas menjadi cukup transparan sehingga cahaya lolos ke angkasa.` },
  { t: 'mc', lv: 'K', q: R`Bintik Matahari tampak gelap karena…`, o: ['Merupakan lubang menembus Matahari', 'Lebih dingin dari fotosfer sekitarnya', 'Tertutup awan', 'Bayangan planet Merkurius'], a: 1, sol: R`Medan magnet kuat menghambat konveksi, sehingga bintik lebih dingin (~4000 K vs 5800 K). Sebenarnya tetap sangat terang; hanya terlihat gelap dibanding sekelilingnya (\(\propto T^4\): ~23%).` },
  { t: 'num', lv: 'K', q: R`Dari konstanta Matahari 1361 W/m² dan 1 AU = 1,496 × 10¹¹ m, hitung luminositas Matahari (W).`, a: 3.83e26, tol: 0.01, unit: 'W', v: () => 4 * Math.PI * 1.496e11 ** 2 * 1361,
    sol: R`\(L = 4\pi d^2 S = 4\pi (1{,}496\times10^{11})^2 \times 1361 = 3{,}83\times10^{26}\) W.` },
  { t: 'num', lv: 'P', q: R`Berapa fluks Matahari di Mars (a = 1,524 AU)? (W/m²)`, a: 586, tol: 0.01, unit: 'W/m²', v: () => 1361 / 1.524 ** 2,
    sol: R`\(S_\text{Mars} = 1361/1{,}524^2 = 586\) W/m², sekitar 43% dari Bumi.` },
  { t: 'num', lv: 'P', q: R`Hitung suhu kesetimbangan Bumi (K) dengan A = 0,30, T☉ = 5772 K, R☉ = 6,957 × 10⁸ m.`, a: 255, tol: 0.01, unit: 'K', v: () => 5772 * 0.7 ** 0.25 * Math.sqrt(6.957e8 / (2 * 1.496e11)),
    sol: R`\(T = 5772 \times 0{,}7^{1/4} \times \sqrt{6{,}957\times10^8/(2 \times 1{,}496\times10^{11})} = 5772 \times 0{,}915 \times 0{,}0482 = 255\) K.` },
  { t: 'num', lv: 'P', q: R`Hitung suhu kesetimbangan Mars (K): A = 0,25, d = 1,524 AU.`, a: 210, tol: 0.015, unit: 'K', v: () => 5772 * 0.75 ** 0.25 * Math.sqrt(6.957e8 / (2 * 1.524 * 1.496e11)),
    sol: R`Cara cepat: \(T_\text{Mars} = 255\,\text{K} \times (0{,}75/0{,}70)^{1/4} / \sqrt{1{,}524} = 255 \times 1{,}017 / 1{,}234 = 210\) K. Membandingkan dengan Bumi menghemat hitungan.` },
  { t: 'num', lv: 'N', q: R`Hitung skala waktu Kelvin–Helmholtz Matahari, \(t = GM^2/(RL)\), dalam tahun.`, a: 3.1e7, tol: 0.04, unit: 'tahun', v: () => 6.674e-11 * 1.989e30 ** 2 / (6.957e8 * 3.828e26) / 3.156e7,
    sol: R`\(t = \dfrac{6{,}674\times10^{-11}(1{,}989\times10^{30})^2}{6{,}957\times10^8 \times 3{,}828\times10^{26}} = 9{,}9\times10^{14}\) s ≈ \(3{,}1\times10^7\) tahun, jauh lebih pendek dari umur Bumi (4,5 miliar tahun).` },
  { t: 'num', lv: 'P', q: R`Berapa \(v_\text{rms}\) molekul H₂ pada 300 K (km/s)? (m_H₂ = 3,35 × 10⁻²⁷ kg, k = 1,381 × 10⁻²³ J/K)`, a: 1.93, tol: 0.015, unit: 'km/s', v: () => Math.sqrt(3 * 1.381e-23 * 300 / 3.348e-27) / 1000,
    sol: R`\(v = \sqrt{3 \times 1{,}381\times10^{-23} \times 300 / 3{,}35\times10^{-27}} = 1{,}93\) km/s. \(6v = 11{,}6\) km/s ≈ \(v_\text{esc}\) Bumi, dan di eksosfer yang lebih panas H₂ makin cepat, jadi Bumi kehilangan hidrogennya perlahan.` },
  { t: 'mc', lv: 'K', q: R`Meteor dalam satu hujan meteor tampak memancar dari satu titik (radian) karena…`, o: ['Semua berasal dari satu bintang', 'Efek perspektif: partikel bergerak sejajar', 'Ditarik medan magnet Bumi', 'Radian adalah lokasi komet saat ini'], a: 1, sol: R`Partikel debu komet bergerak dalam lintasan hampir sejajar. Seperti rel kereta yang tampak bertemu di kejauhan, lintasan sejajar tampak memancar dari satu titik.` },
  { t: 'essay', lv: 'N', q: R`Perkirakan umur Matahari di deret utama jika hanya 10% hidrogennya (di inti) yang bisa difusikan dan efisiensi fusi 0,7%. Jelaskan setiap asumsi.`,
    sol: R`Energi tersedia \(E = 0{,}1 \times 0{,}007 \times M_\odot c^2 = 7\times10^{-4} \times 1{,}989\times10^{30} \times (3\times10^8)^2 = 1{,}25\times10^{44}\) J. Dengan luminositas tetap \(3{,}83\times10^{26}\) W: \(t = 3{,}3\times10^{17}\) s ≈ 10 miliar tahun. Asumsi: (1) hanya inti cukup panas untuk fusi; (2) 4H → He melepaskan 0,7% massa; (3) L konstan (sebenarnya Matahari makin terang ~1% per 100 juta tahun). Matahari kini berumur 4,6 miliar tahun: kira-kira di tengah hidupnya.` }
 ],
 think: ['Kalau Bumi diselimuti salju (A = 0,8), berapa suhu kesetimbangannya, dan apakah salju itu bisa mencair sendiri?', 'Kenapa korona jauh lebih panas daripada fotosfer di bawahnya?']
});

/* ============================== BAB 7 ============================== */
add({
 id: 'radiasi', no: 7, title: 'Radiasi & Spektroskopi', short: 'Radiasi', lv: 'K · P · N',
 lead: R`Cahaya bintang adalah surat yang membawa suhu, komposisi, kecepatan, bahkan medan magnet pengirimnya. Bab ini mengajarkan cara membacanya: hukum benda hitam untuk suhu dan ukuran, garis spektrum untuk komposisi, dan efek Doppler untuk gerak.`,
 sections: [
  { id: 'cahaya', h: 'Cahaya: gelombang dan foton',
    body: R`<p>Cahaya adalah gelombang elektromagnetik: \(c = \lambda\nu\), \(c = 2{,}998\times10^8\) m/s. Sekaligus berupa paket energi (foton): \(E = h\nu = hc/\lambda\). Rumus cepat: \(E[\text{eV}] \approx 1240/\lambda[\text{nm}]\).</p>
    <p>Spektrum EM dari panjang ke pendek: radio, gelombang mikro, inframerah, cahaya tampak (400–700 nm), ultraviolet, sinar-X, sinar gamma. Atmosfer Bumi hanya transparan di dua <b>jendela</b>: optik (plus sedikit IR dekat) dan radio. Itu sebabnya teleskop sinar-X, UV, dan sebagian besar IR harus di luar angkasa.</p>`,
    refs: [L.os('5-2-the-electromagnetic-spectrum', '5.2 The Electromagnetic Spectrum'), L.wen('Electromagnetic_spectrum', 'Electromagnetic spectrum')] },
  { id: 'bendahitam', h: 'Radiasi benda hitam: Wien & Stefan–Boltzmann',
    body: R`<p><b>Benda hitam</b> menyerap semua cahaya dan memancarkan spektrum yang hanya bergantung suhu (kurva Planck). Bintang mendekati benda hitam. Dua hukum turunannya:</p>
    \[ \lambda_\text{maks}\,T = 2{,}898\times10^{-3}\ \text{m K} \quad \text{(Wien)} \]
    \[ F = \sigma T^4, \qquad L = 4\pi R^2 \sigma T^4 \quad \text{(Stefan–Boltzmann)} \]
    <p>\(\sigma = 5{,}670\times10^{-8}\) W m⁻² K⁻⁴. Wien: makin panas, puncak makin biru (Matahari ~500 nm, Betelgeuse ~830 nm, Rigel ~240 nm). Stefan–Boltzmann: suhu 2× → tiap m² memancar 16×. Dari L dan T kita bisa menghitung <b>jari-jari bintang</b> yang tak pernah kita lihat sebagai piringan.</p>
    <p>Geser suhu di lab: perhatikan luas di bawah kurva (∝ T⁴) dan puncaknya bergeser.</p>`,
    lab: 'bendahitam',
    refs: [L.wid('Radiasi_benda_hitam', 'Radiasi benda-hitam'), L.naap('blackbody/blackbody.html', 'Blackbody Curves & UBV Filters'), L.wen("Wien%27s_displacement_law", "Wien's displacement law")] },
  { id: 'kirchhoff', h: 'Hukum Kirchhoff: tiga jenis spektrum',
    body: R`<p>(1) Benda padat/gas padat yang panas → <b>spektrum kontinu</b>. (2) Gas tipis panas → <b>spektrum emisi</b> (garis terang di panjang gelombang tertentu), contoh nebula HII yang merah karena Hα. (3) Gas tipis lebih dingin di depan sumber kontinu → <b>spektrum absorpsi</b> (garis gelap), contoh spektrum Matahari dengan garis Fraunhofer.</p>
    <p>Setiap unsur punya pola garis unik, seperti barcode. Begitulah helium ditemukan di Matahari (1868) sebelum di Bumi, dan begitulah kita tahu bintang sebagian besar terdiri dari hidrogen dan helium.</p>`,
    fig: 'spektrum',
    refs: [L.os('5-3-spectroscopy-in-astronomy', '5.3 Spectroscopy in Astronomy'), L.os('5-5-formation-of-spectral-lines', '5.5 Formation of Spectral Lines')] },
  { id: 'atom', h: 'Atom hidrogen & deret Balmer',
    body: R`<p>Elektron di atom hanya boleh berada di tingkat energi tertentu. Untuk hidrogen (model Bohr): \(E_n = -13{,}6\ \text{eV}/n^2\). Saat elektron turun dari \(n_2\) ke \(n_1\), atom memancarkan foton dengan</p>
    \[ \frac1\lambda = R_H\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right), \quad R_H = 1{,}097\times10^7\ \text{m}^{-1} \]
    <p>Deret <b>Lyman</b> (\(n_1 = 1\), UV), <b>Balmer</b> (\(n_1 = 2\), tampak: Hα 656,3 nm merah, Hβ 486,1 nm biru-hijau), <b>Paschen</b> (\(n_1 = 3\), IR). Garis Balmer paling kuat di bintang ~10 000 K (kelas A): lebih dingin, terlalu sedikit atom di n = 2; lebih panas, hidrogen terionisasi.</p>`,
    refs: [L.os('5-4-the-structure-of-the-atom', '5.4 The Structure of the Atom'), L.naap('hydrogen/hydrogen.html', 'Hydrogen Energy Levels'), L.wen('Balmer_series', 'Balmer series')] },
  { id: 'doppler', h: 'Efek Doppler & pelebaran garis',
    body: R`<p>Sumber yang menjauh meregangkan gelombangnya (pergeseran merah), yang mendekat memampatkannya (biru). Untuk \(v \ll c\):</p>
    \[ \frac{\Delta\lambda}{\lambda_0} = \frac{v_r}{c} \]
    <p>Hanya komponen <b>radial</b> yang terukur. Untuk kecepatan tinggi pakai bentuk relativistik \(1 + z = \sqrt{(1+\beta)/(1-\beta)}\), \(\beta = v/c\).</p>
    <p>Garis spektrum juga <b>melebar</b>: gerak termal atom (\(\Delta\lambda/\lambda \sim \sqrt{2kT/m}/c\)), rotasi bintang (satu sisi mendekat, sisi lain menjauh), tekanan (bintang raksasa bergaris lebih tipis daripada katai), dan medan magnet (efek Zeeman membelah garis).</p>`,
    refs: [L.os('5-6-the-doppler-effect', '5.6 The Doppler Effect'), L.wen('Doppler_broadening', 'Doppler broadening')] }
 ],
 formulas: [['Foton', R`E = hc/\lambda`], ['Wien', R`\lambda_\text{maks}T = 2{,}898\times10^{-3}\,\text{m K}`], ['Stefan–Boltzmann', R`L = 4\pi R^2\sigma T^4`], ['Rydberg', R`1/\lambda = R_H(1/n_1^2 - 1/n_2^2)`], ['Doppler', R`\Delta\lambda/\lambda_0 = v_r/c`]],
 examples: [
  { q: R`Sebuah bintang 10 000× lebih terang dari Matahari tapi suhunya sama (5772 K). Berapa jari-jarinya?`,
    sol: R`\(L \propto R^2T^4\) dengan T sama → \(R \propto \sqrt L = \sqrt{10\,000} = 100\,R_\odot\). Itulah bintang raksasa.` },
  { q: R`Galaksi menunjukkan garis Hα (656,3 nm) pada 669,4 nm. Berapa kecepatannya?`,
    sol: R`\(v = c\,\Delta\lambda/\lambda_0 = 3\times10^5 \times 13{,}1/656{,}3 = 5990\) km/s menjauh (z = 0,02, masih aman pakai rumus klasik).` }
 ],
 problems: [
  { t: 'num', lv: 'K', q: R`Suhu efektif Matahari 5772 K. Di panjang gelombang berapa (nm) pancarannya paling kuat?`, a: 502, tol: 0.01, unit: 'nm', v: () => 2.898e-3 / 5772 * 1e9,
    sol: R`\(\lambda = 2{,}898\times10^{-3}/5772 = 5{,}02\times10^{-7}\) m = 502 nm (hijau-biru). Matahari tampak putih karena memancarkan semua warna cukup kuat.` },
  { t: 'mc', lv: 'K', q: R`Urutan bintang dari terpanas ke terdingin berdasarkan warna:`, o: ['Merah, kuning, putih, biru', 'Biru, putih, kuning, merah', 'Kuning, biru, merah, putih', 'Putih, biru, merah, kuning'], a: 1, sol: R`Hukum Wien: puncak di λ pendek berarti suhu tinggi. Biru (>10 000 K), putih (~8000 K), kuning (~5800 K), merah (<3500 K).` },
  { t: 'mc', lv: 'K', q: R`Bintang dengan jari-jari sama seperti Matahari tetapi suhunya 2 kali lipat memiliki luminositas…`, o: ['2 L☉', '4 L☉', '8 L☉', '16 L☉'], a: 3, sol: R`\(L \propto T^4\): \(2^4 = 16\).` },
  { t: 'num', lv: 'P', q: R`Bintang dengan L = 100 L☉ dan T = 10 000 K. Berapa jari-jarinya (R☉)? (T☉ = 5772 K)`, a: 3.33, tol: 0.01, unit: 'R☉', v: () => 10 * (5772 / 10000) ** 2,
    sol: R`\(R/R_\odot = \sqrt{L/L_\odot}\,(T_\odot/T)^2 = 10 \times (0{,}5772)^2 = 3{,}33\).` },
  { t: 'num', lv: 'P', q: R`Garis Hα (diam: 656,28 nm) dari sebuah bintang teramati di 656,80 nm. Berapa kecepatan radialnya (km/s)?`, a: 237.5, tol: 0.01, unit: 'km/s', v: () => 2.998e5 * 0.52 / 656.28,
    sol: R`\(v = c\,\Delta\lambda/\lambda_0 = 2{,}998\times10^5 \times 0{,}52/656{,}28 = 238\) km/s, menjauh (pergeseran ke merah).` },
  { t: 'num', lv: 'K', q: R`Berapa energi (eV) foton cahaya hijau 500 nm?`, a: 2.48, tol: 0.01, unit: 'eV', v: () => 1239.84 / 500,
    sol: R`\(E = hc/\lambda = 1240\ \text{eV nm}/500\ \text{nm} = 2{,}48\) eV.` },
  { t: 'num', lv: 'P', q: R`Hitung panjang gelombang garis Hβ (transisi n = 4 → 2) dalam nm.`, a: 486, tol: 0.005, unit: 'nm', v: () => 1e9 / (1.097e7 * (1 / 4 - 1 / 16)),
    sol: R`\(1/\lambda = 1{,}097\times10^7 (1/4 - 1/16) = 2{,}057\times10^6\) m⁻¹ → λ = 486 nm.` },
  { t: 'mc', lv: 'P', q: R`Garis-garis gelap pada spektrum Matahari terbentuk karena…`, o: ['Gas panas tipis memancarkan cahaya', 'Gas yang lebih dingin di atmosfer Matahari menyerap panjang gelombang tertentu', 'Debu antarbintang', 'Bintik Matahari'], a: 1, sol: R`Hukum Kirchhoff ketiga: gas yang lebih dingin di depan sumber kontinu panas menyerap panjang gelombang khas → spektrum absorpsi (garis Fraunhofer).` },
  { t: 'essay', lv: 'N', q: R`Perkirakan pelebaran termal garis Hα (656,3 nm) di fotosfer Matahari (T = 5772 K) memakai \(v \sim \sqrt{2kT/m_H}\). Bandingkan dengan pergeseran akibat rotasi Matahari (2 km/s di khatulistiwa).`,
    sol: R`\(v = \sqrt{2 \times 1{,}381\times10^{-23} \times 5772 / 1{,}674\times10^{-27}} = 9{,}8\) km/s. \(\Delta\lambda = 656{,}3 \times 9{,}8/3\times10^5 = 0{,}021\) nm. Pergeseran rotasi: \(656{,}3 \times 2/3\times10^5 = 0{,}0044\) nm, ~5× lebih kecil. Jadi pada Matahari, pelebaran termal hidrogen mendominasi; pada bintang yang berotasi cepat (ratusan km/s, misalnya Vega/Altair), pelebaran rotasi yang dominan.` }
 ],
 think: ['Kenapa tidak ada bintang berwarna hijau, padahal ada bintang yang puncaknya di hijau?', 'Bagaimana kita bisa tahu suhu bintang yang terlalu jauh untuk diukur jari-jarinya?']
});

/* ============================== BAB 8 ============================== */
add({
 id: 'fotometri', no: 8, title: 'Fotometri & Jarak Bintang', short: 'Fotometri', lv: 'K · P · N',
 lead: R`Bintang yang tampak redup bisa jadi memang redup, atau sangat jauh. Bab ini memisahkan keduanya: magnitudo untuk mengukur kecerahan, paralaks untuk jarak terdekat, dan modulus jarak yang menghubungkan semuanya. Ini bab paling "rumus-sentris" di OSN, jadi latihan soal di sini sangat penting.`,
 sections: [
  { id: 'fluks', h: 'Fluks & hukum kuadrat terbalik',
    body: R`<p><b>Luminositas</b> \(L\) adalah daya total yang dipancarkan bintang (watt), sifat intrinsik. <b>Fluks</b> \(F\) adalah daya yang sampai per m² di tempat pengamat:</p>
    \[ F = \frac{L}{4\pi d^2} \]
    <p>Dua bintang identik, satu 10× lebih jauh, fluksnya 100× lebih kecil. Kecerahan yang kita lihat adalah fluks, bukan luminositas.</p>`,
    refs: [L.os('17-1-the-brightness-of-stars', '17.1 The Brightness of Stars')] },
  { id: 'magnitudo', h: 'Magnitudo semu & rumus Pogson',
    body: R`<p>Hipparkhos (~150 SM) membagi bintang ke magnitudo 1 (paling terang) sampai 6 (paling redup). Pogson (1856) membakukannya: beda 5 magnitudo = rasio fluks tepat 100×, jadi 1 magnitudo = \(100^{1/5} = 2{,}512\)×.</p>
    \[ m_1 - m_2 = -2{,}5\log\frac{F_1}{F_2} \qquad \frac{F_1}{F_2} = 10^{-0{,}4(m_1-m_2)} \]
    <p>Ingat: <b>angka lebih kecil = lebih terang</b>, bisa negatif (Sirius −1,46; Venus sampai −4,6; Bulan purnama −12,7; Matahari −26,74). Magnitudo bintang ganda <i>tidak</i> dijumlahkan; fluksnya yang dijumlahkan: \(m_\text{tot} = -2{,}5\log(10^{-0{,}4m_1} + 10^{-0{,}4m_2})\).</p>`,
    refs: [L.wid('Magnitudo_semu', 'Magnitudo semu'), L.os('17-1-the-brightness-of-stars', '17.1 The Brightness of Stars')] },
  { id: 'mutlak', h: 'Magnitudo mutlak & modulus jarak',
    body: R`<p><b>Magnitudo mutlak</b> \(M\) adalah magnitudo semu bintang jika diletakkan pada jarak 10 pc. Dengan Pogson dan kuadrat terbalik:</p>
    \[ m - M = 5\log d_\text{pc} - 5 \; (+A) \]
    <p>Besaran \(m - M\) disebut <b>modulus jarak</b>; \(A\) adalah peredupan oleh debu antarbintang (magnitudo). Matahari: \(M_V = 4{,}83\). Hubungan dengan luminositas: \(M_\text{bol} = 4{,}74 - 2{,}5\log(L/L_\odot)\).</p>
    <p>Trik: modulus jarak 0 → 10 pc, 5 → 100 pc, 10 → 1000 pc. Tiap tambah 5 magnitudo, jarak ×10.</p>`,
    refs: [L.wen('Distance_modulus', 'Distance modulus'), L.wen('Absolute_magnitude', 'Absolute magnitude'), L.naap('distance/distance.html', 'Cosmic Distance Ladder')] },
  { id: 'paralaks', h: 'Paralaks trigonometri',
    body: R`<p>Saat Bumi pindah ke sisi seberang orbitnya (6 bulan kemudian), bintang dekat tampak bergeser terhadap bintang latar yang jauh. Setengah dari pergeseran total itu disebut <b>sudut paralaks</b> \(p\). Dengan sudut kecil:</p>
    \[ d\,[\text{pc}] = \frac{1}{p\,[\text{detik busur}]} \]
    <p>Inilah definisi parsec. Bintang terdekat, Proxima Centauri, punya p = 0,768″ (d = 1,30 pc = 4,24 tc): semua paralaks lebih kecil dari 1″, sehingga baru terukur tahun 1838 (Bessel, 61 Cygni). Satelit Gaia kini mengukur paralaks dengan ketelitian puluhan mikrodetik busur untuk lebih dari satu miliar bintang.</p>`,
    lab: 'paralaks',
    refs: [L.os('19-2-surveying-the-stars', '19.2 Surveying the Stars'), L.wen('Stellar_parallax', 'Stellar parallax'), L.web('ESA Gaia', 'https://www.esa.int/Science_Exploration/Space_Science/Gaia', 'Situs ESA (EN)')] },
  { id: 'warna', h: 'Indeks warna, ekstingsi, & massa udara',
    body: R`<p>Magnitudo diukur lewat filter: U (ultraungu), B (biru), V (visual). <b>Indeks warna</b> \(B - V\) mengukur suhu: bintang biru panas punya B − V kecil/negatif (Rigel −0,03), bintang merah besar (Betelgeuse +1,85). Matahari +0,65.</p>
    <p><b>Ekstingsi antarbintang</b>: debu meredupkan dan memerahkan cahaya (biru lebih banyak dihamburkan). <b>Ekses warna</b> \(E(B-V) = (B-V)_\text{teramati} - (B-V)_0\), dan untuk debu Bima Sakti \(A_V \approx 3{,}1\,E(B-V)\).</p>
    <p><b>Ekstingsi atmosfer</b>: makin rendah bintang, makin tebal udara yang dilewati. Massa udara \(X \approx \sec z\) (z = jarak zenit), dan \(m = m_0 + kX\). Plot m terhadap X (garis Bouguer) → perpotongan di X = 0 memberi magnitudo di luar atmosfer.</p>`,
    refs: [L.os('17-2-colors-of-stars', '17.2 Colors of Stars'), L.wen('Color_index', 'Color index'), L.wen('Extinction_(astronomy)', 'Extinction (astronomy)')] },
  { id: 'gerak', h: 'Gerak diri & kecepatan ruang',
    body: R`<p><b>Gerak diri</b> \(\mu\) adalah pergeseran sudut bintang di langit per tahun (″/th). Mengubahnya menjadi kecepatan tangensial butuh jarak:</p>
    \[ v_t\,[\text{km/s}] = 4{,}74\,\mu[''/\text{th}]\,d[\text{pc}] \]
    <p>Angka 4,74 adalah km/s yang setara 1 AU/tahun. Gabungkan dengan kecepatan radial dari Doppler (Bab 7) untuk kecepatan ruang \(v = \sqrt{v_r^2 + v_t^2}\). Bintang Barnard memegang rekor gerak diri: 10,3″/tahun, selebar Bulan purnama dalam ~180 tahun.</p>`,
    refs: [L.wen('Proper_motion', 'Proper motion'), L.os('19-2-surveying-the-stars', '19.2 Surveying the Stars')] }
 ],
 formulas: [['Pogson', R`m_1-m_2 = -2{,}5\log(F_1/F_2)`], ['Modulus jarak', R`m-M = 5\log d - 5 + A`], ['Paralaks', R`d = 1/p`], ['Magnitudo bolometrik', R`M_\text{bol} = 4{,}74 - 2{,}5\log(L/L_\odot)`], ['Gerak diri', R`v_t = 4{,}74\,\mu d`], ['Ekstingsi', R`A_V \approx 3{,}1\,E(B-V)`]],
 examples: [
  { q: R`Seberapa terang Matahari jika dilihat dari Alpha Centauri (1,34 pc)?`,
    sol: R`\(m = M + 5\log d - 5 = 4{,}83 + 5\log 1{,}34 - 5 = 4{,}83 + 0{,}64 - 5 = 0{,}47\). Matahari akan menjadi bintang yang cukup terang, sedikit lebih redup dari Vega, di rasi Cassiopeia.` },
  { q: R`Dua bintang ganda dekat masing-masing magnitudo 3,0. Berapa magnitudo gabungannya?`,
    sol: R`Fluks dua kali lipat: \(m = 3{,}0 - 2{,}5\log 2 = 3{,}0 - 0{,}75 = 2{,}25\). Bukan 6!` }
 ],
 problems: [
  { t: 'mc', lv: 'K', q: R`Bintang A 100 kali lebih terang (fluksnya) daripada bintang B. Selisih magnitudonya \(m_B - m_A\) adalah…`, o: ['2', '2,5', '5', '100'], a: 2, sol: R`\(\Delta m = 2{,}5\log 100 = 5\). Definisi skala Pogson.` },
  { t: 'num', lv: 'P', q: R`Berapa kali Sirius (m = −1,46) lebih terang daripada Vega (m = +0,03)?`, a: 3.94, tol: 0.01, unit: '×', v: () => 10 ** (0.4 * 1.49),
    sol: R`\(F_S/F_V = 10^{0{,}4(0{,}03+1{,}46)} = 10^{0{,}596} = 3{,}94\).` },
  { t: 'num', lv: 'K', q: R`Bintang dengan m = 10 dan M = 0 (tanpa ekstingsi) berjarak berapa parsec?`, a: 1000, tol: 0.01, unit: 'pc', v: () => 10 ** ((10 - 0 + 5) / 5),
    sol: R`\(d = 10^{(m-M+5)/5} = 10^{3} = 1000\) pc.` },
  { t: 'num', lv: 'K', q: R`Paralaks Proxima Centauri 0,7685″. Berapa jaraknya dalam tahun cahaya? (1 pc = 3,2616 tc)`, a: 4.24, tol: 0.01, unit: 'tc', v: () => 3.2616 / 0.7685,
    sol: R`\(d = 1/0{,}7685 = 1{,}301\) pc × 3,2616 = 4,24 tc.` },
  { t: 'num', lv: 'P', q: R`Magnitudo semu Matahari −26,74. Hitung magnitudo mutlaknya. (1 AU = 1/206 265 pc)`, a: 4.83, abs: 0.02, v: () => -26.74 - 5 * Math.log10(1 / 206265) + 5,
    sol: R`\(M = m - 5\log d + 5 = -26{,}74 - 5\log(4{,}848\times10^{-6}) + 5 = -26{,}74 + 26{,}57 + 5 = 4{,}83\).` },
  { t: 'num', lv: 'P', q: R`Bintang ganda tak terpisah terdiri dari komponen bermagnitudo 1,0 dan 2,0. Berapa magnitudo gabungannya?`, a: 0.64, abs: 0.02, v: () => -2.5 * Math.log10(10 ** -0.4 + 10 ** -0.8),
    sol: R`\(m = -2{,}5\log(10^{-0{,}4} + 10^{-0{,}8}) = -2{,}5\log(0{,}398 + 0{,}158) = -2{,}5\log 0{,}557 = 0{,}64\).` },
  { t: 'num', lv: 'N', q: R`Bintang teramati V = 12,0 dengan \(M_V = 1{,}0\) dan \(E(B-V) = 0{,}5\). Dengan \(A_V = 3{,}1E(B-V)\), berapa jaraknya (pc)?`, a: 776, tol: 0.02, unit: 'pc', v: () => 10 ** ((12 - 1 - 3.1 * 0.5 + 5) / 5),
    sol: R`\(A_V = 1{,}55\). \(5\log d = m - M - A + 5 = 12 - 1 - 1{,}55 + 5 = 14{,}45\) → d = 10^{2,89} = 776 pc. Tanpa koreksi debu kita akan salah menghitung 1585 pc, dua kali lebih jauh!` },
  { t: 'num', lv: 'P', q: R`Bintang Barnard: gerak diri 10,3″/th, jarak 1,83 pc. Berapa kecepatan tangensialnya (km/s)?`, a: 89.3, tol: 0.01, unit: 'km/s', v: () => 4.74 * 10.3 * 1.83,
    sol: R`\(v_t = 4{,}74 \times 10{,}3 \times 1{,}83 = 89{,}3\) km/s.` },
  { t: 'mc', lv: 'K', q: R`Bintang X memiliki paralaks 0,05″ dan bintang Y 0,2″. Pernyataan yang benar:`, o: ['X 4 kali lebih dekat', 'Y 4 kali lebih dekat', 'Keduanya sama jauh', 'Tidak bisa ditentukan'], a: 1, sol: R`d = 1/p: X 20 pc, Y 5 pc. Paralaks lebih besar = lebih dekat.` },
  { t: 'essay', lv: 'N', q: R`Sebuah bintang diamati pada massa udara X = 1,2 dengan m = 5,32 dan pada X = 2,0 dengan m = 5,56. Tentukan koefisien ekstingsi k dan magnitudo di luar atmosfer \(m_0\). Kenapa k lebih besar di filter B daripada V?`,
    sol: R`\(m = m_0 + kX\): \(k = (5{,}56 - 5{,}32)/(2{,}0 - 1{,}2) = 0{,}30\) mag/massa udara. \(m_0 = 5{,}32 - 0{,}30 \times 1{,}2 = 4{,}96\). Dalam praktik, pakai banyak titik dan garis terbaik (garis Bouguer). Ekstingsi lebih kuat di biru karena hamburan Rayleigh ∝ λ⁻⁴: alasan yang sama kenapa langit biru dan Matahari terbenam merah.` }
 ],
 think: ['Kalau semua bintang punya luminositas sama, apakah langit malam akan terlihat berbeda? Mengapa astronom dulu tertipu?', 'Mengapa paralaks diukur dengan selang 6 bulan, bukan 1 tahun?']
});
})();
