# Recurrly - Subscription Management Made Simple

Recurrly is a subscription management mobile app built with React Native, Expo, and NativeWind. Track recurring expenses, billing cycles, and spending habits.

## Tech Stack

- **Frontend**: Expo / React Native + NativeWind (Tailwind)
- **Auth**: Clerk (`@clerk/expo`)
- **Backend**: Express + TypeScript, deployed on Vercel
- **Database**: Neon (serverless Postgres)
- **Build & Updates**: EAS Build + EAS Update

---

## Dev Workflow (Day-to-Day)

### 1. Start local development

```bash
npx expo start --clear
```

Scan the QR code with Expo Go on your phone. Metro will hot-reload on every save.

### 2. Push OTA update to users (JS/UI changes only)

No APK reinstall needed. Users get it automatically on next app open.

```bash
eas update --branch production --message "what you changed"
```

### 3. Full rebuild required when you change

- Native modules (camera, notifications, etc.)
- Permissions in `app.json`
- Expo SDK version
- `eas.json` build config

```bash
eas build --platform android --profile preview
# Share the QR code from EAS dashboard — users download once
```

---

## Backend (Vercel)

The backend lives in `backend/`. It's an Express API deployed as a Vercel serverless function.

### Run locally

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Deploy to Vercel

Just push to `main` — Vercel auto-deploys.

```bash
git add .
git commit -m "your message"
git push origin main
```

Health check: `https://recurrly.vercel.app/health`

### Vercel environment variables (set in Vercel dashboard)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

---

## Git Workflow

Always work on `dev`, then merge to `main` to trigger Vercel deploy.

```bash
# Work on dev
git checkout dev
# ... make changes ...
git add .
git commit -m "feature: description"
git push origin dev

# Merge to main to deploy backend
git checkout main
git pull origin main
git merge dev
git push origin main
```

---

## Environment Variables

**Root `.env`** (Expo app):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=https://recurrly.vercel.app
DATABASE_URL=postgres://...
```

**`backend/.env`** (local backend dev):
```
DATABASE_URL=postgres://...
CLERK_PUBLISHABLE_KEY=pk_test_...
PORT=3001
```

---

## Project Structure

```
recurrly/
├── app/
│   ├── (auth)/          # Sign in, Sign up screens
│   ├── (tabs)/          # Main app tabs
│   ├── _layout.tsx      # Root layout + ClerkProvider
│   └── index.tsx        # Auth redirect logic
├── backend/
│   ├── src/
│   │   ├── server.ts    # Express app + JWT auth middleware
│   │   ├── routes/      # API route handlers
│   │   └── db/          # Neon DB client
│   └── api/
│       └── index.ts     # Vercel serverless entry point
├── context/
│   └── SubscriptionContext.tsx  # Global subscription state
├── constants/           # Icons, data, theme
├── assets/              # Fonts, images
└── vercel.json          # Points Vercel to backend/api/index.ts
```

---

## Common Issues & Fixes

**Sign in / Sign up buttons not responding**
→ Make sure `useSignIn` and `useSignUp` are imported from `@clerk/expo/legacy`, not `@clerk/expo`. The v3 API is incompatible with this codebase.

**Backend returning 404 on Vercel**
→ Check that `vercel.json` exists at the repo root (not just in `backend/`) and points to `backend/api/index.ts`.

**Backend returning 500 / `ERR_REQUIRE_ESM`**
→ `jose` must stay at v4. v6 is ESM-only and breaks Vercel's CommonJS compilation.

**Pushed to `dev` but Vercel didn't redeploy**
→ Vercel only deploys from `main`. Merge `dev` → `main` and push.

---

Built by [Sudhanshu](https://github.com/sudh-202)
