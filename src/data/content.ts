// Semua isi halaman ada di file ini. Ganti teks, proyek, testimoni, dan kontak di sini saja.

export type Lang = 'id' | 'en';
export type Bilingual = { id: string; en: string };

export const SITE = 'https://ranufolio.kukerjain.dev';

export const person = {
  name: 'Ranupane Rimba Argana',
  short: 'Ranupane',
  brand: 'KukerjainAja',
  city: 'Wonogiri',
};

export const routes = {
  home: { id: '/', en: '/en/' } as Record<Lang, string>,
  project: (lang: Lang, slug: string) => (lang === 'id' ? `/proyek/${slug}/` : `/en/projects/${slug}/`),
};

export const contact = {
  whatsapp: '6282258442647', // 0822-5844-2647 dalam format internasional
  whatsappLabel: '0822-5844-2647',
  email: 'ranupaners@gmail.com',
  socials: [
    { label: 'GitHub', handle: 'ranupaners-arch', url: 'https://github.com/ranupaners-arch', icon: ['siGithub'], glyph: 'GH' },
    { label: 'LinkedIn', handle: 'ranupane-rimba-argana', url: 'https://www.linkedin.com/in/ranupane-rimba-argana', icon: ['siLinkedin'], glyph: 'in' },
    { label: 'Instagram', handle: '@_mberimbe', url: 'https://instagram.com/_mberimbe', icon: ['siInstagram'], glyph: 'IG' },
    { label: 'X', handle: '@rnpainvest_', url: 'https://x.com/rnpainvest_', icon: ['siX'], glyph: 'X' },
  ],
};

/* ---------- Proyek ---------- */

export type Section = { id: string; title: Bilingual; body: Bilingual[] };

export type Project = {
  slug: string;
  name: string;
  url: string;
  /** Latar tile dan header detail. Tiap proyek beda supaya grid terasa hidup. */
  gradient: string;
  /** Screenshot hero proyek, mis. '/projects/bentala-honey.png' (rasio 16:10). Kosong = pakai kerangka halaman. */
  image?: string;
  tagline: Bilingual;
  role: Bilingual;
  year?: string;
  sections: Section[];
};

const soon: Bilingual = {
  id: 'Deskripsi lengkap proyek ini sedang disiapkan.',
  en: 'The full write-up for this project is being prepared.',
};

// TODO: ganti nama, link, tagline, role, year, dan section dengan data proyek asli.
// Tambahkan screenshot ke public/projects/ lalu isi field `image`.
export const projects: Project[] = [
  {
    slug: 'proyek-1',
    name: 'lorem ipsum',
    url: 'https://kukerjain.dev',
    gradient: 'linear-gradient(135deg, #6a4cff 0%, #1a00b0 100%)',
    tagline: { id: 'Ringkasan proyek menyusul.', en: 'Project summary coming soon.' },
    role: { id: 'Developer', en: 'Developer' },
    sections: [{ id: 'overview', title: { id: 'Ringkasan', en: 'Overview' }, body: [soon] }],
  },
  {
    slug: 'proyek-2',
    name: 'lorem ipsum.dev',
    url: 'https://kukerjain.dev',
    gradient: 'linear-gradient(135deg, #ff9d6b 0%, #ff3d77 100%)',
    tagline: { id: 'Ringkasan proyek menyusul.', en: 'Project summary coming soon.' },
    role: { id: 'Developer', en: 'Developer' },
    sections: [{ id: 'overview', title: { id: 'Ringkasan', en: 'Overview' }, body: [soon] }],
  },
  {
    slug: 'bentala-honey',
    name: 'Bentala Honey',
    url: 'https://kukerjain.dev',
    gradient: 'linear-gradient(135deg, #ffe066 0%, #ffa41b 100%)',
    tagline: { id: 'Proyek untuk UMKM Bentala Honey.', en: 'A project for the small business Bentala Honey.' },
    role: { id: 'Developer', en: 'Developer' },
    sections: [{ id: 'overview', title: { id: 'Ringkasan', en: 'Overview' }, body: [soon] }],
  },
];

/* ---------- Testimoni ---------- */

export type Testimonial = {
  name: string;
  role: Bilingual;
  quote: Bilingual;
  /** slug proyek terkait; testimoni ini ikut tampil di halaman detail proyek tersebut */
  project?: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Ilham Imam Muttaqin',
    role: { id: 'Pemilik UMKM Bentala Honey', en: 'Owner, Bentala Honey' },
    project: 'bentala-honey',
    quote: {
      id: 'Awalnya saya ragu karena belum pernah menggunakan jasa seperti ini. Tapi tim kukerjain menjelaskan prosesnya dengan jelas sejak awal dan selalu fast response. Hasil akhirnya sesuai kebutuhan bisnis saya, bahkan ada beberapa masukan yang saya tidak pikirkan sebelumnya. Puas banget!',
      en: "At first I was hesitant because I had never used a service like this. But the Kukerjain team explained the process clearly from the start and always responded fast. The final result matched my business needs, and they even offered a few suggestions I hadn't thought of. Really satisfied!",
    },
  },
];

