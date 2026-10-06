'use client';

import React from 'react';
import { popAudio } from '@/lib/audio';

interface PopItBubbleProps {
  id: string;
  popped: boolean;
  onPop: (id: string) => void;
  size?: number;
}

export default function PopItBubble({ id, popped, onPop, size = 60 }: PopItBubbleProps) {
  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (!popped) {
      if (popAudio) {
        popAudio.init();
        popAudio.resume();
        const pitchShift = 1.0 + Math.random() * 0.5; // sharper pitch for plastic
        popAudio.playPopSound(pitchShift);
      }
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      onPop(id);
    }
  };

  const handlePointerOver = (e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handleInteract(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      className={`relative rounded-full cursor-pointer touch-none select-none transition-all duration-75 flex items-center justify-center`}
      style={{
        width: size,
        height: size,
        // Base plastic look
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        border: popped ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: popped 
          ? `inset 1px 1px 10px rgba(0,0,0,0.1), inset -1px -1px 5px rgba(255,255,255,0.05)`
          : `2px 2px 8px rgba(0,0,0,0.15), inset 4px 4px 15px rgba(255,255,255,0.7), inset -4px -4px 15px rgba(0,0,0,0.1)`,
      }}
      onPointerDown={handleInteract}
      onPointerEnter={handlePointerOver}
    >
      {/* Glossy reflection that disappears when popped */}
      <div 
        className="absolute top-2 left-2 rounded-full transition-opacity duration-75"
        style={{
          width: '30%',
          height: '25%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
          transform: 'rotate(-45deg)',
          opacity: popped ? 0.1 : 0.8
        }}
      />
      
      {/* Inner shadow / dimension */}
      <div 
        className="rounded-full w-full h-full absolute top-0 left-0"
        style={{
          background: popped 
            ? 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, rgba(255,255,255,0.1) 100%)'
            : 'radial-gradient(circle at center, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 100%)',
        }}
      />
    </div>
  );
}
