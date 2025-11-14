# Navio - Safari Extension

Navio is a Safari web extension for iOS and macOS that automatically redirects Google Maps links to Apple Maps, providing a seamless one-tap navigation experience.

## Features

- **Auto-redirect Google Maps links**: Any link on Google Search that would normally open Google Maps will instead launch Apple Maps with the corresponding location
- **Support all Google domains**: Works on every regional Google domain (google.com, google.co.uk, google.ca, etc.) for both iOS and macOS Safari
- **Smart fallback mechanism**: If Navio cannot immediately resolve a particular link, it will allow the Google Maps web page to load and then automatically attempt the redirect from there
- **Zero data storage**: Navio does not collect or store personal data. It only examines page content for map links and uses on-device URL schemes to open Apple Maps
- **Native integration**: Uses native messaging for optimal user experience on both platforms

## Project Structure

```
Navio/
├── Navio/                          # iOS/macOS container app
│   ├── Resources/
│   │   └── Base.lproj/
│   │       └── Main.html          # Splash screen with setup instructions
│   ├── ViewController.swift       # Main app view controller
│   ├── AppDelegate.swift
│   └── SceneDelegate.swift
├── Navio Extension/               # Safari Web Extension
│   ├── Resources/
│   │   ├── manifest.json          # Extension manifest (Manifest v3)
│   │   ├── content.js             # Content script for link interception
│   │   ├── background.js          # Background script for native messaging
│   │   ├── popup.html             # Toolbar popup UI
│   │   └── _locales/en/
│   │       └── messages.json      # Localized strings
│   └── SafariWebExtensionHandler.swift  # Native message handler
├── NavioTests/                    # Unit tests
├── NavioUITests/                  # UI tests
├── README.md                      # This file - comprehensive documentation
├── TESTING.md                     # Testing procedures and test cases
├── URL_PATTERNS.md                # URL conversion patterns and examples
├── ICONS.md                       # Icon requirements and generation
└── generate-icons.sh              # Script to generate missing icon sizes
```

## Supporting Documentation

- **[TESTING.md](TESTING.md)** - Comprehensive testing guide with 20+ test cases covering functional, performance, UX, and edge case testing
- **[URL_PATTERNS.md](URL_PATTERNS.md)** - Detailed documentation of all supported Google Maps URL patterns and their Apple Maps conversions
- **[ICONS.md](ICONS.md)** - Icon requirements, design guidelines, and generation instructions
- **[generate-icons.sh](generate-icons.sh)** - Automated script to generate missing icon sizes using ImageMagick

## How It Works

### 1. Link Scanning and Interception

When you visit a Google Search results page, Navio's content script (`content.js`) runs automatically and:

- Detects all links that point to Google Maps (searches for patterns like `/maps/place`, `/maps/dir`, `maps.google.com`, etc.)
- Converts each Google Maps URL to the equivalent Apple Maps URL
- Rewrites the link's `href` attribute to point to Apple Maps
- Adds a click interceptor as a backup to ensure the redirect happens

### 2. URL Conversion Logic

The `googleToAppleMapsURL()` function handles different types of Google Maps links:

- **Place/Address searches**: Converts to Apple Maps search queries using the `q` parameter
- **Directions links**: Extracts origin and destination, converts to Apple Maps using `saddr` and `daddr` parameters
- **Coordinates**: Extracts latitude/longitude and uses the `ll` parameter
- **Edge cases**: Handles various Google Maps URL formats and patterns

Example conversions:
```
Google: https://www.google.com/maps/place/Empire+State+Building/@40.748,-73.985
Apple:  https://maps.apple.com/?q=Empire%20State%20Building&ll=40.748,-73.985

Google: https://www.google.com/maps/dir/Current+Location/Central+Park
Apple:  https://maps.apple.com/?daddr=Central%20Park
```

### 3. Smart Fallback

If a Google Maps link is missed on the search page, Navio has a fallback mechanism:

- When a Google Maps page (`google.com/maps`) loads, the content script detects it
- After a short delay (500ms) to allow the URL to stabilize, it extracts the location from the page URL
- Automatically redirects to Apple Maps
- This ensures even complex or unusual links eventually open in Apple Maps

### 4. Native Integration

For the best user experience (especially on macOS), Navio uses native messaging:

- When a link is clicked, the content script sends a message to the background script
- The background script forwards it to the native app via `browser.runtime.sendNativeMessage()`
- `SafariWebExtensionHandler.swift` receives the message and opens Apple Maps using:
  - **iOS**: `UIApplication.shared.open()`
  - **macOS**: `NSWorkspace.shared.open()`
- This avoids Safari creating blank tabs or showing repeated permission prompts

## Development Setup

### Requirements

- **Xcode 14+** (for Manifest v3 support)
- **macOS 12+** and/or **iOS 16+** for testing
- Safari with extension support enabled
- Apple Developer account (for running on physical iOS devices)

### Building the Project

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Navio
   ```

2. **Open in Xcode**:
   ```bash
   open Navio.xcodeproj
   ```

3. **Select your target**:
   - For macOS: Select "Navio (macOS)" scheme
   - For iOS: Select "Navio (iOS)" scheme

4. **Build and run**:
   - Press `Cmd+R` or click the Run button
   - The app will launch and show the setup instructions

### Enabling the Extension

#### On macOS:
1. Run the Navio app from Xcode
2. Open Safari → Preferences → Extensions
3. Enable "Navio"
4. Allow "All Websites" permission
5. Close the preferences and test on a Google search

#### On iOS (Simulator or Device):
1. Run the Navio app from Xcode
2. Open Settings app → Safari → Extensions
3. Enable "Navio"
4. Allow "All Websites" permission
5. Open Safari and test on a Google search

### Icon Assets

The extension requires icon assets in multiple sizes. Place them in `Navio Extension/Resources/images/`:

- `icon-16.png` (16x16)
- `icon-19.png` (19x19) - iOS toolbar
- `icon-32.png` (32x32)
- `icon-38.png` (38x38) - iOS toolbar @2x
- `icon-48.png` (48x48)
- `icon-64.png` (64x64)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-256.png` (256x256)
- `icon-512.png` (512x512)

