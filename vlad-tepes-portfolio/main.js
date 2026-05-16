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
   CAROUSEL
══════════════════════════════════════════ */
class Carousel {
  constructor(track) {
    this.track   = track;
    this.el      = track.parentElement;
    this.cards   = [...track.querySelectorAll('.video-card')];
    this.total   = this.cards.length;
    this.current = 0;
    this.dots    = [];

    this._buildButtons();
    this._buildDots();
    this._bindScroll();
    this._bindMouseDrag();
    this._update();
  }

  /* ── Build prev/next arrow buttons ── */
  _buildButtons() {
    const arrow = (dir) => {
      const btn = document.createElement('button');
      btn.className = `carousel__btn carousel__btn--${dir}`;
      btn.setAttribute('aria-label', dir === 'prev' ? 'Anterior' : 'Următor');
      btn.innerHTML = dir === 'prev'
        ? `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      btn.addEventListener('click', () => dir === 'prev' ? this.prev() : this.next());
      this.el.appendChild(btn);
      return btn;
    };
    this.btnPrev = arrow('prev');
    this.btnNext = arrow('next');
  }

  /* ── Build dot indicators ── */
  _buildDots() {
    const container = this.el.querySelector('.carousel__dots');
    if (!container) return;
    this.cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Video ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      container.appendChild(dot);
      this.dots.push(dot);
    });
  }

  /* ── Sync current index from native scroll position ── */
  _bindScroll() {
    let t;
    this.track.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const sl = this.track.scrollLeft;
        let nearest = 0, minDist = Infinity;
        this.cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - sl);
          if (dist < minDist) { minDist = dist; nearest = i; }
        });
        if (nearest !== this.current) {
          this.current = nearest;
          this._update();
        }
      }, 60);
    }, { passive: true });
  }

  /* ── Mouse drag (desktop) ── */
  _bindMouseDrag() {
    let startX = 0, startScroll = 0, dragging = false, moved = false;

    this.track.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      startX     = e.clientX;
      startScroll = this.track.scrollLeft;
      dragging   = true;
      moved      = false;
      this.track.classList.add('is-dragging');
    });

    this.track.addEventListener('mousemove', e => {
      if (!dragging) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      this.track.scrollLeft = startScroll - delta;
    });

    // Prevent click-to-play when drag occurred
    this.track.addEventListener('click', e => {
      if (moved) e.stopImmediatePropagation();
    }, true);

    const stop = () => {
      dragging = false;
      this.track.classList.remove('is-dragging');
    };
    window.addEventListener('mouseup',    stop);
    window.addEventListener('mouseleave', stop);
  }

  /* ── Navigate ── */
  goTo(index) {
    this.current = Math.max(0, Math.min(index, this.total - 1));
    this.track.scrollTo({ left: this.cards[this.current].offsetLeft, behavior: 'smooth' });
    this._update();
  }
  prev() { this.goTo(this.current - 1); }
  next() { this.goTo(this.current + 1); }

  /* ── Sync UI ── */
  _update() {
    this.dots.forEach((d, i) => d.classList.toggle('active', i === this.current));
    this.btnPrev.disabled = this.current === 0;
    this.btnNext.disabled = this.current === this.total - 1;
  }
}

document.querySelectorAll('.carousel__track').forEach(track => new Carousel(track));

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
