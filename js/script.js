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
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const changeTheme = () => {
    selectedTheme = nextTheme;
    storeTheme(selectedTheme);
    applyTheme(selectedTheme);
    document.dispatchEvent(new CustomEvent('portfolio:theme-change', {
      detail: { theme: selectedTheme }
    }));
  };

  if (reduceMotion.matches || typeof document.startViewTransition !== 'function') {
    changeTheme();
    return;
  }

  const toggleBounds = themeToggle.getBoundingClientRect();
  const originX = toggleBounds.left + toggleBounds.width / 2;
  const originY = toggleBounds.top + toggleBounds.height / 2;
  const radius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY)
  );

  root.style.setProperty('--theme-x', `${originX}px`);
  root.style.setProperty('--theme-y', `${originY}px`);
  root.style.setProperty('--theme-radius', `${radius}px`);
  document.startViewTransition(changeTheme);
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

const siteHeader = document.getElementById('siteHeader');
const scrollProgress = document.getElementById('scrollProgress');
let scrollFrame;

function updateHeader() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 16);

  if (scrollProgress) {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }
}

updateHeader();
window.addEventListener('scroll', () => {
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(() => {
    updateHeader();
    scrollFrame = null;
  });
}, { passive: true });

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
const sectionAccents = {
  accueil: '23, 105, 255',
  projets: '36, 181, 137',
  apropos: '121, 86, 255',
  competences: '38, 154, 255',
  formation: '240, 162, 46',
  contact: '111, 77, 255'
};

function setActiveNavigation(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  root.style.setProperty('--section-accent-rgb', sectionAccents[sectionId] || sectionAccents.accueil);
  document.body.dataset.activeSection = sectionId;
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

const pointerCanHover = window.matchMedia('(hover: hover) and (pointer: fine)');

if (pointerCanHover.matches && !reduceMotion.matches) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointerenter', () => {
      card.classList.add('has-pointer-light');
    });

    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('has-pointer-light');
    });
  });
}

const projectDialog = document.getElementById('projectDialog');
const projectDialogTitle = document.getElementById('projectDialogTitle');
const projectDialogMeta = document.getElementById('projectDialogMeta');
const projectDialogDescription = document.getElementById('projectDialogDescription');
const projectDialogTags = document.getElementById('projectDialogTags');
const projectDialogLink = document.getElementById('projectDialogLink');
const projectDialogLinkLabel = document.getElementById('projectDialogLinkLabel');
const projectDialogIcon = projectDialog?.querySelector('.project-dialog-visual > i');
let projectDialogTrigger = null;

const projectPalettes = [
  { start: '#178b74', end: '#1769ff', icon: 'fa-recycle' },
  { start: '#2d9b55', end: '#e1a52e', icon: 'fa-seedling' },
  { start: '#1769ff', end: '#7956ff', icon: 'fa-calendar-check' }
];

function closeProjectDialog() {
  if (!projectDialog?.open) return;
  projectDialog.close();
}

function openProjectDialog(card, trigger, index) {
  if (!projectDialog || !projectDialogTitle || !projectDialogDescription || !projectDialogTags) return;

  const title = card.querySelector('h3')?.textContent.trim() || 'Projet';
  const meta = card.querySelector('.project-meta span')?.textContent.trim() || 'Projet sélectionné';
  const description = card.querySelector('.project-content > p')?.textContent.trim() || '';
  const sourceLink = card.querySelector('.project-actions a');
  const tags = [...card.querySelectorAll('.tag-list li')].map((tag) => tag.textContent.trim());
  const palette = projectPalettes[index] || projectPalettes[0];

  projectDialogTitle.textContent = title;
  projectDialogMeta.textContent = meta;
  projectDialogDescription.textContent = description;
  projectDialogTags.replaceChildren(...tags.map((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  }));

  if (projectDialogLink && sourceLink) {
    projectDialogLink.href = sourceLink.href;
    if (projectDialogLinkLabel) {
      projectDialogLinkLabel.textContent = sourceLink.textContent.trim();
    }
  }

  if (projectDialogIcon) {
    projectDialogIcon.className = `fa-solid ${palette.icon}`;
  }

  projectDialog.style.setProperty('--dialog-start', palette.start);
  projectDialog.style.setProperty('--dialog-end', palette.end);
  projectDialogTrigger = trigger;
  document.body.classList.add('dialog-open');
  projectDialog.showModal();
}