**Note**: Currently, the project references these icons but placeholder assets need to be created. Use a simple compass or map pin icon design.

## Testing

### Functional Testing

#### Basic Redirect Test
1. Open Safari with Navio enabled
2. Search for "Empire State Building" on Google
3. Click the map result or "Directions" link
4. **Expected**: Apple Maps opens with the location

#### Multiple Google Domains
1. Visit `google.co.uk` or `google.ca`
2. Search for a local place
3. Click a map link
4. **Expected**: Works the same as google.com

#### Directions Link
1. Search for a restaurant or business on Google
2. Click the "Directions" or "Get there" button
3. **Expected**: Apple Maps opens in directions mode to that destination

#### Fallback Mechanism
1. Temporarily disable the extension
2. Click a Google Maps link (it will load maps.google.com)
3. Re-enable the extension
4. Reload the Google Maps page
5. **Expected**: Auto-redirects to Apple Maps after ~500ms

### Edge Cases

- **Coordinates-only links**: Links with `@lat,lng` format
- **Plus codes**: Links using Google Plus Codes
- **Complex queries**: Multi-word addresses with special characters
- **Direct maps.google.com URLs**: Opening a Google Maps URL directly (not from search)

### Performance Testing

- Enable Navio alongside other extensions (ad-blockers, etc.)
- Ensure link rewriting happens quickly (< 100ms)
- Check Safari console for any errors
- Verify no memory leaks or excessive resource usage

### Debugging

To enable debug logging:

1. Edit `content.js`
2. Change `const DEBUG = false;` to `const DEBUG = true;`
3. Rebuild the extension
4. Open Safari's Web Inspector on a Google Search page
5. Check the Console tab for `[Navio]` log messages

## Architecture

### Manifest v3

Navio uses Manifest V3 for future compatibility and improved performance:

- **Non-persistent background script**: Lightweight service worker
- **Host permissions**: `<all_urls>` to support all Google country domains
- **Native messaging permission**: For seamless Apple Maps opening

### Content Script Flow

```
Page Load (Google Search)
    ↓
Content Script Initialization
    ↓
Detect Google Search Page?
    ↓ Yes
Scan for Map Links (querySelectorAll)
    ↓
For each map link:
    ├─ Convert to Apple Maps URL
    ├─ Rewrite href attribute
    └─ Add click interceptor
    ↓
Start DOM Observer (for dynamic content)
    ↓
User Clicks Link
    ↓
Click Interceptor Fires
    ↓
Send message to background script
    ↓
Background forwards to native app
    ↓
Native app opens Apple Maps
```

### Fallback Flow

```
User lands on maps.google.com
    ↓
Content Script Detects Maps Page
    ↓
Wait 500ms (for URL to stabilize)
    ↓
Extract location from current URL
    ↓
Convert to Apple Maps URL
    ↓
Redirect via native messaging
```

## Privacy

Navio is designed with privacy in mind:

- **No data collection**: No user data, location data, or search queries are collected or transmitted
- **No external servers**: All processing happens on-device
- **No analytics**: No tracking or analytics code
- **Minimal permissions**: Only requests necessary permissions for functionality
- **Open source**: All code is transparent and auditable

The extension only examines page content to find Google Maps links and uses standard URL schemes to open Apple Maps. All operations are performed locally on the user's device.

## Known Limitations

- **First-time permission prompt**: Users must allow "All Websites" permission for the extension to work on all Google domains
- **Safari prompts**: On first use, Safari may show a permission dialog to open Apple Maps
- **Dynamic content**: Some dynamically loaded Google results may have a slight delay before links are converted (handled by DOM observer)
- **macOS tab behavior**: Depending on Safari version, a blank tab might briefly appear when opening Apple Maps (mitigated by native messaging)

## Troubleshooting

### Extension not working

1. Check if the extension is enabled in Safari settings
2. Verify "All Websites" permission is granted
3. Try disabling and re-enabling the extension
4. Check Safari's Web Inspector console for errors

### Links still opening Google Maps

1. Ensure you've allowed the extension on the current website
2. Try refreshing the Google Search page
3. Check if another extension is interfering
4. Enable debug logging and check console

### Native messaging errors

1. Verify the native app is properly installed
2. Check Xcode console for native app logs
3. Ensure bundle identifiers match in manifest and app
4. Try rebuilding the entire project

## Contributing

This is a reference implementation following the comprehensive plan. Contributions are welcome for:

- Additional URL pattern support
- Performance improvements
- Icon design
- Bug fixes
- Documentation improvements

## License

See the LICENSE file for details.

## Acknowledgments

- Implementation based on comprehensive Safari Web Extension development best practices
- Inspired by similar extensions like Mapper for Safari
- Built using Apple's Safari Web Extension APIs

## Support

For issues, questions, or feedback, please open an issue on the repository or contact the developer.

---

**Built with ❤️ for iOS and macOS Safari users who prefer Apple Maps**
