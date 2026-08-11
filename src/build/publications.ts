import { escapeHtml, BLANK } from "./html.js";
import type { BibEntry, CoauthorMap, SiteConfig } from "./types.js";

function splitAuthors(raw: string): string[] {
  return raw
    .split(/\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatAuthor(raw: string, site: SiteConfig, coauthors: CoauthorMap): string {
  const commaIdx = raw.indexOf(",");
  const last = commaIdx === -1 ? raw : raw.slice(0, commaIdx).trim();
  const first = commaIdx === -1 ? "" : raw.slice(commaIdx + 1).trim();
  const full = first ? `${first} ${last}` : last;
  const lastWord = last.split(/\s+/).pop() ?? last;
  const isOwner = site.name.toLowerCase().includes(lastWord.toLowerCase());

  let html = escapeHtml(full);
  const candidates = coauthors[lastWord.toLowerCase()];
  if (candidates) {
    const match = candidates.find((c) =>
      c.firstname.some(
        (f) =>
          first.toLowerCase().startsWith(f.toLowerCase()) ||
          f.toLowerCase().startsWith(first.toLowerCase())
      )
    );
    if (match) html = `<a href="${escapeHtml(match.url)}" ${BLANK}>${html}</a>`;
  }

  return isOwner ? `<strong>${html}</strong>` : html;
}

function joinAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors.join("");
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")}, and ${authors[authors.length - 1]}`;
}

export function renderPublications(
  entries: BibEntry[],
  site: SiteConfig,
  coauthors: CoauthorMap,
  introHtml = ""
): string {
  const byYear = new Map<string, BibEntry[]>();
  for (const entry of entries) {
    const year = entry.fields.year ?? "n.d.";
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(entry);
  }

  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  const sections = years
    .map((year) => {
      const items = byYear
        .get(year)!
        .map((entry) => renderEntry(entry, site, coauthors))
        .join("\n");
      return `<section class="pub-year"><h2>${escapeHtml(year)}</h2>\n${items}\n</section>`;
    })
    .join("\n");

  return `<h1>publications</h1>\n${introHtml}\n${sections}`;
}

function renderEntry(entry: BibEntry, site: SiteConfig, coauthors: CoauthorMap): string {
  const f = entry.fields;
  const titleText = escapeHtml(f.title ?? entry.key);
  const titleHref = f.doi ? `https://doi.org/${f.doi}` : (f.pdf ?? f.url);
  const titleHtml = titleHref
    ? `<a href="${escapeHtml(titleHref)}" ${BLANK}>${titleText}</a>`
    : titleText;

  const authorsHtml = f.author
    ? joinAuthors(splitAuthors(f.author).map((a) => formatAuthor(a, site, coauthors)))
    : "";

  const venue = f.journal ?? f.booktitle ?? "";
  const venueParts = [venue, f.volume ? `vol. ${f.volume}` : "", f.pages ? `pp. ${f.pages}` : ""]
    .filter(Boolean)
    .join(", ");

  const links: string[] = [];
  if (f.doi) links.push(`<a href="https://doi.org/${escapeHtml(f.doi)}" ${BLANK}>doi</a>`);
  if (f.pdf) links.push(`<a href="${escapeHtml(f.pdf)}" ${BLANK}>pdf</a>`);
  if (f.code) links.push(`<a href="${escapeHtml(f.code)}" ${BLANK}>code</a>`);

  return `<div class="pub-entry">
<p class="pub-title">${titleHtml}</p>
${authorsHtml ? `<p class="pub-authors">${authorsHtml}</p>` : ""}
${venueParts ? `<p class="pub-venue"><em>${escapeHtml(venueParts)}</em></p>` : ""}
${links.length ? `<p class="pub-links">${links.join(" &middot; ")}</p>` : ""}
</div>`;
}
