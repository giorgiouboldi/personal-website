document.addEventListener('DOMContentLoaded', () => {
  fetchDataFromArena();
});

async function fetchDataFromArena() {
  try {
      let nextPage = 1;
      let allBlocks = [];

      while (true) {
          const response = await fetch(`https://api.are.na/v2/channels/personal-feed-x77zoaxeieq/contents?per=10&page=${nextPage}`);
          const data = await response.json();

          if (data.contents.length === 0) {
              // No more blocks to fetch
              break;
          }

          allBlocks = allBlocks.concat(data.contents);
          nextPage++;
      }

      const column3 = document.getElementById('column3');

      // Sort blocks from latest to oldest based on updated_at timestamp
      const sortedBlocks = allBlocks.sort((a, b) => {
          return new Date(b.updated_at) - new Date(a.updated_at);
      });

      sortedBlocks.forEach((item) => {
          const div = document.createElement('div');
          div.classList.add('arena-item');

          const date = document.createElement('h4');
          date.textContent = new Date(item.updated_at).toLocaleDateString();
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

          column3.appendChild(div);
      });
  } catch (error) {
      console.error('Error fetching data from are.na:', error);
  }
}
