import { escapeHtml, BLANK } from "./html.js";
import type { SiteConfig } from "./types.js";

interface LayoutOptions {
  site: SiteConfig;
  title: string;
  description?: string;
  permalink: string;
  bodyHtml: string;
  extraHead?: string;
}

// Inlined so the theme is applied before first paint (no flash of the wrong theme).
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

function socialLinks(site: SiteConfig): string {
  const links: string[] = [`<a href="mailto:${escapeHtml(site.email)}" ${BLANK}>email</a>`];
  if (site.x_username) {
    links.push(`<a href="https://x.com/${escapeHtml(site.x_username)}" ${BLANK}>x</a>`);
  }
  if (site.github_username) {
    links.push(
      `<a href="https://github.com/${escapeHtml(site.github_username)}" ${BLANK}>github</a>`
    );
  }
  if (site.scholar_userid) {
    links.push(
      `<a href="https://scholar.google.com/citations?user=${escapeHtml(site.scholar_userid)}" ${BLANK}>google scholar</a>`
    );
  }
  return links.join(" / ");
}

export function layout(opts: LayoutOptions): string {
  const { site, title, description, permalink, bodyHtml, extraHead } = opts;
  const pageTitle = permalink === "/" ? site.title : `${title} — ${site.title}`;

  const navHtml = site.nav
    .map((item) => {
      const active = item.href === permalink;
      return `<a href="${item.href}"${active ? ' aria-current="page"' : ""}>${escapeHtml(item.title)}</a>`;
    })
    .join(" / ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description ?? site.description)}">
<link rel="stylesheet" href="/assets/css/style.css">
${extraHead ?? ""}
<script>${NO_FLASH_SCRIPT}</script>
</head>
<body>
<header class="site-header">
<a class="site-name" href="/">${escapeHtml(site.name)}</a>
<nav class="site-nav">${navHtml}</nav>
<button id="theme-toggle" type="button" aria-label="Toggle dark mode">◐</button>
</header>
<main class="site-main">
${bodyHtml}
</main>
<footer class="site-footer">
<p>${socialLinks(site)}</p>
${site.footer_text?.trim() ? `<p class="footer-text">${site.footer_text.trim()}</p>` : ""}
</footer>
<script src="/assets/js/theme-toggle.js" defer></script>
</body>
</html>
`;
}
