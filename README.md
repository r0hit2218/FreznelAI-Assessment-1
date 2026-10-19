# Freznel AI — System Observatory

A desktop-style system task and sensor dashboard built with **React + JavaScript** and a **Node.js** system telemetry API. It uses separate libraries for UI, system information, and Firebase authentication.

## Features
- Live CPU, memory, disk, network and process telemetry through Node.js.
- Responsive dark monitoring dashboard inspired by the supplied reference.
- Process search and sorting; filesystem and network views.
- Keyboard navigation: `1–5` switch sections, `↑/↓` cycle sections, `R` refresh, `Space` pause/resume, `?` shortcuts, `Esc` close/blur.
- Firebase Email/Password sign-up and sign-in when configured; explicit local demo mode for UI evaluation.
- Process termination is intentionally disabled; this app is a read-only monitor.

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm
- Windows, macOS, or Linux

## Run locally
```bash
npm install
npm run dev
```
This starts the React/Vite UI at `http://localhost:5173` and the Node API at `http://127.0.0.1:4174`.

If system information doesn't load, check that both processes started in the terminal. The UI proxies `/api` requests to the Node API.

## Firebase setup (real authentication)
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web app and copy its config.
3. In Authentication → Sign-in method, enable **Email/Password**.
4. Copy `.env.example` to `.env.local` and fill in `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID`.
5. Set `VITE_FIREBASE_ENABLED=true`.
6. Stop and restart `npm run dev`.

Without Firebase credentials, the app shows an explicit configuration warning and allows local demo mode. Do not commit `.env.local` or service account credentials.

## Architecture
- `server/index.js`: Node.js HTTP API and `systeminformation` adapter.
- `src/App.jsx`: React dashboard, keyboard controls, process explorer, and auth form.
- `src/firebase.js`: Firebase initialization.
- `src/styles.css`: responsive styling.

## GitHub submission
Confirm the required repository naming with the assessment instructions before renaming. The instructions mention both `Binaire-FreznelAI-Assessment` and `Binaire_Freznel_Assessment`; those are different names. Commit and push only to your own fork unless the assessor explicitly provides access to another repository.
