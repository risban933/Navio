import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const settings = require("../../Navio Extension/Resources/lib/settings.js");
const stats = require("../../Navio Extension/Resources/lib/stats.js");

function createStorageArea(initialValues = {}) {
    const values = { ...initialValues };

    return {
        async get(keys) {
            if (Array.isArray(keys)) {
                return keys.reduce((accumulator, key) => {
                    accumulator[key] = values[key];
                    return accumulator;
                }, {});
            }

            if (typeof keys === "string") {
                return { [keys]: values[keys] };
            }

            return { ...values };
        },
        async set(nextValues) {
            Object.assign(values, nextValues);
        },
        snapshot() {
            return { ...values };
        }
    };
}

test("settings default to enabled and can be disabled", async () => {
    const local = createStorageArea();
    const browserApi = {
        storage: {
            local
        }
    };

    assert.equal(await settings.getAutoRedirectEnabled(browserApi), true);
    await settings.setAutoRedirectEnabled(false, browserApi);
    assert.equal(await settings.getAutoRedirectEnabled(browserApi), false);
});

test("stats use session storage when available", async () => {
    const local = createStorageArea();
    const session = createStorageArea();
    const browserApi = {
        storage: {
            local,
            session
        }
    };

    const first = await stats.incrementStats(browserApi);
    assert.deepEqual(first, {
        totalConversions: 1,
        sessionConversions: 1,
        usingSessionStorage: true
    });

    const second = await stats.incrementStats(browserApi);
    assert.deepEqual(second, {
        totalConversions: 2,
        sessionConversions: 2,
        usingSessionStorage: true
    });
});

test("session reset fallback clears local session stats when session storage is unavailable", async () => {
    const local = createStorageArea({
        [settings.STORAGE_KEYS.TOTAL_CONVERSIONS]: 5,
        [settings.STORAGE_KEYS.SESSION_CONVERSIONS]: 3
    });
    const browserApi = {
        storage: {
            local
        }
    };

    const didReset = await stats.resetSessionStatsIfNeeded(browserApi);
    const currentStats = await stats.getStats(browserApi);

    assert.equal(didReset, true);
    assert.equal(currentStats.totalConversions, 5);
    assert.equal(currentStats.sessionConversions, 0);
    assert.equal(currentStats.usingSessionStorage, false);
});
