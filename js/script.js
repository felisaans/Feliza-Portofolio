// =========================================================
// script.js
// Navigasi antar section seperti "halaman" (bukan scroll panjang):
// klik nav / Next / Back akan mengganti section yang tampil.
// Section navigation like separate "pages" (not one long scroll):
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

    // Halaman baru selalu mulai dari atas (di bawah navbar)
    // Every "page" switch starts scrolled to the top (below the navbar)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
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
