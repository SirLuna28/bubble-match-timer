import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Home } from 'lucide-react';
import { useLocation } from 'wouter';

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

const BUBBLE_COLORS = [
  '#00FF88', // green
  '#FF1493', // pink
  '#00BFFF', // cyan
  '#FFD700', // orange
  '#FF6347', // red
];

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

export default function Game() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    bubbles: [] as Bubble[],
    selected: new Set<string>(),
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    gameOver: false,
    animationId: 0,
  });

  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    gameOver: false,
  });

  // Initialize bubbles
  useEffect(() => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 17; i++) {
      bubbles.push({
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 30,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 25,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        matched: false,
      });
    }
    gameRef.current.bubbles = bubbles;
  }, []);

  // Timer
  useEffect(() => {
    if (gameRef.current.isPaused || gameRef.current.timeLeft <= 0 || gameRef.current.gameOver) return;

    const timer = setInterval(() => {
      gameRef.current.timeLeft = Math.max(0, gameRef.current.timeLeft - 1);
      setGameState({ ...gameRef.current });

      if (gameRef.current.timeLeft === 0) {
        gameRef.current.gameOver = true;
        gameRef.current.isPaused = true;
        setGameState({ ...gameRef.current });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Canvas click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent | PointerEvent) => {
      if (gameRef.current.isPaused || gameRef.current.gameOver) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Find clicked bubble (check from end to start for proper layering)
      for (let i = gameRef.current.bubbles.length - 1; i >= 0; i--) {
        const bubble = gameRef.current.bubbles[i];
        if (bubble.matched) continue;

        const dist = Math.sqrt((clickX - bubble.x) ** 2 + (clickY - bubble.y) ** 2);
        if (dist < bubble.radius) {
          // Toggle selection
          if (gameRef.current.selected.has(bubble.id)) {
            gameRef.current.selected.delete(bubble.id);
          } else {
            gameRef.current.selected.add(bubble.id);
          }

          // Check for match
          if (gameRef.current.selected.size === 3) {
            const selectedBubbles = gameRef.current.bubbles.filter((b) =>
              gameRef.current.selected.has(b.id)
            );

            const allSameColor = selectedBubbles.every(
              (b) => b.color === selectedBubbles[0].color
            );

            if (allSameColor) {
              selectedBubbles.forEach((b) => {
                b.matched = true;
              });
              gameRef.current.score += 30;
              gameRef.current.selected.clear();
              setGameState({ ...gameRef.current });
            } else {
              gameRef.current.selected.clear();
            }
          }

          break;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('pointerdown', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('pointerdown', handleClick);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update physics
      gameRef.current.bubbles.forEach((bubble) => {
        if (bubble.matched) return;

        // No gravity - just friction
        bubble.vx *= 0.99;
        bubble.vy *= 0.99;

        // Bounce off walls
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > CANVAS_WIDTH) {
          bubble.vx *= -0.9;
          bubble.x = Math.max(bubble.radius, Math.min(CANVAS_WIDTH - bubble.radius, bubble.x));
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > CANVAS_HEIGHT) {
          bubble.vy *= -0.9;
          bubble.y = Math.max(bubble.radius, Math.min(CANVAS_HEIGHT - bubble.radius, bubble.y));
        }

        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
      });

      // Draw bubbles
      gameRef.current.bubbles.forEach((bubble) => {
        if (bubble.matched) return;

        const isSelected = gameRef.current.selected.has(bubble.id);

        // Draw bubble
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Selection ring
        if (isSelected) {
          ctx.strokeStyle = '#00FF88';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius + 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      gameRef.current.animationId = requestAnimationFrame(animate);
    };

    gameRef.current.animationId = requestAnimationFrame(animate);

    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, []);

  const handlePause = () => {
    gameRef.current.isPaused = !gameRef.current.isPaused;
    setGameState({ ...gameRef.current });
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleRestart = () => {
    gameRef.current.selected.clear();
    gameRef.current.bubbles = [];
    gameRef.current.score = 0;
    gameRef.current.level = 1;
    gameRef.current.timeLeft = 60;
    gameRef.current.isPaused = false;
    gameRef.current.gameOver = false;

    // Reinitialize bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 17; i++) {
      bubbles.push({
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 30,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 25,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        matched: false,
      });
    }
    gameRef.current.bubbles = bubbles;
    setGameState({ ...gameRef.current });
  };

  const getTimerColor = () => {
    if (gameState.timeLeft > 30) return 'text-neon-green';
    if (gameState.timeLeft > 10) return 'text-neon-orange';
    return 'text-red-500';
  };

  return (
    <div className="game-container">
      {/* HUD */}
      <div className="hud-top">
        <div className="text-sm font-ui">
          <div className="text-muted-foreground text-xs">Level</div>
          <div className="text-lg font-bold text-neon-cyan">{gameState.level}</div>
        </div>
        <div className="text-sm font-ui text-center">
          <div className="text-muted-foreground text-xs">Score</div>
          <div className="text-lg font-bold text-neon-pink">{gameState.score}</div>
        </div>
        <div className={`text-sm font-ui text-center font-timer ${getTimerColor()}`}>
          <div className="text-muted-foreground text-xs">Time</div>
          <div className="text-xl font-bold neon-glow">{gameState.timeLeft}s</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="game-canvas">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full bg-gradient-to-b from-purple-950/40 to-blue-950/40 cursor-pointer"
          style={{ touchAction: 'none', display: 'block' }}
        />
      </div>

      {/* Controls */}
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

      {/* Game Over */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="text-center">
            <h1 className="text-4xl font-logo text-neon-glow-green mb-4">Game Over</h1>
            <p className="text-2xl font-timer text-neon-pink mb-2">Score: {gameState.score}</p>
            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleRestart}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-background font-bold"
              >
                Play Again
              </Button>
              <Button
                onClick={handleHome}
                className="bg-neon-pink hover:bg-neon-pink/80 text-background font-bold"
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pause */}
      {gameState.isPaused && !gameState.gameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
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
