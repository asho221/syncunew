# Sync U Health — Product Demo

A clickable walkthrough of the Sync U product for menopause and PCOS care. Built with Next.js, deployable to Vercel in a couple of minutes. **All data is synthetic — there is no backend and no real patient information.**

## What's inside

Three connected screens:

1. **Landing** (`/`) — frames the problem and lets people choose a path.
2. **Patient app** (`/patient`) — the 90-second daily check a patient does at home. Toggle between menopause and PCOS to see the questions change.
3. **Clinician view** (`/clinician`) — the one-page between-visit summary, shown inside a mock Semble EHR. This is the centrepiece: 90 days of data, adherence, symptom trends, and the key insight. Toggle conditions to see it adapt.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Deploy to Vercel (recommended)

**Option A — from the Vercel dashboard (easiest):**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Vercel auto-detects Next.js. Click Deploy. Done — you get a live URL.

**Option B — from the command line:**
```bash
npm i -g vercel
vercel
```
Follow the prompts. `vercel --prod` for the production URL.

### Linking it from the Sync U site
Once deployed, Vercel gives you a URL like `syncu-demo.vercel.app`. You can:
- Add a custom domain in Vercel (e.g. `demo.syncu.health`) under Project → Settings → Domains, or
- Link to the Vercel URL directly from a button on the main site.

## Customising

- **Demo data** lives in `lib/data.js` — the two patients, their 90 days of logs, and the analytics. Adjust symptoms, treatments, or the story there.
- **Colours and type** are CSS variables at the top of `app/globals.css` (the Clinical Trust palette: teal, ivory, coral).

## Note

This is a front-end demo for pitching and pilot conversations. It intentionally has no database, no auth, and stores nothing — so it's safe to share publicly. A real pilot version (with data storage) would need a backend and UK GDPR handling for health data, which is a separate build.
