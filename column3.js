document.addEventListener('DOMContentLoaded', () => {
  loadAndPaginateArenaBlocks();
});

// Card colors sampled from The Surfer's Journal archive (archives.surfersjournal.com)
const CARD_COLORS = [
  '#B1DED3', '#FCE8F1', '#99DEC6', '#96916C', '#FFA400', '#FFF8A3', '#8BD6E6',
  '#AEC1CE', '#F2DEB7', '#009D53', '#6681B8', '#FDC621', '#F69169', '#294FDE',
  '#FEADB3', '#5CA35A', '#E6A042', '#2EA8FD', '#CEAC53', '#40B0A0', '#FCFF1A',
  '#B61B1F', '#E47C74', '#F3CBD5', '#93F19B', '#71A8BC', '#15C7C9', '#F95226',
  '#E1BAD6', '#5AC095', '#FABC71', '#3B7482', '#FC97A9', '#72A5F6', '#E23A88',
  '#6148A4', '#273886', '#FB8FC0', '#114D88', '#BD5E2E', '#362A57', '#761F23',
  '#D9B45B'
];

let lastColor = null;

// Random color, never the same twice in a row
function randomCardColor() {
  let c;
  do {
    c = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
  } while (c === lastColor && CARD_COLORS.length > 1);
  lastColor = c;
  return c;
}

// Pick dark or light text, whichever contrasts more with the card
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function needsLightText(hex) {
  const L = luminance(hex);
  const DARK = luminance('#1F1F1F');
  const LIGHT = luminance('#F5F3EB');
  return (LIGHT + 0.05) / (L + 0.05) > (L + 0.05) / (DARK + 0.05);
}

// ---------- Dithered image previews ----------
// The image is redrawn in two colours with Atkinson dithering:
// ink + card colour on light cards, card colour + paper on dark cards.
// Hovering shows the original. If the image can't be read (CORS),
// the original simply stays visible.

const DITHER_PIXEL = 1; // size of one dither dot, in CSS pixels
const INK = '#1F1F1F';
const PAPER = '#F5F3EB';

function createDitheredFigure(src, alt, cardColor) {
  const figure = document.createElement('div');
  figure.classList.add('arena-figure');

  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.alt = alt;
  img.decoding = 'async';
  img.onload = () => {
    try {
      const [dark, light] = needsLightText(cardColor) ? [cardColor, PAPER] : [INK, cardColor];
      const canvas = ditherToCanvas(img, figure.clientWidth || 320, dark, light);
      figure.insertBefore(canvas, img);
      figure.classList.add('is-dithered');
    } catch (e) {
      // leave the original image visible
    }
  };
  img.src = src;
  figure.appendChild(img);
  return figure;
}

function hexRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function ditherToCanvas(img, displayWidth, darkHex, lightHex) {
  const w = Math.max(1, Math.round(displayWidth / DITHER_PIXEL));
  const h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Greyscale with a gentle contrast boost
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
    g[i] = Math.min(255, Math.max(0, (l - 128) * 1.15 + 128));
  }

  // Atkinson error diffusion
  const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const v = g[i] < 128 ? 0 : 255;
      const err = (g[i] - v) / 8;
      g[i] = v;
      for (const [dx, dy] of spread) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny < h) g[ny * w + nx] += err;
      }
    }
  }

  const dark = hexRgb(darkHex), light = hexRgb(lightHex);
  for (let i = 0; i < w * h; i++) {
    const c = g[i] === 0 ? dark : light;
    px[i * 4] = c[0];
    px[i * 4 + 1] = c[1];
    px[i * 4 + 2] = c[2];
    px[i * 4 + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

let allBlocks = [];
let currentIndex = 0;
const batchSize = 10;

async function loadAndPaginateArenaBlocks() {
  const channelSlug = 'personal-feed-x77zoaxeieq';
  const perPage = 100;
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await fetch(
        `https://api.are.na/v2/channels/${channelSlug}/contents?per=${perPage}&page=${page}`
      );
      const data = await response.json();

      if (!data.contents || data.contents.length === 0) {
        hasMore = false;
        break;
      }

      allBlocks = allBlocks.concat(data.contents);
      page++;
    }

    // Sort by date (newest first)
    allBlocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Display the first batch
    renderNextBatch();

    // Add Load More button (only once)
    const column3 = document.getElementById('column3');
    if (!document.getElementById('loadMoreBtn')) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.id = 'loadMoreBtn';
      loadMoreBtn.textContent = 'Load more';
      loadMoreBtn.onclick = renderNextBatch;
      column3.appendChild(loadMoreBtn);
      if (currentIndex >= allBlocks.length) loadMoreBtn.remove();
    }
  } catch (error) {
    console.error('Error loading Are.na blocks:', error);
  }
}

