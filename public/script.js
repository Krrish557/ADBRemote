const BASE = "http://localhost:3000";

// ── UI helpers ──────────────────────────────────────────────
function setStatus(msg, type = "info") {
    const el = document.getElementById("statusMsg");
    if (!el) return;
    el.textContent = msg;
    el.className = `status-msg ${type}`;
}

function setConnectionDot(state) {
    const dot = document.getElementById("statusDot");
    if (!dot) return;
    dot.className = "status-indicator " + state; // "connected" | "error" | ""
}

// ── Save IP ──────────────────────────────────────────────────
async function useIP() {
    const tvip = document.getElementById("ipinput").value.trim();
    if (!tvip) { setStatus("Enter an IP address first.", "err"); return; }

    setStatus("Connecting…", "info");
    try {
        const res = await fetch(`/save-ip`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: tvip })
        });
        if (res.ok) {
            setStatus(`Connected to ${tvip}`, "ok");
            setConnectionDot("connected");
        } else {
            throw new Error(`Server responded ${res.status}`);
        }
    } catch (err) {
        setStatus("Connection failed: " + err.message, "err");
        setConnectionDot("error");
    }
}

// ── Send key code ────────────────────────────────────────────
async function sendKey(keycode) {
    try {
        const res = await fetch(`/send-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keycode })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        setStatus("Key error: " + err.message, "err");
    }
}

// ── Send text ────────────────────────────────────────────────
async function sendText() {
    const text = document.getElementById("textInput").value;
    if (!text) return;

    try {
        const res = await fetch(`/send-text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (res.ok) {
            document.getElementById("textInput").value = "";
            setStatus("Text sent.", "ok");
        } else {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err) {
        setStatus("Text error: " + err.message, "err");
    }
}

// ── Install APK ──────────────────────────────────────────────
async function installApk() {
    const fileInput = document.getElementById("apkFile");
    if (!fileInput.files.length) {
        setStatus("Select an APK file first.", "err");
        return;
    }

    const formData = new FormData();
    formData.append("apk", fileInput.files[0]);

    setStatus("Installing APK…", "info");
    try {
        const res = await fetch(`/install-apk`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setStatus("APK installed successfully.", "ok");
        } else {
            throw new Error(data.error || `HTTP ${res.status}`);
        }
    } catch (err) {
        setStatus("Install error: " + err.message, "err");
    }
}

// ── Screenshot ───────────────────────────────────────────────
async function takeScreenshot() {
    setStatus("Capturing screenshot…", "info");
    try {
        const res = await fetch(`/screenshot`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const img = document.getElementById("screenshotImage");
        img.src = url;

        const section = document.getElementById("screenshotSection");
        section.style.display = "block";
        setStatus("Screenshot captured.", "ok");
    } catch (err) {
        setStatus("Screenshot error: " + err.message, "err");
    }
}

// ── Reboot ───────────────────────────────────────────────────
async function rebootTV() {
    if (!confirm("Reboot the TV?")) return;
    setStatus("Rebooting…", "info");
    try {
        const res = await fetch(`/reboot`, { method: "POST" });
        if (res.ok) {
            setStatus("Reboot command sent.", "ok");
            setConnectionDot("");
        } else {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err) {
        setStatus("Reboot error: " + err.message, "err");
    }
}

// ── File name display ────────────────────────────────────────
function updateFileName(input) {
    const label = document.getElementById("apkFileName");
    label.textContent = input.files.length ? input.files[0].name : "Choose .apk file";
}