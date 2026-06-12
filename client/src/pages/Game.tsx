import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAudioContext } from '@/hooks/useAudioContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { saveGameProgress, loadGameProgress, clearGameProgress, hasGameProgress } from '@/lib/gameSave';
import { createPowerUpParticles, drawPowerUpParticles, createScreenFlash, drawScreenFlash, playPowerUpSound, createBombShockwave, drawBombShockwave, createLightningBolt, drawLightningBolt } from '@/lib/powerupEffects';
import { createMatchParticles, createScorePopup, updateMatchParticles, updateScorePopups, drawMatchParticles, drawScorePopups, playMatchSound, MatchParticle, ScorePopup } from '@/lib/matchFeedback';
import { triggerHapticFeedback } from '@/lib/hapticFeedback';
import { createCosmicExplosion, updateCosmicParticles, drawCosmicParticles, CosmicParticle } from '@/lib/cosmicExplosion';
import { Leaderboard } from '@/components/Leaderboard';
import { InventoryPanel } from '@/components/InventoryPanel';
import { RewardChoiceModal } from '@/components/RewardChoiceModal';
import { loadInventory, usePowerUp, addPowerUp, InventoryState } from '@/lib/inventory';
import { getLevelConfig, getDifficultyDescription, isMilestoneLevel, getMilestoneMessage } from '@/lib/levelProgression';

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
  isStickingBubble?: boolean;
  isBombBubble?: boolean;
  bombPulseTime?: number;
  bombExplodeTime?: number;
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
  bubbleRadius: number;
  bubbleSpeed: number;
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

const LEVEL_BACKGROUNDS = [
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/level-bg-1-dp9CL7UNVYwDwJ9xRcYt6p.webp',
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/level-bg-2-isiZ4VuDAaAQM8jZH22Z9P.webp',
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/level-bg-3-66JaVg5Wbwf648oHNGsQqx.webp',
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/level-bg-4-74VTmsCh7EHpsVhZ3ix7TQ.webp',
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/level-bg-5-cEQincwAQgHB2oLbriJoC7.webp',
];

const getBackgroundForLevel = (level: number): string => {
  const bgIndex = Math.min(Math.floor((level - 1) / 5), LEVEL_BACKGROUNDS.length - 1);
  return LEVEL_BACKGROUNDS[bgIndex];
};

