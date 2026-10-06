'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PopItBubble from './PopItBubble';

type BubbleData = { id: string };

export default function PopItGrid() {
  const [columns, setColumns] = useState<BubbleData[][]>([]);
  const [gridSize, setGridSize] = useState({ rows: 8, cols: 10 });
  const [nextId, setNextId] = useState(0); // to ensure unique keys
  
  const bubbleSize = 60; // Fixed bubble size

  // Initialize and calculate grid size
  useEffect(() => {
    const initGrid = () => {
      const width = window.innerWidth - 40;
      const height = window.innerHeight - 150;
      
      const cols = Math.max(3, Math.floor(width / (bubbleSize + 8)));
      const rows = Math.max(3, Math.floor(height / (bubbleSize + 8)));
      
      setGridSize({ rows, cols });
      
      const newCols: BubbleData[][] = [];
      let currentId = 0;
      for (let c = 0; c < cols; c++) {
        const col: BubbleData[] = [];
        for (let r = 0; r < rows; r++) {
          col.push({ id: `initial-${currentId++}` });
        }
        newCols.push(col);
      }
      setColumns(newCols);
      setNextId(currentId);
    };

    initGrid();
    window.addEventListener('resize', initGrid);
    return () => window.removeEventListener('resize', initGrid);
  }, []);

  const handlePop = (colIndex: number, bubbleId: string) => {
    setColumns(prev => {
      const newCols = [...prev];
      // Remove the popped bubble from this column
      newCols[colIndex] = newCols[colIndex].filter(b => b.id !== bubbleId);
      
      // Optional: Refill from the top automatically?
      // "sisanya kaya turun gitu kaya kelereng pecah yang atasnya turun"
      // If user wants it to act like infinite wrap, we can unshift a new bubble at the top.
      newCols[colIndex].push({ id: `spawn-${Date.now()}-${Math.random()}` });

      return newCols;
    });
  };

  const resetAll = () => {
    const newCols: BubbleData[][] = [];
    let currentId = nextId;
    for (let c = 0; c < gridSize.cols; c++) {
      const col: BubbleData[] = [];
      for (let r = 0; r < gridSize.rows; r++) {
        col.push({ id: `reset-${currentId++}` });
      }
      newCols.push(col);
    }
    setColumns(newCols);
    setNextId(currentId);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div 
        className="p-4 rounded-xl shadow-2xl relative overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')]"></div>

        <div className="flex gap-2 relative z-10 justify-center">
          {columns.map((col, colIndex) => {
            const isOddCol = colIndex % 2 !== 0;
            return (
              <div 
                key={`col-${colIndex}`}
                // Use flex-col-reverse so bubbles stack from bottom up. 
                // When a bottom bubble is removed, the top ones fall down!
                className="flex flex-col-reverse gap-2" 
                style={{
                  transform: isOddCol ? 'translateY(30px)' : 'none',
                }}
              >
                <AnimatePresence mode="popLayout">
                  {col.map((bubble) => (
                    <PopItBubble
                      key={bubble.id}
                      id={bubble.id}
                      colIndex={colIndex}
                      onPop={handlePop}
                      size={bubbleSize}
                    />
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
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
