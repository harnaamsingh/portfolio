/* ===========================================================================
   Artworks — grid rows (50vw/50vw, 100vh each) + inline slider on open
   Adds: cursor badge ("OPEN" / "CLOSE"), click image to close,
         mobile-safe (CSS handles stacking, this binds hover only on pointer)
   ========================================================================== */

const list = document.getElementById('awList');
const rows = document.querySelectorAll('.aw-row');

/* ---------------------------------------------------------------------------
   PROJECT DATA  (replace the paths/captions with your assets)
--------------------------------------------------------------------------- */
const PROJECTS = {
  proj1: {
    title: 'Battleship Sphyrna',
    cover: 'cover.jpg',
    slides: [
       { src: 'cover.jpg', cap: 'The battleship is a formidable multi-role exploration and command vessel, defined by its iconic Central Command Tower—a multi-tiered, angular superstructure serving as the ship\'s brain, crowned with advanced sensor arrays and offering 360-degree visibility from its reinforced panoramic viewports. This powerful command nexus rises from a hull whose lowest deck forms the vessel\'s industrial soul, a cavernous space dominated by a massive moon pool for submersible operations, surrounded by gantry cranes and housing the resonant power plant and storage bays, creating a rugged, functional foundation for deep-sea discovery and extended missions.' },
      { src: '01.jpg', cap: 'The first lower deck (Deck -1) is designed as a multifunctional hub focused on crew sustainability and operational redundancy. The primary allocation of space is dedicated to crew accommodation and strategic meeting areas for personnel and command staff. To ensure habitability and system functionality, the deck integrates essential utilities. The efficient layout is engineered to accommodate and service the vessel\'s primary cooling exhaust conduits, which run through designated technical spaces.' },
      { src: '02.jpg', cap: 'The lower deck (-2) functions as the vessel\'s primary artillery center, featuring four electrically-powered broadside cannons and four compact, high-efficacy laser defense emitters. The stern houses a manned heavy laser cannon and its dedicated power generator, while the main engine is located forward, shielded by armored plating. Modular turrets at each corner can switch between micro-missiles and machine guns, and the deck is equipped with deployment readiness rooms, lifeboats, and stairwell access to the upper decks.' },
      // { src: '02.jpg', cap: 'Exploded assembly view.' },
    ],
  },
  proj2: {
    title: 'Filament',
    cover: 'assets/proj2/cover.jpg',
    slides: [
      { src: 'assets/proj2/01.jpg', cap: 'Landing — hero grid.' },
      { src: 'assets/proj2/02.jpg', cap: 'Component system / color study.' },
      { src: 'assets/proj2/03.jpg', cap: 'Alt motion keyframes.' },
    ],
  },
  proj3: {
    title: 'Reverie',
    cover: 'assets/proj3/cover.jpg',
    slides: [
      { src: 'assets/proj3/01.jpg', cap: 'Panel I — graphite & ink.' },
      { src: 'assets/proj3/02.jpg', cap: 'Panel II — gouache overlays.' },
      { src: 'assets/proj3/03.jpg', cap: 'Panel III — composite.' },
    ],
  },
};

/* Cosmetic: reveal on enter */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if (e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.35});
rows.forEach(r=>io.observe(r));

/* ---------------------------------------------------------------------------
   Floating cursor badge (OPEN/CLOSE)
--------------------------------------------------------------------------- */
const hasFinePointer = matchMedia('(pointer:fine)').matches;
const cursorBadge = document.createElement('div');
cursorBadge.className = 'aw-cursor-badge';
cursorBadge.style.display = 'none';
document.body.appendChild(cursorBadge);

function showBadge(text, x, y){
  if (!hasFinePointer) return; // don’t show on touch devices
  cursorBadge.textContent = text;
  cursorBadge.style.display = 'block';
  cursorBadge.style.transform = `translate(${x + 14}px, ${y + 14}px)`; // offset from pointer
}
function hideBadge(){
  cursorBadge.style.display = 'none';
}
window.addEventListener('scroll', ()=> hideBadge(), {passive:true});

