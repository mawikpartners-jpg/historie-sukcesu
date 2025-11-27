document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initRevealOnScroll();
  initStickyCtaOnScroll();
  initSmoothScroll();
  initFormSubmit();
  initEventTracking();
});

function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const body = document.body;

  if (!hamburger || !mobileMenu || !menuOverlay) return;

  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('visible');
    body.classList.add('menu-open');
    hamburger.setAttribute('aria-expanded', 'true');
    menuOverlay.setAttribute('aria-hidden', 'false');

    mobileMenu.querySelector('a').focus();
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('visible');
    body.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
    menuOverlay.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu() {
    const isOpen = hamburger.classList.contains('active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  menuOverlay.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('active')) {
      closeMenu();
      hamburger.focus();
    }
  });

  const mediaQuery = window.matchMedia('(min-width: 769px)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches && hamburger.classList.contains('active')) {
      closeMenu();
    }
  });
}

function initRevealOnScroll() {
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => observer.observe(el));
}

function initStickyCtaOnScroll() {
  const stickyCta = document.getElementById('sticky-cta');
  const hero = document.querySelector('.hero');

  if (!stickyCta || !hero) return;

  const showStickyCta = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      stickyCta.classList.add('visible');
    } else {
      stickyCta.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', showStickyCta, { passive: true });
  showStickyCta();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        const offsetTop = targetElement.offsetTop - 20;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initFormSubmit() {
  const form = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      name: form.name.value,
      phone: form.phone.value,
      address: form.address.value,
      rodo: form.rodo.checked
    };

    console.log('Form submitted:', formData);
    console.log('Event: form_submit');

    form.reset();

    if (successMessage) {
      successMessage.style.display = 'block';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
    }
  });
}

function initEventTracking() {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      console.log('Event: phone_click', link.href);
    });
  });

  document.querySelectorAll('a[href^="https://wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      console.log('Event: whatsapp_click', link.href);
    });
  });

  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => {
      console.log('Event: video_play', video.getAttribute('aria-label'));
    });
  });

  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Event: cta_click', button.textContent.trim());
    });
  });
}
