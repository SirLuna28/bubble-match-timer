# Bubble Match Timer - iOS Build Instructions for App Store

**Version:** 1.0.0  
**Bundle ID:** com.loujjstudio.bubblematchtime  
**Minimum iOS:** 14.0  
**Date:** June 12, 2026

---

## Overview

Your Bubble Match Timer app has been wrapped with Capacitor and is ready for Xcode configuration and App Store submission. This guide walks you through the final steps to create a production-ready iOS binary.

---

## Prerequisites

Before proceeding, ensure you have:

- ✅ Xcode 14.0 or later installed
- ✅ Apple Developer account with active membership
- ✅ App Store Connect record created (com.loujjstudio.bubblematchtime)
- ✅ Signing certificate and provisioning profile configured
- ✅ macOS with iOS SDK installed

---

## Step 1: Open the Xcode Project

### Option A: Command Line (Recommended)

```bash
cd /home/ubuntu/bubble-match-timer
npx cap open ios
```

This will automatically open the Xcode project in `/home/ubuntu/bubble-match-timer/ios/App/App.xcodeproj`

### Option B: Manual

1. Open Finder
2. Navigate to `/home/ubuntu/bubble-match-timer/ios/App/`
3. Double-click `App.xcodeproj` to open in Xcode

---

## Step 2: Configure Project Settings

### 2.1 Set Bundle Identifier

1. In Xcode, select the **App** project in the left sidebar
2. Select the **App** target
3. Go to **Build Settings** tab
4. Search for "Bundle Identifier"
5. Verify it's set to: `com.loujjstudio.bubblematchtime`

### 2.2 Set Version and Build Numbers

1. Select the **App** target
2. Go to **General** tab
3. Set the following:
   - **Identity → Bundle Identifier:** `com.loujjstudio.bubblematchtime`
   - **Version:** `1.0.0`
   - **Build:** `1`

### 2.3 Set Minimum Deployment Target

1. Select the **App** target
2. Go to **General** tab
3. Set **Minimum Deployments** to **iOS 14.0**

### 2.4 Configure Supported Orientations

1. Select the **App** target
2. Go to **General** tab
3. Under **App Attributes**, set:
   - **Supported Interface Orientations:** Portrait only (uncheck Landscape Left/Right)
   - **Supported Interface Orientations (iPad):** Portrait and Upside Down only

---

## Step 3: Configure Signing & Capabilities

### 3.1 Set Signing Team

1. Select the **App** project in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Under **Team**, select your Apple Developer Team
5. Xcode will automatically create a provisioning profile

### 3.2 Verify Signing Certificate

1. Go to **Signing & Capabilities** tab
2. Verify **Signing Certificate** shows your development certificate
3. If not, click the dropdown and select your certificate

### 3.3 Add Capabilities (if needed)

For Bubble Match Timer, no special capabilities are required. The default setup is sufficient.

---

## Step 4: Build and Archive

### 4.1 Select Generic iOS Device

1. In Xcode, at the top left, click the scheme selector (currently shows "App")
2. Select **Generic iOS Device** (not a simulator)

### 4.2 Build the App

1. Go to **Product** → **Build** (or press ⌘B)
2. Wait for the build to complete (should show "Build Succeeded")

### 4.3 Create an Archive

1. Go to **Product** → **Archive**
2. Wait for the archiving process to complete
3. The Organizer window will open automatically

---

## Step 5: Validate and Submit Archive

### 5.1 Validate the Archive

1. In the Organizer window, select your archive
2. Click **Validate App**
3. Select your signing team
4. Click **Validate**
5. Wait for validation to complete (should show "Validation Successful")

### 5.2 Distribute to App Store

1. In the Organizer window, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Select **Upload**
5. Select your signing team
6. Click **Upload**
7. Wait for the upload to complete

---

## Step 6: Verify Upload in App Store Connect

### 6.1 Check Build Status

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Bubble Match Timer** app
3. Go to **TestFlight** tab
4. Your build should appear under "Builds" within 5-10 minutes

### 6.2 Add Testers (Optional)

1. In TestFlight, click your build
2. Add internal testers (your email)
3. Test thoroughly on real devices
4. Verify all features work correctly

### 6.3 Submit for Review

1. Go to **App Store** tab
2. Click **Prepare for Submission**
3. Verify all information is correct
4. Select your build
5. Click **Submit for Review**

---

## Troubleshooting

### Build Fails with "Code Signing Error"

**Solution:**
1. Go to Xcode Preferences (⌘,)
2. Select **Accounts**
3. Select your Apple ID
4. Click **Manage Certificates**
5. Ensure your signing certificate is present
6. If not, create a new certificate in Apple Developer

### Archive Not Appearing in Organizer

**Solution:**
1. Make sure you selected "Generic iOS Device" (not a simulator)
2. Try cleaning the build folder: **Product** → **Clean Build Folder** (⇧⌘K)
3. Rebuild and archive again

### Upload Fails with "Invalid Provisioning Profile"

**Solution:**
1. Go to **Signing & Capabilities** tab
2. Click the dropdown next to the provisioning profile
3. Select "Manage Certificates"
4. Ensure your certificate is valid and not expired
5. Try uploading again

### App Crashes on Launch

**Solution:**
1. Check the console for error messages
2. Verify all web assets were copied correctly
3. Run `npx cap copy ios` to refresh web assets
4. Rebuild and archive

---

## Important Notes

### Safe Area Compliance
The app is configured for safe-area compliance. All UI elements (HUD, buttons) are positioned to avoid notches and home indicators on modern iPhones.

### Portrait Orientation Only
The app is locked to portrait orientation as required. Landscape is disabled.

### Minimum iOS Version
The app requires iOS 14.0 or later. Older devices will not be able to install it.

### No AdMob or Tracking
The app contains no advertisements, no tracking code, and no external integrations. It's completely privacy-friendly.

---

## File Structure

```
/home/ubuntu/bubble-match-timer/
├── ios/                          # Xcode project
│   └── App/
│       ├── App.xcodeproj/        # Xcode project file
│       └── App/
│           ├── Info.plist        # App configuration
│           └── public/           # Web assets
├── dist/                         # Built web app
│   └── public/                   # Web files (HTML, CSS, JS)
├── capacitor.config.ts           # Capacitor configuration
└── IOS_BUILD_INSTRUCTIONS.md     # This file
```

---

## Next Steps

After successful submission:

1. **Monitor Review Status** - Check App Store Connect for review progress
2. **Prepare for Launch** - Plan your release strategy
3. **Gather Feedback** - Monitor user reviews and ratings
4. **Plan Updates** - Start working on version 1.1 features

---

## Support

If you encounter any issues:

1. Check the [Capacitor Documentation](https://capacitorjs.com)
2. Review [Apple Developer Documentation](https://developer.apple.com)
3. Check Xcode build logs for detailed error messages
4. Contact support@loujjstudio.com for assistance

---

## Quick Reference

| Item | Value |
|------|-------|
| **App Name** | Bubble Match Timer |
| **Bundle ID** | com.loujjstudio.bubblematchtime |
| **Version** | 1.0.0 |
| **Build** | 1 |
| **Minimum iOS** | 14.0 |
| **Orientations** | Portrait only |
| **Xcode Project** | `/home/ubuntu/bubble-match-timer/ios/App/App.xcodeproj` |

---

**Last Updated:** June 12, 2026  
**Status:** Ready for Xcode Configuration and App Store Submission
