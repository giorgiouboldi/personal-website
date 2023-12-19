function toggleAccordion(accordionId) {
    const accordionContent = document.getElementById(`accordion-content${accordionId.slice(-1)}`);
    accordionContent.style.display === 'none' || accordionContent.style.display === ''
        ? (accordionContent.style.display = 'flex')
        : (accordionContent.style.display = 'none');
}

document.addEventListener("DOMContentLoaded", function () {
    const apiUrl1 = "https://api.are.na/v2/channels/archival-interfaces";
    const apiUrl2 = "https://api.are.na/v2/channels/strumentalia";
    const perPage = 10;

    // Fetch data for the first column
    fetchAndDisplayContent(apiUrl1, "column1");

    // Fetch data for the second column
    fetchAndDisplayContent(apiUrl2, "column2");

    // Function to fetch and display content
    function fetchAndDisplayContent(apiUrl, columnId, page = 1) {
        fetch(`${apiUrl}?page=${page}&per=${perPage}`)
            .then(response => response.json())
            .then(data => {
                const sortedContent = sortContentByDate(data.contents);
                displayContent(columnId, sortedContent);

                if (data.pagination && data.pagination.next) {
                    fetchAndDisplayContent(apiUrl, columnId, page + 1);
                }
            })
            .catch(error => console.error(`Error fetching data for ${columnId}:`, error));
    }

    // Function to sort content by date (newest to oldest)
    function sortContentByDate(content) {
        return content.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Function to display content in a specific column
    function displayContent(columnId, content) {
        const column = document.getElementById(columnId);
        content.forEach(item => {
            const contentItem = document.createElement("div");
            const blockLink = item.permalink;
            const sourceLink = item.source ? `<p>Source: <a href="${item.source.url}" target="_blank">${item.source.title}</a></p>` : '';
            
            contentItem.innerHTML = `<h2><a href="${blockLink}" target="_blank">${item.title}</a></h2>${sourceLink}${item.content_html}`;
            column.appendChild(contentItem);
        });
    }

    // Attach the toggleAccordion function to the global window object
    window.toggleAccordion = toggleAccordion;
});
