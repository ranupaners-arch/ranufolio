# Ranufolio Pixel Pet V2

## Audit dan batas integrasi

Repository ini memakai **Astro 7 + TypeScript + Tailwind v4**, bukan Next.js App Router/React. Komponen mengikuti Astro dan memakai custom element dengan lifecycle `connectedCallback`/`disconnectedCallback`. Tidak ada library animasi atau dependensi runtime baru. `typescript` dan `@astrojs/check` ditambahkan sebagai dev dependencies agar typecheck dapat dijalankan.

Referensi demo mengembalikan **HTTP 401 (Sign in required)** saat diperiksa. Implementasi menggunakan spesifikasi V2 serta aset asli yang sudah tersedia di `public/assets/ranufolio-pet/`: 41 pose, 10 animasi, 5 layer, dan atlas. Aset tidak digambar ulang, dikonversi ke PNG, atau diduplikasi lagi. Folder sumber `pet-assets/` yang sudah ada tetap dipertahankan.

Integrasi hanya menambahkan dua plane absolut pada carousel proyek. Dimensi, isi, tipografi, gradien, dan struktur card tetap. Class posisi/z-index diperlukan untuk oklusi. Implementasi `ClaudeWalker` dan `portfolio/PixelPet.astro` lama digantikan oleh komponen berikut.

## File dan tanggung jawab

| File dalam `src/components/pixel-pet/` | Tanggung jawab |
| --- | --- |
| `PixelPet.astro` | Markup WebP, button aksesibel, plane depan/belakang, custom element dan lifecycle |
| `config.ts` | Parameter, tipe, dan manifest asli |
| `cards.ts` | Koordinat card aktual, viewport, titik mendarat, area klik yang tidak menutupi link |
| `camera.ts` | Mengikuti patroli di carousel, mendahulukan swipe/wheel/navigasi manual |
| `eyes.ts` | Arah cursor aktual, interpolasi, batas offset, ekspresi, interval kedip |
| `motion.ts` | Lintasan parabola, putaran dan jalur panjat, gerak masuk/keluar dari belakang card |
| `state-machine.ts` | Satu mode utama dan snapshot untuk menghentikan/melanjutkan gerak dengan aman |
| `controller.ts` | Perencanaan gerak, input, tidur, satu RAF, jeda, observer, cleanup |
| `renderer.ts` | Layer mata, frame atlas, pose, zZ dan 12 partikel pixel |

`SelectedWork.astro` memasang komponen dengan `lang="id"`, `"en"`, atau `"ar"`. Label interaksi mengikuti bahasa halaman.

## Perilaku

Mode utama: **idle, walk, jump, climb, hide, sleep, react**. Hanya controller yang menggerakkan posisi. Animasi kaki menggunakan frame asli dalam manifest, dengan arah kiri/kanan yang sesuai.

- Mata memakai tubuh tanpa mata dan tepat satu overlay ekspresi. Offset mengikuti cursor sebenarnya dengan interpolasi eksponensial, maksimum ±4px pada ukuran kanvas 160px (diskalakan menurut ukuran tampil). Ketika sprite bermata dipakai, overlay dinonaktifkan.
- Berjalan 70px/detik, berhenti acak, menoleh saat cursor mendekat, lalu melanjutkan kegiatan. Setelah lompatan awal, giliran kegiatan mengikuti `behaviorCycle`: sembunyi → lompat → panjat → lompat → jalan → lompat. Rencana yang sudah dipilih dipertahankan sampai selesai; tidak ada tenggat patroli yang menggantikannya.
- Lompat menggunakan dua card yang diukur langsung, kurva melengkung dan squash/stretch ringan, dengan durasi 600–1100ms. Target diperbarui saat ukuran/scroll berubah. Patroli pertama langsung memprioritaskan pindah card; berikutnya perpindahan diselingi kegiatan lokal yang mendapat giliran penuh. Pendekatan sebelum lompat dibatasi 1,4 detik. Semua card menjadi tujuan, termasuk yang awalnya di luar layar. Carousel mengikuti maskot secara bertahap tanpa mengubah ukuran card; swipe, wheel dan tombol navigasi manual menghentikan camera-follow selama 2,5 detik. Pergantian arah di ujung rute membuat patroli bolak-balik. Di layar ≤639px camera-follow baru aktif setelah pengguna berinteraksi dengan carousel, sehingga card pertama tidak bergeser saat halaman dimuat.
- Memanjat dimulai dari tepi card terdekat, memutar tubuh 90°, menuruni dan menaiki sisi card dengan kaki yang tetap beranimasi, lalu kembali tegak. Memilih tepi terdekat menghindari waktu berjalan yang menghabiskan seluruh periode terjaga.
- Bersembunyi memindahkan **gambar yang sama** ke plane di belakang card. Tubuh turun secara fisik dan tertutup card; tidak menggunakan opacity untuk memalsukan sembunyi. Button tetap di plane depan dan dibatasi pada bagian yang terlihat.
- Setelah sekitar 11 detik tanpa input, maskot menyelesaikan lintasan yang sedang dijalani lalu tidur di permukaan card (paling lambat sekitar 15 detik untuk menyelesaikan sembunyi/panjat dengan aman). Mata menyipit lalu menutup, bubble zZ muncul, tubuh bernapas halus. Input membangunkannya; posisi antrean dan rencana yang belum selesai tetap dipertahankan.
- Klik/tap/Enter/Spasi memicu ekspresi terkejut, lompatan kecil, dan 12 partikel. Reaksi menghentikan satu lintasan aktif dan melanjutkannya setelah selesai. Klik berulang mengganti reaksi yang sama, bukan menumpuk loop/partikel.
- Halaman tersembunyi atau carousel di luar viewport menghentikan RAF dan timer. Ketika kembali, waktu animasi dilanjutkan, bukan dilewati. `prefers-reduced-motion` menonaktifkan perjalanan otomatis dan efek gerak, tetapi menyisakan mata yang mengikuti cursor dan respons klik statis.
- Semua listener memakai `AbortController`; RAF, timer, `IntersectionObserver` dan `ResizeObserver` dibersihkan saat komponen dilepas atau Astro mengganti halaman.