/* ---------------------------------------------------------------------------
   Event delegation: open when clicking any element with [data-open]
--------------------------------------------------------------------------- */
list.addEventListener('click', (e)=>{
  const launcher = e.target.closest('[data-open]');
  if (!launcher) return;
  const row = launcher.closest('.aw-row');
  if (!row) return;
  if (!row.classList.contains('open')) openRow(row);
});

/* Global open state (only one row open at a time) */
let openState = null; // { row, data, idx, slidesEls[], captionEl, closeBtn, keyHandler, swipe }

/* ---------------------------------------------------------------------------
   Helper: bind hover for a row in GRID state (cover shows OPEN)
--------------------------------------------------------------------------- */
function bindGridHover(row){
  if (!hasFinePointer) return;
  const img = row.querySelector('.aw-media img');
  if (!img) return;
  const move = (ev)=> showBadge('OPEN', ev.clientX, ev.clientY);
  img.addEventListener('mouseenter', move);
  img.addEventListener('mousemove', move);
  img.addEventListener('mouseleave', hideBadge);
}

/* bind initial grid hovers */
rows.forEach(r => bindGridHover(r));

/* ---------------------------------------------------------------------------
   Build/open slider inside a row
--------------------------------------------------------------------------- */
function openRow(row){
  const id = row.dataset.id;
  const data = PROJECTS[id];
  if (!data) return;

  // Close all other rows
  rows.forEach(r => { if (r !== row) closeRow(r); });

  // Remember original HTML so we can restore it precisely
  const textCol = row.querySelector('.aw-text');
  const mediaCol = row.querySelector('.aw-media');
  if (!row.dataset.textHtml) row.dataset.textHtml = textCol.innerHTML;
  if (!row.dataset.mediaHtml) row.dataset.mediaHtml = mediaCol.innerHTML;

  // Enter open mode
  row.classList.add('open');
  list.style.scrollSnapType = 'none'; // let the slider feel natural
  row.scrollIntoView({ behavior:'smooth', block:'start' });

  /* ---------- RIGHT COLUMN: Slider ---------- */
  mediaCol.innerHTML = '';
  const slider = document.createElement('div');
  slider.className = 'aw-slider';

  const slidesEls = data.slides.map((s, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'aw-slide' + (i === 0 ? ' active' : '');
    const el = document.createElement(s.type === 'video' ? 'video' : 'img');
    el.src = s.src;
    if (s.type === 'video') el.controls = true;
    wrap.appendChild(el);
    slider.appendChild(wrap);
    return wrap;
  });

  // Arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'aw-arrow left';
  prevBtn.setAttribute('aria-label','Previous slide');
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'aw-arrow right';
  nextBtn.setAttribute('aria-label','Next slide');
  nextBtn.textContent = '›';

  slider.appendChild(prevBtn);
  slider.appendChild(nextBtn);
  mediaCol.appendChild(slider);

  /* ---------- LEFT COLUMN: Title + dynamic caption ---------- */
  const leftHTML = `
    <h2>${data.title}</h2>
    <p class="aw-caption">${data.slides[0]?.cap || ''}</p>
  `;
  textCol.innerHTML = leftHTML;
  const captionEl = textCol.querySelector('.aw-caption');

  /* ---------- Close pill (also click the image to close) ---------- */
  const closeBtn = document.createElement('button');
  closeBtn.className = 'aw-close';
  closeBtn.textContent = 'Close';
  row.appendChild(closeBtn);

  /* ---------- Slide logic ---------- */
  let idx = 0;
  const setSlide = (newIdx) => {
    const n = data.slides.length;
    idx = (newIdx + n) % n;
    slidesEls.forEach((s, i) => s.classList.toggle('active', i === idx));
    captionEl.textContent = data.slides[idx]?.cap || '';
  };
  const next = () => setSlide(idx + 1);
  const prev = () => setSlide(idx - 1);

prevBtn.addEventListener('click', (e)=>{ e.stopPropagation(); prev(); });
nextBtn.addEventListener('click', (e)=>{ e.stopPropagation(); next(); });

  /* Keyboard navigation while open */
  const keyHandler = (e) => {
    if (!openState || openState.row !== row) return;
    if (e.key === 'Escape') { closeRow(row); return; }
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };
  document.addEventListener('keydown', keyHandler);

  /* Swipe support on the slider (mobile) */
  let startX = null;
  const onTouchStart = (e)=>{ startX = e.touches[0].clientX; };
  const onTouchMove  = (e)=>{
    if (startX == null) return;
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 50){ dx < 0 ? next() : prev(); startX = null; }
  };
  slider.addEventListener('touchstart', onTouchStart, {passive:true});
  slider.addEventListener('touchmove', onTouchMove, {passive:true});

  /* Click image to close + hover badge "CLOSE" while open */
  const stageMove = (ev)=> showBadge('CLOSE', ev.clientX, ev.clientY);
  const bindOpenHover = ()=>{
    if (!hasFinePointer) return;
    slider.addEventListener('mouseenter', stageMove);
    slider.addEventListener('mousemove', stageMove);
    slider.addEventListener('mouseleave', hideBadge);
  };
  bindOpenHover();
  slider.addEventListener('click', ()=> closeRow(row));

  /* Save state */
  openState = {
    row, data, idx, slidesEls, captionEl, closeBtn,
    keyHandler,
    swipe: { onTouchStart, onTouchMove, slider },
    hover: { stageMove, slider }
  };

  closeBtn.addEventListener('click', ()=> closeRow(row));
}

