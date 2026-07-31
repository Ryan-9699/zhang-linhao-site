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
  statline?: string[];
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

export interface CapabilityItem {
  title: string;
  text: string;
  items: string[];
}

export interface SectionCopyConfig {
  experienceTitle?: string;
  worksTitle?: string;
  archiveTitle?: string;
  skillsTitle?: string;
  contactTitleLines?: string[];
  contactText?: string;
}

export interface ArchiveImageItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
}

export interface WorkLink {
  label: string;
  icon: string;
}

export type WorkGroupId = "s-live" | "celebrity" | "commerce" | "brand";

export interface WorkCaseMetric {
  title: string;
  label: string;
}

export interface WorkCaseStep {
  number: string;
  title: string;
  text: string;
}

export interface WorkCaseMethod {
  visualText?: string;
  metrics?: WorkCaseMetric[];
  steps?: WorkCaseStep[];
  notesTitle?: string;
  notes?: string[];
}

export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  hidden?: boolean;
  group?: WorkGroupId;
  image: string;
  videoImage?: string;
  workflowImage?: string;
  showcaseVideo?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  caseRole?: string;
  caseDetails?: string[];
  caseMethod?: WorkCaseMethod;
  resultText?: string;
  galleryImages?: {
    onsite?: string;
    signal?: string;
    output?: string;
  };
  galleryVideos?: {
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
  note?: string;
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
  sectionCopy?: SectionCopyConfig;
  capabilities?: CapabilityItem[];
  archiveImages?: ArchiveImageItem[];
  works: WorkItem[];
  experience?: ExperienceItem[];
  skills?: SkillGroup[];
  education?: string;
  footer: FooterConfig;
}
