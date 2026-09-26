# LifeStream V3.1 — Emergency Blood Dispatch & Logistics Network

LifeStream V3.1 is an autonomous emergency blood matching and cold-chain logistics platform connecting regional trauma centers with compatible donors and drone transport.

```
LifeStream-V3/
├── src/            Node.js + Express REST API (geospatial matching & IoT telemetry)
└── frontend/       Vite + React 18, Tailwind CSS, Leaflet.js Radar Operations Grid
```

## Features

- **Blood Donor Matching**: Evaluates and matches compatible blood donors using ABO/Rh matrix compatibility, geospatial proximity (Haversine formula), and 56-day donation cooldown eligibility.
- **IoT Cold-Chain Telemetry**: Live blood transport temperature monitoring (enforcing the 2°C to 6°C medical safety corridor) with altitude, battery, and ETA tracking.
- **Trauma Center Inventory**: Real-time hospital blood bank reserves and critical shortage alerts across regional medical centers.
- **Autonomous Dispatch**: Protocol authorization for autonomous drones and emergency medical transport carriers.
- **Volunteer Donor Registration**: Secure donor onboarding with emergency dispatch mobile alerts and verified health compliance.

## Getting Started

### 1. Backend Server
```bash
npm install
npm start          # Runs on http://localhost:3000
```

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:5173
```

### 3. Production Build
```bash
cd frontend
npm run build      # Outputs to frontend/dist
```

## API Endpoints

- `GET /api/donors/matches/:bloodType?urgency=critical` — Evaluates compatible donors for recipient need.
- `POST /api/donors` — Registers a new volunteer donor into the dispatch network.
- `POST /api/dispatch` — Authorizes and launches emergency blood transport.
- `GET /api/dispatch/track/:id` — Streams live vector position and cold-chain temperature telemetry.
- `GET /api/hospitals` — Returns hospital blood bank reserves and inventory levels.
- `GET /health` — Service health check endpoint.
