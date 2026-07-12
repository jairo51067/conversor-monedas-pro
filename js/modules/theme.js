// Manejo de temas (modo oscuro/claro)
export class Theme {
    constructor() {
        this.themeKey = 'app-theme';
        this.currentTheme = this.getSavedTheme();
    }

    getSavedTheme() {
        const saved = localStorage.getItem(this.themeKey);
        if (saved) return saved;

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    apply() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateToggleButton();
        console.log(`✅ Theme applied: ${this.currentTheme}`);
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.themeKey, this.currentTheme);
        this.apply();
    }

    updateToggleButton() {
        const icon = document.querySelector('#theme-toggle .theme-toggle-icon');
        const label = document.querySelector('#theme-toggle .theme-toggle-label');
        
        if (icon && label) {
            if (this.currentTheme === 'dark') {
                icon.className = 'fas fa-sun theme-toggle-icon';
                label.textContent = 'Modo Claro';
            } else {
                icon.className = 'fas fa-moon theme-toggle-icon';
                label.textContent = 'Modo Oscuro';
            }
        }
    }

    setupListeners() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.themeKey)) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.apply();
            }
        });
    }
}