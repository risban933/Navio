/**
 * Navio content script.
 * Rewrites supported Google Maps links to Apple Maps and handles fallback redirects.
 */

(function() {
    "use strict";

    const DEBUG = false;
    const FALLBACK_DELAY_MS = 500;
    const PROCESSED_SELECTOR = "a[data-navio-processed='true']";

    const state = {
        autoRedirectEnabled: true,
        clickHandlers: new WeakMap(),
        fallbackTimer: null,
        fullScanRequested: false,
        historyPatched: false,
        initialized: false,
        lastUrl: "",
        observer: null,
        pendingRoots: new Set(),
        reprocessScheduled: false
    };

    function log() {
        if (DEBUG) {
            console.log("[Navio]", ...arguments);
        }
    }

    function isSupportedGoogleHost(host) {
        return Boolean(globalThis.NavioAllowedHosts?.isAllowedGoogleHost(host));
    }

    function isGoogleSearchPage() {
        return isSupportedGoogleHost(location.hostname) && location.pathname === "/search";
    }

    function isGoogleMapsPage() {
        return isSupportedGoogleHost(location.hostname) && location.pathname.startsWith("/maps");
    }

    function shouldInspectHref(href) {
        return (
            typeof href === "string" &&
            href.length > 0 &&
            (href.includes("/maps") ||
                href.includes("maps.google.") ||
                (href.includes("/url?") && href.includes("maps")) ||
                (href.includes("google.") && href.includes("maps")))
        );
    }

    function rememberOriginalLinkState(anchor) {
        if (!anchor.dataset.navioOriginalHref) {
            anchor.dataset.navioOriginalHref = anchor.getAttribute("href") || anchor.href;
        }

        if (!anchor.dataset.navioOriginalTarget) {
            anchor.dataset.navioOriginalTarget =
                anchor.getAttribute("target") || "__NAVIO_EMPTY__";
        }
    }

    function restoreAnchor(anchor) {
        const existingHandler = state.clickHandlers.get(anchor);
        if (existingHandler) {
            anchor.removeEventListener("click", existingHandler, true);
            state.clickHandlers.delete(anchor);
        }

        if (anchor.dataset.navioOriginalHref) {
            anchor.setAttribute("href", anchor.dataset.navioOriginalHref);
        }

        if (anchor.dataset.navioOriginalTarget === "__NAVIO_EMPTY__") {
            anchor.removeAttribute("target");
        } else if (anchor.dataset.navioOriginalTarget) {
            anchor.setAttribute("target", anchor.dataset.navioOriginalTarget);
        }

        delete anchor.dataset.navioAppleHref;
        delete anchor.dataset.navioOriginalHref;
        delete anchor.dataset.navioOriginalTarget;
        delete anchor.dataset.navioProcessed;
    }

    function restoreProcessedLinks(root) {
        const scope = root || document;
        const anchors = scope.querySelectorAll
            ? scope.querySelectorAll(PROCESSED_SELECTOR)
            : [];

        anchors.forEach(restoreAnchor);
    }

    async function notifyConversionComplete() {
        try {
            await globalThis.NavioStats.incrementStats();
        } catch (error) {
            log("Failed to update stats", error);
        }

        try {
            await browser.runtime.sendMessage({ action: "conversionComplete" });
        } catch (error) {
            // Popup may not be open.
        }
    }

    async function openAppleMapsViaBackground(url) {
        try {
            const response = await browser.runtime.sendMessage({
                action: "openAppleMaps",
                url: url
            });

            if (response?.success) {
                await notifyConversionComplete();
                return;
            }
        } catch (error) {
            log("Falling back to direct navigation", error);
        }

        await notifyConversionComplete();
        window.location.href = url;
    }

    function processAnchor(anchor) {
        if (!state.autoRedirectEnabled) {
            restoreAnchor(anchor);
            return;
        }

        const href = anchor.href;
        if (!shouldInspectHref(href)) {
            if (anchor.dataset.navioProcessed === "true") {
                restoreAnchor(anchor);
            }
            return;
        }

        const appleMapsUrl = globalThis.NavioUrlConversion.googleToAppleMapsURL(href);
        if (!appleMapsUrl) {
            if (anchor.dataset.navioProcessed === "true") {
                restoreAnchor(anchor);
            }
            return;
        }

        rememberOriginalLinkState(anchor);

        const existingHandler = state.clickHandlers.get(anchor);
        if (existingHandler) {
            anchor.removeEventListener("click", existingHandler, true);
        }

        const clickHandler = function(event) {
            if (!state.autoRedirectEnabled) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            void openAppleMapsViaBackground(appleMapsUrl);
        };

        anchor.setAttribute("href", appleMapsUrl);
        anchor.setAttribute("target", "_self");
        anchor.dataset.navioAppleHref = appleMapsUrl;
        anchor.dataset.navioProcessed = "true";
        anchor.addEventListener("click", clickHandler, true);
        state.clickHandlers.set(anchor, clickHandler);
    }

    function collectAnchors(root) {
        const anchors = [];

        if (!root) {
            return anchors;
        }

        if (root === document) {
            return Array.from(document.querySelectorAll("a[href]"));
        }

        if (root.nodeType !== Node.ELEMENT_NODE) {
            return anchors;
        }

        if (root.matches?.("a[href]")) {
            anchors.push(root);
        }

        anchors.push(...root.querySelectorAll("a[href]"));
        return anchors;
    }

    function processRoot(root) {
        collectAnchors(root).forEach(processAnchor);
    }

    function clearFallbackTimer() {
        if (state.fallbackTimer !== null) {
            clearTimeout(state.fallbackTimer);
            state.fallbackTimer = null;
        }
    }

    function scheduleFallbackRedirect() {
        clearFallbackTimer();

        if (!state.autoRedirectEnabled || !isGoogleMapsPage()) {
            return;
        }

        state.fallbackTimer = window.setTimeout(function() {
            state.fallbackTimer = null;

            if (!state.autoRedirectEnabled || !isGoogleMapsPage()) {
                return;
            }

            const appleMapsUrl = globalThis.NavioUrlConversion.googleToAppleMapsURL(
                window.location.href
            );

            if (appleMapsUrl) {
                void openAppleMapsViaBackground(appleMapsUrl);
            }
        }, FALLBACK_DELAY_MS);
    }

    function flushReprocessQueue() {
        state.reprocessScheduled = false;

        if (!state.autoRedirectEnabled) {
            restoreProcessedLinks(document);
            clearFallbackTimer();
            state.pendingRoots.clear();
            state.fullScanRequested = false;
            return;
        }

        if (state.fullScanRequested || state.pendingRoots.size === 0) {
            processRoot(document);
        } else {
            Array.from(state.pendingRoots).forEach(processRoot);
        }

        state.pendingRoots.clear();
        state.fullScanRequested = false;
        scheduleFallbackRedirect();
    }

    function scheduleProcessing(root) {
        if (root) {
            state.pendingRoots.add(root);
        } else {
            state.fullScanRequested = true;
        }

        if (state.reprocessScheduled) {
            return;
        }

        state.reprocessScheduled = true;
        window.requestAnimationFrame(flushReprocessQueue);
    }

    function observeDOMChanges() {
        if (state.observer) {
            return;
        }

        const observerTarget = document.body || document.documentElement;
        if (!observerTarget) {
            return;
        }

        state.observer = new MutationObserver(function(mutations) {
            if (!state.autoRedirectEnabled) {
                return;
            }

            for (const mutation of mutations) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scheduleProcessing(node);
                    }
                });
            }
        });

        state.observer.observe(observerTarget, {
            childList: true,
            subtree: true
        });
    }

    function handleLocationChange() {
        if (state.lastUrl === window.location.href) {
            return;
        }

        state.lastUrl = window.location.href;
        scheduleProcessing(null);
    }

    function patchHistoryMethods() {
        if (state.historyPatched) {
            return;
        }

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            const result = originalPushState.apply(this, arguments);
            queueMicrotask(handleLocationChange);
            return result;
        };

        history.replaceState = function() {
            const result = originalReplaceState.apply(this, arguments);
            queueMicrotask(handleLocationChange);
            return result;
        };

        window.addEventListener("popstate", handleLocationChange);
        state.historyPatched = true;
    }

    function onStorageChanged(changes, areaName) {
        if (areaName !== "local" || !changes[globalThis.NavioSettings.STORAGE_KEYS.AUTO_REDIRECT]) {
            return;
        }

        state.autoRedirectEnabled =
            changes[globalThis.NavioSettings.STORAGE_KEYS.AUTO_REDIRECT].newValue !== false;
        scheduleProcessing(null);
    }

    async function init() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;
        state.lastUrl = window.location.href;
        state.autoRedirectEnabled = await globalThis.NavioSettings.getAutoRedirectEnabled();

        observeDOMChanges();
        patchHistoryMethods();
        browser.storage.onChanged.addListener(onStorageChanged);

        if (isGoogleSearchPage() || isGoogleMapsPage() || isSupportedGoogleHost(location.hostname)) {
            scheduleProcessing(null);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            function() {
                void init();
            },
            { once: true }
        );
    } else {
        void init();
    }
})();
