/**
 * A highly lightweight custom markdown parser to avoid external dependencies.
 * Compiles basic markdown syntax to semantic HTML.
 * @param {string} mdText - Raw markdown text.
 * @returns {string} Compiled HTML content.
 */
export function parseMarkdown(mdText) {
  if (!mdText) return '';

  let html = mdText
    // Clean carriage returns
    .replace(/\r\n/g, '\n')
    // Escape HTML entities to prevent XSS while editing
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Handle Headers
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

  // Handle Horizontal Rules
  html = html.replace(/^---$/gm, '<hr />');

  // Handle Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Handle Bullet points (handle nested structures roughly)
  // Let's replace list items first
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  
  // Wrap consecutive <li> elements in <ul>
  // A simple regex approach: find groups of <li> and wrap them
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Handle linebreaks / paragraphs
  // Split by double newlines to find paragraphs (excluding tags)
  const blocks = html.split(/\n\n+/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    // If block starts/ends with HTML tags, don't wrap in <p>
    if (trimmed.startsWith('<h') || trimmed.startsWith('<u') || trimmed.startsWith('<hr') || trimmed.startsWith('<p')) {
      return trimmed;
    }
    // Convert single newlines inside block to <br />
    const withBreaks = trimmed.replace(/\n/g, '<br />');
    return `<p>${withBreaks}</p>`;
  });

  return formattedBlocks.join('\n');
}
