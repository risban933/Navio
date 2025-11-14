/**
 * Navio Background Script
 * Handles native messaging to open Apple Maps from the native app
 */

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[Navio Background] Received message:", message);

    // Handle Apple Maps opening request
    if (message.action === "openAppleMaps" && message.url) {
        console.log("[Navio Background] Opening Apple Maps:", message.url);

        // Forward to native app via native messaging
        browser.runtime.sendNativeMessage("application.id", {
            action: "openAppleMaps",
            url: message.url
        }).then(response => {
            console.log("[Navio Background] Native app response:", response);
            sendResponse({ success: true });
        }).catch(error => {
            console.log("[Navio Background] Native messaging failed:", error);
            // Fallback will be handled by content script
            sendResponse({ success: false, error: error.message });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});

console.log("[Navio Background] Background script loaded");
