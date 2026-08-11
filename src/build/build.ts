import { readFile, readdir, mkdir, writeFile as fsWriteFile, cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import matter from "gray-matter";

import { renderMarkdown } from "./markdown.js";
import { parseBibtex } from "./bibtex.js";
import { renderPublications } from "./publications.js";
import { renderRepositories } from "./repositories.js";
import { layout } from "./templates.js";
import { escapeHtml } from "./html.js";
import type { SiteConfig, Post, CoauthorMap, RepositoriesConfig } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const DIST = path.join(ROOT, "dist");
const STYLES = path.join(ROOT, "styles");
const ASSETS = path.join(ROOT, "assets");

const POST_FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

async function readYaml<T>(relPath: string): Promise<T> {
  const raw = await readFile(path.join(CONTENT, relPath), "utf-8");
  return yaml.load(raw) as T;
}

async function readContentMarkdown(relPath: string) {
  const raw = await readFile(path.join(CONTENT, relPath), "utf-8");
  const { data, content } = matter(raw);
  return { data, html: renderMarkdown(content) };
}

function toDateString(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? "");
}

function formatDisplayDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function loadPosts(): Promise<Post[]> {
  const dir = path.join(CONTENT, "posts");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));

  const posts: Post[] = [];
  for (const file of files) {
    const match = POST_FILENAME_RE.exec(file);
    const raw = await readFile(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    const date = data.date ? toDateString(data.date) : (match?.[1] ?? "");
    const slug = match?.[2] ?? file.replace(/\.md$/, "");

    posts.push({
      title: data.title ?? slug,
      date,
      description: data.description,
      tags: Array.isArray(data.tags) ? data.tags : [],
      permalink: `/blog/${slug}/`,
      html: renderMarkdown(content),
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

function postMeta(post: Post): string {
  const tagPart = post.tags.length ? ` &middot; ${post.tags.map(escapeHtml).join(", ")}` : "";
  return `${escapeHtml(formatDisplayDate(post.date))}${tagPart}`;
}

function renderBlogIndex(posts: Post[]): string {
  const items = posts
    .map(
      (post) => `<div class="post-item">
<h3><a href="${post.permalink}">${escapeHtml(post.title)}</a></h3>
<p class="post-meta">${postMeta(post)}</p>
${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
</div>`
    )
    .join("\n");

  return `<h1>blog</h1>\n${items || "<p>No posts yet.</p>"}`;
}

function renderPostPage(post: Post): string {
  return `<article>
<h1>${escapeHtml(post.title)}</h1>
<p class="post-meta">${postMeta(post)}</p>
${post.html}
</article>`;
}

function mathHead(bodyHtml: string): string {
  return bodyHtml.includes('class="katex"')
    ? '<link rel="stylesheet" href="/assets/css/katex.min.css">'
    : "";
}

async function writeHtml(
  site: SiteConfig,
  opts: {
    permalink: string;
    title: string;
    description?: string;
    bodyHtml: string;
  }
): Promise<void> {
  const html = layout({
    site,
    title: opts.title,
    description: opts.description,
    permalink: opts.permalink,
    bodyHtml: opts.bodyHtml,
    extraHead: mathHead(opts.bodyHtml),
  });

  const outPath = opts.permalink.endsWith(".html")
    ? path.join(DIST, opts.permalink)
    : path.join(DIST, opts.permalink, "index.html");
  await mkdir(path.dirname(outPath), { recursive: true });
  await fsWriteFile(outPath, html, "utf-8");
}

async function copyAssets(): Promise<void> {
  await mkdir(path.join(DIST, "assets", "css"), { recursive: true });
  await cp(path.join(STYLES, "style.css"), path.join(DIST, "assets", "css", "style.css"));

  const katexDist = path.resolve(ROOT, "node_modules", "katex", "dist");
  await cp(
    path.join(katexDist, "katex.min.css"),
    path.join(DIST, "assets", "css", "katex.min.css")
  );
  await cp(path.join(katexDist, "fonts"), path.join(DIST, "assets", "css", "fonts"), {
    recursive: true,
  });

  await mkdir(path.join(DIST, "assets", "js"), { recursive: true });
  await cp(
    path.join(ASSETS, "js", "theme-toggle.js"),
    path.join(DIST, "assets", "js", "theme-toggle.js")
  );

  await mkdir(path.join(DIST, "assets", "img"), { recursive: true });
  await cp(
    path.join(ASSETS, "img", "prof_pic.jpg"),
    path.join(DIST, "assets", "img", "prof_pic.jpg")
  );
}

async function build(): Promise<void> {
  await rm(DIST, { recursive: true, force: true });

  const site = await readYaml<SiteConfig>("site.yml");

  const about = await readContentMarkdown("pages/about.md");
  const profileImgHtml = about.data.profile_image
    ? `<img class="profile-pic" src="/assets/img/${escapeHtml(about.data.profile_image)}" alt="${escapeHtml(site.name)}">`
    : "";
  await writeHtml(site, {
    permalink: "/",
    title: about.data.title ?? "about",
    bodyHtml: `<div class="profile-hero"><div class="profile-text">${about.html}</div>${profileImgHtml}</div>`,
  });

  const pubIntro = await readContentMarkdown("pages/publications.md");
  const bibSource = await readFile(path.join(CONTENT, "publications.bib"), "utf-8");
  const bibEntries = parseBibtex(bibSource);
  const coauthors = await readYaml<CoauthorMap>("coauthors.yml");
  await writeHtml(site, {
    permalink: "/publications/",
    title: "publications",
    bodyHtml: renderPublications(bibEntries, site, coauthors, pubIntro.html),
  });

  const reposIntro = await readContentMarkdown("pages/repositories.md");
  const repositoriesData = await readYaml<RepositoriesConfig>("repositories.yml");
  await writeHtml(site, {
    permalink: "/repositories/",
    title: "repositories",
    bodyHtml: renderRepositories(repositoriesData, reposIntro.html),
  });

  const posts = await loadPosts();
  await writeHtml(site, {
    permalink: "/blog/",
    title: "blog",
    bodyHtml: renderBlogIndex(posts),
  });
  for (const post of posts) {
    await writeHtml(site, {
      permalink: post.permalink,
      title: post.title,
      description: post.description,
      bodyHtml: renderPostPage(post),
    });
  }

  await copyAssets();

  console.log(`Built ${posts.length + 4} pages into ${path.relative(ROOT, DIST)}/`);
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
