import { escapeHtml } from "./html.js";
import type { RepositoriesConfig } from "./types.js";

export function renderRepositories(data: RepositoriesConfig, introHtml = ""): string {
  const parts: string[] = ["<h1>repositories</h1>", introHtml];

  if (data.github_users?.length) {
    parts.push("<h2>GitHub users</h2><ul>");
    for (const user of data.github_users) {
      parts.push(
        `<li><a href="https://github.com/${escapeHtml(user)}">github.com/${escapeHtml(user)}</a></li>`
      );
    }
    parts.push("</ul>");
  }

  if (data.github_repos?.length) {
    parts.push("<h2>GitHub repositories</h2><ul>");
    for (const repo of data.github_repos) {
      parts.push(
        `<li><a href="https://github.com/${escapeHtml(repo)}">${escapeHtml(repo)}</a></li>`
      );
    }
    parts.push("</ul>");
  }

  return parts.join("\n");
}