export default function Game() {
  const [, navigate] = useLocation();
  const { play: playMusic } = useAudioContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentBackground, setCurrentBackground] = useState(getBackgroundForLevel(1));
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    difficulty: 'normal',
    goalScore: 300,
    timeLimit: 60,
    bubbleRadius: 25,
    bubbleSpeed: 1.0,
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
    powerUpParticles: [] as any[],
    screenFlash: null as any,
    bombShockwaves: [] as any[],
    lightningBolts: [] as any[],
    matchParticles: [] as MatchParticle[],
    scorePopups: [] as ScorePopup[],
    cosmicExplosions: [] as CosmicParticle[],
    matchDetectionDelay: 1.5, // Delay in seconds before allowing matches
    levelStartTime: 0,
  });

  const initialLevelConfig = getLevelConfig(1);
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    timeLeft: 60,
    goalScore: initialLevelConfig.goalScore,
    isPaused: false,
    gameOver: false,
    levelComplete: false,
    comboStreak: 0,
    comboMultiplier: 1,
  });

  // Update gameConfig when level changes
  useEffect(() => {
    const levelConfig = getLevelConfig(gameState.level);
    setGameConfig({
      difficulty: 'normal',
      goalScore: levelConfig.goalScore,
      timeLimit: 60,
      bubbleRadius: levelConfig.bubbleRadius,
      bubbleSpeed: levelConfig.bubbleSpeed,
      bubbleCount: levelConfig.bubbleCount,
    });
    setGameState(prev => ({
      ...prev,
      goalScore: levelConfig.goalScore,
    }));
    setCurrentBackground(getBackgroundForLevel(gameState.level));
  }, [gameState.level]);

  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [inventory, setInventory] = useState<InventoryState>(loadInventory());
  const [timeSlowActive, setTimeSlowActive] = useState(false);
  const [timeSlowTimeLeft, setTimeSlowTimeLeft] = useState(0);
  const [hasUsedExtraTimeAd, setHasUsedExtraTimeAd] = useState(false);
  const [hasUsedReplayAd, setHasUsedReplayAd] = useState(false);
  const [showReplayAdOption, setShowReplayAdOption] = useState(false);

  // Start background music on component mount
  useEffect(() => {
    playMusic();
  }, [playMusic]);

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
      const levelConfig = getLevelConfig(gameRef.current.level);
      for (let i = 0; i < config.bubbleCount; i++) {
        bubbles.push({
          id: `bubble-${i}`,
          x: Math.random() * (CANVAS_WIDTH - 80) + 40,
          y: Math.random() * (CANVAS_HEIGHT - 150) + 40,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          // Use dynamic radius from level config
          radius: config.bubbleRadius,
          // Use dynamic speed from level config
          vx: (Math.random() - 0.5) * 3 * config.bubbleSpeed,
          vy: (Math.random() - 0.5) * 3 * config.bubbleSpeed,
          matched: false,
          isDragging: false,
          popAnimation: 0,
          isAnchored: false,
          anchorTimeLeft: 0,
        });
      }
      gameRef.current.bubbles = bubbles;
      gameRef.current.levelStartTime = Date.now(); // Set level start time for match delay
      setGameState({
        score: 0,
        level: gameRef.current.level,
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
        setGameState(prev => ({ ...prev, levelComplete: true, isPaused: true, comboStreak: 0, comboMultiplier: 1 }));
        return;
      }

      setGameState(prev => ({ ...prev, timeLeft: gameRef.current.timeLeft }));

      if (gameRef.current.timeLeft === 0) {
        gameRef.current.gameOver = true;
        gameRef.current.isPaused = true;
        // Show replay option if Extra Time ad was already used
        if (hasUsedExtraTimeAd && !hasUsedReplayAd) {
          setShowReplayAdOption(true);
        }
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
          // Update bomb bubble countdown and explosion
          if (bubble.isBombBubble && bubble.bombExplodeTime !== undefined) {
            bubble.bombExplodeTime -= 16; // ~60fps
            if (bubble.bombExplodeTime <= 0) {
              // Bomb explodes - destroy nearby bubbles and award bonus points
              const BOMB_RADIUS = 80;
              let destroyedCount = 0;
              
              gameRef.current.bubbles.forEach(otherBubble => {
                if (otherBubble.matched || otherBubble === bubble) return;
                const dist = Math.sqrt((otherBubble.x - bubble.x) ** 2 + (otherBubble.y - bubble.y) ** 2);
                if (dist < BOMB_RADIUS) {
                  otherBubble.matched = true;
                  otherBubble.popAnimation = 1;
                  createPopParticles(otherBubble, 1);
                  destroyedCount += 1;
                  // Award bonus points for each destroyed bubble
                  gameRef.current.score += 75; // Bonus points per destroyed bubble
                }
              });
              
              // Mark bomb as matched
              bubble.matched = true;
              bubble.popAnimation = 1;
              createPopParticles(bubble, 1);
              
              // Create explosion particles
              const cosmicParticles = createCosmicExplosion(bubble.x, bubble.y, '#FF8C00');
              gameRef.current.cosmicExplosions.push(...cosmicParticles);
              
              setGameState(prev => ({ ...prev, score: gameRef.current.score }));
            }
          }
          
          // Update anchor timer
          if (bubble.isAnchored && bubble.anchorTimeLeft !== undefined) {
            bubble.anchorTimeLeft -= 16; // ~60fps
            if (bubble.anchorTimeLeft <= 0) {
              bubble.isAnchored = false;
              bubble.anchorTimeLeft = 0;
            }
          }

          if (!bubble.isDragging && !bubble.matched && !bubble.isAnchored) {
            // Apply time-slow effect (reduce velocity by 70%)
            const velocityMultiplier = timeSlowActive ? 0.3 : 1;
            bubble.x += bubble.vx * velocityMultiplier;
            bubble.y += bubble.vy * velocityMultiplier;

            // Bounce off walls with stricter constraints
            const BOUNDARY_PADDING = 3;
            if (bubble.x - bubble.radius < BOUNDARY_PADDING || bubble.x + bubble.radius > CANVAS_WIDTH - BOUNDARY_PADDING) {
              bubble.vx *= -0.8;
              bubble.x = Math.max(bubble.radius + BOUNDARY_PADDING, Math.min(CANVAS_WIDTH - bubble.radius - BOUNDARY_PADDING, bubble.x));
            }
            if (bubble.y - bubble.radius < BOUNDARY_PADDING || bubble.y + bubble.radius > CANVAS_HEIGHT - BOUNDARY_PADDING) {
              bubble.vy *= -0.8;
              bubble.y = Math.max(bubble.radius + BOUNDARY_PADDING, Math.min(CANVAS_HEIGHT - bubble.radius - BOUNDARY_PADDING, bubble.y));
            }
          }
        });
      } else if (gameRef.current.freezeTimeLeft > 0) {
        gameRef.current.freezeTimeLeft -= 16; // ~60fps
      }

      // Update time-slow effect
      if (timeSlowActive && timeSlowTimeLeft > 0) {
        setTimeSlowTimeLeft(prev => Math.max(0, prev - 16));
      } else if (timeSlowTimeLeft <= 0 && timeSlowActive) {
        setTimeSlowActive(false);
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

      // Update cosmic explosions
      updateCosmicParticles(gameRef.current.cosmicExplosions, 16); // ~60fps
      gameRef.current.cosmicExplosions = gameRef.current.cosmicExplosions.filter(p => p.life > 0);

      // Update pop animations
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.popAnimation > 0) {
          bubble.popAnimation -= 0.05;
        }
      });

      // Update match particles
      gameRef.current.matchParticles = updateMatchParticles(gameRef.current.matchParticles, 0.016);

      // Update score popups
      gameRef.current.scorePopups = updateScorePopups(gameRef.current.scorePopups, 0.016);

      // Draw - Clear canvas with transparency to show background
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Border removed for cleaner visuals

      // Draw bubbles
      gameRef.current.bubbles.forEach(bubble => {
        if (bubble.matched && bubble.popAnimation <= 0) return;

        const scale = 1 - bubble.popAnimation * 0.5;
        const radius = bubble.radius * scale;

        // Sticking Bubble - enhanced glow effect
        if (bubble.isStickingBubble) {
          // Multiple glow rings for intense effect
          ctx.shadowColor = '#00FF00';
          ctx.shadowBlur = 25;
          for (let i = 0; i < 3; i++) {
            const glowRadius = radius + (i + 1) * 8;
            const glowGradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, glowRadius);
            glowGradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
            glowGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else {
          // Regular bubble glow
          const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, radius + 5);
          gradient.addColorStop(0, bubble.color + '80');
          gradient.addColorStop(1, bubble.color + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, radius + 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bubble body
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Bomb Bubble with pulsing effect
        if (bubble.isBombBubble && bubble.bombPulseTime !== undefined && bubble.bombExplodeTime !== undefined) {
          // Update pulse time
          bubble.bombPulseTime += 16;
          const pulsePhase = (bubble.bombPulseTime / 500) % 1; // Pulse every 500ms
          const pulseScale = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.15; // Pulse between 0.85 and 1.15
          
          // Draw pulsing orange glow
          ctx.shadowColor = '#FF8C00';
          ctx.shadowBlur = 15 + pulseScale * 10;
          for (let i = 0; i < 2; i++) {
            const glowRadius = radius * pulseScale + i * 6;
            const glowGradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, glowRadius);
            glowGradient.addColorStop(0, 'rgba(255, 140, 0, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          
          // Draw bomb indicator
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#FF8C00';
          ctx.shadowBlur = 8;
          ctx.fillText('💣', bubble.x, bubble.y);
          ctx.shadowBlur = 0;
        }
        // Sticking Bubble indicator with special glow
        else if (bubble.isStickingBubble) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#00FF00';
          ctx.shadowBlur = 8;
          ctx.fillText('🧼', bubble.x, bubble.y);
          ctx.shadowBlur = 0;
        }
        // Power-up indicator (star or symbol)
        else if (bubble.isPowerUp) {
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

      // Draw cosmic explosions
      drawCosmicParticles(ctx, gameRef.current.cosmicExplosions);

      // Draw power-up effects
      // Draw power-up particles
      drawPowerUpParticles(ctx, gameRef.current.powerUpParticles);
      gameRef.current.powerUpParticles = gameRef.current.powerUpParticles.filter(p => p.life > 0);

      // Draw screen flash
      if (gameRef.current.screenFlash) {
        const stillActive = drawScreenFlash(ctx, gameRef.current.screenFlash, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (!stillActive) gameRef.current.screenFlash = null;
      }

      // Draw bomb shockwaves
      gameRef.current.bombShockwaves = gameRef.current.bombShockwaves.filter(shockwave => {
        return drawBombShockwave(ctx, shockwave);
      });

      // Draw lightning bolts
      gameRef.current.lightningBolts = gameRef.current.lightningBolts.filter(bolt => {
        return drawLightningBolt(ctx, bolt);
      });

      // Draw match particles
      drawMatchParticles(ctx, gameRef.current.matchParticles);

      // Draw score popups
      drawScorePopups(ctx, gameRef.current.scorePopups);

      // Draw time-slow indicator
      if (timeSlowActive && timeSlowTimeLeft > 0) {
        const timeLeftSeconds = Math.ceil(timeSlowTimeLeft / 1000);
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 191, 255, 0.1)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw glowing background for timer
        const timerX = CANVAS_WIDTH / 2;
        const timerY = 50;
        const timerWidth = 140;
        const timerHeight = 50;
        
        // Glow effect
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0, 191, 255, 0.2)';
        ctx.fillRect(timerX - timerWidth / 2, timerY - timerHeight / 2, timerWidth, timerHeight);
        ctx.shadowBlur = 0;
        
        // Draw border
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(timerX - timerWidth / 2, timerY - timerHeight / 2, timerWidth, timerHeight);
        
        // Draw timer text with glow
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00BFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⏳ ${timeLeftSeconds}s`, timerX, timerY);
        ctx.shadowBlur = 0;
      }

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
    // Play power-up sound
    playPowerUpSound(powerUp.powerUpType as any);
    
    // Create screen flash effect
    gameRef.current.screenFlash = createScreenFlash(powerUp.powerUpType as any, 300);
    
    // Create particle burst
    const particles = createPowerUpParticles(powerUp.powerUpType as any, powerUp.x, powerUp.y, 16);
    gameRef.current.powerUpParticles.push(...particles);
    
    if (powerUp.powerUpType === 'bomb') {
      // Bomb: clear all bubbles in radius
      const BOMB_RADIUS = 100;
      
      // Create bomb shockwave effect
      gameRef.current.bombShockwaves.push(createBombShockwave(powerUp.x, powerUp.y, BOMB_RADIUS));
      
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
      
      // Create lightning bolts to random matching bubbles
      const matchingBubbles = gameRef.current.bubbles.filter(b => !b.matched && b !== powerUp && b.color === targetColor);
      matchingBubbles.slice(0, 3).forEach(bubble => {
        gameRef.current.lightningBolts.push(createLightningBolt(powerUp.x, powerUp.y, bubble.x, bubble.y));
      });
      
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
    // Prevent matches during the initial delay period
    const elapsedTime = (Date.now() - gameRef.current.levelStartTime) / 1000;
    if (elapsedTime < gameRef.current.matchDetectionDelay) {
      return; // Skip match detection during delay
    }

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
          if (connected.has(other)) continue;
          
          // Sticking bubble matches any color
          const isColorMatch = other.color === current.color || current.isStickingBubble || other.isStickingBubble;
          if (!isColorMatch) continue;

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
        
        // Play galaxy/cosmic match sound and trigger haptic feedback
        playMatchSound('/manus-storage/galaxy-match-sound_f8d604f8.wav', 0.8);
        triggerHapticFeedback('match');
        
        connected.forEach(b => {
          b.matched = true;
          b.popAnimation = 1 + (matchSize - 3) * 0.2;
          createPopParticles(b, matchSize);
          // Create cosmic explosion effect
          const cosmicParticles = createCosmicExplosion(b.x, b.y, b.color);
          gameRef.current.cosmicExplosions.push(...cosmicParticles);
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
    // Save progress when pausing
    if (gameRef.current.isPaused && !gameState.gameOver && !gameState.levelComplete) {
      saveGameProgress({
        level: gameState.level,
        score: gameState.score,
        timeLeft: gameState.timeLeft,
        goalScore: gameState.goalScore,
        bubbleCount: gameConfig.bubbleCount,
        difficulty: gameConfig.difficulty,
        timestamp: Date.now(),
      });
      setHasUnsavedProgress(true);
    }
  };

  const handleHome = () => {
    // Check if there's active game progress that would be lost
    const hasActiveProgress = (gameState.score > 0 || gameState.timeLeft < gameConfig.timeLimit) && 
                             !gameState.gameOver && 
                             !gameState.levelComplete;
    
    if (hasUnsavedProgress || hasActiveProgress) {
      setShowLeaveConfirm(true);
    } else {
      navigate('/');
    }
  };

  const handleConfirmLeave = () => {
    clearGameProgress();
    setHasUnsavedProgress(false);
    setShowLeaveConfirm(false);
    navigate('/');
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  const handleUseTimeSlow = () => {
    if (usePowerUp('timeSlow')) {
      setTimeSlowActive(true);
      setTimeSlowTimeLeft(15000); // 15 seconds in milliseconds
      setInventory(loadInventory());
    }
  };

  const handleUseStickingBubble = () => {
    if (usePowerUp('stickingBubble')) {
      // Spawn sticking bubble at center of canvas
      const stickingBubble: Bubble = {
        id: `sticking-${Date.now()}`,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        color: '#FF00FF', // Magenta wildcard color
        radius: 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        matched: false,
        isDragging: false,
        popAnimation: 0,
        isPowerUp: true,
        powerUpType: 'bomb', // Use bomb type for visual indicator
        isAnchored: false,
        isStickingBubble: true, // Mark as sticking bubble wildcard
      };
      gameRef.current.bubbles.push(stickingBubble);
      setInventory(loadInventory());
    }
  };

  const handleUseBombBubble = () => {
    if (usePowerUp('bombBubble')) {
      // Spawn bomb bubble at center of canvas
      const bombBubble: Bubble = {
        id: `bomb-${Date.now()}`,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        color: '#FF8C00', // Dark orange
        radius: 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        matched: false,
        isDragging: false,
        popAnimation: 0,
        isPowerUp: true,
        powerUpType: 'bomb',
        isAnchored: false,
        isBombBubble: true,
        bombPulseTime: 0,
        bombExplodeTime: 3000, // Explode after 3 seconds
      };
      gameRef.current.bubbles.push(bombBubble);
      setInventory(loadInventory());
    }
  };

  const handleRewardSelected = async (reward: 'extraTime' | 'timeSlow' | 'stickingBubble' | 'bombBubble' | 'replay') => {
    if (reward === 'timeSlow') {
      const updatedInventory = addPowerUp('timeSlow', 1);
      setInventory(updatedInventory);
    } else if (reward === 'stickingBubble') {
      const updatedInventory = addPowerUp('stickingBubble', 1);
      setInventory(updatedInventory);
    } else if (reward === 'bombBubble') {
      const updatedInventory = addPowerUp('bombBubble', 1);
      setInventory(updatedInventory);
    } else if (reward === 'extraTime') {
      // Extra time: add 30 seconds to current level
      gameRef.current.timeLeft += 30;
      setGameState(prev => ({ ...prev, timeLeft: gameRef.current.timeLeft }));
      setHasUsedExtraTimeAd(true);
    } else if (reward === 'replay') {
      // Replay level: reset game state
      gameRef.current.bubbles = [];
      gameRef.current.particles = [];
      gameRef.current.score = 0;
      gameRef.current.timeLeft = gameConfig.timeLimit;
      gameRef.current.isPaused = false;
      gameRef.current.gameOver = false;
      gameRef.current.levelComplete = false;
      gameRef.current.comboStreak = 0;
      gameRef.current.lastMatchTime = 0;
      gameRef.current.comboMultiplier = 1;
      gameRef.current.freezeTimeLeft = 0;
      gameRef.current.levelStartTime = Date.now();
      
      // Spawn bubbles for replay
      const bubbleCount = gameConfig.bubbleCount + gameRef.current.level;
      for (let i = 0; i < bubbleCount; i++) {
        const speedMultiplier = 1 + gameRef.current.level * 0.15;
        const radius = gameRef.current.level >= 80 ? Math.max(15, 25 - (gameRef.current.level - 80) * 0.3) : 25;
        const bubble: Bubble = {
          id: `bubble-${i}`,
          x: Math.random() * (CANVAS_WIDTH - 60) + 30,
          y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          radius: radius,
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
      
      setGameState(prev => ({ ...prev, gameOver: false, score: 0, timeLeft: gameConfig.timeLimit }));
      setHasUsedReplayAd(true);
      setShowReplayAdOption(false);
    }
    setShowRewardModal(false);
  };

  const handleNextLevel = () => {
    // Increment level
    gameRef.current.level += 1;
    
    // Calculate goal based on level (easier early, harder later)
    let newGoal = 300; // Base goal for level 1
    if (gameRef.current.level <= 5) {
      newGoal = 300 + (gameRef.current.level - 1) * 50; // Levels 1-5: 300, 350, 400, 450, 500
    } else if (gameRef.current.level <= 10) {
      newGoal = 550 + (gameRef.current.level - 6) * 100; // Levels 6-10: 550, 650, 750, 850, 950
    } else {
      newGoal = 1450 + (gameRef.current.level - 11) * 150; // Levels 11+: 1450, 1600, 1750...
    }
    
    // Update game config with new goal
    setGameConfig(prev => ({ ...prev, goalScore: newGoal }));
    
    // Reset game state for next level
    gameRef.current.bubbles = [];
    gameRef.current.particles = [];
    gameRef.current.score = 0;
    gameRef.current.timeLeft = gameConfig.timeLimit; // Reset to full time limit
    gameRef.current.isPaused = false;
    gameRef.current.gameOver = false;
    gameRef.current.levelComplete = false;
    gameRef.current.comboStreak = 0;
    gameRef.current.lastMatchTime = 0;
    gameRef.current.comboMultiplier = 1;
    gameRef.current.freezeTimeLeft = 0;
    gameRef.current.levelStartTime = Date.now(); // Set level start time for match delay

    // Spawn bubbles for next level with increased count and speed
    const bubbleCount = gameConfig.bubbleCount + gameRef.current.level;
    for (let i = 0; i < bubbleCount; i++) {
      const speedMultiplier = 1 + gameRef.current.level * 0.15;
      // Bubbles stay at full size until level 80, then shrink
      const radius = gameRef.current.level >= 80 ? Math.max(15, 25 - (gameRef.current.level - 80) * 0.3) : 25;
      const bubble: Bubble = {
        id: `bubble-${i}`,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        radius: radius,
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
      timeLeft: gameConfig.timeLimit, // Reset to full time limit
      levelComplete: false,
      gameOver: false,
      isPaused: false,
      comboStreak: 0,
      comboMultiplier: 1,
      goalScore: newGoal,
    }));

    // Update background every 5 levels
    setCurrentBackground(getBackgroundForLevel(gameRef.current.level));
    
    // Reset ad usage for new level
    setHasUsedExtraTimeAd(false);
    setHasUsedReplayAd(false);
    setShowReplayAdOption(false);
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
    <div className="game-container">
      <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden">
        {/* HUD */}
        <div className="hud-top bg-slate-800 border-b border-slate-700 flex justify-between items-center">
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
        <div 
          className="game-canvas bg-cover bg-center"
          style={{
            backgroundImage: `url('${currentBackground}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better visibility */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain relative z-10"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        </div>

        {/* Controls */}
        <div className="control-bar bg-slate-800 border-t border-slate-700 flex justify-center gap-4">
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
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-neon-cyan rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-neon-cyan mb-2">
                {gameState.levelComplete ? '🎉 Level Complete!' : '💀 Game Over'}
              </h2>
              <p className="text-neon-green mb-4">Final Score: {gameState.score}</p>
              {gameState.levelComplete && (
                <p className="text-neon-pink mb-4 text-lg font-bold">Level {gameState.level} Completed!</p>
              )}
              <div className="flex gap-2 justify-center flex-wrap">
                {gameState.gameOver && !gameState.levelComplete && !hasUsedExtraTimeAd && !showReplayAdOption && (
                  <Button
                    onClick={() => setShowRewardModal(true)}
                    className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-slate-900 font-bold"
                  >
                    🎬 Watch Ad for Extra Time
                  </Button>
                )}
                {showReplayAdOption && !hasUsedReplayAd && (
                  <Button
                    onClick={() => setShowRewardModal(true)}
                    className="bg-gradient-to-r from-neon-orange to-neon-pink text-slate-900 font-bold"
                  >
                    🎬 Watch Ad to Replay Level
                  </Button>
                )}
                {gameState.levelComplete && (
                  <Button
                    onClick={handleNextLevel}
                    className="bg-neon-green hover:bg-neon-green/80 text-slate-900 font-bold"
                  >
                    Next Level →
                  </Button>
                )}
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-neon-yellow hover:bg-neon-yellow/80 text-slate-900 font-bold"
                >
                  🏆 Leaderboard
                </Button>
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
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handlePause}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-slate-900 font-bold"
                >
                  Resume Game
                </Button>
                <Button
                  onClick={handleHome}
                  className="bg-neon-pink hover:bg-neon-pink/80 text-slate-900 font-bold"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Leave Dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Game?"
        message="You have unsaved progress. Your game will be lost if you leave without saving. Are you sure?"
        confirmText="Leave & Lose Progress"
        cancelText="Stay & Continue"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        isDangerous={true}
      />

      {/* Leaderboard Dialog */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        score={gameState.levelComplete ? gameState.score : undefined}
        level={gameState.level}
        showNameInput={gameState.levelComplete}
      />

      {/* Inventory Panel */}
      <InventoryPanel
        inventory={inventory}
        onUseTimeSlow={handleUseTimeSlow}
        onUseStickingBubble={handleUseStickingBubble}
        onUseBombBubble={handleUseBombBubble}
        onOpenAds={() => setShowRewardModal(true)}
      />

      {/* Reward Choice Modal */}
      <RewardChoiceModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onSelectReward={handleRewardSelected}
        isReplayMode={showReplayAdOption}
      />
    </div>
  );
}
