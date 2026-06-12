import { Play, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useEffect, useState } from 'react';
import { loadGameProgress, hasGameProgress } from '@/lib/gameSave';
import { Leaderboard } from '@/components/Leaderboard';

export default function Home() {
  const [, navigate] = useLocation();
  const { play: playMusic } = useAudioContext();
  const [savedGame, setSavedGame] = useState(loadGameProgress());
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    playMusic();
  }, [playMusic]);

  useEffect(() => {
    setSavedGame(loadGameProgress());
  }, []);

  const handlePlayClick = () => {
    navigate('/intro');
  };

  const handleResumeClick = () => {
    navigate('/game');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="game-container">
      {/* Background with hero image */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/bmt-logo-bg-CtG7rXFrg3TBtTPExhekUm.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl font-logo mb-2">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent animate-pulse">
              Bubble Match
            </span>
          </div>
          <div className="text-4xl font-timer neon-glow">
            Timer
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground mb-12 font-ui">
          Cosmic Puzzle Challenge
        </p>

        {/* Resume or Play Button */}
        {savedGame ? (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={handleResumeClick}
              size="lg"
              className="bg-gradient-to-r from-neon-green to-neon-cyan text-black hover:opacity-90 font-bold text-lg px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume Level {savedGame.level}
            </Button>
            <Button
              onClick={handlePlayClick}
              size="sm"
              variant="outline"
              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              New Game
            </Button>
          </div>
        ) : (
          <Button
            onClick={handlePlayClick}
            size="lg"
            className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:opacity-90 font-bold text-lg px-8 animate-pulse"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Game
          </Button>
        )}

        {/* Leaderboard and Settings Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => setShowLeaderboard(true)}
            variant="outline"
            size="sm"
            className="border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow/10"
          >
            🏆 Leaderboard
          </Button>
          <Button
            onClick={handleSettingsClick}
            variant="outline"
            size="sm"
            className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* Footer Info */}
      <div className="relative z-10 px-4 py-6 text-center text-xs text-muted-foreground border-t border-neon-cyan/20 bg-black/30 backdrop-blur-sm">
        <p>Match 3 bubbles of the same color before time runs out!</p>
      </div>
    </div>
  );
}
