'use client';

import React from 'react';
import { X, Smartphone, MousePointer, Flame, Sparkles, Volume2 } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 relative space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪀</span>
            <div>
              <h3 className="text-lg font-bold text-white">Panduan Bermain Lato-Lato</h3>
              <p className="text-xs text-slate-400">Kuasai ritme dan cetak rekor streak tertinggi!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-sm">
          {/* Section 1: Dua Mode Kontrol */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              2 Mode Kontrol Interaktif
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 mt-0.5 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block text-xs uppercase tracking-wide">
                    1. Mode Gyro / Sensor Gerak (Khusus HP)
                  </strong>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Ayunkan dan goyangkan ponsel ke atas dan ke bawah secara nyata! Sensor akselerometer akan membaca hentakan tanganmu. (Khusus iOS: klik izinkan sensor saat diminta).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block text-xs uppercase tracking-wide">
                    2. Mode Sentuh / Drag (Touch & Desktop)
                  </strong>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Seret cincin pengikat ke atas dan ke bawah dengan cepat. Di desktop, kamu juga bisa menekan tombol <strong className="text-white bg-slate-700 px-1 py-0.5 rounded text-[11px]">Spasi</strong> atau tombol panah <strong className="text-white bg-slate-700 px-1 py-0.5 rounded text-[11px]">↑ / ↓</strong> untuk memompa irama!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Rahasia Top Clack */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Trik Menghasilkan &quot;Top Clack&quot; (Benturan Atas)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mulai ayunkan dengan perlahan hingga bola saling beradu di bawah. Begitu kedua bola membal ke samping dan naik ke atas, hentakkan tangan/kursor ke atas dengan frekuensi sekitar <strong>3 hingga 4 hentakan per detik</strong>. Kedua bola akan berputar 180° dan berbenturan keras di atas kepala!
            </p>
          </div>

          {/* Section 3: Fitur Unggulan */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-pink-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dynamic Themes</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Tema neon & latar belakang otomatis berubah setiap kelipatan benturan.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Web Audio API</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Suara ketukan clack plastik disintesis langsung tanpa jeda atau kuota data.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white transition cursor-pointer text-sm shadow-lg active:scale-98"
          >
            Siap Bermain!
          </button>
        </div>
      </div>
    </div>
  );
}
