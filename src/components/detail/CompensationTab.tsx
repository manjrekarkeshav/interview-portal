import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Application, Compensation } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  app: Application;
}

export function CompensationTab({ app }: Props) {
  const { compensations, upsertCompensation, applications, darkMode } = useStore();
  const comp = compensations.find(c => c.application_id === app.id);

  const [form, setForm] = useState({
    base: comp?.base ?? 0,
    bonus: comp?.bonus ?? 0,
    annual_equity: comp?.annual_equity ?? 0,
    notes: comp?.notes ?? '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = compensations.find(c => c.application_id === app.id);
    if (c) setForm({ base: c.base, bonus: c.bonus, annual_equity: c.annual_equity, notes: c.notes });
  }, [compensations, app.id]);

  const total = form.base + form.bonus + form.annual_equity;

  const handleSave = async () => {
    await upsertCompensation({ application_id: app.id, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const comparisonData = applications
    .map(a => {
      const c = compensations.find(co => co.application_id === a.id);
      if (!c) return null;
      const t = c.base + c.bonus + c.annual_equity;
      if (t === 0) return null;
      return { name: a.company, total: t, isCurrent: a.id === app.id };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.total - a!.total));

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;
  const labelClass = `block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Estimated Total Comp</div>
        <div className={`text-3xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {total > 0 ? formatCurrency(total) : '—'}
        </div>
        {total > 0 && (
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {formatCurrency(form.base)} base · {formatCurrency(form.bonus)} bonus · {formatCurrency(form.annual_equity)} equity/yr
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Base Salary</label>
          <input
            type="number"
            className={inputClass}
            placeholder="200000"
            value={form.base || ''}
            onChange={e => setForm(f => ({ ...f, base: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className={labelClass}>Annual Bonus</label>
          <input
            type="number"
            className={inputClass}
            placeholder="30000"
            value={form.bonus || ''}
            onChange={e => setForm(f => ({ ...f, bonus: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className={labelClass}>Annual Equity</label>
          <input
            type="number"
            className={inputClass}
            placeholder="50000"
            value={form.annual_equity || ''}
            onChange={e => setForm(f => ({ ...f, annual_equity: Number(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes (vesting, cliff, etc.)</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="e.g. 1Y cliff, 25% each year after..."
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <button
        onClick={handleSave}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
      >
        {saved ? '✓ Saved' : 'Save Compensation'}
      </button>

      {comparisonData.length > 1 && (
        <div>
          <div className={`text-xs font-medium mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>vs. Active Offers</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData as any[]} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? '#6b7280' : '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                />
                <Tooltip
                  contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: number) => [formatCurrency(val), 'Total']}
                  labelStyle={{ color: darkMode ? '#fff' : '#111' }}
                />
                <Bar dataKey="total" radius={4}>
                  {(comparisonData as any[]).map((entry, i) => (
                    <Cell key={i} fill={entry.isCurrent ? '#3b82f6' : (darkMode ? '#374151' : '#e5e7eb')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
