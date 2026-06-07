import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const bubblesRef = useRef<Bubble[]>([]);
  const selectedRef = useRef<Set<string>>(new Set());
  const gameStateRef = useRef({
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    gameOver: false,
  });
  const animationIdRef = useRef<number | null>(null);

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
    bubblesRef.current = bubbles;
  }, []);

  // Timer
  useEffect(() => {
    if (gameStateRef.current.isPaused || gameStateRef.current.timeLeft <= 0 || gameStateRef.current.gameOver) return;

    const timer = setInterval(() => {
      gameStateRef.current.timeLeft = Math.max(0, gameStateRef.current.timeLeft - 1);
      setGameState({ ...gameStateRef.current });

      if (gameStateRef.current.timeLeft === 0) {
        gameStateRef.current.gameOver = true;
        gameStateRef.current.isPaused = true;
        setGameState({ ...gameStateRef.current });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle canvas click with visual feedback
  const handleCanvasClick = useCallback((e: PointerEvent | MouseEvent) => {
    if (gameStateRef.current.isPaused || gameStateRef.current.gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let clickedBubble: Bubble | null = null;

    // Find clicked bubble
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const bubble = bubblesRef.current[i];
      if (bubble.matched) continue;

      const dist = Math.sqrt((clickX - bubble.x) ** 2 + (clickY - bubble.y) ** 2);
      if (dist < bubble.radius) {
        clickedBubble = bubble;
        break;
      }
    }

    if (!clickedBubble) {
      return;
    }

    // Toggle selection
    if (selectedRef.current.has(clickedBubble.id)) {
      selectedRef.current.delete(clickedBubble.id);
    } else {
      selectedRef.current.add(clickedBubble.id);
    }

    // Check for match
    if (selectedRef.current.size === 3) {
      const selectedBubbles = bubblesRef.current.filter((b) =>
        selectedRef.current.has(b.id)
      );

      const allSameColor = selectedBubbles.every(
        (b) => b.color === selectedBubbles[0].color
      );

      if (allSameColor) {
        selectedBubbles.forEach((b) => {
          b.matched = true;
        });

        gameStateRef.current.score += 30;
        setGameState({ ...gameStateRef.current });

        selectedRef.current.clear();
      } else {
        selectedRef.current.clear();
      }
    }
  }, []);

  // Attach click handler to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => handleCanvasClick(e);
    const handleMouseDown = (e: MouseEvent) => handleCanvasClick(e);

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleCanvasClick]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (gameStateRef.current.isPaused || gameStateRef.current.gameOver) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear
      ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update physics
      bubblesRef.current.forEach((bubble) => {
        if (bubble.matched) return;

        bubble.vy += 0.15;
        bubble.vx *= 0.98;
        bubble.vy *= 0.98;

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
      bubblesRef.current.forEach((bubble) => {
        if (bubble.matched) return;

        const isSelected = selectedRef.current.has(bubble.id);

        // Draw bubble
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Selection ring - bright green
        if (isSelected) {
          ctx.strokeStyle = '#00FF88';
          ctx.lineWidth = 5;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  const handlePause = () => {
    gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
    setGameState({ ...gameStateRef.current });
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleRestart = () => {
    selectedRef.current.clear();
    bubblesRef.current = [];
    gameStateRef.current = {
      score: 0,
      level: 1,
      timeLeft: 60,
      isPaused: false,
      gameOver: false,
    };
    setGameState({ ...gameStateRef.current });
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
          className="w-full h-full bg-gradient-to-b from-purple-950/40 to-blue-950/40 cursor-pointer touch-none"
          style={{ touchAction: 'none' }}
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
