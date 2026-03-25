# 100 High-Impact Improvements for Navio

This assessment is based on the current repository state as of 2026-03-25, with ranking biased toward release-readiness for the existing iOS-first Safari extension and container app.

Impact scale: High, Medium-High, Medium. Effort scale: S, M, L.

## 1-20 Highest Leverage

1. **Automate end-to-end Safari redirect tests on iOS simulator**  
   Area: QA. Impact: High. Effort: M. Why: Navio's core promise is still verified mostly by manual steps, so regressions in place, directions, fallback, and toggle flows can ship unnoticed. Surface: `NavioUITests`, shared Xcode scheme, `TESTING.md`.

2. **Build a fixture-driven Google-to-Apple URL compatibility matrix**  
   Area: Conversion. Impact: High. Effort: M. Why: The converter currently has only a handful of JS tests, which is too thin for the number of Google URL shapes Navio claims to support. Surface: `tests/js/urlConversion.test.mjs`, `URL_PATTERNS.md`, `Navio Extension/Resources/lib/urlConversion.js`.

3. **Close the iOS native-opening architecture gap**  
   Area: Reliability. Impact: High. Effort: L. Why: The extension background path sends native messages, but the iOS extension handler only logs and the actual open falls back to `window.location.href`. Either implement a true iOS handoff or simplify the architecture and docs to match reality. Surface: `Navio Extension/Resources/background.js`, `Navio Extension/SafariWebExtensionHandler.swift`, `README.md`.

4. **Add debug-only diagnostics for failed or unconvertible URLs**  
   Area: Debugging. Impact: High. Effort: M. Why: Right now failed conversions disappear quietly, which makes it hard to improve coverage from real-world misses without reproducing them manually. Surface: `content.js`, `popup.js`, app shell.

5. **Harden the converter so it only accepts verified Google Maps URLs**  
   Area: Security/Correctness. Impact: High. Effort: M. Why: `googleToAppleMapsURL()` treats any URL with a `/maps`-like path as convertible, even when the URL is not actually a Google Maps URL. Tightening host and path validation reduces false positives and hardens behavior. Surface: `Navio Extension/Resources/lib/urlConversion.js`.

6. **Support waypoint and multi-stop directions**  
   Area: Conversion. Impact: High. Effort: M. Why: Current direction parsing is single-origin, single-destination only, which leaves a lot of modern Google Maps share flows uncovered. Surface: `Navio Extension/Resources/lib/urlConversion.js`, `URL_PATTERNS.md`.

7. **Support more modern Google Maps share formats**  
   Area: Conversion. Impact: High. Effort: M. Why: The parser should explicitly cover `api=1`, `map_action`, `place_id`, `destination_place_id`, and other structured share links instead of relying on path heuristics. Surface: `Navio Extension/Resources/lib/urlConversion.js`.

8. **Respect modifier-click and new-tab intent**  
   Area: UX/Correctness. Impact: High. Effort: M. Why: The content script currently rewrites links to `_self` and intercepts clicks in capture phase, which can break expected Safari behaviors like opening in a new tab or preserving user intent. Surface: `Navio Extension/Resources/content.js`.

9. **Add integration tests for the popup master toggle**  
   Area: QA. Impact: High. Effort: M. Why: The toggle is now the main user control, but there is no automated proof that popup state, storage, content script behavior, and fallback logic stay in sync. Surface: `popup.js`, `settings.js`, `content.js`, `stats.js`.

10. **Replace the fixed 500ms fallback with URL-stabilization logic**  
   Area: Reliability. Impact: High. Effort: M. Why: Google Maps pages do not always settle on a stable URL within a constant delay, so the current fallback timing is brittle. Surface: `Navio Extension/Resources/content.js`.

11. **Reduce whole-document anchor rescans**  
   Area: Performance. Impact: High. Effort: M. Why: The content script can still fall back to processing every anchor on large pages, which is avoidable and risky as Google changes search layouts. Surface: `Navio Extension/Resources/content.js`.

