// menu.js — global, safe on all pages

(function () {
  const OPEN_CLASS = "is-open";
  const BODY_LOCK  = "no-scroll";

  function ensureOverlay() {
    let overlay = document.getElementById("menuOverlay");
    if (overlay) return overlay;

    // Inject overlay markup (same style you used before)
    overlay = document.createElement("div");
    overlay.id = "menuOverlay";
    overlay.className = "menu-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="menu-shell">
        <header class="menu-top">
          <div class="brand light">Portfolio</div>
          <button class="menu-close" aria-label="Close menu">Close</button>
        </header>
        <nav class="menu-nav" aria-label="Main">
          <ul>
          <li><a href="index.html">Home</a></li>
            <li class="first"><a href="info.html"><em>Info</em></a></li>
            <li><a href="artworks.html">Artworks</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </nav>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function wire() {
    const overlay = ensureOverlay();
    const openBtn = document.querySelector(".menu-pill");
    const closeBtn = overlay.querySelector(".menu-close");
    const firstLink = overlay.querySelector(".menu-nav a");

    if (!openBtn) return; // page has no menu button

    function openMenu() {
      overlay.classList.add(OPEN_CLASS);
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add(BODY_LOCK);
      setTimeout(() => firstLink && firstLink.focus({ preventScroll: true }), 0);
    }
    function closeMenu() {
      overlay.classList.remove(OPEN_CLASS);
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove(BODY_LOCK);
      openBtn.focus({ preventScroll: true });
    }

    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    overlay.addEventListener("click", (e) => {
      if (!e.target.closest(".menu-shell")) closeMenu();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains(OPEN_CLASS)) closeMenu();
    });

    overlay.querySelectorAll(".menu-nav a").forEach(a => {
      a.addEventListener("click", () => closeMenu());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
