# EmptyHands student app — setup

Two pages:

| Page | Who | What it does |
| --- | --- | --- |
| `app/index.html` | Students | Create an account, see the year calendar with the dates that matter to them, a "next class" countdown, coaches' notices, and an *Add to my phone calendar* download. Can be added to a phone home screen like an app. |
| `app/coach.html` | Coaches | Send notices (to everyone, or just Karate / Tai Chi / Yoga students, one dojo, or black belts), see and export the student list, edit and publish each year's calendar, and manage who counts as a coach. |

Until you finish the steps below the app runs in **demo mode**: it works, but everything is saved only in the browser you're using, so students and coaches can't see each other's data. A yellow banner shows while it's in demo mode.

## Go live with Firebase (free, about 15 minutes)

1. Go to <https://console.firebase.google.com>, **Add project**, name it e.g. `emptyhands`. Google Analytics isn't needed.
2. **Build → Authentication → Get started → Email/Password → Enable → Save.**
3. Still in Authentication, open **Settings → Authorised domains** and add `rauf-mushtaq.github.io` (and any custom domain you use later).
4. **Build → Firestore Database → Create database.** Pick the `europe-west2 (London)` location, start in **production mode**.
5. In Firestore, open the **Rules** tab, delete what's there, paste in everything from `app/firestore.rules`, and press **Publish**.
6. **Project settings (cog) → General → Your apps → Web (`</>`)**. Register the app (no hosting needed). Copy the values from the `firebaseConfig` it shows into `app/js/config.js`.
7. Head coaches: put your coach email(s) in **both** `OWNER_EMAILS` in `app/js/config.js` and `OWNERS()` in `app/firestore.rules` (it's set to `info@emptyhands.co.uk` for now). Re-publish the rules if you changed them.
8. Commit and push. Then open `/app/coach.html`, choose **New coach account** with a head-coach email, click the link in the verification email, and press **check again**.

The Firebase config values aren't secret. The security rules are what protect the data: only registered students can read notices, only coaches can see the student list, send notices or publish calendars, and students can only edit their own profile.

## Each year

1. Coach panel → **Calendar → New year…** → enter the year. Leave "mark every Thursday as training" ticked.
2. Pick **Closed** and click the closure dates, **Black belt** for black-belt classes, **Grading / workshop** for gradings, and **Add note** to attach details (e.g. "Kyu grading, Epping 12:30pm").
3. Check the class times box, add a link to the PDF if you have one, then press **Publish**.

Students see the new calendar straight away. They see the current year by default and can switch years from a dropdown. Until a coach publishes 2026 from the panel, the app uses the 2026 dates from `assets/docs/EmptyHands-Dojo-Calendar-2026.pdf`, which are built into `app/js/calendar-data.js`.

## What students see as "relevant"

- Training and closure dates: everyone.
- Gradings and workshops: students who ticked Karate.
- Black-belt classes: students whose grade is Shodan or above.

With *Only dates relevant to me* switched on (the default), other dates are shown plain. Switched off, they're shown faded. Notices follow the audience the coach chose.

## Notifications

When a coach sends a notice, students with the app open get it immediately: a pop-up, a red badge on *Notices*, and a system notification if they turned on alerts. Everyone else sees the badge the next time they open the app.

The App Store / Google Play apps also get push notifications when the app is closed. That uses a small server function on the Firebase Blaze plan; see `mobile/README.md`.

## Removing a student

**Students → Remove.** They're moved to the *Removed* filter and can no longer read notices. **Restore** undoes it.

## Phone apps

To publish the student app on the App Store and Google Play, see [`mobile/README.md`](../mobile/README.md).
