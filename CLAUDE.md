# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Additional Context for Claude Code

This is a personal fork of **al-folio**, a Jekyll theme for academic websites, deployed via GitHub Pages. There is no application test suite — validation is done by building the site and checking it renders correctly (see below).

### Commands

```bash
# Local dev (recommended)
docker compose pull && docker compose up      # site at http://localhost:8080
docker compose up --build                     # rebuild after Gemfile/Dockerfile changes
docker compose down                           # stop and free port 8080

# Formatting (required before every commit)
npx prettier . --write                        # _scripts/**/*.js is excluded (mixed Liquid+JS, see .prettierignore)

# Non-Docker fallback
bundle install && pip install jupyter
bundle exec jekyll serve --port 4000
```

There are no unit tests. "Testing" a change means: rebuild with Docker, load `http://localhost:8080`, and manually check the affected page(s) plus dark mode/navigation for regressions.

### Architecture

- Standard Jekyll collections drive content: `_posts/`, `_projects/`, `_news/`, `_teachings/`, `_books/`, `_pages/`. Each has its own required frontmatter shape — see `.github/instructions/markdown-content.instructions.md`.
- `_data/*.yml` holds structured data consumed by Liquid templates: `cv.yml` (RenderCV format CV, rendered by `_layouts/cv.liquid`), `socials.yml`, `coauthors.yml`, `citations.yml`, `repositories.yml`, `venues.yml`.
- `_bibliography/papers.bib` is BibTeX, processed by `jekyll-scholar`; supports al-folio-specific extra keys (`pdf`, `code`, `preview`, `doi`, `selected`, etc.) — see `.github/instructions/bibtex-bibliography.instructions.md`.
- `_includes/` are reusable Liquid components (notably `_includes/cv/*` per CV section, `_includes/repository/*`); `_layouts/` are page-level templates selected via frontmatter `layout:`.
- `_plugins/*.rb` are custom Jekyll plugins (e.g. `google-scholar-citations.rb`, `inspirehep-citations.rb`, `external-posts.rb`) that extend the build beyond what gems provide.
- `_scripts/*.js` (some `.liquid.js`) are compiled into `assets/js/` at build time; `.liquid.js` files mix Liquid tags with JS and are intentionally excluded from Prettier.
- `_config.yml` is the single source of truth for site metadata, feature flags (`*.enabled`), and `url`/`baseurl` — these two **must** stay consistent with whether this is deployed as a personal site (`baseurl` empty) or project site (`baseurl: /repo-name/`).
- Production builds run with `JEKYLL_ENV=production` and pipe through `purgecss` (config in `purgecss.config.js`) for CSS trimming; this happens in `.github/workflows/deploy.yml`, which also commits the built `_site/` to `gh-pages`. Never hand-edit the `gh-pages` branch.

### Where to look next

Per-file-type conventions live in `.github/instructions/` (YAML, Liquid, BibTeX, Markdown, JS) and are auto-scoped by path via `applyTo` frontmatter — read the one matching the file you're editing before making changes. `.github/copilot-instructions.md` has the fullest pitfalls/troubleshooting reference if something breaks during build.
