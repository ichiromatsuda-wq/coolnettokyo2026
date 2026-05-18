(() => {
  'use strict';

  // ハンバーガーメニュー
  const hamburger = document.getElementById('js-hamburger');
  const drawer = document.getElementById('js-drawer');

  if (hamburger && drawer) {
    const toggleDrawer = (open) => {
      hamburger.classList.toggle('is-open', open);
      drawer.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('is-open');
      toggleDrawer(!isOpen);
    });

    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => toggleDrawer(false));
    });
  }

  // スムーススクロール (固定ヘッダー分のオフセット補正)
  const header = document.getElementById('header');
  const headerHeight = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
