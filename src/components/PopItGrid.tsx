'use client';

import React, { useState, useEffect } from 'react';
import PopItBubble from './PopItBubble';

export default function PopItGrid() {
  const [poppedState, setPoppedState] = useState<Record<string, boolean>>({});
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 });
  const bubbleSize = 60; // Fixed bubble size

  // Calculate grid size based on window size
  useEffect(() => {
    const calculateGrid = () => {
      // Leave some padding
      const width = window.innerWidth - 40;
      const height = window.innerHeight - 150; // Leave space for header/button
      
      const cols = Math.floor(width / (bubbleSize + 8)); // +8 for gap
      const rows = Math.floor(height / (bubbleSize + 8));
      
      setGridSize({ rows: Math.max(3, rows), cols: Math.max(3, cols) });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  const handlePop = (id: string) => {
    setPoppedState(prev => ({ ...prev, [id]: true }));
  };

  const resetAll = () => {
    setPoppedState({});
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Plastic wrap container */}
      <div 
        className="p-4 rounded-xl shadow-2xl relative overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        {/* Wrinkle texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')]"></div>

        <div 
          className="grid gap-2 relative z-10"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` 
          }}
        >
          {Array.from({ length: gridSize.rows }).map((_, rowIndex) => (
            Array.from({ length: gridSize.cols }).map((_, colIndex) => {
              // Offset odd rows for a honeycomb packing pattern (like real bubble wrap)
              const isOddRow = rowIndex % 2 !== 0;
              const id = `${rowIndex}-${colIndex}`;
              
              return (
                <div 
                  key={id} 
                  style={{ 
                    transform: isOddRow ? 'translateX(30px)' : 'none',
                    marginRight: isOddRow && colIndex === gridSize.cols - 1 ? '30px' : '0'
                  }}
                >
                  <PopItBubble
                    id={id}
                    popped={!!poppedState[id]}
                    onPop={handlePop}
                    size={bubbleSize}
                  />
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      <button 
        onClick={resetAll}
        className="px-8 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border border-blue-400/50 backdrop-blur-sm z-20"
      >
        Ganti Lembaran Baru
      </button>
    </div>
  );
}
