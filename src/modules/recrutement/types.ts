export type Contract = "Stage" | "Alternance" | "CDD" | "CDI" | "Freelance" | "Mission" | "Temporaire";
export type WorkMode = "Sur site" | "Hybride" | "Télétravail";

export type Recruiter = {
  name: string;
  initials?: string;
  role: string;
  company: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  avatar: string | null;
};

export type Job = {
  slug: string;
  title: string;
  city: string;
  country: string;
  countryCode: string;
  company: string | null;
  contract: Contract;
  workMode: WorkMode;
  publishedAt: string;
  deadline: string | null;
  closed: boolean;
  demo: boolean;
  coverLetterRequired: boolean;
  positions: number;
  experience: string;
  education: string;
  salary: string | null;
  hours: string | null;
  startDate: string | null;
  description: string;
  missions: string[];
  profile: string[];
  skills: string[];
  benefits: string[];
  process: string[];
  recruiter: Recruiter | null;
  featured?: boolean;
  imageUrl?: string | null;
  attachments?: string[];
};

export type JobsPage = {
  jobs: Job[];
  page: number;
  totalPages: number;
  total: number;
  unavailable: boolean;
};
