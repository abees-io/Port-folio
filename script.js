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

// Cache project elements once. Layout measurements run on resize, not each scroll.
const projects = cards.map(card => {
  const scene = document.createElement('div');
  scene.className = 'project-scene';
  card.before(scene);
  scene.append(card);

  const body = document.createElement('div');
  body.className = 'project-body';
  card.append(body);
  ['.project-art', '.project-info', '.project-note'].forEach(selector => {
    body.append(card.querySelector(selector));
  });
  const description = card.querySelector('.project-description');
  if (description) {
    body.append(description);
    card.classList.add('project-with-description');
  }
  return { card, scene, body, description, top: 0, travel: 1 };
});
document.body.classList.add('project-motion-ready');

let framePending = false;
let layoutDirty = true;

function measureProjects() {
  const minimumHeight = mobileLayout.matches ? 360 : 380;
  projects.forEach(project => {
    const descriptionHeight = project.description?.offsetHeight || 0;
    project.body.style.height = `${Math.max(minimumHeight, descriptionHeight + 100)}px`;
  });
  const heights = projects.map(project => project.card.offsetHeight);
  projects.forEach((project, index) => {
    project.top = Math.min(mobileLayout.matches ? 92 : 110, innerHeight - heights[index] - 20);
    project.card.style.setProperty('--project-top', `${project.top}px`);
    project.scene.style.setProperty('--project-height', `${heights[index]}px`);
  });
  projects.forEach((project, index) => {
    project.travel = Math.max(1, project.scene.offsetHeight - heights[index]);
  });
  layoutDirty = false;
}

function renderScroll() {
  framePending = false;
  if (layoutDirty) measureProjects();
  const maximum = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', maximum > 0 ? scrollY / maximum : 0);

  projects.forEach(project => {
    const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1,
      (project.top - project.scene.getBoundingClientRect().top) / (project.travel * 0.8)
    ));
    const eased = progress * progress * (3 - 2 * progress);
    project.card.style.setProperty('--project-reveal', String(eased));
    project.card.style.setProperty('--project-details', String(Math.max(0, Math.min(1, (eased - 0.15) / 0.65))));
  });
}

function requestScroll() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(renderScroll);
  }
}

function requestLayout() {
  layoutDirty = true;
  requestScroll();
}

addEventListener('scroll', requestScroll, { passive: true });
addEventListener('resize', requestLayout, { passive: true });
addEventListener('load', requestLayout, { once: true });
document.fonts.ready.then(requestLayout);
reducedMotion.addEventListener('change', requestLayout);

if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(requestLayout);
  projects.forEach(project => {
    if (project.description) observer.observe(project.description);
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading, .about-copy, .expertise-row, .contact-heading, .contact-bottom, .story-text, .story-caption')
    .forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${index % 2 * 85}ms`);
      observer.observe(element);
    });
  document.body.classList.add('motion-ready');
}

renderScroll();
