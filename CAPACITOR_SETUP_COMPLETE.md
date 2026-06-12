# Capacitor iOS Setup - Complete

**Date:** June 12, 2026  
**Status:** ✅ Ready for Xcode Configuration  
**Bundle ID:** com.loujjstudio.bubblematchtime  
**Version:** 1.0.0

---

## What Has Been Done

### ✅ Web App Built
- Production build created at `/dist/public/`
- All assets optimized and minified
- Ready for iOS deployment

### ✅ Capacitor Installed
- Capacitor CLI: 8.4.0
- Capacitor Core: 8.4.0
- Capacitor iOS: 8.4.0

### ✅ iOS Platform Added
- Xcode project created at `ios/App/App.xcodeproj`
- Web assets copied to iOS app
- Configuration files generated

### ✅ App Configuration
- App name: "Bubble Match Timer"
- Bundle ID: `com.loujjstudio.bubblematchtime`
- Portrait orientation only
- iOS 14.0 minimum

---

## Project Structure

```
bubble-match-timer/
├── ios/                          # ← Xcode iOS project
│   ├── App/
│   │   ├── App.xcodeproj/        # ← Open this in Xcode
│   │   ├── App/
│   │   │   ├── Info.plist        # ← App configuration
│   │   │   ├── public/           # ← Web assets
│   │   │   └── [other iOS files]
│   │   └── Pods/                 # ← CocoaPods dependencies
│   └── [iOS platform files]
├── dist/
│   └── public/                   # ← Built web app
│       ├── index.html
│       ├── assets/
│       └── [web files]
├── capacitor.config.ts           # ← Capacitor config
├── IOS_BUILD_INSTRUCTIONS.md     # ← Step-by-step guide
└── [other project files]
```

---

## Next Steps (Xcode Configuration)

### Step 1: Open Xcode Project

```bash
cd /home/ubuntu/bubble-match-timer
npx cap open ios
```

Or manually open: `/home/ubuntu/bubble-match-timer/ios/App/App.xcodeproj`

### Step 2: Configure in Xcode

1. **Select App Target** (left sidebar)
2. **Go to General Tab**
3. **Set Bundle Identifier:** `com.loujjstudio.bubblematchtime`
4. **Set Version:** `1.0.0`
5. **Set Build:** `1`
6. **Set Minimum Deployment:** iOS 14.0
7. **Orientations:** Portrait only

### Step 3: Configure Signing

1. **Go to Signing & Capabilities Tab**
2. **Select Your Apple Developer Team**
3. Xcode will auto-create provisioning profile
4. Verify signing certificate is present

### Step 4: Build and Archive

1. **Select Generic iOS Device** (top left scheme)
2. **Product → Build** (⌘B) - verify success
3. **Product → Archive** - creates submission archive

### Step 5: Upload to App Store

1. **Organizer window opens** after archive
2. **Click Validate App** - verify everything
3. **Click Distribute App** → **App Store Connect** → **Upload**
4. Wait for upload completion

### Step 6: Verify in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Bubble Match Timer**
3. Go to **TestFlight** tab
4. Your build appears within 5-10 minutes
5. Once ready, **Submit for Review**

---

## Key Configuration Files

### capacitor.config.ts
```typescript
const config: CapacitorConfig = {
  appId: 'com.loujjstudio.bubblematchtime',
  appName: 'Bubble Match Timer',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
  }
};
```

### Info.plist (iOS Configuration)
- App name: "Bubble Match Timer"
- Bundle ID: `com.loujjstudio.bubblematchtime`
- Orientations: Portrait only
- Minimum iOS: 14.0

---

## Important Notes

### Safe Area Compliance
✅ App respects safe areas for notched devices  
✅ All UI elements positioned correctly  
✅ Home indicator won't overlap game

### Portrait Orientation
✅ Locked to portrait mode  
✅ Landscape disabled  
✅ Matches app design

### No AdMob
✅ Zero advertising code  
✅ No tracking  
✅ Privacy-friendly

### Web Assets
✅ All assets copied to iOS app  
✅ No external dependencies  
✅ Works offline

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Code signing error | Check Apple Developer certificate in Xcode Preferences |
| Archive not appearing | Use "Generic iOS Device" not simulator |
| Upload fails | Verify provisioning profile is valid |
| App crashes | Check console, run `npx cap copy ios` again |
| Build fails | Clean build folder: Product → Clean Build Folder |

---

## Commands Reference

```bash
# Open Xcode
npx cap open ios

# Refresh web assets
npx cap copy ios

# Sync iOS platform
npx cap sync ios

# View logs
npx cap open ios

# List installed plugins
npx cap plugin list
```

---

## Files to Review Before Submission

- ✅ `IOS_BUILD_INSTRUCTIONS.md` - Detailed step-by-step guide
- ✅ `APP_STORE_SUBMISSION_GUIDE.md` - App Store submission process
- ✅ `PRIVACY_POLICY.md` - Privacy policy for App Store
- ✅ `APP_STORE_MARKETING.md` - Marketing copy and keywords
- ✅ `GAMEPLAY_MILESTONE_REWARDS.md` - Reward system documentation
- ✅ `ADMOB_REMOVAL_SUMMARY.md` - Confirmation of ad-free build

---

## Verification Checklist

Before opening Xcode, verify:

- [ ] Web app built successfully (`dist/public/` exists)
- [ ] Capacitor initialized (`capacitor.config.ts` exists)
- [ ] iOS platform added (`ios/App/` directory exists)
- [ ] Web assets copied (`ios/App/App/public/` has files)
- [ ] Info.plist configured (portrait orientation)
- [ ] Bundle ID correct: `com.loujjstudio.bubblematchtime`
- [ ] Version set to: `1.0.0`
- [ ] Minimum iOS: 14.0

---

## Support Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Apple Developer:** https://developer.apple.com
- **Xcode Help:** Help → Xcode Help (in Xcode menu)
- **App Store Connect:** https://appstoreconnect.apple.com

---

## What's Next

1. **Open Xcode** - `npx cap open ios`
2. **Configure Signing** - Select your developer team
3. **Build & Archive** - Create submission archive
4. **Upload to App Store** - Distribute to App Store Connect
5. **Monitor Review** - Check App Store Connect for status
6. **Launch!** - Release when approved

---

**Status:** ✅ Capacitor Setup Complete - Ready for Xcode  
**Next:** Follow IOS_BUILD_INSTRUCTIONS.md for Xcode configuration  
**Last Updated:** June 12, 2026
