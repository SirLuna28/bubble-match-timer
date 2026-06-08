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
  isDragging: boolean;
  popAnimation: number; // 0-1, animation progress
}

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0-1
  color: string;
}

const BUBBLE_COLORS = [
  '#00FF88', // green
  '#FF1493', // pink
  '#00BFFF', // cyan
  '#FFD700', // yellow
  '#FF6347', // red
];

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

export default function Game() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    bubbles: [] as Bubble[],
    particles: [] as PopParticle[],
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    gameOver: false,
    animationId: 0,
    draggedBubble: null as Bubble | null,
    dragOffsetX: 0,
    dragOffsetY: 0,
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
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 80) + 40,
        y: Math.random() * (CANVAS_HEIGHT - 150) + 40,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 25,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        matched: false,
        isDragging: false,
        popAnimation: 0,
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

  // Mouse/Touch handlers for dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      let clientX, clientY;
      if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (gameRef.current.isPaused || gameRef.current.gameOver) return;

      const pos = getMousePos(e);

      // Find bubble under cursor (check from end to start for proper layering)
      for (let i = gameRef.current.bubbles.length - 1; i >= 0; i--) {
        const bubble = gameRef.current.bubbles[i];
        if (bubble.matched) continue;

        const dist = Math.sqrt((pos.x - bubble.x) ** 2 + (pos.y - bubble.y) ** 2);
        if (dist < bubble.radius) {
          gameRef.current.draggedBubble = bubble;
          gameRef.current.dragOffsetX = pos.x - bubble.x;
          gameRef.current.dragOffsetY = pos.y - bubble.y;
          bubble.isDragging = true;
          bubble.vx = 0;
          bubble.vy = 0;
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!gameRef.current.draggedBubble) return;

      const pos = getMousePos(e);
      const bubble = gameRef.current.draggedBubble;

      bubble.x = pos.x - gameRef.current.dragOffsetX;
      bubble.y = pos.y - gameRef.current.dragOffsetY;

      // Keep bubble in bounds
      bubble.x = Math.max(bubble.radius, Math.min(CANVAS_WIDTH - bubble.radius, bubble.x));
      bubble.y = Math.max(bubble.radius, Math.min(CANVAS_HEIGHT - bubble.radius, bubble.y));
    };

    const handleMouseUp = () => {
      if (gameRef.current.draggedBubble) {
        gameRef.current.draggedBubble.isDragging = false;
        gameRef.current.draggedBubble = null;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchend', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // Create pop particles for matched bubbles
  const createPopParticles = (bubble: Bubble) => {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      gameRef.current.particles.push({
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: bubble.color,
      });
    }
  };

  // Check for matches when bubbles touch
  const checkMatches = () => {
    const bubbles = gameRef.current.bubbles.filter(b => !b.matched);

    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      const connected = new Set<Bubble>();
      const stack = [bubble];

      // Flood fill to find all connected bubbles of the same color
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (connected.has(current)) continue;
        connected.add(current);

        for (let j = 0; j < bubbles.length; j++) {
          const other = bubbles[j];
          if (other.color !== current.color || connected.has(other)) continue;

          const dist = Math.sqrt((current.x - other.x) ** 2 + (current.y - other.y) ** 2);
          if (dist < current.radius + other.radius + 5) {
            stack.push(other);
          }
        }
      }

      // If 3 or more connected bubbles of same color, mark as matched
      if (connected.size >= 3) {
        connected.forEach(b => {
          b.matched = true;
          b.popAnimation = 1;
          createPopParticles(b);
        });
        gameRef.current.score += connected.size * 10;
        setGameState({ ...gameRef.current });
      }
    }
  };

  // Replace matched bubbles
  const replaceBubbles = () => {
    gameRef.current.bubbles.forEach((bubble, index) => {
      if (bubble.matched && bubble.popAnimation <= 0) {
        // Create a new bubble to replace it
        const newBubble: Bubble = {
          id: `bubble-${Date.now()}-${index}`,
          x: Math.random() * (CANVAS_WIDTH - 80) + 40,
          y: -30, // Spawn at top
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          radius: 25,
          vx: (Math.random() - 0.5) * 2,
          vy: 2, // Fall down
          matched: false,
          isDragging: false,
          popAnimation: 0,
        };
        gameRef.current.bubbles[index] = newBubble;
      }
    });
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastCheckTime = Date.now();

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update physics
      gameRef.current.bubbles.forEach((bubble) => {
        if (bubble.matched || bubble.isDragging) return;

        // No gravity - just friction
        bubble.vx *= 0.98;
        bubble.vy *= 0.98;

        // Bounce off walls
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > CANVAS_WIDTH) {
          bubble.vx *= -0.85;
          bubble.x = Math.max(bubble.radius, Math.min(CANVAS_WIDTH - bubble.radius, bubble.x));
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > CANVAS_HEIGHT) {
          bubble.vy *= -0.85;
          bubble.y = Math.max(bubble.radius, Math.min(CANVAS_HEIGHT - bubble.radius, bubble.y));
        }

        // Bubble-to-bubble collision
        for (let i = 0; i < gameRef.current.bubbles.length; i++) {
          const other = gameRef.current.bubbles[i];
          if (other === bubble || other.matched || other.isDragging) continue;

          const dx = other.x - bubble.x;
          const dy = other.y - bubble.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bubble.radius + other.radius;

          if (dist < minDist) {
            // Collision detected - push apart
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Swap velocities
            const vx1 = bubble.vx * cos + bubble.vy * sin;
            const vy1 = bubble.vy * cos - bubble.vx * sin;
            const vx2 = other.vx * cos + other.vy * sin;
            const vy2 = other.vy * cos - other.vx * sin;

            bubble.vx = vx2 * cos - vy1 * sin;
            bubble.vy = vy1 * cos + vx2 * sin;
            other.vx = vx1 * cos - vy2 * sin;
            other.vy = vy2 * cos + vx1 * sin;

            // Separate bubbles
            const overlap = (minDist - dist) / 2;
            bubble.x -= overlap * cos;
            bubble.y -= overlap * sin;
            other.x += overlap * cos;
            other.y += overlap * sin;
          }
        }

        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
      });

      // Update pop animations
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.popAnimation > 0) {
          bubble.popAnimation -= 0.1;
        }
      });

      // Update particles
      gameRef.current.particles = gameRef.current.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.05;
        return p.life > 0;
      });

      // Check for matches every 200ms
      if (Date.now() - lastCheckTime > 200) {
        checkMatches();
        replaceBubbles();
        lastCheckTime = Date.now();
      }

      // Draw bubbles
      gameRef.current.bubbles.forEach((bubble) => {
        if (bubble.matched && bubble.popAnimation <= 0) return;

        const scale = bubble.matched ? 1 - bubble.popAnimation : 1;
        const radius = bubble.radius * scale;
        const alpha = bubble.matched ? bubble.popAnimation : 1;

        ctx.globalAlpha = alpha;

        // Draw bubble
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha * 0.6;
        ctx.stroke();
        ctx.globalAlpha = alpha;

        // Dragging indicator
        if (bubble.isDragging) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      });

      // Draw particles
      gameRef.current.particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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
    gameRef.current.bubbles = [];
    gameRef.current.particles = [];
    gameRef.current.score = 0;
    gameRef.current.level = 1;
    gameRef.current.timeLeft = 60;
    gameRef.current.isPaused = false;
    gameRef.current.gameOver = false;
    gameRef.current.draggedBubble = null;

    // Reinitialize bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 80) + 40,
        y: Math.random() * (CANVAS_HEIGHT - 150) + 40,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 25,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        matched: false,
        isDragging: false,
        popAnimation: 0,
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
          className="w-full h-full bg-gradient-to-b from-purple-950/40 to-blue-950/40 cursor-grab active:cursor-grabbing"
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
