import { PHYSICS } from '../config/physics.js';

export class Ball {
  constructor(layer, { x, y, radius, mass, type }) {
    this.x      = x;
    this.y      = y;
    this.radius = radius;
    this.mass   = mass;
    this.type   = type;

    this.vx            = 0;
    this.vy            = 0;
    this.rotation      = 0;
    this.rotationSpeed = 0;

    this.dragging    = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.lastX       = 0;
    this.lastY       = 0;

    // PixiJS scene objects
    this.container = new PIXI.Container();
    this.gfx       = new PIXI.Graphics();
    this.container.addChild(this.gfx);
    layer.addChild(this.container);

    this._draw();
    this._sync();
  }

  // -- Drawing -----------------------------------------------------------------

  _draw() {
    const r = this.radius;
    this.gfx.clear();

    switch (this.type) {
      case 'soccer':  this._drawSoccer(r);  break;
      case 'basket':  this._drawBasket(r);  break;
      case 'bowling': this._drawBowling(r); break;
    }
  }

  _drawSoccer(r) {
    const pentagon = (cx, cy, radius, rotation = -Math.PI / 2) => {
      const points = [];
      for (let i = 0; i < 5; i++) {
        const a = rotation + i * Math.PI * 2 / 5;
        points.push(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      }
      return points;
    };

    this.gfx.beginFill(0xF7F7F2);
    this.gfx.lineStyle(2, 0x222222, 0.22);
    this.gfx.drawCircle(0, 0, r);
    this.gfx.endFill();

    this.gfx.lineStyle(0);
    this.gfx.beginFill(0xD9D6CC, 0.35);
    this.gfx.drawCircle(r * 0.08, r * 0.11, r * 0.9);
    this.gfx.endFill();

    const patches = [];
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
      patches.push({
        x: Math.cos(a) * r * 0.56,
        y: Math.sin(a) * r * 0.56,
        a,
      });
    }

    this.gfx.lineStyle(Math.max(1.2, r * 0.035), 0x2B2B2B, 0.45);
    for (const patch of patches) {
      this.gfx.moveTo(Math.cos(patch.a) * r * 0.2, Math.sin(patch.a) * r * 0.2);
      this.gfx.lineTo(patch.x - Math.cos(patch.a) * r * 0.15, patch.y - Math.sin(patch.a) * r * 0.15);
    }

    this.gfx.lineStyle(Math.max(1, r * 0.025), 0x2B2B2B, 0.28);
    for (let i = 0; i < patches.length; i++) {
      const a = patches[i];
      const b = patches[(i + 1) % patches.length];
      this.gfx.moveTo(a.x, a.y);
      this.gfx.quadraticCurveTo(0, 0, b.x, b.y);
    }

    this.gfx.lineStyle(Math.max(1, r * 0.025), 0x0F172A, 0.7);
    this.gfx.beginFill(0x111827);
    this.gfx.drawPolygon(pentagon(0, 0, r * 0.23));
    this.gfx.endFill();

    this.gfx.lineStyle(Math.max(1, r * 0.02), 0x111827, 0.55);
    this.gfx.beginFill(0x111827);
    for (const patch of patches) {
      this.gfx.drawPolygon(pentagon(patch.x, patch.y, r * 0.18, patch.a + Math.PI / 5));
    }
    this.gfx.endFill();

    this.gfx.lineStyle(0);
    this.gfx.beginFill(0xFFFFFF, 0.5);
    this.gfx.drawEllipse(-r * 0.28, -r * 0.34, r * 0.23, r * 0.15);
    this.gfx.endFill();

    this.gfx.beginFill(0x0F172A, 0.08);
    this.gfx.drawEllipse(r * 0.16, r * 0.28, r * 0.42, r * 0.18);
    this.gfx.endFill();
  }

