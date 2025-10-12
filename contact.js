// contact.js — validation + mailto send (with optional Formspree hook)

(function () {
  // entrance polish
  document.querySelectorAll('.brand, .menu-pill, .c-hero, .c-card').forEach(el=>{
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.filter = 'blur(8px)';
    requestAnimationFrame(()=> {
      el.style.transition = 'opacity .6s ease, transform .6s ease, filter .6s ease';
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
  });

  const form = document.getElementById('contactForm');
  const toast = document.querySelector('.c-toast');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 2600);
  }

  function setError(input, msg){
    const wrap = input.closest('.c-field');
    const out = wrap && wrap.querySelector('.c-error');
    if (out) out.textContent = msg || '';
  }

  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);

    // honeypot
    if (data.get('website')) { form.reset(); showToast('Thanks!'); return; }

    // values
    const name = (data.get('name')||'').toString().trim();
    const email= (data.get('email')||'').toString().trim();
    const subj = (data.get('subject')||'').toString().trim();
    const msg  = (data.get('message')||'').toString().trim();

    // reset errors
    form.querySelectorAll('.c-error').forEach(n=>n.textContent='');
    let ok = true;

    if (!name){ setError(form.querySelector('#c-name'),'Please enter your name'); ok = false; }
    if (!validEmail(email)){ setError(form.querySelector('#c-email'),'Enter a valid email'); ok = false; }
    if (!msg){ setError(form.querySelector('#c-message'),'Tell me a bit about your project'); ok = false; }

    if (!ok) return;

    // ✉️ Mail client fallback (works everywhere)
    const to = 'kohlishreyansh@gmail.com';
    const subject = encodeURIComponent(subj || `New enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}\n`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    showToast('Opening your email app…');
    form.reset();

    // ------ Optional: real server send via Formspree (uncomment & set your endpoint) ------
    /*
    fetch('https://formspree.io/f/XXXXXXXX', { method: 'POST', body: data })
      .then(r => r.ok ? showToast('Message sent!') : showToast('Send failed.'))
      .catch(() => showToast('Network error.'));
    */
  });
})();
