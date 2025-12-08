document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initRevealOnScroll();
  initStickyCtaOnScroll();
  initSmoothScroll();
  initFormSubmit();
  initEventTracking();
});

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileNav || !navOverlay) return;

  const toggleNav = () => {
    const isOpen = mobileNav.classList.contains('active');

    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  };

  const openNav = () => {
    mobileNav.classList.add('active');
    navOverlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeNav = () => {
    mobileNav.classList.remove('active');
    navOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', toggleNav);

  navOverlay.addEventListener('click', closeNav);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeNav();
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
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.rodo.checked) {
      alert('Musisz zaakceptować zgodę na przetwarzanie danych osobowych.');
      return;
    }

    const formData = {
      name: form.name.value,
      phone: form.phone.value,
      address: form.address.value,
      rodo: form.rodo.checked
    };

    console.log('Form submitted:', formData);
    console.log('Event: form_submit');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Wysyłanie...';
    }

    try {
      const response = await fetch('https://n8n.procesflow.pl/webhook-test/cf813640-38d0-4762-b27b-54c5dae6cde7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log('Form sent successfully to webhook');
        form.reset();

        if (successMessage) {
          successMessage.style.display = 'block';
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 5000);
        }
      } else {
        console.error('Webhook error:', response.status);
        alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Wyślij';
      }
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