  _drawBasket(r) {
    this.gfx.beginFill(0xD85B17);
    this.gfx.drawCircle(0, 0, r);
    this.gfx.endFill();

    this.gfx.beginFill(0xF07A23, 0.5);
    this.gfx.drawEllipse(-r * 0.18, -r * 0.22, r * 0.68, r * 0.6);
    this.gfx.endFill();

    this.gfx.beginFill(0x7A220A, 0.16);
    this.gfx.drawEllipse(r * 0.2, r * 0.32, r * 0.58, r * 0.2);
    this.gfx.endFill();

    this.gfx.lineStyle(Math.max(2, r * 0.06), 0x481405, 0.9);
    this.gfx.drawCircle(0, 0, r);

    this.gfx.lineStyle(Math.max(2, r * 0.055), 0x3D1206, 0.85);
    this.gfx.moveTo(-r * 0.96, 0);
    this.gfx.quadraticCurveTo(0, -r * 0.08, r * 0.96, 0);

    this.gfx.moveTo(0, -r * 0.96);
    this.gfx.quadraticCurveTo(-r * 0.08, 0, 0, r * 0.96);

    this.gfx.moveTo(-r * 0.64, -r * 0.74);
    this.gfx.bezierCurveTo(-r * 0.2, -r * 0.34, -r * 0.2, r * 0.34, -r * 0.64, r * 0.74);

    this.gfx.moveTo(r * 0.64, -r * 0.74);
    this.gfx.bezierCurveTo(r * 0.2, -r * 0.34, r * 0.2, r * 0.34, r * 0.64, r * 0.74);

    this.gfx.lineStyle(0);
    this.gfx.beginFill(0xFFFFFF, 0.28);
    this.gfx.drawEllipse(-r * 0.27, -r * 0.33, r * 0.22, r * 0.14);
    this.gfx.endFill();

    this.gfx.beginFill(0xFFFFFF, 0.1);
    this.gfx.drawEllipse(-r * 0.08, -r * 0.08, r * 0.78, r * 0.7);
    this.gfx.endFill();
  }

  _drawBowling(r) {
    this.gfx.beginFill(0x160025);
    this.gfx.drawCircle(0, 0, r);
    this.gfx.endFill();

    this.gfx.beginFill(0x5b1fa8, 0.3);
    this.gfx.drawEllipse(-r * 0.15, -r * 0.2, r * 0.6, r * 0.5);
    this.gfx.endFill();

    this.gfx.beginFill(0x08000f);
    this.gfx.drawCircle(-r * 0.17, -r * 0.2,  r * 0.1);
    this.gfx.drawCircle( r * 0.05, -r * 0.29, r * 0.1);
    this.gfx.drawCircle( r * 0.22, -r * 0.1,  r * 0.1);
    this.gfx.endFill();

    this.gfx.beginFill(0xFFFFFF, 0.15);
    this.gfx.drawEllipse(-r * 0.26, -r * 0.3, r * 0.18, r * 0.13);
    this.gfx.endFill();
  }

  // -- Sync sprite to physics state ---------------------------------------------

  _sync() {
    this.container.x        = this.x;
    this.container.y        = this.y;
    this.container.rotation = this.rotation;
  }

  _bounceFactor() {
    return Math.max(PHYSICS.MIN_BOUNCE, PHYSICS.BOUNCE / Math.sqrt(this.mass));
  }

  _throwFactor() {
    return Math.max(PHYSICS.MIN_THROW, 1 / Math.sqrt(this.mass));
  }

  // -- Physics update -----------------------------------------------------------

