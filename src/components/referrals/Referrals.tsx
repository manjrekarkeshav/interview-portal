import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../lib/auth';
import { ReferralStatus } from '../../lib/types';

export function Referrals() {
  const { referrals, createReferral, updateReferral, deleteReferral, applications, darkMode, setView } = useStore();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company: '', poc_name: '', status: 'Reached out' as ReferralStatus, application_id: '' });

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;

  const handleCreate = async () => {
    if (!form.company || !form.poc_name) return;
    await createReferral({
      ...form,
      referred: false,
      application_id: form.application_id || null,
    } as any);
    setForm({ company: '', poc_name: '', status: 'Reached out', application_id: '' });
    setAdding(false);
  };

  const statusColors: Record<ReferralStatus, string> = {
    'Reached out': darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700',
    'In progress': darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700',
    'Closed': darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Referrals</h1>
        {isAdmin && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 font-medium"
          >
            <Plus size={12} /> Add Referral
          </button>
        )}
      </div>

      {adding && (
        <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-900 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Company</label>
              <input className={inputClass} placeholder="Google" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Point of Contact</label>
              <input className={inputClass} placeholder="Anh Tran" value={form.poc_name} onChange={e => setForm(f => ({ ...f, poc_name: e.target.value }))} />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReferralStatus }))}>
                <option>Reached out</option>
                <option>In progress</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Linked Application</label>
              <select className={inputClass} value={form.application_id} onChange={e => setForm(f => ({ ...f, application_id: e.target.value }))}>
                <option value="">None</option>
                {applications.map(a => <option key={a.id} value={a.id}>{a.company} – {a.role}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500">Add</button>
            <button onClick={() => setAdding(false)} className={`px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
          </div>
        </div>
      )}

      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
              <th className={`text-left text-xs font-medium px-4 py-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Company</th>
              <th className={`text-left text-xs font-medium px-4 py-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Contact</th>
              <th className={`text-left text-xs font-medium px-4 py-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Status</th>
              <th className={`text-left text-xs font-medium px-4 py-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Referred</th>
              <th className={`text-left text-xs font-medium px-4 py-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Application</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={6} className={`text-center py-12 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  No referrals yet
                </td>
              </tr>
            ) : (
              referrals.map(ref => {
                const linkedApp = applications.find(a => a.id === ref.application_id);
                return (
                  <tr key={ref.id} className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ref.company}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ref.poc_name}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={ref.status}
                          onChange={e => updateReferral(ref.id, { status: e.target.value as ReferralStatus })}
                          className={`text-xs rounded px-2 py-1 border-0 outline-none cursor-pointer ${statusColors[ref.status]}`}
                        >
                          <option>Reached out</option>
                          <option>In progress</option>
                          <option>Closed</option>
                        </select>
                      ) : (
                        <span className={`text-xs rounded px-2 py-1 ${statusColors[ref.status]}`}>{ref.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={isAdmin ? () => updateReferral(ref.id, { referred: !ref.referred }) : undefined}
                        disabled={!isAdmin}
                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          ref.referred
                            ? 'bg-green-600 border-green-600 text-white'
                            : darkMode ? 'border-gray-700' : 'border-gray-300'
                        } ${isAdmin ? (ref.referred ? '' : darkMode ? 'hover:border-gray-500' : 'hover:border-gray-400') : 'cursor-default opacity-70'}`}
                      >
                        {ref.referred && <Check size={12} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {linkedApp ? (
                        <button
                          onClick={() => setView('detail', linkedApp.id)}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {linkedApp.company} <ExternalLink size={10} />
                        </button>
                      ) : (
                        <span className={`text-xs ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <button
                          onClick={() => deleteReferral(ref.id)}
                          className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-600 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
