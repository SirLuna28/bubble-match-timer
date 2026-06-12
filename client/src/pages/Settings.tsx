import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { useAudioContext } from '@/hooks/useAudioContext';

export default function Settings() {
  const [, navigate] = useLocation();
  const { play: playMusic } = useAudioContext();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    playMusic();
  }, [playMusic]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="game-container">
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663707547870/WBKamk4m2zg6U4yPd2Ftwq/bmt-logo-bg-CtG7rXFrg3TBtTPExhekUm.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center overflow-y-auto">
        {/* Header */}
        <div className="mb-8 w-full pt-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="text-neon-cyan hover:text-neon-cyan/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-logo mb-2">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
        </div>

        {/* Settings Options */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          {/* Sound Toggle */}
          <div className="bg-black/40 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-neon-cyan" />
                ) : (
                  <VolumeX className="w-5 h-5 text-neon-pink" />
                )}
                <span className="text-lg font-ui text-foreground">Sound Effects</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-neon-green' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Haptic Toggle */}
          <div className="bg-black/40 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📳</span>
                <span className="text-lg font-ui text-foreground">Haptic Feedback</span>
              </div>
              <button
                onClick={() => setHapticEnabled(!hapticEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  hapticEnabled ? 'bg-neon-green' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    hapticEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* How to Play Toggle */}
          <div className="bg-black/40 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-neon-cyan" />
                <span className="text-lg font-ui text-foreground">How to Play</span>
              </div>
              <span className="text-neon-cyan text-xl">{showInstructions ? '−' : '+'}</span>
            </button>

            {/* Instructions */}
            {showInstructions && (
              <div className="mt-4 text-left space-y-3 border-t border-neon-cyan/20 pt-4">
                <div className="flex gap-3">
                  <span className="text-neon-cyan text-lg flex-shrink-0">🎯</span>
                  <p className="text-sm text-foreground">Drag bubbles together to match 3 or more of the same color</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-neon-green text-lg flex-shrink-0">💥</span>
                  <p className="text-sm text-foreground">Matched bubbles pop and new ones fall from the top</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-neon-pink text-lg flex-shrink-0">⏱️</span>
                  <p className="text-sm text-foreground">Reach your goal score before time runs out</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-neon-yellow text-lg flex-shrink-0">🚀</span>
                  <p className="text-sm text-foreground">Complete levels to unlock higher difficulties and challenges</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">⚡</span>
                  <p className="text-sm text-foreground">Match 5+ bubbles to unlock power-ups: Bomb, Lightning, and Freeze</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">🔥</span>
                  <p className="text-sm text-foreground">Consecutive matches within 2 seconds trigger combo multipliers for bonus points</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-black/40 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p>Version: 1.0.0</p>
            <p className="mt-2">Bubble Match Timer - Cosmic Puzzle Challenge</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 py-6 text-center text-xs text-muted-foreground border-t border-neon-cyan/20 bg-black/30 backdrop-blur-sm">
        <p>Customize your gaming experience</p>
      </div>
    </div>
  );
}
