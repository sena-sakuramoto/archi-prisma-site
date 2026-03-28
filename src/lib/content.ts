import worksData from '../content/works.json';
import teamData from '../content/team.json';
import partnersData from '../content/partners.json';
import companyData from '../content/company.json';

export interface Work {
  year: number;
  title: string;
  type: string;
  category?: string;
  region: string;
  phase: string;
  image?: string;
  storyline?: string;
  scope?: string;
  description?: string;
  featured?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  notes?: string;
  license?: string;
  image?: string;
}

export interface Partner {
  name: string;
  area: string;
  logo?: string;
  logoAlt?: string;
  logoScale?: number;
}

export function loadWorks(): Work[] {
  return worksData as Work[];
}

export function loadFeaturedWorks(): Work[] {
  return loadWorks().filter(w => w.featured);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[（）()／/]/g, '')
    .replace(/[\s　·・—–]+/g, '-')
    .replace(/[^a-z0-9\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getWorkBySlug(slug: string): Work | undefined {
  return loadWorks().find(w => slugify(w.title) === slug);
}

export function getAdjacentWorks(slug: string): { prev?: Work; next?: Work } {
  const works = loadWorks();
  const idx = works.findIndex(w => slugify(w.title) === slug);
  return {
    prev: idx > 0 ? works[idx - 1] : undefined,
    next: idx < works.length - 1 ? works[idx + 1] : undefined,
  };
}

export function loadTeam() {
  return teamData as {
    core: TeamMember[];
    advisory_legacy: TeamMember[];
    collaborators: TeamMember[];
  };
}

export function loadPartners() {
  return (partnersData as { companies: Partner[] }).companies;
}

export interface Company {
  name: string;
  nameEn: string;
  postalCode: string;
  address: string;
  building: string;
  tel: string;
  email: string;
  license: string;
  established: string;
  ceo: string;
  hours: string;
  social: {
    note: string;
    x: string;
  };
}

export function loadCompany(): Company {
  return companyData as Company;
}
