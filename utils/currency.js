// Currency conversion utilities
class CurrencyManager {
    constructor() {
        // Fallback exchange rates: COP-based (how much of each currency 1 COP buys)
        // These are used if the live rate API is unavailable
        this.exchangeRates = {
            'COP': 1,
            'USD': 1 / 4200,
            'EUR': 0.85 / 4200,
            'GBP': 0.75 / 4200,
            'CAD': 1.25 / 4200,
            'MXN': 18.5 / 4200,
            'BRL': 5.2 / 4200,
            'ARS': 350 / 4200
        };

        // Currency symbols
        this.currencySymbols = {
            'USD': '$',
            'COP': 'COP',
            'EUR': '€',
            'GBP': '£',
            'CAD': 'C$',
            'MXN': 'MX$',
            'BRL': 'R$',
            'ARS': 'AR$'
        };

        // Currency names
        this.currencyNames = {
            'USD': 'US Dollar',
            'COP': 'Colombian Peso',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'CAD': 'Canadian Dollar',
            'MXN': 'Mexican Peso',
            'BRL': 'Brazilian Real',
            'ARS': 'Argentine Peso'
        };

        // Base currency is COP (all prices stored in COP)
        this.currentCurrency = this.getSavedCurrency() || 'COP';
        this.baseCurrency = 'COP';
        this.isUsingFallback = true;
        this.ratesLastUpdated = null;
    }

    // Get saved currency from localStorage
    getSavedCurrency() {
        return localStorage.getItem('selectedCurrency');
    }

    // Save currency preference
    saveCurrency(currency) {
        localStorage.setItem('selectedCurrency', currency);
        this.currentCurrency = currency;
    }

    // Auto-detect currency based on user's location/locale
    async detectUserCurrency() {
        try {
            const locale = navigator.language || navigator.languages[0];
            const localeToCurrency = {
                'es-CO': 'COP',
                'en-US': 'USD',
                'es-MX': 'MXN',
                'pt-BR': 'BRL',
                'es-AR': 'ARS',
                'en-CA': 'CAD',
                'en-GB': 'GBP',
                'fr-FR': 'EUR',
                'de-DE': 'EUR',
                'es-ES': 'EUR',
            };

            if (localeToCurrency[locale]) {
                return localeToCurrency[locale];
            }

            const language = locale.split('-')[0];
            const languageToCurrency = {
                'es': 'COP',
                'en': 'USD',
                'pt': 'BRL',
                'fr': 'EUR',
                'de': 'EUR'
            };

            if (languageToCurrency[language]) {
                return languageToCurrency[language];
            }

            return 'COP';

        } catch (error) {
            console.warn('Could not detect user currency:', error);
            return 'COP';
        }
    }

    // Convert amount from COP to target currency
    convert(amount, fromCurrency = 'COP', toCurrency = null) {
        toCurrency = toCurrency || this.currentCurrency;

        if (fromCurrency === toCurrency) {
            return amount;
        }

        // Convert to COP first if not already
        let copAmount = amount;
        if (fromCurrency !== 'COP') {
            const fromRate = this.exchangeRates[fromCurrency];
            if (fromRate && fromRate !== 0) {
                copAmount = amount / fromRate;
            }
        }

        // Convert from COP to target currency
        const toRate = this.exchangeRates[toCurrency];
        if (!toRate) {
            console.warn(`Unknown currency: ${toCurrency}`);
            return copAmount;
        }
        return copAmount * toRate;
    }

    // Format amount with currency symbol and proper decimals
    format(amount, currency = null) {
        currency = currency || this.currentCurrency;
        const convertedAmount = this.convert(amount, 'COP', currency);
        const symbol = this.currencySymbols[currency];

        if (currency === 'COP') {
            return `${Math.round(convertedAmount).toLocaleString('es-CO')} ${symbol}`;
        } else if (['USD', 'EUR', 'GBP', 'CAD'].includes(currency)) {
            return `${symbol}${convertedAmount.toFixed(2)}`;
        } else {
            return `${symbol}${convertedAmount.toFixed(0)}`;
        }
    }

    // Get currency symbol
    getSymbol(currency = null) {
        currency = currency || this.currentCurrency;
        return this.currencySymbols[currency];
    }

    // Get currency name
    getName(currency = null) {
        currency = currency || this.currentCurrency;
        return this.currencyNames[currency];
    }

    // Get available currencies
    getAvailableCurrencies() {
        return Object.keys(this.exchangeRates).map(code => ({
            code,
            name: this.currencyNames[code],
            symbol: this.currencySymbols[code]
        }));
    }

    // Update exchange rates
    updateExchangeRates(newRates) {
        this.exchangeRates = { ...this.exchangeRates, ...newRates };
    }

    // Initialize currency system - fetches live rates from backend
    async initialize() {
        // Fetch live exchange rates from backend
        try {
            const response = await fetch('/api/exchange-rates');
            const result = await response.json();
            if (result.success && result.data && result.data.rates) {
                this.updateExchangeRates(result.data.rates);
                this.ratesLastUpdated = result.data.lastUpdated;
                this.isUsingFallback = result.data.isUsingFallback;
            }
        } catch (error) {
            console.warn('Could not fetch live exchange rates, using defaults:', error);
            this.isUsingFallback = true;
        }

        // If no saved currency, try to detect it
        if (!this.getSavedCurrency()) {
            const detectedCurrency = await this.detectUserCurrency();
            this.saveCurrency(detectedCurrency);
        }

        return this.currentCurrency;
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyManager;
} else {
    window.CurrencyManager = CurrencyManager;
}
