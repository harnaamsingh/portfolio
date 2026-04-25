/**
 * menu.js — Fullscreen menu overlay, works on every page.
 * Auto-injects overlay markup if not already in the DOM.
 */
(function () {
  'use strict';

  const OPEN_CLASS = 'is-open';
  const LOCK_CLASS = 'no-scroll';

  function buildOverlay() {
    const el = document.createElement('div');
    el.id = 'menuOverlay';
    el.className = 'menu-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Site navigation');
    el.innerHTML = `
      <div class="menu-shell">
        <header class="menu-top">
          <span class="brand">Harnaam Singh</span>
          <button class="menu-close" aria-label="Close navigation">Close</button>
        </header>
        <nav class="menu-nav" aria-label="Main navigation">
          <ul>
            <li><a href="index.html">Home</a></li>
            <li class="italic"><a href="info.html"><em>Info</em></a></li>
            <li><a href="artworks.html">Artworks</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </nav>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function init() {
    const overlay  = document.getElementById('menuOverlay') || buildOverlay();
    const openBtn  = document.querySelector('.menu-pill');
    const closeBtn = overlay.querySelector('.menu-close');
    const firstLink = overlay.querySelector('.menu-nav a');

    if (!openBtn) return;

    function open() {
      overlay.classList.add(OPEN_CLASS);
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add(LOCK_CLASS);
      requestAnimationFrame(() => firstLink && firstLink.focus({ preventScroll: true }));
    }

    function close() {
      overlay.classList.remove(OPEN_CLASS);
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove(LOCK_CLASS);
      openBtn.focus({ preventScroll: true });
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    // Click outside shell to close
    overlay.addEventListener('click', e => {
      if (!e.target.closest('.menu-shell')) close();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains(OPEN_CLASS)) close();
    });

    // Nav links close the menu
    overlay.querySelectorAll('.menu-nav a').forEach(a => a.addEventListener('click', close));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