12. **Add strong negative-path tests for non-map links**  
   Area: QA. Impact: High. Effort: S. Why: A redirect tool fails not only when it misses map links but also when it touches ordinary search results. Navio needs explicit tests that prove it does not interfere with non-map content. Surface: `tests/js`, `TESTING.md`.

13. **Add CI for JS tests and Xcode build/test**  
   Area: Release Operations. Impact: High. Effort: M. Why: The repo currently relies on local verification discipline. A failing build or broken JS converter should block merges automatically. Surface: GitHub Actions, shared scheme, test commands in `QUICKSTART.md`.

14. **Establish a physical-device release gate**  
   Area: QA/Release. Impact: High. Effort: S. Why: Safari extension behavior on actual iPhones and iPads is a release-critical path, and simulator-only confidence is not enough for a product that hands off into Apple Maps. Surface: `TESTING.md`, release checklist.

15. **Reconcile outdated architectural claims across docs**  
   Area: Documentation. Impact: High. Effort: S. Why: The repo contains conflicting statements about macOS support, `<all_urls>` host permissions, and native-opening behavior. Those inconsistencies create release and maintenance risk. Surface: `README.md`, `PROJECT_STATUS.md`, `IMPLEMENTATION_CHECKLIST.md`, `CONTRIBUTING.md`.

16. **Add generated-file drift checks for manifest and allowlist**  
   Area: Build Integrity. Impact: High. Effort: S. Why: `manifest.json` and `allowedHosts.js` are generated from `config/google_domains.json`, but nothing enforces regeneration when the source changes. Surface: `scripts/generate-extension-config.mjs`, CI.

17. **Split the content script into smaller testable modules**  
   Area: Maintainability. Impact: High. Effort: M. Why: `content.js` currently owns scanning, rewriting, fallback timing, history patching, and settings synchronization in one file. Breaking it up will make regression testing and future changes safer. Surface: `Navio Extension/Resources/content.js`.

18. **Create a sanitized real-world URL fixture collection process**  
   Area: QA/Discovery. Impact: High. Effort: S. Why: Navio needs a repeatable way to turn actual failed Google URLs into tests without leaking user data. Surface: `tests/js`, contributor workflow.

19. **Introduce structured error categories across JS and Swift layers**  
   Area: Reliability. Impact: High. Effort: M. Why: Failures currently collapse into generic `success: false` or silent fallback. Named error types would make debugging and UX messaging much clearer. Surface: `background.js`, `content.js`, `SafariWebExtensionHandler.swift`, `popup.js`.

20. **Expose the last redirect result in a debug surface**  
   Area: Supportability. Impact: High. Effort: M. Why: A simple view showing the last Google URL, Apple URL, conversion path, and failure reason would make manual QA and support dramatically faster. Surface: popup or container app.

## 21-50 Near-Term Improvements

21. **Normalize Google URLs into an intermediate model before building Apple URLs**  
   Area: Architecture. Impact: Medium-High. Effort: M. Why: Parsing directly into Apple Maps query strings makes it harder to add formats cleanly. A normalized route/place/search model will simplify future coverage. Surface: `Navio Extension/Resources/lib/urlConversion.js`.

22. **Add parser support for `maps.app.goo.gl` and other Google share shortlinks**  
   Area: Conversion. Impact: Medium-High. Effort: M. Why: Many mobile share flows use shortened Google links before expanding to full Maps URLs. Surface: converter, fixture tests.

23. **Add contract tests for sender validation in the background script**  
   Area: Security/QA. Impact: Medium-High. Effort: S. Why: `isTrustedSender()` is important defense-in-depth logic and deserves direct tests so future changes do not weaken it. Surface: `Navio Extension/Resources/background.js`.

24. **Add contract tests for the native message payload**  
   Area: Reliability. Impact: Medium-High. Effort: S. Why: The JS and Swift layers should agree on action names, URL requirements, and response structure, especially because the current bridge is already inconsistent on iOS. Surface: `background.js`, `SafariWebExtensionHandler.swift`.

