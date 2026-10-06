'use client';

import PopItGrid from '@/components/PopItGrid';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative p-4 font-sans selection:bg-none overflow-hidden">
      
      {/* Cardboard Background for realistic feel */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#d2ab7e', // Cardboard color
          backgroundImage: 'radial-gradient(circle at center, #d2ab7e 0%, #b88f5c 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]"></div>
      </div>

      <div className="absolute top-0 left-0 w-full p-6 flex justify-center items-center gap-4 z-20">
        <h1 className="text-4xl font-black tracking-tight text-white/90 drop-shadow-md mix-blend-overlay">
          Infinite Bubble Wrap
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full pt-20 pb-8 z-10">
        <PopItGrid />
      </div>
    </main>
  );
}
