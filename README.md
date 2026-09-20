# LifeStream Enterprise V4.0 — Basic Mock Medical Logistics UI

This project provides a mock API backend and React UI to demonstrate concepts of emergency blood logistics and tracking.

## Features

- **Mock Geospatial Radar Map**: A Leaflet.js map displaying simulated drone positions and geofences based on static in-memory data.
- **Simulated Delivery Tracker**: UI representing a delivery timeline with mock cold-chain temperature telemetry data.
- **Mock Autonomous Drone Network API**: (`src/routes/traumaDroneNetwork.js`) Provides static JSON responses for mock drones, trauma centers, and "no-fly zones".
- **Basic Auth & User Accounts**: Includes simple endpoints for user registration and JWT-based authentication.
- **React Frontend**: A Vite/React frontend to visualize the mock data.

## Getting Started Locally

```bash
npm install
cd frontend && npm install && npm run build && cd ..
npm start          # Running full app on http://localhost:3000
```
