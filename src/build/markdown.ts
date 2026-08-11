import { marked } from "marked";
import katex from "katex";

const DISPLAY_MATH = /\$\$([\s\S]+?)\$\$/g;
const INLINE_MATH = /(?<!\$)\$([^\n$]+?)\$(?!\$)/g;

/**
 * Renders Markdown to HTML, with $...$ / $$...$$ math pre-rendered to static
 * KaTeX markup so posts don't need a client-side math library.
 */
export function renderMarkdown(source: string): string {
  const placeholders: string[] = [];
  const stash = (html: string): string => {
    const token = `@@MATH${placeholders.length}@@`;
    placeholders.push(html);
    return token;
  };

  let text = source.replace(DISPLAY_MATH, (_match, expr: string) =>
    stash(katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false }))
  );
  text = text.replace(INLINE_MATH, (_match, expr: string) =>
    stash(katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false }))
  );

  let html = marked.parse(text, { async: false }) as string;

  placeholders.forEach((mathHtml, i) => {
    html = html.replace(`@@MATH${i}@@`, mathHtml);
  });

  return html;
}
