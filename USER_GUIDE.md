# BraveWave User Guide for Instructors

## Overview

BraveWave is a mind-controlled image selection experience that culminates in AI-generated video content. This guide will help you facilitate engaging sessions with your audience using Emotiv EEG headsets.

## What Participants Will Experience

1. **Level 1 Selection**: Navigate and select images using only mental commands (PUSH) and head motion
2. **Level 2 Selection**: Make a second selection from a new set of images
3. **Excitement Levels 1 & 2**: During video generation, participants make emotion-based selections using excitement detection
4. **Video Output**: Watch the AI-generated video with a soundtrack chosen based on collective excitement scores

---

## Prerequisites

### Required Hardware
- **Emotiv EEG Headsets**: One per participant (supports unlimited headsets simultaneously)
- **Computer**: Windows PC with adequate processing power
- **Internet Connection**: Required for AI video generation

### Required Software
- **Emotiv Launcher**: Must be installed and running before starting BraveWave
- **BraveWave Desktop App**: The Windows executable (.exe)

---

## Pre-Session Setup (15-20 minutes before participants arrive)

### 1. Install and Launch Emotiv Software
```
1. Install Emotiv Launcher from emotiv.com
2. Launch Emotiv Launcher
3. Ensure it's running in the system tray
```

### 2. Configure Developer Credentials
```
1. Create/login to Emotiv developer account at emotiv.com
2. Navigate to developer portal
3. Create a new application
4. Copy your Client ID and Client Secret
5. Keep these credentials secure - you'll need them in BraveWave
```

### 3. Train Mental Commands (CRITICAL)
For best results, train each headset user in EmotivBCI:
```
1. Open EmotivBCI software
2. Navigate to Mental Commands training
3. Train PUSH command (most important - used for selections)
4. Train head motion detection
5. Aim for 90%+ training accuracy
6. Save the training profile
```

### 4. Prepare Headsets
```
1. Charge all headsets fully (4+ hours of battery recommended)
2. Ensure sensor contacts are clean
3. Apply saline solution to felt sensor pads
4. Test each headset connection in Emotiv Launcher
5. Verify signal quality (green indicators in Emotiv Launcher)
```

---

## Session Walkthrough

### Step 1: Launch BraveWave
1. Ensure Emotiv Launcher is running
2. Double-click the BraveWave desktop executable
3. Application will load on `http://localhost:8080`

### Step 2: Connect Headsets
1. Click "Initialize Session" button on the hero screen
2. Enter your Emotiv Client ID and Client Secret
3. Click "Connect to Cortex"
4. Each connected headset will appear with a unique color
5. Verify all headsets show "CONNECTED" status

**✓ Success Indicator**: Each headset displays with a colored indicator and connection status

### Step 3: Image Selection - Level 1
**What participants do:**
- **Navigate**: Tilt head left/right to move focus between images
- **Select**: Perform PUSH mental command and hold for 5 seconds on focused image
- **Visual Feedback**: Focused image zooms; progress bar shows push hold duration

**Instructor Tips:**
- Encourage slow, deliberate head tilts
- Remind users to hold PUSH command steady for full 5 seconds
- Multiple users can navigate independently - each has their own color highlight

**✓ Success Indicator**: After each user selects an image, app auto-advances to Level 2

### Step 4: Image Selection - Level 2
Same process as Level 1:
- Navigate with head motion
- Select with 5-second PUSH hold
- Each user selects one more image

**✓ Success Indicator**: After all selections complete, app begins video generation and transitions to Excitement Level 1

### Step 5: Excitement Selections (Levels 1 & 2)
**What's happening:**
- AI video generation runs in the background (2-5 minutes)
- Participants make selections based on excitement levels
- System monitors mental command power as excitement proxy
- Higher excitement = faster automatic selection

**Instructor Tips:**
- Explain this is a "distraction" activity during video generation
- Encourage genuine emotional responses to images
- Excitement levels determine the final video soundtrack

**✓ Success Indicator**: Progression through both excitement levels, then automatic transition to video output

### Step 6: Video Output
- AI-generated video plays automatically
- Displays selected soundtrack based on collective excitement score
- Shows "Collective Excitement Score" from all participants

---

## Troubleshooting Guide

### Headset Won't Connect

**Problem**: Headset not appearing in BraveWave

**Solutions**:
1. Verify headset appears in Emotiv Launcher (green indicator)
2. Restart Emotiv Launcher
3. Restart BraveWave application
4. Check headset battery level
5. Re-pair headset via Bluetooth if necessary
6. Ensure BraveWave credentials match your Emotiv developer account

---

### Poor Signal Quality

**Problem**: Headset connected but commands not registering

**Solutions**:
1. Check sensor contact quality in Emotiv Launcher
2. Apply more saline solution to sensor pads
3. Adjust headset position on participant's head
4. Ensure hair is not blocking sensors
5. Wait 2-3 minutes for sensors to settle after application

