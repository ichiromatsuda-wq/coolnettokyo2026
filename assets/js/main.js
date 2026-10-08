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
      drawer.inert = !open; // 閉じている間はリンクにフォーカスさせない
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

    // 非表示中もはみ出してページ幅を広げないよう、全件を初期配置・リサイズ時に補正
    const placeAll = () => tooltips.forEach(placeTooltip);
    placeAll();
    window.addEventListener('resize', placeAll);
  }

  // 高さアニメーション付き開閉 (導入企業の声「続きを読む」/ FAQ で共用)
  const animateHeight = (el, to, onEnd) => {
    // 連打時に前回アニメーションの完了処理が走らないよう世代を記録
    const token = (Number(el.dataset.animToken) || 0) + 1;
    el.dataset.animToken = String(token);
    const from = el.getBoundingClientRect().height;
    el.style.height = `${from}px`;
    void el.offsetHeight; // reflow して開始値を確定
    el.style.height = `${to}px`;
    // transition が無効 (reduced motion 等) の場合は即完了
    if (parseFloat(getComputedStyle(el).transitionDuration) === 0) {
      if (onEnd) onEnd();
      return;
    }
    const done = (e) => {
      if (e.target !== el || e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', done);
      if (el.dataset.animToken !== String(token)) return;
      if (onEnd) onEnd();
    };
    el.addEventListener('transitionend', done);
  };

  // 導入企業の声「続きを読む」
  document.querySelectorAll('.js-voice-toggle').forEach((btn) => {
    const wrap = document.getElementById(btn.getAttribute('aria-controls'));
    const label = btn.querySelector('.p-voice__toggle-label');
    if (!wrap) return;
    const collapsedHeight = wrap.getBoundingClientRect().height;

    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (label) label.textContent = willOpen ? '閉じる' : '続きを読む';
      wrap.classList.toggle('is-open', willOpen);
      if (willOpen) {
        animateHeight(wrap, wrap.scrollHeight, () => {
          wrap.style.height = 'auto';
        });
      } else {
        animateHeight(wrap, collapsedHeight, () => {
          wrap.style.height = '';
        });
      }
    });
  });

  // よくあるご質問 アコーディオン (各項目は独立して開閉)
  document.querySelectorAll('.js-faq-toggle').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen) {
        panel.hidden = false;
        panel.style.height = '0px';
        animateHeight(panel, panel.scrollHeight, () => {
          panel.style.height = '';
        });
      } else {
        animateHeight(panel, 0, () => {
          panel.hidden = true;
          panel.style.height = '';
        });
      }
    });
  });

  // スムーススクロール (着地位置は CSS の scroll-margin-top で固定ヘッダー分を確保)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
