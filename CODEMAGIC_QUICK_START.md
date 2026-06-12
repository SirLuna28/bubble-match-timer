# Codemagic Quick Start - 5 Steps to Upload

**Time Required:** 15-20 minutes  
**Difficulty:** Easy  
**Result:** Automated iOS builds and App Store uploads

---

## What You Need

- GitHub account (free)
- Codemagic account (free tier)
- App Store Connect API Key (from Apple Developer)
- 15 minutes of your time

---

## Step-by-Step

### Step 1: Create GitHub Repository (2 min)

1. Go to [github.com](https://github.com)
2. Click **New** → **New Repository**
3. Name: `bubble-match-timer`
4. Set to **Public**
5. Click **Create Repository**

Copy the repository URL (looks like: `https://github.com/YOUR_USERNAME/bubble-match-timer.git`)

### Step 2: Push Your Code to GitHub (3 min)

```bash
cd /home/ubuntu/bubble-match-timer

# Add GitHub as remote (replace with your URL from Step 1)
git remote set-url origin https://github.com/YOUR_USERNAME/bubble-match-timer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Verify at `https://github.com/YOUR_USERNAME/bubble-match-timer`

### Step 3: Create Codemagic Account (2 min)

1. Go to [codemagic.io](https://codemagic.io)
2. Click **Sign Up**
3. Choose **Sign up with GitHub**
4. Authorize Codemagic
5. Create a team (name: `Lou JJ Studio`)

### Step 4: Get App Store Connect API Key (5 min)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click your **Account** (top right)
3. Select **Users and Access** → **Keys** tab
4. Click **Generate API Key**
5. Name: `Codemagic Build`
6. Role: **App Manager**
7. Click **Generate**
8. **Download** the `.p8` file
9. **Note:** Key ID and Issuer ID (shown on screen)

### Step 5: Connect Repository to Codemagic (3 min)

1. In Codemagic dashboard, click **Add Application**
2. Select **GitHub**
3. Find `bubble-match-timer` repository
4. Click **Authorize**
5. Select **iOS App** workflow
6. Click **Next**

---

## Configure Codemagic (5 min)

### Add Environment Variables

1. Click your app in Codemagic
2. Go to **Settings** → **Environment Variables**
3. Add these variables (mark as **Secure** except email):

```
APP_STORE_CONNECT_ISSUER_ID = [Your Issuer ID from Step 4]
APP_STORE_CONNECT_KEY_IDENTIFIER = [Your Key ID from Step 4]
APP_STORE_CONNECT_PRIVATE_KEY = [Contents of .p8 file]
DEVELOPER_EMAIL = your-email@example.com
```

### Connect Apple Developer Account

1. Go to **Settings** → **Team Settings**
2. Click **Apple Developer Account**
3. Click **Add Apple Developer Account**
4. Enter your Apple ID and password
5. Complete 2FA if prompted
6. Click **Connect**

---

## Trigger First Build (20 min)

1. In Codemagic dashboard, click your app
2. Click **Start New Build**
3. Select **Branch:** `main`
4. Select **Workflow:** `ios-build-and-upload`
5. Click **Build**

**Wait 15-20 minutes** for build to complete.

---

## Verify Upload

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Bubble Match Timer**
3. Go to **TestFlight** tab
4. Your build should appear (might take 5-10 min after Codemagic finishes)

---

## Submit for Review

Once build appears in TestFlight:

1. Go to **App Store** tab
2. Click **Prepare for Submission**
3. Select your build
4. Click **Submit for Review**

**Done!** Your app is now submitted to Apple for review.

---

## What Happens Next

- **24-48 hours:** Apple reviews your app
- **Approved:** App goes live on App Store
- **Rejected:** You'll get feedback to fix and resubmit

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails with "Code Signing Error" | Verify Apple Developer account is connected in Codemagic |
| Upload doesn't appear in TestFlight | Wait 5-10 minutes after build completes |
| API Key error | Verify `.p8` file contents are complete (includes BEGIN/END lines) |
| Repository not found | Verify GitHub repo is public and URL is correct |

---

## For More Details

See **CODEMAGIC_SETUP_GUIDE.md** for comprehensive documentation.

---

**Status:** Ready to Start  
**Next:** Follow 5 steps above  
**Questions:** See CODEMAGIC_SETUP_GUIDE.md
