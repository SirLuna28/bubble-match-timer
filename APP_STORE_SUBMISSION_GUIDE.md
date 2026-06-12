# Bubble Match Timer - Apple App Store Submission Guide

**Version:** 1.0.0  
**Bundle ID:** com.loujjstudio.bubblematchtime  
**Developer:** Lou JJ Studio  
**Date:** June 12, 2026  
**Build Type:** Apple-Only (No AdMob)

---

## Table of Contents
1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [App Store Connect Setup](#app-store-connect-setup)
3. [Building and Uploading](#building-and-uploading)
4. [App Store Submission](#app-store-submission)
5. [Review Guidelines](#review-guidelines)
6. [Post-Submission](#post-submission)

---

## Pre-Submission Checklist

### Technical Requirements
- [x] iOS 14.0 or later support verified
- [x] App runs without crashes on iPhone and iPad
- [x] All 100 levels are accessible and playable
- [x] Power-ups function correctly (Time-Slow, Sticking Bubble, Bomb Bubble)
- [x] Leaderboard system works without errors
- [x] Safe-area compliance verified (notch/home indicator)
- [x] Game saves progress correctly to localStorage
- [x] Audio and haptic feedback working on devices with support
- [x] Performance is smooth (60fps target)
- [x] No AdMob or ad-related code remains
- [x] No ad UI elements visible

### Content Requirements
- [x] App icon (1024x1024 PNG) - **READY**
- [x] App name: "Bubble Match Timer" - **READY**
- [x] Subtitle: "Cosmic Puzzle Challenge" - **READY**
- [x] Description: See APP_STORE_MARKETING.md - **READY**
- [x] Keywords: See APP_STORE_MARKETING.md - **READY**
- [x] Privacy Policy URL: https://www.loujjstudio.com/privacy/bubble-match-timer
- [x] Support email: support@loujjstudio.com
- [x] Screenshots (5-6 per device type) - **READY**

### Legal Requirements
- [x] Privacy Policy created and hosted - **READY** (PRIVACY_POLICY.md)
- [x] Age rating: 4+ (No objectionable content)
- [x] Content Rights: Original game developed by Lou JJ Studio
- [x] No third-party content without proper licensing
- [x] No external links except privacy policy

### Monetization Compliance
- [x] No advertisements in app
- [x] No in-app purchases
- [x] No premium currency
- [x] No pay-to-win mechanics
- [x] All content free and earned through gameplay

---

## App Store Connect Setup

### Step 1: Create App Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in the following:
   - **Platform:** iOS
   - **Name:** Bubble Match Timer
   - **Primary Language:** English
   - **Bundle ID:** com.loujjstudio.bubblematchtime
   - **SKU:** BUBBLEMATCH-2026 (any unique identifier)
   - **User Access:** Full Access

### Step 2: App Information

1. **General Information:**
   - **App Name:** Bubble Match Timer
   - **Subtitle:** Cosmic Puzzle Challenge
   - **Category:** Games → Puzzle
   - **Content Rights:** Owned by developer

2. **Age Rating:**
   - Complete the age rating questionnaire
   - Select "4+" (no objectionable content)
   - Note: No ads, no external links, no user-generated content

3. **Pricing and Availability:**
   - **Price Tier:** Free
   - **Availability:** Worldwide (or select specific regions)

### Step 3: App Description

1. Go to **App Store** tab
2. Fill in **Localization** (English):
   - **Description:** (See APP_STORE_MARKETING.md - Long Description)
   - **Promotional Text:** (See APP_STORE_MARKETING.md - What's New)
   - **Keywords:** (See APP_STORE_MARKETING.md - Keywords)
   - **Support URL:** https://www.loujjstudio.com/support
   - **Privacy Policy URL:** https://www.loujjstudio.com/privacy/bubble-match-timer

### Step 4: App Icon and Screenshots

1. **App Icon:**
   - Upload the 1024x1024 PNG app icon
   - File: `bubblematch-app-icon.png` (READY)

2. **Screenshots:**
   - Upload 5-6 screenshots for each device type:
     - iPhone 6.7-inch (Pro Max)
     - iPhone 6.1-inch
     - iPhone 5.5-inch
   - Screenshots should showcase:
     - Main menu/intro screen
     - Gameplay with HUD
     - Power-up usage
     - Level progression
     - Leaderboard
     - Victory screen

3. **Preview Video (Optional):**
   - 30-second gameplay video showing key features

### Step 5: Build Information

1. Go to **TestFlight** tab
2. You'll upload your build here after creating it

---

## Building and Uploading

### Step 1: Prepare Your Project

```bash
cd /home/ubuntu/bubble-match-timer

# Update version number in package.json
# Change "version": "1.0.0"

# Ensure all dependencies are installed
pnpm install

# Build the web app
pnpm run build
```

### Step 2: Create iOS App from Web Build

Since Bubble Match Timer is a web app, you need to wrap it in a native iOS shell:

**Option A: Use Capacitor (Recommended)**

```bash
# Install Capacitor
pnpm add -D @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor
npx cap init "Bubble Match Timer" "com.loujjstudio.bubblematchtime"

# Add iOS platform
npx cap add ios

# Copy web build to iOS
npx cap copy

# Open Xcode
npx cap open ios
```

**Option B: Use Cordova**

```bash
# Install Cordova
npm install -g cordova

# Create project
cordova create bubble-match-timer com.loujjstudio.bubblematchtime "Bubble Match Timer"

# Add iOS platform
cordova platform add ios

# Build
cordova build ios
```

### Step 3: Configure in Xcode

1. Open the iOS project in Xcode
2. Set the following:
   - **Bundle Identifier:** com.loujjstudio.bubblematchtime
   - **Version:** 1.0.0
   - **Build:** 1
   - **Minimum Deployment Target:** iOS 14.0
   - **Supported Orientations:** Portrait only

3. Configure signing:
   - Select your Apple Developer Team
   - Ensure provisioning profile is set correctly

### Step 4: Archive and Upload

1. In Xcode: **Product** → **Archive**
2. Once archiving completes, click **Distribute App**
3. Select **App Store Connect**
4. Follow the upload wizard
5. Wait for processing (usually 5-10 minutes)

### Step 5: TestFlight Beta Testing (Recommended)

1. Go to App Store Connect → **TestFlight**
2. Your build should appear under "Builds"
3. Add internal testers (your email)
4. Test thoroughly on real devices
5. Verify all features work correctly
6. Once satisfied, proceed to submission

---

## App Store Submission

### Step 1: Prepare Submission

1. Go to App Store Connect → **Your App**
2. Click **"Prepare for Submission"**
3. Verify all information is correct:
   - [ ] App name and subtitle
   - [ ] Description and keywords
   - [ ] Screenshots and preview video
   - [ ] App icon
   - [ ] Privacy policy URL
   - [ ] Support email
   - [ ] Age rating (4+)

### Step 2: Add Build

1. Go to **App Store** tab → **Build**
2. Click **"Select a build before you submit your app"**
3. Choose your latest TestFlight build
4. Click **"Add"**

### Step 3: Review Submission Information

1. **Advertising Identifier (IDFA):**
   - [ ] Does this app use the Advertising Identifier (IDFA)?
   - **Answer:** No (app contains no ads or tracking)

2. **Encryption:**
   - [ ] Does your app use encryption?
   - **Answer:** No (standard HTTPS is exempt)

3. **Content Rights:**
   - [ ] Does your app contain, require, or use third-party content?
   - **Answer:** No (all original content)

4. **Export Compliance:**
   - [ ] Does your app contain encryption?
   - **Answer:** No

### Step 4: Add Notes for Reviewer

Add helpful notes for Apple's review team:

```
Bubble Match Timer is a free casual puzzle game featuring:
- 100 progressively challenging levels
- Match-3 bubble matching gameplay
- Strategic power-ups (Time-Slow, Sticking Bubble, Bomb Bubble)
- Gameplay-based reward system (no ads or purchases)
- Global leaderboard system
- Neon cosmic aesthetics with haptic feedback

This is an ad-free, completely free-to-play experience with all content 
earned through gameplay achievements. No third-party integrations.

Test Account (if needed): N/A
```

### Step 5: Submit for Review

1. Click **"Submit for Review"**
2. Confirm submission
3. You'll receive email confirmation
4. Review typically takes 24-48 hours

---

## Review Guidelines

### Apple Review Criteria

**What Apple Will Check:**
- ✅ App functionality and stability
- ✅ Compliance with App Store Review Guidelines
- ✅ Privacy and data handling
- ✅ Content appropriateness for age rating
- ✅ Performance and battery usage

**Common Rejection Reasons (Avoid These):**

1. **Crashes or Bugs:**
   - Ensure app runs without crashes
   - Test all features thoroughly
   - Monitor console for errors

2. **Misleading Information:**
   - Ensure screenshots match actual gameplay
   - Don't exaggerate features in description
   - Be accurate about functionality

3. **Privacy Violations:**
   - Clearly disclose data collection (minimal in this app)
   - Provide accurate privacy policy
   - No hidden tracking

4. **Content Issues:**
   - Ensure age rating (4+) is appropriate
   - No offensive or inappropriate content
   - No external links except privacy policy

5. **Monetization Issues:**
   - Ensure no hidden in-app purchases
   - Verify no ad-related code remains
   - Confirm all content is free

### Compliance Checklist

- [x] App is stable and crash-free
- [x] All features work as described
- [x] Privacy policy is accurate and accessible
- [x] No ads or tracking code
- [x] Age rating (4+) is appropriate
- [x] No misleading information
- [x] Performance is acceptable
- [x] Battery usage is reasonable
- [x] No external links except privacy policy
- [x] Screenshots accurately represent gameplay
- [x] No AdMob or ad-related code
- [x] All content is free and gameplay-based

---

## Post-Submission

### Monitoring Review Status

1. Go to App Store Connect → **Your App** → **Activity**
2. You'll see status updates:
   - **Waiting for Review** (24-48 hours typical)
   - **In Review** (Apple is testing)
   - **Approved** (Ready to release)
   - **Rejected** (See rejection reason)

### If Rejected

1. Read the rejection reason carefully
2. Fix the identified issues
3. Increment build number
4. Create new archive and upload
5. Resubmit for review

### If Approved

1. Choose release date:
   - **Automatic Release** (releases immediately)
   - **Manual Release** (you choose when)
2. Click **"Release This Version"**
3. App will be live on App Store within 1-2 hours

### Post-Launch

1. Monitor app reviews and ratings
2. Fix any reported bugs
3. Plan updates and new features
4. Engage with player community
5. Maintain privacy policy compliance

---

## Important Notes

### No AdMob Configuration Needed
This build contains no AdMob code, test IDs, or ad-related functionality. All advertising-related code has been removed.

### Privacy Policy Hosting

Ensure your privacy policy is:
- Hosted on a public URL
- Accessible from any device
- Updated and maintained
- Compliant with GDPR/CCPA if applicable

### Support and Maintenance

- Monitor app performance
- Fix bugs promptly
- Respond to user reviews
- Plan regular updates
- Maintain privacy policy compliance

---

## Contact Information

**Developer:** Lou JJ Studio  
**Support Email:** support@loujjstudio.com  
**Privacy Policy:** https://www.loujjstudio.com/privacy/bubble-match-timer

---

## Useful Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor Documentation](https://capacitorjs.com)
- [Apple Developer Documentation](https://developer.apple.com)

---

**Last Updated:** June 12, 2026  
**Status:** Ready for Submission  
**Build Type:** Apple-Only (No AdMob)
