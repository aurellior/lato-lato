'use client';

import React from 'react';
import { X, Check, Sparkles, Shuffle } from 'lucide-react';
import { LatoTheme, LATO_THEMES } from '@/lib/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: LatoTheme;
  onSelectTheme: (theme: LatoTheme) => void;
  autoShiftEnabled: boolean;
  onToggleAutoShift: (enabled: boolean) => void;
  shiftInterval: number;
  onChangeShiftInterval: (val: number) => void;
}

export default function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  autoShiftEnabled,
  onToggleAutoShift,
  shiftInterval,
  onChangeShiftInterval,
}: ThemeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Palet Warna & Tema</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Auto Shift Settings */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-sm font-semibold text-white block">Auto Theme Shifting</span>
                <span className="text-xs text-slate-400">Ganti tema dinamis seiring pertambahan skor</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoShiftEnabled}
              onChange={(e) => onToggleAutoShift(e.target.checked)}
              className="w-5 h-5 accent-pink-500 cursor-pointer rounded"
            />
          </div>

          {autoShiftEnabled && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
              <span className="text-slate-300">Ganti setiap kelipatan:</span>
              <div className="flex gap-1.5">
                {[10, 15, 25].map((val) => (
                  <button
                    key={val}
                    onClick={() => onChangeShiftInterval(val)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      shiftInterval === val
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {val} Clacks
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {LATO_THEMES.map((th) => {
            const isSelected = th.id === currentTheme.id;
            return (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-pink-500/80 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch balls */}
                  <div className="flex items-center -space-x-1.5">
                    <span
                      className="w-6 h-6 rounded-full border border-white/40 shadow-md"
                      style={{ backgroundColor: th.ball1.color, boxShadow: `0 0 10px ${th.ball1.glow}` }}
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-white/40 shadow-md"
                      style={{ backgroundColor: th.ball2.color, boxShadow: `0 0 10px ${th.ball2.glow}` }}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{th.name}</h4>
                    <p className="text-xs text-slate-400">{th.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
