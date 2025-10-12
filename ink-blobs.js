/* ink-blobs.js — colorful ink background (contact page only) */
(()=> {
  const DPR = Math.min(window.devicePixelRatio||1,2);
  const W = ()=>innerWidth, H = ()=>innerHeight;

  const main = document.getElementById('bg');
  const mg = main.getContext('2d',{alpha:false});
  const fx = document.getElementById('fx');
  const fg = fx.getContext('2d');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // low-res offscreen for speed
  const off = document.createElement('canvas');
  const og = off.getContext('2d');

  function size(){
    [main,fx].forEach(c=>{
      c.width=W()*DPR; c.height=H()*DPR;
      c.style.width=W()+'px'; c.style.height=H()+'px';
    });
    mg.setTransform(DPR,0,0,DPR,0,0);
    fg.setTransform(DPR,0,0,DPR,0,0);
    off.width = Math.max(160, Math.round(W()*0.28));
    off.height= Math.max(120, Math.round(H()*0.28));
  }
  size(); addEventListener('resize', size);

  const PALETTES = [
    ['#F94144','#F3722C','#F8961E','#90BE6D','#577590'],
    ['#8E75FF','#FF6EA7','#FFD166','#4BE0C2','#6A4C93'],
    ['#00B5D8','#7ED957','#FFC75F','#FF9671','#B19CD9'],
  ];
  const palette = PALETTES[(Math.random()*PALETTES.length)|0];

  const BLOBS = [];
  const COUNT = Math.round(Math.min(18, 10 + (W()*H())/120000));
  for (let i=0;i<COUNT;i++) BLOBS.push(makeBlob(i));
  function makeBlob(i){
    const color = palette[i%palette.length];
    const s = Math.random()*0.8 + 0.7;
    const rBase = Math.min(W(),H()) * (0.14*s);
    const speed = 0.3 + Math.random()*0.7;
    return {
      x: Math.random()*W(), y: Math.random()*H(), r:rBase, color,
      vx:(Math.random()-0.5)*speed, vy:(Math.random()-0.5)*speed,
      wob:Math.random()*2, wobSpeed:0.004+Math.random()*0.003
    };
  }

  const mouse = {nx:0, ny:0};
  addEventListener('mousemove', e=>{
    mouse.nx = (e.clientX/W())*2-1;
    mouse.ny = (e.clientY/H())*2-1;
  }, {passive:true});

  function hexA(h,a=1){
    const m=h.replace('#',''); const n=parseInt(m.length===3?m.split('').map(c=>c+c).join(''):m,16);
    const r=(n>>16)&255,g=(n>>8)&255,b=n&255; return `rgba(${r},${g},${b},${a})`;
  }

  function drawBlobs(){
    const w=off.width,h=off.height; og.clearRect(0,0,w,h);
    og.globalCompositeOperation='source-over';
    og.fillStyle='#120e16'; og.fillRect(0,0,w,h);

    og.save(); og.filter='blur(22px) saturate(110%)';
    BLOBS.forEach(b=>{
      b.wob += b.wobSpeed;
      b.x += b.vx + mouse.nx*0.12;
      b.y += b.vy + mouse.ny*0.12;

      const M=Math.max(b.r,160);
      if(b.x<-M) b.x=W()+M; if(b.x>W()+M) b.x=-M;
      if(b.y<-M) b.y=H()+M; if(b.y>H()+M) b.y=-M;

      const sx=(b.x/W())*w, sy=(b.y/H())*h;
      const R=(b.r*(1+Math.sin(b.wob)*0.15+Math.sin(b.wob*0.7)*0.08))*(off.width/W());

      const g=og.createRadialGradient(sx,sy,0,sx,sy,R);
      g.addColorStop(0,hexA(b.color,0.95));
      g.addColorStop(0.55,hexA(b.color,0.65));
      g.addColorStop(1,hexA(b.color,0.0));
      og.globalCompositeOperation='lighter';
      og.fillStyle=g; og.beginPath(); og.arc(sx,sy,R,0,Math.PI*2); og.fill();
    });
    og.restore();
  }

  function vignette(){
    fg.clearRect(0,0,W(),H());
    const cx=W()*0.55+mouse.nx*24, cy=H()*0.55+mouse.ny*18, r=Math.max(W(),H())*0.9;
    const g=fg.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,'rgba(255,255,255,0.06)'); g.addColorStop(1,'rgba(255,255,255,0)');
    fg.fillStyle=g; fg.fillRect(0,0,W(),H());
  }

  function frame(){
    drawBlobs(); mg.drawImage(off,0,0,W(),H()); vignette();
    if(!reduce) requestAnimationFrame(frame);
  }
  drawBlobs(); mg.drawImage(off,0,0,W(),H()); vignette();
  if(!reduce) requestAnimationFrame(frame);
})();
