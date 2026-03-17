/**
 * Navio background service worker.
 * Handles native messaging and extension-level state maintenance.
 */

importScripts("lib/allowedHosts.js", "lib/settings.js", "lib/stats.js");

(function() {
    "use strict";

    const DEBUG = false;

    function log() {
        if (DEBUG) {
            console.log("[Navio Background]", ...arguments);
        }
    }

    function isValidAppleMapsUrl(url) {
        if (!url || typeof url !== "string") {
            return false;
        }

        try {
            const parsedUrl = new URL(url);
            return parsedUrl.hostname === "maps.apple.com" && parsedUrl.protocol === "https:";
        } catch (error) {
            return false;
        }
    }

    function isTrustedSender(sender) {
        if (!sender?.tab?.url) {
            return true;
        }

        try {
            const parsedUrl = new URL(sender.tab.url);
            return globalThis.NavioAllowedHosts.isAllowedGoogleHost(parsedUrl.hostname);
        } catch (error) {
            return false;
        }
    }

    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (!message?.action) {
            return false;
        }

        if (!isTrustedSender(sender)) {
            sendResponse({ success: false, error: "Untrusted sender" });
            return false;
        }

        if (message.action === "openAppleMaps" && message.url) {
            if (!isValidAppleMapsUrl(message.url)) {
                sendResponse({ success: false, error: "Invalid Apple Maps URL" });
                return false;
            }

            browser.runtime
                .sendNativeMessage("application.id", {
                    action: "openAppleMaps",
                    url: message.url
                })
                .then(function(response) {
                    log("Native Apple Maps launch succeeded");
                    sendResponse({ success: true, nativeResponse: response });
                })
                .catch(function(error) {
                    sendResponse({ success: false, error: error.message });
                });

            return true;
        }

        if (message.action === "conversionComplete") {
            sendResponse({ success: true });
            return false;
        }

        return false;
    });

    void globalThis.NavioStats.resetSessionStatsIfNeeded().catch(function(error) {
        log("Session reset fallback failed", error);
    });
})();