/* ---------------------------------------------------------------------------
   Restore row back to cover/grid state
--------------------------------------------------------------------------- */
function closeRow(row){
  if (!row.classList.contains('open')) return;

  // Remove key/swipe/hover listeners if this is the open row
  if (openState && openState.row === row) {
    document.removeEventListener('keydown', openState.keyHandler);
    const { slider, onTouchStart, onTouchMove } = openState.swipe;
    slider?.removeEventListener('touchstart', onTouchStart);
    slider?.removeEventListener('touchmove', onTouchMove);
    // hover badge
    if (hasFinePointer && openState.hover?.slider){
      openState.hover.slider.removeEventListener('mouseenter', openState.hover.stageMove);
      openState.hover.slider.removeEventListener('mousemove', openState.hover.stageMove);
      openState.hover.slider.removeEventListener('mouseleave', hideBadge);
    }
    openState.closeBtn?.remove();
    openState = null;
  }
  hideBadge();

  // Restore original HTML exactly as it was
  const textCol = row.querySelector('.aw-text');
  const mediaCol = row.querySelector('.aw-media');
  if (row.dataset.textHtml) textCol.innerHTML = row.dataset.textHtml;
  if (row.dataset.mediaHtml) mediaCol.innerHTML = row.dataset.mediaHtml;

  // Rebind open triggers and hover in grid state
  textCol.querySelector('[data-open]')?.addEventListener('click', ()=> openRow(row));
  const cover = mediaCol.querySelector('img');
  if (cover){
    cover.addEventListener('click', ()=> openRow(row));
  }
  bindGridHover(row);

  row.classList.remove('open');
  list.style.scrollSnapType = 'y mandatory';
}

/* ---------------------------------------------------------------------------
   Optional: placeholder for missing images (keeps layout stable)
--------------------------------------------------------------------------- */
(function placeholders(){
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
      <defs><linearGradient id='g' x1='0' x2='1'>
        <stop stop-color='#f0f0f0'/><stop offset='1' stop-color='#e8e8e8'/>
      </linearGradient></defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle'
            font-family='Arial' font-size='28' fill='#999'>image not found</text>
    </svg>`
  );
  const ph = `data:image/svg+xml;charset=utf-8,${svg}`;
  document.addEventListener('error',(e)=>{
    const t = e.target;
    if (t.tagName==='IMG' && !t.dataset.fallback){
      t.dataset.fallback = '1';
      t.src = ph;
      t.style.objectFit = 'contain';
    }
  }, true);
})();

/* ---------------------------------------------------------------------------
   Re-bind Menu functionality for Artworks page
--------------------------------------------------------------------------- */
(function initMenu(){
  const menuBtn = document.querySelector('.menu-pill');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeBtn = document.querySelector('.menu-close');

  if (!menuBtn || !menuOverlay) return;

  menuBtn.addEventListener('click', () => {
    menuOverlay.setAttribute('aria-hidden','false');
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  closeBtn?.addEventListener('click', () => {
    menuOverlay.setAttribute('aria-hidden','true');
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      closeBtn?.click();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
      closeBtn?.click();
    }
  });
})();
