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

  const header = document.getElementById('header');

  // スクロール時ヘッダー (PC: 白背景 + 影)
  if (header) {
    const SCROLL_THRESHOLD = 80;
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ツールチップ (PC: hover / focus、SP: タップで開閉。外側タップ・再タップ・Esc で閉じる)
  const tooltips = document.querySelectorAll('.c-tooltip');

  if (tooltips.length) {
    const EDGE_MARGIN = 10;

    // 画面端で見切れないよう横位置を補正
    const placeTooltip = (tooltip) => {
      const body = tooltip.querySelector('.c-tooltip__body');
      if (!body) return;
      body.style.setProperty('--tt-shift', '0px');
      const rect = body.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      let shift = 0;
      if (rect.right > viewportWidth - EDGE_MARGIN) {
        shift = viewportWidth - EDGE_MARGIN - rect.right;
      }
      if (rect.left + shift < EDGE_MARGIN) {
        shift = EDGE_MARGIN - rect.left;
      }
      body.style.setProperty('--tt-shift', `${Math.round(shift)}px`);
    };

    const closeAll = (except) => {
      tooltips.forEach((tooltip) => {
        if (tooltip !== except) tooltip.classList.remove('is-open');
      });
    };

    tooltips.forEach((tooltip) => {
      const btn = tooltip.querySelector('.c-tooltip__btn');
      if (!btn) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !tooltip.classList.contains('is-open');
        closeAll(tooltip);
        tooltip.classList.remove('is-dismissed');
        tooltip.classList.toggle('is-open', willOpen);
        if (willOpen) placeTooltip(tooltip);
      });

      tooltip.addEventListener('mouseenter', () => placeTooltip(tooltip));
      btn.addEventListener('focus', () => placeTooltip(tooltip));

      // Esc で消したものは、ポインタ・フォーカスが外れたら再表示可能に戻す
      tooltip.addEventListener('mouseleave', () => tooltip.classList.remove('is-dismissed'));
      btn.addEventListener('blur', () => tooltip.classList.remove('is-dismissed'));
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.c-tooltip')) closeAll();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      tooltips.forEach((tooltip) => {
        if (tooltip.classList.contains('is-open') || tooltip.matches(':hover, :focus-within')) {
          tooltip.classList.remove('is-open');
          tooltip.classList.add('is-dismissed');
        }
      });
    });

    window.addEventListener('resize', () => {
      tooltips.forEach((tooltip) => {
        if (tooltip.classList.contains('is-open')) placeTooltip(tooltip);
      });
    });
  }

  // スムーススクロール (固定ヘッダー分のオフセット補正)
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
