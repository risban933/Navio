/**
 * Shared Navio stats helpers.
 */

(function(root, factory) {
    const dependencies = {
        settings:
            root.NavioSettings ||
            (typeof require === "function" ? require("./settings.js") : null)
    };
    const api = factory(dependencies);

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }

    root.NavioStats = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(dependencies) {
    "use strict";

    const settings = dependencies.settings;
    const STORAGE_KEYS = settings.STORAGE_KEYS;

    function resolveBrowserApi(browserApi) {
        return browserApi || (typeof browser !== "undefined" ? browser : null);
    }

    function getSessionStorageArea(browserApi) {
        const api = resolveBrowserApi(browserApi);
        if (!api?.storage?.session?.get || !api?.storage?.session?.set) {
            return null;
        }

        return api.storage.session;
    }

    function getLocalStorageArea(browserApi) {
        const api = resolveBrowserApi(browserApi);
        return api?.storage?.local || null;
    }

    async function getStats(browserApi) {
        const localArea = getLocalStorageArea(browserApi);
        const sessionArea = getSessionStorageArea(browserApi) || localArea;

        if (!localArea || !sessionArea) {
            return {
                totalConversions: 0,
                sessionConversions: 0,
                usingSessionStorage: Boolean(getSessionStorageArea(browserApi))
            };
        }

        const [localValues, sessionValues] = await Promise.all([
            localArea.get(STORAGE_KEYS.TOTAL_CONVERSIONS),
            sessionArea.get(STORAGE_KEYS.SESSION_CONVERSIONS)
        ]);

        return {
            totalConversions: localValues[STORAGE_KEYS.TOTAL_CONVERSIONS] || 0,
            sessionConversions: sessionValues[STORAGE_KEYS.SESSION_CONVERSIONS] || 0,
            usingSessionStorage: Boolean(getSessionStorageArea(browserApi))
        };
    }

    async function incrementStats(browserApi) {
        const localArea = getLocalStorageArea(browserApi);
        const sessionArea = getSessionStorageArea(browserApi) || localArea;

        if (!localArea || !sessionArea) {
            return {
                totalConversions: 0,
                sessionConversions: 0,
                usingSessionStorage: false
            };
        }

        const currentStats = await getStats(browserApi);
        const nextStats = {
            totalConversions: currentStats.totalConversions + 1,
            sessionConversions: currentStats.sessionConversions + 1,
            usingSessionStorage: currentStats.usingSessionStorage
        };

        await Promise.all([
            localArea.set({
                [STORAGE_KEYS.TOTAL_CONVERSIONS]: nextStats.totalConversions
            }),
            sessionArea.set({
                [STORAGE_KEYS.SESSION_CONVERSIONS]: nextStats.sessionConversions
            })
        ]);

        return nextStats;
    }

    async function resetSessionStatsIfNeeded(browserApi) {
        const sessionArea = getSessionStorageArea(browserApi);
        if (sessionArea) {
            return false;
        }

        const localArea = getLocalStorageArea(browserApi);
        if (!localArea) {
            return false;
        }

        await localArea.set({
            [STORAGE_KEYS.SESSION_CONVERSIONS]: 0,
            [STORAGE_KEYS.SESSION_RESET_MARKER]: Date.now()
        });

        return true;
    }

    return {
        getStats: getStats,
        incrementStats: incrementStats,
        resetSessionStatsIfNeeded: resetSessionStatsIfNeeded
    };
});
