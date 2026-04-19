import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit2, Check, X, ArrowRight, Ghost, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../lib/auth';
import { Application, Priority, AppStatus, Stage, Outcome, H1BSponsorship, PRIORITIES, STAGES, STATUSES, OUTCOMES } from '../../lib/types';
import { PriorityPill } from '../common/PriorityPill';
import { OutcomePill, StatusPill } from '../common/StatusPill';
import { TimelineTab } from './TimelineTab';
import { CompensationTab } from './CompensationTab';
import { FeedbackTab } from './FeedbackTab';

interface Props {
  appId: string;
}

export function ApplicationDetail({ appId }: Props) {
  const { applications, events, updateApplication, advanceStage, markGhosted, darkMode, setView, fetchApplication } = useStore();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [tab, setTab] = useState<'timeline' | 'compensation' | 'feedback'>('timeline');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchApplication(appId);
  }, [appId]);

  const app = applications.find(a => a.id === appId);
  const [editForm, setEditForm] = useState<Partial<Application>>({});

  useEffect(() => {
    if (app) setEditForm({ ...app });
  }, [app]);

  const nextEvent = (() => {
    const now = new Date();
    const upcoming = events
      .filter(e => e.application_id === appId && e.event_type === 'Scheduled' && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  })();

  if (!app) {
    return (
      <div className={`flex items-center justify-center h-64 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        Loading...
      </div>
    );
  }

  const handleSave = async () => {
    await updateApplication(app.id, editForm);
    setEditing(false);
  };

  const inputClass = `rounded-lg px-3 py-1.5 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;

  const tabs = ['timeline', 'compensation', 'feedback'] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('applications')}
          className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
        >
          <ArrowLeft size={16} />
        </button>
        <nav className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Applications <span className="mx-1">›</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{app.company}</span>
        </nav>
      </div>

      <div className={`rounded-xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        {isAdmin && editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Company</label>
                <input className={`${inputClass} w-full`} value={editForm.company || ''} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Role</label>
                <input className={`${inputClass} w-full`} value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Priority</label>
                <select className={`${inputClass} w-full`} value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Stage</label>
                <select className={`${inputClass} w-full`} value={editForm.current_stage} onChange={e => setEditForm(f => ({ ...f, current_stage: e.target.value as Stage }))}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Status</label>
                <select className={`${inputClass} w-full`} value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as AppStatus }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Outcome</label>
                <select className={`${inputClass} w-full`} value={editForm.outcome || ''} onChange={e => setEditForm(f => ({ ...f, outcome: (e.target.value || null) as Outcome | null }))}>
                  <option value="">—</option>
                  {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Recruiter</label>
                <input className={`${inputClass} w-full`} value={editForm.recruiter_name || ''} onChange={e => setEditForm(f => ({ ...f, recruiter_name: e.target.value }))} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>H1B Sponsorship</label>
                <select className={`${inputClass} w-full`} value={editForm.h1b_sponsorship} onChange={e => setEditForm(f => ({ ...f, h1b_sponsorship: e.target.value as H1BSponsorship }))}>
                  <option>Unknown</option>
                  <option>Confirmed</option>
                  <option>Not Offered</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Referral Source</label>
                <input className={`${inputClass} w-full`} value={editForm.referral_source || ''} onChange={e => setEditForm(f => ({ ...f, referral_source: e.target.value }))} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Recruiter Contact</label>
                <input className={`${inputClass} w-full`} value={editForm.recruiter_contact || ''} onChange={e => setEditForm(f => ({ ...f, recruiter_contact: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 font-medium">
                <Check size={14} /> Save
              </button>
              <button onClick={() => setEditing(false)} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.company}</h1>
                  <PriorityPill priority={app.priority} size="md" />
                  {app.outcome ? <OutcomePill outcome={app.outcome} /> : <StatusPill status={app.status} />}
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.role}</p>
                {app.recruiter_name && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Recruiter: {app.recruiter_name}
                    {app.recruiter_contact && ` · ${app.recruiter_contact}`}
                  </p>
                )}
                {app.referral_source && (
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Referral: {app.referral_source}
                  </p>
                )}
                {nextEvent && (
                  <div className={`flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg w-fit ${darkMode ? 'bg-blue-950/60 border border-blue-900/50' : 'bg-blue-50 border border-blue-200'}`}>
                    <Calendar size={11} className="text-blue-400 shrink-0" />
                    <span className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Next: {nextEvent.date}{nextEvent.description ? ` · ${nextEvent.description}` : nextEvent.stage ? ` · ${nextEvent.stage}` : ''}
                    </span>
                  </div>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => advanceStage(app.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ArrowRight size={12} /> Next Stage
                  </button>
                  <button
                    onClick={() => markGhosted(app.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-purple-800 text-purple-400 hover:bg-purple-900/30 font-medium"
                  >
                    <Ghost size={12} /> Ghosted
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1 flex-wrap`}>
              {STAGES.map((s, i) => {
                const currentIdx = STAGES.indexOf(app.current_stage);
                const isPast = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <span key={s} className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isCurrent ? 'bg-blue-600 text-white' :
                      isPast ? (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600') :
                      (darkMode ? 'text-gray-700' : 'text-gray-300')
                    }`}>
                      {s}
                    </span>
                    {i < STAGES.length - 1 && (
                      <span className={`text-xs ${darkMode ? 'text-gray-800' : 'text-gray-300'}`}>›</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-0">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : `border-transparent ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab === 'timeline' && <TimelineTab app={app} />}
        {tab === 'compensation' && <CompensationTab app={app} />}
        {tab === 'feedback' && <FeedbackTab app={app} />}
      </div>
    </div>
  );
}
