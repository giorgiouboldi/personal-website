// Colours every period and the dots of i / j with the feed palette.
// Periods are recoloured directly; for i and j a square is laid exactly
// over the glyph's own dot (measured from the Geist font files), so the
// text stays real text: copy, search and screen readers are unaffected.

(function () {
  const PALETTE = typeof CARD_COLORS !== 'undefined' ? CARD_COLORS : ['#FFA400'];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'BUTTON', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
  const DOTTED = /[.ij]/;

  function hexToRgb(hex) {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }

  function lum([r, g, b]) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function contrast(a, b) {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  }

  // Nearest non-transparent background behind an element
  function backgroundOf(el) {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0)) return m.slice(0, 3).map(Number);
    }
    return [241, 241, 238];
  }

  // Random palette colour that stays visible on this background
  function pickColor(bg) {
    const usable = PALETTE.filter((c) => contrast(hexToRgb(c), bg) >= 1.6);
    const list = usable.length ? usable : PALETTE;
    return list[Math.floor(Math.random() * list.length)];
  }

  function shouldSkip(el) {
    if (!el || el.closest('.dot')) return true;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (SKIP_TAGS.has(n.tagName)) return true;
    }
    const cs = getComputedStyle(el);
    // Uppercase text has no i-dots; synthetic italics would misplace the overlay
    return cs.textTransform === 'uppercase' || cs.fontStyle !== 'normal';
  }

  function processTextNode(node) {
    const text = node.nodeValue;
    if (!DOTTED.test(text)) return;
    const parent = node.parentElement;
    if (shouldSkip(parent)) return;

    const bg = backgroundOf(parent);
    const isMono = /mono/i.test(getComputedStyle(parent).fontFamily);
    const frag = document.createDocumentFragment();

    text.split(/([.ij])/).forEach((part) => {
      if (!part) return;
      if (part === '.' || part === 'i' || part === 'j') {
        const span = document.createElement('span');
        span.className = 'dot dot-' + (part === '.' ? 'period' : part) + (isMono ? ' is-mono' : '');
        span.style.setProperty('--dot', pickColor(bg));
        span.textContent = part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });

    node.replaceWith(frag);
  }

  function processTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      processTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(processTextNode);
  }

  function start() {
    processTree(document.body);
    // Experiences and Feed are loaded later, so keep watching
    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && n.classList.contains('dot')) return;
        processTree(n);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
