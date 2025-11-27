document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initRevealOnScroll();
  initStickyCtaOnScroll();
  initSmoothScroll();
  initFormSubmit();
  initEventTracking();
});

function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';

    hamburger.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('open');
  });

  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      hamburger.focus();
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
