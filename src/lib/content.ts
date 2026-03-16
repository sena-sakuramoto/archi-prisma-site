import worksData from '../content/works.json';
import teamData from '../content/team.json';
import partnersData from '../content/partners.json';

export interface Work {
  year: number;
  title: string;
  type: string;
  region: string;
  phase: string;
  image?: string;
  storyline?: string;
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
  const featured = ['The Super Yacht Club', 'KOTSUBO Jacaranda Market Place', '下馬賃貸マンション'];
  return loadWorks().filter(w => featured.includes(w.title));
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
