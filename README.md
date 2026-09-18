# LifeStream V3.1 — Smart Blood & Autonomous Emergency Dispatch Platform

## 🔗 Live Demo: https://lifestream-v3.shashankj.tech

LifeStream V3.1 is a cutting-edge "Uber for Blood" emergency logistics and dispatch platform designed for rapid medical response.

```
blood-match-api/
├── src/            Node.js + Express REST API (AI matching, telemetry simulation)
└── frontend/       Vite + React 18, Tailwind CSS, Leaflet.js Radar Map
```

## Features

- 🛰️ **Interactive Leaflet Radar Map**: Dark-mode geospatial map visualizing hospitals, donors, and active transport routes without external API keys.
- 🚁 **Autonomous Drone & Transport Telemetry**: Simulates real-time 1.5s vector telemetry (GPS coordinates, vehicle speed, altitude, battery percentage).
- 🌡️ **Cold-Chain IoT Monitoring**: Real-time blood temperature tracking (safe zone 2°C - 6°C) to ensure medical compliance during active transit.
- 🧠 **AI Match Confidence Scoring**: Evaluates donor geospatial proximity (Haversine formula), 56-day medical donation cooldowns, and reliability ratings.
- 🏥 **Hospital Inventory Monitoring**: Live multi-hospital blood bank stock level management per blood type.
- 👤 **Donor Registration Engine**: Instant donor onboarding with auto-geolocation and verification status.

## Getting Started

### 1. Backend Server
```bash
cd blood-match-api
npm install
npm start          # Running on http://localhost:3000
```

### 2. Frontend Development Server
```bash
cd blood-match-api/frontend
npm install
npm run dev        # Running on http://localhost:5174
```

## Architecture Highlights
- **Geospatial Matching Engine**: Evaluates donor distance using the Haversine formula and enforces 56-day donation eligibility unless marked as Critical Emergency.
- **Vite + Tailwind Frontend**: Componentized React architecture with glassmorphism UI, pulsing radar markers, and live telemetry overlays.
- **RESTful Endpoints**: `/api/donors/matches/:bloodType`, `/api/dispatch`, `/api/dispatch/track/:id`, `/api/hospitals`.
