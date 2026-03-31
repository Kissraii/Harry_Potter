
'use strict';

// ============================================================
// UTILITÁRIOS
// ============================================================

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

// ============================================================
// MÓDULO: NAVEGAÇÃO
// ============================================================

const Navigation = (() => {
  const header    = $('#header');
  const navToggle = $('#navToggle');
  const navList   = $('#navList');
  const navLinks  = $$('.nav__link');

  let overlay = null;

  const createOverlay = () => {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMobileMenu);
  };

  const openMobileMenu = () => {
    navList.classList.add('open');
    navToggle.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    navList.classList.remove('open');
    navToggle.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveLink();
  };

  const updateActiveLink = () => {
    const sections = $$('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = $(`.nav__link[href="#${id}"]`);

      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  };

  const init = () => {
    if (!header || !navToggle || !navList) return;

    createOverlay();

    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.contains('open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    window.addEventListener('scroll', debounce(handleScroll, 10));
    handleScroll();
  };

  return { init };
})();

// ============================================================
// MÓDULO: PARTÍCULAS MÁGICAS
// ============================================================

const MagicParticles = (() => {
  const container = $('#particles');
  let animationId = null;
  const particles = [];

  const PARTICLE_COUNT = 30;

  const createParticle = () => {
    const el = document.createElement('div');
    const types = ['', '--star', '--small'];
    const type  = types[Math.floor(Math.random() * types.length)];

    el.className = `particle particle${type}`;

    const x        = randomBetween(0, 100);
    const duration = randomBetween(6, 14);
    const delay    = randomBetween(0, 10);
    const drift    = randomBetween(-40, 40);

    el.style.setProperty('--x', `${x}%`);
    el.style.setProperty('--duration', `${duration}s`);
    el.style.setProperty('--delay', `${delay}s`);
    el.style.setProperty('--drift', `${drift}px`);

    return el;
  };

  const init = () => {
    if (!container) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = createParticle();
      container.appendChild(particle);
      particles.push(particle);
    }
  };

  return { init };
})();

// ============================================================
// MÓDULO: SLIDER DE PERSONAGENS
// ============================================================

const CharacterSlider = (() => {
  const track   = $('#charactersTrack');
  const prevBtn = $('#charPrev');
  const nextBtn = $('#charNext');
  const dotsContainer = $('#charDots');

  let currentIndex = 0;
  let cards = [];
  let dots  = [];

  const getVisibleCount = () => {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 768)  return 2;
    if (window.innerWidth <= 1024) return 3;
    return 4;
  };

  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    dots = [];

    const count = cards.length;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `characters__dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Personagem ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  };

  const updateDots = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  const goTo = (index) => {
    if (!track || cards.length === 0) return;

    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    const card   = cards[currentIndex];
    const offset = card.offsetLeft - track.offsetLeft;

    track.scrollTo({ left: offset, behavior: 'smooth' });
    updateDots();
  };

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const handleKeyboard = (e) => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  };

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX   = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  const init = () => {
    if (!track) return;

    cards = $$('.character-card', track);
    createDots();

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    document.addEventListener('keydown', handleKeyboard);

    window.addEventListener('resize', debounce(() => {
      createDots();
      goTo(currentIndex);
    }, 200));
  };

  return { init };
})();

// ============================================================
// MÓDULO: FEITIÇOS INTERATIVOS
// ============================================================

const SpellCards = (() => {
  const spellEffects = {
    expelliarmus: { color: '#FF4444', emoji: '💫' },
    lumos:        { color: '#FFFFAA', emoji: '💡' },
    alohomora:    { color: '#44AAFF', emoji: '🔓' },
    patronus:     { color: '#AAFFAA', emoji: '🦌' },
    wingardium:   { color: '#FFAAFF', emoji: '🪶' },
    avada:        { color: '#44FF44', emoji: '☠️' },
  };

  const castSpell = (card) => {
    const spellName = card.dataset.spell;
    const effect    = spellEffects[spellName];

    if (!effect) return;

    // Efeito de brilho
    const glow = card.querySelector('.spell-card__glow');
    if (glow) {
      glow.style.background = `radial-gradient(ellipse at 50% 0%, ${effect.color}22, transparent 60%)`;
    }

    // Partículas de feitiço
    createSpellParticles(card, effect);
  };

  const createSpellParticles = (card, effect) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${effect.color};
        box-shadow: 0 0 8px ${effect.color};
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        transform: translate(-50%, -50%);
        transition: all 0.8s ease;
      `;
      document.body.appendChild(particle);

      const angle    = (i / 8) * Math.PI * 2;
      const distance = randomBetween(60, 120);
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
        particle.style.opacity   = '0';
      });

      setTimeout(() => particle.remove(), 900);
    }
  };

  const init = () => {
    const cards = $$('.spell-card');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isActive = card.classList.contains('active');

        // Fechar todos
        cards.forEach(c => c.classList.remove('active'));

        if (!isActive) {
          card.classList.add('active');
          castSpell(card);
        }
      });
    });
  };

  return { init };
})();

