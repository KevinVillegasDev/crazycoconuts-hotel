const axios = require('axios');

const API_URL = 'https://open.er-api.com/v6/latest/USD';
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

// Fallback rates: how much 1 USD buys of each currency
// Used when API is unavailable
const FALLBACK_USD_RATES = {
    USD: 1,
    COP: 4200,
    EUR: 0.85,
    GBP: 0.75,
    CAD: 1.25,
    MXN: 18.5,
    BRL: 5.2,
    ARS: 350
};

const SUPPORTED_CURRENCIES = Object.keys(FALLBACK_USD_RATES);

let cachedUsdRates = { ...FALLBACK_USD_RATES };
let cachedCopRates = null;
let lastUpdated = null;
let isUsingFallback = true;
let refreshTimer = null;

// Convert USD-based rates to COP-based rates
// e.g., if 1 USD = 4200 COP, then 1 COP = 1/4200 USD
function computeCopBasedRates(usdRates) {
    const copPerUsd = usdRates.COP;
    const copRates = {};
    for (const currency of SUPPORTED_CURRENCIES) {
        if (currency === 'COP') {
            copRates.COP = 1;
        } else {
            // How much of target currency does 1 COP buy?
            copRates[currency] = usdRates[currency] / copPerUsd;
        }
    }
    return copRates;
}

async function fetchRates() {
    try {
        const response = await axios.get(API_URL, { timeout: 10000 });
        const apiRates = response.data.rates;

        const newUsdRates = {};
        for (const currency of SUPPORTED_CURRENCIES) {
            if (apiRates[currency] !== undefined) {
                newUsdRates[currency] = apiRates[currency];
            } else {
                newUsdRates[currency] = FALLBACK_USD_RATES[currency];
            }
        }

        cachedUsdRates = newUsdRates;
        cachedCopRates = computeCopBasedRates(newUsdRates);
        lastUpdated = new Date();
        isUsingFallback = false;
        console.log(`💱 Exchange rates updated at ${lastUpdated.toISOString()} (1 USD = ${newUsdRates.COP} COP)`);
    } catch (error) {
        console.warn('⚠️ Failed to fetch exchange rates, using fallback:', error.message);
        isUsingFallback = true;
        if (!cachedCopRates) {
            cachedCopRates = computeCopBasedRates(FALLBACK_USD_RATES);
        }
    }
}

function startAutoRefresh() {
    fetchRates();
    refreshTimer = setInterval(fetchRates, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// Returns COP-based rates (how much of each currency 1 COP buys)
function getRates() {
    if (!cachedCopRates) {
        cachedCopRates = computeCopBasedRates(cachedUsdRates);
    }
    return {
        baseCurrency: 'COP',
        rates: { ...cachedCopRates },
        lastUpdated,
        isUsingFallback
    };
}

// Returns USD-based rates (for Stripe payment processing)
function getUsdRates() {
    return { ...cachedUsdRates };
}

module.exports = {
    startAutoRefresh,
    stopAutoRefresh,
    getRates,
    getUsdRates,
    fetchRates,
    SUPPORTED_CURRENCIES
};
