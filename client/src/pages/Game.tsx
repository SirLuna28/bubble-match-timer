import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Home } from 'lucide-react';

interface Bubble {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  vx: number;
  vy: number;
  matched: boolean;
}

interface GameState {
  score: number;
  level: number;
  timeLeft: number;
  isPaused: boolean;
  bubbles: Bubble[];
  selectedBubbles: string[];
}

const BUBBLE_COLORS = ['#00FF88', '#FF1493', '#00BFFF', '#FFD700', '#FF6347'];
const COLORS_MAP: { [key: string]: string } = {
  '#00FF88': 'neon-green',
  '#FF1493': 'neon-pink',
  '#00BFFF': 'neon-cyan',
  '#FFD700': 'neon-orange',
  '#FF6347': 'neon-violet',
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    bubbles: [],
    selectedBubbles: [],
  });

  // Initialize bubbles
  useEffect(() => {
    const bubbles: Bubble[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < 15 + gameState.level * 2; i++) {
      bubbles.push({
        id: `bubble-${i}`,
        x: Math.random() * (width - 60) + 30,
        y: Math.random() * (height - 60) + 30,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 25,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        matched: false,
      });
    }

    setGameState((prev) => ({ ...prev, bubbles }));
  }, [gameState.level]);

  // Timer countdown
  useEffect(() => {
    if (gameState.isPaused || gameState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.timeLeft]);

  // Game over when time runs out
  useEffect(() => {
    if (gameState.timeLeft === 0) {
      setGameState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [gameState.timeLeft]);

  // Physics and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.isPaused) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with cosmic background
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw bubbles
      setGameState((prev) => {
        const updatedBubbles = prev.bubbles.map((bubble) => {
          if (bubble.matched) return bubble;

          let { x, y, vx, vy } = bubble;

          // Bounce off walls
          if (x - bubble.radius < 0 || x + bubble.radius > canvas.width) {
            vx *= -1;
            x = Math.max(bubble.radius, Math.min(canvas.width - bubble.radius, x));
          }
          if (y - bubble.radius < 0 || y + bubble.radius > canvas.height) {
            vy *= -1;
            y = Math.max(bubble.radius, Math.min(canvas.height - bubble.radius, y));
          }

          // Apply gravity
          vy += 0.1;

          // Damping
          vx *= 0.99;
          vy *= 0.99;

          return { ...bubble, x: x + vx, y: y + vy, vx, vy };
        });

        // Draw bubbles
        updatedBubbles.forEach((bubble) => {
          if (bubble.matched) return;

          const isSelected = prev.selectedBubbles.includes(bubble.id);

          // Draw bubble
          ctx.fillStyle = bubble.color;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
          ctx.fill();

          // Glow effect
          ctx.strokeStyle = bubble.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Selection ring
          if (isSelected) {
            ctx.strokeStyle = '#00FF88';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        return { ...prev, bubbles: updatedBubbles };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPaused]);

  // Handle bubble click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a bubble
    gameState.bubbles.forEach((bubble) => {
      if (bubble.matched) return;

      const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
      if (distance < bubble.radius) {
        setGameState((prev) => {
          const newSelected = prev.selectedBubbles.includes(bubble.id)
            ? prev.selectedBubbles.filter((id) => id !== bubble.id)
            : [...prev.selectedBubbles, bubble.id];

          // Check for match (3 of same color)
          if (newSelected.length === 3) {
            const selectedBubbles = prev.bubbles.filter((b) =>
              newSelected.includes(b.id)
            );
            const allSameColor = selectedBubbles.every(
              (b) => b.color === selectedBubbles[0].color
            );

            if (allSameColor) {
              // Match found!
              const matchedIds = new Set(newSelected);
              const updatedBubbles = prev.bubbles.map((b) =>
                matchedIds.has(b.id) ? { ...b, matched: true } : b
              );

              return {
                ...prev,
                score: prev.score + 30,
                bubbles: updatedBubbles,
                selectedBubbles: [],
              };
            } else {
              // No match, clear selection
              return { ...prev, selectedBubbles: [] };
            }
          }

          return { ...prev, selectedBubbles: newSelected };
        });
      }
    });
  };

  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleHome = () => {
    // Navigate back to home
    window.location.href = '/';
  };

  // Timer color based on urgency
  const getTimerColor = () => {
    if (gameState.timeLeft > 30) return 'text-neon-green';
    if (gameState.timeLeft > 10) return 'text-neon-orange';
    return 'text-red-500';
  };

  return (
    <div className="game-container">
      {/* Top HUD */}
      <div className="hud-top">
        <div className="text-sm font-ui">
          <div className="text-muted-foreground">Level</div>
          <div className="text-lg font-bold text-neon-cyan">{gameState.level}</div>
        </div>
        <div className="text-sm font-ui text-center">
          <div className="text-muted-foreground">Score</div>
          <div className="text-lg font-bold text-neon-pink">{gameState.score}</div>
        </div>
        <div className={`text-sm font-ui text-center font-timer ${getTimerColor()}`}>
          <div className="text-muted-foreground text-xs">Time</div>
          <div className="text-xl font-bold neon-glow">{gameState.timeLeft}s</div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="game-canvas">
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          onClick={handleCanvasClick}
          className="w-full h-full bg-gradient-to-b from-purple-950/40 to-blue-950/40"
          style={{ backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/bmt-hero-bg-TMNJSai9t2aDYKtGWGZLkX.webp')` }}
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="control-bar">
        <Button
          onClick={handlePause}
          size="sm"
          className="bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan"
        >
          <Pause className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleHome}
          size="sm"
          className="bg-neon-pink/20 hover:bg-neon-pink/30 border border-neon-pink/50 text-neon-pink"
        >
          <Home className="w-4 h-4" />
        </Button>
      </div>

      {/* Game Over Modal */}
      {gameState.timeLeft === 0 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-4xl font-logo text-neon-glow-green mb-4">Game Over</h1>
            <p className="text-2xl font-timer text-neon-pink mb-8">Score: {gameState.score}</p>
            <Button
              onClick={handleHome}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-background font-bold"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState.isPaused && gameState.timeLeft > 0 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-4xl font-logo text-neon-glow-green mb-8">Paused</h1>
            <Button
              onClick={handlePause}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-background font-bold mb-4 w-32"
            >
              Resume
            </Button>
            <Button
              onClick={handleHome}
              className="bg-neon-pink hover:bg-neon-pink/80 text-background font-bold w-32"
            >
              Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
