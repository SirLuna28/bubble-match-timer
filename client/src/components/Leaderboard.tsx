import React, { useState, useEffect } from 'react';
import { getLeaderboard, addScore, isHighScore, LeaderboardEntry } from '@/lib/leaderboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  score?: number;
  level?: number;
  showNameInput?: boolean;
}

export function Leaderboard({ isOpen, onClose, score, level, showNameInput = false }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newEntryRank, setNewEntryRank] = useState<number | null>(null);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const handleSubmitScore = () => {
    if (score !== undefined && level !== undefined && playerName.trim()) {
      addScore(playerName, score, level);
      const updatedLeaderboard = getLeaderboard();
      setLeaderboard(updatedLeaderboard);
      
      // Find rank of new entry
      const rank = updatedLeaderboard.findIndex(entry => 
        entry.playerName === playerName && entry.score === score
      ) + 1;
      setNewEntryRank(rank);
      setSubmitted(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">
            🏆 Leaderboard
          </DialogTitle>
          <DialogDescription className="text-cyan-300">
            Top 10 High Scores
          </DialogDescription>
        </DialogHeader>

        {showNameInput && score !== undefined && !submitted && (
          <div className="space-y-3 mb-4 p-3 bg-slate-800 rounded-lg border border-cyan-500/30">
            <p className="text-cyan-300 font-semibold">Your Score: {score}</p>
            {isHighScore(score) && (
              <div>
                <p className="text-green-400 text-sm mb-2">🎉 New High Score!</p>
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-slate-700 border-cyan-500/50 text-white placeholder-gray-400"
                  maxLength={20}
                />
                <Button
                  onClick={handleSubmitScore}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600"
                >
                  Submit Score
                </Button>
              </div>
            )}
            {!isHighScore(score) && (
              <p className="text-yellow-400 text-sm">Not in top 10. Keep playing!</p>
            )}
          </div>
        )}

        {submitted && newEntryRank && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
            <p className="text-green-400 font-semibold">✓ Score submitted!</p>
            <p className="text-green-300 text-sm">Rank: #{newEntryRank}</p>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No scores yet. Be the first!</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                  newEntryRank === index + 1
                    ? 'bg-green-900/40 border-green-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-cyan-400 font-bold w-6 text-center">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{entry.playerName}</p>
                    <p className="text-xs text-gray-400">{entry.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-magenta-400 font-bold">{entry.score}</p>
                  <p className="text-xs text-cyan-300">Level {entry.level}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
