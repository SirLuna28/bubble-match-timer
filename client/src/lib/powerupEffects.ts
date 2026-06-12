// Power-up effect system for visual and audio feedback

export type PowerUpType = 'bomb' | 'lightning' | 'freeze';

export interface PowerUpEffect {
  type: PowerUpType;
  x: number;
  y: number;
  intensity: number;
}

export const POWERUP_COLORS = {
  bomb: '#FF6B35',
  lightning: '#FFD700',
  freeze: '#00D9FF',
};

export const POWERUP_SOUNDS = {
  bomb: '/powerup-bomb.wav',
  lightning: '/powerup-lightning.wav',
  freeze: '/powerup-freeze.wav',
};

/**
 * Create particle burst effect for power-up activation
 */
export function createPowerUpParticles(
  type: PowerUpType,
  x: number,
  y: number,
  count: number = 12
): Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}> {
  const particles = [];
  const color = POWERUP_COLORS[type];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3 + Math.random() * 4;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 4 + Math.random() * 4,
    });
  }

  return particles;
}

/**
 * Draw power-up effect particles
 */
export function drawPowerUpParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }>
) {
  particles.forEach(p => {
    // Update particle
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life -= 0.02;

    // Draw particle with fade
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/**
 * Create screen flash effect for power-up
 */
export function createScreenFlash(
  type: PowerUpType,
  duration: number = 300
): { startTime: number; duration: number; type: PowerUpType } {
  return {
    startTime: Date.now(),
    duration,
    type,
  };
}

/**
 * Draw screen flash overlay
 */
export function drawScreenFlash(
  ctx: CanvasRenderingContext2D,
  flash: { startTime: number; duration: number; type: PowerUpType },
  canvasWidth: number,
  canvasHeight: number
) {
  const elapsed = Date.now() - flash.startTime;
  const progress = Math.min(1, elapsed / flash.duration);

  if (progress >= 1) return false; // Flash complete

  // Intensity fades from 1 to 0
  const intensity = (1 - progress) * 0.6;
  const color = POWERUP_COLORS[flash.type];

  ctx.globalAlpha = intensity;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalAlpha = 1;

  return true; // Flash still active
}

/**
 * Play power-up sound effect
 */
export function playPowerUpSound(type: PowerUpType) {
  try {
    const audio = new Audio(POWERUP_SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio play failed:', err));
  } catch (err) {
    console.log('Sound effect error:', err);
  }
}

/**
 * Create shockwave effect for bomb power-up
 */
export function createBombShockwave(
  centerX: number,
  centerY: number,
  maxRadius: number = 150
): {
  centerX: number;
  centerY: number;
  currentRadius: number;
  maxRadius: number;
  startTime: number;
  duration: number;
} {
  return {
    centerX,
    centerY,
    currentRadius: 0,
    maxRadius,
    startTime: Date.now(),
    duration: 400,
  };
}

/**
 * Draw bomb shockwave effect
 */
export function drawBombShockwave(
  ctx: CanvasRenderingContext2D,
  shockwave: {
    centerX: number;
    centerY: number;
    currentRadius: number;
    maxRadius: number;
    startTime: number;
    duration: number;
  }
) {
  const elapsed = Date.now() - shockwave.startTime;
  const progress = Math.min(1, elapsed / shockwave.duration);

  if (progress >= 1) return false; // Shockwave complete

  shockwave.currentRadius = progress * shockwave.maxRadius;

  // Draw expanding circle
  ctx.globalAlpha = (1 - progress) * 0.8;
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(shockwave.centerX, shockwave.centerY, shockwave.currentRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  return true; // Shockwave still active
}

/**
 * Create lightning bolt effect for lightning power-up
 */
export function createLightningBolt(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  segments: Array<{ x: number; y: number }>;
  startTime: number;
  duration: number;
} {
  // Generate jagged lightning path
  const segments = [{ x: startX, y: startY }];
  const steps = 10;
  const jitter = 20;

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * jitter;
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * jitter;
    segments.push({ x, y });
  }
  segments.push({ x: endX, y: endY });

  return {
    startX,
    startY,
    endX,
    endY,
    segments,
    startTime: Date.now(),
    duration: 200,
  };
}

/**
 * Draw lightning bolt effect
 */
export function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  bolt: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    segments: Array<{ x: number; y: number }>;
    startTime: number;
    duration: number;
  }
) {
  const elapsed = Date.now() - bolt.startTime;
  const progress = Math.min(1, elapsed / bolt.duration);

  if (progress >= 1) return false; // Bolt complete

  // Flicker effect
  if (Math.random() > 0.7) return true;

  ctx.globalAlpha = (1 - progress) * 0.9;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
  for (let i = 1; i < bolt.segments.length; i++) {
    ctx.lineTo(bolt.segments[i].x, bolt.segments[i].y);
  }
  ctx.stroke();

  // Draw glow
  ctx.globalAlpha = (1 - progress) * 0.4;
  ctx.strokeStyle = '#FFFF00';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.globalAlpha = 1;
  return true; // Bolt still active
}
