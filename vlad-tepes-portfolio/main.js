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
   LANGUAGE SWITCH
══════════════════════════════════════════ */
const i18n = {
  ro: {
    langBtn:         '<img src="assets/images/flag-gb.png" alt="" class="lang-flag" aria-hidden="true"> EN',
    navPortfolio:    'Portofoliu',
    navToolkit:      'Toolkit',
    navPhotography:  'Fotografie',
    navContact:      'Contact',
    heroEyebrow:     'Videograf',
    heroIntro:       'Salut! Mă numesc Țepeș Vlad Ionuț — și nu, nu e o glumă. Activez în domeniul videografiei de peste 2 ani, iar în tot acest timp am încercat constant să mă perfecționez și să evoluez cu fiecare proiect realizat.',
    heroCta:         'Vezi Portofoliul',
    stat1Label:      'Ani Experiență',
    stat2Label:      'Proiecte Realizate',
    stat3Label:      'Bazat în România',
    cat1Title:       'Medicină',
    cat1Count:       '5 lucrări',
    cat2Title:       'Imobiliare',
    cat2Count:       '8 lucrări',
    cat3Title:       'Evenimente',
    cat3Count:       '9 lucrări',
    agencyCredit:    'Clipurile au fost realizate prin intermediul agenției <strong>VivaView Media</strong>',
    toolkitLabel:    'Stack',
    toolkitTitle:    'Software-uri<br>Utilizate',
    photoLabel:      'În Curând',
    photoTitle:      'Fotografie',
    photoText:       'Secțiunea de fotografie este în lucru.<br>Revino curând pentru noutăți.',
    contactTitle:    'HAI SĂ<br>COLABORĂM',
    contactSubtitle: 'Să dăm viață ideilor tale.',
    contactDesc:     'Trimite-mi un mail, sună-mă sau scrie-mi pe orice platformă de mai jos — orice variantă merge.',
    emailLabel:      'Email',
    phoneLabel:      'Telefon',
    whatsappLabel:   'WhatsApp',
    instagramLabel:  'Instagram',
    footerCopy:      '© 2026 Vlad Țepeș. Toate drepturile rezervate.',
  },
  en: {
    langBtn:         '<img src="assets/images/flag-ro.png" alt="" class="lang-flag" aria-hidden="true"> RO',
    navPortfolio:    'Portfolio',
    navToolkit:      'Toolkit',
    navPhotography:  'Photography',
    navContact:      'Contact',
    heroEyebrow:     'Videographer',
    heroIntro:       "Hi! My name is Vlad Ionuț Țepeș — and no, it's not a joke. I've been working in videography for over 2 years, constantly striving to improve and grow with every project.",
    heroCta:         'View Portfolio',
    stat1Label:      'Years Experience',
    stat2Label:      'Projects Completed',
    stat3Label:      'Based in Romania',
    cat1Title:       'Medicine',
    cat1Count:       '5 works',
    cat2Title:       'Real Estate',
    cat2Count:       '8 works',
    cat3Title:       'Events',
    cat3Count:       '9 works',
    agencyCredit:    'The clips were created through <strong>VivaView Media</strong> agency',
    toolkitLabel:    'Stack',
    toolkitTitle:    'Software<br>Used',
    photoLabel:      'Coming Soon',
    photoTitle:      'Photography',
    photoText:       'The photography section is a work in progress.<br>Check back soon for updates.',
    contactTitle:    "LET'S<br>COLLABORATE",
    contactSubtitle: "Let's bring your ideas to life.",
    contactDesc:     'Send me an email, call me, or message me on any platform below — any option works.',
    emailLabel:      'Email',
    phoneLabel:      'Phone',
    whatsappLabel:   'WhatsApp',
    instagramLabel:  'Instagram',
    footerCopy:      '© 2026 Vlad Țepeș. All rights reserved.',
  },
};

function applyLang(lang) {
  const t = i18n[lang];
  document.documentElement.lang = lang;

  // Button label (shows the OTHER language)
  document.getElementById('langToggle').innerHTML = t.langBtn;

  // Nav + mobile menu links
  const navLinks    = document.querySelectorAll('.nav__links a');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const linkKeys    = ['navPortfolio', 'navToolkit', 'navPhotography', 'navContact'];
  linkKeys.forEach((key, i) => {
    if (navLinks[i])    navLinks[i].textContent    = t[key];
    if (mobileLinks[i]) mobileLinks[i].textContent = t[key];
  });

  // Hero
  document.querySelector('.hero__eyebrow').textContent  = t.heroEyebrow;
  document.querySelector('.hero__intro').textContent    = t.heroIntro;
  document.querySelector('.hero__cta span').textContent = t.heroCta;

  // Stats
  const statLabels = document.querySelectorAll('.hero__stat-label');
  [t.stat1Label, t.stat2Label, t.stat3Label].forEach((v, i) => {
    if (statLabels[i]) statLabels[i].textContent = v;
  });

  // Portfolio categories
  const catTitles = document.querySelectorAll('.portfolio__cat-title');
  const catCounts = document.querySelectorAll('.portfolio__cat-count');
  [[t.cat1Title, t.cat1Count], [t.cat2Title, t.cat2Count], [t.cat3Title, t.cat3Count]]
    .forEach(([title, count], i) => {
      if (catTitles[i]) catTitles[i].textContent = title;
      if (catCounts[i]) catCounts[i].textContent = count;
    });

  // Agency credit (has <strong> inside)
  document.querySelector('.agency-credit').innerHTML = t.agencyCredit;

  // Toolkit
  document.querySelector('.toolkit__inner .section-label').textContent = t.toolkitLabel;
  document.querySelector('.toolkit__title').innerHTML = t.toolkitTitle;

  // Photography
  document.querySelector('.photography__inner .section-label').textContent = t.photoLabel;
  document.querySelector('.photography__title').textContent               = t.photoTitle;
  document.querySelector('.photography__text').innerHTML                  = t.photoText;

  // Contact
  document.querySelector('.contact__title').innerHTML       = t.contactTitle;
  document.querySelector('.contact__subtitle').textContent  = t.contactSubtitle;
  document.querySelector('.contact__desc').textContent      = t.contactDesc;

  const contactLabels = document.querySelectorAll('.contact__item-label');
  [t.emailLabel, t.phoneLabel, t.whatsappLabel, t.instagramLabel].forEach((v, i) => {
    if (contactLabels[i]) contactLabels[i].textContent = v;
  });

  // Footer
  document.querySelector('.footer__copy').textContent = t.footerCopy;

  localStorage.setItem('lang', lang);
}

// Init: respect saved preference, fall back to Romanian
let currentLang = localStorage.getItem('lang') || 'ro';
applyLang(currentLang);

document.getElementById('langToggle').addEventListener('click', () => {
  currentLang = currentLang === 'ro' ? 'en' : 'ro';
  applyLang(currentLang);
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
