# BLUEPRINT.md — Rencana Teknis Lengkap: Website Linnorea

Referensi teknis detail untuk implementasi. Dibaca bersama AGENT.md (aturan main) dan PRD.md (requirement produk).

## 1. Struktur Folder (Next.js App Router)

```
linnorea/
├── app/
│   └── [locale]/
│       ├── layout.tsx                # header, footer, lenis provider, lang switcher
│       ├── page.tsx                  # Home
│       ├── about/
│       │   └── page.tsx
│       ├── project/
│       │   ├── page.tsx              # listing
│       │   └── [slug]/
│       │       └── page.tsx          # detail proyek
│       ├── service/
│       │   └── page.tsx
│       └── product/
│           └── page.tsx
├── components/
│   ├── layout/                       # Header, Footer, LangSwitcher
│   ├── sections/                     # Hero, ProjectShowcase, ServiceSummary, dst
│   ├── animation/                    # LenisProvider, ScrollRevealWrapper, ParallaxImage
│   └── ui/                           # Button, Tag, GridItem, dst (Tailwind-based)
├── lib/
│   ├── sanity/
│   │   ├── client.ts
│   │   ├── queries.ts                # GROQ queries
│   │   └── image.ts                  # image URL builder
│   ├── i18n/
│   │   ├── config.ts                 # locale list, default locale
│   │   └── dictionaries/             # id.json, en.json, ja.json, fr.json, de.json, it.json
│   └── gsap/
│       └── scrollTriggers.ts         # reusable animation setups
├── sanity/                           # Sanity Studio (bisa jadi folder terpisah/repo terpisah)
│   ├── schemas/
│   │   ├── project.ts
│   │   ├── service.ts
│   │   ├── product.ts
│   │   ├── siteSettings.ts
│   │   └── localeString.ts           # object type reusable untuk field multi-bahasa
│   └── sanity.config.ts
├── public/
│   └── assets/                       # aset statis Linnorea (logo, favicon, dll)
├── tailwind.config.ts
└── next.config.js
```

Catatan: Sanity Studio boleh di-deploy sebagai project terpisah (lebih umum & lebih mudah maintenance) atau di-embed sebagai route `/studio` yang diproteksi. **Rekomendasi**: project terpisah, di-hosting di `studio.linnorea.com` via Sanity's hosted Studio — lebih simpel, tidak membebani bundle Next.js publik.

## 2. Sanity Schema (Content Model)

### 2.1 Tipe reusable: `localeString` / `localeText` / `localeBlock`
Setiap field yang butuh terjemahan memakai object dengan key per-locale:

```ts
// localeString.ts
export default {
  name: 'localeString',
  type: 'object',
  fields: [
    { name: 'id', type: 'string', title: 'Indonesian' },
    { name: 'en', type: 'string', title: 'English' },
    { name: 'ja', type: 'string', title: 'Japanese' },
    { name: 'fr', type: 'string', title: 'French' },
    { name: 'de', type: 'string', title: 'German' },
    { name: 'it', type: 'string', title: 'Italian' },
  ],
}
```
`localeText` dan `localeBlock` mengikuti pola sama tapi dengan `type: 'text'` / `type: 'array' of block` per field.

### 2.2 Schema: `project`
| Field | Tipe | Catatan |
|---|---|---|
| title | localeString | judul proyek |
| slug | slug | dari title (id atau en) |
| coverImage | image | untuk listing & hero detail |
| gallery | array of image | galeri proyek |
| heroVideo | file (opsional) | jika ada video showcase |
| category | reference / string | mis. residential, commercial, dsb |
| styleTag | localeString | mis. "Modern Tropical", "Compact Tropical", "American Classic" — ditampilkan di card listing |
| location | localeString | opsional |
| year | string | opsional |
| area | string | opsional, mis. "120 m²" |
| description | localeBlock | deskripsi panjang, untuk narasi concept/design story |
| scopeOfWork | localeString | opsional, mis. "Full interior design & build" |
| featured | boolean | untuk showcase di Home |
| order | number | urutan tampil di listing — juga dipakai untuk menentukan next/prev project di halaman detail |

