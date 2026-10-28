# Ranufolio

Situs portofolio pribadi **Ranupane Rimba Argana**, founder [KukerjainAja](https://kukerjain.dev) — menampilkan proyek, aktivitas GitHub, resume, dan kontak untuk calon klien (UMKM/organisasi) maupun rekruter. Tersedia dalam dua bahasa: Indonesia (`/`) dan Inggris (`/en/`).

Situs live: https://ranupane.kukerjain.dev

## Fitur utama

- Beranda dengan hero, daftar proyek pilihan, tech stack, testimoni, dan CTA kontak via WhatsApp
- Halaman detail proyek dengan daftar isi otomatis dari data (`/proyek/<slug>`, `/en/projects/<slug>`)
- Halaman belajar, resume, dan kontak (ID & EN)
- Halaman detail pembicaraan/speaking (`/bicara/<slug>`, `/en/speaking/<slug>`)
- Grid kontribusi GitHub ("Shipping in public") yang diambil dari API publik saat build, lalu disegarkan di browser dengan cache localStorage 6 jam
- Form kontak opsional: tanpa konfigurasi, tombol kirim membuka email; dengan endpoint (Formspree/Web3Forms) pesan terkirim langsung dari halaman
- Pengaturan tema (terang/gelap/otomatis) dan efek kaca (bening/buram), plus switch bahasa ID/EN
- Ikon tech stack dan sosial media dari paket `simple-icons`

## Tech stack

- [Astro 5](https://astro.build/) — framework situs statis
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- TypeScript
- `simple-icons` untuk ikon SVG
- `@fontsource` (Geist, Wix Madefor Display/Text, Caveat) untuk font

## Menjalankan lokal

Butuh Node.js 18.20+ (disarankan 20 atau 22).

```bash
npm install
cp .env.example .env   # opsional, lihat bagian Form kontak
npm run dev             # http://localhost:4321
npm run build           # hasil build di dist/
npm run preview
```

### Environment variable (opsional)

Form kontak bisa jalan tanpa konfigurasi apa pun (tombol kirim akan membuka aplikasi email). Untuk mengirim pesan langsung dari halaman, isi `.env` dari `.env.example`:

- `PUBLIC_FORM_ENDPOINT` — endpoint layanan form, misalnya dari Formspree atau Web3Forms
- `PUBLIC_FORM_ACCESS_KEY` — access key, khusus kalau memakai Web3Forms

## Struktur folder

```
src/
  components/    # komponen Astro (section beranda, kartu proyek, header/footer, dll.)
  data/          # content.ts — semua teks, data proyek, testimoni, tech stack, kontak
  layouts/       # layout halaman (Base, FaizLayout, RapiPage)
  lib/           # logic non-UI, mis. contrib.ts untuk grid kontribusi GitHub
  pages/         # routing: beranda, proyek, belajar, resume, kontak, bicara + versi /en/
  styles/        # global.css — warna dan font
public/          # aset statis: font, favicon, foto, screenshot proyek
```

Untuk mengubah isi situs (teks, proyek, testimoni, tech stack, kontak), cukup edit `src/data/content.ts`.

## Deploy

Workflow GitHub Actions (`.github/workflows/deploy.yml`) berjalan otomatis setiap push ke `main`: build situs lalu `rsync` hasil `dist/` ke VPS lewat SSH, menggunakan secret `VPS_SSH_KEY`, `VPS_HOST`, dan `VPS_USER`.

## Kredit

Dibuat oleh [Ranupane Rimba Argana](https://ranupane.kukerjain.dev), founder [KukerjainAja](https://kukerjain.dev).