25. **Make unsupported conversion cases explicit to the user**  
   Area: UX. Impact: Medium-High. Effort: M. Why: When Navio cannot convert a complex link, users currently just stay on Google Maps. Clearer messaging in onboarding or help would reduce confusion and support load. Surface: app copy, popup copy, docs.

26. **Add performance benchmarks for search-page scanning**  
   Area: Performance. Impact: Medium-High. Effort: M. Why: The docs promise fast link rewriting, but there is no automated measurement of scan time on realistic result pages. Surface: `content.js`, benchmark harness.

27. **Record conversion path reason codes**  
   Area: Debugging. Impact: Medium-High. Effort: S. Why: Knowing whether a redirect happened through direct rewrite, click interception, or Google Maps fallback would make failures much easier to triage. Surface: `content.js`, `stats.js`, debug UI.

28. **Add tests for international characters, plus codes, and locale-specific addresses**  
   Area: QA. Impact: Medium-High. Effort: S. Why: These cases are documented, but the current automated coverage does not prove them. Surface: `tests/js/urlConversion.test.mjs`, `URL_PATTERNS.md`.

29. **Add tests for directions modes beyond walking**  
   Area: QA. Impact: Medium-High. Effort: S. Why: The converter maps several travel modes, but only walking is covered today. Surface: `urlConversion.js`, JS tests.

30. **Cover Google search result layouts beyond `/search` basics**  
   Area: Product/QA. Impact: Medium-High. Effort: M. Why: Navio should be validated against local packs, map thumbnails, business profiles, and dynamic search modules, not just classic search results. Surface: `content.js`, manual matrix.

31. **Eliminate the dead popup runtime listener or make it real**  
   Area: Code Quality. Impact: Medium-High. Effort: S. Why: `popup.js` listens for `conversionComplete`, but the background script does not rebroadcast that event. Either wire it correctly or remove the dead path. Surface: `popup.js`, `background.js`.

32. **Version and migrate stored settings and stats**  
   Area: Data Integrity. Impact: Medium-High. Effort: S. Why: Storage keys are simple today, but future settings changes will need safe migrations instead of ad hoc reads. Surface: `settings.js`, `stats.js`.

33. **Add explicit tests for extension state when storage APIs are missing or degraded**  
   Area: Reliability. Impact: Medium-High. Effort: S. Why: The code has fallbacks for missing storage, but those paths are not fully verified. Surface: `settings.js`, `stats.js`, JS tests.

34. **Expand the supported Google domain list from a maintained source of truth**  
   Area: Reach. Impact: Medium-High. Effort: M. Why: The current allowlist is manually curated and limited. A repeatable sync process would prevent missing important markets. Surface: `config/google_domains.json`, generator script.

35. **Add tests for generated domain patterns and wildcard coverage**  
   Area: Build Integrity. Impact: Medium-High. Effort: S. Why: The generator creates manifest matches and runtime host checks; those should be asserted directly so allowlist edits stay safe. Surface: `scripts/generate-extension-config.mjs`, `allowedHosts.js`.

36. **Make the popup show the current app and extension version**  
   Area: Supportability. Impact: Medium-High. Effort: S. Why: Support and QA need to know exactly which build they are testing without checking Xcode or bundle metadata manually. Surface: popup UI, bundle config.

37. **Add a stronger “extension not enabled” detection and guidance path**  
   Area: UX. Impact: Medium-High. Effort: M. Why: A large share of setup friction comes from Safari permissions and extension enablement, not from converter bugs. Surface: onboarding app, popup copy.

38. **Replace the placeholder support email with a release-blocking config check**  
   Area: Release Operations. Impact: Medium-High. Effort: S. Why: Shipping `support@navio-app.com` without validation is avoidable and user-visible. Surface: `Shared/SupportConfig.json`, build validation.

39. **Add bundle-inclusion tests for `SupportConfig.json` in both targets**  
   Area: QA. Impact: Medium-High. Effort: S. Why: The app and extension both depend on the support config, and missing bundle membership would silently break the support path. Surface: Swift tests, extension resources.

