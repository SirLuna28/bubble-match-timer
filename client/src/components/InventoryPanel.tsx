import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InventoryState, getInventory } from '@/lib/inventory';

interface InventoryPanelProps {
  onUseTimeSlow?: () => void;
  onUseStickingBubble?: () => void;
  onUseBombBubble?: () => void;
  onOpenAds?: () => void;
  inventory?: InventoryState;
}

export function InventoryPanel({
  onUseTimeSlow,
  onUseStickingBubble,
  onUseBombBubble,
  onOpenAds,
  inventory: externalInventory,
}: InventoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inventory, setInventory] = useState<InventoryState>(externalInventory || getInventory());

  // Update inventory when external inventory changes
  useEffect(() => {
    if (externalInventory) {
      setInventory(externalInventory);
    }
  }, [externalInventory]);

  const handleUseTimeSlow = () => {
    if (inventory.timeSlowCount > 0 && onUseTimeSlow) {
      onUseTimeSlow();
      // Update local state
      setInventory(prev => ({
        ...prev,
        timeSlowCount: Math.max(0, prev.timeSlowCount - 1),
      }));
    }
  };

  const handleUseStickingBubble = () => {
    if (inventory.stickingBubbleCount > 0 && onUseStickingBubble) {
      onUseStickingBubble();
      // Update local state
      setInventory(prev => ({
        ...prev,
        stickingBubbleCount: Math.max(0, prev.stickingBubbleCount - 1),
      }));
    }
  };

  const handleUseBombBubble = () => {
    if (inventory.bombBubbleCount > 0 && onUseBombBubble) {
      onUseBombBubble();
      // Update local state
      setInventory(prev => ({
        ...prev,
        bombBubbleCount: Math.max(0, prev.bombBubbleCount - 1),
      }));
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
      {/* Collapsed Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="m-3 p-3 bg-gradient-to-r from-cyan-400 to-magenta-500 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Open inventory"
        >
          <ChevronUp className="w-5 h-5 text-slate-900" />
        </button>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-0 right-0 m-3 w-64 bg-slate-900 border-2 border-cyan-400 rounded-lg p-4 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-cyan-400">🎒 Inventory</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-800 rounded"
              aria-label="Close inventory"
            >
              <ChevronDown className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Power-ups List */}
          <div className="space-y-2 mb-4">
            {/* Time-Slow Button */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Time-Slow</p>
                  <p className="text-xs text-gray-400">15 seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-yellow-400">x{inventory.timeSlowCount}</span>
                <Button
                  onClick={handleUseTimeSlow}
                  disabled={inventory.timeSlowCount === 0}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use
                </Button>
              </div>
            </div>

            {/* Sticking Bubble */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧼</span>
                <div>
                  <p className="text-sm font-semibold text-green-400">Sticking Bubble</p>
                  <p className="text-xs text-gray-400">Wildcard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-400">x{inventory.stickingBubbleCount}</span>
                <Button
                  onClick={handleUseStickingBubble}
                  disabled={inventory.stickingBubbleCount === 0}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use
                </Button>
              </div>
            </div>

            {/* Bomb Bubble */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-orange-500/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💣</span>
                <div>
                  <p className="text-sm font-semibold text-orange-400">Bomb Bubble</p>
                  <p className="text-xs text-gray-400">Explodes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-400">x{inventory.bombBubbleCount}</span>
                <Button
                  onClick={handleUseBombBubble}
                  disabled={inventory.bombBubbleCount === 0}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use
                </Button>
              </div>
            </div>
          </div>

          {/* Watch Ad Button */}
          <Button
            onClick={onOpenAds}
            className="w-full bg-gradient-to-r from-cyan-400 to-magenta-500 text-slate-900 font-bold hover:opacity-90"
          >
            🎬 Watch Ad for Reward
          </Button>
        </div>
      )}
    </div>
  );
}
