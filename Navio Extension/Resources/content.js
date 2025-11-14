/**
 * Navio Content Script
 * Automatically redirects Google Maps links to Apple Maps
 */

(function() {
    'use strict';

    // ====== Configuration ======
    const DEBUG = false;
    const FALLBACK_DELAY_MS = 500; // Delay for fallback redirect on maps.google.com

    // ====== Utility Functions ======

    function log(...args) {
        if (DEBUG) {
            console.log('[Navio]', ...args);
        }
    }

    // ====== URL Conversion Logic ======

    /**
     * Converts a Google Maps URL to an Apple Maps URL
     * @param {string} googleUrl - The Google Maps URL to convert
     * @returns {string|null} - The equivalent Apple Maps URL, or null if conversion fails
     */
    function googleToAppleMapsURL(googleUrl) {
        try {
            const url = new URL(googleUrl);

            // Extract query parameters
            let qParam = url.searchParams.get("q") || url.searchParams.get("query") || "";
            let destination = url.searchParams.get("destination") || url.searchParams.get("daddr") || "";
            let origin = url.searchParams.get("origin") || url.searchParams.get("saddr") || "";

            const path = url.pathname;

            // Check for /maps/place/ pattern
            if (!qParam && /\/maps\/place\//.test(path)) {
                const placePart = path.split("/maps/place/")[1];
                if (placePart) {
                    // Extract name before coordinates or next slash
                    const namePart = placePart.split('/')[0].split('@')[0];
                    qParam = decodeURIComponent(namePart.replace(/\+/g, " "));
                }
            }

            // Check for /maps/dir/ pattern (directions)
            if (!destination && /\/maps\/dir\//.test(path)) {
                const dirPart = path.split("/maps/dir/")[1];
                if (dirPart) {
                    const parts = dirPart.split("/");
                    if (parts.length >= 2) {
                        origin = decodeURIComponent(parts[0].replace(/\+/g, " "));
                        destination = decodeURIComponent(parts[1].replace(/\+/g, " "));
                    } else if (parts.length === 1) {
                        // Only destination provided
                        destination = decodeURIComponent(parts[0].replace(/\+/g, " "));
                    }
                }
            }

            // Check for /maps/search/ pattern
            if (!qParam && /\/maps\/search\//.test(path)) {
                const searchPart = path.split("/maps/search/")[1];
                if (searchPart) {
                    qParam = decodeURIComponent(searchPart.split('/')[0].replace(/\+/g, " "));
                }
            }

            // Build Apple Maps URL
            if (destination || origin) {
                // It's a directions URL
                let appleUrl = "https://maps.apple.com/?";
                if (origin && origin !== "Current+Location" && origin !== "My+Location") {
                    appleUrl += "saddr=" + encodeURIComponent(origin) + "&";
                }
                if (destination) {
                    appleUrl += "daddr=" + encodeURIComponent(destination);
                } else if (qParam) {
                    // Use qParam as destination if no explicit destination
                    appleUrl += "daddr=" + encodeURIComponent(qParam);
                }
                return appleUrl;
            } else {
                // Not a directions link, just a place search

                // Extract coordinates if present (format: @lat,lng,zoom)
                const coordsMatch = url.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (coordsMatch) {
                    const lat = coordsMatch[1];
                    const lon = coordsMatch[2];
                    if (qParam) {
                        // Use coords with label
                        return `https://maps.apple.com/?ll=${lat},${lon}&q=${encodeURIComponent(qParam)}`;
                    } else {
                        // Just coordinates
                        return `https://maps.apple.com/?ll=${lat},${lon}`;
                    }
                }

                // Default: use q parameter for search
                if (qParam) {
                    return "https://maps.apple.com/?q=" + encodeURIComponent(qParam);
                }

                // Last resort: try to extract anything useful from the URL
                // This handles some edge cases where the query might be embedded differently
                if (url.searchParams.has('query')) {
                    return "https://maps.apple.com/?q=" + encodeURIComponent(url.searchParams.get('query'));
                }

                // If we couldn't parse anything useful, return null
                log("Could not parse URL:", googleUrl);
                return null;
            }
        } catch (e) {
            log("Error parsing URL:", googleUrl, e);
            return null;
        }
    }

    // ====== Link Detection and Modification ======

    /**
     * Checks if we're on a Google Search results page
     */
    function isGoogleSearchPage() {
        return /\.google\./.test(location.host) && location.pathname === '/search';
    }

    /**
     * Checks if we're on a Google Maps page
     */
    function isGoogleMapsPage() {
        return /\.google\./.test(location.host) && location.pathname.startsWith('/maps');
    }

    /**
     * Processes Google Maps links on the page
     */
    function processMapLinks() {
        // Select all anchors that link to Google Maps
        const mapLinkSelector = "a[href*='//maps.google.'], a[href*='/maps/place'], a[href*='/maps/dir'], a[href*='/maps/search'], a[href*='/maps?']";
        const mapLinks = document.querySelectorAll(mapLinkSelector);

        log(`Found ${mapLinks.length} map links to process`);

        let processedCount = 0;

        mapLinks.forEach(anchor => {
            // Skip if already processed
            if (anchor.dataset.navioProcessed) {
                return;
            }

            const originalHref = anchor.href;
            const appleMapsUrl = googleToAppleMapsURL(originalHref);

            if (appleMapsUrl) {
                log(`Converting: ${originalHref} -> ${appleMapsUrl}`);

                // Method 1: Rewrite the href
                anchor.href = appleMapsUrl;
                anchor.target = "_self";

                // Method 2: Add click interceptor as backup
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    log("Click intercepted, opening Apple Maps:", appleMapsUrl);

                    // Try native messaging first for better UX
                    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendNativeMessage) {
                        browser.runtime.sendNativeMessage({
                            action: "openAppleMaps",
                            url: appleMapsUrl
                        }).catch(() => {
                            // Fallback: direct navigation
                            window.location.href = appleMapsUrl;
                        });
                    } else {
                        // Direct navigation
                        window.location.href = appleMapsUrl;
                    }
                }, true);

                // Mark as processed
                anchor.dataset.navioProcessed = "true";
                processedCount++;
            }
        });

        log(`Processed ${processedCount} map links`);
    }

    /**
     * Handles fallback redirect when on Google Maps page
     */
    function handleMapsPageFallback() {
        log("On Google Maps page, attempting fallback redirect...");

        // Wait a moment for the page to fully load and URL to stabilize
        setTimeout(() => {
            const currentUrl = window.location.href;
            const appleMapsUrl = googleToAppleMapsURL(currentUrl);

            if (appleMapsUrl) {
                log("Fallback redirect to:", appleMapsUrl);

                // Try native messaging for cleaner UX
                if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendNativeMessage) {
                    browser.runtime.sendNativeMessage({
                        action: "openAppleMaps",
                        url: appleMapsUrl
                    }).catch(() => {
                        window.location.href = appleMapsUrl;
                    });
                } else {
                    window.location.href = appleMapsUrl;
                }
            } else {
                log("Could not convert Maps page URL");
            }
        }, FALLBACK_DELAY_MS);
    }

    /**
     * Observes DOM changes to catch dynamically added links
     */
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;

            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                    break;
                }
            }

            if (shouldProcess) {
                processMapLinks();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log("DOM observer started");
    }

    // ====== Main Execution ======

    function init() {
        log("Navio content script loaded on:", location.href);

        if (isGoogleSearchPage()) {
            log("Detected Google Search page");

            // Process existing links
            processMapLinks();

            // Watch for dynamically added links (Google often loads results progressively)
            observeDOMChanges();

        } else if (isGoogleMapsPage()) {
            log("Detected Google Maps page - executing fallback");

            // This is the fallback mechanism: we're on a Google Maps page
            // (probably because our primary interception failed or user navigated directly)
            handleMapsPageFallback();

        } else if (/\.google\./.test(location.host)) {
            log("On Google domain but not search/maps page - monitoring for links");

            // Still process any maps links that might appear
            processMapLinks();
            observeDOMChanges();
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
