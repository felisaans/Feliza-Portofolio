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

  // --- Animasi ngetik cepat buat isi clipboard-paper di #profile ---
  // Tiap kali #profile ditampilkan, teks di clipboard-paper "diketik ulang"
  // paragraf demi paragraf, dengan cursor berkedip di karakter terakhir.
  // --- Fast typewriter effect for the clipboard-paper content in #profile ---
  // Every time #profile is shown, the clipboard-paper text is "retyped"
  // paragraph by paragraph, with a blinking cursor after the last character.
  let clipboardTypeToken = 0;
  const TYPE_SPEED_MS = 22; // per kata / per word (2x lebih cepat)

  function typeClipboardParagraphs() {
    const paperSpans = document.querySelectorAll('.clipboard-paper > p > span[data-i18n]');
    if (!paperSpans.length) return;

    clipboardTypeToken += 1;
    const myToken = clipboardTypeToken;

    // Pecah tiap paragraf jadi array "kata" (kata + spasi setelahnya digabung
    // jadi satu potongan), supaya animasi maju per-kata, bukan per-huruf.
    // Split each paragraph into an array of "words" (each word plus its
    // trailing whitespace bundled together), so the animation advances
    // word-by-word instead of character-by-character.
    const fullWordChunks = Array.from(paperSpans).map((span) =>
      span.textContent.match(/\S+\s*/g) || []
    );
    paperSpans.forEach((span) => {
      span.textContent = '';
      span.classList.remove('is-typing');
    });

    function typeNext(pIndex, wIndex) {
      if (myToken !== clipboardTypeToken) return; // dibatalkan oleh trigger baru / cancelled by a newer trigger
      if (pIndex >= paperSpans.length) return;

      const span = paperSpans[pIndex];
      const chunks = fullWordChunks[pIndex];

      if (wIndex === 0) span.classList.add('is-typing');

      if (wIndex < chunks.length) {
        span.textContent = chunks.slice(0, wIndex + 1).join('');
        setTimeout(() => typeNext(pIndex, wIndex + 1), TYPE_SPEED_MS);
      } else {
        span.classList.remove('is-typing');
        typeNext(pIndex + 1, 0);
      }
    }

    typeNext(0, 0);
  }

  // Dipakai oleh blok EN/ID di bawah: kalau bahasa diganti saat teks masih
  // "diketik", animasinya dibatalkan dulu supaya tidak menimpa teks baru.
  // Used by the EN/ID block below: if the language is switched mid-typing,
  // cancel the animation first so it doesn't overwrite the new text.
  window.cancelClipboardTyping = () => {
    clipboardTypeToken += 1;
    document.querySelectorAll('.clipboard-paper > p > span[data-i18n]')
      .forEach((span) => span.classList.remove('is-typing'));
  };

  // Dipakai oleh blok EN/ID: setelah teks diganti ke bahasa baru, animasi
  // ketiknya diulang dari awal (bukan langsung nongol full text).
  // Used by the EN/ID block: after the text is swapped to the new language,
  // the typing animation restarts from scratch (instead of just appearing
  // as full text instantly).
  window.typeClipboardParagraphs = typeClipboardParagraphs;

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

    if (id === 'profile') {
      typeClipboardParagraphs();
    }

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
    // Reset ke <html> DAN <body>: tergantung kombinasi overflow/height, salah
    // satu dari keduanya bisa jadi scroll container yang sebenarnya.
    // Reset both <html> and <body>: depending on the overflow/height combo,
    // either one can end up being the real scroll container.
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
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
  "lang-hint": "switch back to english",
  "home-cta": "Lihat Profil", "home-caption": "it's me!",
  "home-major": "Mahasiswi Teknik Informatika",
  "home-univ": "Universitas Jabal Ghafur (UNIGHA)",
  "profile-kicker": "Profil", "profile-h2": "Tentang Saya",
  "profile-p1": "Hai, saya Feliza!",
  "profile-p2": "Saya mahasiswa Informatika semester 5 di Universitas Jabal Ghafur. Saya suka mengeksplorasi teknologi, mempelajari hal baru, dan mengubah ide-ide acak menjadi sesuatu yang nyata.",
  "profile-p3": "Saya sangat tertarik pada pengembangan web, pemrograman, pemecahan masalah, dan sisi kreatif dari teknologi. Saya suka membangun proyek bukan cuma agar berfungsi, tapi juga untuk memahami cara kerjanya di balik layar dan bagaimana bisa dibuat lebih baik. Belakangan ini saya mulai menjelajahi lebih banyak bidang komputasi sambil mengerjakan proyek sendiri dan perlahan menemukan bagian teknologi mana yang paling saya sukai.",
  "profile-p5": "Saya masih terus belajar dan mencari arah untuk mengembangkan kemampuan saya, tapi saya tahu saya ingin terus berkarya, berkembang, dan menantang diri sendiri. Di luar coding, biasanya saya belajar hal baru, dengerin playlist favorit, atau merencanakan proyek kecil berikutnya. Halaman ini adalah rumah kecil untuk semua itu — jangan sungkan untuk lihat-lihat!",
  "profile-p4": "Saya juga sedang mengembangkan hal di luar coding: kemampuan bahasa Inggris saya. Saya ingin lebih baik dalam mendengar, berbicara, dan mengungkapkan pikiran secara alami. Bagi saya, belajar bahasa Inggris bukan cuma soal grammar atau kosakata — tapi soal bisa berkomunikasi dengan percaya diri, mengakses lebih banyak ilmu, dan terhubung dengan orang di luar lingkungan saya.",
  "contact-kicker": "Kontak", "contact-h2": "Mari Terhubung!",
  "contact-lead": "Punya pertanyaan, ide proyek, atau cuma mau say hi? Hubungi saya di sini:",
  "back": "Kembali", "next": "Berikutnya",
  "edu-kicker": "Pendidikan", "edu-h2": "Perjalanan Pendidikan Saya",
  "edu-elementary": "Sekolah Dasar", "edu-junior": "Sekolah Menengah Pertama",
  "edu-vocational": "Sekolah Menengah Kejuruan", "edu-university": "Universitas",
  "edu-ongoing": "Semester 5 · Berlangsung",
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
  "proj2-d": "Website rental papan ucapan akrilik custom — pelanggan bisa memilih desain, mengubah tulisan dengan live preview, dan langsung booking lewat WhatsApp.",
  "proj3-d": "Sistem informasi pengajuan magang berbasis web untuk mahasiswa dan admin kampus, dari pengajuan sampai verifikasi dokumen, dengan Google Sheets sebagai database.",
  "view-project": "Demo Live", "visit-github": "Repositori",
  "proj-soon": "Proyek segera hadir",
  "footer-name": "Portofolio Feliza.", "footer-copy": "Portofolio Pribadi."
};

