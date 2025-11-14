# Navio Testing Guide

This document provides comprehensive testing procedures for the Navio Safari extension to ensure it works reliably across different scenarios, platforms, and edge cases.

## Pre-Testing Checklist

Before starting tests, ensure:

- [ ] Extension is built and installed in Xcode
- [ ] Extension is enabled in Safari settings
- [ ] "All Websites" permission is granted
- [ ] Safari Developer menu is enabled (for Web Inspector access)
- [ ] You have access to both iOS and macOS devices/simulators

## Functional Testing

### Test 1: Basic Place Redirect

**Objective**: Verify basic redirection of a place search from Google Maps to Apple Maps

**Steps**:
1. Open Safari with Navio enabled
2. Navigate to google.com
3. Search for "Empire State Building"
4. Click on the map thumbnail or "View larger map" link in the search results

**Expected Result**:
- Apple Maps opens
- Shows Empire State Building location
- Pin is correctly placed on the building

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 2: Directions Link

**Objective**: Verify directions functionality

**Steps**:
1. Search for "Starbucks near me" on Google
2. Find a result with a "Directions" or "Get directions" button
3. Click the directions button

**Expected Result**:
- Apple Maps opens in directions mode
- Destination is set to the selected Starbucks
- Origin is "Current Location"
- Route is calculated

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 3: Address Search

**Objective**: Test with a specific street address

**Steps**:
1. Search for "1600 Amphitheatre Parkway, Mountain View, CA"
2. Click on any map-related link

**Expected Result**:
- Apple Maps opens
- Shows the Google headquarters location
- Address is correctly geocoded

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 4: Multiple Google Domains

**Objective**: Ensure extension works on international Google domains

**Steps**:
For each domain: google.co.uk, google.ca, google.de, google.com.au
1. Navigate to the domain
2. Search for a local landmark (e.g., "Big Ben" on google.co.uk)
3. Click a map link

**Expected Result**:
- Extension works identically on all domains
- Apple Maps opens with correct location

**Platforms to test**: macOS (easier to test multiple domains)

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 5: Smart Fallback - Direct maps.google.com URL

**Objective**: Test the fallback mechanism when landing directly on Google Maps

**Steps**:
1. Copy this URL: `https://www.google.com/maps/place/Statue+of+Liberty/@40.6892,-74.0445,17z`
2. Paste it into Safari's address bar
3. Press Enter

**Expected Result**:
- Google Maps page starts loading
- Within ~500ms, automatic redirect to Apple Maps
- Apple Maps shows Statue of Liberty

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 6: Coordinates-Based Link

**Objective**: Test links that use latitude/longitude coordinates

**Steps**:
1. Search for "@40.7128,-74.0060" (coordinates for New York City) on Google
2. Click on map result

**Expected Result**:
- Apple Maps opens
- Shows location at coordinates 40.7128, -74.0060
- Pin is placed in New York City

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 7: Multi-Word Place Name

**Objective**: Ensure proper handling of complex place names with special characters

**Steps**:
1. Search for "Grand Central Terminal New York"
2. Click map link

**Expected Result**:
- Apple Maps opens
- Correctly finds "Grand Central Terminal"
- No encoding issues with spaces

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 8: Non-Maps Links Not Affected

**Objective**: Verify extension doesn't interfere with regular Google search results

**Steps**:
1. Search for "Apple" on Google
2. Click on regular web results (NOT map links)
3. Click on images, news, etc.

**Expected Result**:
- Regular links work normally
- Only map-specific links are redirected
- No interference with other Google functionality

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

## Performance Testing

### Test 9: Link Conversion Speed

**Objective**: Ensure links are converted quickly without noticeable delay

**Setup**:
1. Enable Debug mode in content.js (set `DEBUG = true`)
2. Open Safari Web Inspector on a Google search page

**Steps**:
1. Search for "restaurants near me"
2. Check console for timing logs
3. Note the time between page load and link processing completion

**Expected Result**:
- Link processing completes in < 100ms
- No visible delay before links are clickable
- No impact on page load time

**Platform to test**: macOS (easier to inspect)

**Status**: [ ] Pass [ ] Fail

**Measured time**: ________ ms

**Notes**:
_______________________________________________

---

### Test 10: Memory Usage

**Objective**: Verify extension doesn't cause memory leaks

**Steps**:
1. Open Safari Activity window (Safari > Activity)
2. Perform 20+ searches and click map links
3. Monitor memory usage of Safari Web Content processes

**Expected Result**:
- Memory usage remains stable
- No continuous growth over time
- Extension's content script releases resources properly

**Platform to test**: macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 11: Multiple Extensions Compatibility

**Objective**: Ensure Navio works alongside other extensions

**Steps**:
1. Enable 2-3 other Safari extensions (ad blockers, password managers, etc.)
2. Repeat Test 1 (Basic Place Redirect)

**Expected Result**:
- Navio still functions correctly
- No conflicts or errors
- Other extensions continue to work

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

## User Experience Testing

### Test 12: First-Time Setup

**Objective**: Verify the onboarding experience is clear

**Steps**:
1. Install the app on a fresh device/simulator
2. Launch the Navio app
3. Follow the displayed instructions

**Expected Result**:
- Instructions are clear and easy to follow
- User can successfully enable the extension
- App UI is visually appealing in both light and dark mode

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 13: Extension Popup Display

