/**
 * script.js — Static background image + smooth cursor spotlight.
 * Used on: index.html
 */
(function () {
  'use strict';

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const vw  = () => window.innerWidth;
  const vh  = () => window.innerHeight;

  const bgCanvas = document.getElementById('bg');
  const fxCanvas = document.getElementById('fx');
  if (!bgCanvas || !fxCanvas) return;

  const bgCtx = bgCanvas.getContext('2d', { alpha: false });
  const fxCtx = fxCanvas.getContext('2d');

  // Image candidates (tries each in order)
  const IMG_CANDIDATES = ['Sahib.png', 'Sahib1.jpg', 'main.jpg'];
  let bgImage = null;
  let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

  function resize() {
    [bgCanvas, fxCanvas].forEach(c => {
      c.width  = vw() * DPR;
      c.height = vh() * DPR;
      c.style.width  = vw() + 'px';
      c.style.height = vh() + 'px';
    });
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fxCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    if (bgImage) { computeCover(); drawBackground(); }
  }

  function computeCover() {
    const iw = bgImage.naturalWidth;
    const ih = bgImage.naturalHeight;
    const scale = Math.max(vw() / iw, vh() / ih);
    coverRect.dw = Math.round(iw * scale);
    coverRect.dh = Math.round(ih * scale);
    coverRect.dx = Math.round((vw() - coverRect.dw) / 2);
    coverRect.dy = Math.round((vh() - coverRect.dh) / 2);
  }

  function drawBackground() {
    bgCtx.fillStyle = '#000';
    bgCtx.fillRect(0, 0, vw(), vh());

    if (bgImage && bgImage.complete) {
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.imageSmoothingQuality = 'high';
      bgCtx.drawImage(
        bgImage,
        0, 0, bgImage.naturalWidth, bgImage.naturalHeight,
        coverRect.dx, coverRect.dy, coverRect.dw, coverRect.dh
      );
    }

    // Soft vignette baked into BG layer
    const grad = bgCtx.createRadialGradient(
      vw() / 2, vh() / 2, 0,
      vw() / 2, vh() / 2, Math.max(vw(), vh()) * 0.82
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, vw(), vh());
  }

  function drawFallback() {
    bgCtx.fillStyle = '#111';
    bgCtx.fillRect(0, 0, vw(), vh());
  }

  // Load image
  function tryLoad(index) {
    if (index >= IMG_CANDIDATES.length) { drawFallback(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { bgImage = img; resize(); };
    img.onerror = () => tryLoad(index + 1);
    img.src = IMG_CANDIDATES[index] + '?v=' + Date.now();
  }

  // ── Spotlight ─────────────────────────────────────────────
  const spot = {
    x: vw() / 2, y: vh() / 2,
    tx: vw() / 2, ty: vh() / 2,
    alpha: 0, targetAlpha: 0
  };
  const SPOT_RADIUS = 150;
  let idleTimeout;

  window.addEventListener('mousemove', e => {
    spot.tx = e.clientX;
    spot.ty = e.clientY;
    spot.targetAlpha = 1;

    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => { spot.targetAlpha = 0; }, 800);
  }, { passive: true });

  function renderSpotlight() {
    spot.x += (spot.tx - spot.x) * 0.14;
    spot.y += (spot.ty - spot.y) * 0.14;
    spot.alpha += (spot.targetAlpha - spot.alpha) * 0.1;

    fxCtx.clearRect(0, 0, vw(), vh());

    if (spot.alpha > 0.01) {
      const grad = fxCtx.createRadialGradient(
        spot.x, spot.y, 0,
        spot.x, spot.y, SPOT_RADIUS
      );
      grad.addColorStop(0,   `rgba(255,255,255,${0.16 * spot.alpha})`);
      grad.addColorStop(0.55, `rgba(255,255,255,${0.06 * spot.alpha})`);
      grad.addColorStop(1,   'rgba(255,255,255,0)');

      fxCtx.globalCompositeOperation = 'lighter';
      fxCtx.fillStyle = grad;
      fxCtx.beginPath();
      fxCtx.arc(spot.x, spot.y, SPOT_RADIUS, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.globalCompositeOperation = 'source-over';
    }

    requestAnimationFrame(renderSpotlight);
  }

  // ── Init ──────────────────────────────────────────────────
  resize();
  window.addEventListener('resize', resize);
  tryLoad(0);
  requestAnimationFrame(renderSpotlight);
})();
