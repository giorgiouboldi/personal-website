// Mobile: Experiences and Feed collapse into two bands docked at the bottom
// of the screen that open on tap.
// Only one is open at a time. Opening deals the content in, one item after
// another; the Feed band shows a strip of the cards' colours that jumps when
// tapped. On desktop the toggles are hidden and nothing changes.

(function () {
  const MOBILE = window.matchMedia('(max-width: 600px)');
  const sections = [];

  function setup(column, label, kind) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-toggle toggle-' + kind;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', column.id);
    btn.innerHTML =
      '<span class="toggle-label">' + label + '</span>' +
      '<span class="toggle-meta"></span>' +
      '<span class="toggle-icon" aria-hidden="true"></span>';
    column.insertBefore(btn, column.firstChild);
    column.classList.add('is-collapsible', 'is-collapsed');

    const section = { column, btn, kind, meta: btn.querySelector('.toggle-meta') };
    sections.push(section);

    btn.addEventListener('click', () => toggle(section));

    // Content arrives asynchronously: keep the meta and stagger indices current
    new MutationObserver(() => refresh(section)).observe(column, { childList: true });
    refresh(section);
  }

  function refresh(section) {
    const { column, meta, kind } = section;

    // Index every content child so it can be dealt in with a delay
    let i = 0;
    for (const child of column.children) {
      if (child.classList.contains('section-toggle') || child.tagName === 'H1') continue;
      child.style.setProperty('--i', Math.min(i++, 14));
      if (kind === 'feed' && !child.style.getPropertyValue('--rot')) {
        child.style.setProperty('--rot', (Math.random() * 6 - 3).toFixed(2) + 'deg');
      }
    }

    if (kind === 'feed') {
      const cards = [...column.querySelectorAll('.arena-item')].slice(0, 10);
      if (meta.children.length !== cards.length) {
        meta.innerHTML = '';
        cards.forEach((card, k) => {
          const chip = document.createElement('i');
          chip.style.background = card.style.getPropertyValue('--card');
          chip.style.setProperty('--k', k);
          meta.appendChild(chip);
        });
      }
    }
  }

  function setOpen(section, open) {
    section.column.classList.toggle('is-collapsed', !open);
    section.column.classList.toggle('is-open', open);
    section.btn.setAttribute('aria-expanded', String(open));
  }

  function toggle(section) {
    const opening = section.column.classList.contains('is-collapsed');
    sections.forEach((s) => setOpen(s, false));

    document.body.dataset.open = opening ? section.kind : 'none';

    if (opening) {
      // Little jump on the colour strip, then deal the content in
      section.btn.classList.remove('is-poked');
      void section.btn.offsetWidth; // restart the animation
      section.btn.classList.add('is-poked');

      setOpen(section, true);
      requestAnimationFrame(() => {
        section.btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function start() {
    setup(document.getElementById('column2'), 'Experiences', 'experiences');
    setup(document.getElementById('column3'), 'Feed', 'feed');
    document.body.dataset.open = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
