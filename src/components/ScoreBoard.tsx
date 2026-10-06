'use client';

import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { LatoTheme } from '@/lib/themes';

interface ScoreBoardProps {
  score: number;
  streak: number;
  bestStreak: number;
  topHits: number;
  cpm: number;
  theme: LatoTheme;
}

export default function ScoreBoard({
  score,
  streak,
  bestStreak,
  topHits,
  cpm,
  theme,
}: ScoreBoardProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-3 pb-1 z-20 pointer-events-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <span className="font-semibold text-slate-300">Lato-Lato</span>
        <span className="font-medium" style={{ color: theme.ball1.color }}>{theme.name}</span>
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Clack</span>
          <span className="text-2xl font-bold text-white font-mono">{score}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 uppercase font-medium">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Streak</span>
          </div>
          <span className="text-2xl font-bold text-amber-300 font-mono">{streak}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-medium">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span>Rekor</span>
          </div>
          <span className="text-2xl font-bold text-white font-mono">{bestStreak}</span>
        </div>
      </div>

      {/* Speed & Top Hits */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Kecepatan: <strong className="text-cyan-300">{cpm}</strong> CPM</span>
        </div>
        <div>
          <span>Top Clacks: <strong className="text-pink-300">{topHits}</strong></span>
        </div>
      </div>
    </div>
  );
}
