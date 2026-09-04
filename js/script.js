// =========================================================
// Navigasi antar section seperti "halaman" (bukan scroll panjang):
// klik nav / Next / Back akan mengganti section yang tampil.
// Section navigation like separate "pages":
// clicking nav / Next / Back swaps which section is visible.
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('main .section[id]'));
  const navLinks = document.querySelectorAll('.primary-nav a[data-nav]');
  const jumpLinks = document.querySelectorAll('a[href^="#"]'); // nav, Next/Back, skip-link
  const yearEl = document.getElementById('year');
  const header = document.querySelector('.site-header');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Ukur tinggi asli header (navbar), lalu simpan ke CSS variable ---
  // Ini penting karena tinggi navbar bisa berubah (misalnya saat font
  // Quicksand baru selesai dimuat) — jadi tidak boleh diasumsikan tetap,
  // atau konten section di bawahnya akan ketutup navbar. Footer tidak
  // perlu diukur karena posisinya statis (bukan fixed), ikut alur halaman.
  // --- Measure the real header (navbar) height and store it as a CSS
  // variable. This matters because the navbar's height can shift (e.g.
  // once the Quicksand webfont finishes loading) — assuming a fixed
  // height would let section content sit underneath the navbar. The
  // footer doesn't need this since it's static, not fixed, and just
  // follows the normal page flow. ---
  function syncChromeHeight() {
    if (header) {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
  }

  syncChromeHeight();
  window.addEventListener('resize', syncChromeHeight);
  window.addEventListener('orientationchange', syncChromeHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncChromeHeight);
  }
  if ('ResizeObserver' in window && header) {
    new ResizeObserver(syncChromeHeight).observe(header);
  }

  function showSection(id, { focus = false } = {}) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains('section')) return;

    sections.forEach((sec) => {
      sec.classList.toggle('is-active', sec === target);
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.nav === id);
    });

    history.replaceState(null, '', '#' + id);

    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    // Halaman baru selalu mulai dari atas (di bawah navbar).
    // Dijalankan lewat double requestAnimationFrame supaya scroll di-reset
    // SETELAH browser selesai layout ulang & fokus elemen baru — beberapa
    // browser (terutama Safari mobile) suka menggeser scroll sendiri saat
    // fokus berpindah walau preventScroll:true sudah dipakai.
    // Every "page" switch starts scrolled to the top (below the navbar).
    // Run via a double requestAnimationFrame so the reset happens AFTER
    // the browser finishes re-layout & focusing the new element — some
    // browsers (Safari on mobile especially) nudge the scroll position on
    // focus even with preventScroll:true.
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => requestAnimationFrame(resetScroll));
  }

  // Cegat semua link internal (#id) supaya ganti section, bukan scroll browser
  // Intercept every internal (#id) link so it swaps sections instead of scrolling
  jumpLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return; // biarkan link lain (kalau ada) jalan normal

    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(id, { focus: true });
    });
  });

  // Section awal: ikuti #hash di URL kalau valid, kalau tidak default ke Home
  // Initial section: follow the URL hash if valid, otherwise default to Home
  const initialId = location.hash ? location.hash.slice(1) : 'home';
  showSection(document.getElementById(initialId) ? initialId : 'home');
});

