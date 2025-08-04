document.addEventListener('DOMContentLoaded', () => {
  loadAndPaginateArenaBlocks();
});

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
      const response = await fetch(`https://api.are.na/v2/channels/${channelSlug}/contents?per=${perPage}&page=${page}`);
      const data = await response.json();
      if (data.contents.length === 0) {
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

    // Add Load More button
    const column3 = document.getElementById('column3');
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.textContent = 'Load more';
    loadMoreBtn.style.margin = '24px 0';
    loadMoreBtn.style.padding = '6px 12px';
    loadMoreBtn.style.fontSize = '14px';
    loadMoreBtn.style.cursor = 'pointer';
    loadMoreBtn.style.backgroundColor = '#000';
    loadMoreBtn.style.color = '#fff';
    loadMoreBtn.style.border = 'none';
    loadMoreBtn.style.borderRadius = '4px';
    loadMoreBtn.onclick = renderNextBatch;
    column3.appendChild(loadMoreBtn);

  } catch (error) {
    console.error('Error loading Are.na blocks:', error);
  }
}

function renderNextBatch() {
  const column3 = document.getElementById('column3');

  const batch = allBlocks.slice(currentIndex, currentIndex + batchSize);
  batch.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('arena-item');

    const date = document.createElement('h4');
    date.textContent = new Date(item.created_at).toLocaleDateString();
    div.appendChild(date);

    const title = document.createElement('h3');
    title.textContent = item.title;
    div.appendChild(title);

    if (item.image && item.image.display.url) {
      const image = document.createElement('img');
      image.src = item.image.display.url;
      image.alt = item.title;
      div.appendChild(image);
    } else if (item.content) {
      const textContent = document.createElement('p');
      textContent.textContent = item.content;
      div.appendChild(textContent);
    }

    if (item.description) {
      const description = document.createElement('p');
      description.textContent = item.description;
      div.appendChild(description);
    }

    if (item.source && item.source.url) {
      const sourceURL = document.createElement('a');
      sourceURL.href = item.source.url;
      sourceURL.textContent = 'Source URL';
      sourceURL.target = '_blank';
      div.appendChild(sourceURL);
    }

    column3.insertBefore(div, document.getElementById('loadMoreBtn'));
  });

  currentIndex += batchSize;

  // Hide the button if no more blocks
  if (currentIndex >= allBlocks.length) {
    document.getElementById('loadMoreBtn')?.remove();
  }
}