  update(screenW, screenH, floorH, groundH, fenceW, audio) {
    // Always sync â€” this is the drag-render fix: even when dragging we push
    // the latest x/y (set by the input handler) into the PixiJS container.
    if (this.dragging) {
      this._sync();
      return;
    }

    this.vy += PHYSICS.GRAVITY;
    this.x  += this.vx;
    this.y  += this.vy;

    this.vx            *= PHYSICS.FRICTION;
    this.vy            *= 0.999;
    this.rotationSpeed *= PHYSICS.ANG_DAMPING;

    const floor      = screenH - floorH - this.radius;
    const wallOffset = fenceW - (groundH - floorH);

    // Floor
    if (this.y > floor) {
      const impact = Math.abs(this.vy);
      const bounce = this._bounceFactor();
      this.y   = floor;
      this.vy *= -bounce;
      if (Math.abs(this.vy) < PHYSICS.REST_THRESHOLD) this.vy = 0;
      if (impact > PHYSICS.REST_THRESHOLD * 3) audio.playBounce();
    }

    // Walls
    const vel = Math.hypot(this.vx, this.vy);
    if (this.x < this.radius + wallOffset) {
      this.x   = this.radius + wallOffset;
      this.vx *= -this._bounceFactor();
      audio.playCage(vel);
    }
    if (this.x > screenW - this.radius - wallOffset) {
      this.x   = screenW - this.radius - wallOffset;
      this.vx *= -this._bounceFactor();
      audio.playCage(vel);
    }

    // Rest
    const moving = Math.abs(this.vx) > PHYSICS.REST_THRESHOLD
                || Math.abs(this.vy) > PHYSICS.REST_THRESHOLD;

    if (!moving) {
      this.vx = 0; this.vy = 0; this.rotationSpeed = 0;
    } else {
      this.rotation += this.rotationSpeed;
      if (Math.abs(this.y - floor) < 0.5) {
        const target = this.vx / this.radius;
        this.rotationSpeed += (target - this.rotationSpeed) * 0.15;
      }
      this.rotation += this.rotationSpeed;
    }

    this._sync();
  }

  // -- Drag input ---------------------------------------------------------------

  tryGrab(mx, my) {
    if (this.dragging) return false;
    if (Math.hypot(mx - this.x, my - this.y) >= this.radius) return false;

    this.dragging    = true;
    this.dragOffsetX = mx - this.x;
    this.dragOffsetY = my - this.y;
    this.lastX       = this.x;
    this.lastY       = this.y;
    this.vx          = 0;
    this.vy          = 0;
    return true;
  }

  moveTo(mx, my) {
    if (!this.dragging) return;
    this.x     = mx - this.dragOffsetX;
    this.y     = my - this.dragOffsetY;
    this.vx    = this.x - this.lastX;
    this.vy    = this.y - this.lastY;
    this.lastX = this.x;
    this.lastY = this.y;
  }

  release() {
    if (!this.dragging) return;
    this.dragging      = false;
    const throwFactor  = this._throwFactor();
    this.vx           *= throwFactor;
    this.vy           *= throwFactor;
    this.rotationSpeed = this.vx * 0.05;
  }

  // -- Static: ball-pair collision resolution -----------------------------------

  static resolveCollision(a, b, audio) {
    const dx   = b.x - a.x;
    const dy   = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const min  = a.radius + b.radius;
    if (dist >= min || dist === 0) return;

    const nx = dx / dist, ny = dy / dist;
    const overlap = min - dist, total = a.mass + b.mass;

    a.x -= nx * overlap * (b.mass / total);
    a.y -= ny * overlap * (b.mass / total);
    b.x += nx * overlap * (a.mass / total);
    b.y += ny * overlap * (a.mass / total);

    const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
    const dvn = dvx * nx + dvy * ny;
    if (dvn >= 0) return;

    const j = -(1 + PHYSICS.RESTITUTION) * dvn / (1 / a.mass + 1 / b.mass);
    a.vx -= (j / a.mass) * nx;  a.vy -= (j / a.mass) * ny;
    b.vx += (j / b.mass) * nx;  b.vy += (j / b.mass) * ny;

    audio.playCollide();

    const tan = dvx * ny - dvy * nx;
    a.rotationSpeed -= tan * 0.012;
    b.rotationSpeed += tan * 0.012;
  }

  // -- Static: resolve all collisions in an array of balls -----------------------

  static resolveCollisions(balls, audio) {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        Ball.resolveCollision(balls[i], balls[j], audio);
      }
    }
  }
}

