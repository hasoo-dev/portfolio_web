/**
 * app.js - Hasan Mehmood Flutter Portfolio Master Controller
 * Manages full-viewport panel transitions, hero typography animation,
 * preloader diagnostics, magnetic cursor, DevTools inspection, and audio.
 */
(() => {
  "use strict";

  function initPortfolio() {
    const body = document.body;
    const siteShell = document.querySelector(".site-shell");
    const panels = Array.from(document.querySelectorAll(".panel"));
    const navButtons = Array.from(document.querySelectorAll(".site-nav button"));
    const prevBtn = document.getElementById("btn-prev-section");
    const nextBtn = document.getElementById("btn-next-section");
    const progressBar = document.getElementById("progress-bar-indicator");
    const counterCurrent = document.getElementById("counter-current");
    const counterTotal = document.getElementById("counter-total");
    const sectionAnnouncer = document.getElementById("section-announcer");
    const wipeEdge = document.querySelector(".wipe-edge");
    const bgImageA = document.getElementById("bg-image-a");
    const bgImageB = document.getElementById("bg-image-b");
    const heroWords = Array.from(document.querySelectorAll(".hero-word"));

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Preloader Elements
    const preloader = document.querySelector(".preloader");
    const preloaderGlass = document.querySelector(".preloader-glass");
    const percentage = document.getElementById("load-percentage");
    const vuTrack = document.getElementById("vu-track");
    const vuNeedle = document.getElementById("vu-needle");
    const termLine1 = document.getElementById("term-line-1");
    const termLine2 = document.getElementById("term-line-2");

    // Cursor Elements
    const scrollCursor = document.querySelector(".scroll-cursor");
    const cursorLabel = document.getElementById("scroll-cursor-label");

    // Tools & Modals
    const soundToggle = document.getElementById("sound-toggle");
    const soundIcon = document.getElementById("sound-status-icon");
    const devtoolsToggle = document.getElementById("global-devtools-toggle");
    const menuToggle = document.querySelector(".menu-toggle");
    const menuBackdrop = document.querySelector(".menu-backdrop");
    const legalLayers = Array.from(document.querySelectorAll(".legal-layer"));
    const legalOpenBtns = Array.from(document.querySelectorAll("[data-legal-open]"));
    const legalCloseBtns = Array.from(document.querySelectorAll("[data-legal-close]"));
    const resumeTrigger = document.getElementById("btn-view-resume");
    const copyEmailBtn = document.getElementById("btn-copy-email");
    const globalToast = document.getElementById("global-toast");

    const hasGsap = typeof window.gsap !== "undefined";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      activeIndex: 0,
      heroWordIndex: 0,
      transitioning: false,
      preloaderDone: false,
      activeLegalLayer: null,
      menuOpen: false,
      heroInterval: null,
      lastWheelTime: 0
    };

    if (counterTotal) {
      counterTotal.textContent = String(panels.length).padStart(2, "0");
    }

    // =========================================================================
    // 1. PRELOADER & COMPILER TERMINAL SEQUENCE
    // =========================================================================
    const segmentCount = 24;
    const vuSegments = [];
    if (vuTrack) {
      for (let i = 0; i < segmentCount; i++) {
        const seg = document.createElement("span");
        seg.className = "vu-segment";
        if (((i + 1) / segmentCount) * 100 >= 85) {
          seg.classList.add("is-danger");
        }
        vuTrack.appendChild(seg);
        vuSegments.push(seg);
      }
    }

    function setPreloaderProgress(val) {
      const clamped = Math.max(0, Math.min(100, val));
      const activeCount = Math.round((clamped / 100) * segmentCount);
      if (percentage) percentage.textContent = `${Math.round(clamped)}%`;

      vuSegments.forEach((seg, idx) => {
        seg.classList.toggle("is-active", idx < activeCount);
      });

      if (vuNeedle && vuTrack) {
        const trackWidth = vuTrack.getBoundingClientRect().width || 300;
        const needleX = Math.max(0, Math.min(trackWidth - 3, (trackWidth * clamped) / 100));
        vuNeedle.style.transform = `translateX(${needleX}px)`;
        vuNeedle.style.background = clamped >= 85 ? "var(--red)" : "#fff";
      }

      // Update terminal diagnostics at key intervals
      if (clamped > 25 && termLine1 && termLine2) {
        termLine1.textContent = "[✓] Flutter 3.29.0 • Channel stable • Dart 3.7.0 AOT";
        termLine2.textContent = "⚙ Compiling Impeller shaders (Vulkan/Metal)...";
      }
      if (clamped > 65 && termLine2) {
        termLine2.textContent = "⚡ Mounting BLoC & Riverpod reactive engines...";
      }
      if (clamped > 90 && termLine2) {
        termLine2.textContent = "✓ Hasan.app initialized • 120 FPS target locked!";
      }
    }

    function finishPreloader() {
      state.preloaderDone = true;
      body.classList.remove("is-loading");

      if (hasGsap && !reducedMotion) {
        window.gsap.timeline({
          onComplete: () => {
            if (preloader) preloader.style.display = "none";
            revealIntroContent();
          }
        })
        .to(preloaderGlass, { scale: 0.92, opacity: 0, y: -25, duration: 0.5, ease: "power3.in" })
        .to(preloader, { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.2")
        .to(bgImageA, {
          filter: "grayscale(0.18) contrast(1.08) brightness(0.68) saturate(0.92) blur(0px)",
          scale: 1.03,
          duration: 1.1,
          ease: "power3.out"
        }, "-=0.55");
      } else {
        if (bgImageA) {
          bgImageA.style.filter = "grayscale(0.18) contrast(1.08) brightness(0.68) saturate(0.92) blur(0px)";
          bgImageA.style.transform = "scale(1.03)";
        }
        if (preloader) {
          preloader.style.opacity = "0";
          setTimeout(() => {
            preloader.style.display = "none";
            revealIntroContent();
          }, 300);
        }
      }
    }

    function revealIntroContent() {
      const items = Array.from(document.querySelectorAll(".hero-portrait-stage, .intro-copy > *"));
      if (hasGsap && !reducedMotion) {
        window.gsap.fromTo(items, 
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }
        );
      }
      startHeroRotation();
    }

    function runPreloaderSimulation() {
      let progress = 0;
      const startTime = performance.now();
      const minDuration = reducedMotion ? 200 : 1600;

      function step(now) {
        const elapsed = now - startTime;
        const target = Math.min(100, (elapsed / minDuration) * 100);
        progress += (target - progress) * 0.18;

        const jitter = Math.sin(now / 50) * 0.8;
        const displayed = Math.min(99.9, Math.max(0, progress + jitter));
        setPreloaderProgress(displayed);

        if (elapsed >= minDuration && progress >= 98) {
          setPreloaderProgress(100);
          setTimeout(finishPreloader, 180);
          return;
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    runPreloaderSimulation();

    // =========================================================================
    // 2. HERO 3-WORD DYNAMIC SLIDER
    // =========================================================================
    function setHeroWord(targetIndex, direction = 1) {
      if (heroWords.length === 0 || state.transitioning) return;
      const bounded = (targetIndex + heroWords.length) % heroWords.length;
      if (bounded === state.heroWordIndex) return;

      const current = heroWords[state.heroWordIndex];
      const next = heroWords[bounded];
      const incomingY = direction > 0 ? 118 : -118;
      const outgoingY = direction > 0 ? -118 : 118;

      next.classList.add("is-current");

      if (hasGsap && !reducedMotion) {
        window.gsap.set(next, { yPercent: incomingY, opacity: 1 });
        window.gsap.timeline({
          onComplete: () => {
            current.classList.remove("is-current");
            state.heroWordIndex = bounded;
          }
        })
        .to(current, { yPercent: outgoingY, opacity: 0, duration: 0.65, ease: "power4.inOut" }, 0)
        .to(next, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.inOut" }, 0.04);
      } else {
        current.classList.remove("is-current");
        next.classList.add("is-current");
        state.heroWordIndex = bounded;
      }
    }

    function startHeroRotation() {
      if (state.heroInterval) clearInterval(state.heroInterval);
      state.heroInterval = setInterval(() => {
        if (state.activeIndex === 0 && !document.hidden) {
          setHeroWord(state.heroWordIndex + 1, 1);
        }
      }, 3000);
    }

    // =========================================================================
    // 3. PANEL NAVIGATION CONTROLLER
    // =========================================================================
    // =========================================================================
    // 3. PANEL NAVIGATION CONTROLLER
    // =========================================================================
    function goToPanel(index, direction = 1) {
      if (index < 0 || index >= panels.length) return;
      if (index === state.activeIndex || state.transitioning) return;

      state.transitioning = true;
      clearTimeout(state.safetyTimer);
      state.safetyTimer = setTimeout(() => {
        state.transitioning = false;
      }, 500);

      const currentPanel = panels[state.activeIndex];
      const nextPanel = panels[index];
      state.activeIndex = index;

      // Audio whoosh
      if (window.soundEffects) {
        window.soundEffects.playSweep(direction > 0);
      }

      // Update Top Nav
      navButtons.forEach((btn) => {
        const target = btn.dataset.target;
        const isActive = target === nextPanel.id;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-current", isActive ? "page" : "false");
      });

      // Update Section Announcer & Progress
      body.dataset.section = nextPanel.id;
      if (sectionAnnouncer) {
        sectionAnnouncer.textContent = nextPanel.id.toUpperCase();
      }
      if (progressBar) {
        progressBar.style.transform = `scaleX(${state.activeIndex / (panels.length - 1)})`;
      }
      if (counterCurrent) {
        counterCurrent.textContent = String(state.activeIndex + 1).padStart(2, "0");
      }
      if (prevBtn) prevBtn.disabled = state.activeIndex === 0;
      if (nextBtn) nextBtn.disabled = state.activeIndex === panels.length - 1;

      // Reset scroll position of incoming panel to top
      const scrollable = nextPanel.querySelector(".content-panel, .showcase-narratives");
      if (scrollable) scrollable.scrollTop = 0;

      // Update Cursor Label
      if (cursorLabel) {
        if (state.activeIndex === panels.length - 1) cursorLabel.textContent = "BACK";
        else if (state.activeIndex === 2) cursorLabel.textContent = "TRY APP";
        else if (state.activeIndex === 4) cursorLabel.textContent = "MEET";
        else cursorLabel.textContent = "SCROLL";
      }

      // Update Mobile Object Position for Background Image
      if (bgImageA) {
        bgImageA.style.setProperty("--mobile-object-position", nextPanel.dataset.mobilePosition || "68% 35%");
      }

      // Trigger Christoph Nagel Wipe Edge Glow Effect
      if (wipeEdge && hasGsap && !reducedMotion) {
        const edgeStart = direction > 0 ? "0%" : "100%";
        const edgeEnd = direction > 0 ? "100%" : "0%";
        window.gsap.fromTo(wipeEdge,
          { left: edgeStart, opacity: 0.85 },
          { left: edgeEnd, opacity: 0, duration: 0.65, ease: "power3.inOut" }
        );
      }

      // Ensure all other inactive panels are cleanly deactivated and cleared of GSAP inline styles
      panels.forEach((p, idx) => {
        if (idx !== state.activeIndex && idx !== index) {
          p.classList.remove("is-active", "is-animating");
          if (hasGsap) window.gsap.set(p, { clearProps: "all" });
        }
      });

      currentPanel.classList.add("is-animating");
      nextPanel.classList.add("is-animating");

      // Panel Animation Transition
      if (hasGsap && !reducedMotion) {
        const nextContent = nextPanel.querySelectorAll(".panel-copy > *, .portrait-card-stage, .showcase-simulator-stage, .hero-portrait-stage");
        const currentContent = currentPanel.querySelectorAll(".panel-copy > *, .portrait-card-stage, .showcase-simulator-stage, .hero-portrait-stage");

        window.gsap.timeline({
          onComplete: () => {
            currentPanel.classList.remove("is-active", "is-animating");
            window.gsap.set(currentPanel, { clearProps: "all" });
            nextPanel.classList.add("is-active");
            nextPanel.classList.remove("is-animating");
            window.gsap.set(nextPanel, { clearProps: "all" });
            state.transitioning = false;
          }
        })
        .to(currentContent, {
          y: direction > 0 ? -30 : 30,
          opacity: 0,
          duration: 0.28,
          stagger: 0.02,
          ease: "power2.in"
        })
        .set(nextPanel, { display: "flex", visibility: "visible", opacity: 1 })
        .fromTo(nextContent, 
          { y: direction > 0 ? 35 : -35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42, stagger: 0.04, ease: "power3.out" },
          "-=0.08"
        );
      } else {
        currentPanel.classList.remove("is-active", "is-animating");
        nextPanel.classList.add("is-active");
        nextPanel.classList.remove("is-animating");
        setTimeout(() => {
          state.transitioning = false;
        }, 220);
      }
    }

    // Prev / Next button clicks
    prevBtn?.addEventListener("click", () => goToPanel(state.activeIndex - 1, -1));
    nextBtn?.addEventListener("click", () => goToPanel(state.activeIndex + 1, 1));

    // Nav pill clicks
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const targetIdx = panels.findIndex(p => p.id === targetId);
        if (targetIdx !== -1) {
          goToPanel(targetIdx, targetIdx > state.activeIndex ? 1 : -1);
          setMenu(false);
        }
      });
    });

    // Home mark click
    document.querySelector(".home-mark")?.addEventListener("click", (e) => {
      e.preventDefault();
      goToPanel(0, -1);
    });

    // Contact button click
    document.querySelector(".contact-button")?.addEventListener("click", (e) => {
      e.preventDefault();
      goToPanel(5, 1);
    });

    // Hero scroll cue click
    document.getElementById("hero-scroll-cue")?.addEventListener("click", () => {
      goToPanel(1, 1);
    });

    // =========================================================================
    // 4. BULLETPROOF MOUSE WHEEL & TOUCH SWIPE NAVIGATION
    // =========================================================================
    let wheelLock = false;

    window.addEventListener("wheel", (e) => {
      if (state.activeLegalLayer || state.menuOpen || !state.preloaderDone || wheelLock) return;

      // Check if user is scrolling inside a scrollable content panel
      const scrollArea = e.target.closest(".content-panel, .showcase-narratives, .phone-screen-content");
      if (scrollArea && scrollArea.scrollHeight > scrollArea.clientHeight + 4) {
        const atTop = scrollArea.scrollTop <= 8;
        const atBottom = Math.ceil(scrollArea.scrollTop + scrollArea.clientHeight) >= scrollArea.scrollHeight - 10;

        // Allow natural inner scrolling unless at top/bottom boundary
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      if (Math.abs(e.deltaY) < 16) return;

      e.preventDefault();
      wheelLock = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      goToPanel(state.activeIndex + direction, direction);

      setTimeout(() => {
        wheelLock = false;
      }, reducedMotion ? 80 : 420);
    }, { passive: false });

    // Touch Swipe handling with boundary detection
    let touchStartY = 0;
    let touchStartX = 0;
    let touchScrollTarget = null;
    let touchAtTop = false;
    let touchAtBottom = false;

    window.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      const target = e.target.closest(".content-panel, .showcase-narratives, .phone-screen-content");
      if (target && target.scrollHeight > target.clientHeight + 4) {
        touchScrollTarget = target;
        touchAtTop = target.scrollTop <= 8;
        touchAtBottom = Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight - 10;
      } else {
        touchScrollTarget = null;
      }
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
      if (state.activeLegalLayer || state.menuOpen || !state.preloaderDone || state.transitioning) return;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const deltaX = touchStartX - e.changedTouches[0].clientX;

      // Ignore horizontal drags or tiny taps
      if (Math.abs(deltaY) < 45 || Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        touchScrollTarget = null;
        return;
      }

      const direction = deltaY > 0 ? 1 : -1;
      if (touchScrollTarget) {
        const canAdvance = direction > 0 ? touchAtBottom : touchAtTop;
        touchScrollTarget = null;
        if (!canAdvance) return;
      }

      goToPanel(state.activeIndex + direction, direction);
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (state.activeLegalLayer) {
        if (e.key === "Escape") closeLegal();
        return;
      }

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goToPanel(state.activeIndex + 1, 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goToPanel(state.activeIndex - 1, -1);
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        goToPanel(state.activeIndex + 1, 1);
      } else if (e.key >= "1" && e.key <= "6") {
        const num = parseInt(e.key, 10) - 1;
        if (num < panels.length) goToPanel(num, num > state.activeIndex ? 1 : -1);
      } else if (e.key === "d" || e.key === "D") {
        toggleDevTools();
      }
    });

    // 3D Perspective Tilt on Portrait Cards (Hero & Mindset)
    const cardsToTilt = [
      document.getElementById("hero-portrait-card"),
      document.getElementById("portrait-card")
    ].filter(Boolean);

    cardsToTilt.forEach((card) => {
      if (finePointer) {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-5px)`;
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
        });
      }
    });

    // =========================================================================
    // 5. MAGNETIC PHYSICS CURSOR & HERO BACKGROUND PARALLAX
    // =========================================================================
    const cursorPos = { currentX: -120, currentY: -120, targetX: -120, targetY: -120 };

    // Christoph Nagel 3D Mouse Parallax on Background Stage
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    function renderCursor() {
      if (!scrollCursor || !finePointer) return;
      const ease = reducedMotion ? 1 : 0.18;
      cursorPos.currentX += (cursorPos.targetX - cursorPos.currentX) * ease;
      cursorPos.currentY += (cursorPos.targetY - cursorPos.currentY) * ease;

      scrollCursor.style.setProperty("--cursor-x", `${cursorPos.currentX}px`);
      scrollCursor.style.setProperty("--cursor-y", `${cursorPos.currentY}px`);

      // Lerp Background Image Parallax
      if (bgImageA && !reducedMotion) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;
        bgImageA.style.setProperty("--parallax-x", `${currentParallaxX.toFixed(2)}px`);
        bgImageA.style.setProperty("--parallax-y", `${currentParallaxY.toFixed(2)}px`);
      }

      requestAnimationFrame(renderCursor);
    }

    if (scrollCursor && finePointer) {
      window.addEventListener("pointermove", (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        cursorPos.targetX = e.clientX;
        cursorPos.targetY = e.clientY;
        body.classList.add("cursor-ready");

        // Compute normalized coordinates [-1 to 1] for 3D depth shift
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetParallaxX = normX * -12;
        targetParallaxY = normY * -8;
      }, { passive: true });

      const interactiveSelector = 'a, button, [role="button"], input, .project-card, .size-chip, .code-tab';
      document.addEventListener("pointerover", (e) => {
        if (e.target.closest(interactiveSelector)) {
          body.classList.add("cursor-link");
          if (window.soundEffects) window.soundEffects.playHover();
        }
      }, { passive: true });

      document.addEventListener("pointerout", (e) => {
        if (e.target.closest(interactiveSelector)) {
          body.classList.remove("cursor-link");
        }
      }, { passive: true });

      requestAnimationFrame(renderCursor);
    }

    // =========================================================================
    // 6. TOOLS: DEVTOOLS EASTER EGG & SOUND TOGGLE
    // =========================================================================
    function toggleDevTools() {
      const isActive = body.classList.toggle("devtools-active");
      devtoolsToggle?.classList.toggle("is-active", isActive);
      if (window.soundEffects) window.soundEffects.playDevTools();

      showToast(isActive ? "Flutter DevTools Inspection Activated [debugPaintSizeEnabled: true]" : "DevTools Inspection Disabled");
    }

    devtoolsToggle?.addEventListener("click", toggleDevTools);

    // Sound FX Button
    soundToggle?.addEventListener("click", () => {
      if (window.soundEffects) {
        const isMuted = window.soundEffects.toggleMute();
        if (soundIcon) soundIcon.textContent = isMuted ? "🔇" : "🔊";
        showToast(isMuted ? "Sound Effects Muted" : "Sound Effects Enabled");
      }
    });

    // Check initial mute state
    if (window.soundEffects && window.soundEffects.isMuted && soundIcon) {
      soundIcon.textContent = "🔇";
    }

    // =========================================================================
    // 7. CODE EXPLORER TABS
    // =========================================================================
    const codeTabs = Array.from(document.querySelectorAll(".code-tab"));
    const codeBlocks = Array.from(document.querySelectorAll(".code-block"));

    codeTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;
        codeTabs.forEach(t => t.classList.toggle("is-active", t === tab));
        codeBlocks.forEach(b => {
          b.classList.toggle("is-active", b.id === `code-${targetTab}`);
        });
        if (window.soundEffects) window.soundEffects.playHover();
      });
    });

    // =========================================================================
    // 8. LEGAL & RESUME MODALS
    // =========================================================================
    function openLegal(name) {
      const layer = document.getElementById(`legal-${name}`);
      if (!layer) return;
      state.activeLegalLayer = layer;
      body.classList.add("is-legal-open");
      layer.classList.add("is-open");
      layer.setAttribute("aria-hidden", "false");
      if (window.soundEffects) window.soundEffects.playClick();
    }

    function closeLegal() {
      if (!state.activeLegalLayer) return;
      state.activeLegalLayer.classList.remove("is-open");
      state.activeLegalLayer.setAttribute("aria-hidden", "true");
      state.activeLegalLayer = null;
      body.classList.remove("is-legal-open");
      if (window.soundEffects) window.soundEffects.playClick();
    }

    legalOpenBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openLegal(btn.dataset.legalOpen);
      });
    });

    legalCloseBtns.forEach(btn => btn.addEventListener("click", closeLegal));

    resumeTrigger?.addEventListener("click", () => openLegal("resume"));

    // Mobile Menu
    function setMenu(open) {
      state.menuOpen = open;
      body.classList.toggle("menu-open", open);
      menuToggle?.setAttribute("aria-expanded", String(open));
    }
    menuToggle?.addEventListener("click", () => setMenu(!state.menuOpen));
    menuBackdrop?.addEventListener("click", () => setMenu(false));

    // =========================================================================
    // 9. COPY EMAIL & GLOBAL TOAST
    // =========================================================================
    function showToast(msg) {
      if (!globalToast) return;
      globalToast.textContent = msg;
      globalToast.classList.add("is-active");
      setTimeout(() => globalToast.classList.remove("is-active"), 2600);
    }

    copyEmailBtn?.addEventListener("click", () => {
      const email = "hassan.flutter.architect@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("✓ Email copied to clipboard!");
        if (window.soundEffects) window.soundEffects.playClick();
      }).catch(() => {
        showToast("Email: " + email);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio);
  } else {
    initPortfolio();
  }
})();
