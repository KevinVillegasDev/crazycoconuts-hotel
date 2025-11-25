// ==========================================================================
// CRAZY COCONUTS - Internationalization (i18n) Handler
// Auto-detects browser language and provides toggle functionality
// ==========================================================================

(function() {
    'use strict';

    // Default and supported languages
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'es'];
    const STORAGE_KEY = 'cc_language';

    // Language display info
    const LANG_INFO = {
        en: { flag: '🇺🇸', code: 'EN', name: 'English' },
        es: { flag: '🇨🇴', code: 'ES', name: 'Español' }
    };

    // Current language
    let currentLang = DEFAULT_LANG;

    /**
     * Detect browser language
     */
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        return SUPPORTED_LANGS.includes(langCode) ? langCode : DEFAULT_LANG;
    }

    /**
     * Get saved language preference
     */
    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    /**
     * Save language preference
     */
    function saveLanguage(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            // localStorage not available
        }
    }

    /**
     * Get translation by key path (e.g., "hero.title")
     */
    function getTranslation(keyPath, lang) {
        if (!window.translations || !window.translations[lang]) {
            return null;
        }

        const keys = keyPath.split('.');
        let value = window.translations[lang];

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return typeof value === 'string' ? value : null;
    }

    /**
     * Update all translatable elements on the page
     */
    function updatePageTranslations(lang) {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key, lang);

            if (translation) {
                // Check if we should use innerHTML (for elements with HTML content like <em>)
                if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = getTranslation(key, lang);

            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update the html lang attribute
        document.documentElement.lang = lang;

        // Update language toggle button
        updateLanguageToggle(lang);
    }

    /**
     * Update the language toggle button display
     */
    function updateLanguageToggle(lang) {
        const toggle = document.getElementById('languageToggle');
        if (!toggle) return;

        const info = LANG_INFO[lang];
        const flagSpan = toggle.querySelector('.lang-flag');
        const codeSpan = toggle.querySelector('.lang-code');

        if (flagSpan) flagSpan.textContent = info.flag;
        if (codeSpan) codeSpan.textContent = info.code;
    }

    /**
     * Toggle between languages
     */
    function toggleLanguage() {
        const newLang = currentLang === 'en' ? 'es' : 'en';
        setLanguage(newLang);
    }

    /**
     * Set language and update page
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            lang = DEFAULT_LANG;
        }

        currentLang = lang;
        saveLanguage(lang);
        updatePageTranslations(lang);

        // Dispatch custom event for other scripts to react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    /**
     * Get current language
     */
    function getCurrentLanguage() {
        return currentLang;
    }

    /**
     * Initialize the i18n system
     */
    function init() {
        // Check for saved preference first, then browser detection
        const savedLang = getSavedLanguage();
        const detectedLang = detectBrowserLanguage();

        currentLang = savedLang || detectedLang;

        // Wait for translations to load, then update page
        if (window.translations) {
            updatePageTranslations(currentLang);
        } else {
            // If translations not loaded yet, wait a bit
            setTimeout(() => {
                if (window.translations) {
                    updatePageTranslations(currentLang);
                }
            }, 100);
        }

        // Set up language toggle button
        const toggle = document.getElementById('languageToggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggleLanguage();
            });
        }
    }

    // Expose public API
    window.i18n = {
        init,
        setLanguage,
        getCurrentLanguage,
        toggleLanguage,
        getTranslation: (key) => getTranslation(key, currentLang)
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
