# FinPilot AI — Your Personal Finance Copilot

A full AI-powered personal finance platform: expense tracking, receipt OCR,
an AI financial copilot you can chat with, real-time multi-device sync,
shared wallets for families and trips, investment tracking, and more.

## Stack
- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, Recharts, lucide-react, socket.io-client, jsPDF, SheetJS (xlsx)
- **Backend:** Node.js + Express, MongoDB (Mongoose), JWT auth, Socket.io
- **AI:** Google Gemini 2.5 Flash (receipt OCR, financial Q&A + streaming, health-score narration, voice parsing, monthly reports)
- **Storage:** Cloudinary (receipt images)
- **Currency:** Frankfurter.app (free, no key needed)

## Getting API keys (all free tier)

**MongoDB Atlas** — https://www.mongodb.com/cloud/atlas/register → free M0
cluster → Database Access (create a user) → Network Access (allow 0.0.0.0/0
for dev) → Connect → "Drivers" → copy the connection string into `MONGO_URI`.

**Cloudinary** — https://cloudinary.com/users/register/free → Dashboard shows
Cloud Name, API Key, API Secret directly.

**Gemini API key** — https://aistudio.google.com/app/apikey → "Create API key".
Free tier has rate limits (a few requests/min) — fine for dev/demo, not production.

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY
npm install
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173, register an account, and explore. Voice entry
needs Chrome (desktop or Android) — Safari/Firefox don't support the
SpeechRecognition API used.

## Full feature list

### Core
- JWT auth (register/login/profile/delete), income & expense CRUD, categories
- Dashboard analytics via MongoDB aggregation: net worth, trends, category breakdown

### AI
- **AI Financial Health Score** — deterministic 0-100 formula (savings rate,
  budget adherence, spending consistency) + AI-generated explanation
- **Chat with your expenses** — real-data-grounded Q&A, streamed live over
  WebSocket for a typing effect
- **Receipt OCR** — Cloudinary upload → Gemini Vision → editable suggested transaction
- **Voice entry** — speak a transaction ("add 250 for lunch"), Gemini parses it
  into type/amount/category/note, you confirm before it's saved
- **Monthly AI Report** — narrative summary + stats for any of the last 6
  months, exportable as PDF

### Real-time (Socket.io)
- Multi-device sync — transactions update instantly across every open
  device/tab for the same user
- Live dashboard, charts, and transaction list
- Live budget progress bar
- Real-time budget alerts (90% / 100% thresholds, deduplicated per month)

### Collaboration
- **Shared Wallet (Family Budget)** — create a group, invite members by
  email, everyone sees shared expenses live
- **Trip Mode** — same group mechanism with equal-split expense tracking and
  an automatic settlement calculator (minimal "who owes whom" suggestions)

### Extras
- **Investment Tracker** — track holdings, invested vs current value, gain/loss
- **Calendar view** — month grid with a spending heatmap, click a day for its transactions
- **Currency converter** — live rates via Frankfurter, no API key needed
- **PDF & Excel export** — transactions list and monthly reports
- **Dark / Light mode** — toggle in the sidebar, persisted per device
- **PWA support** — installable, works offline for cached pages (app icons included)

## Notes & honest limitations
- Shared Wallet / Trip invites require the invited person to already have a
  FinPilot AI account (no email-invite-to-signup flow yet)
- Settlement suggestions use a simple greedy algorithm — correct, but not
  necessarily the *minimum* number of transactions in every edge case
- Voice entry depends on the browser's SpeechRecognition API (Chrome only)
- None of this has been tested against live API keys end-to-end (I don't have
  your credentials) — if something errors on first run, share the message and
  it can be fixed quickly

## Deployment
- Backend: Render / Railway (needs persistent WebSocket support — both work)
- Frontend: Vercel / Netlify (set `VITE_API_URL` to your deployed backend URL)
- Render's free tier cold-starts after inactivity (~30-50s first request) —
  the socket reconnects automatically after that
