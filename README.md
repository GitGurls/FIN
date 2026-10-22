<div align="center">

# 💸 FinPilot AI

An AI-powered personal finance platform — expense tracking, receipt OCR, a real-data-grounded AI copilot you can chat with, real-time multi-device sync, shared wallets for families and trips, and investment tracking, all in one app

[**Live Demo**](https://fin-eta-eight.vercel.app) · [Report a Bug](https://github.com/GitGurls/FIN/issues) · [Request a Feature](https://github.com/GitGurls/FIN/issues)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75FF?logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## Overview

FinPilot AI goes beyond a standard expense tracker. Every number the AI shows you — insights, the health score narration, chat answers, monthly reports — is generated **from your real transaction data**, not guessed. The app also syncs live across every device you're logged into, and supports shared budgets for families and trips with automatic expense splitting.

**Live app:** https://fin-eta-eight.vercel.app

## ✨ Features

### Core
- JWT authentication (register, login, profile, account deletion)
- Income & expense CRUD with custom categories
- Dashboard analytics via MongoDB aggregation pipelines — net worth, trends, category breakdown

### AI
| Feature | What it does |
|---|---|
| **AI Financial Health Score** | Deterministic 0–100 score (savings rate, budget adherence, spending consistency) with an AI-generated explanation of the biggest lever to improve it |
| **Chat with your expenses** | Natural-language Q&A grounded in your real transaction data, streamed live for a typing effect |
| **Receipt OCR** | Upload a photo → Cloudinary storage → Gemini Vision extracts merchant, amount, category → you confirm |
| **Voice entry** | Speak a transaction ("add 250 for lunch") — Gemini parses it into a structured entry for you to confirm |
| **Monthly AI Report** | Narrative summary + stats for any of the last 6 months, exportable as PDF |

### Real-time (Socket.io)
- Multi-device sync — transactions update instantly across every open device/tab
- Live dashboard, charts, and transaction list
- Live budget progress bar and real-time budget alerts (90% / 100% thresholds)

### Collaboration
- **Shared Wallet (Family Budget)** — create a group, invite members by email, see shared expenses live
- **Trip Mode** — equal-split expense tracking with an automatic settlement calculator ("who owes whom")

### Extras
- Investment tracker (holdings, gain/loss)
- Calendar view with a spending heatmap
- Live currency converter (Frankfurter API, no key needed)
- PDF & Excel export for transactions and reports
- Dark / light mode, installable PWA

---

## 🛠 Tech Stack

**Frontend** — React (Vite) · Tailwind CSS · Framer Motion · Recharts · Socket.io-client · jsPDF · SheetJS

**Backend** — Node.js · Express · MongoDB (Mongoose) · JWT · Socket.io

**AI** — Google Gemini 2.5 Flash (Vision OCR, streaming chat, health-score narration, voice parsing, report generation)

**Infra** — MongoDB Atlas · Cloudinary · Vercel (frontend) · Render (backend)

---

## 🚀 Getting Started

### Prerequisites
Free accounts for: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), [Cloudinary](https://cloudinary.com/users/register/free), and a [Gemini API key](https://aistudio.google.com/app/apikey).

### 1. Clone and install
```bash
git clone https://github.com/GitGurls/FIN.git
cd FIN
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY
npm install
npm run dev              # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env     # set VITE_API_URL to your backend URL
npm install
npm run dev               # runs on http://localhost:5173
```

Open `http://localhost:5173`, create an account, and explore.

> **Note:** Voice entry uses the browser's SpeechRecognition API, supported in Chrome (desktop & Android) only.


---

## 🗺 Roadmap / Known Limitations
- Shared Wallet / Trip invites currently require the invited person to already have an account (no email-invite-to-signup flow yet)
- Trip settlement suggestions use a greedy algorithm — correct, but not guaranteed to be the *minimum* number of transactions in every edge case
- Voice entry is Chrome-only (browser API limitation)