40. **Add Swift tests for the contact-support fallback flow**  
   Area: QA. Impact: Medium-High. Effort: M. Why: `ViewController.swift` has logic for both `MFMailComposeViewController` and `mailto:` fallback, but it is untested. Surface: `Navio/ViewController.swift`, `NavioTests`.

41. **Add Swift tests for native message validation behavior**  
   Area: QA. Impact: Medium-High. Effort: M. Why: `SafariWebExtensionHandler` validates action and URL format, and that logic should be covered to avoid regressions during bridge changes. Surface: `Navio Extension/SafariWebExtensionHandler.swift`.

42. **Create a stable xcodebuild wrapper script for local and CI use**  
   Area: Developer Experience. Impact: Medium-High. Effort: S. Why: The repo currently documents long simulator-specific commands that are easy to mistype and hard to keep current. Surface: scripts, `QUICKSTART.md`.

43. **Add a `package.json` for JS test and tooling commands**  
   Area: Developer Experience. Impact: Medium-High. Effort: S. Why: Node-based tests and future linting are easier to use and automate when the repo has a standard JS tool entrypoint. Surface: repo root, JS tests.

44. **Add linting and formatting for extension JavaScript**  
   Area: Code Quality. Impact: Medium-High. Effort: S. Why: The JS code is now substantial enough to justify static checks for accidental globals, dead listeners, and drift in style. Surface: extension resources, scripts.

45. **Add `check-generated` and `test` commands to the contributor workflow**  
   Area: Release Operations. Impact: Medium-High. Effort: S. Why: Contributors should have one obvious way to regenerate config, run JS tests, and catch drift before submitting changes. Surface: `CONTRIBUTING.md`, tooling.

46. **Create regression snapshots for Apple Maps URLs emitted by the converter**  
   Area: QA. Impact: Medium-High. Effort: S. Why: Snapshot-style expectations make it easier to detect accidental changes in encoding, parameter ordering, and query composition. Surface: `tests/js/urlConversion.test.mjs`.

47. **Add a Safari-version compatibility matrix**  
   Area: QA/Release. Impact: Medium-High. Effort: S. Why: Safari extension behavior can vary across iOS and Safari releases, and release confidence should explicitly cover that matrix. Surface: `TESTING.md`, release docs.

48. **Move repo docs toward a single source of truth for current status**  
   Area: Documentation. Impact: Medium-High. Effort: M. Why: The repo has multiple long-form docs that are partially overlapping and partially stale. Reducing duplication will lower maintenance cost. Surface: `README.md`, `PROJECT_STATUS.md`, `QUICKSTART.md`, `IMPLEMENTATION_CHECKLIST.md`.

49. **Add a contributor-facing process for turning manual bugs into automated tests**  
   Area: QA Culture. Impact: Medium-High. Effort: S. Why: The fastest way to improve Navio is to make every converter miss become a permanent fixture or scenario. Surface: `CONTRIBUTING.md`, `TESTING.md`.

50. **Verify and document the exact reason the combined Node test command behaves inconsistently**  
   Area: Developer Experience. Impact: Medium-High. Effort: S. Why: Individual JS tests complete quickly, but combined invocation was not obviously responsive during repo inspection. That command needs to be boring and predictable. Surface: JS tooling, docs.

## 51-100 Strategic Improvements

51. **Replace the HTML onboarding shell with a native SwiftUI or UIKit screen**  
   Area: Product/UX. Impact: Medium. Effort: M. Why: The container app is currently a WKWebView wrapper around local HTML. A native onboarding flow would age better and integrate more cleanly with iOS conventions. Surface: `Navio/ViewController.swift`, app resources.

52. **Add direct links or guided affordances into the relevant Safari settings flows**  
   Area: UX. Impact: Medium. Effort: M. Why: Setup friction is one of the biggest risks for a Safari extension, and the current app mostly relies on static text instructions. Surface: onboarding app, help flow.

53. **Show supported Google domains inside the app or popup**  
   Area: Trust/UX. Impact: Medium. Effort: S. Why: Since site access is intentionally narrow, surfacing the supported domains would help users understand where Navio should work. Surface: popup, onboarding.

