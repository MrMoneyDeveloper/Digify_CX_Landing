document.addEventListener('DOMContentLoaded', function () {
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('[data-reveal]');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));

  // Chapter indicator navigation
  const chapterButtons = document.querySelectorAll('.chapter-indicator button');
  const chapterSections = document.querySelectorAll(
    '#hero, #group, #about, #story, #brands, #partners-stack, #services, #contact'
  );
  const sectionsObserverOptions = {
    threshold: 0.3,
  };

  const sectionsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        chapterButtons.forEach((btn) => {
          btn.classList.remove('active');
          if (btn.getAttribute('data-target') === '#' + sectionId) {
            btn.classList.add('active');
          }
        });
      }
    });
  }, sectionsObserverOptions);

  chapterSections.forEach((section) => {
    if (section) sectionsObserver.observe(section);
  });

  chapterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target')?.replace('#', '');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Sticky CTA visibility on scroll
  const form = document.getElementById('contact-form');
  const stickyCta = document.querySelector('.sticky-cta');
  const contactSection = document.getElementById('contact');
  const stickyCtaObserverOptions = {
    threshold: 0.5,
  };

  const stickyCtaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Contact section visible - hide sticky CTA
        stickyCta?.classList.remove('show');
      } else if (entry.boundingClientRect.top > 0) {
        // Contact section below viewport - show sticky CTA
        stickyCta?.classList.add('show');
      }
    });
  }, stickyCtaObserverOptions);

  if (contactSection) stickyCtaObserver.observe(contactSection);

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      const formData = new FormData(form);

      btn.classList.add('is-loading');
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span><span class="btn-label">Sending...</span>';

      try {
        const response = await fetch('https://formspree.io/f/xleobzyd', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          btn.classList.remove('is-loading');
          btn.innerHTML = '<span class="me-2">✓</span>Message sent!';
          form.reset();
          setTimeout(() => {
            btn.innerText = originalText;
          }, 3000);
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error:', error);
        btn.classList.remove('is-loading');
        btn.innerHTML = '<span class="me-2">✗</span>Error sending message';
        setTimeout(() => {
          btn.innerText = originalText;
        }, 3000);
      }
    });
  }

  // Brand pill navigation
  const brandPills = document.querySelectorAll('.brand-pill');
  const brandSections = document.querySelectorAll('[data-brand]');
  const brandObserverOptions = {
    threshold: 0.2,
  };

  const brandObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const brandId = entry.target.id;
        brandPills.forEach((pill) => {
          pill.classList.remove('is-active');
          if (pill.getAttribute('href') === '#' + brandId) {
            pill.classList.add('is-active');
          }
        });
      }
    });
  }, brandObserverOptions);

  brandSections.forEach((section) => {
    brandObserver.observe(section);
  });

  // Mobile performance class on low-end devices
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) {
    document.body.classList.add('mobile-performance');
  }

  // Prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
});
