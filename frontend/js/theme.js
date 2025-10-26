// Theme Management System
// Supports Dark Mode (default purple/dark) and Classic Mode (Nintendo red/white)

const ThemeManager = {
  // Theme names
  THEMES: {
    DARK: 'dark',
    CLASSIC: 'classic'
  },

  // Get current theme from localStorage or default to dark
  getCurrentTheme() {
    return Storage.get('userTheme') || this.THEMES.DARK;
  },

  // Initialize theme on page load
  init() {
    const savedTheme = this.getCurrentTheme();
    this.applyTheme(savedTheme);
    this.updateThemeButton(savedTheme);
  },

  // Apply theme to document
  applyTheme(themeName) {
    const html = document.documentElement;

    if (themeName === this.THEMES.CLASSIC) {
      html.setAttribute('data-theme', 'classic');
    } else {
      html.removeAttribute('data-theme');
    }

    // Save to localStorage
    Storage.set('userTheme', themeName);
  },

  // Toggle between themes
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.THEMES.DARK
      ? this.THEMES.CLASSIC
      : this.THEMES.DARK;

    this.applyTheme(newTheme);
    this.updateThemeButton(newTheme);

    // Optional: Show feedback message
    const themeName = newTheme === this.THEMES.DARK ? 'Dark Mode' : 'Classic Mode';
    if (typeof showSuccess === 'function') {
      showSuccess(`Tema alterado para ${themeName}`);
    }
  },

  // Update theme button icon and text
  updateThemeButton(themeName) {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    if (themeName === this.THEMES.CLASSIC) {
      themeBtn.innerHTML = '🌙';
      themeBtn.setAttribute('aria-label', 'Mudar para Dark Mode');
      themeBtn.setAttribute('title', 'Mudar para Dark Mode');
    } else {
      themeBtn.innerHTML = '☀️';
      themeBtn.setAttribute('aria-label', 'Mudar para Classic Mode');
      themeBtn.setAttribute('title', 'Mudar para Classic Mode');
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}
