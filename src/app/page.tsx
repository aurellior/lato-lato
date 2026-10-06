'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import LatoLatoCanvas from '@/components/LatoLatoCanvas';
import ScoreBoard from '@/components/ScoreBoard';
import ControlBar from '@/components/ControlBar';
import ThemeSelectorModal from '@/components/ThemeSelectorModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import { LATO_THEMES, LatoTheme, getThemeByScore } from '@/lib/themes';
import { audioManager } from '@/lib/audio';
import { CollisionEvent } from '@/lib/physics';

export default function LatoLatoGame() {
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

  const [currentTheme, setCurrentTheme] = useState<LatoTheme>(LATO_THEMES[0]);
  const [autoShiftEnabled, setAutoShiftEnabled] = useState<boolean>(true);
  const [shiftInterval, setShiftInterval] = useState<number>(15);

  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  const collisionTimestampsRef = useRef<number[]>([]);
  const streakTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleCollision = useCallback((event: CollisionEvent) => {
    const now = performance.now();

    setScore((prev) => {
      const nextScore = prev + 1;
      if (autoShiftEnabled && nextScore > 0 && nextScore % shiftInterval === 0) {
        setCurrentTheme(getThemeByScore(nextScore, shiftInterval));
      }
      return nextScore;
    });

    if (event.isTopHit) {
      setTopHits((prev) => prev + 1);
    }

    setStreak((prevStreak) => {
      const nextStreak = prevStreak + 1;
      updateBestStreak(nextStreak);
      return nextStreak;
    });

    if (streakTimerRef.current) {
      clearTimeout(streakTimerRef.current);
    }
    streakTimerRef.current = setTimeout(() => {
      setStreak(0);
      setCpm(0);
    }, 1350);

    collisionTimestampsRef.current.push(now);
    collisionTimestampsRef.current = collisionTimestampsRef.current.filter((t) => now - t <= 4000);
    const count = collisionTimestampsRef.current.length;
    if (count >= 2) {
      const timeSpanSec = (now - collisionTimestampsRef.current[0]) / 1000;
      if (timeSpanSec > 0.4) {
        setCpm(Math.round((count / timeSpanSec) * 60));
      }
    }
  }, [autoShiftEnabled, shiftInterval, updateBestStreak]);

  useEffect(() => {
    return () => {
      if (streakTimerRef.current) {
        clearTimeout(streakTimerRef.current);
      }
    };
  }, []);

  const handleResetScore = () => {
    setScore(0);
    setStreak(0);
    setTopHits(0);
    setCpm(0);
    if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioManager.setMuted(nextMuted);
  };

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden select-none bg-slate-950 flex flex-col justify-between">
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
