/* ==========================================================
   Maison Bloem — shared site engine
   layout chrome · loader · transitions · smooth scroll · motion · cart
   ========================================================== */
(function () {
  const MB = (window.MB = window.MB || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!window.gsap;
  const page = document.body.dataset.page || "home";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const ICON = {
    arrow: `<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`
  };
  MB.ICON = ICON;

  // Sun..Sat — [open, close] in hours, null = closed. Shared by checkout, reserve and contact.
  MB.HOURS = [[9, 22], null, [8, 21], [8, 21], [8, 21], [8, 22], [9, 22]];

  MB.seal = (label = "MAISON BLOEM · BELGIAN WAFFLES · EST. 2016 · ") => {
    const id = "s" + Math.random().toString(36).slice(2, 7);
    return `<div class="seal" aria-hidden="true">
      <svg class="seal__ring" viewBox="0 0 200 200"><defs><path id="${id}" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"/></defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
        <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>
        <text><textPath href="#${id}">${label}${label}</textPath></text></svg>
      <svg class="seal__mono" viewBox="0 0 100 100"><text x="50" y="66" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="54" fill="currentColor">MB</text></svg>
    </div>`;
  };

  /* ---------------------------------------------------------
     1. Shared chrome (nav, overlay menu, footer, cart…)
     --------------------------------------------------------- */
  const LINKS = [
    ["home", "index.html", "Home"],
    ["menu", "menu.html", "Menu"],
    ["about", "about.html", "Our Story"],
    ["reserve", "reserve.html", "Reserve"],
    ["contact", "contact.html", "Contact"]
  ];

  document.body.insertAdjacentHTML("afterbegin", `
    <a href="#main" class="sr-skip">Skip to content</a>
    <header class="nav" id="nav">
      <a href="index.html" class="nav__logo" aria-label="Maison Bloem home">Maison Bloem<small>Belgian waffle house</small></a>
      <nav class="nav__links" aria-label="Primary">
        ${LINKS.map(([k, h, t]) => `<a href="${h}" class="link-u ${k === page ? "is-active" : ""}" ${k === page ? 'aria-current="page"' : ""}>${t}</a>`).join("")}
      </nav>
      <div class="nav__actions">
        <a href="reserve.html" class="btn btn--ghost" data-magnetic style="padding:.8em 1.3em" >Book a table</a>
        <button class="icon-btn" id="cartBtn" aria-label="Open order bag">${ICON.bag}<span class="cart-count" id="cartCount">0</span></button>
        <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
      </div>
    </header>
    <div class="overlay-menu" id="overlayMenu">
      ${LINKS.map(([k, h, t]) => `<a href="${h}"><span>${t}</span></a>`).join("")}
      <div class="overlay-menu__foot">Rue des Bouchers 12, Brussels<br><a href="tel:+3225550116" style="white-space:nowrap">+32 2 555 01 16</a></div>
    </div>
    <div class="curtain" id="curtain"><div class="curtain__word"><span>Maison Bloem</span></div></div>
    <div class="drawer-backdrop" id="drawerBg"></div>
    <aside class="drawer" id="drawer" aria-label="Your order" aria-hidden="true">
      <div class="drawer__head"><h3>Your order</h3><button class="drawer__close" id="drawerClose" aria-label="Close">${ICON.close}</button></div>
      <div class="drawer__body" id="drawerBody"></div>
      <div class="drawer__foot" id="drawerFoot"></div>
    </aside>
    <div class="modal" id="modal" role="dialog" aria-modal="true"><div class="modal__bg" data-close></div><div class="modal__card"><button class="drawer__close modal__close" data-close aria-label="Close">${ICON.close}</button><div id="modalBody"></div></div></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `);

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div>
            <div class="nav__logo" style="font-size:2.4rem">Maison Bloem</div>
            <p class="muted" style="max-width:26em;margin-top:1rem">Belgian warmth, baked fresh every day. Liège & Brussels waffles, made to order in the heart of Brussels since 2016.</p>
          </div>
          <div><h4>Explore</h4><ul>${LINKS.map(([, h, t]) => `<li><a class="link-u" href="${h}">${t}</a></li>`).join("")}</ul></div>
          <div><h4>Visit</h4><ul><li>Rue des Bouchers 12</li><li>1000 Brussels</li><li><a class="link-u" href="tel:+3225550116">+32 2 555 01 16</a></li><li><a class="link-u" href="mailto:bonjour@maisonbloem.be">bonjour@maisonbloem.be</a></li></ul></div>
          <div><h4>Newsletter</h4>
            <form class="news" id="newsForm" novalidate><input type="email" name="email" placeholder="Your email" aria-label="Email" required><button type="submit">Join</button></form>
            <div class="news-msg" id="newsMsg"></div>
          </div>
        </div>
        <div class="footer__big" aria-hidden="true">Maison Bloem</div>
        <div class="footer__bottom"><span>© ${new Date().getFullYear()} Maison Bloem. All rights reserved.</span><span>Instagram · TikTok · Facebook</span></div>
      </div>
    </footer>
  `);

  /* ---------------------------------------------------------
     2. Utilities
     --------------------------------------------------------- */
  let toastTimer;
  MB.toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2600);
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  MB.store = store;
  MB.ref = (p) => p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  // Form validation using native constraints + friendly messages
  MB.validate = (form) => {
    let firstBad = null;
    $$("[name]", form).forEach((el) => {
      if (el.closest("[hidden]") || el.disabled) return;
      const field = el.closest(".field");
      if (!field) return;
      const err = $(".field__err", field);
      let msg = "";
      const v = el.validity;
      if (v.valueMissing) msg = "This field is required.";
      else if (v.typeMismatch && el.type === "email") msg = "Please enter a valid email.";
      else if (v.patternMismatch) msg = el.dataset.msg || "Please check this value.";
      else if (v.tooShort) msg = `Please use at least ${el.minLength} characters.`;
      else if (v.rangeUnderflow || v.rangeOverflow) msg = el.dataset.msg || "Value out of range.";
      field.classList.toggle("has-error", !!msg);
      if (err) err.textContent = msg;
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) {
      // bring the error into view (Lenis-aware), then focus — except the button-driven hidden input,
      // which would only pop up the phone keyboard
      const field = firstBad.closest(".field");
      const inModal = !!firstBad.closest(".modal");
      if (lenis && !inModal) lenis.scrollTo(field, { offset: -120 });
      else field.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!firstBad.classList.contains("vh-input")) firstBad.focus({ preventScroll: true });
    }
    return !firstBad;
  };
  document.addEventListener("input", (e) => {
    const f = e.target.closest(".field.has-error");
    if (f && e.target.checkValidity()) { f.classList.remove("has-error"); const er = $(".field__err", f); if (er) er.textContent = ""; }
  });

  // Modal
  const modal = $("#modal");
  let lastFocus;
  MB.openModal = (html) => {
    lastFocus = document.activeElement;
    $("#modalBody").innerHTML = html;
    modal.classList.add("is-open");
    lockScroll(true);
    setTimeout(() => { const f = $("input,button:not(.modal__close)", modal); f && f.focus(); }, 300);
  };
  MB.closeModal = () => { modal.classList.remove("is-open"); lockScroll(false); lastFocus && lastFocus.focus(); };
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) MB.closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("is-open")) MB.closeModal();
    else if (document.body.classList.contains("cart-open")) toggleCart(false);
    else if (document.body.classList.contains("menu-open")) toggleMenu(false);
  });

  /* ---------------------------------------------------------
     3. Smooth scroll (Lenis) + GSAP ticker
     --------------------------------------------------------- */
  let lenis = null;
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    MB.lenis = lenis;
    if (hasGsap) {
      lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function lockScroll(on) {
    document.body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  }
  MB.lockScroll = lockScroll;

  // in-page anchors through Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: -60 }) : target.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     4. Nav: hide on scroll down, solid after hero
     --------------------------------------------------------- */
  const nav = $("#nav");
  let lastY = 0, navPinnedUntil = 0;
  // keep the nav (and its cart button) on screen for a moment, e.g. while an item flies into the bag
  MB.pinNav = (ms) => { navPinnedUntil = Date.now() + ms; nav.classList.remove("is-hidden"); };
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 60);
    if (Date.now() < navPinnedUntil) nav.classList.remove("is-hidden");
    else if (!document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > lastY && y > 300);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggleMenu = (force) => {
    const open = force ?? !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    $("#menuToggle").setAttribute("aria-expanded", open);
    lockScroll(open);
  };
  $("#menuToggle").addEventListener("click", () => toggleMenu());

  /* ---------------------------------------------------------
     5. Magnetic buttons + tilt (desktop only)
     --------------------------------------------------------- */
  function bindMagnetic(root = document) {
    if (!finePointer || !hasGsap || reduced) return;
    $$("[data-magnetic]", root).forEach((el) => {
      if (el._mag) return; el._mag = true;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }
  function bindTilt(root = document) {
    if (!finePointer || !hasGsap || reduced) return;
    $$("[data-tilt]", root).forEach((el) => {
      if (el._tilt) return; el._tilt = true;
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 14);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 14);
      });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }
  MB.bindInteractions = (root) => { bindMagnetic(root); bindTilt(root); observeReveals(root); };

  /* ---------------------------------------------------------
     6. Split text + reveals + scroll motion
     --------------------------------------------------------- */
  function splitWords(el) {
    if (el._split) return el._split;
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const line = document.createElement("span"); line.className = "split-line"; line.style.display = "inline-block";
            const w = document.createElement("span"); w.className = "split-word"; w.textContent = part;
            line.appendChild(w); frag.appendChild(line); words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el._split = words;
    return words;
  }

  const revealIO = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function observeReveals(root = document) {
    $$("[data-reveal]", root).forEach((el) => (revealIO ? revealIO.observe(el) : el.classList.add("is-in")));
  }

  function initMotion() {
    observeReveals();
    bindMagnetic(); bindTilt();
    if (!hasGsap || reduced) return;

    // headings rise word by word when scrolled into view
    $$("[data-split]").forEach((el) => {
      if (el.hasAttribute("data-hero-split")) return;
      const words = splitWords(el);
      gsap.from(words, { yPercent: 115, rotate: 4, duration: 1.2, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });

    // manifesto: words fill in as you scroll (scrubbed)
    $$("[data-scrub-words]").forEach((el) => {
      const words = splitWords(el);
      gsap.to(words, { opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
    });

    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // photos unveil upward as they scroll in, with the image settling from a slight zoom
    $$("[data-img-reveal]").forEach((el) => {
      const img = $("img", el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", clearProps: "clipPath" });
      if (img && !img.closest("[data-parallax]") && !img.hasAttribute("data-parallax-img")) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out", clearProps: "transform" }, 0);
    });

    // images drift inside their frame while scrolling
    $$("[data-parallax-img]").forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // groups of cards rise in one after another
    $$("[data-stagger]").forEach((wrap) => {
      gsap.from(wrap.children, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.12,
        scrollTrigger: { trigger: wrap, start: "top 88%", once: true }, clearProps: "transform,opacity" });
    });

    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count), o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString() + (el.dataset.suffix || "")) });
    });

    // horizontal pinned track (desktop)
    const hs = $(".hscroll");
    if (hs && window.ScrollTrigger) {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 601px)", () => {
        const track = $(".hscroll__track", hs);
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const tween = gsap.to(track, { x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: hs, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
        // cards lean into the motion
        $$(".sig-card", track).forEach((c) => {
          gsap.fromTo(c, { rotateY: -18, z: -80 }, { rotateY: 0, z: 0, ease: "none",
            scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "center center", scrub: true } });
        });
        return () => tween.kill();
      });
    }

    // footer giant word slides
    const big = $(".footer__big");
    if (big) gsap.fromTo(big, { xPercent: 8 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: big, start: "top bottom", end: "bottom top", scrub: true } });
  }
  MB.splitWords = splitWords;

  /* ---------------------------------------------------------
     7. Loader (first visit per session) + page transitions
     --------------------------------------------------------- */
  const curtain = $("#curtain");
  if (hasGsap) gsap.set(curtain, { y: 0, yPercent: 100 });
  let firstVisit = false;
  try { firstVisit = !sessionStorage.getItem("mb-visited"); sessionStorage.setItem("mb-visited", "1"); } catch {}

  // hero photos start covered and wipe open with the page intro
  if (hasGsap && !reduced) $$("[data-hero-img]").forEach((el) => { gsap.set(el, { clipPath: "inset(0% 0% 0% 100%)" }); gsap.set($("img", el), { scale: 1.25 }); });

  function heroIntro(delay = 0) {
    (MB.scenes || []).forEach((s) => s.intro(delay));
    if (!hasGsap || reduced) return;
    $$("[data-hero-img]").forEach((el) => {
      gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", delay, clearProps: "clipPath" });
      gsap.to($("img", el), { scale: 1, duration: 2.4, ease: "expo.out", delay: delay + 0.2 });
    });
    $$("[data-hero-split]").forEach((el) => {
      gsap.from(splitWords(el), { yPercent: 120, rotate: 6, duration: 1.6, ease: "expo.out", stagger: 0.08, delay });
    });
    gsap.from("[data-hero-fade]", { y: 30, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.1, delay: delay + 0.5 });
  }

  function runLoader() {
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="loader" id="loader" aria-hidden="true">
        <div class="loader__panel loader__panel--top"></div><div class="loader__panel loader__panel--bot"></div>
        <div class="loader__inner">
          <svg class="loader__mono" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="44" opacity=".5"/>
            <text x="60" y="76" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="46" fill="#f3ead3" stroke="none">MB</text></svg>
          <div class="loader__word"><span>Belgian warmth, baked fresh</span></div>
        </div>
        <div class="loader__tag">Maison Bloem — Brussels</div>
        <div class="loader__count"><span id="loadNum">0</span><small>%</small></div>
        <div class="loader__bar"></div>
      </div>`);
    const L = $("#loader");
    lockScroll(true);
    const circles = $$("circle", L);
    circles.forEach((c) => { const len = c.getTotalLength(); c.style.strokeDasharray = len; c.style.strokeDashoffset = len; });

    const prog = { v: 0 };
    let loaded = document.readyState === "complete";
    addEventListener("load", () => (loaded = true));

    const tl = gsap.timeline();
    tl.to(circles, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.15 }, 0)
      .from($("text", L), { opacity: 0, y: 10, duration: 1, ease: "power3.out" }, 0.6)
      .from(".loader__word span", { yPercent: 110, duration: 1, ease: "expo.out" }, 0.4)
      // counter: run to 80 quickly, then wait for window load before 100
      .to(prog, { v: 80, duration: 1.6, ease: "power1.inOut", onUpdate: upd }, 0)
      .add(() => {
        tl.pause();
        const finish = () => gsap.to(prog, { v: 100, duration: 0.6, ease: "power2.out", onUpdate: upd, onComplete: () => tl.resume() });
        if (loaded) finish();
        else { addEventListener("load", finish, { once: true }); setTimeout(() => !loaded && finish(), 4000); }
      })
      .to(".loader__inner, .loader__count, .loader__tag", { opacity: 0, y: -30, duration: 0.6, ease: "power3.in" }, "+=0.15")
      .to(".loader__bar", { opacity: 0, duration: 0.3 }, "<")
      .to(".loader__panel--top", { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.1")
      .to(".loader__panel--bot", { yPercent: 100, duration: 1.2, ease: "expo.inOut" }, "<")
      .add(() => heroIntro(0), "-=0.9")
      .add(() => { L.remove(); lockScroll(false); window.ScrollTrigger && ScrollTrigger.refresh(); });

    function upd() {
      $("#loadNum").textContent = Math.round(prog.v);
      gsap.set(".loader__bar", { scaleX: prog.v / 100 });
    }
  }

  function revealPage() {
    gsap.set(curtain, { yPercent: 0 });
    gsap.timeline()
      .to(".curtain__word span", { yPercent: -40, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to(curtain, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15")
      .add(() => heroIntro(0), "-=0.7")
      .set(curtain, { yPercent: 100 })
      .set(".curtain__word span", { yPercent: 0, opacity: 1 });
  }

  function leaveTo(href) {
    if (!hasGsap || reduced) { location.href = href; return; }
    lockScroll(true);
    gsap.timeline()
      .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut" })
      .fromTo(".curtain__word span", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .add(() => (location.href = href), "+=0.05");
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    if (href === here) { e.preventDefault(); toggleMenu(false); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); return; }
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) toggleMenu(false);
    leaveTo(href);
  });

  // returning via back button with bfcache → reset curtain
  addEventListener("pageshow", (e) => {
    if (e.persisted && hasGsap) { gsap.set(curtain, { yPercent: 100 }); lockScroll(false); }
  });

  /* ---------------------------------------------------------
     8. Cart
     --------------------------------------------------------- */
  const cart = {
    items: store.get("mb-cart", {}),
    save() { store.set("mb-cart", this.items); render(); },
    add(id, n = 1) { this.items[id] = (this.items[id] || 0) + n; if (this.items[id] <= 0) delete this.items[id]; this.save(); },
    remove(id) { delete this.items[id]; this.save(); },
    clear() { this.items = {}; this.save(); },
    lines() { return Object.entries(this.items).map(([id, qty]) => ({ item: MB.MENU.find((m) => m.id === id), qty })).filter((l) => l.item); },
    count() { return this.lines().reduce((a, l) => a + l.qty, 0); },
    subtotal() { return this.lines().reduce((a, l) => a + l.qty * l.item.price, 0); }
  };
  MB.cart = cart;

  const drawer = $("#drawer");
  function toggleCart(open) {
    document.body.classList.toggle("cart-open", open);
    drawer.setAttribute("aria-hidden", !open);
    lockScroll(open);
    if (open) setTimeout(() => $("#drawerClose").focus(), 300);
  }
  MB.toggleCart = toggleCart;
  $("#cartBtn").addEventListener("click", () => toggleCart(true));
  $("#drawerClose").addEventListener("click", () => toggleCart(false));
  $("#drawerBg").addEventListener("click", () => toggleCart(false));

  function render() {
    const n = cart.count(), badge = $("#cartCount");
    badge.textContent = n;
    badge.classList.toggle("has-items", n > 0);
    const lines = cart.lines();
    if (!lines.length) {
      $("#drawerBody").innerHTML = `<div class="cart-empty">${MB.artFor({ id: "empty", art: { shape: "round", top: ["sugar"] } })}
        <h3 style="font-style:italic">Your bag is empty</h3><p class="muted">Warm waffles are only a click away.</p>
        <a href="menu.html" class="btn btn--wine" style="margin-top:1rem">See the menu ${ICON.arrow}</a></div>`;
      $("#drawerFoot").innerHTML = "";
      return;
    }
    $("#drawerBody").innerHTML = lines.map(({ item, qty }) => `
      <div class="cart-item">
        <div class="cart-item__thumb">${MB.photoFor(item)}</div>
        <div><h4>${item.name}</h4><small>${MB.money(item.price)} each</small>
          <div class="qty"><button data-dec="${item.id}" aria-label="Decrease">−</button><span>${qty}</span><button data-inc="${item.id}" aria-label="Increase">+</button></div></div>
        <div><div class="cart-item__price">${MB.money(item.price * qty)}</div><button class="cart-item__remove" data-rm="${item.id}">Remove</button></div>
      </div>`).join("");
    const sub = cart.subtotal();
    $("#drawerFoot").innerHTML = `
      <div class="drawer__row"><span>Subtotal</span><span>${MB.money(sub)}</span></div>
      <div class="drawer__row"><span>Service</span><span>Free pick-up</span></div>
      <div class="drawer__row drawer__row--total"><span>Total</span><span>${MB.money(sub)}</span></div>
      <button class="btn btn--wine" id="checkoutBtn" style="justify-content:center">Checkout ${ICON.arrow}</button>`;
  }
  drawer.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.inc) cart.add(t.dataset.inc, 1);
    if (t.dataset.dec) cart.add(t.dataset.dec, -1);
    if (t.dataset.rm) cart.remove(t.dataset.rm);
    if (t.id === "checkoutBtn") { toggleCart(false); openCheckout(); }
  });

  // the bag "catches" the item: highlight, ring pulse, +1 pop, badge bump
  function catchInBag(n = 1) {
    const btn = $("#cartBtn"), badge = $("#cartCount");
    [btn, badge].forEach((el) => { el.classList.remove("is-catch", "bump"); void el.offsetWidth; });
    btn.classList.add("is-catch"); badge.classList.add("bump");
    const plus = document.createElement("span");
    plus.className = "cart-plus"; plus.textContent = "+" + n;
    btn.appendChild(plus);
    setTimeout(() => { plus.remove(); btn.classList.remove("is-catch"); }, 1100);
  }

  MB.addToCart = (id, fromEl) => {
    cart.add(id, 1);
    const item = MB.MENU.find((m) => m.id === id);
    MB.toast(`${item.name} added to your bag`);
    if (!fromEl || !hasGsap || reduced) { catchInBag(); return; }

    // make sure the bag is on screen (the nav hides while scrolling down)
    const navWasHidden = nav.classList.contains("is-hidden");
    MB.pinNav(1800);
    const btn = $("#cartBtn");
    const nb = nav.getBoundingClientRect(), bb = btn.getBoundingClientRect();
    const tx = bb.left + bb.width / 2, ty = bb.top - (navWasHidden ? nb.top : 0) + bb.height / 2;

    // fly the dish's own photo; fall back to a dot when the card has no image
    const card = fromEl.closest(".dish, .sig-card");
    const img = card && card.querySelector("img.dish-photo");
    const src = (img || fromEl).getBoundingClientRect();
    const size = img ? Math.min(src.width, src.height, 140) : 18;
    const fly = document.createElement("div");
    fly.className = "fly-thumb" + (img ? "" : " fly-thumb--dot");
    if (img) fly.innerHTML = `<img src="${img.currentSrc || img.src}" alt="">`;
    document.body.appendChild(fly);
    gsap.set(fly, { width: size, height: size, x: src.left + src.width / 2 - size / 2, y: src.top + src.height / 2 - size / 2 });

    const end = 34; // final size, roughly the bag icon
    gsap.timeline({ onComplete: () => { fly.remove(); catchInBag(); } })
      .to(fly, { scale: 1.08, duration: 0.18, ease: "power2.out" })                       // little lift-off
      .to(fly, { x: tx - end / 2, duration: 0.85, ease: "power1.inOut" }, ">")
      .to(fly, { y: ty - end / 2, duration: 0.85, ease: "back.in(1.4)" }, "<")             // arcs up, then drops in
      .to(fly, { width: end, height: end, borderRadius: "50%", scale: 1, rotation: -18, duration: 0.85, ease: "power2.in" }, "<")
      .to(fly, { scale: 0.2, opacity: 0, duration: 0.18, ease: "power2.in" }, ">-0.12");
  };

  function openCheckout() {
    if (!cart.count()) return;
    const now = new Date(), slots = [];
    const start = new Date(now.getTime() + 25 * 60000);
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
    for (let i = 0; i < 12; i++) {
      const t = new Date(start.getTime() + i * 15 * 60000), h = MB.HOURS[t.getDay()];
      const at = t.getHours() + t.getMinutes() / 60;
      // only times on the same day, while the kitchen is open
      if (t.getDate() === now.getDate() && h && at >= h[0] && at < h[1]) slots.push(t.toTimeString().slice(0, 5));
    }
    MB.openModal(`
      <span class="eyebrow">Checkout</span>
      <h2 style="font-size:2.6rem;margin:.8rem 0 1.4rem">Almost <em>ready</em></h2>
      <form class="form" id="checkoutForm" novalidate>
        <div class="field"><label>How would you like it?</label>
          <div class="seg" id="modeSeg"><button type="button" class="is-active" data-mode="pickup">Pick-up</button><button type="button" data-mode="delivery">Delivery (+€3,50)</button></div></div>
        <div class="field"><label for="co-name">Full name</label><input id="co-name" name="name" required minlength="2" autocomplete="name"><span class="field__err"></span></div>
        <div class="field"><label for="co-phone">Phone</label><input id="co-phone" name="phone" type="tel" required pattern="[+0-9 \\(\\)\\-]{7,}" data-msg="Please enter a valid phone number." autocomplete="tel"><span class="field__err"></span></div>
        <div class="field" id="addrField" hidden><label for="co-addr">Delivery address</label><input id="co-addr" name="address" required minlength="6" autocomplete="street-address"><span class="field__err"></span></div>
        <div class="field"><label for="co-time">Time</label><select id="co-time" name="time" required>
          ${slots.length ? `<option value="asap">As soon as possible</option>${slots.map((s) => `<option>${s}</option>`).join("")}` : `<option value="">Closed now — see opening hours</option>`}</select><span class="field__err"></span></div>
        <div class="drawer__row drawer__row--total" style="margin-top:.4rem"><span>Total</span><span id="coTotal">${MB.money(cart.subtotal())}</span></div>
        <button class="btn btn--wine" type="submit" style="justify-content:center">Place order ${ICON.arrow}</button>
      </form>`);
    let mode = "pickup";
    const form = $("#checkoutForm");
    $("#modeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      mode = b.dataset.mode;
      $$("#modeSeg button").forEach((x) => x.classList.toggle("is-active", x === b));
      $("#addrField").hidden = mode !== "delivery";
      $("#coTotal").textContent = MB.money(cart.subtotal() + (mode === "delivery" ? 3.5 : 0));
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!MB.validate(form)) return;
      const ref = MB.ref("MB");
      const orders = store.get("mb-orders", []);
      orders.unshift({ ref, mode, lines: cart.lines().map((l) => [l.item.name, l.qty]), total: cart.subtotal() + (mode === "delivery" ? 3.5 : 0), at: Date.now(), name: form.name.value });
      store.set("mb-orders", orders.slice(0, 20));
      const when = form.time.value === "asap" ? "as soon as possible" : "at " + form.time.value;
      cart.clear();
      $("#modalBody").innerHTML = MB.successHTML("Order placed!", ref,
        `Thank you, ${escapeHTML(form.name.value.split(" ")[0])}. Your order will be ready for ${mode === "delivery" ? "delivery" : "pick-up"} ${when}.`);
      MB.drawCheck();
    });
  }

  const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  MB.escapeHTML = escapeHTML;
  MB.successHTML = (title, ref, text) => `
    <div class="success">
      <svg class="success__check" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg>
      <h2 style="font-size:2.6rem"><em>${title}</em></h2>
      <div class="success__ref">${ref}</div>
      <p class="muted" style="margin:0">${text}</p>
      <button class="btn btn--wine" data-close>Lovely, thanks</button>
    </div>`;
  MB.drawCheck = () => {
    if (!hasGsap) return;
    $$(".success__check circle, .success__check path").forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, delay: i * 0.4, ease: "power2.out" });
    });
    gsap.from(".success > *:not(svg)", { y: 20, opacity: 0, stagger: 0.08, duration: 0.8, delay: 0.3, ease: "power3.out" });
  };

  // cross-tab sync
  addEventListener("storage", (e) => { if (e.key === "mb-cart") { cart.items = store.get("mb-cart", {}); render(); } });

  /* ---------------------------------------------------------
     9. Newsletter
     --------------------------------------------------------- */
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = e.target.email, msg = $("#newsMsg");
    if (!inp.value || !inp.checkValidity()) { msg.textContent = "Please enter a valid email."; inp.focus(); return; }
    const list = store.get("mb-news", []);
    if (!list.includes(inp.value)) list.push(inp.value);
    store.set("mb-news", list);
    msg.textContent = "Merci! You're on the list.";
    inp.value = "";
  });

  /* ---------------------------------------------------------
     10. Boot
     --------------------------------------------------------- */
  MB.boot = () => {
    render();
    initMotion();
    if (!hasGsap || reduced) { heroIntro(0); return; }
    if (firstVisit) { gsap.set(curtain, { yPercent: 100 }); runLoader(); }
    else revealPage();
  };
})();