/* ---------- Tech stack ---------- */
// `icon` = nama ekspor di paket simple-icons (urutan = cadangan). Tanpa ikon, chip tampil dengan huruf awal.

export type TechItem = { name: string; icon?: string[] };

export const techGroups: { label: Bilingual; items: TechItem[] }[] = [
  {
    label: { id: 'Backend', en: 'Backend' },
    items: [
      { name: 'PHP', icon: ['siPhp'] },
      { name: 'WordPress', icon: ['siWordpress'] },
      { name: 'Laravel', icon: ['siLaravel'] },
      { name: 'Filament', icon: ['siFilament'] },
      { name: 'Node.js', icon: ['siNodedotjs'] },
      { name: 'REST API' },
    ],
  },
  {
    label: { id: 'Frontend dan mobile', en: 'Frontend and mobile' },
    items: [
      { name: 'HTML', icon: ['siHtml5'] },
      { name: 'CSS', icon: ['siCss', 'siCss3'] },
      { name: 'JavaScript', icon: ['siJavascript'] },
      { name: 'TypeScript', icon: ['siTypescript'] },
      { name: 'Astro', icon: ['siAstro'] },
      { name: 'React', icon: ['siReact'] },
      { name: 'Next.js', icon: ['siNextdotjs'] },
      { name: 'Tailwind', icon: ['siTailwindcss'] },
      { name: 'Bootstrap', icon: ['siBootstrap'] },
      { name: 'Flutter', icon: ['siFlutter'] },
      { name: 'Dart', icon: ['siDart'] },
    ],
  },
  {
    label: { id: 'Database', en: 'Database' },
    items: [
      { name: 'MySQL', icon: ['siMysql'] },
      { name: 'PostgreSQL', icon: ['siPostgresql'] },
      { name: 'Redis', icon: ['siRedis'] },
    ],
  },
  {
    label: { id: 'Tools', en: 'Tools' },
    items: [
      { name: 'Git & GitHub', icon: ['siGithub'] },
      { name: 'GitHub Actions', icon: ['siGithubactions'] },
      { name: 'Linux VPS', icon: ['siLinux'] },
      { name: 'Nginx', icon: ['siNginx'] },
      { name: 'Cloudflare', icon: ['siCloudflare'] },
      { name: 'Docker', icon: ['siDocker'] },
      { name: 'Figma', icon: ['siFigma'] },
      { name: 'Pen.dev' },
      { name: 'Cursor', icon: ['siCursor'] },
      { name: 'Claude Code', icon: ['siClaude'] },
      { name: 'Postman', icon: ['siPostman'] },
      { name: 'Android Studio', icon: ['siAndroidstudio'] },
      { name: 'CapCut', icon: ['siCapcut'] },
    ],
  },
];

/* ---------- Teks antarmuka ---------- */