54. **Add a first-run checklist inside the container app**  
   Area: Onboarding. Impact: Medium. Effort: M. Why: Users would benefit from a visible stateful checklist for app installed, extension enabled, site access granted, and test redirect verified. Surface: app shell.

55. **Add a lightweight self-test flow for setup verification**  
   Area: Product/Support. Impact: Medium. Effort: M. Why: A built-in “test with sample link” feature would help users confirm everything is working before they rely on the extension. Surface: app shell, possibly local fixture links.

56. **Expose a user-controlled fallback behavior setting**  
   Area: Product. Impact: Medium. Effort: M. Why: Some users may want direct Google Maps pages to stay on Google while still rewriting search-result links. Surface: popup settings, `content.js`.

57. **Add a session-only pause mode**  
   Area: Product. Impact: Medium. Effort: S. Why: A softer pause option would help users temporarily bypass Navio without losing their preferred default state. Surface: `settings.js`, popup.

58. **Add a per-domain enablement model**  
   Area: Product. Impact: Medium. Effort: M. Why: Some users may want Navio active on `google.com` but not on every supported regional domain. Surface: settings, host logic, popup.

59. **Add a “last 10 redirects” history in debug mode**  
   Area: Supportability. Impact: Medium. Effort: M. Why: A short in-device history would make intermittent bug reports much easier to diagnose without collecting personal data by default. Surface: popup or app shell.

60. **Create a user-exported diagnostics bundle for support**  
   Area: Supportability. Impact: Medium. Effort: M. Why: When users report failures, a manually exported bundle with version, settings, and recent debug-only redirect records would be much more actionable than free-form email. Surface: app shell, support flow.

61. **Add accessibility audits for the popup UI**  
   Area: Accessibility. Impact: Medium. Effort: S. Why: The popup has a good baseline, but it should be validated for VoiceOver order, control names, and status announcements. Surface: `popup.html`, `popup.css`, `popup.js`.

62. **Verify popup behavior with Dynamic Type and larger text sizes**  
   Area: Accessibility/UX. Impact: Medium. Effort: S. Why: Fixed-width extension UIs often break under larger text settings. Surface: popup UI.

63. **Add explicit reduced-motion and high-contrast reviews**  
   Area: Accessibility. Impact: Medium. Effort: S. Why: The popup already reacts to reduced motion in one counter path, but the full UI should be reviewed systematically. Surface: `popup.css`, `popup.js`.

64. **Localize the extension and onboarding experience beyond English**  
   Area: Reach. Impact: Medium. Effort: L. Why: The product targets multiple Google domains, so localization readiness is a natural next step for adoption outside English-speaking regions. Surface: popup, app HTML, manifest locales.

65. **Centralize all user-facing strings for easier localization and review**  
   Area: Maintainability. Impact: Medium. Effort: M. Why: Strings are spread across HTML, JS, Swift, and docs; centralization will simplify localization and copy edits. Surface: popup, app resources, Swift files.

66. **Add screenshots and visual regression assets for the popup**  
   Area: QA/Release. Impact: Medium. Effort: M. Why: The popup is a user-facing product surface and should have stable visual references across light and dark mode. Surface: popup UI, release assets.

67. **Create App Store asset and listing templates in the repo**  
   Area: Release Operations. Impact: Medium. Effort: S. Why: Screenshots, descriptions, privacy text, and support links are release blockers that should be tracked as source-controlled artifacts. Surface: docs/assets.

68. **Add a privacy-policy document and in-app link**  
   Area: Trust/Release. Impact: Medium. Effort: S. Why: Navio promises not to collect or store personal data; a formal privacy policy should reinforce that promise and support distribution requirements. Surface: docs, app/popup links.

69. **Prepare for Apple's privacy manifest expectations**  
   Area: Release Operations. Impact: Medium. Effort: M. Why: Even simple apps benefit from having privacy declarations and dependency audits squared away before release. Surface: Xcode project, release docs.

