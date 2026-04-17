import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import { EventType, Stage, EVENT_TYPES, STAGES } from '../../lib/types';

interface Props {
  applicationId: string;
  currentStage: Stage;
  onClose: () => void;
}

export function LogEventModal({ applicationId, currentStage, onClose }: Props) {
  const { createEvent, darkMode } = useStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    event_type: 'Completed' as EventType,
    stage: currentStage,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;
  const labelClass = `block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createEvent({ ...form, application_id: applicationId });
    setLoading(false);
    onClose();
  };

  const quickActions = [
    { label: 'Screen Complete', type: 'Completed' as EventType, desc: 'Recruiter screen completed' },
    { label: 'HM Complete', type: 'Completed' as EventType, desc: 'Hiring manager call completed' },
    { label: 'Move to Onsite', type: 'Scheduled' as EventType, desc: 'Onsite interview scheduled' },
  ];

  return (
    <Modal title="Log Event" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map(q => (
            <button
              key={q.label}
              onClick={() => setForm(f => ({ ...f, event_type: q.type, description: q.desc }))}
              className={`px-2 py-1 rounded text-xs border transition-colors ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value as EventType }))}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Stage</label>
            <select className={inputClass} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as Stage }))}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="What happened?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 font-medium">
              {loading ? 'Saving...' : 'Log Event'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