// Teks asli (EN) direkam LANGSUNG saat script di-parse, bukan di dalam
// DOMContentLoaded. Alasannya: listener navigasi di atas juga jalan saat
// DOMContentLoaded, dan kalau halaman dibuka di #profile listener itu memulai
// efek ketik yang langsung mengosongkan isi <span> — kalau perekaman ini
// menunggu DOMContentLoaded, yang terekam adalah string kosong, sehingga teks
// profil hilang saat bahasa dikembalikan ke EN. <script> berada di akhir
// <body>, jadi semua elemen sudah pasti ada di titik ini.
//
// The original (EN) text is captured RIGHT as the script is parsed, not inside
// DOMContentLoaded. The navigation listener above also runs on DOMContentLoaded
// and, if the page opens on #profile, immediately blanks those <span>s for the
// typewriter effect — so a deferred capture would record empty strings and the
// profile text would vanish when switching back to EN. The <script> sits at the
// end of <body>, so every element already exists here.
const i18nOriginals = new Map();
document.querySelectorAll('[data-i18n]').forEach(el => {
  i18nOriginals.set(el, el.textContent);
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('langToggle');
  if (!toggleBtn) return;

  let lang = 'en';
  toggleBtn.addEventListener('click', () => {
    lang = lang === 'en' ? 'id' : 'en';
    document.documentElement.lang = lang;
    toggleBtn.textContent = lang === 'en' ? 'EN' : 'ID';

    // Hentikan efek ketik yang mungkin masih jalan di #profile
    // Stop any typewriter animation still running in #profile
    if (typeof window.cancelClipboardTyping === 'function') {
      window.cancelClipboardTyping();
    }

    i18nOriginals.forEach((enText, el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = lang === 'en' ? enText : (i18n[key] || enText);
    });

    // Kalau lagi di #profile, teks clipboard-paper yang baru saja diganti
    // bahasanya langsung "diketik ulang" dari awal.
    // If currently on #profile, the clipboard-paper text that was just
    // swapped to the new language is retyped from the start right away.
    const profileSection = document.getElementById('profile');
    if (profileSection && profileSection.classList.contains('is-active') &&
        typeof window.typeClipboardParagraphs === 'function') {
      window.typeClipboardParagraphs();
    }
  });
});

