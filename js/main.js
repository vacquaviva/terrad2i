const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const SITE_ASSET_VERSION = '20260831-cuny-page';

async function loadJSON(path) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${path}${separator}v=${SITE_ASSET_VERSION}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function initNavigation() {
  const toggle = $('.menu-toggle');
  const nav = $('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => {
    if (event.target.matches('a')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

async function initSlider() {
  const root = $('[data-slider]');
  if (!root) return;
  const items = await loadJSON('data/slider.yml');
  const stage = $('.hero-slides', root);
  const copy = $('.hero-copy', root);
  const status = $('.slide-status', root);
  let index = 0;
  let timer;
  stage.innerHTML = items.map((item, i) => `<div class="hero-slide ${i === 0 ? 'is-active' : ''}" aria-hidden="${i !== 0}"><img src="${item.image}" alt="${item.alt}"></div>`).join('');
  const render = () => {
    $$('.hero-slide', stage).forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    copy.innerHTML = `<p class="eyebrow">TerraD2I · Data to Insights</p><h1>${items[index].caption}</h1><p>${items[index].subcaption}</p>`;
    status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };
  const move = direction => { index = (index + direction + items.length) % items.length; render(); restart(); };
  const restart = () => {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => move(1), 6500);
  };
  $('.slider-prev', root).addEventListener('click', () => move(-1));
  $('.slider-next', root).addEventListener('click', () => move(1));
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
  render(); restart();
}

function projectMarkup(item, includeAnchor = false) {
  const id = includeAnchor ? ` id="${item.url.replace('#', '')}"` : '';
  return `<article class="project-card"${id} data-tags="${item.tags.join('|').toLowerCase()}">
    <img src="${item.image}" alt="${item.alt}" loading="lazy">
    <div class="card-body"><h3>${item.title}</h3><p>${item.description}</p></div>
  </article>`;
}

async function initFeaturedProjects() {
  const root = $('[data-featured-projects]');
  if (!root) return;
  const items = await loadJSON('data/projects.yml');
  root.innerHTML = items.filter(item => item.featured).slice(0, 4).map(item => projectMarkup(item)).join('');
}

async function initNews() {
  const root = $('[data-news]');
  if (!root) return;
  const items = await loadJSON('data/news.yml');
  const track = $('.news-track', root);
  track.innerHTML = items.map(item => `<article class="news-item"><time class="news-date" datetime="${item.date}">${new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})}</time><div><h3><a href="${item.url}">${item.title}</a></h3><p>${item.description}</p></div></article>`).join('');
}

async function initPeople() {
  const piRoot = $('[data-people-pi]');
  const memberRoot = $('[data-people-members]');
  if (!piRoot && !memberRoot) return;
  const people = await loadJSON('data/people.yml');
  const links = person => (person.links || []).map(link => {
    if (link.type === 'github') return `<a class="person-icon-link" href="${link.url}" target="_blank" rel="noopener" aria-label="${person.name} GitHub"><img src="assets/logo/github-mark-120px-plus_orig.png" alt=""></a>`;
    if (link.type === 'linkedin') return `<a class="person-icon-link" href="${link.url}" target="_blank" rel="noopener" aria-label="${person.name} LinkedIn"><img src="assets/logo/linkedin-logo_orig.png" alt=""></a>`;
    return `<a class="person-text-link" href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`;
  }).join('');
  const role = person => [person.position, person.affiliation].filter(Boolean).join(', ');
  const bio = person => person.bio.split(/\n\s*\n/).map(paragraph => `<p>${paragraph}</p>`).join('');
  const pi = people.find(person => person.group === 'pi');
  if (piRoot) piRoot.innerHTML = `<article class="pi-card"><img src="${pi.photo}" alt="${pi.alt}"><div class="card-body"><p class="eyebrow">Principal Investigator</p><h2>${pi.name}</h2><p class="person-position">${role(pi)}</p>${bio(pi)}<div class="person-links">${links(pi)}</div></div></article>`;
  if (memberRoot) memberRoot.innerHTML = people.map(person => `<article class="person-card"><img src="${person.photo}" alt="${person.alt}" loading="lazy"><div class="card-body"><h3>${person.name}</h3><p class="person-position">${role(person)}</p>${bio(person)}<div class="person-links">${links(person)}</div></div></article>`).join('');
}

async function initProjects() {
  const root = $('[data-projects]');
  if (!root) return;
  const items = await loadJSON('data/projects.yml');
  const filters = $('[data-project-filters]');
  root.innerHTML = items.map(item => projectMarkup(item, true)).join('');
  if (!filters) return;
  const tags = [...new Set(items.flatMap(item => item.tags))].sort();
  filters.innerHTML = `<button class="filter-button is-active" data-filter="all">All</button>${tags.map(tag => `<button class="filter-button" data-filter="${tag.toLowerCase()}">${tag}</button>`).join('')}`;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    $$('.filter-button', filters).forEach(item => item.classList.toggle('is-active', item === button));
    $$('.project-card', root).forEach(card => { card.hidden = button.dataset.filter !== 'all' && !card.dataset.tags.split('|').includes(button.dataset.filter); });
  });
}

