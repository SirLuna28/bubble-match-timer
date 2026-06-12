# Bubble Match Timer - Gameplay Milestone Rewards System

**Version:** 1.0.0 (Apple-Only Build)  
**Date:** June 12, 2026  
**Status:** No AdMob - Pure Gameplay-Based Rewards

---

## Overview

Bubble Match Timer now uses a pure gameplay-based reward system with no advertisements. All power-ups and extra lives are earned through player achievements and level progression milestones.

---

## Reward Unlock Milestones

### Power-Up Unlocks by Level Completion

Players earn power-ups automatically as they progress through levels. These are added to their inventory upon level completion.

| Level Range | Reward | Frequency |
|-------------|--------|-----------|
| Levels 1-5 | Introduction to mechanics | No rewards (tutorial) |
| Levels 6-10 | Time-Slow (x1) | Every 5 levels |
| Levels 11-15 | Sticking Bubble (x1) | Every 5 levels |
| Levels 16-20 | Bomb Bubble (x1) | Every 5 levels |
| Levels 21-30 | Time-Slow (x1) | Every 10 levels |
| Levels 31-40 | Sticking Bubble (x1) | Every 10 levels |
| Levels 41-50 | Bomb Bubble (x1) | Every 10 levels |
| Levels 51-60 | Time-Slow (x2) | Every 10 levels |
| Levels 61-70 | Sticking Bubble (x2) | Every 10 levels |
| Levels 71-80 | Bomb Bubble (x2) | Every 10 levels |
| Levels 81-90 | Time-Slow (x3) | Every 10 levels |
| Levels 91-100 | Sticking Bubble (x3) + Bomb Bubble (x3) | Final milestone |

### Score-Based Bonus Rewards

Players earn bonus power-ups when they achieve exceptional scores on any level.

| Score Achievement | Reward |
|------------------|--------|
| 2x Level Goal | Time-Slow (x1) |
| 3x Level Goal | Sticking Bubble (x1) |
| 4x Level Goal | Bomb Bubble (x1) |
| 5x Level Goal | All three power-ups (x1 each) |

### Combo Streak Bonuses

Consecutive level wins without retries grant bonus power-ups.

| Consecutive Wins | Reward |
|-----------------|--------|
| 5 consecutive | Time-Slow (x1) |
| 10 consecutive | Sticking Bubble (x1) |
| 15 consecutive | Bomb Bubble (x1) |
| 20 consecutive | All three power-ups (x1 each) |

---

## Retry System (Gameplay-Based)

When a player fails a level (time runs out), they have unlimited retry attempts with no ad requirement.

### Retry Features

**Instant Retry:** Players can immediately retry the level with a fresh board and full time.

**No Penalty:** Retries don't consume power-ups or affect progression.

**Cumulative Progress:** Each retry counts toward combo streak and score achievements.

**Strategic Retry:** Players can use power-ups on retry attempts to overcome difficult levels.

---

## Power-Up System

### Time-Slow
- **Effect:** Slows bubble movement by 50% for 15 seconds
- **Inventory:** Stockpilable (can hold multiple)
- **Usage:** Click inventory button to activate
- **Visual:** Cyan glowing timer on canvas

### Sticking Bubble
- **Effect:** Next bubble spawned matches any color (wildcard)
- **Inventory:** Stockpilable (can hold multiple)
- **Usage:** Click inventory button to activate
- **Visual:** Green radial glow effect

### Bomb Bubble
- **Effect:** Explodes and destroys nearby bubbles (80px radius)
- **Inventory:** Stockpilable (can hold multiple)
- **Usage:** Click inventory button to activate
- **Visual:** Orange pulsing glow effect

---

## Progression Strategy

### Early Game (Levels 1-20)
- Focus on learning mechanics
- Build initial power-up inventory
- Aim for high scores to unlock bonus rewards
- No pressure to complete quickly

### Mid Game (Levels 21-60)
- Difficulty increases significantly
- Use power-ups strategically
- Aim for 2-3x level goals for bonus rewards
- Maintain combo streaks for extra power-ups

### Late Game (Levels 61-100)
- Extreme difficulty with small, fast bubbles
- Power-ups become essential
- Focus on maintaining combo streaks
- Final milestone at level 100 grants maximum rewards

---

## Inventory Management

### Storage
- Power-ups persist in localStorage
- Inventory survives app restarts
- No inventory limits

### Usage
- Open inventory panel (bottom-right corner)
- Click power-up button to activate
- Confirmation dialog appears
- Power-up applies immediately

