// Desktop: a small "explosion" button in the bottom-left corner.
// Each click tilts every element a little more. Click too many times and
// the whole page falls apart, then pieces itself back together.
// Left alone for a few seconds, everything settles back into place.

(function () {
  const TARGETS = [
    '#column1 > h1', '.bio-sentence', '.last-updated', '#column1 > a',
    '#column2 > h1', '#column2 > p', '#column2 > .type-title', '#column2 > .data-item',
    '#column3 > h1', '#column3 > p', '#column3 > .arena-item', '#loadMoreBtn'
  ].join(',');

  const BURST =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round">' +
    '<polygon points="12.00,2.50 13.19,7.56 16.10,4.90 15.25,8.75 20.49,7.10 16.44,10.81 20.60,12.00 16.44,13.19 19.97,16.60 15.25,15.25 16.00,18.93 13.19,16.44 12.00,21.90 10.81,16.44 7.80,19.27 8.75,15.25 3.86,16.70 7.56,13.19 3.90,12.00 7.56,10.81 3.60,7.15 8.75,8.75 7.65,4.47 10.81,7.56" />' +
    '</svg>';

  const MAX_LEVEL = 4;      // clicks before the page gives way
  const CALM_AFTER = 5000;  // ms without clicks before things settle
  let level = 0;
  let calmTimer = null;
  let busy = false;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Each click shakes harder: angles and shifts grow with the level
  function explode() {
    const k = level;
    document.querySelectorAll(TARGETS).forEach((el) => {
      el.style.setProperty('--tilt', rand(-4, 4) * k + 'deg');
      el.style.setProperty('--shift', rand(-6, 6) * k + 'px');
      el.style.setProperty('--delay', Math.round(rand(0, 180)) + 'ms');
    });
    document.body.classList.add('is-exploded');
  }

  // One click too many: everything falls off the page, then rebuilds
  function collapse(btn) {
    busy = true;
    document.querySelectorAll(TARGETS).forEach((el) => {
      el.style.setProperty('--tilt', rand(-60, 60) + 'deg');
      el.style.setProperty('--shift', window.innerHeight * rand(1.1, 1.6) + 'px');
      el.style.setProperty('--delay', Math.round(rand(0, 450)) + 'ms');
    });
    document.body.classList.add('is-exploded', 'is-collapsing');

    setTimeout(() => {
      document.body.classList.remove('is-collapsing');
      settle(btn);
      setTimeout(() => { busy = false; }, 900);
    }, 2200);
  }

  function settle(btn) {
    clearTimeout(calmTimer);
    level = 0;
    document.querySelectorAll(TARGETS).forEach((el) => {
      el.style.setProperty('--delay', Math.round(rand(0, 300)) + 'ms');
    });
    document.body.classList.remove('is-exploded');
    btn.setAttribute('aria-pressed', 'false');
    btn.style.removeProperty('--level');
  }

  function start() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'explode-btn';
    btn.setAttribute('aria-label', 'Shake the page');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = BURST;

    btn.addEventListener('click', () => {
      if (busy) return;
      clearTimeout(calmTimer);
      level += 1;
      btn.setAttribute('aria-pressed', 'true');
      btn.style.setProperty('--level', level);

      if (level > MAX_LEVEL) {
        collapse(btn);
      } else {
        explode();
        calmTimer = setTimeout(() => settle(btn), CALM_AFTER);
      }
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
