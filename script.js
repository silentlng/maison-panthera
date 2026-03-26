/* ═══════════════════════════════════════════════════════
   MAISON PANTHERA — script.js v2
═══════════════════════════════════════════════════════ */
'use strict';

/* ── Preloader ──────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('hero').classList.add('loaded');
  }, 2400);
});

/* ── Custom Cursor ──────────────────────────────────── */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * 0.11;
  ry += (my - ry) * 0.11;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.service-card,.gal-item,.chat-opt').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
  dot.style.opacity = '0'; ring.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  dot.style.opacity = '1'; ring.style.opacity = '1';
});

/* ── Navbar scroll ──────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Mobile Menu ────────────────────────────────────── */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMenu() {
  mobileMenu.classList.add('open');
  burger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  burger.classList.remove('open');
  document.body.style.overflow = '';
}
burger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
mobileClose.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMenu));

/* ── Scroll Reveal ──────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.testi-card').forEach(el => revealObs.observe(el));

/* ── Hero Parallax ──────────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (heroBg && window.scrollY < window.innerHeight) {
    heroBg.style.transform = `scale(1) translateY(${window.scrollY * 0.22}px)`;
  }
}, { passive: true });

/* ── Smooth anchor scroll ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Chat Widget ────────────────────────────────────── */
const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const chatClose  = document.getElementById('chatClose');
const chatBadge  = chatToggle.querySelector('.chat-badge');
const icoOpen    = chatToggle.querySelector('.chat-ico-open');
const icoClose   = chatToggle.querySelector('.chat-ico-close');

function openChat() {
  chatWidget.classList.add('open');
  icoOpen.style.display  = 'none';
  icoClose.style.display = 'block';
  if (chatBadge) chatBadge.style.display = 'none';
}
function closeChat() {
  chatWidget.classList.remove('open');
  icoOpen.style.display  = 'block';
  icoClose.style.display = 'none';
}
chatToggle.addEventListener('click', () => chatWidget.classList.contains('open') ? closeChat() : openChat());
chatClose.addEventListener('click', closeChat);

// Close chat on outside click
document.addEventListener('click', e => {
  if (chatWidget.classList.contains('open') && !chatWidget.contains(e.target)) {
    closeChat();
  }
});

// Close chat when clicking a link inside it
document.querySelectorAll('.chat-opt').forEach(opt => {
  opt.addEventListener('click', () => setTimeout(closeChat, 150));
});

/* ── Contact Form ───────────────────────────────────── */
const form       = document.getElementById('contactForm');
const formBtn    = document.getElementById('formBtn');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    formSuccess.style.display = 'none';
    formError.style.display   = 'none';

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(f => {
      if (!f.value.trim()) { f.style.borderBottom = '1px solid #ff8080'; valid = false; }
      else f.style.borderBottom = '';
    });
    if (!valid) return;

    // Rate limiting: prevent double submit
    if (formBtn.disabled) return;
    formBtn.disabled = true;
    formBtn.querySelector('.btn-text').style.display = 'none';
    formBtn.querySelector('.btn-loader').style.display = 'inline-block';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok || res.redirected) {
        formSuccess.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Network error');
      }
    } catch {
      // Fallback: open email client
      const name    = form.querySelector('[name="nom"]').value;
      const email   = form.querySelector('[name="email"]').value;
      const service = form.querySelector('[name="service"]').value;
      const msg     = form.querySelector('[name="message"]').value;
      const subject = encodeURIComponent('Nouvelle demande — Maison Panthera');
      const body    = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${msg}`);
      window.location.href = `mailto:maisonpanthera@outlook.com?subject=${subject}&body=${body}`;
      formSuccess.style.display = 'block';
    } finally {
      formBtn.disabled = false;
      formBtn.querySelector('.btn-text').style.display = 'inline';
      formBtn.querySelector('.btn-loader').style.display = 'none';
    }
  });

  // Input validation feedback
  form.querySelectorAll('input[required], textarea[required]').forEach(f => {
    f.addEventListener('blur', () => {
      if (!f.value.trim()) f.style.borderBottom = '1px solid rgba(255,80,80,.5)';
      else f.style.borderBottom = '';
    });
  });
}

/* ── PWA Service Worker ─────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* ── Stats Count-Up ─────────────────────────────────── */
function animateCount(el, target, suffix, duration) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = start + suffix;
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statsObs.unobserve(e.target);
    const nums = e.target.querySelectorAll('.stat-num');
    nums.forEach(n => {
      const raw = n.textContent.trim();
      const match = raw.match(/^(\d+)(.*)/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = match[2] || '';
      animateCount(n, target, suffix, 1400);
    });
  });
}, { threshold: 0.4 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObs.observe(statsEl);

/* ── Scroll to Top ──────────────────────────────────── */
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
