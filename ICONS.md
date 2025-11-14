# Icon Assets for Navio

This document describes the icon assets needed for the Navio Safari extension.

## Required Icon Sizes

The extension requires icons in the following sizes to support both iOS and macOS Safari at various display densities:

### Extension Icons (for manifest.json)

Place these in `Navio Extension/Resources/images/`:

- **icon-16.png** (16×16px) - Browser UI, extension management
- **icon-19.png** (19×19px) - iOS Safari toolbar (1x)
- **icon-32.png** (32×32px) - Browser UI @2x
- **icon-38.png** (38×38px) - iOS Safari toolbar (2x)
- **icon-48.png** (48×48px) - Extension management
- **icon-64.png** (64×64px) - Extension management @2x
- **icon-96.png** (96×96px) - Extension management @3x
- **icon-128.png** (128×128px) - Safari preferences, App Store
- **icon-256.png** (256×256px) - macOS retina displays
- **icon-512.png** (512×512px) - macOS retina displays, App Store

### App Icons (for the container app)

These are managed in `Navio/Assets.xcassets/AppIcon.appiconset/`:

Follow Apple's Human Interface Guidelines for app icons:
- iOS: 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt (at 1x, 2x, 3x)
- macOS: 16pt, 32pt, 128pt, 256pt, 512pt (at 1x, 2x)

Xcode's asset catalog will guide you on the exact pixel sizes needed.

## Design Guidelines

### Style Recommendations

1. **Simple and Recognizable**: The icon should be simple enough to be recognizable at small sizes (16px)

2. **Navigation Theme**: Consider using a compass, map pin, or navigation arrow to represent the app's purpose

3. **Template Style for Toolbar**: The smaller toolbar icons (19px, 38px) work best as simple, monochromatic shapes that Safari can tint

4. **Color Palette**:
   - Primary: Blue (#007AFF - Apple's system blue) to match Apple Maps
   - Accent: White or light gray for contrast
   - Consider a simple two-tone design

### Design Concepts

**Option 1: Compass Icon**
- A simple compass rose or compass needle
- Represents navigation and direction
- Works well at small sizes
- Fits the "Navio" (navigation) theme

**Option 2: Map Pin**
- Stylized map pin or location marker
- Instantly recognizable as map-related
- Could incorporate an arrow to suggest redirection

**Option 3: Combined Symbol**
- A pin with a compass needle
- Or a pin with an arrow showing the redirect action
- More complex but tells the full story

### Color Schemes

**Light Mode**:
- Icon: Blue (#007AFF) on white/transparent background
- Or: Dark blue (#0051D5) for better visibility

**Dark Mode**:
- Icon: Light blue (#0A84FF) on dark background
- Or: White (#FFFFFF) for maximum contrast

**Adaptive**:
Consider creating separate assets for light/dark mode if the design benefits from it.

## Creating the Icons

### Tools

- **Sketch** or **Figma**: Professional design tools with iOS/macOS templates
- **SF Symbols**: Apple's icon library (can use as inspiration or base)
- **Pixelmator Pro**: Mac-native image editor
- **Adobe Illustrator**: Vector design

### Workflow

1. **Design at the largest size** (512×512px) in a vector format
2. **Export at all required sizes** using your design tool's export feature
3. **Optimize for small sizes**: Simplify details for 16px, 19px, 32px versions
4. **Test at actual size**: View icons at their intended display size to ensure clarity
5. **Use PNG format** with transparency where appropriate

### Quick Start with Placeholder

For development/testing, you can create simple placeholder icons:

```bash
# Using ImageMagick (if installed)
# Creates a simple blue circle with "N" text
for size in 16 19 32 38 48 64 96 128 256 512; do
  convert -size ${size}x${size} xc:none \
    -fill "#007AFF" -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \
    -fill white -gravity center -pointsize $((size/2)) -annotate 0 "N" \
    "Navio Extension/Resources/images/icon-${size}.png"
done
```

Or use any simple graphic editor to create colored squares with the letter "N" as placeholders.

## Current Status

**⚠️ Action Required**: The icon assets are currently referenced in the manifest but not yet created.

To make the extension functional, you must:

1. Create icons in all required sizes
2. Place them in `Navio Extension/Resources/images/`
3. Ensure filenames match the manifest.json references
4. Update the app icon in Xcode's asset catalog

Until icons are added, the extension may show default/blank icons in Safari's UI.

## Testing Icons

After adding icons:

1. **Rebuild the extension** in Xcode
2. **Check Safari Extensions preferences**: Your icon should appear next to "Navio"
3. **Check the toolbar**: The icon should appear when you click the extensions button
4. **Test in light and dark mode**: Ensure visibility in both

## Resources

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Safari Web Extensions - Icons](https://developer.apple.com/documentation/safariservices/safari-web-extensions/customizing-the-appearance-of-safari-extensions)
- [SF Symbols App](https://developer.apple.com/sf-symbols/) - For inspiration
- [App Icon Generator](https://appicon.co/) - Online tool for generating multiple sizes

---

**Note**: Once you create the icons, consider updating this document with the final design choices and any specific implementation notes.
