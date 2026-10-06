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
    <div className="w-full max-w-lg mx-auto px-4 pb-4 pt-1 z-20 flex flex-col gap-2">
      {/* Primary Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
        <button
          onClick={() => onToggleMode(true)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer ${
            isGyroMode
              ? 'bg-pink-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Gyro</span>
        </button>

        <button
          onClick={() => onToggleMode(false)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer ${
            !isGyroMode
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Drag / Sentuh</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-1.5">
        <button
          onClick={onToggleAutoSwing}
          className={`py-1.5 px-2.5 rounded-lg text-xs border cursor-pointer flex items-center gap-1.5 ${
            autoSwingEnabled
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Auto Ritme"
        >
          {autoSwingEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>Auto</span>
        </button>

        <button
          onClick={onOpenThemeModal}
          className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5"
          title="Tema"
        >
          <Palette className="w-3 h-3" style={{ color: theme.ball1.color }} />
          <span>Tema</span>
        </button>

        <button
          onClick={onToggleMute}
          className={`p-1.5 px-2.5 rounded-lg text-xs border cursor-pointer ${
            isMuted
              ? 'bg-rose-900/40 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Suara"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onToggleHaptic}
          className={`p-1.5 px-2.5 rounded-lg text-xs border cursor-pointer ${
            hapticEnabled
              ? 'bg-cyan-900/40 border-cyan-800 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Getar"
        >
          <Vibrate className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetScore}
          className="p-1.5 px-2.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenHelpModal}
          className="p-1.5 px-2.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          title="Panduan"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
