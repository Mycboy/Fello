# Fello — Anonymous 1-on-1 Realtime Chat ⚡

A real-time, privacy-first 1-on-1 anonymous chat application built with **React**, **Node.js**, **Express**, and **Socket.io**. Designed with a modern cyberpunk glassmorphism aesthetic, zero IP tracking, and instant pure random stranger matchmaking.

---

## 🌟 The 3 Pages

### 1. **Authentication & Incognito Mask Page (`/`)**
- **Quick Anonymous Mode**: Write your own custom nickname or click **Random** to generate unique hacker/cyber personas (e.g., *ShadowDrifter*, *NeonPhantom*).
- **Mask Avatar Picker**: Pick your anonymous avatar emoji (👻, 🦊, ⚡, 🥷, 👾, etc.).
- **Account Login / Sign Up Tab**: Option for returning users who wish to save their personas or log in via email & password. Demo credentials (`test@fello.chat` / `password123`) included.

### 2. **Anonymous Command Hub / Dashboard**
- **Matchmaking Radar Terminal**: Futuristic pulsating radar scanner that searches the live network pool for any available stranger.
- **Pure Random Matchmaking**: No tags or interest filters—simply click **"Find Random Stranger"** to pair with anyone online.
- **Live Network Telemetry**: Real-time counter of online strangers, active chat sessions, and average matchmaking latency.
- **Incognito Persona Card**: Edit your display nickname or avatar mask at any time without logging out.

### 3. **Encrypted 1-on-1 Chatting Room (With Photos & Audio)**
- **Live 1-on-1 Realtime Socket Tunnel**: Direct message routing between paired sockets.
- **📷 Photo & Image Sharing**:
  - Attach and send photos via the camera/image button (📷).
  - Client-side canvas compression ensures fast, lightweight transmission.
  - Caption support on photos.
  - Full-screen **Lightbox Modal** to view shared photos in high resolution.
- **🎙️ Audio Voice Notes**:
  - Record voice messages directly using the microphone button (🎙️).
  - Live recording console with duration timer and sound wave visualizer.
  - Custom in-bubble **Audio Player** with play/pause controls, dynamic waveform bars, and duration counter.
- **Typing Indicator**: Real-time `"Stranger is typing..."` bouncing status.
- **"🎲 Break The Ice" Prompts**: Instant catalog of deep and engaging icebreakers.
- **Quick Reactions Tray**: 1-click emoji reactions (`🔥`, `😂`, `💀`, `🤯`, `👏`, `❤️`, `🚀`).
- **Skip & Next Stranger**: Leave and re-enter the queue in one click.
- **Ephemeral Session Disconnect**: Permanent burn on exit—no message history, photos, or voice notes are stored on any database.
- **Rate Limiting**: Built-in protection against message flooding, click spamming, and API abuse.
- **Synthesized Audio**: Subtle Web Audio API sounds for messages sent, messages received, recording start/stop, and match notifications (with Mute toggle).

---

## 🚀 How to Run Locally

### Start Server & Client Concurrently:
```bash
npm run dev
```
- **Backend Socket.IO Server**: `http://localhost:5000`
- **Frontend Vite Web App**: `http://localhost:5173`

---

## 🧪 Testing Anonymous Chat Between Two People

1. Open `http://localhost:5173` in **Browser Tab #1**:
   - Choose a nickname (e.g. `ShadowFox`), pick avatar `🦊`, and enter.
2. Open `http://localhost:5173` in **Browser Tab #2** (or in an Incognito window):
   - Choose a different nickname (e.g. `NeonRaven`), pick avatar `⚡`, and enter.
3. Click **"Find Random Stranger"** on both tabs.
4. They will instantly match and connect into a private encrypted 1-on-1 room!
5. Send messages, attach photos, record voice notes, and test typing indicators!