Komponen juga menyediakan API untuk host/integrasi: `document.querySelector('ranufolio-pixel-pet').play(action, direction?)`. `action` mengikuti mode selain `idle`; arah opsional `-1`/`1`. Permintaan saat lintasan sibuk diantrikan; `react` dapat langsung menginterupsi dengan aman. API ini juga dipakai untuk menguji jalur otonom tanpa menunggu seluruh siklus; pengujian siklus otomatis dilakukan terpisah tanpa API ini.

## Pengaturan

Ubah `PET_CONFIG` di `config.ts`:

| Parameter | Default | Pengaruh |
| --- | --- | --- |
| `walkSpeed` | 70 | Kecepatan CSS px/detik |
| `behaviorCycle` | hide → jump → climb → jump → walk → jump | Urutan bergiliran, tanpa membatalkan rencana aktif |
| `activityPauseMin` / `activityPauseMax` | 200 / 350 | Jeda acak antarkegiatan yang sudah selesai |
| `hideApproachMax` | 450 | Lama mendekat sebelum mulai bersembunyi pada posisi sekarang |
| `jumpApproachMax` | 1400 | Batas lama berjalan mendekati tujuan sebelum melompat |
| `cameraMargin` / `cameraResponse` | 80 / 20 | Batas area aman dan respons camera-follow carousel |
| `manualScrollPause` | 2500 | Jeda camera-follow setelah swipe/wheel/navigasi manual |
| `eyeOffsetAt160` | 4 | Batas pergeseran mata pada kanvas 160px |
| `eyeResponse` | 14 | Kecepatan interpolasi (lebih besar lebih responsif) |
| `eyeSensitivity` | 95 | Jarak cursor untuk mencapai offset besar |
| `squintDistance` | 85 | Radius mata menyipit |
| `blinkMin` / `blinkMax` | 2000 / 6000 | Rentang interval kedip |
| `idleMin` / `idleMax` | 550 / 1400 | Lama jeda acak |
| `sleepAfter` | 11000 | Inaktivitas sebelum tidur; sisakan waktu menyelesaikan lintasan agar tetap dalam rentang 10–15 detik |
| `jumpMin` / `jumpMax` | 600 / 1100 | Rentang durasi lompat |
| `climbDuration` / `hideDuration` | 3200 / 4000 | Lama memanjat / bersembunyi |
| `reactionDuration` / `particleCount` | 850 / 12 | Reaksi sentuhan |

## Pemeriksaan lokal

```bash
npm run typecheck
npm run build
npm run test:pet
```

Browser check memakai Chromium terpasang dan DevTools Protocol, tanpa paket Playwright (tidak tersedia di repo). Set `CHROME_BIN` jika executable bukan `/usr/bin/chromium`. Opsional: `PIXEL_PET_CDP_URL` untuk browser QA yang sudah berjalan, `PIXEL_PET_ARTIFACTS` untuk lokasi screenshot/report. Default artefak: `/tmp/ranufolio-pet-v2-qa/`, semuanya screenshot WebP.

