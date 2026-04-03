# ADB TV Remote

A local web-based remote control for Android TV devices. Control your TV from any browser on your network using ADB (Android Debug Bridge) over Wi-Fi — no physical remote needed.

---

## Features

- D-pad navigation and OK button
- Home and Back keys
- Volume up, volume down, and mute
- Text input (type and send directly to the TV)
- APK sideloading via file upload
- Screenshot capture (pulls a live screengrab from the TV)
- Reboot command
- Live connection status indicator

---

## Requirements

- [Node.js](https://nodejs.org/) v14 or higher — **or** Docker
- [ADB](https://developer.android.com/tools/adb) installed and available in your system `PATH` (not needed if using Docker — it is included in the image)
- An Android TV with **Developer Options** and **ADB over Wi-Fi** enabled

---

## Installation

### Option A — Run with Node.js

**1. Clone the repository**

```bash
git clone https://github.com/your-username/adb-tv-remote.git
cd adb-tv-remote
```

**2. Install dependencies**

```bash
npm install express cors multer
```

**3. Place frontend files**

Put `index.html`, `style.css`, and `script.js` inside a `public/` folder:

```
adb-tv-remote/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── Dockerfile
├── docker-compose.yml
└── uploads/        ← created automatically on first APK install
```

**4. Start the server**

```bash
node server.js
```

---

### Option B — Run with Docker

**1. Clone the repository**

```bash
git clone https://github.com/your-username/adb-tv-remote.git
cd adb-tv-remote
```

**2. Build and start the container**

```bash
docker compose up --build
```

The container uses `network_mode: host` so ADB can reach devices on your local network directly. ADB (`android-sdk-platform-tools`) is installed automatically inside the image — you do not need it on your host machine.

To run in the background:

```bash
docker compose up --build -d
```

To stop it:

```bash
docker compose down
```

> **Note:** `network_mode: host` only works on Linux. On macOS and Windows, Docker runs inside a VM and host networking is not supported. Use the Node.js method on those platforms, or connect ADB manually before starting the container.

---

## Enabling ADB on Your TV

### Method 1 — Settings menu

1. Go to **Settings → Device Preferences → About**
2. Click **Build** 7 times to unlock Developer Options
3. Go to **Settings → Device Preferences → Developer Options**
4. Enable **USB Debugging**
5. Note your TV's IP address under **Settings → Network → About**

### Method 2 — Activity Launcher (for TVs with no visible Developer Options)

Some Android TV builds hide the Developer Options menu entirely. You can bypass this using the Activity Launcher app.

1. Install **Activity Launcher** from the Play Store, Aptoide, or sideload it
2. Open Activity Launcher and search for any of the following activities — use whichever appears on your device:
   - `DevelopmentSettings`
   - `Developer options`
   - `DevelopmentSettingsActivity`
   - `Settings$DevelopmentSettingsActivity`
3. Launch the activity
4. Enable the following:
   - **USB Debugging** ← most important, required for ADB
   - **Wireless Debugging** ← needed on Android 11+ for Wi-Fi ADB
   - **Stay Awake** ← recommended to prevent the TV sleeping mid-session

---

## Usage

Open your browser and go to:

```
http://localhost:3000
```

**Connect to your TV**

1. Enter your TV's IP address (e.g. `192.168.1.42`) in the input field
2. Click **CONNECT**
3. The status indicator in the top-right turns solid when connected

If this is your first time connecting, your TV may show a prompt asking you to allow ADB debugging — accept it on the TV.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/save-ip` | Set TV IP and run `adb connect` |
| POST | `/send-key` | Send a keyevent code to the TV |
| POST | `/send-text` | Type text input on the TV |
| POST | `/install-apk` | Upload and sideload an APK |
| GET | `/screenshot` | Capture and return a PNG screenshot |
| POST | `/reboot` | Reboot the TV |

---

## Common Key Codes

| Key | Code |
|-----|------|
| Up | 19 |
| Down | 20 |
| Left | 21 |
| Right | 22 |
| OK / Enter | 23 |
| Home | 3 |
| Back | 4 |
| Volume Up | 24 |
| Volume Down | 25 |
| Mute | 164 |
| Power | 26 |
| Menu | 82 |

A full list is available in the [Android KeyEvent documentation](https://developer.android.com/reference/android/view/KeyEvent).

---

## Troubleshooting

**`adb: command not found`**
Install ADB and make sure it is in your system `PATH`. On macOS: `brew install android-platform-tools`. Not needed if using Docker.

**TV not accepting connection**
- Confirm ADB over Wi-Fi / USB Debugging is enabled on the TV
- Make sure your machine and TV are on the same network
- Try running `adb connect <TV_IP>:5555` manually in your terminal first

**Docker: ADB can't find the TV**
Make sure you are on Linux and that `network_mode: host` is active in `docker-compose.yml`. On macOS/Windows, host networking is not supported inside Docker — use the Node.js method instead.

**Screenshot is blank or fails**
Some TVs block screen capture via ADB due to DRM restrictions. This is a device-level limitation and cannot be worked around in software.

**APK install fails**
- The APK must be compiled for Android TV or be compatible with it
- Make sure "Install from Unknown Sources" is enabled in Developer Options

---

## License

MIT