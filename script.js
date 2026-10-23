'use strict';

const email = 'abeees65lop@gmail.com';
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
    note.textContent = 'Project showcase coming soon · Concept preview';
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
  card.querySelector('.preview-label').textContent = `SELECTED PROJECT / ${String(project.slot).padStart(2, '0')}`;
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
const heroScene = document.createElement('div');
heroScene.className = 'hero-scroll-scene';
hero.before(heroScene);
heroScene.append(hero);
document.body.classList.add('hero-scroll-ready');
let heroTop = 0;
let heroTravel = 1;
function measureHero() {
  heroTop = Math.min(0, innerHeight - hero.offsetHeight - 12);
  heroTravel = Math.max(360, innerHeight * 0.85);
  heroScene.style.setProperty('--hero-top', `${heroTop}px`);
  heroScene.style.setProperty('--hero-scene-height', `${hero.offsetHeight + heroTravel}px`);
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
