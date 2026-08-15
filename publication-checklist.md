# PeakPact Google Play Publication Checklist

## Release Candidate Evidence
- [x] Android package confirmed as `com.alparbodi.peakpact`
- [x] EAS `production-aab` profile produces an app bundle
- [x] Android signing keystore available on EAS
- [x] Production EAS variables configured
- [ ] New AAB built with version code `2` or higher

## Store Listing
- [ ] App title and short description finalized
- [ ] Full description finalized
- [ ] Feature graphic exported
- [ ] App icon and screenshots uploaded
- [ ] Promo video linked

## Policy and Compliance
- [ ] Privacy Policy published and linked: [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)
- [ ] Terms of Service published and linked: [docs/TERMS_OF_SERVICE.md](docs/TERMS_OF_SERVICE.md)
- [ ] Account Deletion Policy published and linked: [docs/ACCOUNT_DELETION.md](docs/ACCOUNT_DELETION.md)
- [ ] Data Safety form completed
- [ ] Content Rating completed
- [ ] App Access instructions provided if needed

## Technical Delivery
- [ ] AAB uploaded
- [ ] Mapping/symbol files uploaded (if applicable)
- [ ] Version code incremented above existing code `1`
- [ ] Target SDK compliance validated
- [ ] Release notes/changelog attached
- [ ] Android release smoke test completed on a physical device
- [ ] Supabase sign-in, session restore, and Edge Function verification tested
- [ ] RevenueCat purchase and restore tested with the production catalog/test account
- [ ] Firebase Analytics event and Crashlytics receipt verified

## Monetization
- [ ] In-app products reviewed
- [ ] Subscription metadata complete
- [ ] RevenueCat entitlements mapped
- [ ] RevenueCat `pro_access` entitlement verified for monthly, yearly, and lifetime products

## Final Go/No-Go
- [ ] Crash-free startup verified on release AAB
- [ ] Onboarding completion flow verified
- [ ] Purchase flow verified
- [ ] Web fallback experience verified
- [ ] Automated Play submission credentials configured, or manual upload owner assigned
