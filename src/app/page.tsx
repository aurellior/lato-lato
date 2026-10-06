'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import LatoLatoCanvas from '@/components/LatoLatoCanvas';
import ScoreBoard from '@/components/ScoreBoard';
import ControlBar from '@/components/ControlBar';
import ThemeSelectorModal from '@/components/ThemeSelectorModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import { LATO_THEMES, LatoTheme, getThemeByScore } from '@/lib/themes';
import { audioManager } from '@/lib/audio';
import { CollisionEvent } from '@/lib/physics';

export default function LatoLatoGame() {
  // Game & Score state
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('latolato_best_streak');
      if (saved) return parseInt(saved, 10) || 0;
    }
    return 0;
  });
  const [topHits, setTopHits] = useState<number>(0);
  const [cpm, setCpm] = useState<number>(0);

  // Settings & Controls state
  const [isGyroMode, setIsGyroMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
    }
    return false;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [autoSwingEnabled, setAutoSwingEnabled] = useState<boolean>(false);

  // Themes state
  const [currentTheme, setCurrentTheme] = useState<LatoTheme>(LATO_THEMES[0]);
  const [autoShiftEnabled, setAutoShiftEnabled] = useState<boolean>(true);
  const [shiftInterval, setShiftInterval] = useState<number>(15);

  // Modals
  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // Tracking timestamps for CPM & Streak timeout
  const collisionTimestampsRef = useRef<number[]>([]);
  const streakTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update best streak in state and storage
  const updateBestStreak = useCallback((current: number) => {
    setBestStreak((prev) => {
      if (current > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('latolato_best_streak', current.toString());
        }
        return current;
      }
      return prev;
    });
  }, []);

  // Handle collision events emitted by canvas physics
  const handleCollision = useCallback((event: CollisionEvent) => {
    const now = performance.now();

    // 1. Update score
    setScore((prev) => {
      const nextScore = prev + 1;

      // Auto theme shifting check
      if (autoShiftEnabled && nextScore > 0 && nextScore % shiftInterval === 0) {
        const nextTheme = getThemeByScore(nextScore, shiftInterval);
        setCurrentTheme(nextTheme);
      }

      return nextScore;
    });

    if (event.isTopHit) {
      setTopHits((prev) => prev + 1);
    }

    // 2. Increment streak & schedule reset timer
    setStreak((prevStreak) => {
      const nextStreak = prevStreak + 1;
      updateBestStreak(nextStreak);

      // Milestone celebrations
      if ([10, 25, 50, 100, 200].includes(nextStreak)) {
        audioManager.playMilestoneSound(nextStreak);
        try {
          confetti({
            particleCount: nextStreak >= 50 ? 90 : 45,
            spread: 70,
            origin: { y: 0.6 },
            colors: currentTheme.sparkColors,
          });
        } catch {
          // Ignore confetti errors if canvas unavailable
        }
      }

      return nextStreak;
    });

    // Reset rhythm streak timeout (~1.3 seconds window)
    if (streakTimerRef.current) {
      clearTimeout(streakTimerRef.current);
    }
    streakTimerRef.current = setTimeout(() => {
      setStreak((st) => {
        if (st > 5) {
          audioManager.playDropSound();
        }
        return 0;
      });
      setCpm(0);
    }, 1350);

    // 3. Calculate real-time CPM (Clacks Per Minute)
    collisionTimestampsRef.current.push(now);
    // keep timestamps within the last 4 seconds
    collisionTimestampsRef.current = collisionTimestampsRef.current.filter((t) => now - t <= 4000);
    const count = collisionTimestampsRef.current.length;
    if (count >= 2) {
      const timeSpanSec = (now - collisionTimestampsRef.current[0]) / 1000;
      if (timeSpanSec > 0.4) {
        const rate = Math.round((count / timeSpanSec) * 60);
        setCpm(rate);
      }
    }
  }, [autoShiftEnabled, shiftInterval, currentTheme, updateBestStreak]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (streakTimerRef.current) {
        clearTimeout(streakTimerRef.current);
      }
    };
  }, []);

  const handleResetScore = () => {
    if (confirm('Apakah kamu yakin ingin mereset skor saat ini?')) {
      setScore(0);
      setStreak(0);
      setTopHits(0);
      setCpm(0);
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioManager.setMuted(nextMuted);
  };

  return (
    <main
      className={`relative w-full h-[100dvh] overflow-hidden select-none bg-gradient-to-b ${currentTheme.bgGradient} transition-colors duration-700 flex flex-col justify-between`}
    >
      {/* Dynamic ambient backdrop light */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[130px] pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: currentTheme.ball1.color }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: currentTheme.ball2.color }}
      />

      {/* Top Header & Scoreboard */}
      <header className="w-full shrink-0 z-20">
        <ScoreBoard
          score={score}
          streak={streak}
          bestStreak={bestStreak}
          topHits={topHits}
          cpm={cpm}
          theme={currentTheme}
        />
      </header>

      {/* Interactive Physics Canvas Simulation */}
      <section className="relative w-full flex-1 flex items-center justify-center overflow-hidden z-10">
        <LatoLatoCanvas
          theme={currentTheme}
          isGyroMode={isGyroMode}
          onCollision={handleCollision}
          hapticEnabled={hapticEnabled}
          autoSwingEnabled={autoSwingEnabled}
          onAutoSwingChange={setAutoSwingEnabled}
          onGyroUnavailable={() => setIsGyroMode(false)}
        />
      </section>

      {/* Bottom Control Bar */}
      <footer className="w-full shrink-0 z-20">
        <ControlBar
          isGyroMode={isGyroMode}
          onToggleMode={(gyro) => setIsGyroMode(gyro)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          hapticEnabled={hapticEnabled}
          onToggleHaptic={() => setHapticEnabled(!hapticEnabled)}
          autoSwingEnabled={autoSwingEnabled}
          onToggleAutoSwing={() => setAutoSwingEnabled(!autoSwingEnabled)}
          theme={currentTheme}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onOpenHelpModal={() => setHelpModalOpen(true)}
          onResetScore={handleResetScore}
        />
      </footer>

      {/* Modals */}
      <ThemeSelectorModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(th) => {
          setCurrentTheme(th);
          setAutoShiftEnabled(false);
        }}
        autoShiftEnabled={autoShiftEnabled}
        onToggleAutoShift={setAutoShiftEnabled}
        shiftInterval={shiftInterval}
        onChangeShiftInterval={setShiftInterval}
      />

      <HowToPlayModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </main>
  );
}
