export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Every external link on the site opens in a new tab.
export const BLANK = 'target="_blank" rel="noopener noreferrer"';
