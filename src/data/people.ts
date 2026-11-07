/**
 * people.ts — Curated Talent & Trusted People Directory
 *
 * A vouched index of trusted practitioners and colleagues Bernard personally
 * endorses. Recruiters and industry teams can explore and connect directly with
 * these exceptional minds.
 */

export type PeopleCategory =
  'ENGINEERING' | 'DESIGN' | 'DATA' | 'MANAGEMENT' | 'RESEARCH' | 'ACADEMIA';

export interface Person {
  id: string;
  name: string;
  role: string;
  company?: string;
  experience?: string; // Total work experience, e.g. '4Y 9M EXP'
  knownSince: string; // Year association began, e.g. '2019'
  tier?: 'FACULTY' | 'RESEARCH PEER' | 'COLLEAGUE' | 'PROFESSIONAL PEER';
  categories: PeopleCategory[];
  connectionContext: string | string[]; // Formal background & connection origin (can be multiple lines)
  endorsement: string;
  tags: string[]; // Simple, atomic, precise tags
  links: {
    linkedin?: string;
    website?: string;
    scholar?: string;
    faculty?: string;
    github?: string;
    email?: string;
  };
}

// Backward-compatible type aliases
export type NetworkCategory = PeopleCategory;
export type NetworkPerson = Person;

export const PEOPLE_CATEGORIES: PeopleCategory[] = [
  'ENGINEERING',
  'DESIGN',
  'DATA',
  'MANAGEMENT',
  'RESEARCH',
  'ACADEMIA',
];
export const NETWORK_CATEGORIES = PEOPLE_CATEGORIES;

export const PEOPLE: Person[] = [
  // ── 01. Rohan Chakraborty ─────────────────────────────────
  {
    id: 'rohan-chakraborty',
    name: 'Rohan Chakraborty',
    role: 'Senior Frontend Engineer @ Pixxel',
    company: 'Pixxel',
    experience: '4Y+ WORK EXP',
    knownSince: '2019',
    tier: 'COLLEAGUE',
    categories: ['ENGINEERING', 'DESIGN'],
    connectionContext: "St. Xavier's College (Autonomous), Kolkata, West Bengal",
    endorsement:
      'A high-caliber senior frontend engineer specializing in crafting performant, modern web experiences. Rohan combines deep technical command of React, Next.js, and TypeScript with an obsessive eye for UI design systems, micro-interactions, and fluid user experiences.',
    tags: ['React', 'Next.js', 'TypeScript', 'UI/UX', 'Frontend Architecture', 'CSS'],
    links: {
      linkedin: 'https://www.linkedin.com/in/rohanchkrabrty/',
      github: 'https://github.com/rohanchkrabrty',
      website: 'https://rohan.codes/',
    },
  },

  // ── 02. Ankit Ajay ─────────────────────────────────────────
  {
    id: 'ankit-ajay',
    name: 'Ankit Ajay',
    role: 'IT Consultant @ EY',
    company: 'EY',
    experience: '3Y+ WORK EXP',
    knownSince: '2019',
    tier: 'COLLEAGUE',
    categories: ['MANAGEMENT'],
    connectionContext: [
      "St. Xavier's College (Autonomous), Kolkata, West Bengal",
      'CHRIST (Deemed-to-be-University), Bangalore, Karnataka',
    ],
    endorsement:
      'A dedicated IT consultant with deep expertise in cloud security architecture, identity and access management (IAM), and regulatory governance (GRC / SOX). Ankit brings rigorous analytical discipline to enterprise cloud infrastructure, certified across Azure and AWS to design resilient, audit-compliant security postures.',
    tags: [
      'IT Consulting',
      'Cloud Security',
      'Cloud Architecture',
      'IAM',
      'GRC',
      'SOX',
      'Azure',
      'AWS',
    ],
    links: {
      linkedin: 'https://www.linkedin.com/in/ankit-ajay-325b231b1/',
      github: 'https://github.com/BitNomad17',
    },
  },

  // ── 03. Shubha Angaria ─────────────────────────────────────
  {
    id: 'shubha-angaria',
    name: 'Shubha Angaria',
    role: 'Full Stack Engineer @ Trivium eSolutions',
    company: 'Trivium eSolutions',
    experience: '3Y+ WORK EXP',
    knownSince: '2021',
    tier: 'COLLEAGUE',
    categories: ['ENGINEERING'],
    connectionContext: 'CHRIST (Deemed-to-be-University), Bangalore, Karnataka',
    endorsement:
      'A versatile and disciplined full stack engineer with demonstrated mastery in developing scalable, cloud-native enterprise services. Shubha builds robust backend architectures with Java and Spring Boot, delivers clean interactive frontends in Angular and React, and deploys cloud solutions with AWS, Docker, and CI/CD pipelines.',
    tags: ['Java', 'Spring Boot', 'React', 'Angular', 'AWS', 'Docker', 'REST APIs', 'CI/CD'],
    links: {
      linkedin: 'https://www.linkedin.com/in/shubha-a-b38573212/',
      github: 'https://github.com/shubhajyotsna',
    },
  },

  // ── 04. Prabhkirat Kaur ────────────────────────────────────
  {
    id: 'prabhkirat-kaur',
    name: 'Prabhkirat Kaur',
    role: 'Business Analyst',
    knownSince: '2021',
    tier: 'COLLEAGUE',
    categories: ['MANAGEMENT'],
    connectionContext: 'CHRIST (Deemed-to-be-University), Bangalore, Karnataka',
    endorsement:
      'A structured, results-oriented business analyst with an MBA from CHRIST University. Having collaborated closely with Prabhkirat firsthand, I can attest to her disciplined execution, strategic problem-solving capabilities, and strong leadership in driving cross-functional business initiatives.',
    tags: ['Business Analyst', 'Strategy', 'Operations', 'Project Management', 'Market Analysis'],
    links: {
      linkedin: 'https://www.linkedin.com/in/prabhkirat-kaur/',
      github: 'https://github.com/prabhkirat-kaur',
    },
  },
];

export const NETWORK_PEOPLE = PEOPLE;