function parseBibTeX(text) {
  return [...text.matchAll(/@\w+\s*\{[^,]+,([\s\S]*?)\n\}/g)].map(match => {
    const fields = {};
    for (const field of match[1].matchAll(/(\w+)\s*=\s*\{([\s\S]*?)\}\s*,?/g)) fields[field[1].toLowerCase()] = field[2].replace(/\s+/g, ' ').trim();
    return fields;
  });
}

async function initPublications() {
  const root = $('[data-publications]');
  if (!root) return;
  const response = await fetch(`data/publications.bib?v=${SITE_ASSET_VERSION}`, { cache: 'no-store' });
  const publications = parseBibTeX(await response.text()).sort((a, b) => Number(b.year) - Number(a.year));
  const input = $('[data-publication-search]');
  const render = query => {
    const filtered = publications.filter(pub => Object.values(pub).join(' ').toLowerCase().includes(query.toLowerCase()));
    if (!filtered.length) { root.innerHTML = '<p class="empty-state">No publications match that search.</p>'; return; }
    let year = '';
    root.innerHTML = filtered.map(pub => {
      const heading = pub.year !== year ? `<h2 class="pub-year">${year = pub.year}</h2>` : '';
      const venue = pub.journal || pub.publisher || '';
      const linkMap = [['url','Paper'], ['doi','DOI'], ['pdf','PDF'], ['code','Code'], ['data','Data']];
      const links = linkMap.filter(([key]) => pub[key]).map(([key,label]) => `<a href="${key === 'doi' ? `https://doi.org/${pub[key]}` : pub[key]}">${label}</a>`).join('');
      return `${heading}<article class="publication"><div><h3>${pub.title}</h3><p>${pub.author}</p><p class="pub-meta">${venue}${venue ? ' · ' : ''}${pub.year}${pub.keywords ? ` · ${pub.keywords}` : ''}</p></div><div class="pub-links">${links}</div></article>`;
    }).join('');
  };
  if (input) input.addEventListener('input', () => render(input.value));
  render('');
}

async function initResources() {
  const root = $('[data-resources]');
  if (!root) return;
  const items = await loadJSON('data/resources.yml');
  root.innerHTML = items.map((item, i) => `<article class="resource-card"><div class="resource-icon" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div><div><p class="eyebrow">${item.category}</p><h3>${item.title}</h3><p>${item.description}</p><a class="text-link" href="${item.url}">${item.linkLabel}</a></div></article>`).join('');
}

function setYear() { $$('[data-year]').forEach(node => node.textContent = new Date().getFullYear()); }

initNavigation();
setYear();
Promise.all([initSlider(), initFeaturedProjects(), initNews(), initPeople(), initProjects(), initPublications(), initResources()]).catch(error => {
  console.error(error);
  $$('[data-loading]').forEach(node => node.innerHTML = '<p class="empty-state">Content could not be loaded. Preview the site through a local web server, as described in the README.</p>');
});
