document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('copy-email').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try { await navigator.clipboard.writeText('abeees65lop@gmail.com'); status.textContent = 'Email copied!'; }
  catch { status.textContent = 'Please select and copy the email address above.'; }
  setTimeout(() => { status.textContent = ''; }, 5000);
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let paused = false;
const revealTargets = document.querySelectorAll('.section-heading, .about-grid > div, .expertise-row, .contact-heading, .contact-bottom, .story-text, .story-caption');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  revealTargets.forEach((element, index) => { element.classList.add('reveal'); element.style.setProperty('--reveal-delay', `${index % 2 * 85}ms`); observer.observe(element); });
  document.body.classList.add('motion-ready');
}
const portrait = document.querySelector('.portrait-area');
const projects = [...document.querySelectorAll('.project')];
let ticking = false;
function renderScroll() {
  ticking = false;
  const maximum = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', maximum > 0 ? scrollY / maximum : 0);
  const motionEnabled = !paused && !reducedMotion.matches;
  portrait.style.setProperty('--portrait-y', motionEnabled && innerWidth > 700 ? `${Math.min(scrollY * .085, 45)}px` : '0px');
  projects.forEach((card, index) => {
    const next = projects[index + 1];
    if (!motionEnabled || innerWidth <= 700 || !next) { card.style.transform = ''; return; }
    const progress = Math.max(0, Math.min(1, (innerHeight * .72 - next.getBoundingClientRect().top) / (innerHeight * .55)));
    card.style.transform = `scale(${1 - progress * .035})`;
  });
}
function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(renderScroll); } }
motionButton.addEventListener('click', () => {
  paused = !paused;
  document.body.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  requestScroll();
});
addEventListener('scroll', requestScroll, { passive: true });
addEventListener('resize', requestScroll, { passive: true });
reducedMotion.addEventListener('change', requestScroll);
renderScroll();
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-nav');
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
  if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
matchMedia('(max-width: 700px)').addEventListener('change', closeMenu);
