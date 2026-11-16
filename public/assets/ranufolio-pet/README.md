# Ranufolio Pixel Pet — WebP Asset Pack

Paket aset **WebP transparan, lossless, pixel-perfect** untuk maskot oranye Ranufolio. Bentuk badan, dua mata, empat kaki, dan warna dasar `#D87756` mengikuti gambar yang sudah disetujui.

## Isi paket

- `frames/`: **41 pose statis WebP** dengan latar transparan.
- `animations/`: **10 animasi WebP**, seperti jalan kiri/kanan, diam, tidur, memanjat, melompat, berkedip, mengintip, dan disentuh.
- `layers/`: **5 layer WebP** untuk gerakan mata yang halus (`body-no-eyes`, `eyes-open`, `eyes-squint`, `eyes-closed`, `eyes-surprised`).
- `atlas.webp`: seluruh pose statis dalam satu gambar transparan (6 kolom × 7 baris).
- `manifest.json`: nama, posisi, urutan, dan durasi tiap frame.
- `preview.webp`: lembar contoh 12 pose pada latar gelap untuk melihat isi paket.

Semua pose statis berukuran **225 × 225 px**. Area maskot aslinya berada di `x:34–190`, `y:67–164`. Ruang transparan di sekelilingnya sengaja disamakan antar-frame agar animasi tidak bergeser ketika gambar diganti.

## Menaruh aset di Next.js

Ekstrak seluruh paket ke:

```text
public/assets/ranufolio-pet/
  frames/
  animations/
  layers/
  atlas.webp
  manifest.json
  preview.webp
```

Contoh untuk menampilkan pose statis:

```tsx
<img
  src="/assets/ranufolio-pet/frames/idle_01.webp"
  width={160}
  height={160}
  alt="Maskot Ranufolio"
  style={{ imageRendering: 'pixelated' }}
/>
```

Contoh untuk animasi berjalan otomatis:

```tsx
<img
  src="/assets/ranufolio-pet/animations/walk-right.webp"
  width={160}
  height={160}
  alt="Maskot berjalan ke kanan"
  style={{ imageRendering: 'pixelated' }}
/>
```

**Catatan ukuran:** kanvas asli 225px mengandung margin transparan. Pada ukuran elemen 160px, badan maskot terlihat sekitar 112px lebar, setara dengan demo sebelumnya.

## Mata bergerak halus dengan WebP saja

Untuk gerak atas-bawah/kiri-kanan yang kontinu, tumpuk **dua layer** berukuran sama. Gerakkan hanya `eyes-open.webp` dengan CSS `transform` dan ganti ke `eyes-squint.webp` saat cursor mendekat.

```tsx
<div style={{ position: 'relative', width: 160, height: 160 }}>
  <img src="/assets/ranufolio-pet/layers/body-no-eyes.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated' }} />
  <img src="/assets/ranufolio-pet/layers/eyes-open.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated', transform: `translate(${eyeX}px, ${eyeY}px)` }} />
</div>
```

`eyeX` dan `eyeY` adalah offset yang dihitung dari posisi cursor. Batasi masing-masing sekitar **-4 sampai +4 piksel layar** pada tampilan 160px. Untuk efek menyipit cukup mengganti file layer mata. Ini juga menjaga siluet asli karena tubuh tidak diubah.

## Daftar pose

| Kategori | Nama file di `frames/` |
|---|---|
| Diam/bernapas | `idle_01` sampai `idle_03` |
| Berkedip | `blink_01`, `blink_02` |
| Mata mengikuti cursor | `look_left`, `look_right`, `look_up`, `look_down`, `look_up_left`, `look_up_right`, `look_down_left`, `look_down_right` |
| Menyipit | `squint`, `squint_left`, `squint_right`, `squint_up`, `squint_down` |
| Jalan kanan | `walk_right_01` sampai `walk_right_04` |
| Jalan kiri | `walk_left_01` sampai `walk_left_04` |
| Lompat | `jump_01` sampai `jump_04` |
| Disentuh | `touch_01` sampai `touch_03` |
| Panjat | `climb_left_01`, `climb_left_02`, `climb_right_01`, `climb_right_02` |
| Mengintip | `peek_01`, `peek_02` |
| Tidur | `sleep_01`, `sleep_02` |

Semua nama pose di atas memiliki ekstensi `.webp`.

## Kontrol animasi interaktif

WebP menyimpan visual, tetapi perilaku tetap dikontrol JavaScript. Untuk mata mengikuti cursor, pilih satu dari delapan frame `look_*` berdasarkan sudut arah. Untuk mengikuti pointer secara sangat halus (bukan delapan arah), gunakan animasi mata SVG yang ada pada komponen `PixelPet.tsx` dari paket Next.js sebelumnya.

Contoh arah mata berbasis frame:

```ts
function direction(dx: number, dy: number) {
  const angle = Math.atan2(dy, dx);
  const dirs = ['right', 'down_right', 'down', 'down_left', 'left', 'up_left', 'up', 'up_right'];
  const index = ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
  return dirs[index];
}
// `/assets/ranufolio-pet/frames/look_${direction(dx,dy)}.webp`
```

Saat cursor mendekat, alihkan frame `look_*` ke `squint*`; saat maskot berjalan, alihkan ke animasi `walk-left.webp` atau `walk-right.webp`. Posisi karakter yang bergerak antarkartu tetap harus diatur dari JavaScript/CSS.

## Sprite atlas

Atlas berukuran **1350 × 1575 px**. Setiap sel berukuran **225 × 225 px**. Posisi tiap nama frame ada di `manifest.json` (`x`, `y`, `width`, `height`). Jika ditampilkan pada ukuran 160px per frame, gunakan `background-size: 960px 1120px` dan posisi setiap koordinat dikalikan `160/225`.

## Ketentuan kualitas

- Gambar WebP menggunakan encoding **lossless** dengan alpha/transparansi.
- Tepi pixel sengaja keras, tanpa gradien, blur, atau anti-alias karakter.
- Semua pose memakai kanvas identik supaya tidak bergetar karena perubahan ukuran.
- Versi animasi bisa dimainkan langsung sebagai WebP tanpa file video.

Paket ini disiapkan khusus untuk digunakan Rimba pada Ranufolio.
