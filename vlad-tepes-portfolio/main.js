/* ══════════════════════════════════════════
   NAV — scroll effect
══════════════════════════════════════════ */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ══════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════ */
const burger     = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

function openMenu() {
  mobileMenu.removeAttribute('hidden');
  // Force reflow so opacity transition fires
  mobileMenu.getBoundingClientRect();
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  // Wait for fade-out, then re-add hidden
  setTimeout(() => mobileMenu.setAttribute('hidden', ''), 350);
}

burger.addEventListener('click', () => {
  burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') closeMenu();
});

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════
   VIDEO — lazy load + interaction
══════════════════════════════════════════ */

// Encode spaces in path segments (handles filenames with spaces)
function encodePath(rawPath) {
  return rawPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
}

function loadVideo(video) {
  if (video.src || !video.dataset.src) return;
  video.src = encodePath(video.dataset.src);
  video.load();
}

// Lazy-load: trigger when card is near viewport
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target.querySelector('video[data-src]');
      if (video) loadVideo(video);
      lazyObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '250px 0px' });

document.querySelectorAll('.video-card').forEach(card => lazyObserver.observe(card));

// True touch device detection (hover: none = touch-primary)
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// Pause all other playing videos
function pauseOthers(except) {
  document.querySelectorAll('.video-card.playing').forEach(card => {
    if (card === except) return;
    const v = card.querySelector('video');
    if (v) { v.pause(); v.currentTime = 0; }
    card.classList.remove('playing');
  });
}

document.querySelectorAll('.video-card').forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;

  if (!isTouchDevice()) {
    /* ── Desktop: hover to preview ── */
    card.addEventListener('mouseenter', () => {
      loadVideo(video);
      video.play()
        .then(() => card.classList.add('playing'))
        .catch(() => {}); // autoplay may be blocked
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
      card.classList.remove('playing');
    });

  } else {
    /* ── Mobile: tap to play / pause ── */
    card.addEventListener('click', () => {
      loadVideo(video);

      if (video.paused) {
        pauseOthers(card);
        video.play()
          .then(() => card.classList.add('playing'))
          .catch(() => {});
      } else {
        video.pause();
        card.classList.remove('playing');
      }
    });
  }
});

/* ══════════════════════════════════════════
   SMOOTH ANCHOR SCROLL (fallback for older
   browsers that don't support scroll-behavior)
══════════════════════════════════════════ */
if (!CSS.supports('scroll-behavior', 'smooth')) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