// =========================================================
// MUSIC WIDGET — play/pause, progress bar, skip ±10 detik
// MUSIC WIDGET — play/pause, progress bar, ±10s skip
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('musicAudio');
  const playBtn = document.getElementById('musicPlayPause');
  const prevBtn = document.getElementById('musicPrev');
  const nextBtn = document.getElementById('musicNext');
  const progress = document.getElementById('musicProgress');
  const progressFill = document.getElementById('musicProgressFill');
  const currentTimeEl = document.getElementById('musicCurrentTime');
  const durationEl = document.getElementById('musicDuration');
  if (!audio || !playBtn) return;

  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  const coverImg = document.querySelector('.music-cover img');
  const titleEl = document.querySelector('.music-title');
  const artistEl = document.querySelector('.music-artist');

  // =========================================================
  // Playlist: lagu ke-2 tinggal diganti di sini (file, judul, artis,
  // sampul). File audionya sendiri taruh di folder assets/ ya.
  // Playlist: edit track #2 right here (file, title, artist, cover).
  // Drop the actual audio file into the assets/ folder yourself.
  // =========================================================
  const tracks = [
    {
      src: 'assets/track.mp3',
      title: titleEl ? titleEl.textContent : '',
      artist: artistEl ? artistEl.textContent : '',
      cover: coverImg ? coverImg.getAttribute('src') : '',
    },
    {
      src: 'assets/track2.mp3',
      title: 'NOT CUTE ANYMORE',          // GANTI DI SINI / REPLACE HERE
      artist: 'ILLIT',
      cover: 'assets/music-cover2.jpg',
    },
  ];
  let trackIndex = 0;
  let audioLoaded = false; // baru download beneran pas user klik Play / Next Track

  function loadTrack(index, { autoplay = false } = {}) {
    trackIndex = (index + tracks.length) % tracks.length;
    const track = tracks[trackIndex];

    audioLoaded = true;
    audio.src = track.src;
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (coverImg) coverImg.src = track.cover;

    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    progressFill.style.width = '0%';
    progress.setAttribute('aria-valuenow', 0);

    if (autoplay) {
      audio.play().catch(() => {});
    }
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function seekTo(ratio) {
    if (!audio.duration) return;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
  }

  function skip(seconds) {
    if (!audio.duration) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
  }

  playBtn.addEventListener('click', () => {
    if (!audioLoaded) {
      loadTrack(trackIndex, { autoplay: true }); // baru di sini file mp3-nya kedownload
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {}); // browser bisa nolak autoplay tanpa interaksi — aman diabaikan di sini karena ini sudah dari klik user
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    iconPlay.style.display = 'none';
    iconPause.style.display = '';
    playBtn.setAttribute('aria-label', 'Pause music / Jeda musik');
  });
  audio.addEventListener('pause', () => {
    iconPlay.style.display = '';
    iconPause.style.display = 'none';
    playBtn.setAttribute('aria-label', 'Play music / Putar musik');
  });

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      progress.setAttribute('aria-valuenow', Math.round(pct));
    }
  });

  prevBtn.addEventListener('click', () => skip(-10));
  nextBtn.addEventListener('click', () => skip(10));

  const prevTrackBtn = document.getElementById('musicPrevTrack');
  const nextTrackBtn = document.getElementById('musicNextTrack');
  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      const wasPlaying = !audio.paused;
      loadTrack(trackIndex - 1, { autoplay: wasPlaying });
    });
  }
  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      const wasPlaying = !audio.paused;
      loadTrack(trackIndex + 1, { autoplay: wasPlaying });
    });
  }

  progress.addEventListener('click', (e) => {
    const rect = progress.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  });
  // Aksesibilitas: bisa digeser pakai keyboard (panah kiri/kanan) saat progress bar di-fokus
  // Accessibility: seekable via keyboard (left/right arrows) when the progress bar is focused
  progress.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { skip(5); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { skip(-5); e.preventDefault(); }
  });
});

