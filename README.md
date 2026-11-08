# Inseparable 💕

A cooperative, phone-first relationship adventure. Couples will connect their profiles, complete creative daily challenges, and advance through eight sequential chapters together.

## Getting started

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npx expo start`.
4. Open the development preview with Expo Go (for compatible features) or a simulator.

This first commit is a **visual and interaction prototype**, not a live multiplayer release. Its five demo challenges use local component state. It does not yet create accounts, connect partners, persist answers, or award real XP.

## Planned next milestones

1. Supabase authentication, schema, and row-level security.
2. Partner invites and consent-based linking/unlinking.
3. Challenge submissions, private-until-both-answer reveals, and server-authoritative XP.
4. Eight chapters and 100 reviewed challenges with varied mechanics.
5. Optional cosmetics and one-time in-app purchases after free-core beta testing.

## Supabase setup

1. Create a separate Supabase project for Inseparable.
2. Apply SQL migrations in order: `20261108_initial.sql`, `20261108_profile_trigger.sql`, `20261108_partner_linking.sql`, `20261108_short_invite_codes.sql`, then `20261108_multiplayer_challenges.sql`. The last one seeds the five beta challenges and creates secure shared-XP progression.
3. Copy `.env.example` to `.env` and set the project URL and **publishable** client key (never a service-role or secret key).
4. Restart Expo so `EXPO_PUBLIC_` variables are picked up.

The client helper is in `src/supabase.ts`. Couple creation and membership use invitation RPCs. Challenge responses and XP are handled by the `submit_challenge_response` RPC so the server awards points once, after both partners submit. Only the five beta activities in chapter one have been seeded; the remaining content, notifications, cosmetic store, and broader product QA are still pending.

The working name is **Inseparable**. The GitHub repository retains its originally created spelling `inseperable`.

## TestFlight from GitHub Actions

Run **Actions → Build Inseparable for TestFlight → Run workflow**. No local Windows or Mac installation is needed. The workflow builds with Expo EAS and submits to TestFlight.

Before the first run, add these in GitHub **Settings → Secrets and variables → Actions**:

- Secrets: `EXPO_TOKEN` (Expo personal access token) and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public project key; stored here to keep local config out of the repo).
- Variables: `EAS_PROJECT_ID` (UUID from the new Inseparable project in Expo) and `APP_STORE_CONNECT_APP_ID` (numeric App Store Connect app ID for Inseparable).

The iOS bundle identifier is `io.inseparable.app`. Create the Inseparable app record with **exactly that bundle identifier**, or adjust `app.json` before creating the record. The initial EAS iOS signing credentials and an App Store Connect API key must be configured on Expo before GitHub can perform a completely non-interactive TestFlight submission. QuantFit's existing Capacitor signing assets do not automatically transfer to this new bundle identifier.
