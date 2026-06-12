// Cosmic particle explosion system for bubble pop effects

export interface CosmicParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  type: 'star' | 'sparkle' | 'dust';
}

export const createCosmicExplosion = (x: number, y: number, bubbleColor: string): CosmicParticle[] => {
  const particles: CosmicParticle[] = [];
  const particleCount = 12 + Math.random() * 8; // 12-20 particles

  // Color palette for cosmic effect
  const cosmicColors = [
    bubbleColor,
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#FF6600', // Orange
    '#FFFFFF', // White
  ];

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    const particleType = Math.random() > 0.7 ? 'star' : Math.random() > 0.5 ? 'sparkle' : 'dust';

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.6 + Math.random() * 0.4, // 0.6-1.0 seconds
      size: 2 + Math.random() * 3,
      color: cosmicColors[Math.floor(Math.random() * cosmicColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      type: particleType,
    });
  }

  return particles;
};

export const updateCosmicParticles = (particles: CosmicParticle[], deltaTime: number): void => {
  particles.forEach(particle => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Apply gravity
    particle.vy += 0.15;

    // Update life
    particle.life -= deltaTime / 1000 / particle.maxLife;

    // Update rotation
    particle.rotation += particle.rotationSpeed;

    // Fade out effect
    particle.life = Math.max(0, particle.life);
  });
};

export const drawCosmicParticles = (ctx: CanvasRenderingContext2D, particles: CosmicParticle[]): void => {
  particles.forEach(particle => {
    if (particle.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    if (particle.type === 'star') {
      // Draw star shape
      drawStar(ctx, 0, 0, particle.size, particle.color);
    } else if (particle.type === 'sparkle') {
      // Draw sparkle (cross)
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-particle.size, 0);
      ctx.lineTo(particle.size, 0);
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(0, particle.size);
      ctx.stroke();
    } else {
      // Draw dust (circle)
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
};

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void => {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};