> Catatan scope: filtering/sorting proyek berdasarkan kategori/style (lihat PRD FR13) masih **nice-to-have**, belum dikonfirmasi wajib untuk launch. Schema di atas tetap menyediakan `category` dan `styleTag` supaya filtering bisa ditambahkan kapan saja tanpa perlu migrasi data, tapi UI listing untuk fase awal cukup grid polos.

### 2.3 Schema: `service`
| Field | Tipe |
|---|---|
| title | localeString |
| slug | slug |
| icon/image | image |
| description | localeText |
| order | number |

### 2.4 Schema: `product`
| Field | Tipe |
|---|---|
| name | localeString |
| slug | slug |
| images | array of image |
| description | localeText |
| order | number |

### 2.5 Schema: `siteSettings` (singleton)
| Field | Tipe |
|---|---|
| logo | image |
| brandStatement | localeString |
| whatsappNumber | string | nomor WhatsApp untuk CTA konsultasi (FR6, FR11, FR18) |
| whatsappCtaText | localeString | teks default CTA, mis. "Have a Space in Mind?" |
| socialLinks | array | Instagram, Threads, LinkedIn, Pinterest (FR7) |
| seoDefaults | object (title/description per locale) |

## 3. Routing & i18n

- Base path: `/{locale}/...`, locale ∈ `{id, en, ja, fr, de, it}`, default `id`.
- Middleware Next.js mendeteksi locale dari URL, fallback ke `id` jika tidak dikenali.
- String statis UI (nav, tombol, label) → dictionary JSON per locale di `lib/i18n/dictionaries/`.
- Konten dinamis (judul/deskripsi proyek dll) → diambil langsung dari field locale yang sesuai di dokumen Sanity via GROQ (mis. `title.${locale}`), dengan fallback ke `en` atau `id` bila field kosong.
- Slug proyek/produk: gunakan satu slug kanonik (tidak per-bahasa) supaya URL detail proyek konsisten lintas bahasa: `/{locale}/project/{slug}`.

## 4. Breakdown Halaman (section-by-section)

### 4.1 Home
1. **Hero** — full-bleed image/video Linnorea, tagline singkat, subtle scroll-cue.
2. **Intro/Brand statement** — 1-2 kalimat filosofi Linnorea, muncul dengan fade/reveal saat di-scroll.
3. **Featured Projects** — showcase 3-5 proyek (`featured: true`), tiap item full-width/large image, transisi antar item saat scroll (mirip Ferrari "Range" section).
4. **Service Summary** — ringkasan layanan dengan tautan ke halaman Service.
5. **Product Summary** (opsional di Home, bisa juga dilewati kalau ingin fokus ke Project).
6. **CTA / Contact teaser** — ajakan kontak/konsultasi.
7. **Footer**.

### 4.2 About
1. **Hero editorial** — foto studio/tim atau visual representatif.
2. **Brand story** — teks philosphy, muncul bertahap per paragraf saat scroll (parallax/text-reveal ala Ferrari "History").
3. **Values/Approach** — beberapa poin pendekatan desain Linnorea, layout grid/alternating image-text.
4. **Team** (jika ada aset).
5. **CTA ke Project atau Contact**.

### 4.3 Project — Listing
1. **Hero judul halaman** ("Project"/terjemahannya).
2. **Filter** (kategori, opsional).
3. **Grid/List proyek** — tiap card: cover image, judul, kategori singkat; hover reveal detail singkat (ala Ferrari model grid).

### 4.4 Project — Detail
1. **Hero** — cover image/video proyek, judul, lokasi/tahun/style tag.
2. **Deskripsi** — narasi concept/design story (localeBlock).
3. **Galeri** — full-bleed gallery scroll, tiap gambar reveal saat masuk viewport.
4. **Spesifikasi** — lokasi, tahun, luas, scope of work (jika ada), ditampilkan sebagai list ringkas.
5. **CTA konsultasi** — tautan WhatsApp, konsisten dengan CTA pattern global (FR18).
6. **Next/Prev Project nav** — di akhir halaman, navigasi ke proyek berikutnya/sebelumnya berdasarkan `order`, meniru pola browsing model-ke-model Ferrari (FR17). Tidak perlu "Related Projects" acak — cukup next/prev linear ini.

