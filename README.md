# LifeStream Enterprise V4.0 — Smart Emergency Blood Network & Autonomous Drone Dispatch

> **Autonomous Medical Emergency Blood Logistics Platform**  
> *Google Health Standard • Real-Time Geospatial Radar • Cold-Chain IoT Telemetry (2°C–6°C)*

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-blood--match--api.vercel.app-1a73e8?logo=vercel)](https://blood-match-api.vercel.app)
[![Automated Tests](https://img.shields.io/badge/Automated%20Tests-5%2F5%20Passing-10b981?logo=node.js)](test/engine.test.js)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](frontend/)
[![Leaflet.js](https://img.shields.io/badge/Geospatial-Leaflet%20Radar%20Map-199900?logo=leaflet)](frontend/src/components/RadarMap.jsx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎬 Media Showcase & Screenshot Gallery
Complete visual documentation and uncropped 1920×1080 canonical screenshots are available in [`docs/showcase/screenshots/`](docs/showcase/screenshots/):
- 🗺️ [**Geospatial Live Radar Map**](docs/showcase/screenshots/01_desktop_live_radar.png)
- 📦 [**5-Stage Delivery Tracker with Cold-Chain IoT (2°C–6°C)**](docs/showcase/screenshots/02_desktop_delivery_tracker.png)
- 🩸 [**Clinical MTP 1:1:1 Resuscitation & Extended Phenotype Matrix**](docs/showcase/screenshots/03_desktop_clinical_mtp.png)
- 💻 [**Algorithmic Studio & Visual Memory State Tracer**](docs/showcase/screenshots/04_desktop_algorithmic_studio.png)
- 🛡️ [**Proctored Assessment Arena & Verifiable Credentialing**](docs/showcase/screenshots/05_desktop_assessment_arena.png)
- 🌐 [**Distributed System Design & Chaos Engineering Sandbox**](docs/showcase/screenshots/06_desktop_architecture_sandbox.png)
- 👔 [**B2B Enterprise Recruiter Talent Clearinghouse**](docs/showcase/screenshots/07_desktop_recruiter_clearinghouse.png)
- 🤖 [**Autonomous AI Copilot & Voice/Text Clinical Mentor**](docs/showcase/screenshots/08_desktop_ai_copilot_mentor.png)
- 🌟 [**Master Platform Hero Showcase**](docs/showcase/screenshots/platform_hero_showcase.png)

```
blood-match-api/
├── src/            Node.js + Express REST API (Auth, AI matching, cold-chain telemetry, inter-hospital transfers)
├── frontend/       Vite + React 18, Tailwind CSS, Leaflet.js Radar Map, Web Audio Synthesizer
├── api/            Vercel Serverless Function entry point
├── vercel.json     Vercel zero-config serverless deployment config
├── render.yaml     Render 24/7 web service deployment config
└── Dockerfile      Multi-stage production Docker container
```

## ✨ Enterprise Features

- 🔐 **End-to-End Authentication & RBAC**: Secure JWT issuance and PBKDF2 password hashing supporting Patient, Donor, Clinician, and Administrator roles.
- ⚡ **1-Click Instant Demo Login Switcher**: Instant evaluation accounts for Trauma Clinician (`doctor@sfgeneral.org`), Verified Hero Donor (`marcus@lifestream.org`), Emergency Patient (`robert@martinez.com`), and Fleet Admin (`admin@lifestream.org`).
- 📦 **Amazon/Flipkart-Style 5-Stage Package Tracker**: Real-time delivery timeline featuring cryptographic SHA-256 Chain-of-Custody seal verification, cold-chain temperature telemetry (2.0°C–6.0°C), and rooftop landing logging.
- 📅 **Donor Appointment Scheduling**: In-app booking system for whole blood, double red cells, and platelet donation sessions at regional trauma centers.
- 🚨 **STAT Emergency Blood Requests**: Patient & ER doctor intake portal generating broadcasted emergency tickets with auto-donor matching.
- 🚁 **Autonomous Multi-Drone & Ground Vectors**: Real-time 1.5s multi-vehicle telemetry (speed, altitude, battery, weather dynamics, and waypoint polylines).
- 🌡️ **Cold-Chain IoT Surveillance**: Continuous thermal compliance tracking to prevent protein degradation in transit.
- 🩸 **Clinical Cross-Match Matrix**: Interactive visual calculator detailing Red Blood Cell and Plasma compatibility charts, universal donors (O-), and universal recipients (AB+).
- 🏥 **Inter-Hospital Autonomous Payload Transfers**: Automatic surplus blood scanning across 5 regional trauma centers with 1-click inter-hospital drone transfer.
- 🏆 **Community Blood Hero Leaderboard**: Gamified rankings, badge achievements, lives saved metrics, and simulated emergency SMS dispatch pings.
- 🩺 **5-Point Donor Health Pre-Screening**: Real-time clinical clearance check (age, weight, 56-day donation interval, general wellness).
- 🛡️ **Administrator Command Suite**: Root operations dashboard for donor verification toggling, live inventory +/- adjusting, dispatch log auditing, and emergency shortage broadcasts.
- 🔊 **Procedural Web Audio Synthesizer**: Audio alerts for drone deployment sonars, emergency STAT beacons, and arrival chimes.
- 🌐 **24/7 Anti-Sleep Keep-Alive Heartbeat**: Scheduled pulse mechanism ensuring zero idle sleep on free-tier hosting (Render/Railway/Koyeb).

---

## 🔑 Pre-Configured Demo Accounts (1-Click Switcher)

| Role | Name | Email | Password | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Hospital Clinician** | Dr. Evelyn Vance, MD | `doctor@sfgeneral.org` | `doctor123` | STAT protocol triggers, hospital bank reserve control, intake signing |
| **Verified Donor** | Marcus Vance | `marcus@lifestream.org` | `donor123` | Dispatch availability toggle, appointment booking, reward badges |
| **Patient / Family** | Robert Martinez | `robert@martinez.com` | `patient123` | Live Amazon-style order tracking, emergency request submission |
| **Fleet Admin** | Alex Sterling | `admin@lifestream.org` | `admin123` | Root telemetry audit, fleet monitoring, donor registry management |

---

## Getting Started Locally

### 1. Unified Production Server (Single Port Frontend + Backend)
```bash
npm install
cd frontend && npm install && npm run build && cd ..
npm start          # Running full app on http://localhost:3000
```

### 2. Frontend Development Server (Live HMR)
```bash
cd frontend
npm run dev        # Running on http://localhost:5173 (proxies /api to :3000)
```

---

## 🚀 24/7 Deployment Instructions

### Option A: Vercel (Zero Config)
1. Push repository to GitHub.
2. Import project in [Vercel Dashboard](https://vercel.com).
3. The included [`vercel.json`](file:///c:/Users/Preetham.j/Desktop/My-Stufs/git%20hub%20proj/blood-match-api/vercel.json) automatically compiles the frontend and routes `/api/*` to the serverless function in [`api/index.js`](file:///c:/Users/Preetham.j/Desktop/My-Stufs/git%20hub%20proj/blood-match-api/api/index.js).

### Option B: Render (24/7 Free Web Service)
1. In [Render Dashboard](https://render.com), create a new Web Service pointing to this repository.
2. Select **Node** environment.
3. Build Command: `npm install && cd frontend && npm install && npm run build && cd ..`
4. Start Command: `npm start`

### Option C: Docker / Railway / Koyeb
```bash
docker build -t lifestream-enterprise .
docker run -p 3000:3000 lifestream-enterprise
```

---

## Architecture Highlights
- **RESTful Endpoints**:
  - `/api/auth/login` & `/api/auth/register` — JWT auth and profile creation
  - `/api/auth/demo-accounts` — Preconfigured 1-click accounts
  - `/api/auth/me` & `/api/auth/profile` — Authenticated profile updates
  - `/api/auth/appointments` — Donor appointment booking
  - `/api/donors/matches/:bloodType` — Proximity matching relative to selected trauma center
  - `/api/donors/leaderboard` & `/api/donors/check-eligibility` — Community rankings & health screening
  - `/api/requests` — Patient STAT emergency blood request submission & ticket generation
  - `/api/hospitals` & `/api/hospitals/transfer` — Inventory management & inter-hospital drone transfer
  - `/api/dispatch/track-all` & `/api/dispatch/:id/confirm-receipt` — Multi-vector telemetry & hospital intake protocol
  - `/api/admin/stats` — Operations metrics, verified donor ratios, and aggregate blood bank units
  - `/health` & `/api/ping` — 24/7 heartbeat keep-alive monitor
