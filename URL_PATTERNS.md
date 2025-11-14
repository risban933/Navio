# Google Maps URL Patterns and Conversions

This document provides comprehensive examples of Google Maps URL patterns that Navio handles and their corresponding Apple Maps conversions.

## Supported URL Patterns

### 1. Place Search URLs

#### Pattern: `/maps/place/` with place name

**Google Maps**:
```
https://www.google.com/maps/place/Empire+State+Building/@40.748,-73.985,17z
https://www.google.com/maps/place/Central+Park+New+York
```

**Apple Maps**:
```
https://maps.apple.com/?q=Empire%20State%20Building&ll=40.748,-73.985
https://maps.apple.com/?q=Central%20Park%20New%20York
```

**How it works**:
- Extracts place name from path segment after `/maps/place/`
- Extracts coordinates if present (after `@` symbol)
- Uses both place name and coordinates for best results

---

#### Pattern: Search with `q` or `query` parameter

**Google Maps**:
```
https://www.google.com/maps/search/?api=1&query=coffee+near+me
https://www.google.com/maps?q=1600+Amphitheatre+Parkway+Mountain+View
```

**Apple Maps**:
```
https://maps.apple.com/?q=coffee%20near%20me
https://maps.apple.com/?q=1600%20Amphitheatre%20Parkway%20Mountain%20View
```

**How it works**:
- Directly uses the `q` or `query` parameter value
- Simple 1:1 conversion

---

### 2. Directions URLs

#### Pattern: `/maps/dir/` with origin and destination

**Google Maps**:
```
https://www.google.com/maps/dir/Times+Square/Empire+State+Building
https://www.google.com/maps/dir/Current+Location/Central+Park
https://www.google.com/maps/dir//Statue+of+Liberty
```

**Apple Maps**:
```
https://maps.apple.com/?saddr=Times%20Square&daddr=Empire%20State%20Building
https://maps.apple.com/?daddr=Central%20Park
https://maps.apple.com/?daddr=Statue%20of%20Liberty
```

**How it works**:
- Extracts origin (if present) → `saddr` parameter
- Extracts destination → `daddr` parameter
- If origin is empty or "Current Location", omits `saddr` (defaults to user location)

---

#### Pattern: Query parameters for directions

**Google Maps**:
```
https://www.google.com/maps?saddr=San+Francisco&daddr=Los+Angeles
https://www.google.com/maps?origin=Seattle&destination=Portland
```

**Apple Maps**:
```
https://maps.apple.com/?saddr=San%20Francisco&daddr=Los%20Angeles
https://maps.apple.com/?saddr=Seattle&daddr=Portland
```

**How it works**:
- Maps `saddr`/`origin` → `saddr`
- Maps `daddr`/`destination` → `daddr`

---

### 3. Coordinate-Based URLs

#### Pattern: Coordinates in path (after `@`)

**Google Maps**:
```
https://www.google.com/maps/@40.7128,-74.0060,15z
https://www.google.com/maps/place/New+York/@40.7128,-74.0060,12z
```

**Apple Maps**:
```
https://maps.apple.com/?ll=40.7128,-74.0060
https://maps.apple.com/?ll=40.7128,-74.0060&q=New%20York
```

**How it works**:
- Extracts latitude and longitude from `@lat,lng,zoom` pattern
- Uses `ll` parameter for coordinates
- Includes `q` parameter if place name is available

---

### 4. Search URLs

#### Pattern: `/maps/search/` path

**Google Maps**:
```
https://www.google.com/maps/search/restaurants+near+times+square
https://www.google.com/maps/search/hotels/
```

**Apple Maps**:
```
https://maps.apple.com/?q=restaurants%20near%20times%20square
https://maps.apple.com/?q=hotels
```

**How it works**:
- Extracts search term from path after `/maps/search/`
- Converts to Apple Maps search query

---

## Edge Cases and Special Handling

### Google Redirect URLs

**Google Maps** (with tracking):
```
https://www.google.com/url?q=https://maps.google.com/...&sa=...
```

**Handling**:
- Content script looks for `href` attribute containing `maps.google.`
- Catches these before they redirect
- Extracts the actual maps URL from the `q` parameter if needed

---

### Plus Codes

**Google Maps**:
```
https://www.google.com/maps/place/850C+QQ+New+York/@40.7484,-73.9857
```

**Apple Maps**:
```
https://maps.apple.com/?ll=40.7484,-73.9857&q=850C%2BQQ%20New%20York
```

**Handling**:
- Plus codes in place names are preserved in the query
- Coordinates (if present) are used for precise location
- Apple Maps will interpret the plus code or use coordinates

---

### Multi-word Places with Special Characters

**Google Maps**:
```
https://www.google.com/maps/place/O'Hare+International+Airport
https://www.google.com/maps/place/Café+du+Monde+New+Orleans
```

**Apple Maps**:
```
https://maps.apple.com/?q=O%27Hare%20International%20Airport
https://maps.apple.com/?q=Caf%C3%A9%20du%20Monde%20New%20Orleans
```

**Handling**:
- Properly URL-encodes special characters
- Handles apostrophes, accented characters, etc.

---

### International Google Domains

All Google country domains are supported:

**Examples**:
```
https://www.google.co.uk/maps/place/Big+Ben
https://www.google.ca/maps/place/CN+Tower
https://www.google.de/maps/place/Brandenburger+Tor
https://www.google.co.jp/maps/place/東京タワー
```

