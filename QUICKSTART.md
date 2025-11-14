# Navio Quick Start Guide

Get Navio up and running in minutes! This guide covers the essential steps to build, test, and run the extension.

## Prerequisites

- **Xcode 14+** installed
- **macOS 12+** or **iOS 16+** device/simulator
- **Safari** with extension support

## 5-Minute Setup

### Step 1: Generate Missing Icon Sizes (2 minutes)

The extension needs all icon sizes to load properly. Four sizes are missing from the template:

**Option A: Use the automated script** (requires ImageMagick)
```bash
# Install ImageMagick (if not already installed)
brew install imagemagick

# Generate missing icons
./generate-icons.sh
```

**Option B: Manual creation** (if ImageMagick isn't available)
Using any image editor, resize `Navio Extension/Resources/images/icon-48.png` to create:
- icon-16.png (16×16)
- icon-19.png (19×19)
- icon-32.png (32×32)
- icon-38.png (38×38)

Save them in the same directory.

### Step 2: Update Support Email (1 minute)

Open `Navio/ViewController.swift` and replace the placeholder email:

**Line 56:**
```swift
mailComposer.setToRecipients(["your-email@example.com"]) // Replace this
```

**Line 77:**
```swift
let email = "your-email@example.com" // Replace this
```

### Step 3: Open Project in Xcode

```bash
open Navio.xcodeproj
```

### Step 4: Build & Run

#### For macOS Testing:
1. Select the **Navio (macOS)** scheme
2. Press `⌘R` to run
3. The Navio app will launch
4. Go to **Safari → Preferences → Extensions**
5. Enable **Navio**
6. Grant "All Websites" permission

#### For iOS Testing:
1. Select the **Navio (iOS)** scheme
2. Choose your device or simulator
3. Press `⌘R` to run
4. On the device: **Settings → Safari → Extensions**
5. Enable **Navio**
6. Grant "All Websites" permission

### Step 5: Test It!

1. Open Safari (on the device you just configured)
2. Go to **google.com**
3. Search for **"Central Park NYC"**
4. Click the map result or "Directions" button
5. **Expected**: Apple Maps opens with Central Park! 🎉

## Common Issues & Solutions

### Issue: Extension doesn't appear in Safari
**Solution**:
- Make sure you ran the app at least once
- Check Safari → Preferences → Extensions
- Restart Safari

### Issue: Icons are blank/missing
**Solution**:
- Run `./generate-icons.sh` or create missing icons manually
- Rebuild the project in Xcode
- Clean build folder: `⌘⇧K` then rebuild

### Issue: Links still open Google Maps
**Solution**:
- Check that "All Websites" permission is granted
- Reload the Google search page
- Check Safari's Web Inspector console for errors (⌘⌥C)

### Issue: Native messaging errors
**Solution**:
- Ensure the container app is built and installed
- Check Console.app for error logs
- Rebuild the entire project

## Testing Checklist

Quick sanity tests to ensure everything works:

- [ ] Extension appears in Safari preferences
- [ ] Extension icon shows in toolbar (macOS) or extensions menu (iOS)
- [ ] Clicking toolbar icon shows "Navio is active" popup
- [ ] Google search for a place → map link opens Apple Maps
- [ ] Clicking "Directions" button opens Apple Maps with route
- [ ] Works on different Google domains (try google.co.uk)
- [ ] Contact button in app opens email composer

## Enable Debug Mode

To see what Navio is doing:

1. Open `Navio Extension/Resources/content.js`
2. Change line 10:
   ```javascript
   const DEBUG = true; // Change from false to true
   ```
3. Rebuild in Xcode
4. Open Safari's Web Inspector on a Google search page
5. Check Console for `[Navio]` log messages

## File Structure Quick Reference

```
📁 Navio Extension/Resources/
  ├── manifest.json          ← Extension configuration
  ├── content.js             ← Main redirect logic
  ├── background.js          ← Native messaging
  ├── popup.html             ← Toolbar popup
  └── images/                ← Icon assets

📁 Navio/
  ├── ViewController.swift   ← Contact support handler
  └── Resources/
      └── Base.lproj/
          └── Main.html      ← Splash screen UI
```

## Next Steps

### For Development
1. **Read [TESTING.md](TESTING.md)** - Run through the 20 test cases
2. **Check [URL_PATTERNS.md](URL_PATTERNS.md)** - Understand all supported URL patterns
3. **Review [ICONS.md](ICONS.md)** - Consider designing custom Navio-themed icons

### For Production
1. **Design custom icons** - Replace template icons with branded designs
2. **Test on physical devices** - Both iPhone and Mac
3. **Prepare for App Store**:
   - Create screenshots
   - Write app description
   - Set up App Store Connect
   - Submit for review

## Useful Commands

```bash
# Clean Xcode build
# Xcode → Product → Clean Build Folder (⌘⇧K)

# Check which icons exist
ls -lh "Navio Extension/Resources/images/"

# View git status
git status

# View recent commits
git log --oneline -5

# Run tests (if you add them)
# Xcode → Product → Test (⌘U)
```

## Documentation Quick Links

- **[README.md](README.md)** - Complete project documentation
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[URL_PATTERNS.md](URL_PATTERNS.md)** - URL conversion reference
- **[ICONS.md](ICONS.md)** - Icon requirements and design
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Verification of all features

## Getting Help

### Before Asking for Help

1. Check the [Troubleshooting section in README.md](README.md#troubleshooting)
2. Review error messages in:
   - Safari's Web Inspector Console
   - Xcode's debug console
   - macOS Console.app
3. Ensure all prerequisites are met
4. Try a clean build (⌘⇧K then ⌘B)

### Debug Checklist

If something's not working:

- [ ] Icons generated and in correct directory?
- [ ] Extension enabled in Safari preferences?
- [ ] "All Websites" permission granted?
- [ ] App built and run at least once?
- [ ] Safari restarted after enabling extension?
- [ ] Testing on a Google search page (not just any page)?
- [ ] Clicked on an actual map link (not a regular link)?

## Performance Tips

- Extension is designed to be lightweight (< 1ms per page load)
- Debug mode adds ~5-10ms for logging - disable for production
- DOM observer only processes when new content is added
- Links are processed in batches, not individually

## Privacy & Security

Navio is designed with privacy in mind:
- ✅ No data collection
- ✅ No network calls (except opening Apple Maps)
- ✅ No tracking or analytics
- ✅ Processes everything on-device
- ✅ Only examines links, never reads page content

## Build for Distribution

When ready to distribute:

1. **Disable debug mode** in content.js
2. **Create custom icons** (see ICONS.md)
3. **Update version** in manifest.json and Info.plist
4. **Archive the app** (Xcode → Product → Archive)
5. **Submit to App Store** via Xcode Organizer

## Version Info

- **Current Version**: 1.0.0
- **Minimum iOS**: 16.0
- **Minimum macOS**: 12.0
- **Safari**: 16.0+ (for Manifest v3 support)

---

**Ready to build?** Follow the 5-Minute Setup above and you'll have Navio running in no time! 🚀

For detailed information, see the [complete README.md](README.md).
