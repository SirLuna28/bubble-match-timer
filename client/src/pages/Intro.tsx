import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function Intro() {
  const [, navigate] = useLocation();
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Bubble Match Timer';

  useEffect(() => {
    // Typewriter effect
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    // Set default game config and navigate to game after 3 seconds
    const navigationTimer = setTimeout(() => {
      // Set default balanced difficulty (between Easy and Normal)
      const gameConfig = {
        difficulty: 'normal',
        goalScore: 300,
        timeLimit: 60,
        bubbleCount: 15,
      };
      sessionStorage.setItem('gameConfig', JSON.stringify(gameConfig));
      navigate('/game');
    }, 3000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className="game-container flex items-center justify-center">
      {/* Background with cosmic theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-neon-magenta/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-neon-yellow/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Animated title with neon effect */}
        <div className="mb-8">
          <h1
            className="text-5xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #00ffff, #ff00ff, #00ff00, #ffff00)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient 3s linear infinite',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
            }}
          >
            {displayText}
            {displayText.length < fullText.length && (
              <span className="animate-pulse">|</span>
            )}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-neon-cyan text-lg font-light tracking-widest animate-pulse">
          Cosmic Puzzle Challenge
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
