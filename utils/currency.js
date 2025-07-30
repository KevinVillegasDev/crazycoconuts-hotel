// Currency conversion utilities
class CurrencyManager {
    constructor() {
        // Exchange rates (update these regularly or use an API)
        this.exchangeRates = {
            // Base: 1 USD
            'USD': 1,
            'COP': 4200, // Colombian Peso (approximate)
            'EUR': 0.85,
            'GBP': 0.75,
            'CAD': 1.25,
            'MXN': 18.5,
            'BRL': 5.2,
            'ARS': 350
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
        
        // Default to Colombian Peso since hotel is in Colombia
        this.currentCurrency = this.getSavedCurrency() || 'COP';
        this.baseCurrency = 'USD'; // All prices stored in USD in database
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
            // First try browser locale
            const locale = navigator.language || navigator.languages[0];
            const localeToCurrency = {
                'es-CO': 'COP', // Colombia
                'en-US': 'USD', // United States
                'es-MX': 'MXN', // Mexico
                'pt-BR': 'BRL', // Brazil
                'es-AR': 'ARS', // Argentina
                'en-CA': 'CAD', // Canada
                'en-GB': 'GBP', // United Kingdom
                'fr-FR': 'EUR', // France
                'de-DE': 'EUR', // Germany
                'es-ES': 'EUR', // Spain
            };
            
            // Check for exact locale match
            if (localeToCurrency[locale]) {
                return localeToCurrency[locale];
            }
            
            // Check for language match
            const language = locale.split('-')[0];
            const languageToCurrency = {
                'es': 'COP', // Default Spanish to Colombian Peso
                'en': 'USD', // Default English to USD
                'pt': 'BRL', // Portuguese to Brazilian Real
                'fr': 'EUR', // French to Euro
                'de': 'EUR'  // German to Euro
            };
            
            if (languageToCurrency[language]) {
                return languageToCurrency[language];
            }
            
            // Try geolocation API as fallback
            if (navigator.geolocation) {
                const position = await this.getCurrentPosition();
                // This would need a service to convert coordinates to country
                // For now, we'll use a simplified approach
            }
            
            // Default to Colombian Peso since it's a Colombian hotel
            return 'COP';
            
        } catch (error) {
            console.warn('Could not detect user currency:', error);
            return 'COP'; // Default to local currency
        }
    }
    
    // Get current position (for geolocation)
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
    
    // Convert amount from base currency (USD) to target currency
    convert(amount, fromCurrency = 'USD', toCurrency = null) {
        toCurrency = toCurrency || this.currentCurrency;
        
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        // Convert to USD first if not already
        let usdAmount = amount;
        if (fromCurrency !== 'USD') {
            usdAmount = amount / this.exchangeRates[fromCurrency];
        }
        
        // Convert from USD to target currency
        return usdAmount * this.exchangeRates[toCurrency];
    }
    
    // Format amount with currency symbol and proper decimals
    format(amount, currency = null) {
        currency = currency || this.currentCurrency;
        const convertedAmount = this.convert(amount, 'USD', currency);
        const symbol = this.currencySymbols[currency];
        
        // Different formatting for different currencies
        if (currency === 'COP') {
            // Colombian Peso - no decimals, use thousands separator
            return `${Math.round(convertedAmount).toLocaleString('es-CO')} ${symbol}`;
        } else if (currency === 'USD' || currency === 'EUR' || currency === 'GBP' || currency === 'CAD') {
            // Standard currencies with 2 decimals
            return `${symbol}${convertedAmount.toFixed(2)}`;
        } else {
            // Other currencies - round appropriately
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
    
    // Update exchange rates (could be called periodically)
    updateExchangeRates(newRates) {
        this.exchangeRates = { ...this.exchangeRates, ...newRates };
    }
    
    // Initialize currency system
    async initialize() {
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