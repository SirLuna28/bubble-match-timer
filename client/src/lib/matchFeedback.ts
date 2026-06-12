// Match feedback system for bubble animations and sounds

export interface MatchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  score: number;
  life: number;
  maxLife: number;
  opacity: number;
}

export const createMatchParticles = (
  x: number,
  y: number,
  color: string,
  count: number = 8
): MatchParticle[] => {
  const particles: MatchParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 0.6, // 600ms
      size: 4 + Math.random() * 3,
      color,
      opacity: 1,
    });
  }
  return particles;
};

export const createScorePopup = (
  x: number,
  y: number,
  score: number
): ScorePopup => {
  return {
    x,
    y,
    score,
    life: 0,
    maxLife: 1.2, // 1200ms
    opacity: 1,
  };
};

export const updateMatchParticles = (
  particles: MatchParticle[],
  deltaTime: number
): MatchParticle[] => {
  return particles
    .map((p) => ({
      ...p,
      life: p.life + deltaTime,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15, // gravity
      opacity: Math.max(0, 1 - p.life / p.maxLife),
      size: p.size * (1 - p.life / p.maxLife * 0.5),
    }))
    .filter((p) => p.life < p.maxLife);
};

export const updateScorePopups = (
  popups: ScorePopup[],
  deltaTime: number
): ScorePopup[] => {
  return popups
    .map((p) => ({
      ...p,
      life: p.life + deltaTime,
      y: p.y - 0.5, // float upward
      opacity: Math.max(0, 1 - p.life / p.maxLife),
    }))
    .filter((p) => p.life < p.maxLife);
};

export const drawMatchParticles = (
  ctx: CanvasRenderingContext2D,
  particles: MatchParticle[]
) => {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};

export const drawScorePopups = (
  ctx: CanvasRenderingContext2D,
  popups: ScorePopup[]
) => {
  popups.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(`+${p.score}`, p.x, p.y);
    ctx.restore();
  });
};

// Sound effect playback
const soundCache = new Map<string, HTMLAudioElement>();

export const playMatchSound = (soundPath: string, volume: number = 0.5) => {
  try {
    let audio = soundCache.get(soundPath);
    if (!audio) {
      audio = new Audio(soundPath);
      soundCache.set(soundPath, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.log('Sound play failed:', err);
    });
  } catch (err) {
    console.log('Error playing sound:', err);
  }
};
