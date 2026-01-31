/**
 * Component Loader
 * Loads shared HTML components (header, footer) dynamically
 * Supports internationalization (i18n)
 */

class ComponentLoader {
  constructor() {
    this.componentsPath = '/components';
    this.components = {
      header: { selector: '#header-placeholder', file: 'header.html' },
      footer: { selector: '#footer-placeholder', file: 'footer.html' }
    };
  }

  /**
   * Determine if current page is English
   */
  isEnglishPage() {
    const path = window.location.pathname;
    return path.startsWith('/en/') || path === '/en';
  }

  /**
   * Get the component file name based on language
   */
  getComponentFile(name) {
    const component = this.components[name];
    if (!component) return null;

    if (this.isEnglishPage()) {
      // Use English version: header.html -> header-en.html
      const baseName = component.file.replace('.html', '');
      return `${baseName}-en.html`;
    }

    return component.file;
  }

  /**
   * Load a single component
   */
  async loadComponent(name) {
    const component = this.components[name];
    if (!component) {
      console.warn(`Component "${name}" not found`);
      return;
    }

    const placeholder = document.querySelector(component.selector);
    if (!placeholder) {
      console.warn(`Placeholder "${component.selector}" not found`);
      return;
    }

    const file = this.getComponentFile(name);

    try {
      const response = await fetch(`${this.componentsPath}/${file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      placeholder.innerHTML = html;

      // Dispatch event for post-load processing
      document.dispatchEvent(new CustomEvent('componentLoaded', {
        detail: { name, element: placeholder }
      }));
    } catch (error) {
      console.error(`Failed to load component "${name}":`, error);
    }
  }

  /**
   * Load all components
   */
  async loadAll() {
    const promises = Object.keys(this.components).map(name => this.loadComponent(name));
    await Promise.all(promises);

    // Re-initialize Flowbite after components are loaded
    this.initFlowbite();

    // Highlight active navigation
    this.highlightActiveNav();
  }

  /**
   * Re-initialize Flowbite components
   */
  initFlowbite() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  /**
   * Highlight active navigation item based on current page
   */
  highlightActiveNav() {
    let currentPath = window.location.pathname;

    // Normalize path: remove /en/ prefix for comparison
    const isEnglish = this.isEnglishPage();
    if (isEnglish) {
      currentPath = currentPath.replace(/^\/en/, '') || '/';
    }

    const navLinks = document.querySelectorAll('.nav-link[data-page]');

    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      let isActive = false;

      if (page === 'home' && (currentPath === '/' || currentPath === '/index.html')) {
        isActive = true;
      } else if (page && currentPath.includes(`/pages/${page}/`)) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add('text-blue-600', 'md:text-blue-600');
        link.classList.remove('text-gray-900');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const loader = new ComponentLoader();
  loader.loadAll();
});
