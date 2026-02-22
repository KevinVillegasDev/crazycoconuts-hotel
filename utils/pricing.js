// Room pricing configuration (base prices in COP - Colombian Pesos)
const ROOM_RATES = {
    'family-room-4': 420000,
    'large-family-room-7': 735000
};

const TAX_RATE = 0.16; // 16% tax rate for Colombia

const exchangeRateService = require('./exchangeRateService');

// Currency symbols
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'COP': 'COP',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'MXN': 'MX$',
    'BRL': 'R$',
    'ARS': 'AR$'
};

/**
 * Convert currency from COP to target currency using live rates
 * @param {number} amount - Amount in COP
 * @param {string} targetCurrency - Target currency code
 * @returns {number} Converted amount
 */
function convertCurrency(amount, targetCurrency = 'COP') {
    if (targetCurrency === 'COP') return amount;

    const { rates } = exchangeRateService.getRates();
    if (!rates[targetCurrency]) {
        console.warn(`Unknown currency: ${targetCurrency}, defaulting to COP`);
        return amount;
    }

    return amount * rates[targetCurrency];
}

/**
 * Format currency with appropriate symbol and decimals
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'COP') {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';

    if (currency === 'COP') {
        return `${Math.round(amount).toLocaleString('es-CO')} ${symbol}`;
    } else if (['USD', 'EUR', 'GBP', 'CAD'].includes(currency)) {
        return `${symbol}${amount.toFixed(2)}`;
    } else {
        return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
}

/**
 * Calculate pricing for a booking
 * @param {string} roomType - Type of room
 * @param {number} nights - Number of nights
 * @param {Date} checkIn - Check-in date (optional, for seasonal pricing)
 * @param {Date} checkOut - Check-out date (optional, for seasonal pricing)
 * @param {string} currency - Target currency (optional, defaults to COP)
 * @returns {Object} Pricing breakdown
 */
function calculatePricing(roomType, nights, checkIn = null, checkOut = null, currency = 'COP') {
    if (!ROOM_RATES[roomType]) {
        throw new Error(`Invalid room type: ${roomType}`);
    }

    if (nights < 1 || nights > 30) {
        throw new Error('Number of nights must be between 1 and 30');
    }

    const roomRateCOP = ROOM_RATES[roomType];
    let subtotalCOP = roomRateCOP * nights;

    // Apply seasonal pricing if dates are provided
    if (checkIn && checkOut) {
        subtotalCOP = calculateSeasonalPricing(roomType, checkIn, checkOut, roomRateCOP);
    }

    const taxesCOP = subtotalCOP * TAX_RATE;
    const totalCOP = subtotalCOP + taxesCOP;

    // Convert to target currency
    const roomRate = convertCurrency(roomRateCOP, currency);
    const subtotal = convertCurrency(subtotalCOP, currency);
    const taxes = convertCurrency(taxesCOP, currency);
    const total = convertCurrency(totalCOP, currency);

    return {
        roomRate: Math.round(roomRate * 100) / 100,
        nights,
        subtotal: Math.round(subtotal * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        total: Math.round(total * 100) / 100,
        taxRate: TAX_RATE,
        currency,
        // Include COP amounts as the source of truth
        copAmounts: {
            roomRate: roomRateCOP,
            subtotal: Math.round(subtotalCOP),
            taxes: Math.round(taxesCOP),
            total: Math.round(totalCOP)
        }
    };
}

/**
 * Calculate pricing with seasonal adjustments
 * @param {string} roomType - Type of room
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @param {number} baseRate - Base room rate in COP
 * @returns {number} Total subtotal with seasonal pricing in COP
 */
function calculateSeasonalPricing(roomType, checkIn, checkOut, baseRate) {
    const seasonalRates = getSeasonalRates();
    let totalPrice = 0;

    const current = new Date(checkIn);
    const end = new Date(checkOut);

    while (current < end) {
        let dailyRate = baseRate;

        for (const season of seasonalRates) {
            if (current >= season.startDate && current <= season.endDate) {
                dailyRate = baseRate * season.multiplier;
                break;
            }
        }

        totalPrice += dailyRate;
        current.setDate(current.getDate() + 1);
    }

    return totalPrice;
}

/**
 * Get seasonal pricing rates
 * @returns {Array} Array of seasonal pricing periods
 */
function getSeasonalRates() {
    const currentYear = new Date().getFullYear();

    return [
        {
            name: 'Holiday Season',
            startDate: new Date(currentYear, 11, 15),
            endDate: new Date(currentYear + 1, 0, 15),
            multiplier: 1.5
        },
        {
            name: 'Easter Week',
            startDate: getEasterDate(currentYear, -7),
            endDate: getEasterDate(currentYear, 7),
            multiplier: 1.3
        },
        {
            name: 'Summer Peak',
            startDate: new Date(currentYear, 5, 15),
            endDate: new Date(currentYear, 7, 15),
            multiplier: 1.2
        }
    ];
}

/**
 * Calculate Easter date for a given year
 */
function getEasterDate(year, offset = 0) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;

    const easter = new Date(year, n - 1, p + 1);
    easter.setDate(easter.getDate() + offset);

    return easter;
}

/**
 * Get room rate for a specific room type (in COP)
 */
function getRoomRate(roomType) {
    return ROOM_RATES[roomType] || 0;
}

/**
 * Get all room rates (in COP)
 */
function getAllRoomRates() {
    return { ...ROOM_RATES };
}

module.exports = {
    calculatePricing,
    calculateSeasonalPricing,
    getSeasonalRates,
    getRoomRate,
    getAllRoomRates,
    convertCurrency,
    formatCurrency,
    TAX_RATE,
    CURRENCY_SYMBOLS
};
