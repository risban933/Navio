# Navio Quick Start Guide

Get Navio running on iPhone or iPad in a few minutes. This repo currently ships an iOS Safari extension plus its container app. It is not a native macOS or Catalyst project.

## Prerequisites

- **Xcode 14+**
- **macOS** with Xcode for development
- **iOS 16+** simulator or device for testing
- **Safari** with extension support enabled

## 5-Minute Setup

### Step 1: Open the project

```bash
open Navio.xcodeproj
```

### Step 2: Review the support email config

Navio now reads the support address from:

```text
Shared/SupportConfig.json
```

Update the `supportEmail` value there before shipping if you want a real contact address.

### Step 3: Build and run

1. Select the **Navio** scheme.
2. Choose an iPhone or iPad simulator, or a connected iOS device.
3. Press `⌘R` to run.

### Step 4: Enable the extension in Safari

On the device or simulator:

1. Open **Settings**.
2. Go to **Safari → Extensions**.
3. Enable **Navio**.
4. Allow Navio on supported Google websites when Safari asks for site access.

### Step 5: Test it

1. Open Safari.
2. Visit **google.com**.
3. Search for **Central Park NYC**.
4. Click the map result or **Directions**.
5. Expected result: Apple Maps opens with the matching location or route.

## Common Issues

### Extension does not appear in Safari
- Run the container app at least once from Xcode.
- Re-open Safari settings after the app finishes launching.
- Restart the simulator or device if Safari still does not show the extension.

### Links still open Google Maps
- Confirm Navio is enabled in **Settings → Safari → Extensions**.
- Confirm site access has been granted on supported Google websites.
- Refresh the Google results page after enabling the extension.

### Stats look wrong
- Lifetime conversions are stored persistently.
- Session conversions reset with extension session storage when available.
- If Safari falls back to local storage for session stats, the background service worker may reset the session count on startup.

### Support email does not open
- Make sure `Shared/SupportConfig.json` exists in both the app and extension bundles.
- Verify the device has a mail handler configured for `mailto:` links.

## Testing Checklist

- [ ] App launches from the **Navio** scheme
- [ ] Extension appears in Safari settings
- [ ] Popup opens and reflects the current enabled or paused state
- [ ] Google place results open Apple Maps
- [ ] Google directions links open Apple Maps directions
- [ ] Turning the popup toggle off disables all redirect behavior
- [ ] Turning the popup toggle back on restores redirect behavior
- [ ] The in-app contact button opens the email flow

## Useful Commands

```bash
# Regenerate the manifest and Google-domain allowlist artifacts
node scripts/generate-extension-config.mjs

# Run JavaScript unit tests
node --test tests/js/*.mjs

# Build and test from the shared scheme
xcodebuild build-for-testing -project Navio.xcodeproj -scheme Navio -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.3.1' -derivedDataPath .derivedData CODE_SIGNING_ALLOWED=NO
xcodebuild test-without-building -project Navio.xcodeproj -scheme Navio -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.3.1' -derivedDataPath .derivedData CODE_SIGNING_ALLOWED=NO
```

## Notes

- The extension only requests access on supported Google domains. It no longer relies on `<all_urls>`.
- Apple Silicon Macs may run the iOS app in Designed for iPad mode, but this repo does not include a native macOS or Catalyst target.
- Missing extension icons have been generated from the existing 512px source asset.
