/**
 * artwork-viewer.js
 * Drives the scroll-based, side-by-side artwork viewer.
 *
 * Usage: include after the HTML, define window.ARTWORK_DATA = { title, description, slides[] }
 * Each slide: { src, cap }
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const data = window.ARTWORK_DATA;
    if (!data || !data.slides || data.slides.length === 0) return;

    const slides      = data.slides;
    const totalSlides = slides.length;

    // DOM refs
    const intro       = document.getElementById('awIntro');
    const viewer      = document.getElementById('awViewer');
    const scrollPanel = document.getElementById('awScrollPanel');
    const captionWrap = document.getElementById('awCaptionWrap');
    const counterNum  = document.getElementById('awCounterNum');
    const counterFill = document.getElementById('awCounterFill');
    const dotsWrap    = document.getElementById('awDots');
    const prevBtn     = document.getElementById('awPrev');
    const nextBtn     = document.getElementById('awNext');

    let currentIndex = 0;

    // ── Build slides ──────────────────────────────────────
    slides.forEach((slide, i) => {
      const div = document.createElement('div');
      div.className = 'aw-slide';
      div.dataset.index = i;

      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = `Slide ${i + 1}`;
      img.loading = i < 3 ? 'eager' : 'lazy';
      div.appendChild(img);

      scrollPanel.appendChild(div);
    });

    // Fallback for missing images
    scrollPanel.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function () {
        if (!this.dataset.fallback) {
          this.dataset.fallback = '1';
          this.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
              <rect width="100%" height="100%" fill="#1a1a1a"/>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
                    font-family="sans-serif" font-size="20" fill="#555">image not found</text>
            </svg>`
          )}`;
        }
      });
    });

    // ── Build dots ────────────────────────────────────────
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'aw-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));

      // Limit dots to 20 max
      if (i < 20) dotsWrap.appendChild(btn);
    });

    // ── Build caption ─────────────────────────────────────
    function buildCaptionEl(text, visible) {
      const el = document.createElement('p');
      el.className = 'aw-caption ' + (visible ? 'visible' : 'entering');
      el.textContent = text;
      return el;
    }

    let currentCaptionEl = buildCaptionEl(slides[0]?.cap || '', true);
    captionWrap.appendChild(currentCaptionEl);

    // ── Update UI for a given slide index ─────────────────
    function updateUI(index) {
      if (index === currentIndex && viewer.classList.contains('active')) return;

      const previous = currentIndex;
      currentIndex = index;

      // Counter
      counterNum.textContent = `${index + 1} / ${totalSlides}`;
      const pct = totalSlides > 1 ? (index / (totalSlides - 1)) * 100 : 100;
      counterFill.style.width = pct + '%';

      // Dots
      dotsWrap.querySelectorAll('.aw-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      // Prev / Next buttons
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === totalSlides - 1;

      // Caption transition
      const direction = index > previous ? 1 : -1;
      const outgoing  = currentCaptionEl;
      const incoming  = buildCaptionEl(slides[index]?.cap || '', false);

      captionWrap.appendChild(incoming);
      outgoing.classList.add('leaving');
      outgoing.style.transform = `translateY(${-direction * 10}px)`;

      // Enter on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          incoming.classList.remove('entering');
          incoming.classList.add('visible');
          incoming.style.transform = 'translateY(0)';

          setTimeout(() => {
            outgoing.remove();
            currentCaptionEl = incoming;
          }, 380);
        });
      });
    }

    // ── Navigate to a slide ───────────────────────────────
    function goTo(index) {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      const slideEls = scrollPanel.querySelectorAll('.aw-slide');
      if (slideEls[clamped]) {
        slideEls[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // ── Keyboard navigation ───────────────────────────────
    document.addEventListener('keydown', e => {
      if (!viewer.classList.contains('active')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
      if (e.key === 'ArrowUp'  || e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex - 1); }
    });

    // ── IntersectionObserver: detect active slide ─────────
    const slideEls = () => scrollPanel.querySelectorAll('.aw-slide');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const img = entry.target.querySelector('img');
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          updateUI(parseInt(entry.target.dataset.index, 10));
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      root: scrollPanel,
      threshold: 0.55,
    });

    slideEls().forEach(el => observer.observe(el));

    // ── Intro → Viewer transition ─────────────────────────
    // Trigger on scroll in the scroll panel or on the intro click
    function activateViewer() {
      if (viewer.classList.contains('active')) return;
      intro.classList.add('hidden');
      viewer.classList.add('active');
      // Force first slide to be visible
      const firstSlide = scrollPanel.querySelector('.aw-slide');
      if (firstSlide) {
        firstSlide.classList.add('in-view');
        updateUI(0);
      }
    }

    // Clicking/scrolling anywhere on intro activates viewer
    intro.addEventListener('click', activateViewer);
    intro.addEventListener('wheel', activateViewer, { passive: true });

    // Also activate on first scroll of the scroll panel (if accessed directly)
    scrollPanel.addEventListener('scroll', activateViewer, { passive: true, once: true });

    // Activate after a short delay automatically too
    setTimeout(activateViewer, 3200);

    // ── Touch swipe on scroll panel ───────────────────────
    let touchStartY = null;
    scrollPanel.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    scrollPanel.addEventListener('touchend', e => {
      if (touchStartY === null) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) { goTo(currentIndex + (dy > 0 ? 1 : -1)); }
      touchStartY = null;
    }, { passive: true });

    // Initial state
    counterNum.textContent = `1 / ${totalSlides}`;
    counterFill.style.width = totalSlides > 1 ? '0%' : '100%';
    prevBtn.disabled = true;
    nextBtn.disabled = totalSlides <= 1;
  });
})();