### 4.5 Service
1. **Hero judul halaman**.
2. **List layanan** — tiap layanan sebagai section besar (image + deskripsi), full-bleed alternating layout, reveal per scroll.

### 4.6 Product
1. **Hero judul halaman**.
2. **Grid produk** — cover image, nama, link ke detail (jika nanti dibutuhkan halaman detail produk terpisah — untuk fase ini cukup grid + deskripsi singkat per-card, mengikuti scope PRD).

## 5. Strategi Animasi

- **Lenis** di-init di root layout (`components/animation/LenisProvider.tsx`), wrap seluruh app, sinkron dengan GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.
- **ScrollTrigger pattern umum**: tiap section besar punya wrapper (`ScrollRevealWrapper`) yang trigger fade-up/scale-in saat section masuk viewport (`start: 'top 80%'`), konsisten timing (`duration: 0.8-1.2s`, easing `power2.out`) di seluruh situs supaya terasa satu sistem, bukan campur-campur.
- **Parallax image** dipakai secukupnya di hero section (jangan berlebihan agar tidak mengganggu di mobile).
- **`prefers-reduced-motion`**: semua ScrollTrigger instance dicek terhadap media query ini; jika aktif, animasi diganti instant-show tanpa transisi.
- **Mobile**: Lenis & ScrollTrigger tetap aktif tapi durasi animasi dipercepat/disederhanakan (mis. skip parallax berat) demi performa & baterai.

## 6. Integrasi Sanity ↔ Next.js

- Gunakan Next.js **ISR (Incremental Static Regeneration)** atau **on-demand revalidation** via Sanity webhook: setiap kali admin publish/update dokumen di Studio, webhook memanggil endpoint revalidate di Next.js supaya halaman terkait di-refresh tanpa perlu redeploy.
- GROQ query disusun per halaman di `lib/sanity/queries.ts`, contoh untuk listing proyek:
  ```groq
  *[_type == "project"] | order(order asc) {
    title, slug, coverImage, category, featured
  }
  ```
- Gambar diambil lewat Sanity Image URL builder (`lib/sanity/image.ts`) dengan parameter resize/format otomatis (webp, responsive sizes) untuk performa.

## 7. Urutan Eksekusi yang Disarankan

1. Setup Next.js + Tailwind + struktur folder dasar (tanpa konten dulu, pakai placeholder).
2. Setup Sanity project + schema (project, service, product, siteSettings) + deploy Studio.
3. Koneksi Sanity ↔ Next.js (client, queries, image builder) dengan data dummy.
4. Bangun layout dasar (Header, Footer, LangSwitcher) + routing i18n.
5. Bangun Home dengan konten dummy, pasang Lenis + GSAP dasar.
6. Bangun Project (listing + detail) — ini halaman paling kompleks, jadi acuan pola untuk halaman lain.
7. Bangun About, Service, Product.
8. Polish animasi lintas halaman, uji `prefers-reduced-motion` & mobile.
9. Isi terjemahan konten awal (minimal ID + EN dulu, sisanya menyusul).
10. QA performa (Core Web Vitals) & aksesibilitas sebelum go-live.

## 8. Hal yang Perlu Dikonfirmasi Sebelum/Selama Eksekusi

- Aset Linnorea aktual (logo, foto, video) — kapan tersedia untuk dipasang menggantikan placeholder.
- Konten awal proyek/layanan/produk untuk mengisi Sanity pertama kali (proyek yang sudah ada: G House, 11 House, V Living).
- Keputusan hosting Studio: subdomain Sanity-hosted vs embed di Next.js (rekomendasi: Sanity-hosted, lihat §1).
- **Palet warna & tipografi brand final** — belum ditentukan di luar arahan "editorial/dark ala Ferrari"; jangan pakai merah Ferrari. Blocker untuk styling final, tapi tidak menghambat setup struktur/komponen.
- Apakah Project Listing butuh filtering (lihat catatan di §2.2) atau grid polos cukup untuk launch.
- Apakah About page menyertakan bio tim/founder.
- Apakah Product/Linnorea Living butuh e-commerce di masa depan (untuk fase ini: presentational only, tanpa cart).
- Sumber/proses penerjemahan ke 6 bahasa — terjemahan mesin hanya boleh dipakai sebagai draft internal, bukan copy final.
