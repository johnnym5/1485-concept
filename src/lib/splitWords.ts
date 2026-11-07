export function splitElementIntoWords(element: HTMLElement) {
  if (element.dataset.wordRevealReady === 'true') {
    return Array.from(element.querySelectorAll<HTMLSpanElement>('.site-reveal-word'));
  }

  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  const parts = text ? text.split(' ') : [];
  const words: HTMLSpanElement[] = [];

  if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', text);
  element.replaceChildren();
  element.dataset.wordRevealReady = 'true';

  parts.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'site-reveal-word';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    words.push(span);
    element.append(span);
    if (index < parts.length - 1) element.append(document.createTextNode(' '));
  });

  return words;
}
