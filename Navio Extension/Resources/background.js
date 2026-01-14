/**
 * Navio Background Script
 * Handles native messaging to open Apple Maps from the native app
 *
 * Per Apple documentation (Safari Web Extensions):
 * - sendNativeMessage must be called from background script or extension page
 * - Content scripts communicate with background via browser.runtime.sendMessage
 *
 * Security note (per Chrome Extensions documentation):
 * - Content scripts are less trustworthy - validate all input
 * - Always sanitize URLs before forwarding to native code
 */

/**
 * Validates that a URL is a legitimate Apple Maps URL
 * Security: Prevents malicious URLs from being forwarded to native code
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is a valid Apple Maps URL
 */
function isValidAppleMapsUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsedUrl = new URL(url);
        // Only allow maps.apple.com URLs
        return parsedUrl.hostname === 'maps.apple.com' &&
               parsedUrl.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Validates that the message sender is from an expected origin
 * Security: Ensures messages only come from Google domains
 * @param {object} sender - The message sender object
 * @returns {boolean} - True if sender is from a trusted origin
 */
function isTrustedSender(sender) {
    // Allow messages from the extension itself (popup)
    if (!sender.tab) {
        return true;
    }

    // Allow messages from Google domains (where content script runs)
    const senderUrl = sender.tab.url || '';
    try {
        const parsedUrl = new URL(senderUrl);
        return parsedUrl.hostname.includes('.google.');
    } catch (e) {
        return false;
    }
}

// Listen for messages from content scripts and popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[Navio Background] Received message:", message, "from:", sender?.tab?.url || "extension");

    // Security: Validate sender origin
    if (!isTrustedSender(sender)) {
        console.warn("[Navio Background] Message from untrusted sender rejected:", sender?.tab?.url);
        sendResponse({ success: false, error: "Untrusted sender" });
        return false;
    }

    // Handle Apple Maps opening request from content script
    if (message.action === "openAppleMaps" && message.url) {
        // Security: Validate the URL before forwarding to native code
        if (!isValidAppleMapsUrl(message.url)) {
            console.warn("[Navio Background] Invalid Apple Maps URL rejected:", message.url);
            sendResponse({ success: false, error: "Invalid Apple Maps URL" });
            return false;
        }

        console.log("[Navio Background] Opening Apple Maps:", message.url);

        // Forward to native app via native messaging
        // The application.id is ignored by Safari - it uses the extension's bundle identifier
        browser.runtime.sendNativeMessage("application.id", {
            action: "openAppleMaps",
            url: message.url
        }).then(response => {
            console.log("[Navio Background] Native app response:", response);
            sendResponse({ success: true, nativeResponse: response });
        }).catch(error => {
            console.error("[Navio Background] Native messaging failed:", error);
            // Content script will use fallback (window.location.href)
            sendResponse({ success: false, error: error.message });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    // Handle help button click from popup
    if (message.action === "openHelp") {
        console.log("[Navio Background] Help requested");
        // Could open a help page or the main app
        sendResponse({ success: true });
        return false;
    }

    // Handle conversion notification (just acknowledge)
    if (message.action === "conversionComplete") {
        console.log("[Navio Background] Conversion completed");
        return false;
    }
});

console.log("[Navio Background] Background script loaded (service worker)");
