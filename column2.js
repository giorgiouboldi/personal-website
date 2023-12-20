document.addEventListener('DOMContentLoaded', fetchData);

async function fetchData() {
  try {
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9ETlYmG0t-YyL3c_hkRjhKt-B7tuUK57UByl1ehcn4QW_inK_zm7lu89uBLZhTrd3mWKTBd0-tRxm/pub?gid=477744527&single=true&output=tsv');
    const data = await response.text();

    // Split data into rows
    const rows = data.split('\n');

    // Get the container element
    const container = document.getElementById('column2');

    // Initialize the previousType variable
    let previousType = null;

    // Loop through rows starting from the second row (index 1)
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split('\t');
      const currentType = columns[0]; // Assuming "Type" is the first column

      // Check if Type has changed
      if (currentType !== previousType) {
        // Add a new div with the Type as the title
        const titleDiv = document.createElement('h1');
        titleDiv.classList.add('type-title');
        titleDiv.textContent = currentType;
        container.appendChild(titleDiv);
      }

      // Create and append content to the div
      const div = document.createElement('div');
      div.classList.add('data-item');

      // Start from index 1 to skip the "Type" column in the content
      const year = columns[1]; // Assuming "Year" is the second column
      const url = columns[3]; // Assuming "URL" is the fourth column
      const text = columns[2]; // Assuming "Text" is the third column

      const span1 = document.createElement('span');
      span1.classList.add('column-1');
      span1.textContent = year;
      div.appendChild(span1);

      const span2 = document.createElement('span');
      span2.classList.add('column-2');

      // Check if the "URL" column has a value
      if (url.trim() !== '') {
        const link = document.createElement('a');
        link.classList.add('url-link');
        link.href = url;
        link.target = '_blank'; // Open link in a new tab
        link.textContent = text;
        span2.appendChild(link);
      } else {
        span2.textContent = text;
      }

      div.appendChild(span2);

      // Append the div to the container
      container.appendChild(div);

      // Update the previousType variable
      previousType = currentType;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
