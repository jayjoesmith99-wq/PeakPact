# PeakPact Android Release Audit

## Candidate
- Audit date: 2026-08-13
- Branch: `main`
- Expo SDK: `54.0.0`
- App version: `1.0.0`
- Android package: `com.alparbodi.peakpact`
- EAS project: `@nobodyknowswhy/peakpact-app`
- EAS project ID: `9e1ba50d-a318-4a6c-9092-634a93449605`

## Configuration Audit
- [eas.json](eas.json): PASS. `production-aab` uses Android `app-bundle` output and now enables remote `autoIncrement`.
- [app.json](app.json): PASS with permission update. Android package and Firebase registration match.
- Android version code: ACTION REQUIRED. EAS history shows the latest successful AAB at code `1`; the next store build must use code `2` or higher. Remote auto-increment is enabled for `production-aab`.
- Android signing: PASS. EAS has a JKS keystore for `production-aab`.
- Play submission credentials: BLOCKED for automated submission. EAS reports no Google Service Account key. This does not block AAB compilation or manual Play upload.
- Permissions: PASS for current features. Evaluated Android permissions include audio recording, audio settings, coarse/fine location, and camera. No background location or notification permission is requested.

## Environment Audit
- EAS production variables: PASS for required names. Production contains Supabase URL/anon key, RevenueCat public Android key, and Firebase web runtime values.
- Local `.env`: PASS for local development hygiene. It is ignored by Git and was not copied into release documentation.
- Supabase production: CONFIGURED, LIVE ROUND-TRIP UNVERIFIED. Runtime reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in [supabaseClient.ts](supabaseClient.ts); auth and Edge Functions need a device smoke test.
- RevenueCat production: CONFIGURED, LIVE STORE UNVERIFIED. Runtime reads `EXPO_PUBLIC_REVENUECAT_API_KEY`; product IDs and `pro_access` entitlement are defined in [src/services/purchasesService.ts](src/services/purchasesService.ts). A sandbox/test purchase and restore must be completed on a release build.
- Firebase: CONFIGURED, TELEMETRY UNVERIFIED. Native files are wired, but Analytics delivery and Crashlytics ingestion need a release-device check.

## Build Evidence
- `npx expo config --type public`: PASS. Evaluated SDK, package, plugins, Google services files, and permissions successfully.
- `npx eas-cli project:info`: PASS. Project resolves to `@nobodyknowswhy/peakpact-app`.
- Existing `production-aab` build: PASS. EAS build `692a8ce4-0975-4813-bbeb-465891101799` finished on 2026-08-12 and produced an AAB at Android version code `1`.
- Current `production-aab` build: IN PROGRESS. EAS build `0489f284-57af-4ef4-8053-947253b3ec44` was accepted on 2026-08-13 with Android version code `2`; its AAB URL is not available until the remote job finishes.
- `npx tsc --noEmit`: PASS.
- `npm test`: PASS, 153 tests.
- `npm run export:web`: PASS in the previous validation pass.

## Remaining Blockers Before Store Release
1. Wait for EAS build `0489f284-57af-4ef4-8053-947253b3ec44` to finish successfully and download the resulting version-code-2 AAB; the existing code-1 AAB must not be reused as the next Play upload.
2. Complete release-device smoke tests for Supabase sign-in/session restore, verification/transcription fallback, RevenueCat purchase/restore, and Firebase telemetry.
3. Configure an EAS Google Service Account key before using `npm run submit:android`; manual upload remains possible without it.
4. Complete Google Play listing, Data Safety, content rating, account-access, and policy declarations in [publication-checklist.md](publication-checklist.md).

## Decision
- Local AAB build: APPROVED TO RUN.
- Automated Play submission: NOT APPROVED until the Google Service Account is configured.
- Public Play release: NOT APPROVED until the release-device and store metadata checks are complete.
