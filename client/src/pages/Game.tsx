import { useRef, useState, useEffect } from 'react';
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
  popAnimation: number;
  isPowerUp?: boolean;
  powerUpType?: 'bomb' | 'lightning' | 'freeze';
  isAnchored?: boolean;
  anchorTimeLeft?: number;
}

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameConfig {
  difficulty: 'easy' | 'normal' | 'hard';
  goalScore: number;
  timeLimit: number;
  bubbleCount: number;
}

const BUBBLE_COLORS = [
  '#00FF88', // green
  '#FF1493', // pink
  '#00BFFF', // cyan
  '#FFD700', // yellow
  '#FF6347', // red
];

const POWER_UP_COLORS = {
  bomb: '#FF0000',      // red for bomb
  lightning: '#FFD700', // gold for lightning
  freeze: '#00BFFF',    // cyan for freeze
};

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

export default function Game() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    difficulty: 'normal',
    goalScore: 600,
    timeLimit: 60,
    bubbleCount: 15,
  });

  const gameRef = useRef({
    bubbles: [] as Bubble[],
    particles: [] as PopParticle[],
    score: 0,
    level: 1,
    timeLeft: 60,
    isPaused: false,
    gameOver: false,
    levelComplete: false,
    animationId: 0,
    draggedBubble: null as Bubble | null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    freezeTimeLeft: 0,
    comboStreak: 0,
    lastMatchTime: 0,
    comboMultiplier: 1,
  });

  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    timeLeft: 60,
    goalScore: 600,
    isPaused: false,
    gameOver: false,
    levelComplete: false,
    comboStreak: 0,
    comboMultiplier: 1,
  });

  // Load game config from sessionStorage
  useEffect(() => {
    const configStr = sessionStorage.getItem('gameConfig');
    if (configStr) {
      const config: GameConfig = JSON.parse(configStr);
      setGameConfig(config);
      gameRef.current.timeLeft = config.timeLimit;
      gameRef.current.bubbles = [];

      // Initialize bubbles based on config
      const bubbles: Bubble[] = [];
      for (let i = 0; i < config.bubbleCount; i++) {
        bubbles.push({
          id: `bubble-${i}`,
          x: Math.random() * (CANVAS_WIDTH - 80) + 40,
          y: Math.random() * (CANVAS_HEIGHT - 150) + 40,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          radius: 25 - Math.min(gameRef.current.level * 1, 5),
          vx: (Math.random() - 0.5) * 3 * (1 + gameRef.current.level * 0.15),
          vy: (Math.random() - 0.5) * 3 * (1 + gameRef.current.level * 0.15),
          matched: false,
          isDragging: false,
          popAnimation: 0,
          isAnchored: false,
          anchorTimeLeft: 0,
        });
      }
      gameRef.current.bubbles = bubbles;
      setGameState({
        score: 0,
        level: 1,
        timeLeft: config.timeLimit,
        goalScore: config.goalScore,
        isPaused: false,
        gameOver: false,
        levelComplete: false,
        comboStreak: 0,
        comboMultiplier: 1,
      });
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameRef.current.isPaused || gameRef.current.timeLeft <= 0 || gameRef.current.gameOver || gameRef.current.levelComplete) return;

    const timer = setInterval(() => {
        gameRef.current.timeLeft = Math.max(0, gameRef.current.timeLeft - 1);

      // Check if goal reached
      if (gameRef.current.score >= gameState.goalScore && gameRef.current.timeLeft > 0) {
        gameRef.current.levelComplete = true;
        gameRef.current.isPaused = true;
        // Advance to next level with increased difficulty
        gameRef.current.level += 1;
        gameRef.current.score = 0;
        gameRef.current.timeLeft = gameState.timeLeft; // Reset timer
        // Increase bubble speed for next level
        gameRef.current.bubbles.forEach(bubble => {
          bubble.vx *= (1 + 0.15);
          bubble.vy *= (1 + 0.15);
        });
        setGameState(prev => ({ ...prev, levelComplete: true, isPaused: true, level: gameRef.current.level, comboStreak: 0, comboMultiplier: 1 }));
        return;
      }

      setGameState(prev => ({ ...prev, timeLeft: gameRef.current.timeLeft }));

      if (gameRef.current.timeLeft === 0) {
        gameRef.current.gameOver = true;
        gameRef.current.isPaused = true;
        setGameState(prev => ({ ...prev, gameOver: true, isPaused: true }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.goalScore]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Physics update
      if (!gameRef.current.isPaused && gameRef.current.freezeTimeLeft <= 0) {
        gameRef.current.bubbles.forEach(bubble => {
          // Update anchor timer
          if (bubble.isAnchored && bubble.anchorTimeLeft !== undefined) {
            bubble.anchorTimeLeft -= 16; // ~60fps
            if (bubble.anchorTimeLeft <= 0) {
              bubble.isAnchored = false;
              bubble.anchorTimeLeft = 0;
            }
          }

          if (!bubble.isDragging && !bubble.matched && !bubble.isAnchored) {
            bubble.x += bubble.vx;
            bubble.y += bubble.vy;

            // Bounce off walls
            if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > CANVAS_WIDTH) {
              bubble.vx *= -0.8;
              bubble.x = Math.max(bubble.radius, Math.min(CANVAS_WIDTH - bubble.radius, bubble.x));
            }
            if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > CANVAS_HEIGHT) {
              bubble.vy *= -0.8;
              bubble.y = Math.max(bubble.radius, Math.min(CANVAS_HEIGHT - bubble.radius, bubble.y));
            }
          }
        });
      } else if (gameRef.current.freezeTimeLeft > 0) {
        gameRef.current.freezeTimeLeft -= 16; // ~60fps
      }

      // Check for matches
      checkMatches();

      // Update particles
      gameRef.current.particles = gameRef.current.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        return p.life > 0;
      });

      // Update pop animations
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.popAnimation > 0) {
          bubble.popAnimation -= 0.05;
        }
      });

      // Draw
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bubbles
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.matched && bubble.popAnimation <= 0) return;

        const scale = 1 - bubble.popAnimation * 0.5;
        const radius = bubble.radius * scale;

        // Bubble glow
        const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, radius + 5);
        gradient.addColorStop(0, bubble.color + '80');
        gradient.addColorStop(1, bubble.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, radius + 5, 0, Math.PI * 2);
        ctx.fill();

        // Bubble body
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Power-up indicator (star or symbol)
        if (bubble.isPowerUp) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const symbol = bubble.powerUpType === 'bomb' ? '💣' : bubble.powerUpType === 'lightning' ? '⚡' : '❄️';
          ctx.fillText(symbol, bubble.x, bubble.y);
        }
      });

      // Draw particles
      gameRef.current.particles.forEach(particle => {
        ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      gameRef.current.animationId = requestAnimationFrame(animate);
    };

    gameRef.current.animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(gameRef.current.animationId);
  }, []);

  // Mouse/Touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = ((e instanceof TouchEvent ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX;
      const y = ((e instanceof TouchEvent ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY;

      for (let bubble of gameRef.current.bubbles) {
        if (bubble.matched) continue;
        const dist = Math.sqrt((bubble.x - x) ** 2 + (bubble.y - y) ** 2);
        // Increased drag radius by 1.5x for easier grabbing
        if (dist < bubble.radius * 1.5) {
          gameRef.current.draggedBubble = bubble;
          gameRef.current.dragOffsetX = x - bubble.x;
          gameRef.current.dragOffsetY = y - bubble.y;
          bubble.isDragging = true;
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!gameRef.current.draggedBubble) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = ((e instanceof TouchEvent ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX;
      const y = ((e instanceof TouchEvent ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY;

      gameRef.current.draggedBubble.x = x - gameRef.current.dragOffsetX;
      gameRef.current.draggedBubble.y = y - gameRef.current.dragOffsetY;
    };

    const handleMouseUp = () => {
      if (gameRef.current.draggedBubble) {
        // Anchor the bubble in place for 3 seconds
        gameRef.current.draggedBubble.isDragging = false;
        gameRef.current.draggedBubble.isAnchored = true;
        gameRef.current.draggedBubble.anchorTimeLeft = 3000; // 3 seconds in milliseconds
        gameRef.current.draggedBubble = null;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const createPopParticles = (bubble: Bubble, matchSize: number) => {
    // Enhanced particle effects for larger matches
    let particleCount = 8 + matchSize * 3;
    let speed = 2 + matchSize * 0.5;
    
    // Max explosion for 5+ bubble matches
    if (matchSize >= 5) {
      particleCount = 80; // Maximum particles
      speed = 4 + matchSize * 0.8; // Faster particle speed
    } else if (matchSize === 4) {
      particleCount = 50; // Large explosion
      speed = 3.5 + matchSize * 0.6;
    }
    
    particleCount = Math.min(particleCount, 100);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const randomSpeed = speed + Math.random() * 2;
      gameRef.current.particles.push({
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * randomSpeed,
        vy: Math.sin(angle) * randomSpeed,
        life: 1,
        color: bubble.color,
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    const powerUpTypes: Array<'bomb' | 'lightning' | 'freeze'> = ['bomb', 'lightning', 'freeze'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    gameRef.current.bubbles.push({
      id: `powerup-${Date.now()}`,
      x,
      y,
      color: POWER_UP_COLORS[type],
      radius: 25,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      matched: false,
      isDragging: false,
      popAnimation: 0,
      isPowerUp: true,
      powerUpType: type,
      isAnchored: false,
      anchorTimeLeft: 0,
    });
  };

  const activatePowerUp = (powerUp: Bubble) => {
    if (powerUp.powerUpType === 'bomb') {
      // Bomb: clear all bubbles in radius
      const BOMB_RADIUS = 100;
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.matched || bubble === powerUp) return;
        const dist = Math.sqrt((bubble.x - powerUp.x) ** 2 + (bubble.y - powerUp.y) ** 2);
        if (dist < BOMB_RADIUS) {
          bubble.matched = true;
          bubble.popAnimation = 1;
          createPopParticles(bubble, 1);
          gameRef.current.score += 50;
        }
      });
    } else if (powerUp.powerUpType === 'lightning') {
      // Lightning: clear all bubbles of same color
      const targetColor = powerUp.color;
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.matched || bubble === powerUp) return;
        if (bubble.color === targetColor) {
          bubble.matched = true;
          bubble.popAnimation = 1;
          createPopParticles(bubble, 1);
          gameRef.current.score += 50;
        }
      });
    } else if (powerUp.powerUpType === 'freeze') {
      // Freeze: pause all bubbles for 3 seconds
      gameRef.current.freezeTimeLeft = 3000; // 3 seconds
    }

    powerUp.matched = true;
    powerUp.popAnimation = 1;
    createPopParticles(powerUp, 1);
    gameRef.current.score += 200; // Bonus for using power-up
    setGameState(prev => ({ ...prev, score: gameRef.current.score, comboStreak: 0, comboMultiplier: 1 }));
  };

  const checkMatches = () => {
    const bubbles = gameRef.current.bubbles.filter(b => !b.matched);

    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      const connected = new Set<Bubble>();
      const stack = [bubble];

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

      if (connected.size >= 3) {
        const matchSize = connected.size;
        let points = 0;
        if (matchSize === 3) points = 30;
        else if (matchSize === 4) points = 80; // Increased from 60
        else if (matchSize === 5) points = 150; // Increased from 100
        else if (matchSize === 6) points = 250; // 6 bubbles
        else points = 50 * matchSize; // Scale for 7+
        
        connected.forEach(b => {
          b.matched = true;
          b.popAnimation = 1 + (matchSize - 3) * 0.2;
          createPopParticles(b, matchSize);
        });

        // Spawn power-up if match is 5+ bubbles
        if (matchSize >= 5) {
          const centerX = Array.from(connected).reduce((sum, b) => sum + b.x, 0) / connected.size;
          const centerY = Array.from(connected).reduce((sum, b) => sum + b.y, 0) / connected.size;
          spawnPowerUp(centerX, centerY);
        }

        // Check combo streak (matches within 2 seconds)
        const currentTime = Date.now();
        if (currentTime - gameRef.current.lastMatchTime < 2000) {
          gameRef.current.comboStreak += 1;
          gameRef.current.comboMultiplier = Math.min(1 + gameRef.current.comboStreak * 0.5, 4);
        } else {
          gameRef.current.comboStreak = 1;
          gameRef.current.comboMultiplier = 1;
        }
        gameRef.current.lastMatchTime = currentTime;
        
        // Apply combo multiplier to points
        const multipliedPoints = Math.floor(points * gameRef.current.comboMultiplier);
        
        gameRef.current.score += multipliedPoints;
        setGameState(prev => ({ ...prev, score: gameRef.current.score, comboStreak: gameRef.current.comboStreak, comboMultiplier: gameRef.current.comboMultiplier }));
      }
    }

    // Check for power-up matches
    const powerUps = gameRef.current.bubbles.filter(b => b.isPowerUp && !b.matched);
    for (let powerUp of powerUps) {
      const connected = new Set<Bubble>();
      const stack = [powerUp];

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (connected.has(current)) continue;
        connected.add(current);

        for (let bubble of gameRef.current.bubbles) {
          if (bubble.matched || bubble.isPowerUp || connected.has(bubble)) continue;
          if (bubble.color === powerUp.color) {
            const dist = Math.sqrt((current.x - bubble.x) ** 2 + (current.y - bubble.y) ** 2);
            if (dist < current.radius + bubble.radius + 5) {
              stack.push(bubble);
            }
          }
        }
      }

      if (connected.size >= 2) {
        connected.forEach(b => {
          b.matched = true;
          b.popAnimation = 1;
          createPopParticles(b, 1);
        });
        activatePowerUp(powerUp);
      }
    }
  };

  const replaceBubbles = () => {
    gameRef.current.bubbles.forEach((bubble, index) => {
      if (bubble.matched && bubble.popAnimation <= 0) {
        const newBubble: Bubble = {
          id: `bubble-${Date.now()}-${index}`,
          x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 50,
          y: -30,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          radius: 25,
          vx: (Math.random() - 0.5) * 2,
          vy: 2,
          matched: false,
          isDragging: false,
          popAnimation: 0,
          isAnchored: false,
          anchorTimeLeft: 0,
        };
        gameRef.current.bubbles[index] = newBubble;
      }
    });
  };

  const handlePause = () => {
    gameRef.current.isPaused = !gameRef.current.isPaused;
    setGameState(prev => ({ ...prev, isPaused: gameRef.current.isPaused }));
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleNextLevel = () => {
    // Reset game state for next level
    gameRef.current.bubbles = [];
    gameRef.current.particles = [];
    gameRef.current.score = 0;
    gameRef.current.timeLeft = gameState.timeLeft;
    gameRef.current.isPaused = false;
    gameRef.current.gameOver = false;
    gameRef.current.levelComplete = false;
    gameRef.current.comboStreak = 0;
    gameRef.current.lastMatchTime = 0;
    gameRef.current.comboMultiplier = 1;
    gameRef.current.freezeTimeLeft = 0;

    // Spawn bubbles for next level with increased count and speed
    const bubbleCount = gameConfig.bubbleCount + gameRef.current.level;
    for (let i = 0; i < bubbleCount; i++) {
      const speedMultiplier = 1 + gameRef.current.level * 0.15;
      const radiusMultiplier = Math.max(0.6, 1 - gameRef.current.level * 0.1); // Shrink by 10% per level, min 60% of original
      const bubble: Bubble = {
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: 15 * radiusMultiplier,
        vx: (Math.random() - 0.5) * 4 * speedMultiplier,
        vy: (Math.random() - 0.5) * 4 * speedMultiplier,
        matched: false,
        isDragging: false,
        popAnimation: 0,
        isAnchored: false,
        anchorTimeLeft: 0,
      };
      gameRef.current.bubbles.push(bubble);
    }

    setGameState(prev => ({
      ...prev,
      score: 0,
      level: gameRef.current.level,
      timeLeft: gameState.timeLeft,
      levelComplete: false,
      isPaused: false,
      comboStreak: 0,
      comboMultiplier: 1,
    }));
  };

  const getTimerColor = () => {
    if (gameState.timeLeft > 30) return 'text-neon-green';
    if (gameState.timeLeft > 10) return 'text-neon-orange';
    return 'text-neon-red';
  };

  const getProgressPercentage = () => {
    return Math.min(100, (gameState.score / gameState.goalScore) * 100);
  };

  // Call replaceBubbles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      replaceBubbles();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="flex flex-col bg-slate-900 rounded-lg overflow-hidden shadow-2xl" style={{ width: '360px', height: '640px', maxWidth: '100vw', maxHeight: '100vh' }}>
        {/* HUD */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="text-center flex-1">
            <div className="text-xs text-slate-400">Level</div>
            <div className="text-lg font-bold text-neon-green">{gameState.level}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs text-slate-400">Score</div>
            <div className="text-lg font-bold text-neon-cyan">{gameState.score}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs text-slate-400">Goal: {gameState.goalScore}</div>
            <div className="text-lg font-bold text-neon-pink">{gameState.timeLeft}s</div>
          </div>
          {gameState.comboStreak > 0 && (
            <div className="text-center flex-1">
              <div className="text-xs text-neon-yellow">COMBO x{gameState.comboMultiplier.toFixed(1)}</div>
              <div className="text-lg font-bold text-neon-yellow">{gameState.comboStreak}</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-t border-slate-700">
          <Button
            onClick={handlePause}
            size="sm"
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-slate-900 font-bold"
          >
            <Pause className="w-4 h-4 mr-1" />
            {gameRef.current.isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            onClick={handleHome}
            size="sm"
            className="bg-neon-pink hover:bg-neon-pink/80 text-slate-900 font-bold"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Button>
        </div>

        {/* Game Over / Level Complete */}
        {(gameState.gameOver || gameState.levelComplete) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-slate-900 border-2 border-neon-cyan rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-neon-cyan mb-2">
                {gameState.levelComplete ? '🎉 Level Complete!' : '💀 Game Over'}
              </h2>
              <p className="text-neon-green mb-4">Final Score: {gameState.score}</p>
              {gameState.levelComplete && (
                <p className="text-neon-pink mb-4 text-lg font-bold">Level {gameState.level} Completed!</p>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                {gameState.levelComplete && (
                  <Button
                    onClick={handleNextLevel}
                    className="bg-neon-green hover:bg-neon-green/80 text-slate-900 font-bold"
                  >
                    Next Level →
                  </Button>
                )}
                <Button
                  onClick={handleHome}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-slate-900 font-bold"
                >
                  Back to Menu
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pause Screen */}
        {gameState.isPaused && !gameState.gameOver && !gameState.levelComplete && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-slate-900 border-2 border-neon-pink rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-neon-pink mb-4">⏸️ Paused</h2>
              <Button
                onClick={handlePause}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-slate-900 font-bold"
              >
                Resume Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
