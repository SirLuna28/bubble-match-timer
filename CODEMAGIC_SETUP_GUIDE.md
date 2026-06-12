# Codemagic Setup Guide - Bubble Match Timer

**Date:** June 12, 2026  
**Status:** Ready for Codemagic Configuration  
**Bundle ID:** com.loujjstudio.bubblematchtime  
**Version:** 1.0.0

---

## Overview

Codemagic is a cloud-based CI/CD platform that will automatically build your iOS app on Mac hardware and upload it directly to App Store Connect. This eliminates the need for you to have a Mac locally.

**What Codemagic Does:**
- Builds your iOS app on Mac servers
- Signs the app with your Apple Developer certificate
- Uploads the binary to App Store Connect
- Sends you email notifications

---

## Prerequisites

Before starting, you need:

1. ✅ **GitHub Account** - To host your code repository
2. ✅ **Codemagic Account** - Free tier available
3. ✅ **Apple Developer Account** - Already set up
4. ✅ **App Store Connect API Key** - For automated uploads
5. ✅ **Apple Signing Certificate** - For code signing

---

## Step 1: Push Your Project to GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name it: `bubble-match-timer`
4. Set to **Public** (required for free Codemagic)
5. Click **Create Repository**

### 1.2 Initialize Git in Your Project

```bash
cd /home/ubuntu/bubble-match-timer
git init
git add .
git commit -m "Initial commit: Bubble Match Timer iOS build ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bubble-match-timer.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 1.3 Verify on GitHub

Visit `https://github.com/YOUR_USERNAME/bubble-match-timer` to confirm your code is uploaded.

---

## Step 2: Create Codemagic Account

### 2.1 Sign Up