70. **Audit logging so release builds do not emit unnecessary URL data**  
   Area: Privacy/Security. Impact: Medium. Effort: S. Why: `os_log` and debug helpers should avoid retaining or exposing user destinations in normal operation. Surface: Swift handler, JS debug paths.

71. **Add a small threat-model document for extension trust boundaries**  
   Area: Security. Impact: Medium. Effort: S. Why: The product rewrites links and bridges between JS and native code, which is exactly the kind of system that benefits from an explicit trust-boundary review. Surface: docs.

72. **Document the exact allowed-host policy and why it is intentionally narrow**  
   Area: Product/Trust. Impact: Medium. Effort: S. Why: This is one of Navio's strongest privacy choices and should be explained clearly to users and contributors. Surface: `README.md`, onboarding, popup help.

73. **Add an internal architecture diagram that matches the post-refactor code**  
   Area: Documentation. Impact: Medium. Effort: S. Why: The current system spans content, background, native handler, popup, and app shell. A current diagram would help new contributors move faster. Surface: docs.

74. **Create design decision records for key tradeoffs**  
   Area: Maintainability. Impact: Medium. Effort: S. Why: Decisions like iOS-first scope, no analytics, generated host permissions, and fallback behavior should be explicitly recorded. Surface: docs/ADR folder.

75. **Add a contributor PR template focused on redirect safety**  
   Area: Team Workflow. Impact: Medium. Effort: S. Why: A PR template that asks for affected URL shapes, test coverage, and permission impact would keep reviews sharper. Surface: GitHub repo config.

76. **Add issue templates for broken URL reports and setup failures**  
   Area: Support/Workflow. Impact: Medium. Effort: S. Why: Structured issue reports are especially useful for a product with many edge-case URLs and environment-sensitive extension behavior. Surface: GitHub repo config.

77. **Add CODEOWNERS or explicit review guidance for cross-layer changes**  
   Area: Team Workflow. Impact: Medium. Effort: S. Why: Converter, background, and native bridge changes carry higher risk than isolated UI tweaks and should be reviewed accordingly. Surface: repo config, `CONTRIBUTING.md`.

78. **Add a release checklist that explicitly covers generated artifacts**  
   Area: Release Operations. Impact: Medium. Effort: S. Why: The release process should require regenerating manifest files, verifying the support email, and confirming icon completeness. Surface: release docs.

79. **Add a pre-commit or CI hook for generated-file drift**  
   Area: Build Integrity. Impact: Medium. Effort: S. Why: This complements item 16 by making drift visible before or during review rather than after merge. Surface: CI, tooling.

80. **Add docs-to-code verification for converter examples**  
   Area: Documentation/QA. Impact: Medium. Effort: M. Why: The examples in `URL_PATTERNS.md` and `README.md` should be executable assertions so docs do not silently drift from implementation. Surface: docs, JS tests.

81. **Turn the allowed-host module into a tested shared library contract**  
   Area: Maintainability. Impact: Medium. Effort: S. Why: Host validation is used for both matching and trust checks, so it deserves explicit tests and ownership like the converter does. Surface: `allowedHosts.js`, generator script.

82. **Add integration tests for history patching and SPA navigation**  
   Area: QA. Impact: Medium. Effort: M. Why: `pushState`, `replaceState`, and `popstate` handling is easy to break and central to modern Google search pages. Surface: `content.js`.

83. **Add cleanup logic for long-lived pages and repeated searches**  
   Area: Performance/Reliability. Impact: Medium. Effort: M. Why: The content script maintains timers, observers, and patched history methods on dynamic pages, so longevity behavior should be explicitly reviewed and hardened. Surface: `content.js`.

84. **Replace string heuristics in `shouldInspectHref()` with parsed URL rules**  
   Area: Correctness. Impact: Medium. Effort: M. Why: Raw substring checks are convenient but fragile. Parsed host/path/query rules would reduce accidental matches and improve maintainability. Surface: `content.js`.

85. **Expand tests for encoded redirect wrappers and nested wrappers**  
   Area: QA. Impact: Medium. Effort: S. Why: Google often nests tracking wrappers, and `unwrapGoogleRedirectUrl()` should be proven against more than a single example. Surface: `urlConversion.js`, JS tests.

