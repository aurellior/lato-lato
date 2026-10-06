'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LatoPhysics, CollisionEvent } from '@/lib/physics';
import { LatoTheme } from '@/lib/themes';
import { audioManager } from '@/lib/audio';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface LatoLatoCanvasProps {
  theme: LatoTheme;
  isGyroMode: boolean;
  onCollision: (event: CollisionEvent) => void;
  hapticEnabled: boolean;
  autoSwingEnabled: boolean;
  onAutoSwingChange?: (active: boolean) => void;
  onGyroUnavailable?: () => void;
}

export default function LatoLatoCanvas({
  theme,
  isGyroMode,
  onCollision,
  hapticEnabled,
  autoSwingEnabled,
  onGyroUnavailable,
}: LatoLatoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<LatoPhysics>(new LatoPhysics());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Visual effects
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const screenShakeRef = useRef<number>(0);

  // Gyro & Motion state
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      return typeof DeviceOrientationEventAny?.requestPermission === 'function';
    }
    return false;
  });
  const [gyroActive, setGyroActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      return typeof DeviceOrientationEventAny?.requestPermission !== 'function';
    }
    return false;
  });

  // Sync autoSwing state to physics engine
  useEffect(() => {
    physicsRef.current.autoOscillationActive = autoSwingEnabled;
  }, [autoSwingEnabled]);

  // Request Device Orientation / Motion permission (specifically iOS 13+)
  const requestGyroPermission = async () => {
    try {
      audioManager.init(); // unlock audio on gesture
      let granted = false;

      // Check DeviceOrientationEvent permission
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
        const orientationPerm = await DeviceOrientationEventAny.requestPermission();
        if (orientationPerm === 'granted') {
          granted = true;
        }
      } else {
        // Standard Android / modern non-iOS browsers
        granted = true;
      }

      // Check DeviceMotionEvent permission if separate
      const DeviceMotionEventAny = window.DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceMotionEventAny?.requestPermission === 'function') {
        await DeviceMotionEventAny.requestPermission();
      }

      if (granted) {
        setPermissionNeeded(false);
        setGyroActive(true);
      } else {
        alert('Izin sensor gerak tidak diberikan. Beralih ke Mode Sentuh / Drag.');
        onGyroUnavailable?.();
      }
    } catch (err) {
      console.warn('Error requesting gyro permission:', err);
      alert('Sensor gerak tidak dapat diakses pada perangkat ini.');
      onGyroUnavailable?.();
    }
  };

  // Setup Gyroscope / Motion listeners when in Gyro Mode
  useEffect(() => {
    if (!isGyroMode || permissionNeeded) {
      return;
    }

    // Check if DeviceMotionEvent exists
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      onGyroUnavailable?.();
      return;
    }

    let lastMotionY = 0;
    let lastMotionX = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      // Use acceleration if available, otherwise fallback to accelerationIncludingGravity
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;

      const ay = acc.y ?? 0;
      const ax = acc.x ?? 0;

      // Filter noise and high-pass gesture detection
      const deltaY = ay - lastMotionY;
      const deltaX = ax - lastMotionX;
      lastMotionY = ay * 0.7;
      lastMotionX = ax * 0.7;

      // If user jerks or shakes phone vertically, inject into physics target
      const sensitivity = 7.5;
      physicsRef.current.applyHandShake(-deltaY * sensitivity, deltaX * sensitivity * 0.5);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      // Gamma is left-to-right tilt in degrees [-90, 90]
      const gamma = e.gamma ?? 0;
      const tiltRad = (gamma * Math.PI) / 180;
      // Gently bias ball equilibrium
      physicsRef.current.pivotVx += Math.sin(tiltRad) * 40;
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isGyroMode, permissionNeeded, onGyroUnavailable]);

  // Handle Collisions internally to render sparks, shockwaves, floating text, and audio
  const handleInternalCollision = useCallback((event: CollisionEvent) => {
    // Web Audio Clack
    audioManager.playClack(event.intensity, event.isTopHit);

    // Haptic feedback
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(event.isTopHit ? [20, 10, 20] : [15]);
    }

    // Emit physics sparks
    physicsRef.current.emitSparks(event.x, event.y, event.isTopHit ? 22 : 14, theme.sparkColors);

    // Shockwave ripple
    shockwavesRef.current.push({
      x: event.x,
      y: event.y,
      radius: physicsRef.current.ballRadius * 0.6,
      maxRadius: physicsRef.current.ballRadius * (event.isTopHit ? 3.5 : 2.5),
      color: event.isTopHit ? theme.ball2.color : theme.ball1.color,
      alpha: 0.9,
    });

    // Screen micro shake
    screenShakeRef.current = Math.min(8, event.intensity * 3.5);

    // Floating text on special hit
    if (event.isTopHit || event.intensity > 1.2) {
      floatingTextsRef.current.push({
        id: Math.random(),
        text: event.isTopHit ? 'TOP CLACK! 🔥' : 'CLACK! ⚡',
        x: event.x,
        y: event.y - 20,
        color: event.isTopHit ? '#fbbf24' : '#ffffff',
        alpha: 1.0,
        scale: 1.0,
      });
    }

    // Inform parent component for score & theme shift
    onCollision(event);
  }, [theme, hapticEnabled, onCollision]);

  // Main Canvas Setup and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      physicsRef.current.setDimensions(rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation render loop
    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Physics update
      physicsRef.current.update(dt, handleInternalCollision);

      // Screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current > 0.05) {
        shakeX = (Math.random() * 2 - 1) * screenShakeRef.current;
        shakeY = (Math.random() * 2 - 1) * screenShakeRef.current;
        screenShakeRef.current *= Math.exp(-14 * dt);
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Clear & Background fill
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(-10, -10, width + 20, height + 20);

      // Subtle background grid & glow
      drawBackgroundAmbiance(ctx, width, height, theme);

      // Draw Motion Trails
      drawTrails(ctx, physicsRef.current, theme);

      // Draw Strings
      drawStrings(ctx, physicsRef.current, theme);

      // Draw Balls
      drawBalls(ctx, physicsRef.current, theme);

      // Draw Pivot Ring Handle
      drawRingHandle(ctx, physicsRef.current, theme, isDraggingRef.current);

      // Draw Shockwaves
      drawShockwaves(ctx, shockwavesRef.current, dt);

      // Draw Sparks
      drawSparks(ctx, physicsRef.current.particles);

      // Draw Floating Feedback Texts
      drawFloatingTexts(ctx, floatingTextsRef.current, dt);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme, handleInternalCollision]);

  // Touch and Mouse Drag / Flick Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    audioManager.init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY, time: performance.now() };
    lastPointerRef.current = { x: clientX, y: clientY, time: performance.now() };

    canvas.setPointerCapture(e.pointerId);

    // Initial nudge
    physicsRef.current.targetPivotX = clientX;
    physicsRef.current.targetPivotY = clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const now = performance.now();
    const dt = Math.max((now - lastPointerRef.current.time) / 1000, 0.005);

    // Movement delta
    const dy = clientY - lastPointerRef.current.y;
    const dx = clientX - lastPointerRef.current.x;

    // Direct pivot follow
    physicsRef.current.targetPivotX = clientX;
    physicsRef.current.targetPivotY = clientY;

    // Calculate dragging velocity for sharp flicks
    const velY = dy / dt;
    const velX = dx / dt;
    physicsRef.current.pivotVy = velY * 0.45;
    physicsRef.current.pivotVx = velX * 0.45;

    lastPointerRef.current = { x: clientX, y: clientY, time: now };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  // Keyboard rhythm assist (Space / Arrow Up / Arrow Down to flick lato-lato)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        audioManager.init();
        physicsRef.current.applyHandShake(-45, 0);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        audioManager.init();
        physicsRef.current.applyHandShake(45, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* iOS Gyroscope Permission Prompt */}
      {isGyroMode && permissionNeeded && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold">
              📱
            </div>
            <h3 className="text-xl font-bold text-white">Akses Sensor Gerak</h3>
            <p className="text-sm text-slate-300">
              Izinkan akses sensor gerak & orientasi HP agar kamu bisa mengayunkan Lato-Lato secara nyata dengan menggerakkan ponselmu!
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={requestGyroPermission}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white shadow-lg transition active:scale-95"
              >
                Izinkan Sensor Gerak
              </button>
              <button
                onClick={() => {
                  setPermissionNeeded(false);
                  onGyroUnavailable?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Gunakan Mode Drag / Sentuh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gyro Active Indicator Badge */}
      {isGyroMode && gyroActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg animate-pulse pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Sensor Gyro Aktif: Ayunkan HP ke Atas/Bawah!
        </div>
      )}

      {/* Touch Mode Drag Hint Badge */}
      {!isGyroMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/60 border border-slate-700/60 text-slate-300 px-4 py-1.5 rounded-full text-xs backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-2">
          <span>👆 Geser cincin ke atas & bawah dengan ritme stabil!</span>
        </div>
      )}
    </div>
  );
}