export const copy = {
  id: {
    htmlLang: 'id',
    title: 'Ranupane Rimba Argana | Founder KukerjainAja',
    description:
      'Ranupane Rimba Argana, founder KukerjainAja di Wonogiri. Membangun website dan aplikasi untuk membantu UMKM tampil profesional di dunia digital.',
    skip: 'Lewati ke konten',
    nav: {
      projects: 'Proyek',
      about: 'Tentang',
      stack: 'Stack',
      contact: 'Kontak',
      aria: 'Navigasi utama',
      switchLabel: 'EN',
      switchAria: 'Read in English',
      homeAria: 'Ke beranda',
    },
    hero: {
      role: 'Founder KukerjainAja',
      title: 'Saya bikin website dan aplikasi untuk UMKM.',
      bio: 'Founder KukerjainAja yang membangun website dan aplikasi untuk membantu UMKM tampil profesional di dunia digital.',
      badge: 'Berbasis di Wonogiri, Jawa Tengah',
      ownerQ: 'Pemilik usaha?',
      ownerA: 'Mulai proyek',
      recruiterQ: 'Rekruter?',
      recruiterA: 'LinkedIn',
      learnQ: 'Belajar?',
      learnA: 'GitHub',
      photoAlt: 'Foto Ranupane Rimba Argana',
    },
    projects: {
      title: 'Proyek',
      lead: 'Pilih proyek untuk melihat detailnya.',
      view: 'Lihat detail',
      prev: 'Proyek sebelumnya',
      next: 'Proyek berikutnya',
    },
    detail: {
      back: 'Proyek',
      toc: 'Daftar isi',
      visit: 'Buka situs',
      clientWords: 'Kata klien',
      moreWork: 'Proyek lainnya',
      ctaTitle: 'Punya usaha yang butuh website seperti ini?',
      ctaText: 'Ceritakan kebutuhanmu lewat WhatsApp.',
      ctaButton: 'Mulai proyek',
    },
    about: {
      title: 'Tentang',
      body: [
        'Saya Ranupane Rimba Argana, founder KukerjainAja di Wonogiri.',
        'Saya membangun website dan aplikasi supaya usaha kecil terlihat profesional dan mudah ditemukan di dunia digital. Mulai dari tampilan, kode, sampai server tempat website berjalan.',
      ],
      doTitle: 'Yang saya kerjakan',
      does: [
        { title: 'Website untuk UMKM', text: 'Company profile, katalog produk, dan toko online yang cepat dan rapi di layar HP.' },
        { title: 'Aplikasi mobile', text: 'Aplikasi Android dan iOS dengan Flutter untuk kebutuhan operasional usaha.' },
        { title: 'Server dan perawatan', text: 'Hosting di VPS, Nginx, Cloudflare, dan deploy otomatis dengan GitHub Actions.' },
      ],
    },
    stack: { title: 'Tech stack' },
    testimonial: {
      title: 'Kata klien',
      prev: 'Testimoni sebelumnya',
      next: 'Testimoni berikutnya',
    },
    contact: {
      title: 'Punya usaha yang butuh website?',
      lead: 'Ceritakan kebutuhanmu. WhatsApp paling cepat, atau isi form di samping.',
      whatsapp: 'Chat lewat WhatsApp',
      formLink: 'Isi form',
      waText: 'Halo Ranupane, saya melihat portofolio Anda. Saya butuh bantuan untuk: ',
      form: {
        name: 'Nama',
        email: 'Email',
        message: 'Pesan',
        messagePlaceholder: 'Ceritakan singkat usaha dan kebutuhanmu',
        send: 'Kirim pesan',
        sending: 'Mengirim...',
        sent: 'Pesan terkirim. Saya balas secepatnya.',
        error: 'Pesan belum terkirim. Coba lagi atau hubungi lewat WhatsApp.',
        fallback: 'Aplikasi email kamu akan terbuka dengan pesan yang sudah terisi. Tinggal kirim.',
        subject: 'Pesan dari portofolio',
      },
    },
    footer: { socials: 'Sosial media', made: 'Dibuat di Wonogiri.' },
  },
  en: {
    htmlLang: 'en',
    title: 'Ranupane Rimba Argana | Founder of KukerjainAja',
    description:
      'Ranupane Rimba Argana, founder of KukerjainAja in Wonogiri, Indonesia. Building websites and apps that help small businesses look professional online.',
    skip: 'Skip to content',
    nav: {
      projects: 'Projects',
      about: 'About',
      stack: 'Stack',
      contact: 'Contact',
      aria: 'Main navigation',
      switchLabel: 'ID',
      switchAria: 'Baca dalam Bahasa Indonesia',
      homeAria: 'Go to home',
    },
    hero: {
      role: 'Founder of KukerjainAja',
      title: 'I build websites and apps for small businesses.',
      bio: 'Founder of KukerjainAja, building websites and apps that help small businesses look professional online.',
      badge: 'Based in Wonogiri, Central Java',
      ownerQ: 'Business owner?',
      ownerA: 'Start a project',
      recruiterQ: 'Recruiter?',
      recruiterA: 'LinkedIn',
      learnQ: 'Learning?',
      learnA: 'GitHub',
      photoAlt: 'Portrait of Ranupane Rimba Argana',
    },
    projects: {
      title: 'Projects',
      lead: 'Pick a project to see the details.',
      view: 'View details',
      prev: 'Previous project',
      next: 'Next project',
    },
    detail: {
      back: 'Projects',
      toc: 'Contents',
      visit: 'Visit site',
      clientWords: 'Client words',
      moreWork: 'More work',
      ctaTitle: 'Got a business that needs a website like this?',
      ctaText: 'Tell me what you need on WhatsApp.',
      ctaButton: 'Start a project',
    },
    about: {
      title: 'About',
      body: [
        "I'm Ranupane Rimba Argana, founder of KukerjainAja in Wonogiri.",
        'I build websites and apps so small businesses look professional and are easy to find online. That covers the design, the code, and the server the site runs on.',
      ],
      doTitle: 'What I do',
      does: [
        { title: 'Websites for small businesses', text: 'Company profiles, product catalogs, and online stores that load fast and read well on a phone.' },
        { title: 'Mobile apps', text: 'Android and iOS apps built with Flutter for the day-to-day needs of a business.' },
        { title: 'Servers and upkeep', text: 'Hosting on a VPS with Nginx and Cloudflare, plus automatic deploys with GitHub Actions.' },
      ],
    },
    stack: { title: 'Tech stack' },
    testimonial: {
      title: 'Client words',
      prev: 'Previous testimonial',
      next: 'Next testimonial',
    },
    contact: {
      title: 'Got a business that needs a website?',
      lead: 'Tell me what you need. WhatsApp is fastest, or use the form beside this.',
      whatsapp: 'Chat on WhatsApp',
      formLink: 'Use the form',
      waText: 'Hi Ranupane, I saw your portfolio. I need help with: ',
      form: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        messagePlaceholder: 'Briefly describe your business and what you need',
        send: 'Send message',
        sending: 'Sending...',
        sent: "Message sent. I'll reply as soon as I can.",
        error: 'The message was not sent. Try again or reach me on WhatsApp.',
        fallback: 'Your email app will open with the message filled in. Just hit send.',
        subject: 'Message from the portfolio',
      },
    },
    footer: { socials: 'Social media', made: 'Made in Wonogiri.' },
  },
} as const;
