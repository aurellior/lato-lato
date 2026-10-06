// Web Audio API synthesizer for Lato-Lato clacks and sound effects

class LatoAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    // Lazy initialize on first user gesture
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isUnlocked = true;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesize an authentic hard-plastic lato-lato clack impact.
   * @param intensity Impact strength from 0.1 to 1.5
   * @param isTopHit Boolean indicating whether the collision happened at the top or bottom
   */
  public playClack(intensity: number = 1.0, isTopHit: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const clampedIntensity = Math.min(Math.max(intensity, 0.2), 1.8);
      const volume = Math.min(1.0, 0.4 + clampedIntensity * 0.4);

      // Pitch variation based on top vs bottom and slight random variance (±4%)
      const baseFreq = isTopHit ? 1650 : 1420;
      const detuneFactor = 0.96 + Math.random() * 0.08;
      const primaryFreq = baseFreq * detuneFactor;

      // 1. Transient Click (Short Noise burst filtered through high-Q bandpass)
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.025), this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.005));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3200 + (isTopHit ? 400 : 0), now);
      noiseFilter.Q.setValueAtTime(4.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSource.start(now);

      // 2. Plastic Shell Resonance 1 (Decaying Sine with fast pitch drop)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(primaryFreq * 1.3, now);
      osc1.frequency.exponentialRampToValueAtTime(primaryFreq * 0.85, now + 0.04);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(volume * 0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // 3. Body Thud Resonance 2 (Deep hollow core pop)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      const bodyFreq = (isTopHit ? 480 : 420) * detuneFactor;
      osc2.frequency.setValueAtTime(bodyFreq, now);
      osc2.frequency.exponentialRampToValueAtTime(bodyFreq * 0.5, now + 0.03);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(volume * 0.6, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.04);
    } catch {
      // Ignore audio scheduling exceptions
    }
  }

  /**
   * Sound effect played when reaching streaks (e.g. 10, 25, 50, 100)
   */
  public playMilestoneSound(streak: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Elegant crystal arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (1 + Math.min(streak / 200, 0.5)), time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.3);
      });
    } catch {
      // Audio playback fallback
    }
  }

  /**
   * Sound effect when a combo breaks
   */
  public playDropSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }
}

export const audioManager = new LatoAudioManager();