86. **Add support for Google Maps URLs that encode data in uncommon query blobs**  
   Area: Conversion. Impact: Medium. Effort: L. Why: Some shared URLs store route or place context in opaque query parameters, and partial support for the common ones could materially improve coverage. Surface: converter, research fixtures.

87. **Evaluate whether some unsupported cases should intentionally stay on Google Maps**  
   Area: Product Strategy. Impact: Medium. Effort: M. Why: Not every Google Maps feature has a good Apple Maps equivalent; a more explicit product policy would prevent bad redirects. Surface: converter policy, docs.

88. **Add a compatibility review for Apple Maps URL scheme limitations**  
   Area: Product/QA. Impact: Medium. Effort: S. Why: Navio should clearly document which Google concepts can be preserved in Apple Maps and which cannot. Surface: `URL_PATTERNS.md`, converter design.

89. **Add a small browser-API compatibility layer**  
   Area: Reliability. Impact: Medium. Effort: M. Why: The extension assumes Safari's `browser` API shape is stable enough, but a small wrapper would make fallbacks and tests cleaner. Surface: extension JS modules.

90. **Create a fake-browser integration harness for extension modules**  
   Area: QA. Impact: Medium. Effort: M. Why: Unit tests cover helpers, but a lightweight browser mock would let the repo test more of popup, storage, and background behavior without a full browser run. Surface: `tests/js`, extension modules.

91. **Move the extension JavaScript toward ES modules or TypeScript**  
   Area: Maintainability. Impact: Medium. Effort: L. Why: The codebase is large enough now that stronger structure, imports, and type safety would pay off over time. Surface: extension JS, build tooling.

92. **Refactor support-config loading into a shared native helper**  
   Area: Maintainability. Impact: Medium. Effort: S. Why: The support email logic exists in both app and extension-adjacent flows and should not drift. Surface: Swift app code, extension resource loading.

93. **Add a clearer in-app help center instead of mail-only support**  
   Area: Product/Support. Impact: Medium. Effort: M. Why: Many issues are setup misunderstandings that are better solved with targeted help content than with raw support email. Surface: app shell, docs.

94. **Add a “what Navio changes and what it does not” explainer**  
   Area: Product/Trust. Impact: Medium. Effort: S. Why: Being explicit about which links are touched and when helps users trust the extension. Surface: onboarding, popup, README.

95. **Add a first-class roadmap document with owner-oriented workstreams**  
   Area: Strategy. Impact: Medium. Effort: S. Why: The repo now has enough moving parts that improvements should be grouped into QA, converter, release, and UX streams for planning. Surface: docs.

96. **Add a formal definition of release-ready for the project**  
   Area: Release Operations. Impact: Medium. Effort: S. Why: The current docs imply readiness, but a concrete release gate would stop ambiguity around what still has to happen. Surface: `PROJECT_STATUS.md`, release docs.

97. **Benchmark and optimize repeated Google results-page mutations**  
   Area: Performance. Impact: Medium. Effort: M. Why: Search pages can continuously mutate, and Navio should stay cheap even when users scroll through long dynamic results. Surface: `content.js`.

98. **Review whether direct `window.location.href` fallback is the best UX on iOS**  
   Area: Product/UX. Impact: Medium. Effort: M. Why: Depending on Safari behavior, direct navigation may create blank-tab or history artifacts that a better handoff design could avoid. Surface: `content.js`, native bridge.

99. **Add metrics-style counters for setup completion in local-only debug mode**  
   Area: Product/Support. Impact: Medium. Effort: M. Why: Even without cloud analytics, local debug counters could help the team understand where onboarding fails during internal testing. Surface: app shell, debug tooling.

100. **Institute a quarterly audit of supported domains, URL formats, and docs**  
   Area: Sustained Quality. Impact: Medium. Effort: S. Why: Google URL shapes and Safari behavior will keep changing; Navio needs a lightweight recurring maintenance rhythm so the product does not slowly rot. Surface: release process, docs, tests.
