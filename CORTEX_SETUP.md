# Emotiv Cortex API Integration Setup

This guide will help you set up and run the NeuroVision app with real EEG data from your Emotiv headset.

## Prerequisites

1. **Emotiv Headset** (Insight, EPOC, EPOC X, etc.)
2. **Emotiv Launcher** installed on your computer
3. **Emotiv Developer Account** with app credentials

## Step 1: Install Emotiv Launcher

1. Download Emotiv Launcher from [https://www.emotiv.com/emotiv-launcher/](https://www.emotiv.com/emotiv-launcher/)
2. Install and launch the application
3. Log in with your Emotiv account
4. Make sure your headset is paired and connected

## Step 2: Get Developer Credentials

1. Go to [https://www.emotiv.com/my-account/cortex-apps/](https://www.emotiv.com/my-account/cortex-apps/)
2. Log in with your Emotiv account
3. Click **"Create New App"** or use an existing app
4. Note down your:
   - **Client ID**
   - **Client Secret**

## Step 3: Train Mental Commands (Optional but Recommended)

For better accuracy, train your mental commands in EmotivBCI:

1. Open EmotivBCI (comes with Emotiv Launcher)
2. Connect your headset
3. Go to **Mental Commands** tab
4. Train at least 2-3 commands:
   - **Push** - for selecting images
   - **Pull** - for deselecting images
   - **Left/Right** - for navigation (optional)
5. Save your profile with a memorable name

## Step 4: Run the Application Locally

**IMPORTANT**: You **must** run this app locally on your computer (not in Lovable preview) because:
- Cortex API runs locally at `ws://localhost:6868` (insecure WebSocket)
- Browsers block insecure WebSocket connections from HTTPS pages
- Lovable preview uses HTTPS, so it cannot connect to local Cortex

### Setup Instructions:

1. Clone your project repository:
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure Emotiv Launcher is running in the background

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open **http://localhost:8080** (not https://) in your browser

6. In the **Cortex Connection** panel:
   - Enter your **Client ID**
   - Enter your **Client Secret**
   - Click **"Connect to Cortex"**

### Why This Matters:

- ✅ **http://localhost:8080** → Can connect to `ws://localhost:6868` ✓
- ❌ **https://lovable.app/preview** → Cannot connect to `ws://localhost:6868` ✗

The local dev server runs over HTTP, which allows WebSocket connections to the local Cortex service.

## Step 5: Using Mental Commands

Once connected, the system will respond to your mental commands:

### Available Commands:

- **PUSH** / **PULL** → Select/deselect the currently focused image
- **LEFT** / **RIGHT** → Navigate horizontally through images
- **LIFT** / **DROP** → Navigate vertically through images
- **NEUTRAL** → No action

### Tips for Best Results:

1. **Good Signal Quality**: Ensure all sensors are making good contact
2. **Consistent Thoughts**: Use the same mental imagery you trained with
3. **Power Threshold**: Commands need >30% power to activate
4. **Stay Calm**: Works best when you're relaxed and focused

## Troubleshooting

### "Failed to connect to Cortex service"
- ✅ Check that Emotiv Launcher is running
- ✅ Verify you're using the correct WebSocket URL (ws://localhost:6868)
- ✅ Make sure no firewall is blocking the connection

### "No headsets found"
- ✅ Turn on your Emotiv headset
- ✅ Pair the headset with your computer
- ✅ Check battery level
- ✅ Ensure proper sensor contact

### "Authorization failed"
- ✅ Double-check your Client ID and Client Secret
- ✅ Make sure you're logged into Emotiv Launcher
- ✅ Verify your Emotiv account is active

### Mental commands not responding
- ✅ Load your trained profile in the app
- ✅ Check signal quality in EmotivBCI
- ✅ Re-train commands if needed
- ✅ Try increasing the power threshold in your mental imagery

## API Reference

Full Cortex API documentation: [https://emotiv.gitbook.io/cortex-api/](https://emotiv.gitbook.io/cortex-api/)

### Key API Methods Used:

- `getCortexInfo` - Get Cortex service information
- `requestAccess` - Request permission to access Cortex
- `authorize` - Authenticate and get session token
- `queryHeadsets` - List available headsets
- `controlDevice` - Connect to headset
- `createSession` - Start an EEG session
- `subscribe` - Subscribe to data streams (mental commands)
- `queryProfile` - List trained mental command profiles
- `setupProfile` - Load a trained profile

## Mental Command Stream Data

The app receives mental command events in this format:

```typescript
{
  com: string,  // Command name: "push", "pull", "left", "right", "lift", "drop", "neutral"
  pow: number,  // Power/confidence: 0.0 to 1.0
  time: number  // Timestamp
}
```

## Development Notes

- The Cortex API runs locally via WebSocket at `ws://localhost:6868`
- All communication is in JSON-RPC 2.0 format
- Session tokens are temporary and tied to your Emotiv account
- Mental command data streams in real-time once subscribed
- You can train up to 13 different mental commands

## Security Notes

⚠️ **For Local Development Only**

This implementation stores Client ID and Secret in the browser for local use. For production deployment:

1. **Never** commit credentials to version control
2. Use environment variables or a backend proxy
3. Consider using Lovable Cloud to securely store secrets
4. Implement proper authentication and authorization

## Need Help?

- **Emotiv Support**: [https://emotiv.zendesk.com/](https://emotiv.zendesk.com/)
- **Cortex API Docs**: [https://emotiv.gitbook.io/cortex-api/](https://emotiv.gitbook.io/cortex-api/)
- **Community Forum**: [https://emotiv.com/community/](https://emotiv.com/community/)

---

Happy mind-controlling! 🧠✨
