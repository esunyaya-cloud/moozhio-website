/* ============================================================
   MOOZHIO — interaction + data-driven rendering
   All gallery content is sourced from window.SITE_DATA so it
   stays consistent with the source folders.
   ============================================================ */
(function () {
  "use strict";
  const D = window.SITE_DATA || { categories: [], steps: [], about: {}, featured: [] };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const img = (src, alt = "") =>
    `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;

  /* ---------------- Core business grid (home) ---------------- */
  function renderBizGrid(node) {
    if (!node) return;
    node.innerHTML = D.categories.map((c, i) => `
      <a class="biz-card reveal" href="products.html#${c.id}">
        <span class="idx">0${i + 1}</span>
        <h3>${c.name}</h3>
        <p>Hand-finished bespoke ${c.name.toLowerCase()} millwork — ${c.total} project references.</p>
        <span class="more">Explore <span class="arrow">→</span></span>
        <span class="thumb" style="background-image:url('${c.cover}')"></span>
      </a>`).join("");
  }

  /* ---------------- Featured cases (home) ---------------- */
  function renderCases(node) {
    if (!node) return;
    node.innerHTML = D.featured.map((f) => `
      <a class="case-card reveal" href="products.html#${f.catId}">
        ${img(f.cover, f.cat + " project")}
        <span class="cap">
          <span class="s">${f.sub}</span>
          <span class="t">${f.cat}</span>
        </span>
      </a>`).join("");
  }

  /* ---------------- Trust / certificates (home + about) ---------------- */
  function renderTrust(node) {
    if (!node) return;
    node.innerHTML = (D.about.certs || []).map((c) =>
      `<img class="cert" src="${c}" alt="MOOZHIO certification" loading="lazy">`).join("");
  }

  /* ---------------- Products page ---------------- */
  function renderProducts(node) {
    if (!node) return;
    const typeLabel = { villa: "Villa", commercial: "Commercial", largeflat: "Large Flat" };
    node.innerHTML = D.categories.map((c) => `
      <section class="cat-block reveal" id="${c.id}">
        <div class="cat-head">
          <h2>${c.name}</h2>
          <span class="meta">${c.total} photos · Bespoke Millwork</span>
        </div>
        <div class="type-tabs" data-cat="${c.id}">
          ${c.types.map((t, i) =>
            `<span class="type-tab${i === 0 ? " active" : ""}" data-type="${t.id}">${typeLabel[t.id] || t.name}</span>`
          ).join("")}
        </div>
        <div class="gallery" data-gallery="${c.id}">
          ${c.types[0].images.map((s) =>
            `<div class="g-item"><img src="${s}" alt="${c.name} ${typeLabel[c.types[0].id]}" loading="lazy"><span class="plus">+</span></div>`
          ).join("")}
        </div>
      </section>`).join("");

    // type tab switching
    $$(".type-tabs", node).forEach((tabs) => {
      const catId = tabs.dataset.cat;
      const cat = D.categories.find((x) => x.id === catId);
      const gal = $(`[data-gallery="${catId}"]`, node);
      tabs.addEventListener("click", (e) => {
        const tab = e.target.closest(".type-tab");
        if (!tab) return;
        $$(".type-tab", tabs).forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const tObj = cat.types.find((x) => x.id === tab.dataset.type);
        gal.innerHTML = tObj.images.map((s) =>
          `<div class="g-item"><img src="${s}" alt="${cat.name} ${typeLabel[tObj.id]}" loading="lazy"><span class="plus">+</span></div>`
        ).join("");
        bindGalleryItems();
      });
    });
    bindGalleryItems();
  }

  /* ---------------- Solutions page ---------------- */
  function renderSteps(node) {
    if (!node) return;
    const titles = {
      "01": "Business Development",
      "02": "Concept & Scheme Design",
      "03": "Detailed Engineering Design",
      "04": "Production & Delivery",
      "05": "Professional Installation",
      "06": "After-sales Care",
    };
    const blurbs = {
      "01": "From the first consultation we map client intent, budget and site constraints, then formalise a tailored cooperation agreement with dedicated project tracking.",
      "02": "We translate the brief into readable bespoke woodwork schemes — personalised aesthetic detailing plus centralised, efficient material selection at our showroom.",
      "03": "Rigorous 3D spatial measurement and composite precision surveying produce a full set of production and installation drawings, with on-site re-measurement verification.",
      "04": "Two owned source factories with automated production lines and ERP-tracked progress ensure every piece is built to specification and shipped by dedicated trucks.",
      "05": "Our specialist crews install on site, conduct pre-installation checks, and perform three-party acceptance with the owner, project and account managers.",
      "06": "Comprehensive VIP maintenance and repair service, with any factory top-up orders fulfilled within ≤15 working days.",
    };
    node.innerHTML = D.steps.map((s) => `
      <div class="step reveal">
        <div class="num">${s.num}</div>
        <div class="body">
          <h3>${titles[s.num] || s.key}</h3>
          <p>${blurbs[s.num] || ""}</p>
          <div class="thumbs">
            ${s.images.slice(0, 4).map((src) => `<img src="${src}" alt="step ${s.num}" loading="lazy">`).join("")}
          </div>
        </div>
      </div>`).join("");
    $$(".step .thumbs img", node).forEach((im) =>
      im.addEventListener("click", () => openLightbox(im.getAttribute("src")))
    );
  }

  /* ---------------- About gallery ---------------- */
  function renderAboutGallery(node) {
    if (!node) return;
    const imgs = (D.about.gallery || []).concat(D.about.production || []);
    node.innerHTML = imgs.map((s) =>
      `<img src="${s}" alt="MOOZHIO atelier" loading="lazy">`).join("");
  }

  /* ---------------- Blog (editorial samples) ---------------- */
  const POSTS = [
    { tag: "Craft", title: "Why Solid Wood Outperforms Veneer Over Time",
      excerpt: "A look at grain, structure and the quiet durability of genuine timber in whole-house millwork.",
      date: "Aug 2026", cover: (D.about.brandProfile[0] || D.home.banner) },
    { tag: "Process", title: "From Drawing to Delivery: Our 6-Step Workflow",
      excerpt: "How we take a designer's intent from concept and detailed engineering through to final handover.",
      date: "Jul 2026", cover: (D.steps[3] && D.steps[3].representative) || D.home.banner },
    { tag: "Material", title: "Walnut, Oak & Beyond: Reading a Wood Species",
      excerpt: "Choosing the right timber for tone, hardness and the atmosphere a room deserves.",
      date: "Jul 2026", cover: (D.about.production[1] || D.home.banner2) },
    { tag: "Project", title: "A Penthouse Living Room in Large-Flat Style",
      excerpt: "Case notes from a recent bespoke living room commission and the detailing that made it.",
      date: "Jun 2026", cover: (D.categories.find(c=>c.id==="living")||{}).cover || D.home.banner },
    { tag: "Sustainability", title: "Responsible Sourcing Across the Supply Chain",
      excerpt: "How our Ningbo footing helps overseas studios procure ethically and efficiently.",
      date: "Jun 2026", cover: (D.about.brandProfile[2] || D.home.banner3) },
    { tag: "Tips", title: "Caring for Bespoke Woodwork: A Owner's Guide",
      excerpt: "Simple habits that keep walnut and oak looking refined for decades.",
      date: "May 2026", cover: (D.categories.find(c=>c.id==="kitchen")||{}).cover || D.home.banner },
  ];
  function renderBlog(node) {
    if (!node) return;
    node.innerHTML = POSTS.map((p) => `
      <article class="post-card reveal">
        <div class="ph" style="background-image:url('${p.cover}')"></div>
        <div class="pc">
          <span class="tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p>${p.excerpt}</p>
          <div class="meta">${p.date} · MOOZHIO Journal</div>
        </div>
      </article>`).join("");
  }

  /* ---------------- Lightbox ---------------- */
  let LB = { pool: [], idx: 0 };
  function openLightbox(src) {
    const lb = $("#lightbox");
    if (!lb) return;
    LB.pool = $$(".gallery .g-item img, .case-card img, .step .thumbs img")
      .map((i) => i.getAttribute("src"));
    LB.idx = Math.max(0, LB.pool.indexOf(src));
    lb.querySelector("img").src = src;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function bindGalleryItems() {
    $$(".gallery .g-item img, .case-card img").forEach((im) =>
      im.addEventListener("click", () => openLightbox(im.getAttribute("src")))
    );
  }
  function closeLightbox() {
    const lb = $("#lightbox"); if (!lb) return;
    lb.classList.remove("open"); document.body.style.overflow = "";
  }
  function lbMove(d) {
    if (!LB.pool.length) return;
    LB.idx = (LB.idx + d + LB.pool.length) % LB.pool.length;
    const lb = $("#lightbox"); if (lb) lb.querySelector("img").src = LB.pool[LB.idx];
  }

  /* ---------------- Nav / menu / reveal ---------------- */
  function initChrome() {
    const nav = $(".nav");
    window.addEventListener("scroll", () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
    });
    const tog = $(".nav-toggle");
    const mm = $(".mobile-menu");
    if (tog && mm) {
      tog.addEventListener("click", () => mm.classList.toggle("open"));
      $$("a", mm).forEach((a) => a.addEventListener("click", () => mm.classList.remove("open")));
    }
    // reveal
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
    // lightbox controls
    const lb = $("#lightbox");
    if (lb) {
      lb.querySelector(".cls").addEventListener("click", closeLightbox);
      lb.querySelector(".prev").addEventListener("click", () => lbMove(-1));
      lb.querySelector(".next").addEventListener("click", () => lbMove(1));
      lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lbMove(1);
      if (e.key === "ArrowLeft") lbMove(-1);
    });
  }

  /* ---------------- Contact form ---------------- */
  function initForm() {
    const f = $("#contactForm");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      f.innerHTML = `<div style="text-align:center;padding:30px 0">
        <div style="font-family:var(--serif);font-size:30px;color:var(--bronze)">Thank you</div>
        <p style="color:var(--muted);margin-top:10px">Your enquiry has been received. Our project team will respond within 1 business day.</p>
      </div>`;
    });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderBizGrid($("#bizGrid"));
    renderCases($("#caseGrid"));
    renderTrust($("#trustGrid"));
    renderProducts($("#productsRoot"));
    renderSteps($("#stepsRoot"));
    renderAboutGallery($("#aboutGallery"));
    renderBlog($("#blogGrid"));
    initChrome();
    initForm();
    // re-observe any late reveals
    const io2 = new IntersectionObserver((es) => es.forEach((e)=>{ if(e.isIntersecting){e.target.classList.add("in");io2.unobserve(e.target);} }), {threshold:0.1});
    $$(".reveal:not(.in)").forEach((el) => io2.observe(el));
  });
})();
