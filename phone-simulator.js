/**
 * phone-simulator.js - Interactive Smartphone Flutter App Simulator
 * Simulates 3 real Flutter apps (FinPulse, ZenPulse, HyperDrop) with
 * live clickable widgets, interactive charts, Hot Reload, and DevTools inspection.
 */
(() => {
  "use strict";

  class PhoneSimulator {
    constructor() {
      this.container = document.getElementById("phone-mockup");
      if (!this.container) return;

      this.currentApp = "finpulse";
      this.isDarkTheme = true;
      this.isInspecting = false;
      this.cartCount = 0;
      this.selectedSize = "10";
      this.chartRange = "1M";

      this.init();
    }

    init() {
      this.cacheDom();
      this.bindEvents();
      this.renderApp();
      this.startBiometricsPulse();
    }

    cacheDom() {
      this.screen = document.getElementById("phone-screen-content");
      this.hotReloadBtn = document.getElementById("sim-hot-reload");
      this.themeToggleBtn = document.getElementById("sim-theme-toggle");
      this.inspectBtn = document.getElementById("sim-inspect-toggle");
      this.fpsBadge = document.getElementById("sim-fps-badge");
      this.reloadBanner = document.getElementById("sim-reload-banner");
      this.appTabs = Array.from(document.querySelectorAll("[data-app-target]"));
    }

    bindEvents() {
      // App switcher buttons
      this.appTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const app = tab.dataset.appTarget;
          if (app === this.currentApp) return;
          this.switchApp(app);
        });
      });

      // Hot reload button
      this.hotReloadBtn?.addEventListener("click", () => this.triggerHotReload());

      // Theme toggle inside phone
      this.themeToggleBtn?.addEventListener("click", () => this.togglePhoneTheme());

      // Widget inspector inside phone
      this.inspectBtn?.addEventListener("click", () => this.toggleInspector());
    }

    switchApp(appName) {
      this.currentApp = appName;
      this.appTabs.forEach((tab) => {
        const isActive = tab.dataset.appTarget === appName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      if (window.soundEffects) {
        window.soundEffects.playClick();
      }

      this.renderApp();

      // Notify project description card
      const detailCards = document.querySelectorAll(".project-card");
      detailCards.forEach((card) => {
        card.classList.toggle("is-active", card.dataset.project === appName);
      });
    }

    triggerHotReload() {
      if (window.soundEffects) {
        window.soundEffects.playHotReload();
      }

      // Visual flash on screen
      const flash = document.createElement("div");
      flash.className = "phone-reload-flash";
      this.screen.appendChild(flash);
      setTimeout(() => flash.remove(), 400);

      // Show banner
      const reloadMs = Math.floor(Math.random() * 80 + 140);
      if (this.reloadBanner) {
        this.reloadBanner.textContent = `⚡ Hot Reloaded in ${reloadMs}ms (rebuilt 6 widgets)`;
        this.reloadBanner.classList.add("is-visible");
        setTimeout(() => {
          this.reloadBanner.classList.remove("is-visible");
        }, 2200);
      }

      // Micro bounce effect
      this.screen.classList.add("screen-pulse");
      setTimeout(() => this.screen.classList.remove("screen-pulse"), 300);
    }

    togglePhoneTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      this.screen.classList.toggle("phone-light-theme", !this.isDarkTheme);
      if (this.themeToggleBtn) {
        this.themeToggleBtn.innerHTML = this.isDarkTheme
          ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
          : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
      if (window.soundEffects) window.soundEffects.playHover();
    }

    toggleInspector() {
      this.isInspecting = !this.isInspecting;
      this.screen.classList.toggle("phone-inspector-active", this.isInspecting);
      this.inspectBtn?.classList.toggle("is-active", this.isInspecting);
      if (window.soundEffects) window.soundEffects.playDevTools();
    }

    renderApp() {
      if (!this.screen) return;
      this.screen.innerHTML = "";

      if (this.currentApp === "finpulse") {
        this.renderFinPulse();
      } else if (this.currentApp === "zenpulse") {
        this.renderZenPulse();
      } else if (this.currentApp === "hyperdrop") {
        this.renderHyperDrop();
      }
    }

    // APP 1: FinPulse Neobank
    renderFinPulse() {
      const chartPoints = {
        "1D": "0,45 40,42 80,48 120,38 160,40 200,32 240,35 280,25 320,28",
        "1W": "0,60 40,50 80,55 120,42 160,35 200,38 240,25 280,30 320,15",
        "1M": "0,70 40,65 80,52 120,58 160,45 200,30 240,38 280,22 320,10",
        "1Y": "0,85 40,75 80,68 120,55 160,50 200,42 240,30 280,18 320,8"
      };

      this.screen.innerHTML = `
        <div class="sim-app finpulse-app">
          <!-- Status Bar -->
          <div class="sim-header widget-box" data-widget="SafeArea">
            <div class="sim-user">
              <div class="user-avatar">H</div>
              <div>
                <span class="greeting">Welcome back,</span>
                <strong class="user-name">Alex Vance</strong>
              </div>
            </div>
            <button class="sim-icon-btn widget-box" data-widget="IconButton">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>

          <!-- Total Balance Widget -->
          <div class="balance-card widget-box" data-widget="BlocBuilder<BalanceBloc>">
            <div class="balance-label">Total Portfolio Value</div>
            <div class="balance-amount">$48,290.<small>40</small></div>
            <div class="balance-change">
              <span class="pill-badge pill-positive">▲ +$3,482.10 (7.8%)</span>
              <span class="time-label">this month</span>
            </div>
          </div>

          <!-- Interactive Chart Widget -->
          <div class="chart-widget widget-box" data-widget="CustomPainter(Impeller)">
            <div class="chart-timeframes">
              <button class="timeframe-btn ${this.chartRange === '1D' ? 'active' : ''}" data-tf="1D">1D</button>
              <button class="timeframe-btn ${this.chartRange === '1W' ? 'active' : ''}" data-tf="1W">1W</button>
              <button class="timeframe-btn ${this.chartRange === '1M' ? 'active' : ''}" data-tf="1M">1M</button>
              <button class="timeframe-btn ${this.chartRange === '1Y' ? 'active' : ''}" data-tf="1Y">1Y</button>
            </div>
            <div class="chart-canvas-wrap">
              <svg viewBox="0 0 320 90" class="sim-chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon id="chart-area" points="${chartPoints[this.chartRange]} 320,90 0,90" fill="url(#chartGlow)" />
                <polyline id="chart-line" points="${chartPoints[this.chartRange]}" fill="none" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="sim-actions-grid widget-box" data-widget="Row">
            <button class="sim-action-btn" data-action="Send">
              <span class="action-icon">↗</span>
              <span>Send</span>
            </button>
            <button class="sim-action-btn" data-action="Receive">
              <span class="action-icon">↙</span>
              <span>Receive</span>
            </button>
            <button class="sim-action-btn" data-action="Swap">
              <span class="action-icon">⇄</span>
              <span>Swap</span>
            </button>
            <button class="sim-action-btn" data-action="Vault">
              <span class="action-icon">🛡</span>
              <span>Vault</span>
            </button>
          </div>

          <!-- Recent Transactions -->
          <div class="tx-section widget-box" data-widget="ListView.separated">
            <div class="tx-header">
              <span>Recent Activity</span>
              <button class="tx-all">See All</button>
            </div>
            <div class="tx-list">
              <div class="tx-item widget-box" data-widget="ListTile">
                <div class="tx-icon app-store"></div>
                <div class="tx-info">
                  <strong>Apple Developer Inc.</strong>
                  <span>Software Subscription</span>
                </div>
                <div class="tx-amount negative">-$99.00</div>
              </div>
              <div class="tx-item widget-box" data-widget="ListTile">
                <div class="tx-icon stripe">S</div>
                <div class="tx-info">
                  <strong>Stripe Payout</strong>
                  <span>Direct Deposit</span>
                </div>
                <div class="tx-amount positive">+$4,250.00</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Timeframe clicks
      this.screen.querySelectorAll(".timeframe-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.chartRange = btn.dataset.tf;
          this.screen.querySelectorAll(".timeframe-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const line = this.screen.querySelector("#chart-line");
          const area = this.screen.querySelector("#chart-area");
          if (line && area) {
            line.setAttribute("points", chartPoints[this.chartRange]);
            area.setAttribute("points", `${chartPoints[this.chartRange]} 320,90 0,90`);
          }
          if (window.soundEffects) window.soundEffects.playHover();
        });
      });

      // Quick action clicks
      this.screen.querySelectorAll(".sim-action-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          if (window.soundEffects) window.soundEffects.playClick();
          this.showInAppToast(`${action} Sheet requested (BLoC Event triggered)`);
        });
      });
    }

    // APP 2: ZenPulse Biometrics
    renderZenPulse() {
      this.screen.innerHTML = `
        <div class="sim-app zenpulse-app">
          <div class="sim-header widget-box" data-widget="AppBar">
            <div class="sim-user">
              <span class="pulse-indicator"></span>
              <strong class="user-name">Live Biometrics</strong>
            </div>
            <span class="battery-status">98% Synced</span>
          </div>

          <!-- Circular Recovery Meter -->
          <div class="recovery-meter-card widget-box" data-widget="CustomPaint(CircularProgress)">
            <div class="circle-wrap">
              <svg viewBox="0 0 120 120" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="rgba(255,255,255,0.1)" stroke-width="3" fill="none"/>
                <path class="circle-fg" stroke-dasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#00E5FF" stroke-width="3" stroke-linecap="round" fill="none"/>
              </svg>
              <div class="circle-text">
                <span class="recovery-val">94%</span>
                <span class="recovery-lbl">PRIME</span>
              </div>
            </div>
            <div class="recovery-summary">
              <h3>Optimal Recovery</h3>
              <p>Autonomic nervous system recovered. Ready for high cognitive output.</p>
            </div>
          </div>

          <!-- Live ECG Rhythm Waveform -->
          <div class="ecg-card widget-box" data-widget="AnimatedBuilder(WaveEngine)">
            <div class="ecg-meta">
              <span class="bpm-num" id="live-bpm">72</span>
              <span class="bpm-unit">BPM • RESTING</span>
            </div>
            <div class="ecg-wave-wrap">
              <canvas id="ecg-canvas" width="300" height="50"></canvas>
            </div>
          </div>

          <!-- Bio Stats Grid -->
          <div class="bio-grid widget-box" data-widget="GridView.count">
            <div class="bio-stat-item widget-box" data-widget="Card">
              <span class="stat-ico">💤</span>
              <span class="stat-num">8h 24m</span>
              <span class="stat-name">Deep Sleep</span>
            </div>
            <div class="bio-stat-item widget-box" data-widget="Card">
              <span class="stat-ico">⚡</span>
              <span class="stat-num">82 ms</span>
              <span class="stat-name">HRV Baseline</span>
            </div>
            <div class="bio-stat-item widget-box" data-widget="Card">
              <span class="stat-ico">🌡</span>
              <span class="stat-num">98.4°F</span>
              <span class="stat-name">Body Temp</span>
            </div>
            <div class="bio-stat-item widget-box" data-widget="Card">
              <span class="stat-ico">💧</span>
              <span class="stat-num">99%</span>
              <span class="stat-name">SpO2 Oxygen</span>
            </div>
          </div>

          <!-- Interactive Breathing Session Trigger -->
          <button class="breath-btn widget-box" data-widget="ElevatedButton" id="btn-breath">
            <span>Start 2-Min Resonance Breath</span>
            <span>▶</span>
          </button>
        </div>
      `;

      // Set up live ECG waveform
      this.initEcgWave();

      this.screen.querySelector("#btn-breath")?.addEventListener("click", () => {
        if (window.soundEffects) window.soundEffects.playClick();
        this.showInAppToast("Resonance breathwork session started via Riverpod Provider");
      });
    }

    initEcgWave() {
      const ecgCanvas = this.screen.querySelector("#ecg-canvas");
      if (!ecgCanvas) return;
      const ecgCtx = ecgCanvas.getContext("2d");
      let x = 0;
      let points = [];

      const ecgPattern = [0, 0, 2, -2, 0, 0, 15, -20, 8, -4, 0, 0, 2, 0];
      let patIdx = 0;

      const drawEcg = () => {
        if (!this.screen.contains(ecgCanvas)) return;

        ecgCtx.fillStyle = "rgba(6, 10, 20, 0.25)";
        ecgCtx.fillRect(0, 0, ecgCanvas.width, ecgCanvas.height);

        ecgCtx.beginPath();
        ecgCtx.strokeStyle = "#00E5FF";
        ecgCtx.lineWidth = 2;
        ecgCtx.shadowColor = "#00E5FF";
        ecgCtx.shadowBlur = 8;

        const val = ecgPattern[patIdx % ecgPattern.length];
        patIdx++;

        points.push({ x: ecgCanvas.width - 1, y: ecgCanvas.height / 2 + val });
        if (points.length > ecgCanvas.width / 3) points.shift();

        for (let i = 0; i < points.length; i++) {
          points[i].x -= 3;
          if (i === 0) ecgCtx.moveTo(points[i].x, points[i].y);
          else ecgCtx.lineTo(points[i].x, points[i].y);
        }
        ecgCtx.stroke();
        ecgCtx.shadowBlur = 0;

        requestAnimationFrame(drawEcg);
      };

      drawEcg();
    }

    startBiometricsPulse() {
      setInterval(() => {
        const bpmEl = document.getElementById("live-bpm");
        if (bpmEl) {
          const current = parseInt(bpmEl.textContent, 10) || 72;
          const variation = Math.floor(Math.random() * 3) - 1;
          bpmEl.textContent = Math.max(68, Math.min(78, current + variation));
        }
      }, 2500);
    }

    // APP 3: HyperDrop E-Commerce
    renderHyperDrop() {
      this.screen.innerHTML = `
        <div class="sim-app hyperdrop-app">
          <div class="sim-header widget-box" data-widget="SliverAppBar">
            <div class="brand-logo">HYPER<strong>DROP</strong></div>
            <button class="cart-btn widget-box" data-widget="Badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span class="cart-badge" id="cart-counter">${this.cartCount}</span>
            </button>
          </div>

          <!-- 3D Sneaker Showcase Card -->
          <div class="drop-hero-card widget-box" data-widget="Transform(Matrix4)">
            <span class="drop-tag">LIMITED RELEASE • 120 FPS</span>
            <div class="drop-shoe-visual" id="interactive-shoe">
              <!-- Stylized Cyber Sneaker SVG -->
              <svg viewBox="0 0 260 140" class="sneaker-svg">
                <defs>
                  <linearGradient id="soleGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#00E5FF"/>
                    <stop offset="100%" stop-color="#7B2CBF"/>
                  </linearGradient>
                  <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2D3748"/>
                    <stop offset="100%" stop-color="#1A202C"/>
                  </linearGradient>
                </defs>
                <path d="M20 95 C40 85, 90 85, 120 70 C140 60, 160 30, 200 35 C220 37, 245 60, 250 85 C252 95, 240 102, 230 105 L20 105 Z" fill="url(#bodyGrad)" stroke="#4A5568" stroke-width="2"/>
                <path d="M15 105 L245 105 C255 105, 255 125, 245 125 L35 125 C20 125, 10 115, 15 105 Z" fill="url(#soleGrad)"/>
                <circle cx="210" cy="85" r="7" fill="#00E5FF"/>
                <path d="M90 75 L120 72 M100 65 L130 62 M115 55 L145 52" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>
                <path d="M160 50 Q180 65 210 60" stroke="#FF007A" stroke-width="3" fill="none"/>
              </svg>
            </div>
            <div class="drop-meta">
              <h3>Cyber Runner V3</h3>
              <span class="drop-price">$285.00</span>
            </div>
          </div>

          <!-- Size Selector -->
          <div class="size-selector widget-box" data-widget="Wrap">
            <span class="size-title">Select US Size</span>
            <div class="size-chips">
              <button class="size-chip ${this.selectedSize === '8' ? 'active' : ''}" data-size="8">8</button>
              <button class="size-chip ${this.selectedSize === '9' ? 'active' : ''}" data-size="9">9</button>
              <button class="size-chip ${this.selectedSize === '10' ? 'active' : ''}" data-size="10">10</button>
              <button class="size-chip ${this.selectedSize === '11' ? 'active' : ''}" data-size="11">11</button>
              <button class="size-chip ${this.selectedSize === '12' ? 'active' : ''}" data-size="12">12</button>
            </div>
          </div>

          <!-- Add to Bag CTA with micro-interaction -->
          <button class="add-bag-btn widget-box" data-widget="GestureDetector" id="btn-add-bag">
            <span id="bag-btn-text">Add to Cart</span>
            <span class="arrow-ico">→</span>
          </button>
        </div>
      `;

      // Size chip click
      this.screen.querySelectorAll(".size-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          this.selectedSize = chip.dataset.size;
          this.screen.querySelectorAll(".size-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          if (window.soundEffects) window.soundEffects.playHover();
        });
      });

      // Add to bag micro-interaction
      const addBagBtn = this.screen.querySelector("#btn-add-bag");
      addBagBtn?.addEventListener("click", () => {
        this.cartCount++;
        const counter = this.screen.querySelector("#cart-counter");
        if (counter) {
          counter.textContent = this.cartCount;
          counter.classList.add("badge-pop");
          setTimeout(() => counter.classList.remove("badge-pop"), 300);
        }

        const btnText = this.screen.querySelector("#bag-btn-text");
        if (btnText) {
          btnText.textContent = "Added to Bag! ✓";
          setTimeout(() => {
            if (btnText) btnText.textContent = "Add to Cart";
          }, 1400);
        }

        if (window.soundEffects) window.soundEffects.playClick();
        this.showInAppToast(`Added Size US ${this.selectedSize} to cart (CartBloc updated)`);
      });

      // 3D perspective tilt on mouse move
      const shoeCard = this.screen.querySelector("#interactive-shoe");
      if (shoeCard) {
        shoeCard.addEventListener("mousemove", (e) => {
          const rect = shoeCard.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          shoeCard.style.transform = `perspective(600px) rotateY(${x * 24}deg) rotateX(${-y * 24}deg) scale(1.05)`;
        });
        shoeCard.addEventListener("mouseleave", () => {
          shoeCard.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
        });
      }
    }

    showInAppToast(message) {
      const existingToast = this.screen.querySelector(".sim-toast");
      if (existingToast) existingToast.remove();

      const toast = document.createElement("div");
      toast.className = "sim-toast";
      toast.textContent = message;
      this.screen.appendChild(toast);

      setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 250);
      }, 1800);
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.phoneSimulator = new PhoneSimulator();
    });
  } else {
    window.phoneSimulator = new PhoneSimulator();
  }
})();
