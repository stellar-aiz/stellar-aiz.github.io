/**
 * Internationalization (i18n) Module
 * Handles language detection, switching, and persistence
 */

const i18n = {
  // Supported languages
  LANGUAGES: ['ja', 'en'],
  DEFAULT_LANGUAGE: 'ja',
  STORAGE_KEY: 'stellar-aiz-language',

  /**
   * Get current language from URL path
   */
  getLanguageFromURL() {
    const path = window.location.pathname;
    if (path.startsWith('/en/') || path === '/en') {
      return 'en';
    }
    return 'ja';
  },

  /**
   * Get saved language preference from localStorage
   */
  getSavedLanguage() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      return null;
    }
  },

  /**
   * Save language preference to localStorage
   */
  saveLanguage(lang) {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      // localStorage not available
    }
  },

  /**
   * Get browser's preferred language
   */
  getBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith('en')) {
      return 'en';
    }
    return 'ja';
  },

  /**
   * Detect the appropriate language
   * Priority: URL > localStorage > browser setting > default
   */
  detectLanguage() {
    // 1. URL takes highest priority
    const urlLang = this.getLanguageFromURL();

    // 2. Check localStorage for saved preference
    const savedLang = this.getSavedLanguage();

    // 3. Browser language as fallback
    const browserLang = this.getBrowserLanguage();

    // If on Japanese page but user prefers English, consider redirect
    // If on English page, use English
    return urlLang;
  },

  /**
   * Get the current page's path relative to language root
   */
  getRelativePath() {
    let path = window.location.pathname;

    // Remove /en/ prefix if present
    if (path.startsWith('/en/')) {
      path = path.substring(3); // Remove '/en'
    } else if (path === '/en') {
      path = '/';
    }

    return path;
  },

  /**
   * Build URL for a specific language
   */
  buildLanguageURL(targetLang) {
    const relativePath = this.getRelativePath();
    const hash = window.location.hash;

    if (targetLang === 'en') {
      // Add /en prefix
      const enPath = '/en' + (relativePath === '/' ? '/' : relativePath);
      return enPath + hash;
    } else {
      // Japanese - use root path
      return relativePath + hash;
    }
  },

  /**
   * Switch to a different language
   */
  switchLanguage(targetLang) {
    if (!this.LANGUAGES.includes(targetLang)) {
      console.warn(`Unsupported language: ${targetLang}`);
      return;
    }

    // Save preference
    this.saveLanguage(targetLang);

    // Navigate to the target language page
    const targetURL = this.buildLanguageURL(targetLang);
    const currentPath = window.location.pathname + window.location.hash;

    if (targetURL !== currentPath) {
      window.location.href = targetURL;
    }
  },

  /**
   * Check if auto-redirect should happen for first-time visitors
   * Only redirect if:
   * - User has no saved preference
   * - User's browser is set to English
   * - User is on a Japanese page
   */
  shouldAutoRedirect() {
    const savedLang = this.getSavedLanguage();

    // If user has a saved preference, respect it
    if (savedLang) {
      return false;
    }

    const currentLang = this.getLanguageFromURL();
    const browserLang = this.getBrowserLanguage();

    // Only auto-redirect English browser users from Japanese pages
    return currentLang === 'ja' && browserLang === 'en';
  },

  /**
   * Perform auto-redirect if needed
   */
  handleAutoRedirect() {
    if (this.shouldAutoRedirect()) {
      const targetURL = this.buildLanguageURL('en');
      window.location.replace(targetURL);
      return true;
    }
    return false;
  },

  /**
   * Initialize i18n module
   * Call this on page load
   */
  init() {
    // Handle auto-redirect for first-time English-speaking visitors
    if (this.handleAutoRedirect()) {
      return; // Page is redirecting
    }

    // Save current language preference if not set
    const savedLang = this.getSavedLanguage();
    const currentLang = this.getLanguageFromURL();

    if (!savedLang) {
      this.saveLanguage(currentLang);
    }
  },

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.getLanguageFromURL();
  },

  /**
   * Check if current page is in English
   */
  isEnglish() {
    return this.getLanguageFromURL() === 'en';
  },

  /**
   * Check if current page is in Japanese
   */
  isJapanese() {
    return this.getLanguageFromURL() === 'ja';
  }
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