document.querySelectorAll('[data-project-card]').forEach((card, index) => {
  const trigger = card.querySelector('[data-project-details]');
  trigger?.addEventListener('click', () => openProjectDialog(card, trigger, index));
});

projectDialog?.querySelectorAll('[data-dialog-close]').forEach((button) => {
  button.addEventListener('click', closeProjectDialog);
});

projectDialog?.addEventListener('click', (event) => {
  if (event.target === projectDialog) {
    closeProjectDialog();
  }
});

projectDialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  projectDialogTrigger?.focus();
});

const educationTimeline = document.getElementById('educationTimeline');
const timelineProgress = document.getElementById('timelineProgress');
const timelineItems = [...document.querySelectorAll('.timeline-item')];
const backToTop = document.getElementById('backToTop');
let enhancementFrame;

function updatePageEnhancements() {
  backToTop?.classList.toggle('is-visible', window.scrollY > 720);

  if (educationTimeline && timelineProgress) {
    const rect = educationTimeline.getBoundingClientRect();
    const startLine = window.innerHeight * 0.78;
    const endLine = window.innerHeight * 0.28;
    const distance = rect.height + startLine - endLine;
    const progress = Math.min(Math.max((startLine - rect.top) / distance, 0), 1);
    timelineProgress.style.transform = `scaleY(${progress})`;

    const focusLine = window.innerHeight * 0.48;
    let closestItem = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    timelineItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + Math.min(itemRect.height / 2, 45);
      const itemDistance = Math.abs(itemCenter - focusLine);
      if (itemDistance < closestDistance) {
        closestDistance = itemDistance;
        closestItem = item;
      }
    });

    timelineItems.forEach((item) => {
      item.classList.toggle('is-current', item === closestItem && rect.top < startLine && rect.bottom > endLine);
    });
  }
}

updatePageEnhancements();
window.addEventListener('scroll', () => {
  if (enhancementFrame) return;
  enhancementFrame = window.requestAnimationFrame(() => {
    updatePageEnhancements();
    enhancementFrame = null;
  });
}, { passive: true });

window.addEventListener('resize', updatePageEnhancements);

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

const companion = document.getElementById('portfolioCompanion');
const companionMessage = document.getElementById('companionMessage');

