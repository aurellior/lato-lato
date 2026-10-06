class PopAudioContext {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.error('AudioContext not supported', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPopSound(pitchShift = 1.0) {
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Create oscillator for the main 'pop' body
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    
    // Pitch envelope: very quick drop to simulate snap
    const baseFreq = 1200 * pitchShift;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.03);
    
    // Gain envelope: extremely sharp attack, very quick decay
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(1, t + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    
    // Noise layer: crucial for the "crackle" or "snap" of plastic
    const bufferSize = this.ctx.sampleRate * 0.03; // 30ms noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1); 
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2500; // higher frequency for plastic snap
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    // Routing
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
    
    noise.start(t);
    noise.stop(t + 0.05);
  }
}

export const popAudio = typeof window !== 'undefined' ? new PopAudioContext() : null;
