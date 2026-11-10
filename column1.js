document.addEventListener('DOMContentLoaded', () => {
  fetchParagraphsAndLinks();
});

function fetchParagraphsAndLinks() {
  const column1 = document.getElementById('column1');

  // First paragraph
  const paragraph1 = document.createElement('p');
  paragraph1.innerHTML = [
    'Giorgio Uboldi (1987) is a designer, researcher and educator.',
    'He co-founded <a href="https://www.calib.ro/" target="_blank">Calibro</a>, a design studio based in Milan focused on tailoring visual tools to explore and visualize data, complex information and archives.',
    'He teaches at Design Academy Eindhoven, at UNIRSM in San Marino and at Scuola Bauer in Milan.'
  ].map((sentence) => `<span class="bio-sentence">${sentence}</span>`).join(' ');
  column1.appendChild(paragraph1);

  // Line break
  const lineBreak = document.createElement('br');
  column1.appendChild(lineBreak);

  // Email link on a new line
  const emailLink = document.createElement('a');
  emailLink.href = 'mailto:giorgio@calib.ro';
  emailLink.textContent = 'E-mail';
  emailLink.prepend(icon(ICON_MAIL));
  column1.appendChild(emailLink);

  // Line break
  column1.appendChild(lineBreak.cloneNode());

  // Website link on a new line
  const websiteLink = document.createElement('a');
  websiteLink.href = 'https://www.are.na/giorgio-calibro';
  websiteLink.textContent = 'Arena';
  websiteLink.target = '_blank';
  websiteLink.rel = 'noopener noreferrer';
  websiteLink.prepend(icon(ICON_ARENA));
  column1.appendChild(websiteLink);

  
}

// Small outline icons next to the contact links
const ICON_MAIL = {
  viewBox: '0 0 16 16',
  strokeWidth: 1,
  paths:
    '<rect x="1.5" y="3.5" width="13" height="9" />' +
    '<path d="M1.5 4.5 L8 9 L14.5 4.5" />'
};

// Are.na icon from Arcticons by Donnnno (CC BY-SA 4.0)
// https://github.com/Arcticons-Team/Arcticons
const ICON_ARENA = {
  viewBox: '3 3 42 42',
  strokeWidth: 3,
  paths:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 35.258V12.742M24 29.629L4.5 18.371m0 11.258L24 18.371m9.75 16.887V12.742m9.75 16.887L24 18.371m0 11.258l19.5-11.258" />'
};

function icon({ viewBox, strokeWidth, paths }) {
  const span = document.createElement('span');
  span.className = 'link-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML =
    `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">` +
    paths + '</svg>';
  return span;
}
