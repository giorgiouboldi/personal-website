document.addEventListener('DOMContentLoaded', () => {
  fetchParagraphsAndLinks();
});

function fetchParagraphsAndLinks() {
  const column1 = document.getElementById('column1');

  // First paragraph
  const paragraph1 = document.createElement('p');
  paragraph1.innerHTML = 'Giorgio Uboldi (1987) is a designer, researcher and teacher.<br>He co-founded <a href="https://www.example-link.com" target="_blank">Calibro</a>, a design studio based in Milan focused on tailoring visual tools to explore and visualize data, complex information and archives.';
  column1.appendChild(paragraph1);

   // Second paragraph
   const paragraph2 = document.createElement('p');
   paragraph2.innerHTML = 'In this website you can find a list of things I did and my personal feed.';
   column1.appendChild(paragraph2);

  // Line break
  const lineBreak = document.createElement('br');
  column1.appendChild(lineBreak);

  // Email link on a new line
  const emailLink = document.createElement('a');
  emailLink.href = 'mailto:giorgio@calib.ro';
  emailLink.textContent = 'E-mail';
  column1.appendChild(emailLink);

  // Line break
  column1.appendChild(lineBreak.cloneNode());

  // Website link on a new line
  const websiteLink = document.createElement('a');
  websiteLink.href = 'https://www.are.na/giorgio-calibro';
  websiteLink.textContent = 'Arena';
  column1.appendChild(websiteLink);
  
}
