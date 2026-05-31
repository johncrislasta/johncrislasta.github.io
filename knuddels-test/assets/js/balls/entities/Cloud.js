export class Cloud {
  constructor(layer, { x, y, scale, speed }) {
    this.speed = speed;

    this.gfx = new PIXI.Graphics();
    this.gfx.beginFill(0xFFFFFF, 0.9);
    this.gfx.drawCircle(0,  0,   30);
    this.gfx.drawCircle(30, -10, 35);
    this.gfx.drawCircle(65, 0,   28);
    this.gfx.endFill();
    this.gfx.x = x;
    this.gfx.y = y;
    this.gfx.scale.set(scale);

    layer.addChild(this.gfx);
    this._animate(window.innerWidth + 120 - x);
  }

  _fullDuration(screenW) {
    return (screenW + 240) / (this.speed * 60);
  }

  _animate(initialDistance) {
    const screenW = window.innerWidth;
    gsap.to(this.gfx, {
      x:        screenW + 120,
      duration: initialDistance / (this.speed * 60),
      ease:     'none',
      onComplete: () => {
        this.gfx.x = -120;
        gsap.to(this.gfx, {
          x:        screenW + 120,
          duration: this._fullDuration(screenW),
          ease:     'none',
          repeat:   -1,
          onRepeat: () => { this.gfx.x = -120; },
        });
      },
    });
  }
}