**Objective**: Check the toolbar popup appearance and message

**Steps**:
1. Enable Navio
2. On macOS: Click the Navio icon in Safari's toolbar
3. On iOS: Access via Extensions menu

**Expected Result**:
- Popup shows "✓ Navio is active"
- Message is clear: "Google Maps links will open in Apple Maps"
- Works in both light and dark mode
- Clean, minimal design

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 14: Permission Prompts

**Objective**: Document the permission flow

**Steps**:
1. Enable extension for the first time
2. Note what permissions Safari requests
3. Click a Google Maps link on first use

**Expected Result**:
- Safari requests "All Websites" permission
- First time opening Apple Maps may show iOS/macOS permission prompt
- Subsequent uses don't show repeated prompts

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

## Edge Cases and Error Handling

### Test 15: Malformed Google Maps URL

**Objective**: Handle unusual or malformed URLs gracefully

**Steps**:
1. Create a link with unusual Google Maps URL (e.g., missing parameters)
2. Click it

**Expected Result**:
- Extension handles gracefully without crashing
- Either converts what it can, or allows normal navigation
- No JavaScript errors in console

**Platform to test**: macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 16: Rapid Clicking

**Objective**: Ensure multiple rapid clicks don't cause issues

**Steps**:
1. Search for "coffee shops"
2. Rapidly click multiple map links in succession

**Expected Result**:
- Each click opens Apple Maps correctly
- No crashes or errors
- No duplicate tabs or windows

**Platforms to test**: iOS, macOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 17: Offline Behavior

**Objective**: Test behavior without internet connection

**Steps**:
1. Load a Google search page while online
2. Disable internet connection
3. Click a map link

**Expected Result**:
- Extension attempts to open Apple Maps
- Apple Maps handles offline appropriately (may show cached data or error)
- No crashes in extension

**Platform to test**: iOS

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 18: Different Safari Versions

**Objective**: Verify compatibility across Safari versions

**Steps**:
Test on:
- Latest Safari on latest OS
- Safari on OS version N-1 (previous major version)

**Expected Result**:
- Extension works on both versions
- Manifest v3 features are supported (Safari 16+)

**Platforms to test**: iOS 16+, macOS 12+

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

## Platform-Specific Testing

### Test 19: macOS - No Blank Tab

**Objective**: Verify native messaging prevents blank tabs on macOS

**Steps**:
1. On macOS, click a Google Maps link
2. Observe Safari tab behavior

**Expected Result**:
- Apple Maps opens
- Original tab remains on Google (doesn't navigate to blank page)
- No extra tabs are created

**Platform to test**: macOS only

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

### Test 20: iOS - Return to Safari

**Objective**: Verify smooth transition back to Safari on iOS

**Steps**:
1. On iOS, click a map link
2. Apple Maps opens
3. Swipe up and return to Safari

**Expected Result**:
- Safari remains on the Google search page
- User can continue browsing normally
- No lost state or crashes

**Platform to test**: iOS only

**Status**: [ ] Pass [ ] Fail

**Notes**:
_______________________________________________

---

## Regression Testing Checklist

After any code changes, run through this quick checklist:

- [ ] Basic redirect works (Test 1)
- [ ] Directions work (Test 2)
- [ ] Fallback works (Test 5)
- [ ] No errors in console
- [ ] Performance is acceptable (Test 9)
- [ ] Works on both iOS and macOS

## Bug Report Template

If you find a bug during testing, document it using this template:

```
**Bug Title**:
**Severity**: Critical / High / Medium / Low
**Platform**: iOS / macOS / Both
**Safari Version**:
**OS Version**:

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots/Logs**:

**Workaround** (if any):
```

## Automated Testing Notes

For future enhancements, consider implementing:

- Unit tests for `googleToAppleMapsURL()` function with various URL patterns
- UI tests in Xcode for the container app
- Integration tests for native messaging
- Performance benchmarks

## Test Results Summary

**Date**: _______________
**Tester**: _______________
**Build Version**: _______________

| Test # | Test Name | iOS | macOS | Notes |
|--------|-----------|-----|-------|-------|
| 1 | Basic Place Redirect | [ ] | [ ] | |
| 2 | Directions Link | [ ] | [ ] | |
| 3 | Address Search | [ ] | [ ] | |
| 4 | Multiple Domains | - | [ ] | |
| 5 | Fallback | [ ] | [ ] | |
| 6 | Coordinates | [ ] | [ ] | |
| 7 | Multi-word Place | [ ] | [ ] | |
| 8 | Non-Maps Links | [ ] | [ ] | |
| 9 | Conversion Speed | - | [ ] | |
| 10 | Memory Usage | - | [ ] | |
| 11 | Extension Compat | [ ] | [ ] | |
| 12 | First-Time Setup | [ ] | [ ] | |
| 13 | Popup Display | [ ] | [ ] | |
| 14 | Permissions | [ ] | [ ] | |
| 15 | Malformed URL | - | [ ] | |
| 16 | Rapid Clicking | [ ] | [ ] | |
| 17 | Offline | [ ] | - | |
| 18 | Safari Versions | [ ] | [ ] | |
| 19 | No Blank Tab | - | [ ] | |
| 20 | Return to Safari | [ ] | - | |

**Overall Status**: Pass / Fail / Needs Work

**Critical Issues Found**: _______________

**Recommendations**: _______________