Pengujian dimulai dengan patroli otonom ke seluruh card pada desktop, mobile, dan RTL: tanpa `play()`, tanpa input buatan untuk menunda tidur, dan tanpa scroll manual. Pengujian tersebut juga menunggu sembunyi dan panjat selesai secara otomatis sebelum tidur, memverifikasi exit pertama dari kedua mode setelah durasi penuh. Pengujian selanjutnya mencakup input mouse/touch/keyboard nyata, arah mata dan kedip, kecepatan/kaki, flight tanpa teleport dan titik mendarat, interupsi di tengah flight/panjat, oklusi, tidur/wake, reduced motion, ukuran card/overflow, lifecycle cleanup, mobile swipe, ID/EN/AR, exception console dan 404 aset lokal.

Typecheck awal mengungkap masalah lama: tipe terjemahan terlalu literal, properti `hidden` pada DOM modern, key terjemahan ganda, dan label tech stack yang tidak ada. Perbaikannya kecil dan tidak mengubah desain card. Dua hint unused dari kode lama tidak menghalangi typecheck.

Push, merge, dan deploy hanya dilakukan atas instruksi pengguna.

## Hasil verifikasi V2

- [x] Bentuk dan warna memakai aset WebP asli; file identik dengan paket sumber.
- [x] Tidak ada PNG di aset maskot; kelima layer mempunyai alpha/transparansi.
- [x] Mata mengikuti arah kiri, kanan, atas, bawah, dan diagonal dengan offset terbatas.
- [x] Mata menyipit ketika cursor dekat dan kembali normal ketika jauh.
- [x] Kedip otomatis teramati dalam rentang interval yang ditetapkan.
- [x] Berjalan kanan/kiri dengan kaki beranimasi pada sekitar 70px/detik.
- [x] Arah wajah/frame mengikuti arah perjalanan.
- [x] Lompatan melengkung antarkartu, tanpa teleport dan dengan kaki mendarat tepat pada tepi card.
- [x] Memanjat 90°, bergerak turun/naik, dan kembali tegak.
- [x] Tubuh tertutup card pada plane belakang dan mengintip secara fisik.
- [x] Tidur otomatis dalam rentang 10–15 detik dan bangun ketika ada input.
- [x] Klik, touch, Enter, dan Spasi menghasilkan ekspresi terkejut, hop kecil, serta 12 partikel.
- [x] Satu mode utama; interupsi flight/panjat/sembunyi dan klik berulang diuji.
- [x] Tidak ada exception JavaScript, console error, atau aset lokal 404 pada sesi pengujian.
- [x] Desktop 1280px, tablet 820px, mobile 390px, swipe mobile, dan halaman ID/EN/AR lolos.
- [x] Dimensi card tidak berubah, tidak ada overflow horizontal baru, lifecycle dan reduced motion lolos.

Browser suite juga memverifikasi RAF berhenti ketika offscreen/tab tersembunyi. Screenshot WebP mencakup patroli desktop/mobile/RTL, desktop, tablet, mobile, jump, climb, hide, sleep, reaction; laporan mesin dan urutan/waktu perpindahan card ada di `report.json` pada folder artefak.

Untuk urutan/frekuensi kegiatan, ubah `behaviorCycle` di config; jeda antarkegiatan melalui `activityPauseMin`/`activityPauseMax`, dan jeda perhatian melalui `idleMin`/`idleMax`. Jangan mengganti rencana yang masih menunggu diselesaikan dengan tenggat global. Kecepatan, sensitivitas mata, dan interval kedip tidak memerlukan perubahan renderer.

### Regresi patroli dan perilaku yang tidak terlihat

Regresi sebelumnya membuktikan perpindahan card, tetapi belum memastikan sembunyi/panjat mendapat giliran otomatis. Tenggat patroli 3,2 detik bisa membatalkan rencana berjalan menuju kegiatan itu. Tenggat tersebut dihapus dan diganti siklus bergiliran, pendekatan sembunyi yang singkat, serta pemilihan tepi panjat terdekat.

Browser kini mengamati satu periode terjaga tanpa `play()`, swipe, atau aktivitas yang menunda tidur. Hasil terakhir pada desktop, mobile dan RTL:

- Card kedua dicapai sekitar 2,1 detik.
- Sembunyi dimulai sekitar 2,8 detik dan **selesai** sekitar 6,8–6,9 detik.
- Card ketiga dicapai sekitar 9,3–9,7 detik.
- Panjat dimulai sekitar 9,6–10,1 detik dan **selesai** sekitar 12,8–13,3 detik.
- Tidur menyusul sekitar 12,8–13,3 detik, tetap dalam rentang 10–15 detik tanpa input.

Typecheck/build dan 19 kelompok uji browser lolos. Waktu bisa sedikit berbeda karena jeda antarkegiatan diacak. Urutan mode dan waktu masuk/keluar direkam dalam `report.json`; bukti otomatis ada di `auto-hide-*.webp` dan `auto-climb-*.webp`.
