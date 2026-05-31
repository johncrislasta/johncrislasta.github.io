export class AudioManager {
  constructor() {
    this.cage    = new Audio('assets/audio/hit-cage.mp3');
    this.collide = new Audio('assets/audio/ball-collide.mp3');
    this.bounces = [1, 2, 3, 4, 5].map(n => new Audio(`assets/audio/ball-bounce-${n}.mp3`));
  }

  play(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  playBounce() {
    this.play(this.bounces[Math.floor(Math.random() * this.bounces.length)]);
  }

  playCage(velocity) {
    this.cage.volume = Math.min(velocity / 20, 1);
    this.play(this.cage);
  }

  playCollide() {
    this.play(this.collide);
  }
}

