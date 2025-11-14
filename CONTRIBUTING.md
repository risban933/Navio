# Contributing to Navio

Thank you for your interest in contributing to Navio! This document provides guidelines for contributing to the project.

## Quick Links

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

- Be respectful and constructive
- Focus on what's best for the project
- Welcome newcomers and help them get started
- Provide constructive feedback
- Follow the technical standards outlined below

## Getting Started

### Prerequisites

1. **Development Environment**:
   - macOS with Xcode 14+
   - Safari 16+ for testing
   - Git for version control

2. **Read the Documentation**:
   - [README.md](README.md) - Project overview
   - [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
   - [TESTING.md](TESTING.md) - Testing procedures
   - [URL_PATTERNS.md](URL_PATTERNS.md) - URL conversion reference

3. **Set Up the Project**:
   ```bash
   git clone https://github.com/risban933/Navio.git
   cd Navio
   ./generate-icons.sh  # Generate missing icons
   open Navio.xcodeproj
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes

Follow the [Code Standards](#code-standards) below.

### 3. Test Your Changes

Run through the relevant test cases in [TESTING.md](TESTING.md):
- If changing URL conversion: Test various URL patterns
- If changing UI: Test in light and dark mode
- If changing native code: Test on both iOS and macOS

### 4. Document Your Changes

- Update README.md if adding features
- Add to CHANGELOG.md under "Unreleased"
- Update URL_PATTERNS.md if adding new URL patterns
- Add comments to complex code

### 5. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "Add support for Google Maps transit directions

- Parse transit-specific URL parameters
- Convert to Apple Maps transit mode
- Add test cases for transit routes
- Update URL_PATTERNS.md with examples"
```

Good commit message format:
```
Short summary (50 chars or less)

Detailed explanation if needed:
- What changed
- Why it changed
- Any side effects or considerations
- References to issues/PRs
```

## Code Standards

### JavaScript (content.js, background.js, popup.js)

```javascript
// Use IIFE pattern for encapsulation
(function() {
    'use strict';

    // Clear function names and documentation
    /**
     * Converts a Google Maps URL to an Apple Maps URL
     * @param {string} googleUrl - The Google Maps URL
     * @returns {string|null} - Apple Maps URL or null
     */
    function googleToAppleMapsURL(googleUrl) {
        // Error handling
        try {
            // Implementation...
        } catch (e) {
            console.error('Error:', e);
            return null;
        }
    }

    // Use const/let, not var
    const DEBUG = false;
    let processedCount = 0;
})();
```

**Standards**:
- Use IIFE to avoid global pollution
- Enable strict mode
- Use `const` for constants, `let` for variables
- Add JSDoc comments to functions
- Handle errors with try-catch
- Use meaningful variable names
- Keep functions focused (single responsibility)

### Swift (SafariWebExtensionHandler.swift, ViewController.swift)

```swift
// Clear documentation
/// Opens a URL using the appropriate method for iOS or macOS
/// - Parameter url: The URL to open
private func openURL(_ url: URL) {
    #if os(iOS)
    // iOS-specific code
    UIApplication.shared.open(url) { success in
        os_log(.default, "Opened URL: %@", url.absoluteString)
    }
    #elseif os(macOS)
    // macOS-specific code
    NSWorkspace.shared.open(url)
    #endif
}
```

**Standards**:
- Use Swift 5+ features
- Add doc comments with `///`
- Use platform-specific compilation (`#if os()`)
- Handle optionals safely
- Use `os_log` for logging
- Follow Apple's naming conventions
- Keep functions focused

### HTML/CSS

```html
<!-- Semantic markup -->
<button class="contact-button" onclick="contactDeveloper()">
    Contact Developer
</button>

<style>
/* Light mode default */
.contact-button {
    background-color: #007aff;
    color: white;
}

/* Dark mode override */
@media (prefers-color-scheme: dark) {
    .contact-button {
        background-color: #0a84ff;
    }
}
</style>
```

**Standards**:
- Use semantic HTML5 elements
- Support both light and dark mode
- Responsive design
- Accessibility (alt text, labels, ARIA)
- Clean, organized CSS
- Use system fonts when possible

### Manifest (manifest.json)

```json
{
    "manifest_version": 3,
    "name": "__MSG_extension_name__",
    "version": "1.0.0",
    "permissions": [
        "nativeMessaging"
    ]
}
```

**Standards**:
- Use Manifest v3
- Semantic versioning (major.minor.patch)
- Minimal permissions (only what's needed)
- Localized strings for user-facing text

## Testing

### Before Submitting

1. **Run Basic Tests** (from [TESTING.md](TESTING.md)):
   - Test 1: Basic Place Redirect
   - Test 2: Directions Link
   - Test 7: Multi-Word Place Name
   - Test 11: Multiple Extensions Compatibility

2. **Check Both Platforms**:
   - Build and test on iOS (simulator is fine for most changes)
   - Build and test on macOS

3. **Verify No Regressions**:
   - Existing functionality still works
   - No new errors in console
   - Performance is acceptable

### Adding New Tests

When adding new features:

1. Add test cases to TESTING.md
2. Include expected results
3. Test on both platforms if relevant
4. Document any edge cases

## Submitting Changes

### Pull Request Process

1. **Update Documentation**:
   - README.md (if needed)
   - CHANGELOG.md (add to "Unreleased")
   - URL_PATTERNS.md (if adding URL patterns)
   - Code comments

2. **Create Pull Request**:
   - Clear title describing the change
   - Description with:
     - What changed and why
     - Testing performed
     - Screenshots (if UI changes)
     - Any breaking changes

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Testing
   - [ ] Tested on iOS
   - [ ] Tested on macOS
   - [ ] Added/updated tests
   - [ ] Updated documentation

   ## Screenshots (if applicable)

   ## Breaking Changes
   None / List any breaking changes
   ```

4. **Wait for Review**:
   - Respond to feedback
   - Make requested changes
   - Re-test after changes

## Areas for Contribution

### High Priority

1. **Icon Design**:
   - Create custom Navio-branded icons
   - Follow guidelines in ICONS.md
   - Compass or map pin theme

2. **Testing**:
   - Run tests on physical devices
   - Test edge cases from URL_PATTERNS.md
   - Add automated tests

3. **Bug Fixes**:
   - Fix reported issues
   - Improve error handling
   - Edge case handling

### Medium Priority

4. **URL Pattern Support**:
   - Add support for new Google Maps URL patterns
   - Improve existing pattern detection
   - Handle more edge cases

5. **Performance**:
   - Optimize DOM queries
   - Reduce script load time
   - Memory usage improvements

6. **Documentation**:
   - Improve clarity
   - Add examples
   - Fix typos

### Nice to Have

7. **Features**:
   - Support for other mapping apps (with user setting)
   - Better error messages
   - Localization (other languages)

8. **Developer Experience**:
   - Unit tests
   - Integration tests
   - CI/CD pipeline

## URL Pattern Contributions

If adding support for a new Google Maps URL pattern:

1. **Document the Pattern**:
   ```markdown
   ### Pattern: New Pattern Name

   **Google Maps**:
   ```
   https://www.google.com/maps/new-pattern/example
   ```

   **Apple Maps**:
   ```
   https://maps.apple.com/?converted-pattern
   ```

   **How it works**:
   - Explain the conversion logic
   ```

2. **Add to content.js**:
   ```javascript
   // Check for new pattern
   if (!qParam && /\/maps\/new-pattern\//.test(path)) {
       // Extract relevant data
       // Convert to Apple Maps format
   }
   ```

3. **Add Test Case**:
   Add to TESTING.md with specific URLs to test

4. **Update URL_PATTERNS.md**:
   Document the new pattern with examples

## Questions or Issues?

- **Bug reports**: Open an issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Platform and Safari version
  - Console errors (if any)

- **Feature requests**: Open an issue with:
  - Use case description
  - Proposed solution
  - Any alternatives considered

- **Questions**: Open a discussion or issue
  - Search existing issues first
  - Be specific about what you need help with

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- README.md (if significant contribution)

## Thank You!

Your contributions help make Navio better for everyone! 🎉

---

**Happy Contributing!**

For quick setup, see [QUICKSTART.md](QUICKSTART.md)
