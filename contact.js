/**
 * contact.js — Form validation + Formspree submission.
 *
 * SETUP: Replace 'YOUR_FORMSPREE_ID' below with your form ID.
 * 1. Go to https://formspree.io and sign up (free).
 * 2. Create a new form — set the destination email to harnaam.singh1304@gmail.com
 * 3. Copy your form ID (looks like "xpzgkwba") and paste it below.
 */
(function () {
  'use strict';

  // ↓ Replace with your Formspree form ID
  const FORMSPREE_ID = 'YOUR_FORMSPREE_ID';
  const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;
  const USE_FORMSPREE = FORMSPREE_ID !== 'YOUR_FORMSPREE_ID';

  function init() {
    const form    = document.getElementById('contactForm');
    const toast   = document.getElementById('cToast');
    const submitBtn = form && form.querySelector('[type="submit"]');
    if (!form || !toast) return;

    // Entrance animation
    document.querySelectorAll('.nav-brand, .menu-pill, .c-hero, .c-card').forEach((el, i) => {
      el.style.cssText = 'opacity:0;transform:translateY(16px);filter:blur(6px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease, filter 0.55s ease';
        el.style.cssText    = 'opacity:1;transform:none;filter:none';
      }, i * 80);
    });

    function showToast(msg, isError = false) {
      toast.textContent = msg;
      toast.style.borderColor = isError ? 'rgba(255,100,100,0.3)' : 'var(--border)';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }

    function setError(inputEl, msg) {
      const err = inputEl.closest('.c-field')?.querySelector('.c-error');
      if (err) err.textContent = msg || '';
    }

    function clearErrors() {
      form.querySelectorAll('.c-error').forEach(e => e.textContent = '');
    }

    function isValidEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled  = loading;
      submitBtn.textContent = loading ? 'Sending…' : 'Send message';
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      const data    = new FormData(form);
      const website = (data.get('website') || '').toString().trim();
      const name    = (data.get('name')    || '').toString().trim();
      const email   = (data.get('email')   || '').toString().trim();
      const subject = (data.get('subject') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      // Honeypot
      if (website) { form.reset(); showToast('Message sent!'); return; }

      // Validation
      let valid = true;
      if (!name)               { setError(form.querySelector('#c-name'),    'Please enter your name.'); valid = false; }
      if (!isValidEmail(email)){ setError(form.querySelector('#c-email'),   'Please enter a valid email address.'); valid = false; }
      if (!message)            { setError(form.querySelector('#c-message'), 'Please write a message.'); valid = false; }
      if (!valid) return;

      if (USE_FORMSPREE) {
        // ── Real submission via Formspree ──────────────────
        setLoading(true);
        try {
          const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data
          });

          if (res.ok) {
            showToast('Message sent — I\'ll be in touch soon!');
            form.reset();
          } else {
            const json = await res.json().catch(() => ({}));
            const msg  = json.errors?.[0]?.message || 'Something went wrong. Please try again.';
            showToast(msg, true);
          }
        } catch {
          showToast('Network error. Please try again or email me directly.', true);
        } finally {
          setLoading(false);
        }

      } else {
        // ── Fallback: mailto (until Formspree ID is set) ──
        const to   = 'harnaam.singh1304@gmail.com';
        const sub  = encodeURIComponent(subject || `New enquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:${to}?subject=${sub}&body=${body}`;
        showToast('Opening your email app…');
        form.reset();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
