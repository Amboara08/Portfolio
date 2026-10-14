document.documentElement.classList.add('js');

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const storageKey = 'amboara-portfolio-theme';

function readStoredTheme() {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Le site reste fonctionnel lorsque le stockage est désactivé.
  }
}

let selectedTheme = readStoredTheme();

function applyTheme(theme) {
  const isDark = theme === 'dark';
  root.dataset.theme = theme;
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute(
    'aria-label',
    isDark ? 'Activer le thème clair' : 'Activer le thème sombre'
  );

  if (themeColor) {
    themeColor.setAttribute('content', isDark ? '#080b12' : '#f7f8fc');
  }
}

applyTheme(selectedTheme || (systemTheme.matches ? 'dark' : 'light'));

themeToggle?.addEventListener('click', () => {
  selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  storeTheme(selectedTheme);
  applyTheme(selectedTheme);
});

function handleSystemTheme(event) {
  if (!selectedTheme) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
}

if (typeof systemTheme.addEventListener === 'function') {
  systemTheme.addEventListener('change', handleSystemTheme);
} else {
  systemTheme.addListener(handleSystemTheme);
}

const currentYear = document.getElementById('currentYear');
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const siteHeader = document.getElementById('siteHeader');

function updateHeader() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 16);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const desktopQuery = window.matchMedia('(min-width: 901px)');

function setMenu(open, restoreFocus = false) {
  if (!menuToggle || !mainNav) return;

  mainNav.classList.toggle('is-open', open);
  menuToggle.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open);

  if (!open && restoreFocus) {
    menuToggle.focus();
  }
}

menuToggle?.addEventListener('click', () => {
  setMenu(!mainNav?.classList.contains('is-open'));
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('click', (event) => {
  if (!mainNav?.classList.contains('is-open')) return;
  if (mainNav.contains(event.target) || menuToggle?.contains(event.target)) return;
  setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mainNav?.classList.contains('is-open')) {
    setMenu(false, true);
  }
});

function handleDesktopChange(event) {
  if (event.matches) setMenu(false);
}

if (typeof desktopQuery.addEventListener === 'function') {
  desktopQuery.addEventListener('change', handleDesktopChange);
} else {
  desktopQuery.addListener(handleDesktopChange);
}

const revealElements = document.querySelectorAll('.reveal');

if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -45px' }
  );

  revealElements.forEach((element) => {
    if (!element.classList.contains('is-visible')) {
      revealObserver.observe(element);
    }
  });
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('[data-nav]')];
const visibilityRatios = new Map();

function setActiveNavigation(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

setActiveNavigation(location.hash.slice(1) || 'accueil');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibilityRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      const mostVisible = [...visibilityRatios.entries()].sort((a, b) => b[1] - a[1])[0];
      if (mostVisible && mostVisible[1] > 0) {
        setActiveNavigation(mostVisible[0]);
      }
    },
    {
      rootMargin: '-22% 0px -48% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75]
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

window.addEventListener('hashchange', () => {
  const sectionId = location.hash.slice(1);
  if (sectionId) setActiveNavigation(sectionId);
});
