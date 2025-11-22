# Building BraveWave Desktop App for Windows

This guide will help you create a Windows desktop executable (.exe) for BraveWave.

## Prerequisites

1. **Node.js** installed on your system (version 18 or higher)
2. **Git** installed
3. Windows operating system (for building Windows executables)

## Setup Steps

### 1. Add Build Scripts to package.json

Open your `package.json` file and add these scripts to the `"scripts"` section:

```json
"scripts": {
  "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && NODE_ENV=development electron electron.cjs\"",
  "electron:build": "npm run build && electron-builder --config electron-builder.json",
  "electron:build:win": "npm run build && electron-builder --win --config electron-builder.json"
}
```

Make sure your existing scripts (like `"dev"` and `"build"`) are still there. Just add these new ones.

### 2. Test in Development Mode

Before building, test the Electron app in development:

```bash
npm run electron:dev
```

This will:
- Start the Vite dev server
- Launch Electron with your app
- Enable hot-reload for quick testing

**IMPORTANT**: Make sure Emotiv Launcher is running and your headsets are connected before testing.

### 3. Build the Windows Executable

When ready to create the .exe file:

```bash
npm run electron:build:win
```

This will:
- Build your web app for production
- Package it into an Electron app
- Create Windows installers

### 4. Find Your Executable

After building, you'll find your app in the `dist-electron` folder:

- **BraveWave-X.X.X-Setup.exe** - Installer version (recommended for distribution)
- **BraveWave-X.X.X-Portable.exe** - Portable version (no installation needed)

## Distribution

### Installer Version (NSIS)
- Users run the Setup.exe
- Installs to Program Files
- Creates desktop shortcut
- Adds to Start Menu
- Can be uninstalled normally

### Portable Version
- Single .exe file
- No installation needed
- Can run from USB drive
- Perfect for testing or temporary use

## Important Notes

### Emotiv Cortex Requirement
⚠️ **Critical**: BraveWave requires Emotiv Cortex to be running on the same machine:
- Emotiv Launcher must be installed
- Cortex service must be running (localhost:6868)
- Headsets must be connected and paired
- Valid Emotiv credentials required

### First-Time Setup for Users
When distributing your app, users will need:
1. Install Emotiv Launcher from [emotiv.com](https://www.emotiv.com/developer/)
2. Connect and pair their headsets
3. Run BraveWave desktop app
4. Enter their Emotiv credentials in the connection panel

### Security Considerations
- The app uses `localhost:6868` for Cortex WebSocket connection
- No external network access for EEG data
- Credentials stored in browser localStorage
- All EEG processing happens locally

## Troubleshooting

### Build Fails
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed
- Check that you have write permissions to create dist-electron folder

### App Won't Connect to Cortex
- Verify Emotiv Launcher is running
- Check that localhost:6868 is accessible
- Ensure headsets are connected in Emotiv Launcher
- Try restarting both Emotiv Launcher and the BraveWave app

### App Opens But Shows Blank Screen
- Check the console for errors (press F12 in development)
- Ensure the build completed successfully
- Try rebuilding: `npm run build` then `npm run electron:build:win`

## Advanced Options

### Customize App Icon
Replace `public/favicon.ico` with your custom icon (256x256 recommended)

### Change App Name
Edit `electron-builder.json`:
```json
{
  "productName": "YourAppName"
}
```

### Add Mac/Linux Support
Install platform-specific tools and run:
- Mac: `electron-builder --mac`
- Linux: `electron-builder --linux`

## File Structure

```
your-project/
├── electron.cjs              # Main Electron process
├── electron-preload.cjs      # Preload script for security
├── electron-builder.json     # Build configuration
├── dist-electron/            # Built executables (after build)
│   ├── BraveWave-Setup.exe
│   └── BraveWave-Portable.exe
├── dist/                     # Web build output
└── src/                      # Your React app source
```

## Need Help?

- Check Emotiv documentation: https://emotiv.gitbook.io/cortex-api/
- Electron Builder docs: https://www.electron.build/
- Open an issue on your GitHub repository

---

Built with ❤️ using React, Vite, Electron, and Emotiv Cortex API
