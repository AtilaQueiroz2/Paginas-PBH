/* =============================================================
   FEIRA DA AFONSO PENA – script.js
   ============================================================= */

(function () {
  'use strict';

  // ── NAV: sticky scroll behaviour ────────────────────────────
  const topnav    = document.getElementById('topnav');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const backBtn   = document.getElementById('backToTop');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    // Sticky shadow
    topnav.classList.toggle('scrolled', window.scrollY > 20);
    // Back-to-top
    backBtn.classList.toggle('visible', window.scrollY > 400);
    // Active nav link by section
    highlightNav();
  }, { passive: true });

  // ── HAMBURGER ────────────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click (mobile)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ── ACTIVE NAV ON SCROLL ─────────────────────────────────────
  const anchors = ['identidade','licenciamento','regras','categorias','localizacao','faq'];

  function highlightNav() {
    let current = '';
    anchors.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 90) current = id;
      }
    });
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── BACK TO TOP ──────────────────────────────────────────────
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── ACCORDIONS ───────────────────────────────────────────────
  const accBtns = document.querySelectorAll('.accordion-btn');

  accBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const bodyId   = btn.getAttribute('aria-controls');
      const body     = document.getElementById(bodyId);

      // Close all first
      accBtns.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const bId = b.getAttribute('aria-controls');
        document.getElementById(bId)?.classList.remove('open');
      });

      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        body?.classList.add('open');
      }
    });
  });

  // ── SMOOTH ANCHOR OFFSET (account for fixed nav) ─────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── HERO CTA PARALLAX HINT ───────────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.35;
      hero.style.setProperty('--parallax', offset + 'px');
    }, { passive: true });
  }

  // ── SECTOR ITEM: click-highlight ─────────────────────────────
  document.querySelectorAll('.sector-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.sector-item').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // ── INTERSECTION OBSERVER: fade-in on scroll ─────────────────
  const fadeEls = document.querySelectorAll(
    '.hcard, .edital-card, .cat-card, .sector-item, .accordion-group, .rule-item, .phase-block'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => {
      el.classList.add('fade-out');
      io.observe(el);
    });
  }

  // ── SECTOR ITEM selected styling (CSS class only) ────────────
  const style = document.createElement('style');
  style.textContent = `
    .fade-out { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }
    .fade-in  { opacity: 1; transform: translateY(0); }
    .sector-item.selected {
      background: var(--green-light) !important;
      color: var(--green) !important;
      font-weight: 700;
      box-shadow: 0 0 0 2px var(--green-mid);
    }
  `;
  document.head.appendChild(style);

  // ── PRINT: remove nav ────────────────────────────────────────
  window.addEventListener('beforeprint', () => topnav.style.display = 'none');
  window.addEventListener('afterprint',  () => topnav.style.display = '');

})();
