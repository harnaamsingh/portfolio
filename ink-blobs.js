/**
 * ink-blobs.js — Animated coloured blob background.
 * Used on: info.html, contact.html
 */
(function () {
  'use strict';

  const DPR    = Math.min(window.devicePixelRatio || 1, 2);
  const vw     = () => window.innerWidth;
  const vh     = () => window.innerHeight;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mainCanvas = document.getElementById('bg');
  const fxCanvas   = document.getElementById('fx');
  if (!mainCanvas || !fxCanvas) return;

  const mainCtx = mainCanvas.getContext('2d', { alpha: false });
  const fxCtx   = fxCanvas.getContext('2d');

  // Low-res offscreen for performance
  const offscreen = document.createElement('canvas');
  const offCtx    = offscreen.getContext('2d');

  function resize() {
    [mainCanvas, fxCanvas].forEach(c => {
      c.width  = vw() * DPR;
      c.height = vh() * DPR;
      c.style.width  = vw() + 'px';
      c.style.height = vh() + 'px';
    });
    mainCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fxCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    offscreen.width  = Math.max(160, Math.round(vw() * 0.28));
    offscreen.height = Math.max(120, Math.round(vh() * 0.28));
  }

  const PALETTES = [
    ['#F94144', '#F3722C', '#F8961E', '#90BE6D', '#577590'],
    ['#8E75FF', '#FF6EA7', '#FFD166', '#4BE0C2', '#6A4C93'],
    ['#00B5D8', '#7ED957', '#FFC75F', '#FF9671', '#B19CD9'],
  ];
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

  function createBlob(i) {
    const scale  = Math.random() * 0.8 + 0.7;
    const radius = Math.min(vw(), vh()) * 0.14 * scale;
    const speed  = 0.3 + Math.random() * 0.7;
    return {
      x:        Math.random() * vw(),
      y:        Math.random() * vh(),
      radius,
      color:    palette[i % palette.length],
      vx:       (Math.random() - 0.5) * speed,
      vy:       (Math.random() - 0.5) * speed,
      wobble:   Math.random() * Math.PI * 2,
      wobSpeed: 0.004 + Math.random() * 0.003,
    };
  }

  const COUNT = Math.round(Math.min(18, 10 + (vw() * vh()) / 120000));
  const blobs = Array.from({ length: COUNT }, (_, i) => createBlob(i));

  const mouse = { nx: 0, ny: 0 };
  window.addEventListener('mousemove', e => {
    mouse.nx = (e.clientX / vw()) * 2 - 1;
    mouse.ny = (e.clientY / vh()) * 2 - 1;
  }, { passive: true });

  function hexToRgba(hex, alpha = 1) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3
      ? h.split('').map(c => c + c).join('')
      : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >>  8) & 255;
    const b =  n        & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawBlobs() {
    const ow = offscreen.width;
    const oh = offscreen.height;

    offCtx.clearRect(0, 0, ow, oh);
    offCtx.fillStyle = '#120e16';
    offCtx.fillRect(0, 0, ow, oh);

    offCtx.save();
    offCtx.filter = 'blur(22px) saturate(110%)';

    blobs.forEach(blob => {
      blob.wobble += blob.wobSpeed;
      blob.x += blob.vx + mouse.nx * 0.12;
      blob.y += blob.vy + mouse.ny * 0.12;

      // Wrap around edges
      const margin = Math.max(blob.radius, 160);
      if (blob.x < -margin)      blob.x = vw() + margin;
      if (blob.x > vw() + margin) blob.x = -margin;
      if (blob.y < -margin)      blob.y = vh() + margin;
      if (blob.y > vh() + margin) blob.y = -margin;

      const sx = (blob.x / vw()) * ow;
      const sy = (blob.y / vh()) * oh;
      const r  = blob.radius
        * (1 + Math.sin(blob.wobble) * 0.15 + Math.sin(blob.wobble * 0.7) * 0.08)
        * (ow / vw());

      const grad = offCtx.createRadialGradient(sx, sy, 0, sx, sy, r);
      grad.addColorStop(0,    hexToRgba(blob.color, 0.95));
      grad.addColorStop(0.55, hexToRgba(blob.color, 0.65));
      grad.addColorStop(1,    hexToRgba(blob.color, 0));

      offCtx.globalCompositeOperation = 'lighter';
      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(sx, sy, r, 0, Math.PI * 2);
      offCtx.fill();
    });

    offCtx.restore();
  }

  function drawVignette() {
    fxCtx.clearRect(0, 0, vw(), vh());
    const cx   = vw() * 0.55 + mouse.nx * 24;
    const cy   = vh() * 0.55 + mouse.ny * 18;
    const r    = Math.max(vw(), vh()) * 0.9;
    const grad = fxCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.06)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    fxCtx.fillStyle = grad;
    fxCtx.fillRect(0, 0, vw(), vh());
  }

  function frame() {
    drawBlobs();
    mainCtx.drawImage(offscreen, 0, 0, vw(), vh());
    drawVignette();
    if (!REDUCE) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  drawBlobs();
  mainCtx.drawImage(offscreen, 0, 0, vw(), vh());
  drawVignette();
  if (!REDUCE) requestAnimationFrame(frame);
})();
