// Room pricing configuration (base prices in USD)
const ROOM_RATES = {
    'ocean-view': 180,
    'beachfront-suite': 350,
    'presidential-villa': 650
};

const TAX_RATE = 0.16; // 16% tax rate for Colombia

// Currency conversion rates (update these regularly or use an API)
const EXCHANGE_RATES = {
    'USD': 1,
    'COP': 4200, // Colombian Peso
    'EUR': 0.85,
    'GBP': 0.75,
    'CAD': 1.25,
    'MXN': 18.5,
    'BRL': 5.2,
    'ARS': 350
};

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
 * Convert currency from USD to target currency
 * @param {number} amount - Amount in USD
 * @param {string} targetCurrency - Target currency code
 * @returns {number} Converted amount
 */
function convertCurrency(amount, targetCurrency = 'USD') {
    if (!EXCHANGE_RATES[targetCurrency]) {
        console.warn(`Unknown currency: ${targetCurrency}, defaulting to USD`);
        return amount;
    }
    
    return amount * EXCHANGE_RATES[targetCurrency];
}

/**
 * Format currency with appropriate symbol and decimals
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    
    if (currency === 'COP') {
        // Colombian Peso - no decimals, use thousands separator
        return `${Math.round(amount).toLocaleString('es-CO')} ${symbol}`;
    } else if (['USD', 'EUR', 'GBP', 'CAD'].includes(currency)) {
        // Standard currencies with 2 decimals
        return `${symbol}${amount.toFixed(2)}`;
    } else {
        // Other currencies - round appropriately
        return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
}

/**
 * Calculate pricing for a booking
 * @param {string} roomType - Type of room
 * @param {number} nights - Number of nights
 * @param {Date} checkIn - Check-in date (optional, for seasonal pricing)
 * @param {Date} checkOut - Check-out date (optional, for seasonal pricing)
 * @param {string} currency - Target currency (optional, defaults to USD)
 * @returns {Object} Pricing breakdown
 */
function calculatePricing(roomType, nights, checkIn = null, checkOut = null, currency = 'USD') {
    if (!ROOM_RATES[roomType]) {
        throw new Error(`Invalid room type: ${roomType}`);
    }
    
    if (nights < 1 || nights > 30) {
        throw new Error('Number of nights must be between 1 and 30');
    }
    
    const roomRateUSD = ROOM_RATES[roomType];
    let subtotalUSD = roomRateUSD * nights;
    
    // Apply seasonal pricing if dates are provided
    if (checkIn && checkOut) {
        subtotalUSD = calculateSeasonalPricing(roomType, checkIn, checkOut, roomRateUSD);
    }
    
    const taxesUSD = subtotalUSD * TAX_RATE;
    const totalUSD = subtotalUSD + taxesUSD;
    
    // Convert to target currency
    const roomRate = convertCurrency(roomRateUSD, currency);
    const subtotal = convertCurrency(subtotalUSD, currency);
    const taxes = convertCurrency(taxesUSD, currency);
    const total = convertCurrency(totalUSD, currency);
    
    return {
        roomRate: Math.round(roomRate * 100) / 100,
        nights,
        subtotal: Math.round(subtotal * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        total: Math.round(total * 100) / 100,
        taxRate: TAX_RATE,
        currency,
        // Also include USD amounts for backend storage
        usdAmounts: {
            roomRate: roomRateUSD,
            subtotal: Math.round(subtotalUSD * 100) / 100,
            taxes: Math.round(taxesUSD * 100) / 100,
            total: Math.round(totalUSD * 100) / 100
        }
    };
}

/**
 * Calculate pricing with seasonal adjustments
 * @param {string} roomType - Type of room
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @param {number} baseRate - Base room rate
 * @returns {number} Total subtotal with seasonal pricing
 */
function calculateSeasonalPricing(roomType, checkIn, checkOut, baseRate) {
    const seasonalRates = getSeasonalRates();
    let totalPrice = 0;
    
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    
    while (current < end) {
        let dailyRate = baseRate;
        
        // Check if current date falls in any seasonal period
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
            startDate: new Date(currentYear, 11, 15), // December 15
            endDate: new Date(currentYear + 1, 0, 15), // January 15
            multiplier: 1.5
        },
        {
            name: 'Easter Week',
            startDate: getEasterDate(currentYear, -7), // Week before Easter
            endDate: getEasterDate(currentYear, 7), // Week after Easter
            multiplier: 1.3
        },
        {
            name: 'Summer Peak',
            startDate: new Date(currentYear, 5, 15), // June 15
            endDate: new Date(currentYear, 7, 15), // August 15
            multiplier: 1.2
        }
    ];
}

/**
 * Calculate Easter date for a given year
 * @param {number} year - Year
 * @param {number} offset - Days to offset from Easter
 * @returns {Date} Easter date with offset
 */
function getEasterDate(year, offset = 0) {
    // Simplified Easter calculation (Gregorian calendar)
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
 * Get room rate for a specific room type
 * @param {string} roomType - Type of room
 * @returns {number} Room rate per night
 */
function getRoomRate(roomType) {
    return ROOM_RATES[roomType] || 0;
}

/**
 * Get all room rates
 * @returns {Object} All room rates
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
    EXCHANGE_RATES,
    CURRENCY_SYMBOLS
};