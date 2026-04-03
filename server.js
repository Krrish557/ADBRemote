const express = require("express");
const { exec } = require("child_process");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const cors    = require("cors");

const app    = express();
const port   = 3000;
const upload = multer({ dest: "uploads/" });

app.use(cors());                        // allow requests from the browser page
app.use(express.json());
app.use(express.static("public"));

let ip = "";

// ── Helper: run adb command ────────────────────────────────
function adb(args) {
    return new Promise((resolve, reject) => {
        if (!ip) return reject(new Error("No IP set. Connect first."));
        exec(`adb -s ${ip}:5555 ${args}`, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout.trim());
        });
    });
}

// ── Save IP & connect ──────────────────────────────────────
app.post("/save-ip", (req, res) => {
    const newIp = (req.body.ip || "").trim();
    if (!newIp) return res.status(400).json({ error: "IP is required." });

    ip = newIp;
    console.log("Connecting to:", ip);

    exec(`adb connect ${ip}:5555`, (err, stdout, stderr) => {
        if (err) {
            console.error("adb connect error:", stderr);
            return res.status(500).json({ error: stderr || err.message });
        }
        console.log("adb connect:", stdout.trim());
        res.json({ success: true, message: stdout.trim() });
    });
});

// ── Send key ───────────────────────────────────────────────
app.post("/send-key", async (req, res) => {
    const { keycode } = req.body;
    if (keycode === undefined) return res.status(400).json({ error: "keycode required." });

    try {
        await adb(`shell input keyevent ${keycode}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Send text ──────────────────────────────────────────────
app.post("/send-text", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required." });

    // Escape special shell characters
    const escaped = text.replace(/['"\\&|<>; ]/g, "\\$&");
    try {
        await adb(`shell input text "${escaped}"`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Install APK ────────────────────────────────────────────
app.post("/install-apk", upload.single("apk"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No APK file uploaded." });

    const apkPath = path.resolve(req.file.path);
    try {
        const out = await new Promise((resolve, reject) => {
            if (!ip) return reject(new Error("No IP set. Connect first."));
            exec(`adb -s ${ip}:5555 install -r "${apkPath}"`, (err, stdout, stderr) => {
                if (err) return reject(new Error(stderr || err.message));
                resolve(stdout.trim());
            });
        });
        res.json({ success: true, message: out });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        fs.unlink(apkPath, () => {});   // clean up temp file
    }
});

// ── Screenshot ─────────────────────────────────────────────
app.get("/screenshot", async (req, res) => {
    const remote = "/sdcard/screen.png";
    const local  = path.join(__dirname, "screen.png");

    try {
        await adb(`shell screencap -p ${remote}`);
        await adb(`pull ${remote} "${local}"`);
        await adb(`shell rm ${remote}`);

        res.sendFile(local, err => {
            fs.unlink(local, () => {});     // clean up after sending
            if (err && !res.headersSent) res.status(500).json({ error: err.message });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Reboot ─────────────────────────────────────────────────
app.post("/reboot", async (req, res) => {
    try {
        await adb("reboot");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Start ──────────────────────────────────────────────────
app.listen(port, () => console.log(`ADB Remote running → http://localhost:${port}`));