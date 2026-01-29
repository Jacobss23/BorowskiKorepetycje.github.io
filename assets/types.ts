export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  clientName: string;
  clientPhone: string;
  topic: string;
  additionalInfo?: string; // New field
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface TopicCategories {
  primary: string[];
  highSchool: string[];
}

export interface PricingItem {
  title: string;
  subtitle: string;
  price: string;
}

export interface CalendarOverride {
  date: string; // YYYY-MM-DD
  type: 'special' | 'unavailable';
}

export interface TutorProfile {
  name: string;
  bio: string;
  photoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  topics: TopicCategories;
  pricing: PricingItem[];
  terms: string;
  calendarOverrides: CalendarOverride[];
}

export type View = 'public' | 'public-topics' | 'pricing' | 'admin-dashboard' | 'admin-calendar' | 'admin-profile';

export type EducationLevel = string;

export interface MathProblem {
  question: string;
  answer: string;
  difficulty: string;
  stepByStep?: string;
}