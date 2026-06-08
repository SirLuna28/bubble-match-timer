import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export interface GameConfig {
  difficulty: 'easy' | 'normal' | 'hard';
  goalScore: number;
  timeLimit: number;
  bubbleCount: number;
}

export default function Menu() {
  const [, navigate] = useLocation();

  const difficulties: Record<string, GameConfig> = {
    easy: {
      difficulty: 'easy',
      goalScore: 300,
      timeLimit: 90,
      bubbleCount: 12,
    },
    normal: {
      difficulty: 'normal',
      goalScore: 600,
      timeLimit: 60,
      bubbleCount: 15,
    },
    hard: {
      difficulty: 'hard',
      goalScore: 1000,
      timeLimit: 45,
      bubbleCount: 18,
    },
  };

  const handleStartGame = (difficulty: 'easy' | 'normal' | 'hard') => {
    const config = difficulties[difficulty];
    sessionStorage.setItem('gameConfig', JSON.stringify(config));
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-logo mb-2">
            <span className="text-neon-cyan">Bubble</span>
            <br />
            <span className="text-neon-pink">Match</span>
            <br />
            <span className="text-neon-green">Timer</span>
          </h1>
          <p className="text-neon-cyan/70 text-sm font-ui mt-4">Cosmic Puzzle Challenge</p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-neon-green text-center mb-6">Select Difficulty</h2>

          {/* Easy */}
          <Button
            onClick={() => handleStartGame('easy')}
            className="w-full py-6 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 hover:from-neon-green/30 hover:to-neon-cyan/30 border-2 border-neon-green text-neon-green font-bold text-lg rounded-lg transition-all"
          >
            <div className="flex flex-col items-start w-full">
              <span className="text-xl">🟢 EASY</span>
              <span className="text-xs font-ui text-neon-green/70 mt-1">Goal: 300 pts • 90 sec</span>
            </div>
          </Button>

          {/* Normal */}
          <Button
            onClick={() => handleStartGame('normal')}
            className="w-full py-6 bg-gradient-to-r from-neon-cyan/20 to-neon-pink/20 hover:from-neon-cyan/30 hover:to-neon-pink/30 border-2 border-neon-cyan text-neon-cyan font-bold text-lg rounded-lg transition-all"
          >
            <div className="flex flex-col items-start w-full">
              <span className="text-xl">🔵 NORMAL</span>
              <span className="text-xs font-ui text-neon-cyan/70 mt-1">Goal: 600 pts • 60 sec</span>
            </div>
          </Button>

          {/* Hard */}
          <Button
            onClick={() => handleStartGame('hard')}
            className="w-full py-6 bg-gradient-to-r from-neon-pink/20 to-red-500/20 hover:from-neon-pink/30 hover:to-red-500/30 border-2 border-neon-pink text-neon-pink font-bold text-lg rounded-lg transition-all"
          >
            <div className="flex flex-col items-start w-full">
              <span className="text-xl">🔴 HARD</span>
              <span className="text-xs font-ui text-neon-pink/70 mt-1">Goal: 1000 pts • 45 sec</span>
            </div>
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/50 border border-neon-cyan/30 rounded-lg p-4 mb-6">
          <h3 className="text-neon-cyan font-bold mb-3 text-sm">How to Play</h3>
          <ul className="text-xs text-slate-300 space-y-2 font-ui">
            <li>🎯 Drag bubbles together to match 3+ of the same color</li>
            <li>💥 Matched bubbles pop and new ones fall from the top</li>
            <li>⏱️ Reach your goal score before time runs out</li>
            <li>🚀 Complete levels to unlock higher difficulties</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 font-ui">
          <p>Ready for the cosmic puzzle challenge?</p>
        </div>
      </div>
    </div>
  );
}
