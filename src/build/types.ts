export interface SiteConfig {
  name: string;
  title: string;
  email: string;
  x_username?: string;
  github_username?: string;
  scholar_userid?: string;
  url: string;
  description: string;
  nav: { title: string; href: string }[];
  footer_text?: string;
}

export interface Page {
  title: string;
  permalink: string;
  description?: string;
  html: string;
}

export interface Post {
  title: string;
  date: string;
  description?: string;
  tags: string[];
  permalink: string;
  html: string;
}

export interface BibEntry {
  type: string;
  key: string;
  fields: Record<string, string>;
}

export interface CoauthorEntry {
  firstname: string[];
  url: string;
}

export type CoauthorMap = Record<string, CoauthorEntry[]>;

export interface RepositoriesConfig {
  github_users?: string[];
  github_repos?: string[];
}
