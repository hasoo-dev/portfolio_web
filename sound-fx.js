/**
 * sound-fx.js - Ultra-lightweight Web Audio API UI sound synthesizer
 * Provides futuristic, subtle, non-intrusive haptic feedback.
 */
class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem("hassan_portfolio_muted") === "true";
  }

  init() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("hassan_portfolio_muted", String(this.isMuted));
    if (!this.isMuted) {
      this.init();
      this.playBeep(520, 0.08, "triangle", 0.05);
    }
    return this.isMuted;
  }

  playBeep(freq = 440, duration = 0.05, type = "sine", volume = 0.04) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context policy safe fallback
    }
  }

  // Navigation panel transition whoosh/sweep
  playSweep(isForward = true) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const startFreq = isForward ? 220 : 380;
      const endFreq = isForward ? 380 : 220;

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.025, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // Flutter Hot Reload chime: 3 harmonious rising synth bells
  playHotReload() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 0.22, "sine", 0.04);
        }, idx * 60);
      });
    } catch (e) {}
  }

  // Soft click / tap
  playClick() {
    this.playBeep(780, 0.03, "sine", 0.02);
  }

  // Hover tick
  playHover() {
    this.playBeep(980, 0.015, "triangle", 0.008);
  }

  // DevTools Toggle chord
  playDevTools() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      this.playBeep(330, 0.08, "square", 0.015);
      setTimeout(() => this.playBeep(660, 0.12, "sine", 0.03), 80);
    } catch (e) {}
  }
}

window.soundEffects = new SoundEffects();
