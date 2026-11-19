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
    const items = (D.home && D.home.coreBusiness) || [];
    node.innerHTML = items.map((c, i) => `
      <a class="biz-card reveal" href="${c.link}">
        <span class="biz-bg" style="background-image:url('${c.image}')"></span>
        <span class="idx">0${i + 1}</span>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <span class="more">Explore <span class="arrow">→</span></span>
      </a>`).join("");
  }

  /* ---------------- Featured cases (home) ---------------- */
  function renderCases(node) {
    if (!node) return;
    node.innerHTML = (D.featured || []).map((f) => `
      <a class="case-card reveal" href="${f.link || "case.html"}">
        ${img(f.cover, f.kicker + " " + f.project)}
        <span class="cap">
          <span class="kicker">${f.kicker}</span>
          <span class="t">${f.project}</span>
        </span>
      </a>`).join("");
  }

  /* ---------------- Trust / certificates (home + about) ---------------- */
  function renderTrust(node) {
    if (!node) return;
    node.innerHTML = (D.about.certs || []).map((c, i) =>
      `<img class="cert" src="${c}" alt="MOOZHIO certification ${i + 1}" loading="lazy" tabindex="0">`).join("");
    $$(".cert", node).forEach((im) => {
      im.addEventListener("click", () => openLightbox(im.getAttribute("src")));
      im.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openLightbox(im.getAttribute("src"));
      });
    });
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

    // Cross-page anchor support: nav dropdown links arrive as products.html#kitchen,
    // but the blocks only exist after this render, so scroll manually once painted.
    // Product images reserve no height, so lazy loading keeps shifting the layout
    // under the target. Re-align instantly (html has scroll-behavior:smooth, which
    // would make repeated scrollTo calls fight each other) until both the landing
    // position and the document height settle; any user scroll cancels the tracking.
    if (location.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        let stop = false;
        const cancel = () => { stop = true; };
        window.addEventListener("wheel", cancel, { passive: true, once: true });
        window.addEventListener("touchstart", cancel, { passive: true, once: true });
        let calm = 0, frames = 0, lastTop = null, lastH = null;
        const follow = () => {
          if (stop) return;
          target.scrollIntoView({ behavior: "instant", block: "start" });
          const top = Math.round(target.getBoundingClientRect().top);
          const h = document.documentElement.scrollHeight;
          if (lastTop !== null && top === lastTop && h === lastH) calm++;
          else calm = 0;
          lastTop = top; lastH = h; frames++;
          if (calm < 60 && frames < 900) requestAnimationFrame(follow);
        };
        requestAnimationFrame(() => { setTimeout(follow, 50); });
      }
    }
  }

  /* ---------------- Solutions page ---------------- */
  function renderSteps(node) {
    if (!node) return;
    const titles = {
      "01": "Project Brief & Estimate",
      "02": "1:1 Spatial Design",
      "03": "Material & Finish Selection",
      "04": "Engineering & Modular Detailing",
      "05": "Manufacturing, QC & Pre-assembly",
      "06": "Global Delivery & Installation Support",
    };
    const blurbs = {
      "01": "We begin by reviewing project drawings, spatial requirements, storage needs, site conditions and trade terms. Our team then defines the millwork scope, preliminary materials, hardware, lighting, packaging requirements, delivery schedule and logistics approach to establish a clear project budget and execution framework.",
      "02": "Based on the approved brief and project drawings, we develop a 1:1 spatial 3D model to validate layout, proportions, functionality and visual direction. The scheme is refined through multiple rounds of coordination, allowing key spatial and design decisions to be reviewed before production begins.",
      "03": "Alongside design development, we coordinate veneers, panels, lacquer, stone, glass, metal, hardware and lighting according to the project requirements. Physical samples and selected finishes are reviewed with the client to align appearance, performance, budget and production feasibility before final approval.",
      "04": "Once the design and materials are approved, the project is translated into detailed production drawings, technical nodes and modular manufacturing units. Components are prepared for factory machining, hardware integration and standardized interfaces, helping simplify overseas transportation and on-site installation.",
      "05": "Approved production data enters our manufacturing system, combining precision machinery with experienced craftsmanship across machining, assembly and finishing. Quality checks are carried out throughout production, followed by final inspection and 1:1 factory pre-assembly to verify dimensions, joints, structural stability and installation compatibility before shipment.",
      "06": "Completed products are labeled, protected and packed for international transportation using export-ready packaging suited to the selected shipping method. We coordinate logistics tracking and provide English installation drawings, remote technical guidance and after-sales support to assist local teams from delivery through final installation and maintenance.",
    };
    node.innerHTML = D.steps.map((s) => `
      <div class="step reveal">
        <div class="num">${s.num}</div>
        <div class="body">
          <h3>${titles[s.num] || s.key}</h3>
          <p>${blurbs[s.num] || ""}</p>
          <div class="thumbs">
            ${s.images.slice(0, 6).map((src) => `<img src="${src}" alt="step ${s.num}" loading="lazy">`).join("")}
          </div>
        </div>
      </div>`).join("");
    $$(".step .thumbs img", node).forEach((im) =>
      im.addEventListener("click", () => openLightbox(im.getAttribute("src")))
    );
  }

  /* ---------------- Factory production process ---------------- */
  function renderFactorySteps(node) {
    if (!node) return;
    const steps = (D.factory && D.factory.process) || [];
    node.innerHTML = steps.map((s) => `
      <div class="step reveal">
        <div class="num">${s.num}</div>
        <div class="body">
          <h3>${s.title}</h3>
          <p>${s.body}</p>
          <div class="thumbs">
            ${s.images.map((src) => `<img src="${src}" alt="Production stage ${s.num} — ${s.title}" loading="lazy">`).join("")}
          </div>
        </div>
      </div>`).join("");
    $$(".step .thumbs img", node).forEach((im) =>
      im.addEventListener("click", () => openLightbox(im.getAttribute("src")))
    );
  }

  /* ---------------- Factory gallery ---------------- */
  function renderAboutGallery(node) {
    if (!node) return;
    const imgs = (D.factory && D.factory.gallery) || [];
    node.innerHTML = imgs.map((s, i) =>
      `<img src="${s}" alt="Inside the MOOZHIO factory — ${i + 1}" loading="lazy">`).join("");
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
    LB.pool = $$(".gallery .g-item img, .case-card img, .step .thumbs img, .trust .cert")
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
      // mobile Products sub-menu (tap Products -> reveal the six spaces)
      $$(".m-sub-toggle", mm).forEach((btn) => {
        btn.addEventListener("click", () => {
          const sub = btn.nextElementSibling;
          if (!sub) return;
          const open = sub.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
      });
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
    renderFactorySteps($("#factorySteps"));
    renderAboutGallery($("#aboutGallery"));
    renderBlog($("#blogGrid"));
    initChrome();
    initForm();
    // re-observe any late reveals
    const io2 = new IntersectionObserver((es) => es.forEach((e)=>{ if(e.isIntersecting){e.target.classList.add("in");io2.unobserve(e.target);} }), {threshold:0.1});
    $$(".reveal:not(.in)").forEach((el) => io2.observe(el));
  });
})();
