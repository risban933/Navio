const DEFAULT_SUPPORT_EMAIL = "support@navio-app.com";
const FEEDBACK_TIMEOUT_MS = 2200;

let supportEmail = DEFAULT_SUPPORT_EMAIL;
let feedbackTimer = null;

document.addEventListener("DOMContentLoaded", function() {
    void init();
});

async function init() {
    setLoading(true);

    try {
        await Promise.all([loadSupportEmail(), refreshStats(), refreshToggleState()]);
        setupEventListeners();
    } finally {
        setLoading(false);
    }
}

async function loadSupportEmail() {
    try {
        const response = await fetch(browser.runtime.getURL("SupportConfig.json"));
        if (!response.ok) {
            return;
        }

        const config = await response.json();
        if (typeof config.supportEmail === "string" && config.supportEmail.trim()) {
            supportEmail = config.supportEmail.trim();
        }
    } catch (error) {
        supportEmail = DEFAULT_SUPPORT_EMAIL;
    }
}

async function refreshStats() {
    try {
        const stats = await globalThis.NavioStats.getStats();
        updateCounter("conversion-count", stats.totalConversions);
        updateCounter("session-count", stats.sessionConversions);
    } catch (error) {
        updateCounter("conversion-count", 0);
        updateCounter("session-count", 0);
    }
}

function updateCounter(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    const formattedValue = formatNumber(value);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        element.textContent = formattedValue;
        return;
    }

    const currentValue = parseInt(element.dataset.value || "0", 10);
    const targetValue = Number.isFinite(value) ? value : 0;
    element.dataset.value = String(targetValue);

    if (currentValue === targetValue) {
        element.textContent = formattedValue;
        return;
    }

    const duration = 260;
    const stepCount = 16;
    const stepDuration = duration / stepCount;
    let currentStep = 0;

    if (element.dataset.intervalId) {
        window.clearInterval(Number(element.dataset.intervalId));
    }
    const intervalId = window.setInterval(function() {
        currentStep += 1;
        const progress = currentStep / stepCount;
        const nextValue = Math.round(currentValue + ((targetValue - currentValue) * progress));
        element.textContent = formatNumber(nextValue);

        if (currentStep >= stepCount) {
            window.clearInterval(intervalId);
            element.textContent = formattedValue;
            delete element.dataset.intervalId;
        }
    }, stepDuration);

    element.dataset.intervalId = String(intervalId);
}

function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
}

async function refreshToggleState() {
    try {
        const enabled = await globalThis.NavioSettings.getAutoRedirectEnabled();
        const toggle = document.getElementById("auto-redirect");
        if (toggle) {
            toggle.checked = enabled;
        }

        updateStatus(enabled);
    } catch (error) {
        updateStatus(true);
    }
}

function updateStatus(enabled) {
    const popup = document.querySelector(".popup");
    const statusLabel = document.getElementById("status-label");
    const title = document.getElementById("status-title");
    const description = document.getElementById("status-description");

    if (!popup || !statusLabel || !title || !description) {
        return;
    }

    popup.dataset.state = enabled ? "enabled" : "paused";
    statusLabel.textContent = enabled ? "Active" : "Paused";
    title.textContent = enabled ? "Navio is active" : "Navio is paused";
    description.textContent = enabled
        ? "Supported Google Maps links will open in Apple Maps."
        : "Supported Google Maps links will stay on Google until redirects are turned back on.";
}

function setupEventListeners() {
    const autoRedirectToggle = document.getElementById("auto-redirect");
    if (autoRedirectToggle) {
        autoRedirectToggle.addEventListener("change", async function(event) {
            const toggle = event.target;

            try {
                const enabled = await globalThis.NavioSettings.setAutoRedirectEnabled(toggle.checked);
                toggle.checked = enabled;
                updateStatus(enabled);
                setFeedback(enabled ? "Redirects are on." : "Redirects are paused.");
            } catch (error) {
                toggle.checked = !toggle.checked;
                setFeedback("Navio could not update redirect settings.");
            }
        });
    }

    const helpButton = document.getElementById("help-btn");
    if (helpButton) {
        helpButton.addEventListener("click", function() {
            openSupportEmail();
        });
    }

    browser.runtime.onMessage.addListener(function(message) {
        if (message.action === "conversionComplete") {
            void refreshStats();
        }
    });

    browser.storage.onChanged.addListener(function(changes) {
        if (
            changes[globalThis.NavioSettings.STORAGE_KEYS.TOTAL_CONVERSIONS] ||
            changes[globalThis.NavioSettings.STORAGE_KEYS.SESSION_CONVERSIONS]
        ) {
            void refreshStats();
        }

        if (changes[globalThis.NavioSettings.STORAGE_KEYS.AUTO_REDIRECT]) {
            void refreshToggleState();
        }
    });
}

function openSupportEmail() {
    const subject = encodeURIComponent("Navio Support");
    const body = encodeURIComponent(
        "Hi,\n\nI need help with Navio.\n\nDevice details:\n"
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
}

function setFeedback(message) {
    const feedback = document.getElementById("feedback");
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.classList.add("is-visible");

    if (feedbackTimer !== null) {
        window.clearTimeout(feedbackTimer);
    }

    feedbackTimer = window.setTimeout(function() {
        feedback.classList.remove("is-visible");
        feedback.textContent = "";
        feedbackTimer = null;
    }, FEEDBACK_TIMEOUT_MS);
}

function setLoading(isLoading) {
    const popup = document.querySelector(".popup");
    const toggle = document.getElementById("auto-redirect");
    const helpButton = document.getElementById("help-btn");
    const statusLabel = document.getElementById("status-label");
    const title = document.getElementById("status-title");
    const description = document.getElementById("status-description");

    if (!popup || !statusLabel || !title || !description) {
        return;
    }

    if (toggle) {
        toggle.disabled = isLoading;
    }

    if (helpButton) {
        helpButton.disabled = isLoading;
    }

    if (isLoading) {
        popup.dataset.state = "loading";
        statusLabel.textContent = "Loading";
        title.textContent = "Loading Navio";
        description.textContent = "Checking your current redirect settings.";
    }
}