// ============================================================
// MÓDULO: SCROLL ANIMATIONS (AOS manual)
// ============================================================

const ScrollAnimations = (() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const init = () => {
    const elements = $$('[data-aos]');
    elements.forEach(el => observer.observe(el));
  };

  return { init };
})();

// ============================================================
// MÓDULO: SCROLL TO TOP
// ============================================================

const ScrollToTop = (() => {
  const btn = $('#scrollTop');

  const handleScroll = () => {
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  const init = () => {
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', debounce(handleScroll, 50));
  };

  return { init };
})();

// ============================================================
// MÓDULO: FORMULÁRIO CTA
// ============================================================

const CTAForm = (() => {
  const form    = $('#ctaForm');
  const success = $('#ctaSuccess');

  const init = () => {
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name  = $('#ctaName').value.trim();
      const email = $('#ctaEmail').value.trim();

      if (!name || !email) return;

      // Simular envio
      const submitBtn = form.querySelector('.cta__submit');
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn__text').textContent = 'Enviando...';

      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('visible');

        // Confete mágico
        createMagicConfetti();
      }, 1200);
    });
  };

  const createMagicConfetti = () => {
    const emojis = ['⚡', '✨', '🪄', '⭐', '💫', '🌟'];
    const colors = ['#D3A625', '#F0C040', '#FFFFFF', '#740001', '#1A472A'];

    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        el.style.cssText = `
          position: fixed;
          top: -20px;
          left: ${randomBetween(10, 90)}vw;
          font-size: ${randomBetween(16, 28)}px;
          color: ${color};
          pointer-events: none;
          z-index: 9999;
          animation: confettiFall ${randomBetween(2, 4)}s ease forwards;
        `;
        el.textContent = emoji;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 4000);
      }, i * 80);
    }
  };

  return { init };
})();

// ============================================================
// MÓDULO: FEITIÇO DO DIA (Footer)
// ============================================================

const SpellOfDay = (() => {
  const spells = [
    'Expelliarmus ⚡',
    'Lumos Maxima 💡',
    'Expecto Patronum 🦌',
    'Wingardium Leviosa 🪶',
    'Alohomora 🔓',
    'Accio Livro 📚',
    'Nox 🌙',
    'Riddikulus 🤡',
    'Stupefy ⭐',
    'Protego 🛡️',
    'Finite Incantatem ✨',
    'Mischief Managed 🗺️',
  ];

  const init = () => {
    const el = $('#spellOfDay');
    if (!el) return;

    const today = new Date();
    const index = today.getDate() % spells.length;
    el.textContent = spells[index];
  };

  return { init };
})();

// ============================================================
// MÓDULO: SMOOTH SCROLL PARA LINKS ÂNCORA
// ============================================================

const SmoothScroll = (() => {
  const init = () => {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = $(href);
        if (!target) return;

        e.preventDefault();

        const headerHeight = 80;
        const top = target.offsetTop - headerHeight;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  return { init };
})();

// ============================================================
// MÓDULO: ANIMAÇÃO DE DIGITAÇÃO NO HERO
// ============================================================

const TypingEffect = (() => {
  const phrases = [
    'Onde a magia é real...',
    'Onde a coragem define heróis...',
    'Onde a amizade supera qualquer feitiço...',
    'Onde o amor vence as trevas...',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let el          = null;

  const type = () => {
    if (!el) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      el.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  };

  const init = () => {
    el = $('.hero__description');
    if (!el) return;

    // Aguardar a animação inicial do hero
    setTimeout(type, 2000);
  };

  return { init };
})();

// ============================================================
// MÓDULO: ANIMAÇÃO DE CASAS (hover 3D)
// ============================================================

const HouseCards3D = (() => {
  const handleMouseMove = (e, card) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  };

  const handleMouseLeave = (card) => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => {
      card.style.transition = '';
    }, 500);
  };

  const init = () => {
    const cards = $$('.house-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });
  };

  return { init };
})();

