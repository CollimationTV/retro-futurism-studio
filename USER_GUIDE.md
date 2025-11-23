# 🧠 BraveWave User Guide for Instructors

<div align="center">

### *Mind-Controlled Image Selection Experience*
### *Culminating in AI-Generated Video Art*

---

**🎯 Purpose**: This guide helps you facilitate engaging BraveWave sessions using Emotiv EEG headsets

</div>

---

## 📋 Table of Contents

1. [🎬 Experience Overview](#-experience-overview)
2. [⚙️ Prerequisites](#️-prerequisites)
3. [🚀 Pre-Session Setup](#-pre-session-setup)
4. [👥 Session Walkthrough](#-session-walkthrough)
5. [🔧 Troubleshooting Guide](#-troubleshooting-guide)
6. [✅ Best Practices](#-best-practices)
7. [📚 Technical Details](#-technical-details)
8. [🆘 Support Resources](#-support-resources)

---

## 🎬 Experience Overview

### What Participants Will Experience

| Stage | Method | Duration | Description |
|-------|--------|----------|-------------|
| **🎯 Level 1** | PUSH + Head Motion | 2-4 min/person | Navigate 9 images via head tilt, select with 5s PUSH hold |
| **🎯 Level 2** | PUSH + Head Motion | 2-4 min/person | Second selection from new set of 9 images |
| **🌍 Level 3** | Excitement + Head Motion | 3-5 min total | Navigate 15 artworks forming a sphere, auto-select via sustained excitement |
| **🎥 Video Output** | Watch | 2-5 min | AI-generated video with soundtrack chosen by collective excitement |

### 🌊 Experience Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Level 1    │───▶│   Level 2    │───▶│   Level 3    │───▶│ Video Output │
│  PUSH-Based  │    │  PUSH-Based  │    │ Emotion-Based│    │  AI Content  │
│   9 Images   │    │   9 Images   │    │ 15 Artworks  │    │  + Soundtrack│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## ⚙️ Prerequisites

### 🖥️ Required Hardware

| Item | Specification | Notes |
|------|--------------|-------|
| **EEG Headsets** | Emotiv (any model) | One per participant, unlimited headsets supported |
| **Computer** | Windows 10/11 PC | Adequate processing power for video generation |
| **Internet** | Stable broadband | Required for AI video generation (Sora API) |

### 💿 Required Software

| Software | Purpose | Download |
|----------|---------|----------|
| **Emotiv Launcher** | Headset communication | [emotiv.com](https://emotiv.com) |
| **EmotivBCI** | Training mental commands | Included with Launcher |
| **BraveWave Desktop** | The application | Windows .exe executable |

---

## 🚀 Pre-Session Setup

### ⏱️ Timeline: 15-20 minutes before participants arrive

#### Step 1️⃣: Install Emotiv Software

```bash
1. Download Emotiv Launcher from emotiv.com
2. Install and launch
3. Verify it's running (system tray icon)
4. Launch EmotivBCI for training
```

✅ **Success Check**: Green headset icon in system tray

---

#### Step 2️⃣: Configure Developer Credentials

🔐 **Important**: These credentials enable BraveWave to communicate with headsets

1. 📝 Create/login to [Emotiv Developer Portal](https://emotiv.com/developer)
2. ➕ Create a new application
3. 📋 Copy **Client ID** and **Client Secret**
4. 🔒 Keep credentials secure - you'll enter them in BraveWave

<details>
<summary>📸 Click to see where to find credentials</summary>

Navigate to: **Developer Portal → My Applications → [Your App] → Credentials**

</details>

---

#### Step 3️⃣: Train Mental Commands (CRITICAL ⚠️)

**💡 Training Quality = Experience Success**

| Training Focus | Importance | Target Accuracy |
|----------------|------------|-----------------|
| **PUSH command** | 🔴 Critical | 90%+ |
| **Head motion** | 🟡 Important | 85%+ |
| **Neutral state** | 🟢 Helpful | 80%+ |

**📚 Training Steps in EmotivBCI:**

1. Open **EmotivBCI** software
2. Navigate to **Mental Commands** section
3. Select **PUSH** command (most critical!)
4. Follow on-screen training prompts:
   - 🧘 **Neutral**: Relax, clear mind (10 seconds)
   - 💪 **PUSH**: Imagine pushing an object forward (10 seconds)
   - 🔁 **Repeat**: Train 3-5 times for consistency
5. Check accuracy meter - aim for **90%+**
6. 💾 **Save profile** with a memorable name

**🎯 Training Tips:**
- Use the same mental "push" feeling each time
- Stay consistent - don't vary your mental approach
- Practice in a quiet environment
- Rest between training sessions if accuracy drops

---

#### Step 4️⃣: Prepare Headsets

**🔋 Battery & Signal Checklist:**

| Task | Details | Status |
|------|---------|--------|
| ⚡ **Charge** | 4+ hours battery recommended | ☐ |
| 🧼 **Clean sensors** | Wipe with alcohol pad | ☐ |
| 💧 **Apply saline** | Moisten felt sensor pads | ☐ |
| 📡 **Test connection** | Verify in Emotiv Launcher | ☐ |
| 🟢 **Signal quality** | All sensors green/yellow | ☐ |

**🌡️ Signal Quality Guide:**
- 🟢 **Green**: Excellent - Commands will work reliably
- 🟡 **Yellow**: Fair - May work but inconsistent
- 🔴 **Red**: Poor - Commands will NOT register (fix required)

---

## 👥 Session Walkthrough

### 🎮 Step 1: Launch BraveWave

```bash
1. ✅ Ensure Emotiv Launcher is running
2. 🖱️ Double-click BraveWave desktop executable
3. 🌐 Application loads at http://localhost:8080
4. 🎉 Hero screen appears
```

---

### 🔌 Step 2: Connect Headsets

**Connection Flow:**

```
Hero Screen → Initialize Session → Enter Credentials → Connect to Cortex
```

**Detailed Steps:**

1. Click **"Initialize Session"** button on hero screen
2. Enter your **Emotiv Client ID** (stored locally after first use)
3. Enter your **Emotiv Client Secret**
4. Click **"Connect to Cortex"**
5. Wait 5-10 seconds for authentication
6. Each headset appears with:
   - 🎨 **Unique color indicator**
   - 🔗 **Connection status**
   - 📊 **Headset ID** (first 8 characters)

**✅ Success Indicators:**
- All headsets show **"CONNECTED"** status
- Each headset has a distinct color badge
- Real-time command indicators appear

**🚨 Troubleshooting:**
- Red status? → Check Emotiv Launcher
- Missing headset? → Check Bluetooth pairing
- Wrong credentials? → Re-enter from developer portal

---

### 🎯 Step 3: Image Selection - Level 1

**🎮 Control Scheme:**

| Action | Method | Visual Feedback |
|--------|--------|-----------------|
| **Navigate** | Turn head left/right (smooth cursor) | Focused image zooms & glows |
| **Select** | PUSH command (5 sec hold) | Progress bar + countdown timer |
| **Confirm** | Complete 5-second hold | Particle burst effect |

**👨‍🏫 Instructor Coaching:**

💬 **"Turn your head smoothly to move through images like a cursor."**

💬 **"Hold PUSH steady for the full 5 seconds - watch the progress bar."**

💬 **"Your headset color shows which image you're focusing on."**

**🔍 What to Watch For:**
- ✅ Smooth head panning (like looking around naturally)
- ✅ Steady PUSH holds (progress bar fills smoothly)
- ✅ Cursor moves continuously with head position
- ⚠️ Motion freezes during PUSH hold (by design - prevents sliding)

**✅ Success Indicator**: After each user selects, app auto-advances to Level 2

---

### 🎯 Step 4: Image Selection - Level 2

**Same mechanics as Level 1:**
- 🧭 Navigate with smooth head panning (cursor-like)
- 🖐️ Select with 5-second PUSH hold
- 🎨 Each user selects one more image

**🎪 Multi-User Tips:**
- Users navigate independently - no interference
- Each headset's color highlights their focused image
- Progress bars are per-user (multiple can push simultaneously)
- Head movements are natural and continuous

**✅ Success Indicator**: After all selections complete, Sora video generation starts in background → automatic transition to Level 3

---

### 🌍 Step 5: Emotion-Based Selection - Level 3 (NEW!)

**🎨 The "Emotional Resonance Sphere"**

This is the **most artistic** level where 15 artworks form a rotating 3D sphere representing Earth.

**🎮 NEW Control Scheme:**

| Action | Method | Visual Feedback |
|--------|--------|-----------------|
| **Navigate** | Turn head smoothly (cursor control) | Focused artwork glows with your color |
| **Focus** | Look at artwork naturally | Orbital ring indicator moves |
| **Select** | Sustain high excitement 5 sec | Countdown + progress ring |
| **Confirm** | Automatic on threshold met | Artwork lifts & particle burst |

**🧠 How Excitement Selection Works:**

1. **Navigate**: Pan head smoothly to move focus through 15 artworks (like a cursor)
2. **Excite**: Feel genuine excitement/interest in focused artwork
3. **Threshold**: Each artwork has an excitement requirement (55%-75%)
4. **Hold**: Sustain excitement ≥ threshold for **5 seconds**
5. **Auto-Select**: System automatically selects when conditions met

**📊 Real-Time Visualizations:**

| Element | Purpose | Location |
|---------|---------|----------|
| **Collective Core** | Average excitement (all users) | Center of sphere |
| **Orbital Rings** | Per-headset excitement tracking | Rotating around sphere |
| **Progress Rings** | Selection countdown per artwork | On focused artwork |
| **Starfield** | Ambient atmosphere | Background |

**💡 NO TRAINING NEEDED:** Excitement detection is **passive** - it doesn't require training like PUSH commands. The Emotiv headset automatically measures excitement via performance metrics.

**👨‍🏫 Instructor Coaching:**

💬 **"Let your genuine feelings guide your selection. Focus on artworks that excite you."**

💬 **"Watch your orbital ring - the indicator shows your excitement level."**

💬 **"You can navigate to different artworks while staying excited about one."**

💬 **"Motion FREEZES when excitement is building - this locks your selection."**

**🎯 Level 3 Artwork Themes:**
- 🌊 Nature (oceans, forests, mountains)
- 🌌 Cosmos (stars, galaxies, nebulae)
- 🤝 Humanity (connection, emotion)
- 🎨 Abstract (flowing forms, colors)

**✅ Success Indicator**: 
- All users complete selections → Collective excitement score calculated
- Soundtrack chosen based on group excitement
- Automatic transition to Video Output (2-second delay)

---

### 🎥 Step 6: Video Output

**🎬 What Happens:**

1. **AI-generated video** plays automatically (8 seconds, cinematic)
2. **Soundtrack** plays based on collective excitement:
   - 🔥 **High Energy** (70%+ excitement)
   - ⚖️ **Balanced** (40-70% excitement)
   - 🧘 **Calm** (<40% excitement)
3. **Metadata Display**:
   - "Earth formed by X emotional resonances"
   - Collective Excitement Score: X/100
   - Selected soundtrack name & description

**📊 Understanding Scores:**

| Excitement Score | Soundtrack | Meaning |
|------------------|------------|---------|
| **0-39%** | Calm | Participants were relaxed/contemplative |
| **40-69%** | Balanced | Moderate engagement & interest |
| **70-100%** | High Energy | Strong excitement & emotional connection |

**🔄 Options:**
- 🔁 **Create Another**: Start new session from beginning
- (Future: Export, share, replay)

---

## 🔧 Troubleshooting Guide

### ❌ Issue: Headset Won't Connect

**🔍 Symptoms:**
- Headset not appearing in BraveWave
- Stuck on "Connecting..." status
- Red connection indicator

**✅ Solutions:**

| Step | Action | Verify |
|------|--------|--------|
| 1️⃣ | Check Emotiv Launcher | Green headset icon visible |
| 2️⃣ | Restart Emotiv Launcher | Close fully, reopen |
| 3️⃣ | Restart BraveWave | Close and relaunch app |
| 4️⃣ | Check battery level | >20% charge |
| 5️⃣ | Re-pair Bluetooth | Windows Settings → Devices |
| 6️⃣ | Verify credentials | Match developer portal exactly |

---

### ❌ Issue: Poor Signal Quality

**🔍 Symptoms:**
- Red sensors in Emotiv Launcher
- Commands not registering
- Erratic behavior

**✅ Solutions:**

| Problem | Solution | Details |
|---------|----------|---------|
| 🔴 **Dry sensors** | Apply more saline | 2-3 drops per pad |
| 📍 **Poor positioning** | Adjust headset | Sensors must touch scalp |
| 💇 **Hair blocking** | Part hair under sensors | Especially for thick hair |
| ⏱️ **Just applied** | Wait 2-3 minutes | Sensors need time to settle |
| 🧼 **Dirty sensors** | Clean with alcohol | Let dry before applying saline |

**⏰ Signal Stabilization Time:**
- Initial placement: 30-60 seconds
- After saline application: 2-3 minutes
- For best results: Wait for all green indicators

---

### ❌ Issue: PUSH Command Not Working

**🔍 Symptoms:**
- Holding PUSH but progress bar doesn't fill
- Selection doesn't complete
- No visual feedback

**✅ Solutions:**

1. **🎓 Check Training**:
   - Was PUSH command trained in EmotivBCI?
   - Is training profile loaded?
   - Training accuracy >85%?

2. **👀 Monitor Real-Time**:
   - Look at command indicator at top of screen
   - Does it show "PUSH" when you try?
   - Check power level (should be >0.5 for reliable detection)

3. **⏱️ Hold Duration**:
   - PUSH must be held for **full 5 seconds**
   - Watch progress bar - it should fill smoothly
   - Release too early? Try again

4. **🧠 Mental Consistency**:
   - Use the SAME mental push feeling as during training
   - Don't overthink - use muscle memory
   - Stay relaxed - tension reduces accuracy

5. **🔧 Re-Training**:
   - If consistently failing → retrain in EmotivBCI
   - Use a different mental approach if previous one doesn't work
   - Train in similar environment to usage

---

### ❌ Issue: Head Motion Navigation Not Working

**🔍 Symptoms:**
- Focus not moving when panning head
- Navigation too sensitive / not sensitive enough
- Cursor moves erratically

**✅ Solutions:**

| Problem | Solution | Technical Details |
|---------|----------|-------------------|
| **No movement** | Pan head left/right more | Dead zone: 0.1 gyro units |
| **Too sensitive** | Reduce head movement speed | Movement speed: 0.003 (slow & smooth) |
| **Motion frozen** | Release PUSH hold | Motion disabled during selection |
| **Erratic movement** | Smoother head panning | Continuous tracking, not discrete |

**🎯 Navigation Tips for All Levels:**
- ↔️ **Pan Head Left/Right**: Very slow, smooth cursor-like control through images/artworks
- 🎯 **Natural Movement**: Turn head gradually - small movements travel far
- ⏱️ **Continuous Tracking**: No need to return to neutral - cursor follows head position
- ❄️ **Frozen Motion**: Normal during PUSH hold (Levels 1&2) or excitement build (Level 3)
- 🐌 **Slow Speed**: Cursor intentionally moves slowly for precise control

---

### ❌ Issue: Level 3 Too Sensitive / Not Sensitive

**🔍 Symptoms:**
- Auto-selecting too quickly (too sensitive)
- Can't trigger selection (not sensitive enough)

**✅ Sensitivity Adjustments:**

**If TOO SENSITIVE:**
1. Thresholds already raised to 55-75% (vs 30-60% in other levels)
2. Hold duration is 5 seconds (vs 3 seconds previously)
3. Encourage participants to stay calm between selections
4. Excitement naturally rises with engagement - this is expected

**If NOT SENSITIVE ENOUGH:**
1. Check excitement meter visibility - is it moving?
2. Encourage genuine emotional responses to artworks
3. Some users naturally have lower excitement baselines
4. Try different artworks - each has different thresholds (55-75%)
5. Monitor orbital ring indicator - shows real-time excitement

**📊 Excitement Threshold Guide:**

| Artwork | Theme | Threshold | Difficulty |
|---------|-------|-----------|------------|
| Ocean's Breath | Nature | 55% | Easier |
| Forest Consciousness | Nature | 70% | Harder |
| Earth Rising | Abstract | 75% | Hardest |
| Unity Wave | Connection | 65% | Medium |

---

### ❌ Issue: Video Generation Fails

**🔍 Symptoms:**
- Error message during generation
- Stuck on "Generating..." screen
- Timeout error

**✅ Solutions:**

| Cause | Solution | Prevention |
|-------|----------|------------|
| **No internet** | Check connection | Test before session |
| **API issue** | Wait 2 minutes, retry | Sora API can be busy |
| **Timeout** | Edge function set to 6 min | Check Lovable Cloud settings |
| **Missing metadata** | Ensure images have tags | Verify in image data files |
| **API key invalid** | Re-enter OpenAI key | Must have Sora access |

**⏱️ Normal Generation Time:** 2-5 minutes

---

### ❌ Issue: Application Freezes or Crashes

**🔍 Symptoms:**
- BraveWave becomes unresponsive
- White screen / blank page
- Commands stop working

**✅ Solutions:**

1. **🔄 Quick Recovery**:
   ```bash
   1. Force quit BraveWave (Task Manager)
   2. Verify Emotiv Launcher still running
   3. Relaunch BraveWave
   4. Reconnect headsets
   ```

2. **🔧 Deep Reset**:
   ```bash
   1. Close BraveWave
   2. Restart Emotiv Launcher
   3. Wait 10 seconds
   4. Relaunch both applications
   5. Re-enter credentials if needed
   ```

3. **💻 System Check**:
   - CPU usage high? → Close background apps
   - Low memory? → Restart computer
   - Multiple sessions? → Close old browser tabs

---

## ✅ Best Practices

### 🎯 Before the Session

**📝 Preparation Checklist:**

| Task | Timeline | Priority |
|------|----------|----------|
| ✅ Test full workflow with 1 headset | 24 hours before | 🔴 Critical |
| ✅ Charge all headsets fully | Night before | 🔴 Critical |
| ✅ Prepare extra saline solution | Day of | 🟡 Important |
| ✅ Print quick reference cards | Day of | 🟢 Helpful |
| ✅ Have backup headsets | Always | 🟢 Helpful |
| ✅ Test internet speed | 1 hour before | 🟡 Important |

---

### 👨‍🏫 During the Session

**🗣️ Communication Tips:**

| Phase | Key Messages | Tone |
|-------|-------------|------|
| **Setup** | "Fitting takes 5 minutes - relax while we adjust" | Calm, patient |
| **Level 1-2** | "Navigate slowly, PUSH firmly for 5 seconds" | Clear, directive |
| **Level 3** | "Let your genuine excitement guide you - no pressure!" | Encouraging, playful |
| **Waiting** | "Video is being created by AI - almost ready!" | Excited, anticipatory |

**👀 Monitoring Checklist:**

- ✅ Watch real-time command indicators (all headsets)
- ✅ Check signal quality periodically (green/yellow)
- ✅ Encourage patience for first-time users
- ✅ Celebrate successful selections (positive reinforcement)
- ✅ Note which users struggle → extra coaching

**💡 Encouragement Phrases:**

- 💬 *"That's it! Smooth head tilts - you've got it!"*
- 💬 *"Hold steady... 3... 2... 1... Perfect!"*
- 💬 *"Feel that artwork - let your excitement build!"*
- 💬 *"Great selection! Your mind is controlling the system!"*

---

### ⏱️ Timing Expectations

**⏰ Session Duration by Group Size:**

| Headsets | Setup Time | Selection Time | Total Experience |
|----------|-----------|----------------|------------------|
| **1 user** | 5 min | 10 min | ~20 minutes |
| **2-3 users** | 10 min | 15 min | ~30 minutes |
| **4-6 users** | 15 min | 25 min | ~45 minutes |
| **7-10 users** | 20 min | 35 min | ~60 minutes |

**📊 Detailed Timing Breakdown:**

```
Per Person:
├─ Headset fitting: 3-5 minutes
├─ Signal stabilization: 2-3 minutes
├─ Level 1 navigation: 1-2 minutes
├─ Level 1 selection: 5 seconds (hold time)
├─ Level 2 navigation: 1-2 minutes
├─ Level 2 selection: 5 seconds (hold time)
└─ Level 3 (group): 3-5 minutes total

Background:
└─ Video generation: 2-5 minutes (overlaps with Level 3)
```

---

## 📚 Technical Details

### 🖥️ System Requirements

| Component | Specification | Notes |
|-----------|--------------|-------|
| **OS** | Windows 10/11 (64-bit) | Required for desktop app |
| **Browser** | Chromium-based | Bundled in desktop app |
| **RAM** | 8GB minimum, 16GB recommended | For smooth video processing |
| **CPU** | Intel i5 or AMD equivalent | Multi-core preferred |
| **Connection** | Cortex API via WebSocket | `wss://localhost:6868` |
| **Storage** | Credentials in localStorage | Encrypted in browser |

---

### 🧠 Mental Commands & Metrics Used

**🎮 Control Methods:**

| Command/Metric | Type | Used In | Training Required? |
|----------------|------|---------|-------------------|
| **PUSH** | Mental Command | Levels 1 & 2 | ✅ Yes (EmotivBCI) |
| **Head Motion** | Motion Sensor | Levels 1, 2 & 3 | ✅ Yes (EmotivBCI) |
| **Excitement** | Performance Metric | Level 3 only | ❌ No (automatic) |
| **Engagement** | Performance Metric | Level 3 visual only | ❌ No (automatic) |

**📊 Performance Metrics Explained:**

Emotiv headsets automatically measure these **without training**:

| Metric | Range | Meaning | Used For |
|--------|-------|---------|----------|
| **Excitement** | 0-1 (0-100%) | Emotional arousal, interest | Level 3 auto-selection |
| **Engagement** | 0-1 | Attention, focus | Level 3 visualization |
| **Stress** | 0-1 | Tension, anxiety | (Not currently used) |
| **Relaxation** | 0-1 | Calmness | (Not currently used) |

**🔄 Update Rates:**

- Mental Commands (`com`): 8 Hz (8 times per second)
- Motion Sensors (`mot`): 8 Hz  
- Performance Metrics (`met`): **2 Hz** (every 0.5 seconds)

---

### 📡 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BRAVEWAVE SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

1. HEADSET INPUT:
   Emotiv Headset → Bluetooth → Computer

2. CORTEX API:
   Emotiv Launcher → WebSocket (localhost:6868) → BraveWave

3. DATA STREAMS:
   ├─ Mental Commands (com): PUSH power + confidence
   ├─ Motion Sensors (mot): Gyroscope + Accelerometer
   └─ Performance Metrics (met): Excitement + Engagement

4. SELECTION PROCESSING:
   Level 1 & 2: PUSH (5s hold) → Image metadata collected
   Level 3: Excitement (5s ≥ threshold) → Artwork metadata collected

5. AI GENERATION:
   Collected Metadata → Edge Function → Sora API → 8-second video

6. SOUNDTRACK:
   Collective Excitement Score → Soundtrack Selection → Audio playback

7. OUTPUT:
   Video + Soundtrack → Video Output Screen → Participant viewing
```

---

### 🎨 Multi-Headset Color Assignments

**🌈 Headset Colors (Auto-Assigned):**

Each connected headset automatically receives a unique color for visual differentiation:

| Order | Color | HSL Value |
|-------|-------|-----------|
| 1st | Primary (Cyan) | `hsl(var(--primary))` |
| 2nd | Green | `hsl(142, 76%, 36%)` |
| 3rd | Blue | `hsl(217, 91%, 60%)` |
| 4th | Purple | `hsl(280, 67%, 55%)` |
| 5th | Orange | `hsl(25, 95%, 53%)` |
| 6th+ | Cycles through palette | Repeats from start |

**🎯 Color Usage:**
- Border highlights on focused images
- Orbital rings in Level 3
- Progress indicators
- Command feedback panels

---

## 🆘 Support Resources

### 📖 Documentation Links

| Resource | URL | Purpose |
|----------|-----|---------|
| **Emotiv Cortex API** | [emotiv.gitbook.io/cortex-api](https://emotiv.gitbook.io/cortex-api/) | Technical API reference |
| **Emotiv Forums** | [forum.emotiv.com](https://forum.emotiv.com) | Community support |
| **Emotiv Support** | support@emotiv.com | Official tech support |

---

### 🔍 Debugging Tools

**🛠️ For Advanced Troubleshooting:**

1. **Browser Console** (F12):
   - View real-time event logs
   - Check for error messages
   - Monitor WebSocket connection status
   - Example: `🎧 Headset EPOCX-123 connection initiated`

2. **Emotiv Launcher Logs**:
   - View headset connection history
   - Check Cortex API status
   - Verify sensor contact quality

3. **Network Tab** (F12 → Network):
   - Monitor Sora API calls
   - Check video generation status
   - Diagnose timeout issues

---

### 🎓 Training Resources

**📚 Recommended Practice Sequence:**

1. **Solo Practice** (30 minutes):
   - Fit headset properly
   - Train PUSH command
   - Complete full Level 1 & 2 selection
   - Experience Level 3 emotion-based selection

2. **Two-Person Test** (45 minutes):
   - Practice simultaneous navigation
   - Test color differentiation
   - Verify independent tracking
   - Troubleshoot any conflicts

3. **Full Group Rehearsal** (60 minutes):
   - Run complete session with all headsets
   - Practice instructor coaching
   - Time each phase
   - Identify bottlenecks

---

## 📋 Quick Reference Card (Print for Participants)

```
╔════════════════════════════════════════════════════════════╗
║            🧠 BRAVEWAVE QUICK REFERENCE 🧠                 ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🎯 LEVELS 1 & 2 (PUSH-BASED SELECTION):                  ║
║  ────────────────────────────────────────                 ║
║  🔄 NAVIGATE: Tilt head left/right slowly                 ║
║  🖐️ SELECT:   PUSH command (hold 5 seconds)               ║
║  🎯 FOCUS:    Image zooms when you look at it             ║
║  📊 PROGRESS: Watch bar fill during PUSH hold             ║
║                                                            ║
║  🌍 LEVEL 3 (EMOTION-BASED SELECTION):                    ║
║  ──────────────────────────────────────                   ║
║  🔄 NAVIGATE: Tilt head to explore 15 artworks            ║
║  😊 EXCITE:   Feel genuine excitement about artwork       ║
║  ⏱️ SUSTAIN:  Hold excitement ≥5 seconds                  ║
║  ✨ AUTO:     Selection happens automatically!            ║
║  🎨 WATCH:    Your orbital ring shows excitement          ║
║                                                            ║
║  💡 UNIVERSAL TIPS:                                        ║
║  ─────────────────                                        ║
║  • Return head to neutral between tilts                   ║
║  • Stay relaxed - tension reduces accuracy                ║
║  • Your headset color shows your focus                    ║
║  • Motion freezes during selections (normal!)             ║
║  • Genuine feelings work best in Level 3                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🎊 Conclusion

BraveWave represents the **future of brain-computer interaction** - where thought, emotion, and AI converge to create unique artistic experiences.

### 🔑 Keys to Success:

1. **⚡ Preparation**: Headsets charged, trained, tested
2. **⏱️ Patience**: Allow time for setup and learning
3. **🗣️ Communication**: Clear coaching and encouragement
4. **🔧 Flexibility**: Troubleshoot calmly, have backups
5. **🎉 Celebration**: Positive reinforcement drives success!

### 🌟 What Makes BraveWave Special:

- **🧠 Pure Mind Control**: Zero mouse/keyboard - only thoughts
- **🌍 Collective Creation**: Group emotions shape the final art
- **🎨 AI-Generated**: Sora transforms selections into video
- **🎵 Emotional Soundtracks**: Music chosen by group excitement
- **🤝 Multi-User**: Unlimited headsets, independent tracking

---

**🚀 Ready to facilitate amazing brain-powered experiences?**

**Happy mind-controlling! 🧠✨🌍**

---

<div align="center">

*For additional support, consult the troubleshooting section or contact Emotiv support.*

**Version 3.0** | Updated for Level 3 Emotion-Based Selection

</div>
