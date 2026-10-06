'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { popAudio } from '@/lib/audio';

interface PopItBubbleProps {
  id: string;
  colIndex: number;
  onPop: (colIndex: number, id: string) => void;
  size?: number;
}

export default function PopItBubble({ id, colIndex, onPop, size = 60 }: PopItBubbleProps) {
  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (popAudio) {
      popAudio.init();
      popAudio.resume();
      const pitchShift = 1.0 + Math.random() * 0.5; // sharper pitch
      popAudio.playPopSound(pitchShift);
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    onPop(colIndex, id);
  };

  const handlePointerOver = (e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handleInteract(e as unknown as React.MouseEvent);
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0, y: -50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }} // soap burst effect
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        layout: { type: 'spring', stiffness: 200, damping: 25 } // smooth falling
      }}
      className={`relative rounded-full cursor-pointer touch-none select-none flex items-center justify-center`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: `2px 2px 8px rgba(0,0,0,0.15), inset 4px 4px 15px rgba(255,255,255,0.7), inset -4px -4px 15px rgba(0,0,0,0.1)`,
      }}
      onPointerDown={handleInteract}
      onPointerEnter={handlePointerOver}
    >
      {/* Glossy reflection */}
      <div 
        className="absolute top-2 left-2 rounded-full opacity-80"
        style={{
          width: '30%',
          height: '25%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
          transform: 'rotate(-45deg)',
        }}
      />
      <div 
        className="rounded-full w-full h-full absolute top-0 left-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0) 40%, rgba(255,255,255,0.2) 100%)',
        }}
      />
    </motion.div>
  );
}
