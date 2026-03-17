/**
 * Shared Navio settings helpers.
 */

(function(root, factory) {
    const api = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    root.NavioSettings = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    const STORAGE_KEYS = {
        TOTAL_CONVERSIONS: "navio_total_conversions",
        SESSION_CONVERSIONS: "navio_session_conversions",
        AUTO_REDIRECT: "navio_auto_redirect",
        SESSION_RESET_MARKER: "navio_session_reset_marker"
    };

    function resolveBrowserApi(browserApi) {
        return browserApi || (typeof browser !== "undefined" ? browser : null);
    }

    async function getAutoRedirectEnabled(browserApi) {
        const api = resolveBrowserApi(browserApi);
        if (!api?.storage?.local) {
            return true;
        }

        try {
            const result = await api.storage.local.get(STORAGE_KEYS.AUTO_REDIRECT);
            return result[STORAGE_KEYS.AUTO_REDIRECT] !== false;
        } catch (error) {
            return true;
        }
    }

    async function setAutoRedirectEnabled(enabled, browserApi) {
        const api = resolveBrowserApi(browserApi);
        if (!api?.storage?.local) {
            return enabled;
        }

        await api.storage.local.set({
            [STORAGE_KEYS.AUTO_REDIRECT]: Boolean(enabled)
        });

        return Boolean(enabled);
    }

    return {
        STORAGE_KEYS: STORAGE_KEYS,
        getAutoRedirectEnabled: getAutoRedirectEnabled,
        setAutoRedirectEnabled: setAutoRedirectEnabled
    };
});