1. Go to [codemagic.io](https://codemagic.io)
2. Click **Sign Up**
3. Choose **Sign up with GitHub**
4. Authorize Codemagic to access your GitHub account
5. Complete the signup process

### 2.2 Create Team

1. After login, click **Create Team**
2. Name it: `Lou JJ Studio` (or your preference)
3. Click **Create**

---

## Step 3: Connect GitHub Repository

### 3.1 Add Repository to Codemagic

1. In Codemagic dashboard, click **Add Application**
2. Select **GitHub**
3. Find and select `bubble-match-timer` repository
4. Click **Authorize**
5. Click **Next**

### 3.2 Select Workflow

1. Choose **iOS App**
2. Click **Next**

Codemagic will detect your `codemagic.yaml` configuration file automatically.

---

## Step 4: Get App Store Connect API Key

### 4.1 Create API Key in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click your **Account** (top right)
3. Select **Users and Access**
4. Go to **Keys** tab
5. Click **Generate API Key**
6. Name it: `Codemagic Build`
7. Select **App Manager** role
8. Click **Generate**

### 4.2 Download the Key

1. Click **Download** to save the `.p8` file
2. **IMPORTANT:** Save this file securely - you can only download it once
3. Note the **Key ID** and **Issuer ID** shown on screen

---

## Step 5: Configure Codemagic Environment Variables

### 5.1 Add Environment Variables

In Codemagic dashboard:

1. Click your app
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Type |
|---|---|---|
| `APP_STORE_CONNECT_ISSUER_ID` | Your Issuer ID from Step 4.2 | Secure |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Your Key ID from Step 4.2 | Secure |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Contents of the `.p8` file | Secure |
| `DEVELOPER_EMAIL` | your-email@example.com | Normal |

**To add the private key:**
1. Open the `.p8` file with a text editor
2. Copy the entire contents (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
3. Paste into the `APP_STORE_CONNECT_PRIVATE_KEY` variable

### 5.2 Mark as Secure

For all variables except `DEVELOPER_EMAIL`, check the **Secure** checkbox so they're encrypted.

---

## Step 6: Configure Apple Developer Signing

### 6.1 Connect Apple Developer Account

1. In Codemagic, go to **Settings** → **Team Settings**
2. Click **Apple Developer Account**
3. Click **Add Apple Developer Account**
4. Enter your Apple Developer credentials
5. Click **Connect**

### 6.2 Verify Connection

Codemagic will verify your account and list your signing certificates.

---

## Step 7: Configure Build Settings

### 7.1 Review codemagic.yaml

The `codemagic.yaml` file in your project is already configured with:

- ✅ iOS build configuration
- ✅ Web asset copying
- ✅ CocoaPods dependency installation
- ✅ Archive creation
- ✅ IPA export
- ✅ App Store upload

### 7.2 Customize if Needed

If you need to modify the build process:

1. Edit `codemagic.yaml` in your project
2. Push changes to GitHub: `git add . && git commit -m "Update build config" && git push`
3. Codemagic will automatically detect changes

---

## Step 8: Trigger First Build

### 8.1 Start Build

1. In Codemagic dashboard, click your app
2. Click **Start New Build**
3. Select **Branch:** `main`
4. Select **Workflow:** `ios-build-and-upload`
5. Click **Build**

### 8.2 Monitor Build Progress

The build will take approximately 15-20 minutes:

1. **Install dependencies** (2-3 min)
2. **Build web app** (1-2 min)
3. **Install CocoaPods** (3-5 min)
4. **Build iOS app** (5-7 min)
5. **Create archive** (2-3 min)
6. **Export IPA** (1-2 min)
7. **Upload to App Store** (1-2 min)

Watch the logs in real-time to see progress.

### 8.3 Check Upload Status

1. Once build completes, check your email for notification
2. Go to [App Store Connect](https://appstoreconnect.apple.com)
3. Select **Bubble Match Timer**
4. Go to **TestFlight** tab
5. Your build should appear within 5-10 minutes

---

## Step 9: Submit for App Store Review

Once the build appears in TestFlight:

1. Go to **App Store** tab
2. Click **Prepare for Submission**
3. Verify all information is correct
4. Select your build
5. Click **Submit for Review**

---

## Troubleshooting

### Build Fails with "Code Signing Error"

**Solution:**
1. Verify Apple Developer account is connected in Codemagic
2. Check that your signing certificate is valid (not expired)
3. Ensure bundle ID matches: `com.loujjstudio.bubblematchtime`

### Build Fails with "Pod Install Error"

**Solution:**
1. Check that `ios/App/Podfile` exists
2. Verify CocoaPods is up to date
3. Try deleting `Podfile.lock` and pushing to GitHub

### Upload Fails with "Invalid API Key"

**Solution:**
1. Verify `APP_STORE_CONNECT_PRIVATE_KEY` is complete (includes BEGIN/END lines)
2. Check that Key ID and Issuer ID are correct
3. Ensure the `.p8` file hasn't expired (valid for 1 year)

### Build Takes Too Long

**Solution:**
1. First build is slower (dependencies cached after)
2. Subsequent builds typically take 10-15 minutes
3. Check Codemagic logs for bottlenecks

---

## Automated Builds (Optional)

### Enable Automatic Builds on Push

1. In Codemagic, go to **Settings** → **Build Triggers**
2. Enable **Trigger on Push**
3. Select **Branch:** `main`
4. Now every push to GitHub will trigger a build automatically

### Scheduled Builds (Optional)

1. Go to **Settings** → **Build Triggers**
2. Enable **Scheduled Builds**
3. Set frequency (e.g., daily, weekly)
4. Codemagic will build on schedule

---

## File Structure

```
bubble-match-timer/
├── codemagic.yaml              # ← Build configuration (already created)
├── ios/App/
│   ├── ExportOptions.plist     # ← Export settings (already created)
│   └── [other iOS files]
├── dist/public/                # ← Built web app
├── client/src/                 # ← React source code
└── [other project files]
```

---

## Important Notes

### API Key Security
- The `.p8` file is sensitive - never commit it to GitHub
- Codemagic stores it securely in encrypted environment variables
- You can revoke the key anytime from App Store Connect

### Build Artifacts
- Codemagic keeps build artifacts for 30 days
- You can download IPA files from build history if needed
- Failed builds are also kept for debugging

### Costs
- **Free tier:** 120 build minutes per month (sufficient for your needs)
- **Paid tiers:** Available if you need more builds

---

## Next Steps

1. **Push to GitHub** - `git push` your project
2. **Create Codemagic Account** - Sign up at codemagic.io
3. **Connect Repository** - Add your GitHub repo to Codemagic
4. **Add API Key** - Configure App Store Connect credentials
5. **Trigger Build** - Start first build from Codemagic dashboard
6. **Monitor Upload** - Check App Store Connect for build appearance
7. **Submit for Review** - Click Submit for Review in App Store Connect

---

## Support

- **Codemagic Docs:** https://docs.codemagic.io
- **Codemagic Support:** support@codemagic.io
- **Apple Developer:** https://developer.apple.com

---

## Quick Reference

| Item | Value |
|------|-------|
| **App Name** | Bubble Match Timer |
| **Bundle ID** | com.loujjstudio.bubblematchtime |
| **GitHub Repo** | bubble-match-timer |
| **Codemagic Workflow** | ios-build-and-upload |
| **Build Time** | ~15-20 minutes |
| **Upload Destination** | App Store Connect |

---

**Status:** Ready for Codemagic Setup  
**Last Updated:** June 12, 2026  
**Next:** Follow steps 1-9 above to complete setup
