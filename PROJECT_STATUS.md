# Navio Project Status

**Last Updated**: 2026-03-17  
**Version**: 1.0.0  
**Status**: ✅ Implementation updated and ready for verification

## Current Scope

- **Platform**: iOS-first Safari extension with an iOS container app
- **Mac support**: Apple Silicon Macs may run the iOS app in Designed for iPad mode, but this repo does not ship a native macOS or Catalyst target
- **Support path**: Email-based, configured through `Shared/SupportConfig.json`

## Completed In This Pass

- Extracted shared extension helpers for URL conversion, settings, stats, and allowed-host validation
- Added a generated manifest flow from `config/google_domains.json`
- Narrowed host permissions to supported Google domains
- Made the popup toggle a true master switch for all redirect behavior
- Added SPA navigation handling and more targeted DOM processing
- Expanded URL conversion coverage for redirect wrappers and supported travel modes
- Centralized the app support email in `Shared/SupportConfig.json`
- Updated onboarding and popup copy to describe Google-only site access
- Added the missing 16px, 19px, 32px, and 38px extension icons
- Added shared-scheme Xcode support and real smoke tests

## Key Files

- Extension runtime:
  - `Navio Extension/Resources/lib/`
  - `Navio Extension/Resources/content.js`
  - `Navio Extension/Resources/background.js`
  - `Navio Extension/Resources/popup.js`
  - `Navio Extension/Resources/popup.html`
- Config and generation:
  - `config/google_domains.json`
  - `scripts/generate-extension-config.mjs`
  - `Shared/SupportConfig.json`
- Xcode and tests:
  - `Navio.xcodeproj/xcshareddata/xcschemes/Navio.xcscheme`
  - `NavioTests/NavioTests.swift`
  - `NavioUITests/NavioUITests.swift`
  - `tests/js/*.mjs`

## Verification Checklist

- [x] `node --test tests/js/*.mjs`
- [x] `xcodebuild build-for-testing ...`
- [x] `xcodebuild test-without-building ...`
- [ ] Manual place-link redirect test
- [ ] Manual directions-link redirect test
- [ ] Manual fallback redirect test
- [ ] Manual master-toggle off/on test
- [ ] Manual popup help and in-app contact test

## Remaining Release Work

- Replace the placeholder support email in `Shared/SupportConfig.json` before shipping
- Run the full manual verification matrix from `TESTING.md`
- Test on at least one physical iPhone or iPad
- Prepare App Store screenshots and listing assets
