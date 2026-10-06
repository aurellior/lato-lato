// Lightweight 2D Physics engine for Lato-Lato simulation

export interface CollisionEvent {
  x: number;
  y: number;
  intensity: number;
  isTopHit: boolean;
  velocity: number;
}

export class LatoPhysics {
  // String and Ball parameters
  public stringLength: number = 190;
  public ballRadius: number = 32;
  public gravity: number = 1600;
  public damping: number = 0.45;
  public restitution: number = 0.94;

  // Pivot (Hand / Ring position)
  public basePivotX: number = 250;
  public basePivotY: number = 220;
  public pivotX: number = 250;
  public pivotY: number = 220;
  public targetPivotX: number = 250;
  public targetPivotY: number = 220;
  public pivotVx: number = 0;
  public pivotVy: number = 0;
  public pivotAx: number = 0;
  public pivotAy: number = 0;

  // Ball 1 (Left ball)
  public theta1: number = -0.18;
  public omega1: number = 0;

  // Ball 2 (Right ball)
  public theta2: number = 0.18;
  public omega2: number = 0;

  // Collision cooldown
  private collisionCooldown: number = 0;

  // Auto oscillation / Rhythm training
  public autoOscillationActive: boolean = false;
  public autoOscillationFreq: number = 3.6;
  public autoOscillationAmp: number = 42;
  private autoTime: number = 0;

  constructor() {
    this.reset();
  }

  public reset() {
    const minSeparation = 2 * Math.asin(Math.min(0.95, this.ballRadius / this.stringLength));
    this.theta1 = -minSeparation / 2;
    this.theta2 = minSeparation / 2;
    this.omega1 = 0;
    this.omega2 = 0;
    this.pivotVx = 0;
    this.pivotVy = 0;
    this.pivotAx = 0;
    this.pivotAy = 0;
    this.collisionCooldown = 0;
    this.autoTime = 0;
  }

  public setDimensions(width: number, height: number) {
    if (!width || !height || width <= 0 || height <= 0) return;

    this.basePivotX = width / 2;
    this.basePivotY = height * 0.42;

    if (this.pivotX === 250 && this.pivotY === 220) {
      this.pivotX = this.basePivotX;
      this.pivotY = this.basePivotY;
      this.targetPivotX = this.basePivotX;
      this.targetPivotY = this.basePivotY;
    }

    const minDim = Math.min(width, height);
    if (minDim < 500) {
      this.ballRadius = Math.max(24, Math.min(36, minDim * 0.07));
      this.stringLength = Math.max(140, Math.min(220, minDim * 0.38));
    } else {
      this.ballRadius = 34;
      this.stringLength = 195;
    }
  }

  public applyHandShake(deltaY: number, deltaX: number = 0) {
    this.targetPivotY += deltaY;
    this.targetPivotX += deltaX;
  }

  public update(dt: number, onCollision?: (event: CollisionEvent) => void) {
    if (!isFinite(dt) || dt <= 0) return;

    const subStepDt = Math.min(dt, 0.032);
    const steps = 4;
    const stepDt = subStepDt / steps;

    for (let s = 0; s < steps; s++) {
      this.step(stepDt, onCollision);
    }

    if (!isFinite(this.theta1) || !isFinite(this.omega1)) {
      this.theta1 = -0.18;
      this.omega1 = 0;
    }
    if (!isFinite(this.theta2) || !isFinite(this.omega2)) {
      this.theta2 = 0.18;
      this.omega2 = 0;
    }
  }

  private step(dt: number, onCollision?: (event: CollisionEvent) => void) {
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);

    if (this.autoOscillationActive) {
      this.autoTime += dt;
      const targetOscY = Math.sin(this.autoTime * Math.PI * 2 * this.autoOscillationFreq) * this.autoOscillationAmp;
      this.targetPivotY = this.basePivotY + targetOscY;
      this.targetPivotX = this.basePivotX;

      if (Math.abs(this.omega1) < 4 && Math.abs(this.omega2) < 4) {
        this.omega1 -= 14 * dt;
        this.omega2 += 14 * dt;
      }
    }

