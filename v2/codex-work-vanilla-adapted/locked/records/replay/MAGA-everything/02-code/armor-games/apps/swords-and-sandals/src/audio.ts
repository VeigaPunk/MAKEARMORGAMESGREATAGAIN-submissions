import { Sfx } from '@maga/arcade-core';

/** Original synthesized lute, drum and steel cues; no audio assets or network requests. */
export class ArenaAudio extends Sfx {
  private started = false;
  private fighting = false;
  private pending = new Set<number>();
  unlock() { if (!this.started) { this.started = true; this.music(this.fighting); } }
  music(fighting: boolean) {
    this.fighting = fighting;
    this.stopMusic();
    if (!this.started || document.hidden) return;
    this.startMusic(fighting ? [98, 0, 147, 98, 0, 110, 0, 147, 98, 0, 130.81, 0, 110, 0, 147, 0] : [196, 0, 246.94, 293.66, 0, 246.94, 220, 0, 164.81, 0, 220, 261.63, 0, 220, 196, 0], fighting ? 230 : 380, { wave: 'triangle', volume: fighting ? .055 : .045, duration: .19 });
  }
  cue(name: 'steel' | 'miss' | 'heal' | 'guard' | 'magic' | 'win' | 'loss' | 'buy') {
    if (name === 'steel') { this.blip({ wave: 'triangle', freq: 910, freqEnd: 130, duration: .11, volume: .28 }); this.blip({ wave: 'sawtooth', freq: 107, freqEnd: 47, duration: .08, volume: .1 }); }
    if (name === 'miss') this.blip({ wave: 'sine', freq: 380, freqEnd: 90, duration: .14, volume: .14 });
    if (name === 'guard') this.blip({ wave: 'triangle', freq: 160, freqEnd: 80, duration: .14, volume: .23 });
    if (name === 'magic') this.blip({ wave: 'sine', freq: 280, freqEnd: 1120, duration: .25, volume: .18 });
    const notes = name === 'win' ? [261.63, 329.63, 392, 523.25] : name === 'loss' ? [220, 196, 146.83] : name === 'heal' ? [392, 493.88, 587.33] : name === 'buy' ? [440, 659.25] : [];
    notes.forEach((freq, i) => { const id = window.setTimeout(() => { this.pending.delete(id); if (!document.hidden) this.blip({ wave: 'triangle', freq, duration: .2, volume: .2 }); }, i * 105); this.pending.add(id); });
  }
  suspend() { this.stopMusic(); this.pending.forEach(clearTimeout); this.pending.clear(); }
}
