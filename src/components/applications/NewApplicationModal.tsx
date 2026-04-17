import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useStore } from '../../store/useStore';
import { Priority, AppStatus, Stage, H1BSponsorship, PRIORITIES, STAGES } from '../../lib/types';

interface Props {
  onClose: () => void;
  onCreated?: (id: string) => void;
  initialCompany?: string;
}

export function NewApplicationModal({ onClose, onCreated, initialCompany }: Props) {
  const { createApplication, darkMode } = useStore();
  const [form, setForm] = useState({
    company: initialCompany || '',
    role: '',
    priority: 'P1' as Priority,
    status: 'Active' as AppStatus,
    current_stage: 'Recruiter Outreach' as Stage,
    recruiter_name: '',
    recruiter_contact: '',
    referral_source: '',
    h1b_sponsorship: 'Unknown' as H1BSponsorship,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
  }`;

  const labelClass = `block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    setLoading(true);
    const app = await createApplication({ ...form, outcome: null });
    setLoading(false);
    if (app) {
      onCreated?.(app.id);
      onClose();
    }
  };

  return (
    <Modal title="New Application" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Company *</label>
            <input className={inputClass} placeholder="Google" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} autoFocus />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Role *</label>
            <input className={inputClass} placeholder="Senior Product Manager" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select className={inputClass} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Current Stage</label>
            <select className={inputClass} value={form.current_stage} onChange={e => setForm(f => ({ ...f, current_stage: e.target.value as Stage }))}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Recruiter Name</label>
            <input className={inputClass} placeholder="Jane Smith" value={form.recruiter_name} onChange={e => setForm(f => ({ ...f, recruiter_name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>H1B Sponsorship</label>
            <select className={inputClass} value={form.h1b_sponsorship} onChange={e => setForm(f => ({ ...f, h1b_sponsorship: e.target.value as H1BSponsorship }))}>
              <option>Unknown</option>
              <option>Confirmed</option>
              <option>Not Offered</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Referral Source</label>
            <input className={inputClass} placeholder="Anh Tran" value={form.referral_source} onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !form.company || !form.role}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
