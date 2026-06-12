import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RewardChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReward: (reward: 'extraTime' | 'timeSlow' | 'stickingBubble') => void;
  isLoading?: boolean;
}

export function RewardChoiceModal({ isOpen, onClose, onSelectReward, isLoading = false }: RewardChoiceModalProps) {
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  const handleSelectReward = (reward: 'extraTime' | 'timeSlow' | 'stickingBubble') => {
    setSelectedReward(reward);
    onSelectReward(reward);
    setSelectedReward(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">
            🎁 Choose Your Reward!
          </DialogTitle>
          <DialogDescription className="text-cyan-300">
            Watch an ad to earn one of these amazing power-ups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Extra Time Reward */}
          <button
            onClick={() => handleSelectReward('extraTime')}
            disabled={isLoading || selectedReward !== null}
            className="w-full p-4 rounded-lg border-2 border-cyan-500/50 bg-slate-800 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏱️</span>
              <div>
                <p className="font-bold text-cyan-400">Extra Time</p>
                <p className="text-sm text-gray-300">Continue this level with +30 seconds</p>
              </div>
            </div>
          </button>

          {/* Time-Slow Reward */}
          <button
            onClick={() => handleSelectReward('timeSlow')}
            disabled={isLoading || selectedReward !== null}
            className="w-full p-4 rounded-lg border-2 border-yellow-500/50 bg-slate-800 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              <div>
                <p className="font-bold text-yellow-400">Time-Slow Button</p>
                <p className="text-sm text-gray-300">Slow bubbles for 15 seconds (added to inventory)</p>
              </div>
            </div>
          </button>

          {/* Sticking Bubble Reward */}
          <button
            onClick={() => handleSelectReward('stickingBubble')}
            disabled={isLoading || selectedReward !== null}
            className="w-full p-4 rounded-lg border-2 border-green-500/50 bg-slate-800 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧼</span>
              <div>
                <p className="font-bold text-green-400">Sticking Bubble</p>
                <p className="text-sm text-gray-300">Wildcard bubble that matches any color (added to inventory)</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
          >
            Skip
          </Button>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-cyan-300">
            Loading ad...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
