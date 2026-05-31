import { AudioManager } from '../audio/AudioManager.js';
import { Ball } from '../entities/Ball.js';
import { Bird } from '../entities/Bird.js';
import { Cloud } from '../entities/Cloud.js';

export class Playground {
  constructor() {
    this.app = new PIXI.Application({
      width:           window.innerWidth,
      height:          window.innerHeight,
      backgroundAlpha: 0,
      antialias:       true,
      resolution:      window.devicePixelRatio || 1,
      autoDensity:     true,
      resizeTo:        window,
    });
    document.body.appendChild(this.app.view);

    this.audio = new AudioManager();

    // Layers (bottom → top)
    this.layers = {
      cloud:  new PIXI.Container(),
      bird:   new PIXI.Container(),
      ground: new PIXI.Container(),
      fence:  new PIXI.Container(),
      ball:   new PIXI.Container(),
    };
    Object.values(this.layers).forEach(l => this.app.stage.addChild(l));

    this.birds = [];
    this.balls = [];

    this._buildScene();
    this._spawnBirds();
    this._createBalls();
    this._bindInput();

    this.app.ticker.add(() => this._tick());

    window.addEventListener('resize', () => {
      this._rebuildStaticLayers();
    });
  }

  // -- Layout helpers -----------------------------------------------------------

  get W()       { return this.app.screen.width;  }
  get H()       { return this.app.screen.height; }
  get floorH()  { return this.H * 0.17; }
  get groundH() { return this.H * 0.22; }
  get fenceW()  { return this.W * 0.10 }

  // -- Scene build --------------------------------------------------------------

  _buildScene() {
    this._buildGround();
    this._buildFences();
    this._buildClouds();
  }

  _rebuildStaticLayers() {
    this._buildGround();
    this._buildFences();
  }

  _buildGround() {
    this.layers.ground.removeChildren();

    const cvs    = document.createElement('canvas');
    cvs.width    = this.W;
    cvs.height   = this.groundH;
    const c2d    = cvs.getContext('2d');
    const grad   = c2d.createLinearGradient(0, 0, 0, this.groundH);
    grad.addColorStop(0, '#949494');
    grad.addColorStop(1, '#4a4a4a');
    c2d.fillStyle = grad;
    c2d.fillRect(0, 0, this.W, this.groundH);

    const spr = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(cvs)));
    spr.y = this.H - this.groundH;
    this.layers.ground.addChild(spr);
  }

  _buildFences() {
    this.layers.fence.removeChildren();
    this.layers.fence.addChild(
      this._makeFenceSprite(true,  0),
      this._makeFenceSprite(false, this.W - this.fenceW),
    );
  }

  _makeFenceSprite(isLeft, posX) {
    const fw   = this.fenceW;
    const gh   = this.groundH;
    const h    = this.H;
    const cvs  = document.createElement('canvas');
    cvs.width  = fw;
    cvs.height = h;
    const c2d  = cvs.getContext('2d');
    const slope = -Math.tan(Math.atan2(gh, fw));
    const hyp   = Math.sqrt(fw * fw + gh * gh);
    const step  = this.W * 0.02;
    const total = Math.ceil(fw / step);

    c2d.strokeStyle = '#111';
    c2d.lineCap     = 'butt';
    c2d.lineWidth   = 1.5;

    let n = isLeft ? total : 0;
    for (let x = 0; x < fw; x += step) {
      const c  = hyp / total * n;
      const a  = step * n;
      const bv = Math.sqrt(Math.max(0, c * c - a * a));
      c2d.beginPath();
      c2d.moveTo(x, 0);
      c2d.lineTo(x, h - gh + bv);
      c2d.stroke();
      isLeft ? n-- : n++;
    }

    for (let y = h; y >= 0; y -= step) {
      c2d.beginPath();
      if (isLeft) { c2d.moveTo(0,  y); c2d.lineTo(fw, y + fw * slope); }
      else        { c2d.moveTo(fw, y); c2d.lineTo(0,  y + fw * slope); }
      c2d.stroke();
    }

    c2d.lineWidth = 5;
    c2d.beginPath();
    const px = isLeft ? fw : 0;
    c2d.moveTo(px, 0);
    c2d.lineTo(px, h - gh);
    c2d.stroke();

    const spr = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(cvs)));
    spr.x = posX;
    return spr;
  }

  _buildClouds() {
    [
      { x: 100,  y: 100, scale: 1.0, speed: 0.72 },
      { x: 500,  y: 160, scale: 1.4, speed: 0.48 },
      { x: 1000, y: 90,  scale: 0.9, speed: 0.90 },
    ].forEach(def => new Cloud(this.layers.cloud, def));
  }

  _spawnBirds() {
    const spawn = () => {
      const bird = new Bird(this.layers.bird, this.W);
      this.birds.push(bird);
    };
    spawn();
    setInterval(spawn, 4000);
  }

  _createBalls() {
    this.balls = [
      new Ball(this.layers.ball, { x: 260,                   y: this.H - this.floorH, radius: 42, mass: 1,   type: 'soccer'  }),
      new Ball(this.layers.ball, { x: this.W - this.fenceW - 60, y: this.H - this.floorH, radius: 45, mass: 1.2, type: 'basket'  }),
      new Ball(this.layers.ball, { x: this.W / 2,             y: this.H - this.floorH, radius: 40, mass: 8,   type: 'bowling' }),
    ];
  }

  // -- Main tick ----------------------------------------------------------------

  _tick() {
    // Birds
    this.birds = this.birds.filter(b => {
      b.update();
      return !b.dead;
    });

    // Balls: physics + sprite sync
    for (const ball of this.balls) {
      ball.update(this.W, this.H, this.floorH, this.groundH, this.fenceW, this.audio);
    }

    // All unique ball pairs
    Ball.resolveCollisions(this.balls, this.audio);
  }

  // -- Input --------------------------------------------------------------------

  _bindInput() {
    const view = this.app.view;

    const onDown = (mx, my) => {
      for (const ball of this.balls) {
        if (ball.tryGrab(mx, my)) break; // only grab one ball at a time
      }
    };

    const onMove = (mx, my) => {
      for (const ball of this.balls) ball.moveTo(mx, my);
    };

    const onUp = () => {
      for (const ball of this.balls) ball.release();
    };

    // Mouse
    view.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
    view.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    view.addEventListener('mouseup',   () => onUp());

    // Touch
    const t = e => ({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    view.addEventListener('touchstart', e => { e.preventDefault(); const p = t(e); onDown(p.x, p.y); }, { passive: false });
    view.addEventListener('touchmove',  e => { e.preventDefault(); const p = t(e); onMove(p.x, p.y); }, { passive: false });
    view.addEventListener('touchend',   () => onUp());
  }
}