// =========================================================
// EN / ID language switch
// =========================================================
const i18n = {
  "nav-home": "Beranda", "nav-profile": "Profil", "nav-contact": "Kontak",
  "nav-education": "Pendidikan", "nav-skills": "Keahlian", "nav-hobbies": "Hobi", "nav-projects": "Proyek",
  "skip": "Lewati ke konten",
  "home-cta": "Lihat Profil", "home-caption": "It's me!",
  "home-major": "Program Studi Teknik Informatika",
  "home-univ": "Universitas Jabal Ghafur (UNIGHA)",
  "profile-kicker": "Profil", "profile-h2": "Tentang Saya",
  "profile-p1": "Hai, saya Feliza!",
  "profile-p2": "Saya mahasiswa Informatika semester 4 di Universitas Jabal Ghafur. Saya suka mengeksplorasi teknologi, mempelajari hal baru, dan mengubah ide-ide acak menjadi sesuatu yang nyata.",
  "profile-p3": "Saya sangat tertarik pada pengembangan web, pemrograman, pemecahan masalah, dan sisi kreatif dari teknologi. Saya suka membangun proyek bukan cuma agar berfungsi, tapi juga untuk memahami cara kerjanya di balik layar dan bagaimana bisa dibuat lebih baik. Belakangan ini saya mulai menjelajahi lebih banyak bidang komputasi sambil mengerjakan proyek sendiri dan perlahan menemukan bagian teknologi mana yang paling saya sukai.",
  "profile-p5": "Saya masih terus belajar dan mencari arah untuk mengembangkan kemampuan saya, tapi saya tahu saya ingin terus berkarya, berkembang, dan menantang diri sendiri. Di luar coding, biasanya saya belajar hal baru, dengerin playlist favorit, atau merencanakan proyek kecil berikutnya. Halaman ini adalah rumah kecil untuk semua itu — jangan sungkan untuk lihat-lihat!",
  "profile-p4": "Saya juga sedang mengembangkan hal di luar coding: kemampuan bahasa Inggris saya. Saya ingin lebih baik dalam mendengar, berbicara, dan mengungkapkan pikiran secara alami. Bagi saya, belajar bahasa Inggris bukan cuma soal grammar atau kosakata — tapi soal bisa berkomunikasi dengan percaya diri, mengakses lebih banyak ilmu, dan terhubung dengan orang di luar lingkungan saya.",
  "contact-kicker": "Kontak", "contact-h2": "Mari Terhubung!",
  "contact-lead": "Punya pertanyaan, ide proyek, atau cuma mau say hi? Hubungi saya di sini:",
  "back": "Kembali", "next": "Berikutnya",
  "edu-kicker": "Pendidikan", "edu-h2": "Perjalanan Pendidikan Saya",
  "edu-elementary": "Sekolah Dasar", "edu-junior": "Sekolah Menengah Pertama",
  "edu-vocational": "Sekolah Menengah Kejuruan", "edu-university": "Universitas",
  "edu-ongoing": "Semester 4 · Berlangsung",
  "skills-kicker": "Keahlian", "skills-h2": "Yang Saya Miliki",
  "skill1-t": "Pengembangan Web",
  "skill1-d": "Pengetahuan dasar HTML, CSS, dan JavaScript untuk membangun halaman web yang sederhana, responsif, dan interaktif.",
  "skill2-t": "Komunikasi",
  "skill2-d": "Kemampuan dasar berbahasa Inggris, mampu memahami informasi teknis dan menyampaikan ide secara jelas baik lisan maupun tulisan.",
  "skill3-t": "Microsoft Office / Google Workspace",
  "skill3-d": "Cukup mahir menggunakan Microsoft Office dan Google Workspace untuk membuat dokumen, presentasi, spreadsheet, dan mengelola file.",
  "skill4-t": "Git / Version Control",
  "skill4-d": "Pemahaman dasar Git dan GitHub untuk mengelola file proyek dan melacak perubahan.",
  "skill5-t": "Pemecahan Masalah",
  "skill5-d": "Mampu menganalisis masalah, berpikir logis, dan menemukan solusi praktis untuk berbagai tantangan.",
  "skill6-t": "Kemampuan Beradaptasi",
  "skill6-d": "Mau dan mampu mempelajari alat, teknologi, dan pendekatan baru saat menghadapi tantangan baru.",
  "hobbies-kicker": "Hobi", "hobbies-h2": "Minat Saya",
  "hobby1": "Membaca", "hobby2": "Musik", "hobby3": "Proyek Coding", "hobby4": "Sastra Inggris",
  "hobby5": "Bermain Game", "hobby6": "Menulis Jurnal",
  "projects-kicker": "Proyek", "projects-h2": "Hal yang Telah Saya Buat",
  "projects-lead": "Ini sekilas dari sesuatu yang telah saya buat — lebih banyak lagi akan datang!",
  "proj1-d": "Template website ulang tahun yang lucu dan interaktif — galeri foto, surat cinta, daftar alasan, dan confetti!",
  "proj2-d": "Website rental papan ucapan akrilik custom — pengguna bisa memilih desain, mengubah tulisan dengan live preview, dan langsung booking lewat WhatsApp.",
  "view-project": "Demo Live", "visit-github": "Repositori GitHub",
  "proj-soon": "Proyek segera hadir",
  "footer-name": "Portofolio Feliza.", "footer-copy": "Portofolio Pribadi."
};

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('langToggle');
  if (!toggleBtn) return;

  const originals = new Map();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    originals.set(el, el.textContent);
  });

  let lang = 'en';
  toggleBtn.addEventListener('click', () => {
    lang = lang === 'en' ? 'id' : 'en';
    document.documentElement.lang = lang;
    toggleBtn.textContent = lang === 'en' ? 'EN' : 'ID';
    originals.forEach((enText, el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = lang === 'en' ? enText : (i18n[key] || enText);
    });
  });
});
