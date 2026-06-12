# Google AdMob Setup Guide for Bubble Match Timer

**Version:** 1.0.0  
**Date:** June 12, 2026

---

## Overview

Bubble Match Timer uses Google Mobile Ads SDK to display rewarded advertisements. This guide walks you through setting up production Ad Unit IDs for App Store submission.

---

## Step 1: Create Google AdMob Account

1. Go to [Google AdMob](https://admob.google.com)
2. Sign in with your Google account
3. Click **"Sign up for AdMob"** if you haven't already
4. Accept the terms and complete setup

---

## Step 2: Create iOS App in AdMob

1. In AdMob dashboard, click **"Apps"** → **"Add app"**
2. Select **"iOS"** as platform
3. Fill in:
   - **App name:** Bubble Match Timer
   - **App store ID:** (You'll get this after first App Store submission, leave blank for now)
   - **App category:** Games
4. Click **"Create"**

---

## Step 3: Create Ad Units

### For Rewarded Ads (Required)

1. In your app, click **"Ad units"** → **"Create new ad unit"**
2. Select **"Rewarded"** as ad format
3. Fill in:
   - **Name:** Bubble Match Timer Rewarded
   - **Ad unit ID:** Will be generated (e.g., `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`)
4. Click **"Create ad unit"**
5. **Copy the Ad Unit ID** - you'll need this

### For Banner Ads (Optional)

1. Click **"Ad units"** → **"Create new ad unit"**
2. Select **"Banner"** as ad format
3. Fill in:
   - **Name:** Bubble Match Timer Banner
4. Click **"Create ad unit"**
5. Copy the Ad Unit ID if you want to use banners

---

## Step 4: Get Your App ID

Your **App ID** is different from Ad Unit IDs:

1. In AdMob dashboard, go to **"Apps"**
2. Find "Bubble Match Timer"
3. Look for **"App ID"** (format: `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`)
4. Copy this ID

---

## Step 5: Update Your Code

### Current Test Configuration

The app currently uses test Ad Unit IDs:

```javascript
// Test IDs (for development only)
const ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511"; // iOS test app ID
const ADMOB_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/1712485313"; // iOS test rewarded
```

### Production Configuration

Replace with your production IDs:

```javascript
// Production IDs (replace with your actual IDs)
const ADMOB_APP_ID = "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"; // Your app ID
const ADMOB_REWARDED_UNIT_ID = "ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz"; // Your rewarded ad unit ID
```

### Where to Update

Find these locations in your code and update:

1. **In Game.tsx or wherever ads are initialized:**
   ```javascript
   // Replace test IDs with production IDs
   const ADMOB_REWARDED_UNIT_ID = "YOUR_PRODUCTION_REWARDED_AD_UNIT_ID";
   ```

2. **In any ad initialization code:**
   ```javascript
   // Before initializing ads
   if (typeof window !== 'undefined' && window.google_mobile_ads_api) {
     window.google_mobile_ads_api.initialize("YOUR_PRODUCTION_APP_ID");
   }
   ```

---

## Step 6: Verify Ad Unit IDs

### Format Check

- **App ID:** `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy` (contains `~`)
- **Ad Unit ID:** `ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz` (contains `/`)

### Test Before Submission

1. Build the app with production IDs
2. Test on a real iOS device
3. Verify ads load and display correctly
4. Don't click ads repeatedly (may flag account)
5. Use test device ID to avoid invalid traffic

---

## Step 7: Add Test Device (Optional but Recommended)

To test with production IDs without risking account suspension:

1. In AdMob dashboard, go to **"Settings"** → **"Test devices"**
2. Click **"Add test device"**
3. Enter your device ID (found in app logs when ad fails to load)
4. Now ads on this device will be marked as test traffic
5. Safe to click ads for testing

---

## Step 8: Monitor Performance

After app goes live:

1. Go to AdMob dashboard
2. Check **"Performance Reports"** for:
   - Ad impressions
   - Click-through rate (CTR)
   - Estimated earnings
   - Invalid traffic alerts

3. Monitor for issues:
   - High invalid traffic rate (may suspend account)
   - Low fill rate (ads not showing)
   - Technical errors

---

## Important Notes

### Test IDs vs Production IDs

| Aspect | Test IDs | Production IDs |
|--------|----------|----------------|
| Format | `ca-app-pub-3940256099942544/...` | `ca-app-pub-[YOUR-ID]/...` |
| Purpose | Development & testing | Live app |
| Earnings | No | Yes |
| Risk | None | Invalid traffic can suspend |
| Clicks | Safe to click | Only click if genuine |

### Best Practices

1. **Never use test IDs in production** - violates AdMob policy
2. **Never click ads repeatedly** - flags as invalid traffic
3. **Use test devices** - safe way to test production IDs
4. **Monitor performance** - catch issues early
5. **Follow AdMob policies** - avoid account suspension
6. **Update regularly** - maintain compliance

### Common Issues

| Issue | Solution |
|-------|----------|
| Ads not loading | Check Ad Unit ID format, verify app ID |
| Low fill rate | Increase user base, check targeting |
| Invalid traffic | Stop clicking ads, use test device ID |
| Account suspended | Review AdMob policies, contact support |

---

## Troubleshooting

### Ads Not Showing

1. Verify Ad Unit IDs are correct
2. Check app ID is correct
3. Ensure app is built with production IDs
4. Check internet connection
5. Verify app has permission to show ads

### "Invalid Ad Unit ID" Error

1. Double-check Ad Unit ID format
2. Ensure it's the correct platform (iOS, not Android)
3. Verify Ad Unit is active (not paused)
4. Check for typos

### Low Earnings

1. Increase user base
2. Optimize ad placement
3. Use multiple ad formats
4. Check geographic targeting
5. Monitor for invalid traffic

---

## After App Store Approval

1. **Update App Store ID:**
   - Once app is live, get your App Store ID
   - Go to AdMob → Your App → Settings
   - Add App Store ID for better tracking

2. **Monitor Metrics:**
   - Track impressions and earnings
   - Watch for invalid traffic
   - Optimize ad placement based on data

3. **Plan Updates:**
   - Consider adding more ad placements
   - Test different ad formats
   - Optimize for user experience

---

## Support

- **AdMob Help:** https://support.google.com/admob
- **AdMob Policies:** https://support.google.com/admob/answer/6128543
- **Invalid Traffic:** https://support.google.com/admob/answer/6250355

---

## Checklist Before Submission

- [ ] Production App ID obtained from AdMob
- [ ] Production Rewarded Ad Unit ID obtained
- [ ] Code updated with production IDs
- [ ] Ads tested on real device
- [ ] No crashes when ads display
- [ ] Test device ID added to AdMob (optional)
- [ ] AdMob policies reviewed and understood
- [ ] No invalid traffic concerns
- [ ] Ready for App Store submission

---

**Last Updated:** June 12, 2026  
**Status:** Ready for Configuration