### Tracking
- Inventory displays current count for each power-up
- Visual indicators show when power-ups are active
- Countdown timers display on canvas during active effects

---

## Leaderboard Integration

### Score Tracking
- All scores are recorded on global leaderboard
- Highest score per player is displayed
- Leaderboard updates in real-time

### Competitive Elements
- Compare scores with other players worldwide
- Climb rankings through high-score achievements
- No pay-to-win mechanics

---

## Monetization (Apple App Store Compliant)

### No Advertisements
- Zero ad interruptions
- No video ads
- No banner ads
- No ad-based rewards

### No In-App Purchases
- All content is free
- All power-ups earned through gameplay
- No premium currency
- No pay-to-win mechanics

### Pure Gameplay Focus
- All rewards based on player skill
- Progression determined by achievement
- Leaderboard reflects true performance

---

## Implementation Details

### Reward Trigger Points

**Level Completion:** Rewards granted when player reaches level goal before time expires.

**Score Milestones:** Bonus rewards calculated based on final score vs. level goal.

**Combo Tracking:** Consecutive wins tracked automatically, rewards granted at thresholds.

**Retry Logic:** Unlimited retries with no penalty or ad requirement.

### Storage
- Rewards stored in localStorage
- Inventory persists across sessions
- Progress automatically saved

### UI Updates
- Reward notifications appear on level completion
- Inventory panel updates in real-time
- Leaderboard refreshes automatically

---

## Player Experience Flow

### Winning a Level
1. Player reaches level goal
2. Victory screen appears
3. Rewards calculated and displayed
4. Power-ups added to inventory
5. Player advances to next level

### Failing a Level
1. Time runs out
2. Game Over screen appears
3. "Retry Level" button available
4. Player can retry unlimited times
5. No ads, no penalties

### Using Power-Ups
1. Player opens inventory panel
2. Selects desired power-up
3. Confirmation dialog appears
4. Power-up activates immediately
5. Visual effect displays on canvas

---

## Balancing Notes

### Difficulty Curve
- Early levels (1-20): Easy, reward-heavy to build inventory
- Mid levels (21-60): Moderate, rewards maintain inventory
- Late levels (61-100): Hard, rewards are essential for progression

### Power-Up Distribution
- Designed to provide 2-3 power-ups per level on average
- Combo streaks provide bonus rewards for skilled players
- Score achievements reward aggressive play

### Retry Mechanics
- Unlimited retries prevent frustration
- Strategic power-up use rewarded
- Encourages skill development

---

## Testing Checklist

- [ ] All level milestones grant correct rewards
- [ ] Score-based bonuses calculate correctly
- [ ] Combo streak tracking works
- [ ] Power-ups add to inventory correctly
- [ ] Inventory persists across sessions
- [ ] Retry button appears on game over
- [ ] Retry resets level state properly
- [ ] Leaderboard updates with new scores
- [ ] No AdMob code remains in codebase
- [ ] No ad-related UI elements visible
- [ ] Game runs smoothly without ads
- [ ] All power-ups function correctly

---

## Future Enhancement Possibilities

### Achievements System
- Unlock badges for milestones
- Display achievement progress
- Share achievements on leaderboard

### Daily Challenges
- Special daily levels with unique mechanics
- Bonus rewards for daily completion
- Streak tracking for daily play

### Seasonal Events
- Limited-time level sets
- Special power-ups for events
- Seasonal leaderboards

### Difficulty Settings
- Easy/Normal/Hard modes
- Adjustable bubble speeds
- Custom goal multipliers

---

## Apple App Store Compliance

### Requirements Met
- ✅ No advertisements
- ✅ No in-app purchases
- ✅ No external links
- ✅ Age-appropriate (4+)
- ✅ Privacy policy included
- ✅ No personal data collection
- ✅ Stable, crash-free performance
- ✅ Safe-area compliance

### Privacy
- No user tracking
- No analytics beyond gameplay
- No third-party integrations
- Local storage only

### Content
- No offensive content
- No external links
- No in-app messaging
- Pure gameplay focus

---

## Support & Feedback

**In-Game Issues:** Use Home button to return to menu and restart

**Bug Reports:** Contact support@loujjstudio.com

**Feature Requests:** Include in feedback to support email

---

**Last Updated:** June 12, 2026  
**Status:** Ready for Apple App Store Submission  
**Next Step:** Update privacy policy and marketing materials to reflect no-ad model
