document.addEventListener('DOMContentLoaded', () => {
  const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let prefersReduceMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;
  const isMobile = () => window.innerWidth < 768;
  let isSmall = isMobile();
  const setViewportFlags = () => {
    isSmall = isMobile();
    document.body.classList.toggle('mobile-performance', isSmall);
    return isSmall;
  };
  setViewportFlags();
  document.body.classList.add('js-enabled');

  if (prefersReduceMotion) {
    document.body.classList.add('reduced-motion');
    document.documentElement.style.setProperty('--theme-transition-duration', '0.01s');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  const sectionTargets = Array.from(document.querySelectorAll('.section-block, .chapter, footer'));
  const markSectionInView = () => {
    const viewH = window.innerHeight || 1;
    sectionTargets.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < viewH * 0.85 && rect.bottom > 0) sec.classList.add('section-in');
    });
  };
  if (sectionTargets.length) {
    if (prefersReduceMotion) {
      sectionTargets.forEach(sec => sec.classList.add('section-in'));
    } else {
      markSectionInView();
      document.body.classList.add('section-anim');
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('section-in');
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      sectionTargets.forEach(sec => sectionObserver.observe(sec));
    }
  }

  const nav = document.getElementById('mainNav');
  const setNavOffset = () => {
    const offset = nav ? nav.offsetHeight : 82;
    document.documentElement.style.setProperty('--nav-offset', `${offset}px`);
    return offset;
  };
  const getScrollOffset = () => (nav ? nav.offsetHeight + 12 : 90);
  setNavOffset();
  document.body.setAttribute('data-bs-offset', String(getScrollOffset()));
  let scrollSpy = null;
  if (nav) {
    scrollSpy = new bootstrap.ScrollSpy(document.body, { target: '#mainNav', offset: getScrollOffset() });
  }
  const navCollapseEl = document.getElementById('navbarNav');
  const navCollapse = navCollapseEl ? bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false }) : null;
  const closeNavCollapse = () => {
    if (!navCollapseEl || !navCollapseEl.classList.contains('show')) return;
    const instance = bootstrap.Collapse.getInstance(navCollapseEl) || navCollapse;
    if (instance) instance.hide();
  };

  // Brand focus mode (scroll + click lock)
  const brandMap = {
    digifycx:  { primary:"#00D9FF", accent:"#6F29B1", soft:"#EAFBFF", bg1:"#172a68", bg2:"#0b1032" },
    cxexperts: { primary:"#6F29B1", accent:"#4A1A6F", soft:"#F9F2FD", bg1:"#2b0f52", bg2:"#0d0b1c" },
    digifybpo: { primary:"#78EED6", accent:"#2A9E8F", soft:"#E7EDFF", bg1:"#1F1E3A", bg2:"#0c102c" },
    outboundcx:{ primary:"#00D9FF", accent:"#00A8CC", soft:"#E6FFFA", bg1:"#0b1436", bg2:"#1F1E3A" },
    cxleads:   { primary:"#E3F89D", accent:"#C9E456", soft:"#F6FFE0", bg1:"#0b2d1a", bg2:"#16123d" }
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const hexToRgb = (hex) => {
    const raw = String(hex || '').replace('#', '').trim();
    const full = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw;
    if (full.length !== 6) return null;
    const n = Number.parseInt(full, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const rgbaFromHex = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(255,255,255,${clamp(alpha, 0, 1)})`;
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${clamp(alpha, 0, 1)})`;
  };

  const root = document.documentElement;
  let brandLocked = false;
  let lockedBrandKey = 'digifycx';
  let activeBrandSection = null;
  const brandSections = Array.from(document.querySelectorAll('[data-brand]'));

  const setActiveSection = (section) => {
    if (activeBrandSection === section) return;
    if (activeBrandSection) activeBrandSection.removeAttribute('data-brand-active');
    activeBrandSection = section || null;
    if (activeBrandSection) activeBrandSection.setAttribute('data-brand-active', 'true');
  };

  const applyBrand = (key, { reason = 'auto' } = {}) => {
    const b = brandMap[key] || brandMap.digifycx;
    root.style.setProperty('--brand-primary', b.primary);
    root.style.setProperty('--brand-accent', b.accent);
    root.style.setProperty('--brand-soft', b.soft);
    root.style.setProperty('--brand-bg1', b.bg1);
    root.style.setProperty('--brand-bg2', b.bg2);

    root.style.setProperty('--brand-primary-a', rgbaFromHex(b.primary, 0.28));
    root.style.setProperty('--brand-accent-a', rgbaFromHex(b.accent, 0.28));
    root.style.setProperty('--brand-soft-a', rgbaFromHex(b.soft, 0.22));

    document.body.dataset.brand = key;
    document.body.dataset.brandMode = brandLocked ? 'locked' : 'auto';
    document.body.dataset.brandReason = reason;
  };

  const lockBrand = (key, { section = null, reason = 'click' } = {}) => {
    brandLocked = true;
    lockedBrandKey = key || 'digifycx';
    applyBrand(lockedBrandKey, { reason });
    if (section) setActiveSection(section);
  };

  const unlockBrand = ({ reason = 'reset' } = {}) => {
    brandLocked = false;
    lockedBrandKey = 'digifycx';
    applyBrand('digifycx', { reason });
  };

  const syncBrandPills = (activeSection) => {
    const activeId = activeSection && activeSection.id ? `#${activeSection.id}` : null;
    document.querySelectorAll('.brand-pill[href^="#"]').forEach(pill => {
      const href = pill.getAttribute('href');
      pill.classList.toggle('is-active', !!activeId && href === activeId);
    });
  };

  applyBrand('digifycx', { reason: 'init' });

  const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
  const visibility = new Map();
  let rafPending = false;
  const pickMostVisible = () => {
    rafPending = false;
    let bestSection = null;
    let bestRatio = 0;
    for (const sec of brandSections) {
      const ratio = visibility.get(sec) || 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestSection = sec;
      }
    }

    if (!bestSection || bestRatio < 0.22) return;
    const key = bestSection.dataset.brand || 'digifycx';
    setActiveSection(bestSection);
    syncBrandPills(bestSection);
    if (!brandLocked) applyBrand(key, { reason: 'scroll' });
  };

  if (brandSections.length) {
    const brandObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visibility.set(entry.target, entry.intersectionRatio || 0);
      });
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(pickMostVisible);
      }
    }, { threshold: thresholds });

    brandSections.forEach(sec => {
      visibility.set(sec, 0);
      brandObs.observe(sec);
    });
  }

  const scrollToTarget = (target) => {
    if (!target) return;
    const offset = getScrollOffset();
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReduceMotion ? 'auto' : 'smooth' });
  };

  const handleBrandLinkClick = (target) => {
    if (!target) return;
    const brandKey = target.dataset.brand;
    if (!brandKey) return;
    lockBrand(brandKey, { section: target, reason: 'click' });
    syncBrandPills(target);
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetSelector = anchor.getAttribute('href');
      if (!targetSelector || targetSelector === '#') return;
      let target = null;
      try {
        target = document.querySelector(targetSelector);
      } catch (err) {
        return;
      }
      if (!target) return;
      e.preventDefault();
      const isBrandPill = anchor.classList.contains('brand-pill');
      const brandKey = target.dataset.brand;
      if (isBrandPill || (brandKey && brandKey !== 'digifycx')) handleBrandLinkClick(target);
      scrollToTarget(target);
      if (navCollapseEl && navCollapseEl.contains(anchor)) closeNavCollapse();
    });
  });

  document.querySelectorAll('button[data-bs-toggle="pill"][data-bs-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-bs-target') || '';
      const id = t.replace('#', '').toLowerCase();
      if (id.includes('cxexperts')) lockBrand('cxexperts', { reason: 'tab' });
      else if (id.includes('bpo')) lockBrand('digifybpo', { reason: 'tab' });
      else if (id.includes('outbound')) lockBrand('outboundcx', { reason: 'tab' });
      else if (id.includes('leads')) lockBrand('cxleads', { reason: 'tab' });
    });
  });

  document.querySelectorAll('.chapter-indicator button[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.target);
      if (target && target.dataset.brand && target.dataset.brand !== 'digifycx') handleBrandLinkClick(target);
    });
  });

  const wireResetControl = (el) => {
    if (!el) return false;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      unlockBrand({ reason: 'reset' });
      setActiveSection(document.querySelector('#group') || document.querySelector('[data-brand]'));
      syncBrandPills(document.querySelector('#group'));
      scrollToTarget(document.querySelector('#group'));
    });
    return true;
  };

  const existingReset =
    document.querySelector('#brand-reset') ||
    document.querySelector('[data-brand-reset]') ||
    document.querySelector('.brand-reset-btn');

  if (!wireResetControl(existingReset)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'brand-reset-btn glass';
    btn.textContent = 'Reset to Group';
    document.body.appendChild(btn);
    wireResetControl(btn);
  }

  const hero = document.getElementById('hero');
  const indicatorButtons = Array.from(document.querySelectorAll('.chapter-indicator button'));
  const sections = ['#hero','#group','#about','#story','#brands','#partners-stack','#services','#contact']
    .map(id => document.querySelector(id))
    .filter(Boolean);
  const indicatorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        indicatorButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.target === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => indicatorObserver.observe(sec));
  indicatorButtons.forEach(btn => btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    if (target) scrollToTarget(target);
  }));

  const body = document.body;
  if (hero) {
    const barObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) body.classList.add('cinema');
      else body.classList.remove('cinema');
    }, { threshold: 0.4 });
    barObserver.observe(hero);
  }

  // ========== VANTA.JS INITIALIZATION (CHROME FIX) ==========
  let vantaEffect = null;
  const heroVantaEl = document.getElementById('hero-vanta');
  let heroInView = true;
  const vantaDebug = true;

  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      const opts = { powerPreference: 'high-performance' };
      const hasWebGL = !!(window.WebGLRenderingContext || window.WebGL2RenderingContext);
      if (!hasWebGL) return false;
      return !!(
        canvas.getContext('webgl2', opts) ||
        canvas.getContext('webgl', opts) ||
        canvas.getContext('experimental-webgl', opts)
      );
    } catch (err) {
      return false;
    }
  };

  const canUseWebGL = supportsWebGL();

  const logVantaState = (label) => {
    if (!vantaDebug) return;
    console.log('Vanta:', {
      label,
      vantaExists: !!window.VANTA,
      cloudsExists: !!(window.VANTA && window.VANTA.CLOUDS),
      threeExists: !!window.THREE,
      heroElement: !!heroVantaEl,
      heroSize: heroVantaEl ? `${heroVantaEl.offsetWidth}x${heroVantaEl.offsetHeight}` : 'N/A',
      isSmall,
      prefersReduceMotion
    });
  };

  const ensureHeroVantaSize = () => {
    if (!heroVantaEl) return false;
    const heroSection = heroVantaEl.closest('#hero') || hero;
    if (!heroSection) return false;

    // Force synchronous layout computation
    const rect = heroSection.getBoundingClientRect();
    const w = Math.max(window.innerWidth, rect.width || 0);
    const h = Math.max(window.innerHeight, rect.height || 0);

    if (w < 200 || h < 200) return false;

    heroVantaEl.style.width = `${w}px`;
    heroVantaEl.style.height = `${h}px`;
    heroVantaEl.style.display = 'block';
    heroVantaEl.style.position = 'absolute';
    heroVantaEl.style.top = '0';
    heroVantaEl.style.left = '0';

    return true;
  };

  const initVanta = () => {
    if (vantaEffect) return;
    if (prefersReduceMotion || !heroInView) return;
    if (!heroVantaEl) return;
    if (!canUseWebGL) return;
    if (!window.VANTA || !window.VANTA.CLOUDS || !window.THREE) return;

    logVantaState('attempting-init');

    if (!ensureHeroVantaSize()) {
      console.warn('Vanta: Hero size not ready');
      return;
    }

    try {
      vantaEffect = window.VANTA.CLOUDS({
        el: heroVantaEl,
        mouseControls: !isSmall,
        touchControls: !isSmall,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        skyColor: 0x3ec3f7,
        sunColor: 0xba18ff,
        sunlightColor: 0xff5c30,
        speed: isSmall ? 0.3 : 0.5,
        zoom: 1.0
      });
      console.log('✅ Vanta initialized');
    } catch (err) {
      console.error('❌ Vanta init failed:', err);
      vantaEffect = null;
    }
  };

  const destroyVanta = () => {
    if (!vantaEffect) return;
    try {
      vantaEffect.destroy();
      vantaEffect = null;
      console.log('Vanta destroyed');
    } catch (err) {
      console.warn('Error destroying Vanta:', err);
    }
  };

  const updateVanta = () => {
    if (!heroInView || prefersReduceMotion) {
      destroyVanta();
      return;
    }
    if (vantaEffect && typeof vantaEffect.resize === 'function') {
      if (ensureHeroVantaSize()) {
        vantaEffect.resize();
      }
    } else {
      initVanta();
    }
  };

  // CRITICAL: Delay Vanta init to ensure DOM fully painted + scripts loaded
  const vantaInitDelay = setTimeout(() => {
    console.log('Vanta lib check:', {
      vantaLoaded: !!window.VANTA,
      cloudsLoaded: !!(window.VANTA && window.VANTA.CLOUDS),
      threeLoaded: !!window.THREE
    });
    updateVanta();
  }, 250);

  if (hero) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      updateVanta();
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  const handleResize = () => {
    const wasSmall = isSmall;
    setViewportFlags();
    setNavOffset();
    document.body.setAttribute('data-bs-offset', String(getScrollOffset()));
    if (scrollSpy) {
      scrollSpy.dispose();
      scrollSpy = new bootstrap.ScrollSpy(document.body, { target: '#mainNav', offset: getScrollOffset() });
    }
    if (wasSmall !== isSmall) destroyVanta();
    setTimeout(updateVanta, 300);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 500);
  });

  const stickyCta = document.querySelector('.sticky-cta');
  const toggleSticky = () => {
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrolled > 0.3) stickyCta.classList.add('show');
    else stickyCta.classList.remove('show');
  };
  toggleSticky();
  window.addEventListener('scroll', toggleSticky);

  const storySection = document.querySelector('.story-section');
  if (storySection && !prefersReduceMotion) {
    const updateStoryShift = () => {
      const rect = storySection.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (viewH + rect.height)));
      const shift = (progress * 120).toFixed(2);
      storySection.style.setProperty('--storyShift', shift);
    };
    updateStoryShift();
    window.addEventListener('scroll', updateStoryShift);
  } else if (storySection) {
    storySection.style.setProperty('--storyShift', '0');
  }

  const sectionToggleButtons = Array.from(document.querySelectorAll('[data-section-toggle]'));
  const setSectionToggleLabel = (btn, expanded) => {
    const closedLabel = btn.getAttribute('data-label-closed') || 'More';
    const openLabel = btn.getAttribute('data-label-open') || 'Less';
    btn.textContent = expanded ? openLabel : closedLabel;
  };
  const openSectionPanel = (btn, panel) => {
    panel.hidden = false;
    panel.classList.add('is-open');
    if (prefersReduceMotion) {
      panel.style.maxHeight = 'none';
    } else {
      panel.style.maxHeight = '0px';
      const targetHeight = panel.scrollHeight;
      window.requestAnimationFrame(() => {
        panel.style.maxHeight = `${targetHeight}px`;
      });
      const onEnd = (event) => {
        if (event.propertyName !== 'max-height') return;
        panel.style.maxHeight = 'none';
        panel.removeEventListener('transitionend', onEnd);
      };
      panel.addEventListener('transitionend', onEnd);
    }
    btn.setAttribute('aria-expanded', 'true');
    setSectionToggleLabel(btn, true);
  };
  const closeSectionPanel = (btn, panel) => {
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    setSectionToggleLabel(btn, false);
    if (prefersReduceMotion) {
      panel.hidden = true;
      panel.style.maxHeight = '0px';
      return;
    }
    const startHeight = panel.scrollHeight;
    panel.style.maxHeight = `${startHeight}px`;
    window.requestAnimationFrame(() => {
      panel.style.maxHeight = '0px';
    });
    const onEnd = (event) => {
      if (event.propertyName !== 'max-height') return;
      panel.hidden = true;
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  };
  sectionToggleButtons.forEach(btn => {
    const panelId = btn.getAttribute('data-section-toggle');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-expanded', 'false');
    setSectionToggleLabel(btn, false);
    panel.hidden = true;
    panel.style.maxHeight = '0px';
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeSectionPanel(btn, panel);
      else openSectionPanel(btn, panel);
    });
    window.addEventListener('resize', () => {
      if (!panel.classList.contains('is-open') || prefersReduceMotion) return;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    });
  });

  const contactForm = document.getElementById('contact-form');
  const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  const toastContainer = document.querySelector('.toast-container');
  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-bg-dark border-0 show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<div class="d-flex"><div class="toast-body">' + msg + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  };
  const setFormLoading = (isLoading) => {
    if (!contactForm || !submitBtn) return;
    contactForm.classList.toggle('is-loading', isLoading);
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.disabled = isLoading;
  };
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.classList.add('was-validated');
      if (!contactForm.checkValidity()) return;
      setFormLoading(true);
      window.setTimeout(() => {
        showToast('Docking request received. We will respond shortly (mock).');
        contactForm.reset();
        contactForm.classList.remove('was-validated');
        setFormLoading(false);
      }, 800);
    });
  }
});