    const prevVx = this.pivotVx;
    const prevVy = this.pivotVy;

    const smoothFactor = 32;
    this.pivotVx += (this.targetPivotX - this.pivotX) * smoothFactor * dt;
    this.pivotVy += (this.targetPivotY - this.pivotY) * smoothFactor * dt;

    this.pivotVx *= Math.exp(-14 * dt);
    this.pivotVy *= Math.exp(-14 * dt);

    this.pivotX += this.pivotVx * dt;
    this.pivotY += this.pivotVy * dt;

    const safeDt = Math.max(dt, 0.001);
    const maxAcc = 20000;
    this.pivotAx = Math.min(Math.max((this.pivotVx - prevVx) / safeDt, -maxAcc), maxAcc);
    this.pivotAy = Math.min(Math.max((this.pivotVy - prevVy) / safeDt, -maxAcc), maxAcc);

    const effectiveG = this.gravity + this.pivotAy;
    const alpha1 = - (effectiveG / this.stringLength) * Math.sin(this.theta1)
                   - (this.pivotAx / this.stringLength) * Math.cos(this.theta1)
                   - this.damping * this.omega1;

    const alpha2 = - (effectiveG / this.stringLength) * Math.sin(this.theta2)
                   - (this.pivotAx / this.stringLength) * Math.cos(this.theta2)
                   - this.damping * this.omega2;

    this.omega1 += alpha1 * dt;
    this.omega2 += alpha2 * dt;

    this.theta1 += this.omega1 * dt;
    this.theta2 += this.omega2 * dt;

    this.normalizeAngles();
    this.checkCollision(onCollision);
  }

  private normalizeAngles() {
    this.theta1 = ((this.theta1 + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    this.theta2 = ((this.theta2 + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }

  private checkCollision(onCollision?: (event: CollisionEvent) => void) {
    const minAngularDist = 2 * Math.asin(Math.min(0.95, this.ballRadius / this.stringLength));

    let diff = this.theta2 - this.theta1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    const absDiff = Math.abs(diff);

    if (absDiff <= minAngularDist) {
      const overlap = minAngularDist - absDiff;
      const sign = diff >= 0 ? 1 : -1;
      this.theta1 -= (overlap * 0.5) * sign;
      this.theta2 += (overlap * 0.5) * sign;

      const closingSpeed = diff > 0 ? (this.omega1 - this.omega2) : (this.omega2 - this.omega1);

      if (closingSpeed > 0) {
        const linearSpeed = closingSpeed * this.stringLength;
        const minHitLinearSpeed = 130;

        if (linearSpeed < minHitLinearSpeed) {
          const avgOmega = (this.omega1 + this.omega2) / 2;
          this.omega1 = avgOmega * 0.4;
          this.omega2 = avgOmega * 0.4;
        } else if (this.collisionCooldown <= 0) {
          const pos1 = this.getBall1Pos();
          const pos2 = this.getBall2Pos();
          const colX = (pos1.x + pos2.x) / 2;
          const colY = (pos1.y + pos2.y) / 2;

          const isTopHit = colY < (this.pivotY - this.stringLength * 0.2);
          const intensity = Math.min(2.5, Math.max(0.3, linearSpeed / 750));

          const e = this.restitution;
          const w1 = this.omega1;
          const w2 = this.omega2;

          this.omega1 = ((1 - e) * w1 + (1 + e) * w2) / 2;
          this.omega2 = ((1 + e) * w1 + (1 - e) * w2) / 2;

          this.collisionCooldown = 0.03;

          if (onCollision) {
            onCollision({
              x: colX,
              y: colY,
              intensity,
              isTopHit,
              velocity: linearSpeed,
            });
          }
        }
      }
    }
  }

  public getBall1Pos() {
    return {
      x: this.pivotX + this.stringLength * Math.sin(this.theta1),
      y: this.pivotY + this.stringLength * Math.cos(this.theta1),
    };
  }

  public getBall2Pos() {
    return {
      x: this.pivotX + this.stringLength * Math.sin(this.theta2),
      y: this.pivotY + this.stringLength * Math.cos(this.theta2),
    };
  }
}
