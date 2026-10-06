'use client';

import React, { useState, useEffect } from 'react';
import PopItBubble from './PopItBubble';

export default function PopItGrid() {
  const [poppedState, setPoppedState] = useState<Record<string, boolean>>({});
  const [winningId, setWinningId] = useState<string>('');
  const [lives, setLives] = useState(30);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [bubbleSize, setBubbleSize] = useState(60);

  const gridSize = { rows: 10, cols: 6 }; // Exactly 60 bubbles

  useEffect(() => {
    initGame();
    
    const handleResize = () => {
      const isMobile = window.innerWidth < 600;
      setBubbleSize(isMobile ? 45 : 60);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initGame = () => {
    setPoppedState({});
    setLives(30);
    setGameState('playing');
    
    // Pick a random bubble as the winner
    const randomRow = Math.floor(Math.random() * gridSize.rows);
    const randomCol = Math.floor(Math.random() * gridSize.cols);
    setWinningId(`${randomRow}-${randomCol}`);
  };

  const handlePop = (id: string, isWinner: boolean) => {
    if (gameState !== 'playing') return;

    setPoppedState(prev => ({ ...prev, [id]: true }));

    if (isWinner) {
      setGameState('won');
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('lost');
        }
        return newLives;
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      
      {/* Game Header HUD */}
      <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl border border-white/20 text-center z-20">
        {gameState === 'playing' && (
          <p className="text-xl font-bold text-white drop-shadow-md">
            Nyawa Tersisa: <span className={lives <= 5 ? "text-red-400" : "text-green-400"}>{lives}</span>
          </p>
        )}
        {gameState === 'won' && (
          <p className="text-2xl font-black text-yellow-400 animate-bounce">
            🎉 KAMU MENANG! 🎉
          </p>
        )}
        {gameState === 'lost' && (
          <p className="text-2xl font-black text-red-500">
            💀 GAME OVER 💀
          </p>
        )}
      </div>

      <div 
        className="p-4 rounded-xl shadow-2xl relative overflow-hidden transition-all"
        style={{ 
          backgroundColor: gameState === 'won' ? 'rgba(255, 215, 0, 0.2)' : gameState === 'lost' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          opacity: gameState === 'lost' ? 0.7 : 1
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')]"></div>

        <div 
          className="grid gap-2 relative z-10"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` 
          }}
        >
          {Array.from({ length: gridSize.rows }).map((_, rowIndex) => (
            Array.from({ length: gridSize.cols }).map((_, colIndex) => {
              const isOddRow = rowIndex % 2 !== 0;
              const id = `${rowIndex}-${colIndex}`;
              const offset = bubbleSize / 2;
              
              return (
                <div 
                  key={id} 
                  style={{ 
                    transform: isOddRow ? `translateX(${offset}px)` : 'none',
                    marginRight: isOddRow && colIndex === gridSize.cols - 1 ? `${offset}px` : '0'
                  }}
                >
                  <PopItBubble
                    id={id}
                    popped={!!poppedState[id]}
                    isWinner={id === winningId}
                    gameState={gameState}
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
        onClick={initGame}
        className="px-8 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border border-blue-400/50 backdrop-blur-sm z-20"
      >
        Mulai Permainan Baru
      </button>
    </div>
  );
}
