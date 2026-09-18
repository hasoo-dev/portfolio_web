/**
 * canvas-bg.js - GPU-Accelerated Dynamic Flutter Atmosphere Canvas
 * Renders glowing interactive grid nodes, reactive flow lines,
 * and floating subtle Flutter engine syntax glyphs.
 */
(() => {
  "use strict";

  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;

  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    speed: 0,
    radius: 220
  };

  // Floating Flutter & Dart code tokens
  const glyphs = [
    "Widget", "build()", "BlocBuilder", "RenderBox", "Stream<T>",
    "Impeller", "CustomPainter", "Riverpod", "Isolate.spawn",
    "StatefulWidget", "async*", "ShaderPass", "120 FPS", "Key?",
    "InheritedWidget", "Canvas.drawRRect"
  ];

  class FloatingParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 30;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.4 + 0.2);
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.4 ? "0, 229, 255" : "84, 197, 248"; // cyan & flutter blue
      this.isGlyph = Math.random() > 0.75;
      this.glyphText = glyphs[Math.floor(Math.random() * glyphs.length)];
      this.fontSize = Math.floor(Math.random() * 4 + 11);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interactive repelling force
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 3;
        this.y -= (dy / dist) * force * 3;
      }

      if (this.y < -40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      if (this.isGlyph) {
        ctx.font = `500 ${this.fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.45})`;
        ctx.fillText(this.glyphText, this.x, this.y);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Constellation grid nodes
  const nodeCount = Math.min(48, Math.floor(window.innerWidth / 30));
  const particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    if (particles.length === 0) {
      for (let i = 0; i < nodeCount; i++) {
        particles.push(new FloatingParticle());
      }
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  window.addEventListener("pointermove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  let lastTime = performance.now();

  function animate(now) {
    animationFrameId = requestAnimationFrame(animate);

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    // Clear transparent frame for hero background visibility
    ctx.clearRect(0, 0, width, height);

    // Subtle atmospheric ambient cyan mist over hero stage
    const bgGrad = ctx.createRadialGradient(
      width * 0.68, height * 0.38, 80,
      width * 0.68, height * 0.45, Math.max(width, height) * 0.75
    );
    bgGrad.addColorStop(0, "rgba(0, 229, 255, 0.05)");
    bgGrad.addColorStop(0.5, "rgba(2, 86, 155, 0.02)");
    bgGrad.addColorStop(1, "transparent");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Interactive mouse cursor glow spotlight
    if (mouse.x > 0 && mouse.y > 0) {
      const glowGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 450
      );
      glowGrad.addColorStop(0, "rgba(0, 229, 255, 0.07)");
      glowGrad.addColorStop(0.5, "rgba(2, 136, 209, 0.025)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Connect close particles with subtle cyber-lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
  }

  // Optimize when hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  animationFrameId = requestAnimationFrame(animate);
})();
