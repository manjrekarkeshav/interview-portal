import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  Application, TimelineEvent, Compensation, FeedbackNote,
  InterviewStructure, Referral, View
} from '../lib/types';

interface AppState {
  view: View;
  selectedAppId: string | null;
  applications: Application[];
  events: TimelineEvent[];
  compensations: Compensation[];
  feedbackNotes: FeedbackNote[];
  interviewStructures: InterviewStructure[];
  referrals: Referral[];
  loading: boolean;
  commandPaletteOpen: boolean;
  darkMode: boolean;

  setView: (view: View, appId?: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleDarkMode: () => void;

  fetchAll: () => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;

  createApplication: (app: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<Application | null>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  advanceStage: (id: string) => Promise<void>;
  markGhosted: (id: string) => Promise<void>;

  createEvent: (event: Omit<TimelineEvent, 'id' | 'created_at'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  upsertCompensation: (comp: Omit<Compensation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  createFeedback: (note: Omit<FeedbackNote, 'id' | 'created_at'>) => Promise<void>;
  updateFeedback: (id: string, updates: Partial<FeedbackNote>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  upsertInterviewStructure: (structure: Omit<InterviewStructure, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  createReferral: (ref: Omit<Referral, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReferral: (id: string, updates: Partial<Referral>) => Promise<void>;
  deleteReferral: (id: string) => Promise<void>;

  importApplications: (
    apps: Omit<Application, 'id' | 'created_at' | 'updated_at'>[],
    events: { appIndex: number; event: Omit<TimelineEvent, 'id' | 'application_id' | 'created_at'> }[]
  ) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  view: 'dashboard',
  selectedAppId: null,
  applications: [],
  events: [],
  compensations: [],
  feedbackNotes: [],
  interviewStructures: [],
  referrals: [],
  loading: false,
  commandPaletteOpen: false,
  darkMode: true,

  setView: (view, appId) => set({ view, selectedAppId: appId ?? null }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

  fetchAll: async () => {
    set({ loading: true });
    const [
      { data: apps },
      { data: evts },
      { data: comps },
      { data: feedback },
      { data: structures },
      { data: refs },
    ] = await Promise.all([
      supabase.from('applications').select('*').order('updated_at', { ascending: false }),
      supabase.from('timeline_events').select('*').order('date', { ascending: false }),
      supabase.from('compensation').select('*'),
      supabase.from('feedback_notes').select('*').order('date', { ascending: false }),
      supabase.from('interview_structure').select('*'),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
    ]);
    set({
      applications: apps || [],
      events: evts || [],
      compensations: comps || [],
      feedbackNotes: feedback || [],
      interviewStructures: structures || [],
      referrals: refs || [],
      loading: false,
    });
  },

  fetchApplication: async (id) => {
    const [
      { data: app },
      { data: evts },
      { data: comp },
      { data: feedback },
      { data: structure },
    ] = await Promise.all([
      supabase.from('applications').select('*').eq('id', id).maybeSingle(),
      supabase.from('timeline_events').select('*').eq('application_id', id).order('date', { ascending: false }),
      supabase.from('compensation').select('*').eq('application_id', id).maybeSingle(),
      supabase.from('feedback_notes').select('*').eq('application_id', id).order('date', { ascending: false }),
      supabase.from('interview_structure').select('*').eq('application_id', id).maybeSingle(),
    ]);
    if (app) {
      set(s => ({
        applications: s.applications.map(a => a.id === id ? app : a),
        events: [...s.events.filter(e => e.application_id !== id), ...(evts || [])],
        compensations: comp
          ? [...s.compensations.filter(c => c.application_id !== id), comp]
          : s.compensations.filter(c => c.application_id !== id),
        feedbackNotes: [...s.feedbackNotes.filter(f => f.application_id !== id), ...(feedback || [])],
        interviewStructures: structure
          ? [...s.interviewStructures.filter(is => is.application_id !== id), structure]
          : s.interviewStructures.filter(is => is.application_id !== id),
      }));
    }
  },

  createApplication: async (app) => {
    const { data, error } = await supabase.from('applications').insert(app).select().maybeSingle();
    if (error || !data) return null;
    set(s => ({ applications: [data, ...s.applications] }));
    return data;
  },

  updateApplication: async (id, updates) => {
    const { data } = await supabase.from('applications').update(updates).eq('id', id).select().maybeSingle();
    if (data) {
      set(s => ({ applications: s.applications.map(a => a.id === id ? data : a) }));
    }
  },

  deleteApplication: async (id) => {
    await supabase.from('applications').delete().eq('id', id);
    set(s => ({
      applications: s.applications.filter(a => a.id !== id),
      events: s.events.filter(e => e.application_id !== id),
      compensations: s.compensations.filter(c => c.application_id !== id),
      feedbackNotes: s.feedbackNotes.filter(f => f.application_id !== id),
      interviewStructures: s.interviewStructures.filter(is => is.application_id !== id),
    }));
  },

  advanceStage: async (id) => {
    const { applications, createEvent } = get();
    const app = applications.find(a => a.id === id);
    if (!app) return;
    const stages = ['Recruiter Outreach', 'Recruiter Screen', 'Hiring Manager', 'Product Sense', 'Onsite', 'Post Onsite', 'Offer', 'Sign-on'] as const;
    const idx = stages.indexOf(app.current_stage as typeof stages[number]);
    if (idx === -1 || idx === stages.length - 1) return;
    const nextStage = stages[idx + 1];
    await Promise.all([
      get().updateApplication(id, { current_stage: nextStage, status: 'Active' }),
      createEvent({
        application_id: id,
        date: new Date().toISOString().split('T')[0],
        event_type: 'Completed',
        stage: app.current_stage,
        description: `Completed ${app.current_stage}`,
      }),
    ]);
  },

  markGhosted: async (id) => {
    await Promise.all([
      get().updateApplication(id, { outcome: 'Ghosted', status: 'Closed' }),
      get().createEvent({
        application_id: id,
        date: new Date().toISOString().split('T')[0],
        event_type: 'Ghosted',
        stage: get().applications.find(a => a.id === id)?.current_stage || '',
        description: 'Marked as ghosted',
      }),
    ]);
  },

  createEvent: async (event) => {
    const { data } = await supabase.from('timeline_events').insert(event).select().maybeSingle();
    if (data) {
      set(s => ({ events: [data, ...s.events] }));
      await supabase.from('applications').update({ updated_at: new Date().toISOString() }).eq('id', event.application_id);
      set(s => ({
        applications: s.applications.map(a =>
          a.id === event.application_id ? { ...a, updated_at: new Date().toISOString() } : a
        ),
      }));
    }
  },

  deleteEvent: async (id) => {
    await supabase.from('timeline_events').delete().eq('id', id);
    set(s => ({ events: s.events.filter(e => e.id !== id) }));
  },

  upsertCompensation: async (comp) => {
    const { data } = await supabase.from('compensation').upsert(comp, { onConflict: 'application_id' }).select().maybeSingle();
    if (data) {
      set(s => ({
        compensations: [...s.compensations.filter(c => c.application_id !== comp.application_id), data],
      }));
    }
  },

  createFeedback: async (note) => {
    const { data } = await supabase.from('feedback_notes').insert(note).select().maybeSingle();
    if (data) set(s => ({ feedbackNotes: [data, ...s.feedbackNotes] }));
  },

  updateFeedback: async (id, updates) => {
    const { data } = await supabase.from('feedback_notes').update(updates).eq('id', id).select().maybeSingle();
    if (data) set(s => ({ feedbackNotes: s.feedbackNotes.map(f => f.id === id ? data : f) }));
  },

  deleteFeedback: async (id) => {
    await supabase.from('feedback_notes').delete().eq('id', id);
    set(s => ({ feedbackNotes: s.feedbackNotes.filter(f => f.id !== id) }));
  },

  upsertInterviewStructure: async (structure) => {
    const { data } = await supabase.from('interview_structure').upsert(structure, { onConflict: 'application_id' }).select().maybeSingle();
    if (data) {
      set(s => ({
        interviewStructures: [...s.interviewStructures.filter(is => is.application_id !== structure.application_id), data],
      }));
    }
  },

  createReferral: async (ref) => {
    const { data } = await supabase.from('referrals').insert(ref).select().maybeSingle();
    if (data) set(s => ({ referrals: [data, ...s.referrals] }));
  },

  updateReferral: async (id, updates) => {
    const { data } = await supabase.from('referrals').update(updates).eq('id', id).select().maybeSingle();
    if (data) set(s => ({ referrals: s.referrals.map(r => r.id === id ? data : r) }));
  },

  deleteReferral: async (id) => {
    await supabase.from('referrals').delete().eq('id', id);
    set(s => ({ referrals: s.referrals.filter(r => r.id !== id) }));
  },

  importApplications: async (apps, events) => {
    set({ loading: true });
    const createdApps: Application[] = [];
    for (const app of apps) {
      const { data } = await supabase.from('applications').insert(app).select().maybeSingle();
      if (data) createdApps.push(data);
    }
    const eventsToInsert = events
      .map(({ appIndex, event }) => {
        const app = createdApps[appIndex];
        if (!app) return null;
        return { ...event, application_id: app.id };
      })
      .filter(Boolean);

    if (eventsToInsert.length > 0) {
      await supabase.from('timeline_events').insert(eventsToInsert);
    }
    await get().fetchAll();
  },
}));
