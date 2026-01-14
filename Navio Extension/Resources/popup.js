/**
 * Navio Popup Script
 * Enhanced with dynamic status, settings, and toast notifications
 */

// Storage keys
const STORAGE_KEYS = {
    TOTAL_CONVERSIONS: 'navio_total_conversions',
    SESSION_CONVERSIONS: 'navio_session_conversions',
    AUTO_REDIRECT: 'navio_auto_redirect'
};

// Initialize popup
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadStats();
    await loadSettings();
    setupEventListeners();
}

/**
 * Load and display conversion statistics
 */
async function loadStats() {
    try {
        const result = await browser.storage.local.get([
            STORAGE_KEYS.TOTAL_CONVERSIONS,
            STORAGE_KEYS.SESSION_CONVERSIONS
        ]);

        const totalCount = result[STORAGE_KEYS.TOTAL_CONVERSIONS] || 0;
        const sessionCount = result[STORAGE_KEYS.SESSION_CONVERSIONS] || 0;

        animateCounter('conversion-count', totalCount);
        animateCounter('session-count', sessionCount);
    } catch (error) {
        console.log('Stats not available:', error);
        // Fallback for when storage is not accessible
        document.getElementById('conversion-count').textContent = '0';
        document.getElementById('session-count').textContent = '0';
    }
}

/**
 * Animate counter from 0 to target value
 */
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Skip animation for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = targetValue;
        return;
    }

    const duration = 500;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(targetValue * easeOut);

        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = targetValue;
        }
    }, stepDuration);
}

/**
 * Load user settings
 */
async function loadSettings() {
    try {
        const result = await browser.storage.local.get(STORAGE_KEYS.AUTO_REDIRECT);
        const autoRedirect = result[STORAGE_KEYS.AUTO_REDIRECT] !== false; // Default true

        const toggle = document.getElementById('auto-redirect');
        if (toggle) {
            toggle.checked = autoRedirect;
        }
    } catch (error) {
        console.log('Settings not available:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Auto-redirect toggle
    const autoRedirectToggle = document.getElementById('auto-redirect');
    if (autoRedirectToggle) {
        autoRedirectToggle.addEventListener('change', async (e) => {
            try {
                await browser.storage.local.set({
                    [STORAGE_KEYS.AUTO_REDIRECT]: e.target.checked
                });
                showToast(e.target.checked ? 'Auto-redirect enabled' : 'Auto-redirect disabled', 'success');
            } catch (error) {
                console.log('Could not save setting:', error);
            }
        });
    }

    // Help button
    const helpButton = document.getElementById('help-btn');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            // Open the main app for help
            browser.runtime.sendMessage({ action: 'openHelp' }).catch(() => {
                showToast('Open the Navio app for help', 'info');
            });
        });
    }

    // Listen for conversion updates from content script
    browser.runtime.onMessage.addListener((message) => {
        if (message.action === 'conversionComplete') {
            updateStats();
            showToast('Link converted!', 'success');
        }
    });
}

/**
 * Update stats display
 */
async function updateStats() {
    try {
        const result = await browser.storage.local.get([
            STORAGE_KEYS.TOTAL_CONVERSIONS,
            STORAGE_KEYS.SESSION_CONVERSIONS
        ]);

        const totalCount = result[STORAGE_KEYS.TOTAL_CONVERSIONS] || 0;
        const sessionCount = result[STORAGE_KEYS.SESSION_CONVERSIONS] || 0;

        document.getElementById('conversion-count').textContent = totalCount;
        document.getElementById('session-count').textContent = sessionCount;
    } catch (error) {
        console.log('Could not update stats:', error);
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Remove existing toasts
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${type === 'success' ? '\u2713' : '\u2139'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after delay
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    const container = document.querySelector('.container');
    if (container) {
        container.classList.toggle('loading', isLoading);
    }
}
