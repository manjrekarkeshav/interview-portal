import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Application, AppStatus, Priority, PRIORITIES, STATUSES } from '../../lib/types';
import { PriorityPill } from '../common/PriorityPill';
import { StatusPill } from '../common/StatusPill';

type SortKey = 'priority' | 'company' | 'base' | 'bonus' | 'annual_equity' | 'total_equity' | 'total_package' | 'status';
type SortDir = 'asc' | 'desc';

interface EditingCell {
  appId: string;
  field: 'base' | 'bonus' | 'annual_equity' | 'total_equity' | 'notes';
  value: string;
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, 'P0.5': 1, P1: 2, P2: 3 };

function fmt(n: number) {
  if (!n) return '—';
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 0)}k`;
  return `$${n.toLocaleString()}`;
}

function fmtFull(n: number) {
  if (!n) return '$0';
  return `$${n.toLocaleString()}`;
}

export function CompensationTable() {
  const { applications, compensations, darkMode, upsertCompensation, updateApplication } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatus[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'priority', dir: 'asc' });
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      (inputRef.current as HTMLInputElement | null)?.focus();
      (inputRef.current as HTMLInputElement | null)?.select();
    }
  }, [editing?.appId, editing?.field]);

  const compByApp = useMemo(() => {
    const map: Record<string, typeof compensations[0]> = {};
    compensations.forEach(c => { map[c.application_id] = c; });
    return map;
  }, [compensations]);

  const rows = useMemo(() => {
    let list = [...applications].filter(a => a.status !== 'Closed' || statusFilter.includes('Closed'));

    if (statusFilter.length > 0) {
      list = list.filter(a => statusFilter.includes(a.status));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const ca = compByApp[a.id];
      const cb = compByApp[b.id];
      let av: number, bv: number;

      if (sort.key === 'priority') {
        av = PRIORITY_ORDER[a.priority];
        bv = PRIORITY_ORDER[b.priority];
      } else if (sort.key === 'company') {
        const cmp = a.company.localeCompare(b.company);
        return sort.dir === 'asc' ? cmp : -cmp;
      } else if (sort.key === 'status') {
        const cmp = a.status.localeCompare(b.status);
        return sort.dir === 'asc' ? cmp : -cmp;
      } else if (sort.key === 'base') {
        av = ca?.base ?? 0; bv = cb?.base ?? 0;
      } else if (sort.key === 'bonus') {
        av = ca?.bonus ?? 0; bv = cb?.bonus ?? 0;
      } else if (sort.key === 'annual_equity') {
        av = ca?.annual_equity ?? 0; bv = cb?.annual_equity ?? 0;
      } else if (sort.key === 'total_equity') {
        av = ca?.total_equity ?? 0; bv = cb?.total_equity ?? 0;
      } else {
        const aTotal = (ca?.base ?? 0) + (ca?.bonus ?? 0) + (ca?.annual_equity ?? 0);
        const bTotal = (cb?.base ?? 0) + (cb?.bonus ?? 0) + (cb?.annual_equity ?? 0);
        av = aTotal; bv = bTotal;
      }
      const cmp = av - bv;
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [applications, compensations, compByApp, search, statusFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sort.key === col ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null;

  const toggleStatus = (s: AppStatus) => {
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const startEdit = (appId: string, field: EditingCell['field'], current: number | string) => {
    setEditing({ appId, field, value: String(current === 0 ? '' : current) });
  };

  const commitEdit = async () => {
    if (!editing) return;
    const { appId, field, value } = editing;
    setEditing(null);

    if (field === 'notes') {
      const existing = compByApp[appId];
      await upsertCompensation({
        application_id: appId,
        base: existing?.base ?? 0,
        bonus: existing?.bonus ?? 0,
        annual_equity: existing?.annual_equity ?? 0,
        total_equity: existing?.total_equity ?? 0,
        notes: value,
      });
      return;
    }

    const num = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const existing = compByApp[appId];
    await upsertCompensation({
      application_id: appId,
      base: field === 'base' ? num : (existing?.base ?? 0),
      bonus: field === 'bonus' ? num : (existing?.bonus ?? 0),
      annual_equity: field === 'annual_equity' ? num : (existing?.annual_equity ?? 0),
      total_equity: field === 'total_equity' ? num : (existing?.total_equity ?? 0),
      notes: existing?.notes ?? '',
    });
  };

  const thClass = `text-left text-xs font-medium cursor-pointer select-none px-3 py-2.5 whitespace-nowrap ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`;
  const tdClass = `px-3 py-2.5 text-sm`;

  const FilterChip = ({ val, selected, onClick }: { val: AppStatus; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs border transition-colors ${selected
        ? darkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-500 border-blue-500 text-white'
        : darkMode ? 'border-gray-700 text-gray-500 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'
      }`}
    >
      {val}
    </button>
  );

  const EditableNumericCell = ({ app, field }: { app: Application; field: 'base' | 'bonus' | 'annual_equity' | 'total_equity' }) => {
    const comp = compByApp[app.id];
    const val = comp?.[field] ?? 0;
    const isEditing = editing?.appId === app.id && editing?.field === field;

    if (isEditing) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={editing!.value}
          onChange={e => setEditing(prev => prev ? { ...prev, value: e.target.value } : null)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(null);
          }}
          className={`w-24 text-sm rounded px-1.5 py-0.5 outline-none border font-mono ${
            darkMode ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-400 text-gray-900'
          }`}
        />
      );
    }

    return (
      <span
        onClick={e => { e.stopPropagation(); startEdit(app.id, field, val); }}
        className={`font-mono text-xs cursor-text hover:underline decoration-dashed underline-offset-2 ${
          val ? (darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-gray-900')
              : (darkMode ? 'text-gray-700 hover:text-gray-500' : 'text-gray-300 hover:text-gray-500')
        }`}
      >
        {val ? fmtFull(val) : '—'}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className={`flex-1 min-w-48 px-3 py-1.5 rounded-lg text-sm border outline-none ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Status:</span>
          {STATUSES.map(s => (
            <FilterChip key={s} val={s} selected={statusFilter.includes(s)} onClick={() => toggleStatus(s)} />
          ))}
        </div>
      </div>

      <div className={`rounded-xl border overflow-x-auto ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
              <th className={thClass} onClick={() => toggleSort('priority')}>
                <span className="flex items-center gap-1">Priority <SortIcon col="priority" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('company')}>
                <span className="flex items-center gap-1">Company <SortIcon col="company" /></span>
              </th>
              <th className={thClass}>Role</th>
              <th className={thClass} onClick={() => toggleSort('base')}>
                <span className="flex items-center gap-1">Base <SortIcon col="base" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('bonus')}>
                <span className="flex items-center gap-1">Bonus <SortIcon col="bonus" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('annual_equity')}>
                <span className="flex items-center gap-1">Yearly Equity <SortIcon col="annual_equity" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('total_equity')}>
                <span className="flex items-center gap-1">Total Equity <SortIcon col="total_equity" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('total_package')}>
                <span className="flex items-center gap-1">Yearly Package <SortIcon col="total_package" /></span>
              </th>
              <th className={thClass} onClick={() => toggleSort('status')}>
                <span className="flex items-center gap-1">Status <SortIcon col="status" /></span>
              </th>
              <th className={thClass}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className={`text-center py-12 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  No applications found
                </td>
              </tr>
            ) : (
              rows.map(app => {
                const comp = compByApp[app.id];
                const base = comp?.base ?? 0;
                const bonus = comp?.bonus ?? 0;
                const annualEquity = comp?.annual_equity ?? 0;
                const totalPackage = base + bonus + annualEquity;
                const isEditingNotes = editing?.appId === app.id && editing?.field === 'notes';

                return (
                  <tr
                    key={app.id}
                    className={`border-b transition-colors ${darkMode ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50/70'}`}
                  >
                    <td className={tdClass}>
                      <PriorityPill priority={app.priority} onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        const idx = PRIORITIES.indexOf(app.priority);
                        const next = PRIORITIES[(idx + 1) % PRIORITIES.length];
                        updateApplication(app.id, { priority: next });
                      }} />
                    </td>
                    <td className={tdClass}>
                      <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.company}</span>
                    </td>
                    <td className={`${tdClass} max-w-[180px]`}>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.role}</span>
                    </td>
                    <td className={tdClass} onClick={e => e.stopPropagation()}>
                      <EditableNumericCell app={app} field="base" />
                    </td>
                    <td className={tdClass} onClick={e => e.stopPropagation()}>
                      <EditableNumericCell app={app} field="bonus" />
                    </td>
                    <td className={tdClass} onClick={e => e.stopPropagation()}>
                      <EditableNumericCell app={app} field="annual_equity" />
                    </td>
                    <td className={tdClass} onClick={e => e.stopPropagation()}>
                      <EditableNumericCell app={app} field="total_equity" />
                    </td>
                    <td className={`${tdClass}`}>
                      <span className={`font-mono text-xs font-medium ${
                        totalPackage > 0
                          ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                          : darkMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {totalPackage > 0 ? fmtFull(totalPackage) : '—'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={app.status} />
                    </td>
                    <td className={`${tdClass} max-w-[200px]`} onClick={e => e.stopPropagation()}>
                      {isEditingNotes ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          value={editing!.value}
                          onChange={e => setEditing(prev => prev ? { ...prev, value: e.target.value } : null)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          className={`w-full text-xs rounded px-1.5 py-0.5 outline-none border ${
                            darkMode ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-400 text-gray-900'
                          }`}
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(app.id, 'notes', comp?.notes ?? '')}
                          className={`text-xs cursor-text truncate block max-w-[180px] hover:underline decoration-dashed underline-offset-2 ${
                            comp?.notes
                              ? darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                              : darkMode ? 'text-gray-700 hover:text-gray-500' : 'text-gray-300 hover:text-gray-500'
                          }`}
                        >
                          {comp?.notes || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {rows.length} result{rows.length !== 1 ? 's' : ''}
        {rows.length > 0 && (() => {
          const withComp = rows.filter(a => compByApp[a.id]?.base);
          if (withComp.length === 0) return null;
          const avg = withComp.reduce((sum, a) => {
            const c = compByApp[a.id];
            return sum + (c.base + c.bonus + c.annual_equity);
          }, 0) / withComp.length;
          return <span className="ml-3">avg package: <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{fmtFull(Math.round(avg))}</span></span>;
        })()}
      </div>
    </div>
  );
}
