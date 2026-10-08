document.addEventListener('DOMContentLoaded', () => {
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

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];

  const setActiveNav = () => {
    const marker = window.scrollY + 180;
    let active = 'top';
    sections.forEach(section => {
      if (marker >= section.offsetTop) active = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('nav-active', link.getAttribute('href') === '#' + active);
    });
  };

  setActiveNav();
  window.addEventListener('scroll', setActiveNav, { passive: true });

  document.querySelectorAll('.btn, .mint-tag, .burst, .time-grid button, .icon-close').forEach(button => {
    button.addEventListener('pointerdown', () => {
      if (!reduceMotion) button.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }],
        { duration: 180, easing: 'ease-out' }
      );
    });
  });
});