if (companion && companionMessage) {
  let companionX = window.innerWidth - 118;
  let companionY = 145;
  let companionMode = 'idle';
  let companionMoveTimer;
  let companionActionTimer;
  let companionScrollTimer;
  let companionActionCleanup;
  let companionMotionFrame;
  let companionRotation = 0;
  let companionCurveDirection = 1;
  let lastCompanionScrollUpdate = 0;
  let isCompanionScrolling = false;
  let companionScene = '';

  companion.classList.add('has-motion-engine');

  const companionScenes = [
    { id: 'accueil', scene: 'home', message: 'Coucou ! 👋', label: 'Môra vous souhaite la bienvenue' },
    { id: 'projets', scene: 'projects', message: 'Mode projet 💻', label: 'Môra présente les projets avec son ordinateur' },
    { id: 'apropos', scene: 'about', message: 'À propos de moi ✨', label: 'Môra accompagne la présentation' },
    { id: 'competences', scene: 'skills', message: 'Mes compétences 🤓', label: 'Môra présente les compétences avec ses lunettes' },
    { id: 'formation', scene: 'education', message: 'Ma formation 🎓', label: 'Môra présente la formation avec son chapeau de diplômé' },
    { id: 'contact', scene: 'contact', message: 'Contactez-moi 📱', label: 'Môra vous invite à prendre contact' }
  ].map((item) => ({ ...item, element: document.getElementById(item.id) }))
    .filter((item) => item.element);
  const companionSceneClasses = companionScenes.map((item) => `scene-${item.scene}`);

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
  const companionSize = () => (window.innerWidth <= 600 ? 76 : 96);
  const protectedSelector = [
    '.site-header',
    '.hero-copy',
    '.code-window',
    '.browser-card',
    '.project-card',
    '.portrait-frame',
    '.about-copy',
    '.skill-panel',
    '.timeline',
    '.contact-card'
  ].join(',');

  function companionBounds() {
    const size = companionSize();
    const horizontalInset = window.innerWidth <= 600
      ? 14
      : window.innerWidth <= 900
        ? 24
        : clamp(window.innerWidth * 0.055, 42, 82);
    return {
      minX: horizontalInset,
      maxX: Math.max(horizontalInset, window.innerWidth - size - horizontalInset),
      minY: window.innerWidth <= 900 ? 82 : 92,
      maxY: Math.max(120, window.innerHeight - size - 20)
    };
  }

  function targetIsFree(x, y) {
    const size = companionSize();
    const padding = window.innerWidth <= 760 ? 8 : 14;
    const candidate = {
      left: x + 7,
      top: y + 16,
      right: x + size - 4,
      bottom: y + size
    };

    return [...document.querySelectorAll(protectedSelector)].every((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return true;
      return (
        candidate.right < rect.left - padding ||
        candidate.left > rect.right + padding ||
        candidate.bottom < rect.top - padding ||
        candidate.top > rect.bottom + padding
      );
    });
  }

  function findFreeTarget() {
    const bounds = companionBounds();
    const mobile = window.innerWidth <= 760;
    const preferCenter = !mobile && Math.random() < 0.68;

    for (let attempt = 0; attempt < 22; attempt += 1) {
      let x;

      if (mobile) {
        if (Math.random() < 0.34) {
          x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        } else {
          const sideWidth = Math.max(18, (bounds.maxX - bounds.minX) * 0.22);
          x = Math.random() < 0.45
            ? bounds.minX + Math.random() * sideWidth
            : bounds.maxX - Math.random() * sideWidth;
        }
      } else if (preferCenter) {
        x = window.innerWidth * (0.19 + Math.random() * 0.62) - companionSize() / 2;
      } else {
        x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      }

      const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      if (targetIsFree(x, y)) return { x, y };
    }

    return {
      x: Math.random() < 0.3
        ? bounds.minX + Math.min(32, (bounds.maxX - bounds.minX) * 0.08)
        : bounds.maxX - Math.min(32, (bounds.maxX - bounds.minX) * 0.08),
      y: clamp(companionY + (Math.random() - 0.5) * 90, bounds.minY, bounds.maxY)
    };
  }

  function renderCompanion(x, y, rotation) {
    companionX = x;
    companionY = y;
    companionRotation = rotation;
    companion.style.setProperty('--companion-x', `${companionX}px`);
    companion.style.setProperty('--companion-y', `${companionY}px`);
    companion.style.setProperty('--companion-rotation', `${companionRotation}deg`);
  }

  function placeCompanion(x, y, duration = 6, rotation = 0, curveStrength = 0.2) {
    const bounds = companionBounds();
    const nextX = clamp(x, bounds.minX, bounds.maxX);
    const nextY = clamp(y, bounds.minY, bounds.maxY);
    const startX = companionX;
    const startY = companionY;
    const startRotation = companionRotation;
    const deltaX = nextX - startX;
    const deltaY = nextY - startY;
    const distance = Math.hypot(deltaX, deltaY);

    window.cancelAnimationFrame(companionMotionFrame);
    companion.classList.toggle('is-travelling', distance > 210);

    if (duration <= 0 || reduceMotion.matches || distance < 1) {
      renderCompanion(nextX, nextY, rotation);
      companion.classList.remove('is-surfing', 'is-travelling');
      return;
    }

    companionCurveDirection *= -1;
    const curveDirection = companionCurveDirection;
    const normalX = -deltaY / distance;
    const normalY = deltaX / distance;
    const bend = clamp(distance * curveStrength, 16, 110) * curveDirection;
    const controlX = clamp((startX + nextX) / 2 + normalX * bend, bounds.minX, bounds.maxX);
    const controlY = clamp((startY + nextY) / 2 + normalY * bend, bounds.minY, bounds.maxY);
    const startedAt = performance.now();
    const durationMs = duration * 1000;

    companion.classList.add('is-surfing');

    function surfToTarget(now) {
      const rawProgress = clamp((now - startedAt) / durationMs, 0, 1);
      const progress = 0.5 - Math.cos(rawProgress * Math.PI) / 2;
      const inverse = 1 - progress;
      const wave = Math.sin(progress * Math.PI * 3) * Math.min(7, distance * 0.025);
      const currentX = inverse * inverse * startX
        + 2 * inverse * progress * controlX
        + progress * progress * nextX
        + normalX * wave;
      const currentY = inverse * inverse * startY
        + 2 * inverse * progress * controlY
        + progress * progress * nextY
        + normalY * wave;
      const bank = Math.sin(progress * Math.PI) * curveDirection * 8;
      const currentRotation = startRotation + (rotation - startRotation) * progress + bank;

      renderCompanion(currentX, currentY, currentRotation);

      if (rawProgress < 1) {
        companionMotionFrame = window.requestAnimationFrame(surfToTarget);
      } else {
        renderCompanion(nextX, nextY, rotation);
        companion.classList.remove('is-surfing', 'is-travelling');
      }
    }

    companionMotionFrame = window.requestAnimationFrame(surfToTarget);
  }

  function resetCompanionAction() {
    companion.classList.remove(
      'is-waving',
      'is-contacting',
      'is-spinning',
      'is-surprised',
      'is-happy',
      'is-scene-announcement'
    );
    companionMode = 'idle';
    const scene = companionScenes.find((item) => item.scene === companionScene);
    companionMessage.textContent = scene?.message || 'Coucou ! 👋';
    companion.setAttribute('aria-label', scene?.label || 'Dire bonjour à Môra, le compagnon du portfolio');
  }

  function setCompanionScene(sceneName) {
    if (!sceneName || sceneName === companionScene) return;

    window.clearTimeout(companionActionCleanup);
    companionScene = sceneName;
    companion.classList.remove(...companionSceneClasses);
    companion.classList.add(`scene-${sceneName}`);
    resetCompanionAction();
    void companion.offsetWidth;
    companion.classList.add('is-scene-announcement');

    if (sceneName === 'home') {
      companion.classList.add('is-waving', 'is-happy');
    } else if (sceneName === 'contact') {
      companion.classList.add('is-happy');
    }

    companionActionCleanup = window.setTimeout(resetCompanionAction, 2300);
  }

  function updateCompanionScene() {
    if (!companionScenes.length) return;

    const focusLine = window.innerHeight * 0.46;
    let activeScene = companionScenes[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    companionScenes.forEach((item) => {
      const rect = item.element.getBoundingClientRect();
      const distance = focusLine < rect.top
        ? rect.top - focusLine
        : focusLine > rect.bottom
          ? focusLine - rect.bottom
          : 0;

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeScene = item;
      }
    });

    setCompanionScene(activeScene.scene);
  }

  function showCompanionAction(action = 'wave') {
    window.clearTimeout(companionActionCleanup);
    resetCompanionAction();
    void companion.offsetWidth;
    companionMode = action;

    if (action === 'contact') {
      companionMessage.textContent = 'Contactez-moi 📱';
      companion.classList.add('is-contacting', 'is-happy');
      companion.setAttribute('aria-label', 'Aller à la section Contact');
      companionActionCleanup = window.setTimeout(resetCompanionAction, 4300);
      return;
    }

    if (action === 'spin') {
      companionMessage.textContent = 'Wouhou ! ✨';
      companion.classList.add('is-spinning');
      companionActionCleanup = window.setTimeout(resetCompanionAction, 3500);
      return;
    }

    if (action === 'surprise') {
      companionMessage.textContent = 'Oh ! 😮';
      companion.classList.add('is-surprised');
      companionActionCleanup = window.setTimeout(resetCompanionAction, 1450);
      return;
    }

    companionMessage.textContent = 'Coucou ! 👋';
    companion.classList.add('is-waving', 'is-happy');
    companionActionCleanup = window.setTimeout(resetCompanionAction, 2200);
  }

  function scheduleCompanionMove() {
    window.clearTimeout(companionMoveTimer);
    if (reduceMotion.matches || document.hidden || isCompanionScrolling) return;

    companionMoveTimer = window.setTimeout(() => {
      const target = findFreeTarget();
      const distance = Math.hypot(target.x - companionX, target.y - companionY);
      const duration = clamp(distance / 72, 5.8, 10.5);
      placeCompanion(target.x, target.y, duration, (Math.random() - 0.5) * 8, 0.24);
      scheduleCompanionMove();
    }, 8000 + Math.random() * 6000);
  }

  function scheduleCompanionAction() {
    window.clearTimeout(companionActionTimer);
    if (reduceMotion.matches || document.hidden) return;

    companionActionTimer = window.setTimeout(() => {
      const choice = Math.random();
      if (choice < 0.52) showCompanionAction('wave');
      else if (choice < 0.82) showCompanionAction('contact');
      else showCompanionAction('spin');
      scheduleCompanionAction();
    }, 15000 + Math.random() * 15000);
  }

  function followPageProgress() {
    const bounds = companionBounds();
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? clamp(window.scrollY / scrollableHeight, 0, 1) : 0;
    const laneInset = window.innerWidth <= 760
      ? Math.min(18, (bounds.maxX - bounds.minX) * 0.08)
      : Math.min(window.innerWidth * 0.07, 90);
    const leftLane = bounds.minX + laneInset;
    const rightLane = bounds.maxX - laneInset;
    const edge = Math.sin(progress * Math.PI * 2) > -0.7 ? rightLane : leftLane;
    const targetY = bounds.minY + progress * (bounds.maxY - bounds.minY);
    placeCompanion(edge, targetY, 1.8, Math.sin(progress * Math.PI * 4) * 3, 0.1);
  }

  function handleCompanionScroll() {
    const now = performance.now();
    if (now - lastCompanionScrollUpdate < 150) return;
    lastCompanionScrollUpdate = now;
    updateCompanionScene();
    if (reduceMotion.matches) return;
    isCompanionScrolling = true;
    window.clearTimeout(companionMoveTimer);
    followPageProgress();
    window.clearTimeout(companionScrollTimer);
    companionScrollTimer = window.setTimeout(() => {
      isCompanionScrolling = false;
      followPageProgress();
      scheduleCompanionMove();
    }, 1800);
  }

  companion.addEventListener('click', () => {
    if (companionMode === 'contact' || companionScene === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      resetCompanionAction();
      return;
    }
    showCompanionAction('wave');
  });

  companion.addEventListener('pointerenter', () => {
    showCompanionAction('wave');
  });

  companion.addEventListener('pointerleave', () => {
    if (companionMode === 'wave') {
      window.clearTimeout(companionActionCleanup);
      companionActionCleanup = window.setTimeout(resetCompanionAction, 550);
    }
  });

  document.addEventListener('portfolio:theme-change', () => {
    showCompanionAction('surprise');
  });

  if (pointerCanHover.matches && !reduceMotion.matches) {
    let eyeFrame = 0;
    let eyePointerX = 0;
    let eyePointerY = 0;

    document.addEventListener('pointermove', (event) => {
      eyePointerX = event.clientX;
      eyePointerY = event.clientY;
      if (eyeFrame) return;

      eyeFrame = window.requestAnimationFrame(() => {
        const bounds = companion.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const angle = Math.atan2(eyePointerY - centerY, eyePointerX - centerX);
        const distance = Math.min(Math.hypot(eyePointerX - centerX, eyePointerY - centerY) / 120, 1);
        companion.style.setProperty('--eye-x', `${Math.cos(angle) * 3 * distance}px`);
        companion.style.setProperty('--eye-y', `${Math.sin(angle) * 2.5 * distance}px`);
        eyeFrame = 0;
      });
    }, { passive: true });
  }

  window.addEventListener('scroll', handleCompanionScroll, { passive: true });
  window.addEventListener('resize', () => {
    updateCompanionScene();
    followPageProgress();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(companionMoveTimer);
      window.clearTimeout(companionActionTimer);
      window.cancelAnimationFrame(companionMotionFrame);
      companion.classList.remove('is-surfing', 'is-travelling');
    } else {
      followPageProgress();
      scheduleCompanionMove();
      scheduleCompanionAction();
    }
  });

  if (reduceMotion.matches) {
    const bounds = companionBounds();
    updateCompanionScene();
    placeCompanion(bounds.maxX - 12, bounds.maxY - 12, 0, 0);
  } else {
    updateCompanionScene();
    followPageProgress();
    scheduleCompanionMove();
    scheduleCompanionAction();
  }
}

