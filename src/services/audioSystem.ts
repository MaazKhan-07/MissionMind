/**
 * MISSIONMIND Immersive Audio Engine
 * Global Web Audio API Synthesizer & Sound Manager
 * Handles persistent ambient soundtracks, UI click feedback, intro video audio,
 * and autoplay safety across all browsers.
 */

class MissionMindAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private enabled: boolean = true;
  private volume: number = 0.15;
  private lastClickTime: number = 0;
  private htmlAmbientAudio: HTMLAudioElement | null = null;

  constructor() {
    const savedEnabled = localStorage.getItem('missionmind_audio_enabled');
    this.enabled = savedEnabled !== 'false';
    const savedVol = localStorage.getItem('missionmind_audio_volume');
    this.volume = savedVol ? parseFloat(savedVol) : 0.15;
  }

  /**
   * Initializes the Web Audio Context lazily on user gesture or browser permission
   */
  public initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('missionmind_audio_enabled', String(enabled));
    if (!enabled) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('missionmind_audio_volume', String(this.volume));
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx?.currentTime || 0, 0.1);
    }
    if (this.htmlAmbientAudio) {
      this.htmlAmbientAudio.volume = this.enabled ? this.volume : 0;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Plays a subtle, high-tech futuristic click sound for interactive elements.
   * Debounced to prevent duplicate simultaneous clicks.
   */
  public playClickSound(): void {
    if (!this.enabled) return;

    const now = performance.now();
    if (now - this.lastClickTime < 60) return; // Prevent double-triggering
    this.lastClickTime = now;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // High-frequency subtle metallic ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {
      // Ignore audio synthesis errors gracefully
    }
  }

  /**
   * Starts the persistent deep-space ambient soundtrack.
   * Uses Web Audio synthesis or static MP3 if available.
   */
  public startAmbient(): void {
    if (!this.enabled || this.isAmbientPlaying) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      // Attempt HTML5 Audio element first if ambient file exists
      if (!this.htmlAmbientAudio && typeof Audio !== 'undefined') {
        const audio = new Audio('/audio/ambient.mp3');
        audio.loop = true;
        audio.volume = this.volume;
        audio.addEventListener('error', () => {
          // Fallback to procedural synth if file missing
          this.startProceduralAmbient(ctx);
        });
        audio.play().then(() => {
          this.htmlAmbientAudio = audio;
          this.isAmbientPlaying = true;
        }).catch(() => {
          // Autoplay or network fallback
          this.startProceduralAmbient(ctx);
        });
        return;
      }

      if (this.htmlAmbientAudio) {
        this.htmlAmbientAudio.play().catch(() => {});
        this.isAmbientPlaying = true;
        return;
      }

      this.startProceduralAmbient(ctx);
    } catch (e) {
      // Fallback
    }
  }

  /**
   * Procedural Deep-Space Atmosphere Synthesizer (Zero asset dependency)
   */
  private startProceduralAmbient(ctx: AudioContext): void {
    if (this.isAmbientPlaying) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(this.volume * 0.25, ctx.currentTime + 2);

      // Low pass filter for deep warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;

      // Dual sub-oscillators for atmospheric space drone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 55; // A1 note

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 110.5; // Harmonic beat

      // Subtle LFO modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15; // 0.15 Hz slow pulse
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      this.ambientOsc1 = osc1;
      this.ambientOsc2 = osc2;
      this.ambientLfo = lfo;
      this.ambientGain = masterGain;
      this.isAmbientPlaying = true;
    } catch (e) {
      // Safe fallback
    }
  }

  public stopAmbient(): void {
    if (this.htmlAmbientAudio) {
      this.htmlAmbientAudio.pause();
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientLfo?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
          this.ambientLfo?.disconnect();
          this.ambientGain?.disconnect();
          this.ambientOsc1 = null;
          this.ambientOsc2 = null;
          this.ambientLfo = null;
          this.ambientGain = null;
        }, 600);
      } catch (e) {}
    }
    this.isAmbientPlaying = false;
  }
}

export const audioEngine = new MissionMindAudioEngine();
