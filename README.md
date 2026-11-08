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
2. Apply SQL migrations in order: `20261108_initial.sql`, `20261108_profile_trigger.sql`, then `20261108_partner_linking.sql`. The last migration adds secured invitation-code RPCs.
3. Copy `.env.example` to `.env` and set the project URL and **publishable** client key (never a service-role or secret key).
4. Restart Expo so `EXPO_PUBLIC_` variables are picked up.

The client helper is in `src/supabase.ts`. Couple creation and membership are handled by invitation RPCs; XP and completion are still intentionally write-locked pending authenticated server-side progression rules. Do not use the prototype as a production multiplayer app yet.

The working name is **Inseparable**. The GitHub repository retains its originally created spelling `inseperable`.
