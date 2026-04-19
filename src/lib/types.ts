export type Priority = 'P0' | 'P0.5' | 'P1' | 'P2';
export type AppStatus = 'Not Started' | 'Active' | 'Pending Response' | 'Closed';
export type Outcome = 'Scheduled' | 'Complete' | 'Ghosted' | 'Reject' | 'Role Closed' | 'Withdrew';
export type Stage =
  | 'Recruiter Outreach'
  | 'Recruiter Screen'
  | 'Hiring Manager'
  | 'Product Sense'
  | 'Onsite'
  | 'Post Onsite'
  | 'Offer'
  | 'Sign-on';
export type H1BSponsorship = 'Confirmed' | 'Not Offered' | 'Unknown';
export type EventType = 'Scheduled' | 'Completed' | 'Rejected' | 'Ghosted' | 'Withdrew' | 'Outreach' | 'Note';
export type ReferralStatus = 'Reached out' | 'In progress' | 'Closed';

export const STAGES: Stage[] = [
  'Recruiter Outreach',
  'Recruiter Screen',
  'Hiring Manager',
  'Product Sense',
  'Onsite',
  'Post Onsite',
  'Offer',
  'Sign-on',
];

export const PRIORITIES: Priority[] = ['P0', 'P0.5', 'P1', 'P2'];
export const STATUSES: AppStatus[] = ['Not Started', 'Active', 'Pending Response', 'Closed'];
export const OUTCOMES: Outcome[] = ['Scheduled', 'Complete', 'Ghosted', 'Reject', 'Role Closed', 'Withdrew'];
export const EVENT_TYPES: EventType[] = ['Scheduled', 'Completed', 'Rejected', 'Ghosted', 'Withdrew', 'Outreach', 'Note'];

export interface Application {
  id: string;
  company: string;
  role: string;
  priority: Priority;
  status: AppStatus;
  outcome: Outcome | null;
  current_stage: Stage;
  recruiter_name: string;
  recruiter_contact: string;
  referral_source: string;
  h1b_sponsorship: H1BSponsorship;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  application_id: string;
  date: string;
  event_type: EventType;
  stage: string;
  description: string;
  created_at: string;
}

export interface Compensation {
  id: string;
  application_id: string;
  base: number;
  bonus: number;
  annual_equity: number;
  total_equity: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackNote {
  id: string;
  application_id: string;
  interviewer_name: string;
  date: string;
  round: string;
  content: string;
  created_at: string;
}

export interface InterviewStructure {
  id: string;
  application_id: string;
  rounds: string[];
  general_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  company: string;
  poc_name: string;
  status: ReferralStatus;
  referred: boolean;
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

export type View = 'dashboard' | 'applications' | 'analytics' | 'referrals' | 'detail' | 'compensation';
