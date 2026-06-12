/**
 * Inventory System - Manages power-up storage and persistence
 * Power-ups are stored in localStorage and persist across game sessions
 */

export interface InventoryState {
  timeSlowCount: number;
  stickingBubbleCount: number;
  bombBubbleCount: number;
}

const INVENTORY_KEY = 'bmt_inventory';

// Default empty inventory
const DEFAULT_INVENTORY: InventoryState = {
  timeSlowCount: 0,
  stickingBubbleCount: 0,
  bombBubbleCount: 0,
};

/**
 * Load inventory from localStorage
 */
export const loadInventory = (): InventoryState => {
  try {
    const stored = localStorage.getItem(INVENTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Backfill missing keys from DEFAULT_INVENTORY
      return { ...DEFAULT_INVENTORY, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load inventory:', error);
  }
  return { ...DEFAULT_INVENTORY };
};

/**
 * Save inventory to localStorage
 */
export const saveInventory = (inventory: InventoryState): void => {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  } catch (error) {
    console.error('Failed to save inventory:', error);
  }
};

/**
 * Add power-ups to inventory (from level completion and achievements)
 */
export const addPowerUp = (type: 'timeSlow' | 'stickingBubble' | 'bombBubble', count: number = 1): InventoryState => {
  const inventory = loadInventory();
  
  if (type === 'timeSlow') {
    inventory.timeSlowCount += count;
  } else if (type === 'stickingBubble') {
    inventory.stickingBubbleCount += count;
  } else if (type === 'bombBubble') {
    inventory.bombBubbleCount += count;
  }
  
  saveInventory(inventory);
  return inventory;
};

/**
 * Use a power-up (decrement count)
 */
export const usePowerUp = (type: 'timeSlow' | 'stickingBubble' | 'bombBubble'): boolean => {
  const inventory = loadInventory();
  
  if (type === 'timeSlow' && inventory.timeSlowCount > 0) {
    inventory.timeSlowCount -= 1;
    saveInventory(inventory);
    return true;
  } else if (type === 'stickingBubble' && inventory.stickingBubbleCount > 0) {
    inventory.stickingBubbleCount -= 1;
    saveInventory(inventory);
    return true;
  } else if (type === 'bombBubble' && inventory.bombBubbleCount > 0) {
    inventory.bombBubbleCount -= 1;
    saveInventory(inventory);
    return true;
  }
  
  return false;
};

/**
 * Clear entire inventory (for testing)
 */
export const clearInventory = (): void => {
  localStorage.removeItem(INVENTORY_KEY);
};

/**
 * Get current inventory state
 */
export const getInventory = (): InventoryState => {
  return loadInventory();
};