function renderNextBatch() {
  const column3 = document.getElementById('column3');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  const batch = allBlocks.slice(currentIndex, currentIndex + batchSize);

  batch.forEach((item) => {
    const div = document.createElement('div');
    const blockType = (item.class || 'Other').toLowerCase();
    div.classList.add('arena-item', `is-${blockType}`);

    const cardColor = randomCardColor();
    div.style.setProperty('--card', cardColor);
    if (needsLightText(cardColor)) div.classList.add('is-dark');

    // Meta row: date
    const meta = document.createElement('div');
    meta.classList.add('arena-meta');

    const date = document.createElement('span');
    date.classList.add('arena-date');
    date.textContent = new Date(item.created_at).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    meta.appendChild(date);

    div.appendChild(meta);

    const isImageBlock = !!(item.image && item.image.display && item.image.display.url);
    const isTextBlock = item.class === 'Text' || (!isImageBlock && !!item.content);

    // --- IMAGE BLOCK: image -> title -> description (markdown)
    if (isImageBlock) {
      div.appendChild(createDitheredFigure(item.image.display.url, item.title || '', cardColor));

      if (item.title) {
        const title = document.createElement('h3');
        title.textContent = item.title;
        div.appendChild(title);
      }

      if (item.description) {
        const description = document.createElement('div');
        description.classList.add('arena-description');
        description.innerHTML = marked.parse(item.description);
        div.appendChild(description);
      }
    }

    // --- TEXT BLOCK: title -> description (markdown) -> content (markdown)
    else if (isTextBlock) {
      if (item.title) {
        const title = document.createElement('h3');
        title.textContent = item.title;
        div.appendChild(title);
      }

      if (item.description) {
        const description = document.createElement('div');
        description.classList.add('arena-description');
        description.innerHTML = marked.parse(item.description);
        div.appendChild(description);
      }

      if (item.content) {
        const textContent = document.createElement('div');
        textContent.classList.add('arena-text');
        textContent.innerHTML = marked.parse(item.content);
        div.appendChild(textContent);
      }
    }

    // --- OTHER BLOCK TYPES (optional fallback)
    else {
      if (item.title) {
        const title = document.createElement('h3');
        title.textContent = item.title;
        div.appendChild(title);
      }

      if (item.description) {
        const description = document.createElement('div');
        description.classList.add('arena-description');
        description.innerHTML = marked.parse(item.description);
        div.appendChild(description);
      }

      if (item.content) {
        const textContent = document.createElement('div');
        textContent.classList.add('arena-text');
        textContent.innerHTML = marked.parse(item.content);
        div.appendChild(textContent);
      }
    }

    // Source URL (keep if you want)
    if (item.source && item.source.url) {
      const sourceURL = document.createElement('a');
      sourceURL.href = item.source.url;
      sourceURL.textContent = 'Source';
      sourceURL.classList.add('source-link');
      sourceURL.target = '_blank';
      sourceURL.rel = 'noopener noreferrer';
      div.appendChild(sourceURL);
    }

    // Insert before the button (if it exists), else append
    if (loadMoreBtn) {
      column3.insertBefore(div, loadMoreBtn);
    } else {
      column3.appendChild(div);
    }
  });

  currentIndex += batchSize;

  // Hide the button if no more blocks
  if (currentIndex >= allBlocks.length) {
    document.getElementById('loadMoreBtn')?.remove();
  }
}
