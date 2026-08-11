import type { BibEntry } from "./types.js";

/**
 * Minimal BibTeX parser covering what al-folio-style .bib files use:
 * @type{key, field = {value}, field = "value", field = bareword, ...}
 * Handles brace-nested values (e.g. title = {{Nested}}).
 */
export function parseBibtex(source: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const n = source.length;
  let i = 0;

  while (i < n) {
    const at = source.indexOf("@", i);
    if (at === -1) break;

    let j = at + 1;
    while (j < n && /[A-Za-z]/.test(source[j])) j++;
    const type = source.slice(at + 1, j).toLowerCase();

    while (j < n && /\s/.test(source[j])) j++;
    if (source[j] !== "{") {
      i = at + 1;
      continue;
    }

    let depth = 1;
    let k = j + 1;
    while (k < n && depth > 0) {
      if (source[k] === "{") depth++;
      else if (source[k] === "}") depth--;
      k++;
    }
    const body = source.slice(j + 1, k - 1);
    i = k;

    if (type === "comment" || type === "string" || type === "preamble" || !type) continue;

    const commaIdx = body.indexOf(",");
    if (commaIdx === -1) continue;
    const key = body.slice(0, commaIdx).trim();
    const fields = parseFields(body.slice(commaIdx + 1));
    entries.push({ type, key, fields });
  }

  return entries;
}

function parseFields(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const n = raw.length;
  let idx = 0;

  while (idx < n) {
    while (idx < n && /[\s,]/.test(raw[idx])) idx++;
    if (idx >= n) break;

    const eq = raw.indexOf("=", idx);
    if (eq === -1) break;
    const name = raw.slice(idx, eq).trim().toLowerCase();
    idx = eq + 1;
    while (idx < n && /\s/.test(raw[idx])) idx++;

    let value = "";
    if (raw[idx] === "{") {
      let depth = 1;
      idx++;
      const start = idx;
      while (idx < n && depth > 0) {
        if (raw[idx] === "{") depth++;
        else if (raw[idx] === "}") depth--;
        if (depth > 0) idx++;
      }
      value = raw.slice(start, idx);
      idx++;
    } else if (raw[idx] === '"') {
      idx++;
      const start = idx;
      while (idx < n && raw[idx] !== '"') idx++;
      value = raw.slice(start, idx);
      idx++;
    } else {
      const start = idx;
      while (idx < n && raw[idx] !== ",") idx++;
      value = raw.slice(start, idx).trim();
    }

    fields[name] = value.replace(/\s+/g, " ").trim();
    while (idx < n && raw[idx] !== ",") idx++;
  }

  return fields;
}
