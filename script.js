/* script.js — Static background + cursor spotlight
   - Draws a single background image (no animation)
   - Smooth spotlight on #fx that follows the cursor
*/

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const W = () => innerWidth;
const H = () => innerHeight;

const bg = document.getElementById('bg');
const ctx = bg.getContext('2d', { alpha: false });

const fx = document.getElementById('fx');
const fxc = fx.getContext('2d');

let img = null;
const candidates = ['Sahib.png', 'bg.jpg', 'bg.png', 'Sahib.jpg'];

function sizeCanvases() {
  [bg, fx].forEach(cv => {
    cv.width = W() * DPR;
    cv.height = H() * DPR;
    cv.style.width = W() + 'px';
    cv.style.height = H() + 'px';
  });
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fxc.setTransform(DPR, 0, 0, DPR, 0, 0);
}
sizeCanvases();
addEventListener('resize', () => { sizeCanvases(); if (img) { computeCover(); drawStatic(); } });

/* ------------ image loading (static) ------------- */
tryLoad(0);
function tryLoad(i) {
  if (i >= candidates.length) { drawFallback(); return; }
  const t = new Image();
  t.crossOrigin = 'anonymous';
  t.onload = () => { img = t; computeCover(); drawStatic(); };
  t.onerror = () => tryLoad(i + 1);
  t.src = candidates[i] + `?cb=${Date.now()}`;
}

/* ------------ cover math + static draw ------------ */
let cover = { dx:0, dy:0, dw:0, dh:0 };
function computeCover() {
  if (!img || !img.width) return;
  const vw = W(), vh = H(), iw = img.width, ih = img.height;
  const r = Math.max(vw/iw, vh/ih);
  cover.dw = Math.round(iw * r);
  cover.dh = Math.round(ih * r);
  cover.dx = Math.round((vw - cover.dw) / 2);
  cover.dy = Math.round((vh - cover.dh) / 2);
}

function drawStatic() {
  // background image
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,W(),H());
  if (img && img.complete) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.width, img.height,
                  cover.dx, cover.dy, cover.dw, cover.dh);
  }
  // bake a very soft vignette INTO the bg layer (so spotlight can sit above it)
  const g = ctx.createRadialGradient(W()/2, H()/2, 0, W()/2, H()/2, Math.max(W(),H())*0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.40)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W(),H());
}

function drawFallback() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0,0,W(),H());
}

/* ------------ cursor spotlight (on #fx) ------------ */
/* Smoothly follows the cursor and fades when idle */
const spot = {
  x: W()/2, y: H()/2,           // current position
  tx: W()/2, ty: H()/2,         // target position
  r: 140,                       // spotlight radius
  alpha: 0,                     // current opacity
  ta: 0                         // target opacity
};

// update on move
addEventListener('mousemove', (e) => {
  spot.tx = e.clientX;
  spot.ty = e.clientY;
  spot.ta = 1;                  // visible while moving
}, { passive:true });

// fade out when idle
let idleTimer;
addEventListener('mousemove', () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { spot.ta = 0; }, 700);
});

// spotlight render loop (only the FX layer)
function spotlightLoop() {
  // ease position & alpha
  spot.x += (spot.tx - spot.x) * 0.15;
  spot.y += (spot.ty - spot.y) * 0.15;
  spot.alpha += (spot.ta - spot.alpha) * 0.12;

  // clear only FX canvas
  fxc.clearRect(0,0,W(),H());

  if (spot.alpha > 0.01) {
    const r = spot.r;
    const g = fxc.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, r);
    // center is brighter, edges fade out
    g.addColorStop(0,   `rgba(255,255,255,${0.18*spot.alpha})`);
    g.addColorStop(0.6, `rgba(255,255,255,${0.08*spot.alpha})`);
    g.addColorStop(1,   'rgba(255,255,255,0)');

    fxc.globalCompositeOperation = 'lighter'; // soft-additive pop
    fxc.fillStyle = g;
    fxc.beginPath();
    fxc.arc(spot.x, spot.y, r, 0, Math.PI*2);
    fxc.fill();
    fxc.globalCompositeOperation = 'source-over';
  }

  requestAnimationFrame(spotlightLoop);
}
requestAnimationFrame(spotlightLoop);
