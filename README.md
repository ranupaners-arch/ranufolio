# Portofolio Ranupane Rimba Argana

Astro 5 + Tailwind CSS v4. Dua bahasa: Indonesia di `/`, Inggris di `/en/`.
Situs: https://ranufolio.kukerjain.dev (sudah diset di `astro.config.mjs`).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # hasil di dist/
npm run preview
```

Butuh Node.js 18.20+ (disarankan 20 atau 22). Untuk Cloudflare Pages: build command `npm run build`, output `dist`.

## Struktur halaman

| Rute (ID)        | Rute (EN)              | Isi                                                        |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| `/`              | `/en/`                 | Hero, Proyek, Tentang, Stack, Testimoni, Kontak            |
| `/proyek/<slug>` | `/en/projects/<slug>`  | Detail proyek: daftar isi, hero, ringkasan, testimoni, CTA |

## Mengubah isi

Semua teks, proyek, testimoni, tech stack, dan kontak ada di satu file: `src/data/content.ts`.
Tampilan ada di `src/components/`, warna dan font di `src/styles/global.css`.

### Proyek

Edit array `projects`: `name`, `url`, `tagline`, `role`, `year`, dan `sections` (Ringkasan, Masalah, Proses, Hasil, atau section lain, dalam ID dan EN). Halaman detail dibuat otomatis dari data ini.

**Screenshot:** taruh gambar (rasio 16:10) di `public/projects/`, lalu isi field `image: '/projects/nama.png'`. Tanpa `image`, tile menampilkan kerangka halaman sebagai pengganti.

**Testimoni:** edit array `testimonials`. Isi `project: '<slug>'` supaya testimoni juga tampil di halaman detail proyek itu. Kalau testimoninya lebih dari satu, penghitung "1 / n" dan tombol panah muncul otomatis.

### Tech stack

Edit `techGroups`. Ikon diambil dari paket `simple-icons` lewat nama ekspor (mis. `siLaravel`). Nama yang tidak ada di versi paket tampil sebagai chip dengan huruf awal, jadi tidak merusak build.

### Form kontak

Tanpa konfigurasi, tombol kirim membuka aplikasi email dengan pesan yang sudah terisi. Supaya pesan terkirim langsung dari halaman:

1. Daftar di layanan form (Formspree atau Web3Forms).
2. Salin `.env.example` jadi `.env`, isi `PUBLIC_FORM_ENDPOINT` (dan `PUBLIC_FORM_ACCESS_KEY` untuk Web3Forms).
3. Di Cloudflare Pages, isi variabel yang sama di Settings, Environment variables, lalu deploy ulang.

### Foto hero

`public/ranupane.jpg` sudah memakai latar gelap. Ganti file ini kalau punya foto baru (rasio 4:5 paling pas).
