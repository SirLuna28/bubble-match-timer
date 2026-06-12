/**
 * Google AdMob Configuration
 * Test Ad Unit IDs for development
 * Replace with real Ad Unit IDs from your AdMob account for production
 */

// Test Ad Unit IDs (Google AdMob test IDs)
export const AD_UNIT_IDS = {
  // Rewarded video ads - test ID
  REWARDED_VIDEO: 'ca-app-pub-3940256099942544/5224354917',
};

// AdMob App ID (replace with your actual App ID from Apple Developer Account)
export const ADMOB_APP_ID = 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy';

/**
 * Initialize Google Mobile Ads SDK
 * This should be called once when the app loads
 */
export const initializeAdMob = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Check if Google Mobile Ads SDK is available
  if (!(window as any).google?.gms) {
    console.warn('Google Mobile Ads SDK not loaded. Ads will not be shown.');
    return;
  }

  try {
    // Initialize with test device IDs for development
    const gma = (window as any).google.gms.ads;
    await gma.initialize();
    console.log('Google Mobile Ads SDK initialized');
  } catch (error) {
    console.error('Failed to initialize Google Mobile Ads:', error);
  }
};

/**
 * Load a rewarded video ad
 */
export const loadRewardedAd = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;

  try {
    const gma = (window as any).google.gms.ads;
    const rewardedAd = new gma.rewarded.RewardedAd(AD_UNIT_IDS.REWARDED_VIDEO);
    
    return new Promise((resolve, reject) => {
      rewardedAd.load()
        .then(() => resolve(rewardedAd))
        .catch((error: any) => reject(error));
    });
  } catch (error) {
    console.error('Failed to load rewarded ad:', error);
    return null;
  }
};

/**
 * Show a rewarded video ad
 */
export const showRewardedAd = async (onReward: () => void): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    const rewardedAd = await loadRewardedAd();
    if (!rewardedAd) {
      console.warn('Rewarded ad not available');
      return false;
    }

    return new Promise((resolve) => {
      const gma = (window as any).google.gms.ads;
      
      // Set up reward callback
      rewardedAd.onAdDismissed(() => {
        resolve(false);
      });

      // Show the ad
      rewardedAd.show({
        onUserEarnedReward: () => {
          onReward();
          resolve(true);
        },
      });
    });
  } catch (error) {
    console.error('Failed to show rewarded ad:', error);
    return false;
  }
};
