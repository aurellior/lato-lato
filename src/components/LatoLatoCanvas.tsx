'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LatoPhysics, CollisionEvent } from '@/lib/physics';
import { LatoTheme } from '@/lib/themes';
import { audioManager } from '@/lib/audio';

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
  const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

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
      audioManager.init();
      let granted = false;

      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
        const orientationPerm = await DeviceOrientationEventAny.requestPermission();
        if (orientationPerm === 'granted') {
          granted = true;
        }
      } else {
        granted = true;
      }

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
    } catch {
      alert('Sensor gerak tidak dapat diakses pada perangkat ini.');
      onGyroUnavailable?.();
    }
  };

  // Setup Gyroscope / Motion listeners when in Gyro Mode
  useEffect(() => {
    if (!isGyroMode || permissionNeeded) {
      return;
    }

    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      onGyroUnavailable?.();
      return;
    }

    let lastMotionY = 0;
    let lastMotionX = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;

      const ay = acc.y ?? 0;
      const ax = acc.x ?? 0;

      const deltaY = ay - lastMotionY;
      const deltaX = ax - lastMotionX;
      lastMotionY = ay * 0.7;
      lastMotionX = ax * 0.7;

      const sensitivity = 7.5;
      physicsRef.current.applyHandShake(-deltaY * sensitivity, deltaX * sensitivity * 0.5);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const tiltRad = (gamma * Math.PI) / 180;
      physicsRef.current.pivotVx += Math.sin(tiltRad) * 40;
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isGyroMode, permissionNeeded, onGyroUnavailable]);

  // Handle Collisions internally for sound & haptics
  const handleInternalCollision = useCallback((event: CollisionEvent) => {
    audioManager.playClack(event.intensity, event.isTopHit);

    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(event.isTopHit ? [18, 8, 18] : [14]);
    }

    onCollision(event);
  }, [hapticEnabled, onCollision]);

  // Lightweight Render Loop
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

    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Physics update
      physicsRef.current.update(dt, handleInternalCollision);

      // Simple clean background
      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Strings
      drawStrings(ctx, physicsRef.current, theme);

      // Draw Balls
      drawBalls(ctx, physicsRef.current, theme);

      // Draw Ring Handle
      drawRingHandle(ctx, physicsRef.current, theme);

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

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    audioManager.init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    isDraggingRef.current = true;
    lastPointerRef.current = { x: clientX, y: clientY, time: performance.now() };

    canvas.setPointerCapture(e.pointerId);

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

    const dy = clientY - lastPointerRef.current.y;
    const dx = clientX - lastPointerRef.current.x;

    physicsRef.current.targetPivotX = clientX;
    physicsRef.current.targetPivotY = clientY;

    const velY = Math.min(Math.max(dy / dt, -3000), 3000);
    const velX = Math.min(Math.max(dx / dt, -3000), 3000);
    physicsRef.current.pivotVy = velY * 0.4;
    physicsRef.current.pivotVx = velX * 0.4;

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
        <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Akses Sensor Gerak</h3>
            <p className="text-sm text-slate-300">
              Izinkan akses sensor gerak agar kamu bisa mengayunkan Lato-Lato dengan menggerakkan HP.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={requestGyroPermission}
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-pink-600 hover:bg-pink-500 text-white transition"
              >
                Izinkan Sensor
              </button>
              <button
                onClick={() => {
                  setPermissionNeeded(false);
                  onGyroUnavailable?.();
                }}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Gunakan Mode Drag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Status Badge */}
      {isGyroMode && gyroActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
          Sensor Gyro Aktif: Ayunkan HP
        </div>
      )}
    </div>
  );
}

// Simple, crisp, ultra-fast canvas drawing routines
function drawStrings(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const p1 = physics.getBall1Pos();
  const p2 = physics.getBall2Pos();
  const px = physics.pivotX;
  const py = physics.pivotY;

  if (!isFinite(px) || !isFinite(py) || !isFinite(p1.x) || !isFinite(p1.y) || !isFinite(p2.x) || !isFinite(p2.y)) return;

  ctx.strokeStyle = theme.stringColor;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(p1.x, p1.y);
  ctx.moveTo(px, py);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawBalls(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const p1 = physics.getBall1Pos();
  const p2 = physics.getBall2Pos();
  const r = physics.ballRadius;

  if (!isFinite(r) || r <= 2) return;

  // Ball 1
  if (isFinite(p1.x) && isFinite(p1.y)) {
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.ball1.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }

  // Ball 2
  if (isFinite(p2.x) && isFinite(p2.y)) {
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.ball2.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
}

function drawRingHandle(ctx: CanvasRenderingContext2D, physics: LatoPhysics, theme: LatoTheme) {
  const px = physics.pivotX;
  const py = physics.pivotY;

  if (!isFinite(px) || !isFinite(py)) return;

  ctx.beginPath();
  ctx.arc(px, py, 16, 0, Math.PI * 2);
  ctx.fillStyle = theme.ringColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fillStyle = theme.canvasBg;
  ctx.fill();
}