// ============================================================
// MÓDULO: CONFETTI CSS (injetar keyframe)
// ============================================================

const injectConfettiKeyframe = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

// ============================================================
// MÓDULO: PARALLAX HERO
// ============================================================

const ParallaxHero = (() => {
  const hero = $('.hero');

  const handleScroll = () => {
    if (!hero) return;
    const scrollY = window.scrollY;
    const heroContent = $('.hero__content');

    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity   = `${1 - scrollY / (window.innerHeight * 0.8)}`;
    }
  };

  const init = () => {
    if (!hero) return;
    window.addEventListener('scroll', debounce(handleScroll, 5), { passive: true });
  };

  return { init };
})();

// ============================================================
// MÓDULO: CONTADOR DE LIVROS (animação de números)
// ============================================================

const BookCounter = (() => {
  const stats = [
    { label: 'Livros publicados', value: 7 },
    { label: 'Idiomas traduzidos', value: 80 },
    { label: 'Milhões de cópias', value: 500 },
    { label: 'Filmes produzidos', value: 8 },
  ];

  const animateNumber = (el, target, duration = 1500) => {
    const start = performance.now();

    const update = (time) => {
      const elapsed  = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      el.textContent = current.toLocaleString('pt-BR') + (target >= 100 ? 'M+' : '');

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const init = () => {
    // Criar seção de estatísticas dinamicamente
    const booksSection = $('#books');
    if (!booksSection) return;

    const statsDiv = document.createElement('div');
    statsDiv.className = 'books-stats';
    statsDiv.innerHTML = `
      <div class="books-stats__grid">
        ${stats.map((s, i) => `
          <div class="books-stats__item" data-value="${s.value}">
            <span class="books-stats__number" id="stat-${i}">0</span>
            <span class="books-stats__label">${s.label}</span>
          </div>
        `).join('')}
      </div>
    `;

    const container = booksSection.querySelector('.container');
    if (container) container.appendChild(statsDiv);

    // Injetar estilos
    const style = document.createElement('style');
    style.textContent = `
      .books-stats {
        margin-top: 4rem;
        padding: 3rem 0;
        border-top: 1px solid rgba(211, 166, 37, 0.2);
      }
      .books-stats__grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
        text-align: center;
      }
      @media (max-width: 768px) {
        .books-stats__grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 480px) {
        .books-stats__grid { grid-template-columns: 1fr; }
      }
      .books-stats__number {
        display: block;
        font-family: 'Cinzel', serif;
        font-size: 3rem;
        font-weight: 700;
        color: #D3A625;
        text-shadow: 0 0 20px rgba(211, 166, 37, 0.5);
        margin-bottom: 0.5rem;
      }
      .books-stats__label {
        font-family: 'Crimson Text', serif;
        font-size: 1rem;
        color: #9A9AAA;
        letter-spacing: 0.05em;
      }
    `;
    document.head.appendChild(style);

    // Observar para animar quando visível
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stats.forEach((s, i) => {
            const el = $(`#stat-${i}`);
            if (el) animateNumber(el, s.value);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsDiv);
  };

  return { init };
})();

// ============================================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  injectConfettiKeyframe();

  Navigation.init();
  MagicParticles.init();
  CharacterSlider.init();
  SpellCards.init();
  ScrollAnimations.init();
  ScrollToTop.init();
  CTAForm.init();
  SpellOfDay.init();
  SmoothScroll.init();
  HouseCards3D.init();
  ParallaxHero.init();
  BookCounter.init();

  // Log mágico no console
  console.log(
    '%c⚡ Harry Potter Landing Page ⚡',
    'color: #D3A625; font-family: serif; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #D3A625;'
  );
  console.log(
    '%cMischief Managed! 🗺️',
    'color: #9A9AAA; font-family: serif; font-size: 14px;'
  );
});
