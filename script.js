document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.documentElement.classList.add('page-ready'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  if (!reduceMotion) {
    const parallax = document.querySelector('[data-parallax]');
    if (parallax) {
      const cards = [...parallax.querySelectorAll('.object-card')];
      parallax.addEventListener('pointermove', event => {
        const rect = parallax.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        cards.forEach((card, index) => {
          const depth = (index + 1) * 3;
          card.style.translate = (x * depth) + 'px ' + (y * depth) + 'px';
        });
      });
      parallax.addEventListener('pointerleave', () => {
        cards.forEach(card => { card.style.translate = '0 0'; });
      });
    }
  }

  // Section panels approach the viewport from depth, not from below.
  const panels = [...document.querySelectorAll('.site-stage > .section-panel')];
  const revealPanel = panel => panel.classList.add('is-panel-visible');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    panels.forEach(revealPanel);
  } else {
    const panelObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealPanel(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' });
    panels.forEach((panel, index) => {
      if (index === 0) revealPanel(panel);
      else panelObserver.observe(panel);
    });
  }

  // Scroll reveals: staggered, one-shot, and motion-safe.
  const revealGroups = [
    ['.section-intro > *', 'up'],
    ['.room-card', 'up'],
    ['.selection-note', 'scale'],
    ['.dark-inner > *', 'up'],
    ['.note-row', 'right'],
    ['.visit-card > *', 'up'],
    ['.hours', 'up'],
    ['.signup-form', 'up'],
    ['.footer-inner > *', 'up']
  ];

  const revealItems = [];
  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      if (direction === 'left') el.classList.add('reveal-left');
      if (direction === 'right') el.classList.add('reveal-right');
      if (direction === 'scale') el.classList.add('reveal-scale');
      const siblings = el.parentElement ? [...el.parentElement.children].filter(child => child.matches(selector)) : [];
      const siblingIndex = siblings.indexOf(el);
      el.style.transitionDelay = Math.min(siblingIndex * 90, 360) + 'ms';
      revealItems.push(el);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(el => observer.observe(el));
  }


  const scrollProgress = document.getElementById('scrollProgress');
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  };
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const setActiveNav = () => {
    const marker = window.scrollY + 180;
    let active = 'top';
    sections.forEach(section => {
      if (marker >= section.offsetTop) active = section.id;
    });
    navLinks.forEach(link => link.classList.toggle('nav-active', link.getAttribute('href') === '#' + active));
  };
  setActiveNav();
  window.addEventListener('scroll', setActiveNav, { passive: true });


  const roomGrid = document.querySelector('.room-grid');
  const activeFrame = roomGrid?.querySelector('.room-active-frame');

  const positionRoomFrame = card => {
    if (!roomGrid || !activeFrame || !card) return;
    const gridRect = roomGrid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    activeFrame.style.width = cardRect.width + 'px';
    activeFrame.style.height = cardRect.height + 'px';
    activeFrame.style.transform = 'translate3d(' + (cardRect.left - gridRect.left) + 'px,' + (cardRect.top - gridRect.top) + 'px,0)';
    activeFrame.classList.toggle('is-on-dark', card.classList.contains('room-card-dark'));
    activeFrame.style.opacity = '1';
  };

  if (roomGrid && activeFrame) {
    const initialRoom = roomGrid.querySelector('.room-card-active, .room-card-active-dark, .room-card-active-yellow');
    requestAnimationFrame(() => positionRoomFrame(initialRoom));

    roomGrid.addEventListener('click', event => {
      const card = event.target.closest('.room-card');
      if (!card) return;
      requestAnimationFrame(() => positionRoomFrame(card));
    });

    roomGrid.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      const card = event.target.closest('.room-card');
      if (!card) return;
      requestAnimationFrame(() => positionRoomFrame(card));
    });

    const resizeFrame = () => {
      const current = roomGrid.querySelector('.room-card-active, .room-card-active-dark, .room-card-active-yellow');
      positionRoomFrame(current);
    };
    if ('ResizeObserver' in window) new ResizeObserver(resizeFrame).observe(roomGrid);
    window.addEventListener('resize', resizeFrame);
    window.addEventListener('scroll', resizeFrame, { passive: true });
  }

  document.querySelectorAll('.btn, .mint-tag, .burst, .time-grid button, .icon-close').forEach(button => {
    button.addEventListener('pointerdown', () => {
      if (!reduceMotion) button.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }],
        { duration: 180, easing: 'ease-out' }
      );
    });
  });
});