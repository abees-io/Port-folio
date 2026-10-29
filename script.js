'use strict';

const email = 'cosmic.abis6@gmail.com';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = matchMedia('(max-width: 700px)');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-nav');
const copyStatus = document.getElementById('copy-status');
let copyStatusTimer;

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('copy-email').addEventListener('click', async () => {
  clearTimeout(copyStatusTimer);
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = 'Email copied!';
  } catch {
    copyStatus.textContent = 'Please select and copy the email address above.';
  }
  copyStatusTimer = setTimeout(() => { copyStatus.textContent = ''; }, 5000);
});

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
mobileLayout.addEventListener('change', closeMenu);

// Project destinations remain editable in projects.js.
const cards = [...document.querySelectorAll('.project')];
for (const project of window.portfolioProjects || []) {
  const card = cards.find(element => element.dataset.project === String(project.slot));
  if (!card) continue;
  card.querySelector('.project-info h3').textContent = project.title;
  card.querySelector('.project-info p').textContent = project.category;

  const note = card.querySelector('.project-note');
  let destination;
  try {
    destination = new URL(project.url);
    if (!['https:', 'http:'].includes(destination.protocol)) throw new Error('Invalid project URL');
  } catch {
    card.classList.remove('project-live');
    note.textContent = project.note || 'Project showcase coming soon · Concept preview';
    const linkedArt = card.querySelector('a.project-art');
    if (linkedArt) {
      const preview = document.createElement('div');
      preview.className = linkedArt.className;
      preview.append(...linkedArt.childNodes);
      linkedArt.replaceWith(preview);
    }
    continue;
  }

  const link = document.createElement('a');
  link.className = 'project-link';
  link.href = destination.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View project •';
  link.setAttribute('aria-label', `View ${project.title} (opens in a new tab)`);
  note.replaceChildren(link);
  card.classList.add('project-live');
}

// Make a configured project's preview clickable as well as its text link.
for (const card of cards) {
  const destination = card.querySelector('.project-link');
  const art = card.querySelector('.project-art');
  if (!destination || !art) continue;
  const link = document.createElement('a');
  link.className = art.className;
  link.href = destination.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', destination.getAttribute('aria-label'));
  link.append(...art.childNodes);
  art.replaceWith(link);
}

// Native details support touch, keyboard and a usable no-JavaScript fallback.
const services = [...document.querySelectorAll('.service')];
services.forEach(service => service.addEventListener('toggle', () => {
  if (service.open) services.forEach(other => { if (other !== service) other.open = false; });
}));

const hero = document.querySelector('.hero');
const workSection = document.getElementById('work');
const aboutSection = document.getElementById('about');
aboutSection.querySelector('.section-heading').removeAttribute('data-reveal');
aboutSection.querySelector('.about-grid').removeAttribute('data-reveal');
const aboutItems = [...aboutSection.querySelectorAll('.about-name, .large-copy, .about-copy p')];
aboutItems.forEach(element => element.classList.add('about-animated-item'));
document.body.classList.add('about-motion-ready');
// Each project gets its own scroll interval for the preview-to-details transition.
const projectScenes = cards.map(card => {
  card.removeAttribute('data-reveal');
  const scene = document.createElement('div');
  scene.className = 'project-scene';
  card.before(scene);
  scene.append(card);
  const body = document.createElement('div');
  body.className = 'project-body';
  body.append(...card.childNodes);
  card.append(body);
  const description = body.querySelector('.project-description');
  if (description) card.classList.add('project-with-description');
  const longCopy = !!description && description.querySelectorAll('p').length > 2;
  if (longCopy) scene.classList.add('project-long-copy');
  return { card, scene, body, description, longCopy, top: 0, travel: 1 };
});
document.body.classList.add('project-motion-ready');
function measureProjects() {
  projectScenes.forEach(project => {
    const height = Math.max(mobileLayout.matches ? 380 : 480,
      (project.description?.offsetHeight || 0) + 110);
    project.body.style.setProperty('--project-body-height', `${height}px`);
    project.top = Math.min(60, innerHeight - height - 20);
    project.travel = Math.max(360, innerHeight * 0.7);
    project.scene.style.setProperty('--project-scene-height', `${height + project.travel}px`);
    project.card.style.setProperty('--project-top', `${project.top}px`);
  });
}
const heroScene = document.createElement('div');
heroScene.className = 'hero-scroll-scene';
hero.before(heroScene);
heroScene.append(hero);
document.body.classList.add('hero-scroll-ready');
let heroTop = 0;
let heroTravel = 1;
function measureHero() {
  measureProjects();
  heroTop = Math.min(0, innerHeight - hero.offsetHeight - 12);
  heroTravel = Math.max(360, innerHeight * 0.85);
  heroScene.style.setProperty('--hero-top', `${heroTop}px`);
  heroScene.style.setProperty('--hero-scene-height', `${hero.offsetHeight + heroTravel}px`);
  // Bring the next section over the fading hero instead of leaving a blank interval.
  workSection.style.setProperty('--hero-overlap', `${Math.max(0, hero.offsetHeight - 100)}px`);
  requestScroll();
}
let framePending = false;
function renderScroll() {
  framePending = false;
  const maximum = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', maximum > 0 ? scrollY / maximum : 0);
  const progress = reducedMotion.matches ? 0 : Math.max(0, Math.min(1,
    (heroTop - heroScene.getBoundingClientRect().top) / heroTravel
  ));
  hero.style.setProperty('--hero-scroll', progress.toFixed(4));
  const aboutProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1,
    (innerHeight * 0.9 - aboutSection.getBoundingClientRect().top) / (innerHeight * 0.55)
  ));
  aboutSection.style.setProperty('--about-reveal', aboutProgress.toFixed(4));
  aboutItems.forEach(element => {
    // Use the layout position so transforms never feed back into the scroll timing.
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1,
      (innerHeight * 0.94 - (top - scrollY)) / (innerHeight * 0.34)
    ));
    element.style.setProperty('--item-reveal', progress.toFixed(4));
  });
  projectScenes.forEach((project, index) => {
    // Perzo starts revealing during the handoff, before reaching its sticky position.
    const flowingCopy = mobileLayout.matches && project.longCopy;
    const start = flowingCopy ? innerHeight * 0.9
      : index === 0 ? Math.max(project.top, innerHeight * 0.55) : project.top;
    const duration = flowingCopy ? innerHeight * 0.45 : project.travel * 0.85 + start - project.top;
    const progress = Math.max(0, Math.min(1,
      (start - project.scene.getBoundingClientRect().top) / duration
    ));
    const eased = progress * progress * (3 - 2 * progress);
    project.card.style.setProperty('--project-reveal', eased.toFixed(4));
    project.card.style.setProperty('--project-details', Math.max(0, Math.min(1, (eased - 0.1) / 0.65)).toFixed(4));
  });
}
function requestScroll() {
  if (!framePending) { framePending = true; requestAnimationFrame(renderScroll); }
}
addEventListener('scroll', requestScroll, { passive: true });
addEventListener('resize', measureHero, { passive: true });
addEventListener('load', measureHero, { once: true });
reducedMotion.addEventListener('change', measureHero);
if ('ResizeObserver' in window) new ResizeObserver(measureHero).observe(hero);
document.fonts.ready.then(measureHero);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -45px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  document.body.classList.add('motion-ready');
  // Keyboard navigation must never land on an invisible control.
  document.addEventListener('focusin', event => {
    event.target.closest('[data-reveal]')?.classList.add('visible');
  });
}
measureHero();
renderScroll();
