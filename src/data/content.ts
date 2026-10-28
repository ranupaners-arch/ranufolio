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

export type PageKey = 'learn' | 'resume' | 'contact';

export const routes = {
  home: { id: '/', en: '/en/' } as Record<Lang, string>,
  project: (lang: Lang, slug: string) => (lang === 'id' ? `/proyek/${slug}/` : `/en/projects/${slug}/`),
  page: (lang: Lang, key: PageKey) =>
    lang === 'id'
      ? `/${{ learn: 'belajar', resume: 'resume', contact: 'kontak' }[key]}/`
      : `/en/${{ learn: 'learn', resume: 'resume', contact: 'contact' }[key]}/`,
  talk: (lang: Lang, slug: string) => (lang === 'id' ? `/bicara/${slug}/` : `/en/speaking/${slug}/`),
  /** Pasangan path ID/EN untuk satu halaman, dipakai tombol bahasa dan hreflang. */
  pair: (fn: (lang: Lang) => string): Record<Lang, string> => ({ id: fn('id'), en: fn('en') }),
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
  /** true = teks pengisi, bukan testimoni asli */
  placeholder?: boolean;
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
  // PLACEHOLDER: dua testimoni di bawah ini hanya pengisi tata letak slider "1 / N". Ganti atau hapus.
  {
    name: 'Lorem Ipsum',
    role: { id: 'Dolor sit amet', en: 'Dolor sit amet' },
    placeholder: true,
    quote: {
      id: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation.',
      en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation.',
    },
  },
  {
    name: 'Consectetur Elit',
    role: { id: 'Sed do eiusmod', en: 'Sed do eiusmod' },
    placeholder: true,
    quote: {
      id: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
      en: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
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
      home: 'Beranda',
      learn: 'Belajar',
      resume: 'Resume',
      contact: 'Kontak',
      aria: 'Navigasi utama',
      switchLabel: 'EN',
      switchAria: 'Read in English',
      homeAria: 'Ke beranda',
      settings: 'Tema, kaca, dan bahasa',
    },
    menu: {
      theme: 'Tema',
      light: 'Terang',
      dark: 'Gelap',
      auto: 'Otomatis',
      glass: 'Kaca',
      clear: 'Bening',
      frosted: 'Buram',
      language: 'Bahasa',
    },
    hero: {
      role: 'Founder KukerjainAja',
      title: 'Saya bikin website dan aplikasi untuk UMKM.',
      bio: 'Founder KukerjainAja yang membangun website dan aplikasi untuk membantu UMKM tampil profesional di dunia digital.',
      badge: 'Berbasis di Wonogiri, Jawa Tengah',
      ownerQ: 'Pemilik usaha?',
      ownerA: 'Mulai proyek',
      recruiterQ: 'Rekruter?',
      recruiterA: 'Resume',
      learnQ: 'Belajar?',
      learnA: 'Belajar',
      photoAlt: 'Foto Ranupane Rimba Argana',
    },
    projects: {
      title: 'Proyek pilihan',
      lead: 'Pilih proyek untuk melihat detailnya.',
      view: 'Lihat detail',
      prev: 'Proyek sebelumnya',
      next: 'Proyek berikutnya',
    },
    detail: {
      back: 'Proyek pilihan',
      toc: 'Daftar isi',
      contents: 'Isi halaman',
      tryIt: 'Buka',
      zoom: 'Perbesar',
      close: 'Tutup',
      copy: 'Salin',
      copied: 'Tersalin',
      lightboxPrev: 'Gambar sebelumnya',
      lightboxNext: 'Gambar berikutnya',
      available: 'Terbuka untuk proyek baru',
      write: 'Tulis pesan',
      contactCard: 'Kontak',
      challenge: 'Tantangan',
      approach: 'Pendekatan',
      result: 'Hasil',
      figureCaption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
    resume: {
      title: 'Resume',
      lead: 'Ringkasan pengalaman, pendidikan, dan teknologi yang saya pakai.',
      experience: 'Pengalaman',
      education: 'Pendidikan',
      stack: 'Stack',
      current: 'Saat ini',
      showMore: (n: number) => `Tampilkan ${n} lagi`,
      showLess: 'Sembunyikan',
    },
    learn: {
      title: 'Belajar',
      lead: 'Materi belajar untuk pemula. Halaman ini masih berisi teks pengisi.',
      kicker: 'Kursus gratis',
      start: 'Mulai kursus',
      open: 'Buka materi',
      inside: 'Isi kursus',
      module: 'Modul',
      lessons: (n: number) => `${n} pelajaran`,
      soon: 'Segera hadir',
      forYou: 'Cocok untukmu jika',
      asks: 'Yang dibutuhkan',
      license: 'Lisensi CC BY-NC-SA 4.0.',
      preview: 'Pratinjau',
      loadPreview: 'Muat pratinjau',
      previewText: 'Pratinjau memuat halaman materi di sini tanpa meninggalkan situs.',
      newTab: 'Buka di tab baru',
      workshop: 'Workshop',
      workshopOpen: 'Lihat detail',
      community: 'Ikuti',
    },
    contactPage: {
      title: 'Mulai proyek',
      lead: 'Ceritakan usahamu dan apa yang perlu dibantu aplikasinya. Saya balas secepatnya.',
      need: 'Apa yang kamu butuhkan?',
      needs: ['Aplikasi web', 'Sistem admin atau POS', 'Aplikasi mobile', 'Belum tahu'],
      namePlaceholder: 'Budi Santoso',
      emailPlaceholder: 'budi@toko.id',
      messagePlaceholder: 'Usahamu bergerak di bidang apa, dan apa yang perlu dibantu aplikasi?',
      sendAnother: 'Kirim lagi',
      sentTitle: 'Terima kasih',
      whatsappTitle: 'WhatsApp',
      whatsappText: 'Paling cepat. Membuka chat dengan pesan yang sudah terisi.',
      emailTitle: 'Email',
    },
    speaking: {
      back: 'Workshop',
      toc: ['Ringkasan', 'Kenapa sesi ini', 'Yang dibahas'],
      date: 'Tanggal',
      venue: 'Tempat',
      host: 'Penyelenggara',
      format: 'Format',
      audience: 'Peserta',
    },
  },
  en: {
    htmlLang: 'en',
    title: 'Ranupane Rimba Argana | Founder of KukerjainAja',
    description:
      'Ranupane Rimba Argana, founder of KukerjainAja in Wonogiri, Indonesia. Building websites and apps that help small businesses look professional online.',
    skip: 'Skip to content',
    nav: {
      home: 'Home',
      learn: 'Learn',
      resume: 'Resume',
      contact: 'Contact',
      aria: 'Main navigation',
      switchLabel: 'ID',
      switchAria: 'Baca dalam Bahasa Indonesia',
      homeAria: 'Go to home',
      settings: 'Theme, glass and language',
    },
    menu: {
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      glass: 'Glass',
      clear: 'Clear',
      frosted: 'Frosted',
      language: 'Language',
    },
    hero: {
      role: 'Founder of KukerjainAja',
      title: 'I build websites and apps for small businesses.',
      bio: 'Founder of KukerjainAja, building websites and apps that help small businesses look professional online.',
      badge: 'Based in Wonogiri, Central Java',
      ownerQ: 'Business owner?',
      ownerA: 'Start a project',
      recruiterQ: 'Recruiter?',
      recruiterA: 'Resume',
      learnQ: 'Learning?',
      learnA: 'Learn',
      photoAlt: 'Portrait of Ranupane Rimba Argana',
    },
    projects: {
      title: 'Selected work',
      lead: 'Pick a project to see the details.',
      view: 'View details',
      prev: 'Previous project',
      next: 'Next project',
    },
    detail: {
      back: 'Selected work',
      toc: 'Contents',
      contents: 'Contents',
      tryIt: 'Open',
      zoom: 'Zoom',
      close: 'Close',
      copy: 'Copy',
      copied: 'Copied',
      lightboxPrev: 'Previous image',
      lightboxNext: 'Next image',
      available: 'Available for new work',
      write: 'Write a message',
      contactCard: 'Contact',
      challenge: 'The challenge',
      approach: 'Approach',
      result: 'Result',
      figureCaption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
    resume: {
      title: 'Resume',
      lead: 'A summary of my experience, education, and the tools I work with.',
      experience: 'Experience',
      education: 'Education',
      stack: 'Stack',
      current: 'Current',
      showMore: (n: number) => `Show ${n} more`,
      showLess: 'Show less',
    },
    learn: {
      title: 'Learn',
      lead: 'Learning material for beginners. This page still holds placeholder text.',
      kicker: 'Free course',
      start: 'Start the course',
      open: 'Open the material',
      inside: "What's inside",
      module: 'Module',
      lessons: (n: number) => `${n} lessons`,
      soon: 'Coming soon',
      forYou: 'Made for you if',
      asks: 'What it asks of you',
      license: 'Licensed CC BY-NC-SA 4.0.',
      preview: 'Preview',
      loadPreview: 'Load preview',
      previewText: 'The preview loads the material page here without leaving the site.',
      newTab: 'Open in new tab',
      workshop: 'Workshop',
      workshopOpen: 'View details',
      community: 'Follow',
    },
    contactPage: {
      title: 'Start a project',
      lead: 'Tell me about your business and what the app should help with. I reply as soon as I can.',
      need: 'What do you need?',
      needs: ['Web app', 'Admin system or POS', 'Mobile app', 'Not sure yet'],
      namePlaceholder: 'Jane Doe',
      emailPlaceholder: 'jane@shop.com',
      messagePlaceholder: 'What does your business do, and what should the app help with?',
      sendAnother: 'Send another',
      sentTitle: 'Thank you',
      whatsappTitle: 'WhatsApp',
      whatsappText: 'Fastest. Opens a chat with a message already started.',
      emailTitle: 'Email',
    },
    speaking: {
      back: 'Workshop',
      toc: ['Overview', 'Why this session', 'What I covered'],
      date: 'Date',
      venue: 'Venue',
      host: 'Host',
      format: 'Format',
      audience: 'Audience',
    },
  },
} as const;

/* ---------- PLACEHOLDER: isi pengisi untuk tata letak, ganti dengan data asli ---------- */

const lorem = (text: string): Bilingual => ({ id: text, en: text });
const L1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const L2 = 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const L3 = 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

export type ResumeEntry = {
  title: string;
  place: string;
  role: Bilingual;
  period: Bilingual;
  current?: boolean;
  bullets: Bilingual[];
};

export const resume: { experience: ResumeEntry[]; education: ResumeEntry[] } = {
  experience: [
    {
      title: person.brand,
      place: person.city,
      role: { id: 'Founder', en: 'Founder' },
      period: { id: '20XX — Sekarang', en: '20XX — Present' },
      current: true,
      bullets: [lorem(L1), lorem(L2), lorem(L3), lorem('Duis aute irure dolor in reprehenderit in voluptate velit esse.')],
    },
    {
      title: 'Lorem Ipsum Studio',
      place: 'Dolor sit',
      role: { id: 'Web Developer', en: 'Web Developer' },
      period: { id: '20XX — 20XX', en: '20XX — 20XX' },
      bullets: [lorem(L1), lorem(L2), lorem(L3)],
    },
    {
      title: 'Consectetur Adipiscing',
      place: 'Amet elit',
      role: { id: 'Magang', en: 'Intern' },
      period: { id: '20XX', en: '20XX' },
      bullets: [lorem(L1), lorem(L2)],
    },
  ],
  education: [
    {
      title: 'Lorem Ipsum University',
      place: 'Dolor sit',
      role: { id: 'Sarjana Lorem Ipsum', en: 'Bachelor of Lorem Ipsum' },
      period: { id: '20XX — Sekarang', en: '20XX — Present' },
      current: true,
      bullets: [lorem(L1), lorem(L2)],
    },
    {
      title: 'Dolor Sit Amet High School',
      place: 'Consectetur',
      role: { id: 'Jurusan Lorem', en: 'Lorem major' },
      period: { id: '20XX — 20XX', en: '20XX — 20XX' },
      bullets: [lorem(L1), lorem(L2)],
    },
  ],
};

export const learnCourse = {
  title: lorem('Lorem ipsum dolor sit amet'),
  text: lorem(`${L1} ${L2}`),
  note: lorem(L3),
  /** Tautan kursus: sementara ke GitHub, ganti dengan alamat materi sebenarnya. */
  url: contact.socials[0].url,
  modules: [
    { title: lorem('Lorem ipsum'), lessons: [lorem('Dolor sit amet')] },
    {
      title: lorem('Consectetur adipiscing'),
      lessons: [lorem('Sed do eiusmod'), lorem('Tempor incididunt'), lorem('Ut labore et dolore'), lorem('Magna aliqua'), lorem('Ut enim ad minim'), lorem('Quis nostrud')],
    },
    { title: lorem('Excepteur sint'), lessons: [] },
    { title: lorem('Occaecat cupidatat'), lessons: [] },
  ],
  forYou: [lorem(L1), lorem(L2), lorem(L3)],
  asks: [
    { label: { id: 'Waktu', en: 'Time' }, text: lorem('Lorem ipsum 00 menit') },
    { label: { id: 'Alat', en: 'Tools' }, text: lorem('Dolor sit amet') },
    { label: { id: 'Bahasa', en: 'Language' }, text: lorem('Consectetur') },
  ],
};

export type Talk = {
  slug: string;
  title: Bilingual;
  tagline: Bilingual;
  meta: Bilingual;
  facts: { date: Bilingual; venue: Bilingual; host: Bilingual; format: Bilingual; audience: Bilingual };
  paragraphs: Bilingual[];
  covered: Bilingual[];
  gradient: string;
};

export const talks: Talk[] = [
  {
    slug: 'lorem-ipsum-workshop',
    title: lorem('Lorem ipsum dolor sit amet workshop'),
    tagline: lorem(L1),
    meta: { id: 'Jan 20XX · Wonogiri · 00 peserta', en: 'Jan 20XX · Wonogiri · 00 people' },
    facts: {
      date: { id: '00 Januari 20XX', en: 'January 00, 20XX' },
      venue: lorem('Lorem Ipsum Hall'),
      host: lorem('Dolor Sit Community'),
      format: { id: 'Workshop 00 jam', en: '00-hour workshop' },
      audience: lorem('Consectetur adipiscing'),
    },
    paragraphs: [lorem(`${L1} ${L2} ${L3}`), lorem('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.')],
    covered: [lorem(L1), lorem(L2), lorem(L3), lorem('Excepteur sint occaecat cupidatat non proident.')],
    gradient: 'linear-gradient(135deg, #8fa7ff 0%, #2a3a8c 100%)',
  },
];

/** Blok pengisi untuk halaman detail proyek (di luar section milik proyek). */
export const detailPlaceholder = {
  challenge: [lorem(`${L1} ${L2} ${L3}`)],
  approach: [lorem('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.')],
  code: {
    file: 'lorem.ts',
    lines: [
      '// lorem ipsum dolor sit amet',
      'export function lorem(ipsum: string) {',
      '  const dolor = ipsum.trim();',
      '  return `${dolor} sit amet`;',
      '}',
    ],
  },
  list: [lorem(L1), lorem(L2), lorem(L3)],
  quote: lorem('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'),
  quoteBy: lorem('Lorem Ipsum'),
  callout: lorem('Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
  result: [lorem(`${L2} ${L3}`)],
};
