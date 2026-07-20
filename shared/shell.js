/* Shared theme toggle for Web-Games. Loaded with `defer`, so the DOM is ready
   when this runs. The anti-FOUC snippet in each page's <head> applies the stored
   theme before first paint; this only wires up the button and keeps its icon and
   aria-label in sync with the current state. */
(function () {
    var THEME_CYCLE = { auto: 'dark', dark: 'light', light: 'auto' };
    var THEME_ICONS = { auto: '◐', dark: '☀️', light: '🌙' };
    var THEME_LABELS = {
        auto: 'Thème automatique, appuyer pour passer en sombre',
        dark: 'Thème sombre, appuyer pour passer en clair',
        light: 'Thème clair, appuyer pour revenir en automatique'
    };
    function getThemeState() { return localStorage.getItem('theme') || 'auto'; }
    function applyTheme(state) {
        if (state === 'auto') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            document.documentElement.setAttribute('data-theme', state);
            localStorage.setItem('theme', state);
        }
        var btn = document.getElementById('btn-theme');
        if (!btn) return;
        btn.textContent = THEME_ICONS[state];
        btn.setAttribute('aria-label', THEME_LABELS[state]);
    }
    var btn = document.getElementById('btn-theme');
    if (btn) {
        btn.addEventListener('click', function () {
            applyTheme(THEME_CYCLE[getThemeState()]);
        });
    }
    applyTheme(getThemeState());
})();