// Visual Drawing Helper Functions

function drawBackgroundAmbiance(ctx: CanvasRenderingContext2D, width: number, height: number, theme: LatoTheme) {
  // Soft ambient radial glow behind the center
  const glow = ctx.createRadialGradient(width / 2, height * 0.45, 10, width / 2, height * 0.45, width * 0.65);
  glow.addColorStop(0, theme.stringGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Subtle circular guideline representing maximum swing boundary
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.45, 190, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawTrails(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const drawSingleTrail = (trail: { x: number; y: number; alpha: number }[], color: string) => {
    if (trail.length < 2) return;
    for (let i = 0; i < trail.length - 1; i++) {
      const p1 = trail[i];
      const p2 = trail[i + 1];
      if (!p1 || !p2 || !isFinite(p1.x) || !isFinite(p1.y) || !isFinite(p2.x) || !isFinite(p2.y)) continue;
      const factor = (trail.length - i) / trail.length;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.globalAlpha = factor * 0.25;
      ctx.lineWidth = Math.max(1, physics.ballRadius * 1.5 * factor);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  };

  drawSingleTrail(physics.trail1, theme.ball1.color);
  drawSingleTrail(physics.trail2, theme.ball2.color);
}

function drawStrings(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const p1 = physics.getBall1Pos();
  const p2 = physics.getBall2Pos();
  const px = physics.pivotX;
  const py = physics.pivotY;

  if (!isFinite(px) || !isFinite(py) || !isFinite(p1.x) || !isFinite(p1.y) || !isFinite(p2.x) || !isFinite(p2.y)) return;

  ctx.save();
  ctx.lineCap = 'round';

  // String 1 (To Ball 1)
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(p1.x, p1.y);
  ctx.strokeStyle = theme.stringColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = theme.stringGlow;
  ctx.shadowBlur = 8;
  ctx.stroke();

  // String 2 (To Ball 2)
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = theme.stringColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

function drawBalls(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const p1 = physics.getBall1Pos();
  const p2 = physics.getBall2Pos();
  const r = physics.ballRadius;

  if (!isFinite(r) || r <= 2) return;

  const renderSingleBall = (pos: { x: number; y: number }, style: LatoTheme['ball1']) => {
    if (!isFinite(pos.x) || !isFinite(pos.y)) return;
    ctx.save();

    // Outer glow
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 18;

    // Spherical 3D gradient
    const lightOffsetX = -r * 0.35;
    const lightOffsetY = -r * 0.35;
    const grad = ctx.createRadialGradient(
      pos.x + lightOffsetX,
      pos.y + lightOffsetY,
      r * 0.08,
      pos.x,
      pos.y,
      r
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, style.specular);
    grad.addColorStop(0.65, style.color);
    grad.addColorStop(1, '#05050a');

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Rim specular border
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = style.ring;
    ctx.stroke();

    // Secondary plastic reflection gloss arc
    ctx.beginPath();
    ctx.ellipse(
      pos.x + lightOffsetX * 0.7,
      pos.y + lightOffsetY * 0.7,
      r * 0.35,
      r * 0.18,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    ctx.restore();
  };

  renderSingleBall(p1, theme.ball1);
  renderSingleBall(p2, theme.ball2);
}

function drawRingHandle(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme, isDragging: boolean) {
  const px = physics.pivotX;
  const py = physics.pivotY;

  if (!isFinite(px) || !isFinite(py)) return;
  const outerR = 18;
  const innerR = 9;

  ctx.save();
  // Dragging highlight ring
  if (isDragging) {
    ctx.beginPath();
    ctx.arc(px, py, outerR + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
  }

  // Ring Metallic / Neon body
  ctx.beginPath();
  ctx.arc(px, py, outerR, 0, Math.PI * 2);
  ctx.fillStyle = theme.ringColor;
  ctx.shadowColor = theme.ringColor;
  ctx.shadowBlur = 10;
  ctx.fill();

  // Central Finger Hole
  ctx.beginPath();
  ctx.arc(px, py, innerR, 0, Math.PI * 2);
  ctx.fillStyle = theme.canvasBg;
  ctx.shadowBlur = 0;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tie knot knot representation
  ctx.beginPath();
  ctx.arc(px, py + outerR - 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

function drawShockwaves(ctx: CanvasRenderingContext2D, shockwaves: Shockwave[], dt: number) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += (sw.maxRadius - sw.radius) * 14 * dt;
    sw.alpha -= 2.5 * dt;

    if (sw.alpha <= 0) {
      shockwaves.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 3 * sw.alpha;
    ctx.globalAlpha = Math.max(0, sw.alpha);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSparks(ctx: CanvasRenderingContext2D, particles: LatoPhysics['particles']) {
  ctx.save();
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
  }
  ctx.restore();
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[], dt: number) {
  ctx.save();
  for (let i = texts.length - 1; i >= 0; i--) {
    const ft = texts[i];
    ft.y -= 45 * dt;
    ft.alpha -= 1.8 * dt;
    ft.scale += 0.5 * dt;

    if (ft.alpha <= 0) {
      texts.splice(i, 1);
      continue;
    }

    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.restore();
}
