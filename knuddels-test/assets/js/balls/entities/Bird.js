export class Bird {
  constructor(layer, screenW) {
    this.wingPhase = 0;
    this.gfx = new PIXI.Graphics();
    this.gfx.x = -50;
    this.gfx.y = 80 + Math.random() * 120;
    layer.addChild(this.gfx);

    const speed    = 2 + Math.random() * 2;
    const duration = (screenW + 150) / (speed * 60);

    gsap.to(this.gfx, {
      x:        screenW + 100,
      duration,
      ease:     'none',
      onComplete: () => this.destroy(layer),
    });
  }

  update() {
    if (!this.gfx || this.dead) return;
    this.wingPhase += 0.2;
    const flap = Math.sin(this.wingPhase) * 5;
    this.gfx.clear();
    this.gfx.lineStyle(2, 0x1e293b);
    this.gfx.moveTo(-10, 0);
    this.gfx.quadraticCurveTo(-2, -flap, 0,  0);
    this.gfx.quadraticCurveTo( 8, -flap, 16, 0);
  }

  destroy(layer) {
    gsap.killTweensOf(this.gfx);
    layer.removeChild(this.gfx);
    this.gfx.destroy();
    this.dead = true;
  }
}

