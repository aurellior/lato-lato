'use client';

import React from 'react';
import { Flame, Trophy, Zap, Sparkles } from 'lucide-react';
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
  // Rank titles based on streak
  const getRankBadge = (currentStreak: number) => {
    if (currentStreak >= 100) return { title: '👑 Legenda Lato-Lato', color: 'from-amber-400 to-yellow-500' };
    if (currentStreak >= 50) return { title: '⚡ Dewa Ayunan', color: 'from-fuchsia-500 to-pink-500' };
    if (currentStreak >= 25) return { title: '🔥 Pro Clacker', color: 'from-rose-500 to-orange-500' };
    if (currentStreak >= 10) return { title: '✨ Irama Terjaga', color: 'from-cyan-400 to-blue-500' };
    return { title: '🎯 Ayo Mulai Ayun!', color: 'from-slate-500 to-slate-400' };
  };

  const rank = getRankBadge(streak);

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-3 pb-2 z-20 pointer-events-none">
      {/* Top Banner with Rank and Current Theme Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-slate-200 shadow-md">
          <span className={`bg-gradient-to-r ${rank.color} bg-clip-text text-transparent font-bold`}>
            {rank.title}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-slate-300 shadow-md">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: theme.accentColor }}
          />
          <span className="text-slate-300 font-sans">{theme.name}</span>
        </div>
      </div>

      {/* Main Score & Streak Display Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Score Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400">
            Total Clack
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 font-mono">
            {score.toLocaleString()}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
            style={{ backgroundColor: theme.ball1.color }}
          />
        </div>

        {/* Streak / Combo Card (Highlighted) */}
        <div
          className="bg-slate-900/90 border backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-center shadow-xl relative overflow-hidden flex flex-col items-center justify-center transition-all duration-300"
          style={{
            borderColor: streak > 0 ? theme.accentColor : 'rgba(51, 65, 85, 0.7)',
            boxShadow: streak > 5 ? `0 0 20px ${theme.ball1.glow}` : undefined,
          }}
        >
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-amber-400">
            <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <span>Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight mt-0.5 font-mono flex items-center gap-0.5">
            {streak}
            {streak >= 10 && <span className="text-xs text-amber-400">x</span>}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (streak % 25) * 4)}%` }}
          />
        </div>

        {/* Best Streak / Records */}
        <div className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span>Rekor</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 font-mono">
            {bestStreak}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
            style={{ backgroundColor: theme.ball2.color }}
          />
        </div>
      </div>

      {/* Speedometer & Top Hits bar */}
      <div className="mt-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 px-1 font-mono">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kecepatan: <strong className="text-cyan-300 font-semibold">{cpm}</strong> CPM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Top Clacks: <strong className="text-pink-300 font-semibold">{topHits}</strong></span>
        </div>
      </div>
    </div>
  );
}
