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

/* ── i18n Language Switcher ─────────────────────────── */
const translations = {
  fr: {
    'nav.services': 'SERVICES',
    'nav.about':    'À PROPOS',
    'nav.contact':  'CONTACT',
    'hero.subtitle': "CONCIERGERIE D'EXCEPTION",
    'hero.tagline':  'Votre vie mérite le meilleur.<br>Nous le rendons possible.',
    'hero.cta1':     'DÉCOUVRIR NOS SERVICES',
    'hero.cta2':     'PRENDRE CONTACT',
    'stats.missions':    'MISSIONS RÉALISÉES',
    'stats.services':    'SERVICES PREMIUM',
    'stats.availability':'DISPONIBILITÉ',
    'stats.discretion':  'DISCRÉTION GARANTIE',
    'about1.label': 'À PROPOS',
    'about1.title': "L'ART DU<br>SERVICE<br>ABSOLU",
    'about1.body':  'Maison Panthera est une conciergerie full service dédiée à proposer les meilleurs services pour pouvoir répondre à toutes vos demandes dans la plus grande réactivité.',
    'about1.feat1': 'Réponse en moins de 30 minutes',
    'about1.feat2': "Réseau de prestataires d'exception",
    'about1.feat3': 'Service 100% personnalisé',
    'about2.label': 'NOTRE RÉSEAU',
    'about2.title': "PARTENAIRES<br>D'EXCEPTION",
    'about2.body':  "Maison Panthera collabore avec un réseau de prestataires reconnus, nous permettant de vous proposer une large gamme de services personnalisés et de haute qualité — VTC, booking, accès événements sportifs et festifs, locations privées.",
    'about2.cta':   'FAIRE UNE DEMANDE',
    'values.discretion': 'DISCRÉTION',
    'values.reactivity': 'RÉACTIVITÉ',
    'values.bespoke':    'SUR MESURE',
    'services.title': 'NOS SERVICES',
    'services.sub':   'Une gamme complète de services premium, disponible 7j/7',
    'card.vtc':      'Van chauffeur & transport privé premium. Véhicules haut de gamme, chauffeurs professionnels.',
    'card.shopper':  'Accès aux plus grandes maisons de luxe. Shopping personnalisé & exclusif.',
    'card.carrental':'Location de véhicules prestige & supercars. Ferrari, Lamborghini, Rolls-Royce.',
    'card.booking':  'Restaurants étoilés, hôtels de prestige, réservations VIP partout dans le monde.',
    'card.match':    "Toutes catégories jusqu'aux loges VIP. Roland-Garros, PSG, F1 & plus.",
    'card.concert':  'Accès VIP aux meilleurs concerts & événements exclusifs. Premières loges garanties.',
    'card.jet':      'Voyagez à votre rythme. Destinations mondiales, disponibilité immédiate.',
    'card.yacht':    'Location de yachts de luxe. Croisières privées en Méditerranée & au-delà.',
    'card.cta':      'RÉSERVER →',
    'quote.text':    'Chaque détail est une promesse.<br>Chaque service, une expérience inoubliable.',
    'quote.cta':     "VIVRE L'EXPÉRIENCE",
    'gallery.title': "L'EXPÉRIENCE<br>PANTHERA",
    'form.title':    'PARLONS DE<br>VOTRE<br>PROJET',
    'form.body':     'Notre équipe répond à toutes vos demandes en moins de 30 minutes, 7j/7, 24h/24.',
    'form.phone':    'TÉLÉPHONE',
    'form.waDirect': 'Message direct',
    'form.name':     'NOM & PRÉNOM *',
    'form.phoneLabel':'TÉLÉPHONE',
    'form.service':  'SERVICE SOUHAITÉ',
    'form.message':  'VOTRE DEMANDE *',
    'form.other':    'Autre',
    'form.mention':  '* Champs obligatoires. Vos données sont traitées de façon confidentielle.',
    'form.submit':   'ENVOYER MA DEMANDE',
    'form.success':  '✓ Message envoyé — Nous vous répondons sous 30 minutes.',
    'form.error':    'Une erreur est survenue. Contactez-nous directement au +33 6 68 73 11 09.',
    'reviews.label':   'VOTRE EXPÉRIENCE',
    'reviews.title':   'LAISSEZ UN AVIS',
    'reviews.sub':     'Votre retour nous aide à grandir',
    'reviews.rating':  'VOTRE NOTE',
    'reviews.name':    'VOTRE NOM *',
    'reviews.service': 'SERVICE UTILISÉ',
    'reviews.message': 'VOTRE AVIS *',
    'reviews.submit':  'ENVOYER MON AVIS',
    'testi.label':   'ILS NOUS FONT CONFIANCE',
    'testi.title':   'TÉMOIGNAGES',
    'testi.t1':      '« Réservation d\'un jet privé en moins d\'une heure pour Dubai. Discrétion absolue, équipe réactive et professionnelle. Je ne travaille plus qu\'avec Maison Panthera. »',
    'testi.t2':      '« Service impeccable pour l\'organisation d\'une soirée d\'anniversaire : VTC, réservation restaurant étoilé et accès loges VIP. Tout était parfait. »',
    'testi.t3':      '« Impossible d\'avoir des billets pour la finale — Maison Panthera les a trouvés en 20 minutes. Loges VIP, accueil champagne. Une expérience inoubliable. »',
    'footer.tag':    'CONCIERGERIE FULL SERVICES',
    'footer.copy':   '© 2026 MAISON PANTHERA — TOUS DROITS RÉSERVÉS',
    'chat.available':'Disponible maintenant',
    'chat.hello':    'Bonjour 👋 Comment puis-je vous aider ?',
  },
  en: {
    'nav.services': 'SERVICES',
    'nav.about':    'ABOUT',
    'nav.contact':  'CONTACT',
    'hero.subtitle': 'FULL-SERVICE CONCIERGE',
    'hero.tagline':  'Your life deserves the best.<br>We make it happen.',
    'hero.cta1':     'DISCOVER OUR SERVICES',
    'hero.cta2':     'GET IN TOUCH',
    'stats.missions':    'COMPLETED MISSIONS',
    'stats.services':    'PREMIUM SERVICES',
    'stats.availability':'AVAILABILITY',
    'stats.discretion':  'GUARANTEED DISCRETION',
    'about1.label': 'ABOUT US',
    'about1.title': 'THE ART OF<br>ABSOLUTE<br>SERVICE',
    'about1.body':  'Maison Panthera is a full-service concierge dedicated to providing the finest services, responding to your every request with the utmost responsiveness.',
    'about1.feat1': 'Response in under 30 minutes',
    'about1.feat2': 'A network of exceptional partners',
    'about1.feat3': '100% personalized service',
    'about2.label': 'OUR NETWORK',
    'about2.title': 'EXCEPTIONAL<br>PARTNERS',
    'about2.body':  'Maison Panthera works with a network of renowned partners, allowing us to offer a wide range of high-quality personalized services — VTC, bookings, access to sports & entertainment events, private rentals.',
    'about2.cta':   'SUBMIT A REQUEST',
    'values.discretion': 'DISCRETION',
    'values.reactivity': 'RESPONSIVENESS',
    'values.bespoke':    'BESPOKE',
    'services.title': 'OUR SERVICES',
    'services.sub':   'A complete range of premium services, available 7 days a week',
    'card.vtc':      'Premium chauffeur & private transport. Luxury vehicles, professional drivers.',
    'card.shopper':  "Access to the world's finest luxury houses. Exclusive personalized shopping.",
    'card.carrental':'Prestige & supercar rentals. Ferrari, Lamborghini, Rolls-Royce.',
    'card.booking':  'Starred restaurants, prestige hotels, VIP reservations worldwide.',
    'card.match':    'All categories up to VIP boxes. Roland-Garros, PSG, F1 & more.',
    'card.concert':  'VIP access to the best concerts & exclusive events. Front-row guaranteed.',
    'card.jet':      'Travel on your terms. Worldwide destinations, immediate availability.',
    'card.yacht':    'Luxury yacht rentals. Private cruises in the Mediterranean & beyond.',
    'card.cta':      'BOOK NOW →',
    'quote.text':    'Every detail is a promise.<br>Every service, an unforgettable experience.',
    'quote.cta':     'LIVE THE EXPERIENCE',
    'gallery.title': 'THE PANTHERA<br>EXPERIENCE',
    'form.title':    "LET'S TALK<br>ABOUT YOUR<br>PROJECT",
    'form.body':     'Our team responds to all requests in under 30 minutes, 7 days a week, 24/7.',
    'form.phone':    'PHONE',
    'form.waDirect': 'Direct message',
    'form.name':     'FULL NAME *',
    'form.phoneLabel':'PHONE',
    'form.service':  'DESIRED SERVICE',
    'form.message':  'YOUR REQUEST *',
    'form.other':    'Other',
    'form.mention':  '* Required fields. Your data is treated with strict confidentiality.',
    'form.submit':   'SEND MY REQUEST',
    'form.success':  '✓ Message sent — We\'ll reply within 30 minutes.',
    'form.error':    'An error occurred. Contact us directly at +33 6 68 73 11 09.',
    'reviews.label':   'YOUR EXPERIENCE',
    'reviews.title':   'LEAVE A REVIEW',
    'reviews.sub':     'Your feedback helps us grow',
    'reviews.rating':  'YOUR RATING',
    'reviews.name':    'YOUR NAME *',
    'reviews.service': 'SERVICE USED',
    'reviews.message': 'YOUR REVIEW *',
    'reviews.submit':  'SUBMIT MY REVIEW',
    'testi.label':   'THEY TRUST US',
    'testi.title':   'TESTIMONIALS',
    'testi.t1':      '« Private jet booked in under an hour to Dubai. Absolute discretion, responsive and professional team. I only work with Maison Panthera now. »',
    'testi.t2':      '« Impeccable service for a birthday celebration: VTC, Michelin-starred dinner reservation and VIP box access. Everything was perfect. »',
    'testi.t3':      '« Couldn\'t get tickets for the final — Maison Panthera found them in 20 minutes. VIP boxes, champagne welcome. An unforgettable experience. »',
    'footer.tag':    'FULL-SERVICE CONCIERGE',
    'footer.copy':   '© 2026 MAISON PANTHERA — ALL RIGHTS RESERVED',
    'chat.available':'Available now',
    'chat.hello':    'Hello 👋 How can I help you?',
  }
};

let currentLang = localStorage.getItem('mp_lang') || 'fr';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('mp_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = translations[lang][key];
    if (text === undefined) return;
    if (text.includes('<br>') || text.includes('<')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Update all lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

document.querySelectorAll('.lang-toggle').forEach(toggle => {
  toggle.addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (lang && lang !== currentLang) applyLang(lang);
  });
});

// Init on load
applyLang(currentLang);

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

/* ── Star Rating ────────────────────────────────────── */
const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('reviewRating');
let selectedRating = 5;
stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = +star.dataset.val;
    stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= val));
  });
  star.addEventListener('mouseleave', () => {
    stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedRating));
  });
  star.addEventListener('click', () => {
    selectedRating = +star.dataset.val;
    if (ratingInput) ratingInput.value = selectedRating + '/5';
    stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedRating));
  });
});
// Default: 5 stars selected
stars.forEach(s => s.classList.add('active'));
