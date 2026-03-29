# Recurrly

> Subscription management made simple — track, visualize, and control your recurring expenses.

---

## Table of Contents

- [Run Locally](#run-locally)
- [Build APK](#build-apk)
- [Push Updates to Users](#push-updates-to-users)
- [Backend](#backend)
- [Git Workflow](#git-workflow)
- [When to Rebuild vs Update](#when-to-rebuild-vs-update)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Common Issues](#common-issues)

---

## Run Locally

Run the app on your phone during development — no build needed.

**Step 1** — Install dependencies

```bash
npm install
```

**Step 2** — Start Metro bundler

```bash
npx expo start --clear
```

**Step 3** — Open on your phone

1. Download **Expo Go** from the App Store / Play Store
2. Scan the QR code shown in your terminal
3. The app loads on your phone instantly

> Changes you make in code appear on your phone automatically (hot reload). No restart needed for most edits.

---

## Build APK

Build a standalone APK that users can install — hosted on Expo's cloud.

**Step 1** — Login to EAS

```bash
eas login
```

**Step 2** — Build

```bash
# Android APK (recommended for sharing/testing)
eas build --platform android --profile preview

# iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

**Step 3** — Share with users

- Go to [expo.dev](https://expo.dev) → your project → Builds
- Share the QR code or download link
- Users scan the QR → download and install the APK

> Users only need to download the APK **once**. Future JS/UI updates are pushed silently via OTA (see below).

---

## Push Updates to Users

After the APK is installed, push code changes to all users **without a new download**.

```bash
eas update --branch production --message "what changed"
```

**That's it.** Users get the update automatically the next time they open the app.

### What this looks like for users

```
User opens app
  └── App checks for update in background
        └── New update found → downloads silently
              └── Next app open → updated version runs
```

### Examples

```bash
# After fixing a bug
eas update --branch production --message "fix: sign in button"

# After adding a new feature
eas update --branch production --message "feat: forgot password flow"

# After UI changes
eas update --branch production --message "ui: dark input text, eye icon on password"
```

---

## Backend

The backend is an Express API deployed as a Vercel serverless function.

### Run backend locally

```bash
cd backend
npm run dev
# Running at http://localhost:3001
```

### Deploy backend

Just push to `main` — Vercel deploys automatically.

```bash
git push origin main
```

**Verify deployment:**

```bash
curl https://recurrly.vercel.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Vercel environment variables

Set these in the [Vercel dashboard](https://vercel.com) under your project → Settings → Environment Variables.

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_...`) |

---

## Git Workflow

```
dev branch  →  your daily work
main branch →  triggers Vercel backend deploy
```

**Daily development**

```bash
git checkout dev

# make your changes...

git add .
git commit -m "feat: your feature"
git push origin dev
```

**Deploy backend to production**

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
# Vercel auto-deploys in ~30 seconds
```

---

## When to Rebuild vs Update

| Change type | Action needed |
|---|---|
| UI changes, new screens, bug fixes | `eas update` — no reinstall |
| New JS-only npm packages | `eas update` — no reinstall |
| New native module (camera, notifications) | `eas build` — new APK |
| Permissions changed in `app.json` | `eas build` — new APK |
| App icon / splash screen changed | `eas build` — new APK |
| Expo SDK version bump | `eas build` — new APK |

> **Rule of thumb:** If you only touched `.tsx` / `.ts` / `.css` files → `eas update` is enough.

---

## Environment Variables

**`.env`** — Expo app (root)

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=https://recurrly.vercel.app
DATABASE_URL=postgres://...
```

**`backend/.env`** — Backend (local dev only)

```bash
DATABASE_URL=postgres://...
CLERK_PUBLISHABLE_KEY=pk_test_...
PORT=3001
```

---

## Project Structure

```
recurrly/
│
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx        auth route guard
│   │   ├── sign-in.tsx        sign in + forgot password
│   │   └── sign-up.tsx        sign up + email verification
│   ├── (tabs)/                main app screens
│   ├── _layout.tsx            root layout, ClerkProvider
│   ├── index.tsx              auth redirect
│   └── onboarding.tsx         first-time screen
│
├── backend/
│   ├── src/
│   │   ├── server.ts          Express app + JWT middleware
│   │   ├── routes/
│   │   │   └── subscriptions.ts   CRUD API handlers
│   │   └── db/
│   │       └── index.ts       Neon DB client
│   └── api/
│       └── index.ts           Vercel serverless entry
│
├── context/
│   └── SubscriptionContext.tsx    global subscription state
│
├── constants/                 icons, data, theme
├── assets/                    fonts, images
├── global.css                 NativeWind / Tailwind config
└── vercel.json                Vercel → backend/api/index.ts
```

---

## Common Issues

**Buttons on sign in / sign up don't respond**

```
Cause: @clerk/expo v3 has a breaking API change
Fix:   useSignIn and useSignUp must be imported from @clerk/expo/legacy
```

**Backend returns 404 on Vercel**

```
Cause: vercel.json missing at repo root (only existed in backend/)
Fix:   Create vercel.json at root pointing to backend/api/index.ts
```

**Backend returns 500 / ERR_REQUIRE_ESM**

```
Cause: jose v6 is ESM-only, Vercel compiles as CommonJS
Fix:   jose must stay at v4 — do not upgrade
```

**Pushed changes but Vercel didn't redeploy**

```
Cause: Vercel only watches the main branch
Fix:   Merge dev into main and push main
```

**Users not getting OTA update**

```
Cause: eas update wasn't run, or wrong branch used
Fix:   eas update --branch production --message "..."
```

---

Built by [Sudhanshu](https://github.com/sudh-202)
