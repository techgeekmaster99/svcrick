# SV Prime Cricket League

Static web app (HTML + CSS + vanilla JS) for flat-wise login, where each flat
registers one or more players into the league (name, mobile number, role),
backed by Firebase so an organizer can see the full roster in one place.
Hosted for free on GitHub Pages.

## One-time Firebase setup

1. Go to https://console.firebase.google.com and create a new project (the
   free "Spark" plan is enough).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database (production mode is fine).
4. In Firestore → **Rules**, paste the contents of `firestore.rules` from
   this repo and publish.
5. **Project settings** → General → "Your apps" → add a **Web app** → copy
   the `firebaseConfig` object it gives you.
6. Paste those values into `js/firebase-config.js` in this repo (replace the
   `REPLACE_ME` placeholders).

## How login works

There's no server, so accounts aren't pre-created. The first time a flat
number logs in with the shared default password (`Admin123`), the app creates
that flat's account automatically and forces a password change before they
can do anything else. After that, the flat's real password is required.

Every flat has equal access once logged in — via the sidebar:

- **My Profile** — add one or more players from your flat (e.g. more than
  one family member), each with their own name, mobile number, and role.
  You can remove any player you added.
- **All Players** — browse every flat's registered players (flat number,
  name, mobile number, role).
- **Teams** — pick players from the registered list to create a named team,
  and see all teams that have been created so far.

## Deploying to GitHub Pages

```
git init
git add .
git commit -m "Initial SV Prime Cricket League app"
git branch -M main
git remote add origin https://github.com/<your-username>/sv-prime-cricket-league.git
git push -u origin main
```

Then in the GitHub repo: **Settings → Pages → Source: `main` branch, `/root`**.
The app will be live at:

```
https://<your-username>.github.io/sv-prime-cricket-league/
```

## Known limitations

- Anyone who knows a flat number can "claim" it by logging in first with the
  default password — fine for a small, trusted society league, but not a
  substitute for real access control.
- There's no self-service "forgot password" flow (no real email is ever
  collected, so Firebase's email-based reset can't be used). If a flat
  forgets their password, the organizer resets it manually:
  1. Firebase console → **Authentication → Users**.
  2. Find that flat's row (e.g. `b-206@svprime.local`) and delete it.
  3. Tell the flat to log in again with their **Flat Number** + the default
     password (`Admin123`) — the app recreates the account and forces a
     password change, just like a first-ever login.
  4. Note: this gives them a new internal user ID, so any player entries
     they'd previously added under "My Profile" will no longer be
     editable/removable by them (they'll still show up under "All Players").
     They can just re-add themselves, and the organizer can delete the old
     stray entry directly in Firestore (**Firestore Database → Data →
     `players` collection**) if desired.