**Handling**:
- Content script checks for `location.host` containing `.google.`
- Works on any Google TLD
- Preserves international characters in place names

---

## Unsupported/Fallback Cases

### Complex Google Maps Features

Some advanced Google Maps features don't have direct Apple Maps equivalents:

1. **Street View URLs**: No Apple Maps equivalent
2. **Transit routes with specific times**: Apple Maps has transit but URL scheme is different
3. **Saved lists**: User-specific, can't be converted
4. **Shared trip plans**: Not supported

**Fallback behavior**:
- If URL cannot be parsed, returns `null`
- Content script skips that link
- User can still click to go to Google Maps if needed
- Smart fallback mechanism on `maps.google.com` pages provides second chance

---

### URLs That Load Google Maps Page First

If the content script misses a link or can't parse it immediately:

1. User clicks → Google Maps page loads
2. After 500ms delay (to let URL stabilize)
3. Fallback mechanism extracts location from the loaded page URL
4. Auto-redirects to Apple Maps

**Example**:
```
User clicks: [complex google maps link]
   ↓
Page loads: https://www.google.com/maps/place/Location/@lat,lng
   ↓
Fallback extracts: lat, lng, and place name
   ↓
Redirects to: https://maps.apple.com/?ll=lat,lng&q=Location
```

---

## Testing URL Conversion

### Manual Testing

You can test the URL conversion function in the browser console:

1. Open Safari Web Inspector on a Google search page
2. Paste a test URL:

```javascript
// Example test (requires debug mode enabled in content.js)
const testUrl = "https://www.google.com/maps/place/Empire+State+Building/@40.748,-73.985,17z";
console.log(googleToAppleMapsURL(testUrl));
// Expected: "https://maps.apple.com/?ll=40.748,-73.985&q=Empire%20State%20Building"
```

### Automated Testing

Create unit tests for the `googleToAppleMapsURL()` function:

```javascript
// Example test cases
const testCases = [
    {
        input: "https://www.google.com/maps/place/Empire+State+Building/@40.748,-73.985,17z",
        expected: "https://maps.apple.com/?ll=40.748,-73.985&q=Empire%20State%20Building"
    },
    {
        input: "https://www.google.com/maps/dir/Times+Square/Empire+State+Building",
        expected: "https://maps.apple.com/?saddr=Times%20Square&daddr=Empire%20State%20Building"
    },
    {
        input: "https://www.google.com/maps?q=coffee+near+me",
        expected: "https://maps.apple.com/?q=coffee%20near%20me"
    }
    // Add more test cases...
];

testCases.forEach(test => {
    const result = googleToAppleMapsURL(test.input);
    console.assert(result === test.expected, `Failed for ${test.input}`);
});
```

---

## URL Encoding Notes

### Characters That Need Encoding

- Spaces: `%20` or `+`
- Apostrophes: `%27`
- Commas: `%2C`
- Accented characters: UTF-8 encoding (e.g., `é` → `%C3%A9`)

### Implementation

The content script uses `encodeURIComponent()` which handles all special characters:

```javascript
const query = "Café O'Hare";
const encoded = encodeURIComponent(query);
// Result: "Caf%C3%A9%20O%27Hare"
```

---

## Regular Expressions Used

### Coordinate Pattern

```javascript
/@(-?\d+\.\d+),(-?\d+\.\d+)/
```

Matches: `@40.7128,-74.0060` or `@-33.8688,151.2093`

### Path Patterns

```javascript
/\/maps\/place\//
/\/maps\/dir\//
/\/maps\/search\//
/\.google\./  // Matches any Google domain
```

---

## Apple Maps URL Scheme Reference

### Parameters

- `q=` : Search query
- `ll=` : Latitude,Longitude
- `saddr=` : Source address (starting point)
- `daddr=` : Destination address
- `address=` : Direct address (alternative to `q`)

### Examples

```
Search:      maps.apple.com/?q=coffee
Coordinates: maps.apple.com/?ll=40.7128,-74.0060
Directions:  maps.apple.com/?daddr=Empire+State+Building
Combined:    maps.apple.com/?ll=40.7128,-74.0060&q=New+York
```

### Documentation

Official Apple Maps URL Scheme:
https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html

---

## Implementation Checklist

When adding support for a new URL pattern:

- [ ] Identify the pattern in Google Maps URLs
- [ ] Add detection logic to `googleToAppleMapsURL()` function
- [ ] Determine the equivalent Apple Maps parameters
- [ ] Handle URL encoding properly
- [ ] Add test cases to TESTING.md
- [ ] Test on both iOS and macOS
- [ ] Test with international characters
- [ ] Update this documentation

---

## Known Limitations

1. **No Street View**: Google Street View URLs can't be converted
2. **No bike/walk route preferences**: Apple Maps URL scheme doesn't support these
3. **No traffic layers**: Can't transfer Google Maps traffic overlay
4. **No saved places**: User-specific Google Maps data can't be accessed

For these cases, the extension either:
- Skips conversion (link remains to Google Maps)
- Converts to best approximation (e.g., driving directions instead of bike)
- Uses fallback mechanism after page loads

---

**Last Updated**: 2025-11-14
**Navio Version**: 1.0.0
