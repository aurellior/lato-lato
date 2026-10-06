'use client';

import React from 'react';
import {
  Smartphone,
  MousePointer,
  Volume2,
  VolumeX,
  Vibrate,
  RotateCcw,
  HelpCircle,
  Palette,
  Play,
  Pause,
} from 'lucide-react';
import { LatoTheme } from '@/lib/themes';

interface ControlBarProps {
  isGyroMode: boolean;
  onToggleMode: (gyro: boolean) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
  autoSwingEnabled: boolean;
  onToggleAutoSwing: () => void;
  theme: LatoTheme;
  onOpenThemeModal: () => void;
  onOpenHelpModal: () => void;
  onResetScore: () => void;
}

export default function ControlBar({
  isGyroMode,
  onToggleMode,
  isMuted,
  onToggleMute,
  hapticEnabled,
  onToggleHaptic,
  autoSwingEnabled,
  onToggleAutoSwing,
  theme,
  onOpenThemeModal,
  onOpenHelpModal,
  onResetScore,
}: ControlBarProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-4 pt-1 z-20 flex flex-col gap-2.5">
      {/* Primary Control Switcher: Gyro Mode vs Touch / Mouse Drag */}
      <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-md rounded-2xl p-1.5 flex items-center gap-1 shadow-xl">
        <button
          onClick={() => onToggleMode(true)}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isGyroMode
              ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mode Gyro / Gerak</span>
        </button>

        <button
          onClick={() => onToggleMode(false)}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            !isGyroMode
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span>Mode Drag / Sentuh</span>
        </button>
      </div>

      {/* Auxiliary Actions & Utilities */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Auto Rhythm Assist Button */}
        <button
          onClick={onToggleAutoSwing}
          className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer backdrop-blur-md shadow-sm ${
            autoSwingEnabled
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Mode Latihan Ritme Otomatis"
        >
          {autoSwingEnabled ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden xs:inline">Auto Ritme</span>
        </button>

        {/* Theme Picker Button */}
        <button
          onClick={onOpenThemeModal}
          className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
          title="Ganti Tema Warna"
        >
          <Palette className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
          <span className="hidden sm:inline">Tema</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 sm:px-3 rounded-xl text-xs font-medium border transition cursor-pointer backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title={isMuted ? 'Suara Dimatikan' : 'Suara Aktif'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Haptic Toggle */}
        <button
          onClick={onToggleHaptic}
          className={`p-2 sm:px-3 rounded-xl text-xs font-medium border transition cursor-pointer backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
            hapticEnabled
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title={hapticEnabled ? 'Getar / Haptic Aktif' : 'Getar Dimatikan'}
        >
          <Vibrate className="w-4 h-4" />
        </button>

        {/* Score Reset */}
        <button
          onClick={onResetScore}
          className="p-2 sm:px-3 rounded-xl text-xs font-medium bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-slate-800/80 transition cursor-pointer backdrop-blur-md shadow-sm flex items-center gap-1"
          title="Reset Skor"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenHelpModal}
          className="p-2 sm:px-3 rounded-xl text-xs font-medium bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer backdrop-blur-md shadow-sm flex items-center gap-1"
          title="Panduan Bermain"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
}
