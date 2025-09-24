import { readFile } from 'node:fs/promises';

const contentRoot = new URL('../../content/', import.meta.url);

type MarkdownBlock = {
  title: string;
  tagline?: string;
  subheading?: string;
  paragraphs: string[];
};

export interface WorkItem {
  year: number;
  title: string;
  type: string;
  region: string;
  phase: string;
}

export interface TeamData {
  core: Array<{ name: string; role: string; notes?: string; license?: string }>;
  advisory_legacy: Array<{ name: string; role: string; notes?: string }>;
  collaborators: Array<{ name: string; role: string; notes?: string }>;
}

export interface ContactInfo {
  address: string;
  cta: string;
}

const textCache = new Map<string, Promise<string>>();

async function readText(relativePath: string): Promise<string> {
  if (!textCache.has(relativePath)) {
    const fileUrl = new URL(relativePath, contentRoot);
    textCache.set(relativePath, readFile(fileUrl, 'utf-8'));
  }
  return textCache.get(relativePath)!;
}

function parseMarkdownBlock(markdown: string): MarkdownBlock {
  const [header, ...rest] = markdown.trim().split(/\n{2,}/);
  const headerLines = header.split('\n');
  const title = headerLines[0]?.replace(/^#\s*/, '')?.trim() ?? '';
  const tagline = headerLines[1]?.trim() || undefined;
  const subheading = headerLines[2]?.trim() || undefined;
  const paragraphs = rest
    .map((block) => block.replace(/\n/g, ' ').trim())
    .filter(Boolean);
  return { title, tagline, subheading, paragraphs };
}

export async function loadAbout(): Promise<MarkdownBlock> {
  const markdown = await readText('about.md');
  return parseMarkdownBlock(markdown);
}

export async function loadServices(): Promise<string[]> {
  const markdown = await readText('services.md');
  return markdown
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export async function loadLicenses(): Promise<string[]> {
  const markdown = await readText('licenses.md');
  return markdown
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export async function loadContact(): Promise<ContactInfo> {
  const markdown = await readText('contact.md');
  const lines = markdown
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);

  const info: Partial<ContactInfo> = {};
  for (const line of lines) {
    const [key, value] = line.split('：', 2);
    if (!value) continue;
    if (key.includes('住所')) {
      info.address = value.trim();
    }
    if (key.toUpperCase().includes('CTA')) {
      info.cta = value.trim();
    }
  }

  return {
    address: info.address ?? '',
    cta: info.cta ?? '',
  };
}

export async function loadWorks(): Promise<WorkItem[]> {
  const raw = await readText('works.json');
  return JSON.parse(raw) as WorkItem[];
}

export async function loadTeam(): Promise<TeamData> {
  const raw = await readText('team.json');
  return JSON.parse(raw) as TeamData;
}

export async function loadPartners(): Promise<{ companies: Array<{ name: string; area: string }> }> {
  const raw = await readText('partners.json');
  return JSON.parse(raw) as { companies: Array<{ name: string; area: string }> };
}
