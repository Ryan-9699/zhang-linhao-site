export interface SiteConfig {
  title: string;
  author: string;
  logoIcon: string;
}

export interface ProfileConfig {
  name: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  degree: string;
  experience: string;
  role: string;
  avatar?: string;
  salary: string;
  city: string;
  summary: string;
  metrics?: MetricItem[];
  advantages: string[];
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface NavConfig {
  categories: string[];
}

export interface HeroConfig {
  titleLines: string[];
  subtitle: string;
  searchLabel: string;
  searchValue: string;
  exchangeLabel: string;
  exchangeValue: string;
  mainText: string;
  tagText: string;
  motto: string;
  bottomLeft: string;
  arcText: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: string[];
  color: string;
}

export interface CatalogConfig {
  title: string;
  categories: CatalogCategory[];
}

export interface WorkLink {
  label: string;
  icon: string;
}

export type WorkGroupId = "s-live" | "celebrity" | "commerce" | "brand";

export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  group?: WorkGroupId;
  image: string;
  videoImage?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  resultText?: string;
  galleryImages?: {
    onsite?: string;
    signal?: string;
    output?: string;
  };
  galleryText?: {
    onsiteTitle?: string;
    onsiteDescription?: string;
    signalTitle?: string;
    signalDescription?: string;
    outputTitle?: string;
    outputDescription?: string;
  };
  tags: string[];
  links: WorkLink[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  position: string;
  highlights: string[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface FooterConfig {
  copyright: string;
  contact: string;
}

export interface ContentData {
  site: SiteConfig;
  profile?: ProfileConfig;
  nav: NavConfig;
  hero: HeroConfig;
  catalog: CatalogConfig;
  works: WorkItem[];
  experience?: ExperienceItem[];
  skills?: SkillGroup[];
  education?: string;
  footer: FooterConfig;
}
