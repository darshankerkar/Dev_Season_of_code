# HireDesk Frontend

Frontend client for HireDesk, built with React + Vite.

Live Demo: `https://hiredesk.duckdns.org`

Note: This repository is frontend-only for hackathon review. Backend and ML services are private.

## What This Includes
- Recruiter and candidate flows
- Jobs, dashboards, resume upload UI
- Interview room UI and scheduling UI
- Payment UI and coupon redemption UI
- Resume Analyzer UI (AI output rendering)

## Tech Stack
- React 19
- Vite 7
- Tailwind CSS
- Framer Motion
- Axios
- Firebase Auth (Google flow + UI integration)

## Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+

## Local Setup
1. Clone:
```bash
git clone https://github.com/darshankerkar/Dev_Season_of_code.git
cd Dev_Season_of_code
```
2. Install:
```bash
npm install
```
3. Create `.env.local`:
```bash
cp .env.example .env.local
```
4. Run:
```bash
npm run dev
```
5. Open:
- `http://localhost:5173`

## Environment Variables
Use `.env.local` in development.

Required:
- `VITE_API_URL` (backend base URL, example: `https://hiredesk.duckdns.org`)

Optional:
- `VITE_GEMINI_API_KEY` (if client-side Gemini calls are enabled)

Reference file: `.env.example`

## Available Scripts
- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run build:do` - DigitalOcean mode build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Backend/API Expectations
Frontend expects REST endpoints under:
- `/api/auth/*`
- `/api/recruitment/*`

If backend is private/offline, many pages will still render but data actions will fail.

## Deployment Notes
1. Set `VITE_API_URL` to your deployed backend URL.
2. Build with `npm run build`.
3. Serve `dist/` via your hosting provider.

For this project, production frontend is hosted behind Nginx at:
- `https://hiredesk.duckdns.org`

## Contribution Guidelines
1. Fork the repository.
2. Create a branch from `main`:
```bash
git checkout -b feat/short-description
```
3. Keep PRs focused (one feature/fix per PR).
4. Run before commit:
```bash
npm run lint
npm run build
```
5. Commit using clear messages:
- `feat: add interview join validation`
- `fix: handle jwt-only session in navbar`
6. Open a PR with:
- problem statement
- changes made
- screenshots (if UI change)
- testing steps

## Security
- Never commit `.env` files or secrets.
- Do not expose backend private keys in frontend code.
- Treat all client-side keys as potentially public.
