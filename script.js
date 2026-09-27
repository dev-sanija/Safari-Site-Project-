"use strict";

const ApexTours = (() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let lenis;
  let testimonialTimer;
  let iconsReady = false;
  let heroMotionReady = false;
  let scrollMotionReady = false;
  let microCoreReady = false;
  let microGsapReady = false;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function initIcons() {
    if (iconsReady || !window.lucide) return;
    window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    iconsReady = true;
  }

  function initSmoothScroll() {
    if (lenis || reducedMotion || !window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
  }

  function initHeader() {
    const header = $("#site-header");
    const links = $$(".desktop-nav a");
    const sections = $$('main section[id]');
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-30% 0px -65% 0px" });
    sections.forEach(section => observer.observe(section));

    $$('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;
      const target = $(targetId);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -72 });
      else target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }));
  }

  function initMobileMenu() {
    const toggle = $(".menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const willOpen = toggle.getAttribute("aria-expanded") !== "true";
      willOpen ? openMenu() : closeMenu();
    });
    menu.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab") return;
      const focusable = $$("a, button", menu);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function openMenu() {
    const toggle = $(".menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.setAttribute("aria-hidden", "false");
    menu.style.visibility = "visible";
    if (lenis) lenis.stop();
    if (window.gsap && !reducedMotion) {
      window.gsap.to(menu, { clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)", duration: .8, ease: "power3.inOut" });
      window.gsap.fromTo($$(".mobile-links a", menu), { y: 35, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, delay: .25, duration: .55, ease: "power3.out" });
    } else menu.style.clipPath = "circle(150% at calc(100% - 2.5rem) 2.5rem)";
    setTimeout(() => $(".mobile-links a", menu)?.focus(), reducedMotion ? 0 : 350);
  }

  function closeMenu() {
    const toggle = $(".menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu || !document.body.classList.contains("menu-open")) return;
    const finish = () => { menu.style.visibility = "hidden"; menu.setAttribute("aria-hidden", "true"); };
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    if (lenis) lenis.start();
    if (window.gsap && !reducedMotion) window.gsap.to(menu, { clipPath: "circle(0 at calc(100% - 2.5rem) 2.5rem)", duration: .55, ease: "power3.inOut", onComplete: finish });
    else { menu.style.clipPath = "circle(0 at calc(100% - 2.5rem) 2.5rem)"; finish(); }
  }

  function initHeroMotion() {
    if (heroMotionReady || !window.gsap || reducedMotion) return;
    heroMotionReady = true;
    const gsap = window.gsap;
    if (window.SplitType) {
      const split = new window.SplitType(".split-heading", { types: "lines,words" });
      split.lines.forEach(line => { const wrapper = document.createElement("span"); wrapper.className = "line-mask"; line.parentNode.insertBefore(wrapper, line); wrapper.appendChild(line); });
      gsap.from(split.words, { yPercent: 115, opacity: 0, duration: 1.05, stagger: .055, delay: .2, ease: "power4.out" });
    }
    gsap.from(".hero-label, .hero-description, .hero-actions, .hero-trust", { y: 22, opacity: 0, duration: .7, stagger: .11, delay: .7, ease: "power3.out" });
    gsap.from(".hero-main-img", { x: 70, opacity: 0, rotation: 6, duration: 1.25, delay: .25, ease: "power3.out" });
    gsap.from(".wildlife-cutout, .floating-badge", { scale: .8, opacity: 0, duration: .8, stagger: .1, delay: .9, ease: "back.out(1.4)" });
    gsap.to(".floating-badge", { y: -8, duration: 2.8, stagger: .4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      gsap.to(".hill-back", { yPercent: 20, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hill-front", { yPercent: 12, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero-visual", { yPercent: 10, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 } });
    }
    if (supportsHover) {
      const hero = $(".hero");
      const depthEls = $$('[data-depth]', hero);
      hero.addEventListener("pointermove", event => {
        const x = event.clientX / window.innerWidth - .5;
        const y = event.clientY / window.innerHeight - .5;
        depthEls.forEach(el => {
          const d = Number(el.dataset.depth);
          gsap.to(el, { x: x * 18 * d, y: y * 12 * d, duration: .8, ease: "power2.out", overwrite: "auto" });
        });
      });
    }
  }

  function initCounters() {
    const counters = $$(".counter");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = "true";
        const target = Number(entry.target.dataset.count);
        const decimals = String(target).includes(".") ? 1 : 0;
        const start = performance.now();
        const duration = reducedMotion ? 0 : 1500;
        const tick = now => {
          const progress = duration ? Math.min((now - start) / duration, 1) : 1;
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          entry.target.textContent = decimals ? current.toFixed(1) : Math.floor(current).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .5 });
    counters.forEach(counter => observer.observe(counter));
  }

  function initScrollAnimations() {
    if (scrollMotionReady || !window.gsap || !window.ScrollTrigger || reducedMotion) return;
    scrollMotionReady = true;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    $$(".section-heading").forEach(heading => gsap.from(heading.children, { y: 45, opacity: 0, duration: .9, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: heading, start: "top 84%" } }));
    gsap.utils.toArray(".tour-card").forEach((card, index) => gsap.from(card, { y: 50, opacity: 0, duration: .7, delay: (index % 3) * .08, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%" } }));
    gsap.from(".orbit-item", { scale: .5, opacity: 0, duration: .75, stagger: .08, ease: "back.out(1.6)", scrollTrigger: { trigger: ".orbit-wrap", start: "top 70%" } });
    gsap.from(".compass", { rotation: -25, scale: .75, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".orbit-wrap", start: "top 70%" } });
    gsap.utils.toArray(".animal-card").forEach(card => gsap.from(card, { y: 45, opacity: 0, duration: .75, scrollTrigger: { trigger: card, scroller: ".wildlife-scroller", horizontal: true, start: "left 90%" } }));

    if (window.innerWidth >= 768) {
      const track = $(".journey-track");
      const cards = $$(".journey-card");
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: ".journey", start: "top top", end: () => `+=${distance() + window.innerHeight * .7}`,
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            $(".journey-progress span").style.width = `${16.66 + self.progress * 83.34}%`;
            const active = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
            cards.forEach((card, i) => card.classList.toggle("is-active", i === active));
          }
        }
      });
    } else {
      $(".journey-viewport").style.overflowX = "auto";
    }
  }

  function initMicroInteractions() {
    if (!microCoreReady) $$(".ripple").forEach(button => button.addEventListener("pointerdown", event => {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${event.clientX - rect.left - size / 2}px`;
      wave.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove());
    }));
    microCoreReady = true;

    if (microGsapReady || !supportsHover || reducedMotion || !window.gsap) return;
    microGsapReady = true;
    const gsap = window.gsap;
    $$(".magnetic").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();
        gsap.to(element, { x: (event.clientX - rect.left - rect.width / 2) * .18, y: (event.clientY - rect.top - rect.height / 2) * .18, duration: .25 });
      });
      element.addEventListener("pointerleave", () => gsap.to(element, { x: 0, y: 0, duration: .55, ease: "elastic.out(1,.4)" }));
    });
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const rx = ((event.clientY - rect.top) / rect.height - .5) * -4;
        const ry = ((event.clientX - rect.left) / rect.width - .5) * 4;
        gsap.to(card, { rotateX: rx, rotateY: ry, duration: .35, transformPerspective: 800 });
      });
      card.addEventListener("pointerleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6 }));
    });
    const glow = $(".cursor-glow");
    window.addEventListener("pointermove", event => gsap.to(glow, { x: event.clientX, y: event.clientY, duration: .8, ease: "power2.out" }), { passive: true });
  }

  function validateField(field) {
    const wrapper = field.closest(".field, .floating-field");
    const error = $(".error", wrapper);
    let message = "";
    if (field.validity.valueMissing) message = "This field is required.";
    else if (field.validity.typeMismatch) message = "Please enter a valid value.";
    else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) message = "Please choose a valid amount.";
    wrapper?.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message;
    return !message;
  }

  function validateForm(form) {
    return $$('input[required], select[required], textarea[required]', form).map(validateField).every(Boolean);
  }

  function initAvailability() {
    const form = $("#availability-form");
    const result = $("#availability-result");
    if (!form || !result) return;
    const dateInput = $('input[name="date"]', form);
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    dateInput.min = localDate;
    dateInput.value = localDate;
    $$('input[required], select[required], textarea[required]', form).forEach(field => field.addEventListener("blur", () => validateField(field)));
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!validateForm(form)) { $(".has-error input, .has-error select", form)?.focus(); return; }
      const button = $(".booking-submit", form);
      button.classList.add("is-loading");
      button.disabled = true;
      const data = new FormData(form);
      window.setTimeout(() => {
        const selected = new Date(`${data.get("date")}T12:00:00`);
        const score = (selected.getDate() + Number(data.get("adults")) + String(data.get("tour")).length) % 10;
        const status = score < 6 ? "Available" : score < 9 ? "Limited" : "Fully Booked";
        const heading = $("h3", result);
        const copy = $("h3 + p", result);
        heading.textContent = status;
        copy.textContent = status === "Available" ? "Your selected safari currently has space. Send your request and our Yala team will confirm within 30 minutes." : status === "Limited" ? "Only a small number of private jeeps remain. Send your request now and our team will hold the best option available." : "This sample date is at capacity. Contact us and we’ll suggest the closest available departure.";
        $(".result-summary", result).innerHTML = `<span>${selected.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><span>${escapeHtml(data.get("tour"))}</span><span>${escapeHtml(data.get("time"))}</span><span>${Number(data.get("adults")) + Number(data.get("children"))} guests</span>`;
        result.hidden = false;
        button.classList.remove("is-loading"); button.disabled = false;
        if (window.gsap && !reducedMotion) window.gsap.fromTo(result, { opacity: 0, scale: .98 }, { opacity: 1, scale: 1, duration: .45, ease: "power3.out" });
        $(".result-close", result).focus();
      }, 1100);
    });
    $(".result-close", result).addEventListener("click", () => { result.hidden = true; $(".booking-submit", form).focus(); });
  }

  function initFleet() {
    const cards = $$(".fleet-card");
    if (!cards.length) return;
    let current = 0;
    const show = (next, direction = 1) => {
      next = (next + cards.length) % cards.length;
      if (next === current) return;
      const old = cards[current]; const incoming = cards[next];
      incoming.style.visibility = "visible";
      if (window.gsap && !reducedMotion) {
        window.gsap.timeline({ onComplete: () => old.classList.remove("is-active") })
          .to(old, { xPercent: -8 * direction, opacity: 0, duration: .4, ease: "power2.in" }, 0)
          .fromTo(incoming, { xPercent: 8 * direction, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .55, ease: "power3.out" }, .18);
      } else old.classList.remove("is-active");
      incoming.classList.add("is-active");
      current = next;
      $(".fleet-current").textContent = String(current + 1).padStart(2, "0");
    };
    $(".fleet-next").addEventListener("click", () => show(current + 1, 1));
    $(".fleet-prev").addEventListener("click", () => show(current - 1, -1));
  }

  function initLightbox() {
    const box = $(".lightbox");
    const items = $$(".gallery-item");
    if (!box || !items.length) return;
    let current = 0; let previousFocus;
    const render = index => {
      current = (index + items.length) % items.length;
      const source = $("img", items[current]);
      const image = $("figure img", box);
      image.src = source.currentSrc || source.src; image.alt = source.alt;
      $("figcaption", box).textContent = items[current].dataset.caption;
    };
    const open = index => {
      previousFocus = document.activeElement; render(index);
      box.style.visibility = "visible"; box.setAttribute("aria-hidden", "false"); document.body.classList.add("lightbox-open"); if (lenis) lenis.stop();
      if (window.gsap && !reducedMotion) window.gsap.to(box, { opacity: 1, duration: .35 }); else box.style.opacity = "1";
      $(".lightbox-close", box).focus();
    };
    const close = () => {
      const done = () => { box.style.visibility = "hidden"; box.setAttribute("aria-hidden", "true"); };
      document.body.classList.remove("lightbox-open"); if (lenis) lenis.start();
      if (window.gsap && !reducedMotion) window.gsap.to(box, { opacity: 0, duration: .3, onComplete: done }); else { box.style.opacity = "0"; done(); }
      previousFocus?.focus();
    };
    items.forEach((item, index) => item.addEventListener("click", () => open(index)));
    $(".lightbox-close", box).addEventListener("click", close);
    $(".lightbox-next", box).addEventListener("click", () => render(current + 1));
    $(".lightbox-prev", box).addEventListener("click", () => render(current - 1));
    box.addEventListener("click", event => { if (event.target === box) close(); });
    box.addEventListener("keydown", event => { if (event.key === "Escape") close(); if (event.key === "ArrowRight") render(current + 1); if (event.key === "ArrowLeft") render(current - 1); });
  }

  function initTestimonials() {
    const slides = $$(".testimonial"); const dotsWrap = $(".testimonial-dots");
    if (!slides.length || !dotsWrap) return;
    let current = 0;
    slides.forEach((_, index) => { const dot = document.createElement("button"); dot.type = "button"; dot.setAttribute("aria-label", `Show testimonial ${index + 1}`); dot.className = index === 0 ? "is-active" : ""; dot.addEventListener("click", () => show(index)); dotsWrap.appendChild(dot); });
    const dots = $$("button", dotsWrap);
    const show = (next, direction = 1) => {
      next = (next + slides.length) % slides.length; if (next === current) return;
      const old = slides[current]; const incoming = slides[next]; incoming.style.visibility = "visible";
      if (window.gsap && !reducedMotion) window.gsap.timeline({ onComplete: () => old.classList.remove("is-active") }).to(old, { x: -25 * direction, opacity: 0, duration: .35 }, 0).fromTo(incoming, { x: 25 * direction, opacity: 0 }, { x: 0, opacity: 1, duration: .5 }, .18);
      else old.classList.remove("is-active");
      incoming.classList.add("is-active"); dots.forEach((dot, i) => dot.classList.toggle("is-active", i === next)); current = next; restart();
    };
    const restart = () => { clearInterval(testimonialTimer); if (!reducedMotion) testimonialTimer = setInterval(() => show(current + 1), 6500); };
    $(".testimonial-next").addEventListener("click", () => show(current + 1, 1));
    $(".testimonial-prev").addEventListener("click", () => show(current - 1, -1));
    $(".testimonial-stage").addEventListener("mouseenter", () => clearInterval(testimonialTimer));
    $(".testimonial-stage").addEventListener("mouseleave", restart);
    restart();
  }

  function initFaq() {
    $$(".faq-item").forEach(item => {
      const button = $("button", item); const answer = $(".faq-answer", item);
      button.addEventListener("click", () => {
        const opening = !item.classList.contains("is-open");
        $$(".faq-item.is-open").forEach(openItem => { if (openItem === item) return; openItem.classList.remove("is-open"); $("button", openItem).setAttribute("aria-expanded", "false"); if (window.gsap && !reducedMotion) window.gsap.to($(".faq-answer", openItem), { height: 0, duration: .35 }); else $(".faq-answer", openItem).style.height = "0"; });
        item.classList.toggle("is-open", opening); button.setAttribute("aria-expanded", String(opening));
        if (window.gsap && !reducedMotion) window.gsap.to(answer, { height: opening ? "auto" : 0, duration: .4, ease: "power2.inOut" }); else answer.style.height = opening ? "auto" : "0";
      });
    });
  }

  function initContactForms() {
    const form = $("#contact-form");
    if (form) {
      $$('input[required], select[required], textarea[required]', form).forEach(field => field.addEventListener("blur", () => validateField(field)));
      form.addEventListener("submit", event => {
        event.preventDefault(); if (!validateForm(form)) { $(".has-error input, .has-error select, .has-error textarea", form)?.focus(); return; }
        const button = $(".contact-submit", form); button.classList.add("is-loading"); button.disabled = true;
        setTimeout(() => { button.classList.remove("is-loading"); button.disabled = false; $(".contact-success", form).hidden = false; form.reset(); }, 800);
      });
    }
    const newsletter = $("#newsletter-form");
    newsletter?.addEventListener("submit", event => { event.preventDefault(); const email = $("input", newsletter); const status = $(".newsletter-status"); if (!email.checkValidity()) { status.textContent = "Please enter a valid email."; email.focus(); return; } status.textContent = "You’re on the field-notes list."; newsletter.reset(); });
  }

  function initImageFallbacks() {
    $$("img").forEach(image => image.addEventListener("error", () => { image.classList.add("image-fallback"); image.removeAttribute("src"); image.alt = `${image.alt} (image unavailable)`; }));
  }

  function escapeHtml(value) {
    const div = document.createElement("div"); div.textContent = String(value ?? ""); return div.innerHTML;
  }

  function init() {
    initIcons(); /* initSmoothScroll(); */ initHeader(); initMobileMenu(); initHeroMotion(); initCounters(); initScrollAnimations(); initMicroInteractions(); initAvailability(); initFleet(); initLightbox(); initTestimonials(); initFaq(); initContactForms(); initImageFallbacks();
    $("#year").textContent = new Date().getFullYear();
    let attempts = 0;
    const enhance = window.setInterval(() => {
      attempts += 1;
      initIcons(); /* initSmoothScroll(); */ initHeroMotion(); initScrollAnimations(); initMicroInteractions();
      if ((iconsReady && (reducedMotion || (heroMotionReady && scrollMotionReady))) || attempts >= 40) window.clearInterval(enhance);
    }, 250);
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", ApexTours.init);
