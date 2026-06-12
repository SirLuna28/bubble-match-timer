// Haptic feedback system for mobile devices

export const triggerHapticFeedback = (pattern: 'match' | 'power-up' | 'level-complete' = 'match') => {
  // Check if device supports vibration API
  if (!navigator.vibrate) {
    return;
  }

  try {
    switch (pattern) {
      case 'match':
        // Quick double tap for bubble match
        navigator.vibrate([50, 30, 50]);
        break;
      case 'power-up':
        // Longer vibration for power-up activation
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
      case 'level-complete':
        // Success pattern for level completion
        navigator.vibrate([50, 100, 50, 100, 50]);
        break;
    }
  } catch (err) {
    console.log('Haptic feedback not available:', err);
  }
};

export const stopHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
};