// =========================================================
// Banner sapaan buat tamu, menunjuk ke tombol ganti bahasa.
// Cuma tampil di #home, dan tetap ada sampai diklik (tidak ada auto-hide).
// Guest-greeting banner pointing at the language-switch button.
// Only shown on #home, and stays until clicked (no auto-hide timer).
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('langToggle');
  const langHint = document.getElementById('langHint');
  if (!langToggle || !langHint) return;

  let dismissed = false;

  function positionHint() {
    const rect = langToggle.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const margin = 12; // jarak minimum ke tepi layar / min gap from the screen edge

    // Reset dulu biar lebar bubble kebaca apa adanya (mengikuti max-width di
    // CSS), baru dihitung ulang posisinya — supaya di layar sempit teksnya
    // wrap dan bubble-nya tidak nongol keluar viewport.
    // Reset first so the bubble's width reads naturally (per the CSS
    // max-width), then recompute its position — so on narrow screens the
    // text wraps and the bubble never pokes outside the viewport.
    langHint.style.left = '0px';
    const hintWidth = langHint.getBoundingClientRect().width;

    const maxLeft = Math.max(margin, window.innerWidth - hintWidth - margin);
    const clampedLeft = Math.min(Math.max(buttonCenterX - hintWidth / 2, margin), maxLeft);

    langHint.style.left = clampedLeft + 'px';
    langHint.style.top = (rect.bottom + 12) + 'px';

    // Panah tetap mengarah persis ke tengah tombol, walau bubble-nya
    // sendiri harus digeser biar tidak kepotong di tepi layar.
    // The arrow still points exactly at the button's center, even when the
    // bubble itself had to shift to avoid being clipped by the edge.
    const arrowLeft = Math.min(Math.max(buttonCenterX - clampedLeft, 16), hintWidth - 16);
    langHint.style.setProperty('--arrow-left', arrowLeft + 'px');
  }

  function refreshHintVisibility() {
    if (dismissed) return;
    const home = document.getElementById('home');
    const onHome = home && home.classList.contains('is-active');
    if (onHome) {
      positionHint();
      langHint.classList.add('is-visible');
    } else {
      langHint.classList.remove('is-visible');
    }
  }

  function dismissHint() {
    dismissed = true;
    langHint.classList.remove('is-visible');
  }

  langHint.addEventListener('click', dismissHint);
  window.addEventListener('resize', () => { if (langHint.classList.contains('is-visible')) positionHint(); });

  // showSection() (didefinisikan lebih atas) ganti class is-active tiap
  // navigasi; kita cukup cek ulang tiap ada perubahan section lewat
  // MutationObserver, biar tidak perlu utak-atik fungsi showSection itu sendiri.
  // showSection() (defined above) toggles the is-active class on every
  // navigation; we just recheck on every section change via a
  // MutationObserver, so showSection itself doesn't need to be touched.
  const homeSection = document.getElementById('home');
  if (homeSection) {
    new MutationObserver(refreshHintVisibility).observe(homeSection, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  refreshHintVisibility();
});