**Signal Quality Indicators**:
- Green = Excellent
- Yellow = Fair (may work but inconsistent)
- Red = Poor (commands will not register)

---

### PUSH Command Not Working

**Problem**: Participant holds PUSH but selection doesn't complete

**Solutions**:
1. Verify PUSH command was trained in EmotivBCI
2. Check real-time command indicator at top of screen
3. Ensure participant holds PUSH for full 5 seconds
4. Remind participant to maintain steady mental effort
5. Retrain PUSH command in EmotivBCI if consistently failing
6. Check signal quality (must be green/yellow, not red)

---

### Head Motion Navigation Issues

**Problem**: Focus not moving when tilting head

**Solutions**:
1. Ensure head motion was enabled during EmotivBCI training
2. Use deliberate, larger tilt movements
3. Return head to neutral position between tilts (discrete step navigation)
4. Check if participant is holding PUSH (motion freezes during PUSH hold)
5. Verify gyroscope data in Emotiv Launcher

---

### Video Generation Fails

**Problem**: Stuck on Results screen or error during generation

**Solutions**:
1. Check internet connection
2. Verify OpenAI API key is valid and has Sora access
3. Check browser console for specific error messages
4. Ensure image metadata tags exist in selected images
5. Try generating again after 1-2 minutes
6. Verify Lovable Cloud edge function timeout is set to 6 minutes

---

### Application Freezes or Crashes

**Problem**: BraveWave becomes unresponsive

**Solutions**:
1. Force quit and restart BraveWave
2. Ensure Emotiv Launcher is still running
3. Restart Emotiv Launcher
4. Reboot computer if problem persists
5. Check system resources (CPU/memory usage)

---

### Multiple Headsets Interfere

**Problem**: One user's commands affect another user's selections

**Solutions**:
- This should not happen - each headset has independent tracking
- If occurring, check that each headset has a unique color indicator
- Restart BraveWave to re-initialize headset assignments
- Verify each headset is paired to separate Bluetooth connections

---

## Best Practices for Instructors

### Before the Session
- ✓ Test full workflow with at least one headset 24 hours before session
- ✓ Have extra charged headsets as backups
- ✓ Prepare extra saline solution
- ✓ Print quick reference cards for participants (head tilt = navigate, PUSH = select)

### During the Session
- ✓ Allow 5-10 minutes per participant for headset fitting and signal stabilization
- ✓ Monitor real-time command indicators on screen
- ✓ Encourage patience - mental commands take practice
- ✓ Remind users to stay relaxed and focused
- ✓ Celebrate when selections work - positive reinforcement helps

### Timing Expectations
- Headset setup per person: 3-5 minutes
- Level 1 selection: 2-4 minutes per person
- Level 2 selection: 2-4 minutes per person
- Excitement selections: 3-5 minutes total
- Video generation: 2-5 minutes (happens during excitement selections)
- **Total experience**: ~15-25 minutes for single participant, scales with multiple users

---

## Technical Details

### System Requirements
- **OS**: Windows 10/11
- **Browser**: Chromium-based (bundled in desktop app)
- **Connection**: Emotiv Cortex API via WebSocket (`wss://localhost:6868`)
- **Storage**: Credentials stored in browser localStorage

### Mental Commands Used
- **PUSH**: Primary selection command (5-second hold required)
- **Head Motion**: Discrete tilt-step navigation (left/right)
- **Excitement Detection**: Monitored via mental command power levels

### Data Flow
```
Emotiv Headset → Emotiv Launcher → Cortex API → BraveWave
→ Image Selections → Sora API → AI Video Generation
→ Excitement Scores → Soundtrack Selection → Video Output
```

---

## Support Resources

### Emotiv Support
- **Documentation**: https://emotiv.gitbook.io/cortex-api/
- **Support**: support@emotiv.com
- **Forums**: forum.emotiv.com

### BraveWave Support
- Check console logs in Dev Tools (F12) for detailed error messages
- Review this guide's troubleshooting section
- Test with a single headset to isolate multi-user issues

---

## Quick Reference Card (Print for Participants)

```
╔════════════════════════════════════════╗
║       BRAVEWAVE QUICK REFERENCE        ║
╠════════════════════════════════════════╣
║                                        ║
║  NAVIGATE:  Tilt head left/right       ║
║  SELECT:    PUSH command (hold 5 sec)  ║
║  FOCUS:     Image zooms when focused   ║
║  EXCITED:   Auto-select on high power  ║
║                                        ║
║  Tips:                                 ║
║  • Return head to neutral between tilts║
║  • Hold PUSH steady for full 5 seconds ║
║  • Stay relaxed and focused            ║
║  • Watch progress bar during PUSH      ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## Conclusion

BraveWave offers a unique brain-computer interface experience. With proper setup and this guide, you can facilitate engaging sessions that demonstrate the future of human-computer interaction. Remember: patience and preparation are key to success.

**Happy mind-controlling!** 🧠✨
