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

  // Update theme toggle switch
  updateThemeButton(themeName) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Marcar checkbox se estiver em Classic Mode
    themeToggle.checked = (themeName === this.THEMES.CLASSIC);

    // Atualizar aria-label
    const label = themeName === this.THEMES.CLASSIC
      ? 'Mudar para Dark Mode'
      : 'Mudar para Classic Mode';
    themeToggle.setAttribute('aria-label', label);
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}
