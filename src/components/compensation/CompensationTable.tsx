import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Application, AppStatus, Compensation, Priority, PRIORITIES, STATUSES } from '../../lib/types';
import { PriorityPill } from '../common/PriorityPill';
import { StatusPill } from '../common/StatusPill';

type SortKey = 'priority' | 'company' | 'base' | 'bonus' | 'annual_equity' | 'total_equity' | 'total_package' | 'status';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, 'P0.5': 1, P1: 2, P2: 3 };

function fmtFull(n: number) {
  return `$${n.toLocaleString()}`;
}

interface CellProps {
  app: Application;
  field: 'base' | 'bonus' | 'annual_equity' | 'total_equity';
  comp: Compensation | undefined;
  darkMode: boolean;
  onCommit: (appId: string, field: 'base' | 'bonus' | 'annual_equity' | 'total_equity', value: number) => void;
  onLiveChange?: (field: 'base' | 'bonus' | 'annual_equity' | 'total_equity', value: number) => void;
}

function EditableNumericCell({ app, field, comp, darkMode, onCommit, onLiveChange }: CellProps) {
  const stored = comp?.[field] ?? 0;
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputVal(stored === 0 ? '' : String(stored));
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const num = parseFloat(inputVal.replace(/[^0-9.]/g, '')) || 0;
    onCommit(app.id, field, num);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        inputMode="numeric"
        value={inputVal}
        onChange={e => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          setInputVal(raw);
          const num = parseFloat(raw) || 0;
          onLiveChange?.(field, num);
        }}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setEditing(false);
            onLiveChange?.(field, stored);
          }
        }}
        className={`w-24 text-sm rounded px-1.5 py-0.5 outline-none border font-mono ${
          darkMode ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-400 text-gray-900'
        }`}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`font-mono text-xs cursor-text hover:underline decoration-dashed underline-offset-2 ${
        darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-gray-900'
      }`}
    >
      {fmtFull(stored)}
    </span>
  );
}

interface NotesProps {
  app: Application;
  comp: Compensation | undefined;
  darkMode: boolean;
  onCommit: (appId: string, notes: string) => void;
}

function NotesCell({ app, comp, darkMode, onCommit }: NotesProps) {
  const stored = comp?.notes ?? '';
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');

  const commit = () => {
    setEditing(false);
    onCommit(app.id, val);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`w-full text-xs rounded px-1.5 py-0.5 outline-none border ${
          darkMode ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-400 text-gray-900'
        }`}
      />
    );
  }

  return (
    <span
      onClick={e => { e.stopPropagation(); setVal(stored); setEditing(true); }}
      className={`text-xs cursor-text truncate block max-w-[180px] hover:underline decoration-dashed underline-offset-2 ${
        stored
          ? darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
          : darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {stored || '—'}
    </span>
  );
}

function CompensationRow({
  app,
  comp,
  darkMode,
  onCommitField,
  onCommitNotes,
  onUpdateApplication,
}: {
  app: Application;
  comp: Compensation | undefined;
  darkMode: boolean;
  onCommitField: (appId: string, field: 'base' | 'bonus' | 'annual_equity' | 'total_equity', value: number) => void;
  onCommitNotes: (appId: string, notes: string) => void;
  onUpdateApplication: (id: string, updates: Partial<Application>) => void;
}) {
  const storedBase = comp?.base ?? 0;
  const storedBonus = comp?.bonus ?? 0;
  const storedEquity = comp?.annual_equity ?? 0;

  const [liveBase, setLiveBase] = useState(storedBase);
  const [liveBonus, setLiveBonus] = useState(storedBonus);
  const [liveEquity, setLiveEquity] = useState(storedEquity);

  useMemo(() => { setLiveBase(storedBase); }, [storedBase]);
  useMemo(() => { setLiveBonus(storedBonus); }, [storedBonus]);
  useMemo(() => { setLiveEquity(storedEquity); }, [storedEquity]);

  const liveTotal = liveBase + liveBonus + liveEquity;

  const handleLiveChange = (field: 'base' | 'bonus' | 'annual_equity' | 'total_equity', value: number) => {
    if (field === 'base') setLiveBase(value);
    else if (field === 'bonus') setLiveBonus(value);
    else if (field === 'annual_equity') setLiveEquity(value);
  };

  const tdClass = `px-3 py-2.5 text-sm`;

  return (
    <tr className={`border-b transition-colors ${darkMode ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50/70'}`}>
      <td className={tdClass}>
        <PriorityPill priority={app.priority} onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          const idx = PRIORITIES.indexOf(app.priority);
          const next = PRIORITIES[(idx + 1) % PRIORITIES.length];
          onUpdateApplication(app.id, { priority: next });
        }} />
      </td>
      <td className={tdClass}>
        <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.company}</span>
      </td>
      <td className={`${tdClass} max-w-[180px]`}>
        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.role}</span>
      </td>
      <td className={tdClass} onClick={e => e.stopPropagation()}>
        <EditableNumericCell app={app} field="base" comp={comp} darkMode={darkMode} onCommit={onCommitField} onLiveChange={handleLiveChange} />
      </td>
      <td className={tdClass} onClick={e => e.stopPropagation()}>
        <EditableNumericCell app={app} field="bonus" comp={comp} darkMode={darkMode} onCommit={onCommitField} onLiveChange={handleLiveChange} />
      </td>
      <td className={tdClass} onClick={e => e.stopPropagation()}>
        <EditableNumericCell app={app} field="annual_equity" comp={comp} darkMode={darkMode} onCommit={onCommitField} onLiveChange={handleLiveChange} />
      </td>
      <td className={tdClass} onClick={e => e.stopPropagation()}>
        <EditableNumericCell app={app} field="total_equity" comp={comp} darkMode={darkMode} onCommit={onCommitField} />
      </td>
      <td className={tdClass}>
        <span className={`font-mono text-xs font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {fmtFull(liveTotal)}
        </span>
      </td>
      <td className={tdClass}>
        <StatusPill status={app.status} />
      </td>
      <td className={`${tdClass} max-w-[200px]`} onClick={e => e.stopPropagation()}>
        <NotesCell app={app} comp={comp} darkMode={darkMode} onCommit={onCommitNotes} />
      </td>
    </tr>
  );
}

export function CompensationTable() {
  const { applications, compensations, darkMode, upsertCompensation, updateApplication } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatus[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'priority', dir: 'asc' });

  const compByApp = useMemo(() => {
    const map: Record<string, Compensation> = {};
    compensations.forEach(c => { map[c.application_id] = c; });
    return map;
  }, [compensations]);

  const rows = useMemo(() => {
    let list = [...applications];

    if (statusFilter.length > 0) {
      list = list.filter(a => statusFilter.includes(a.status));
    } else {
      list = list.filter(a => a.status !== 'Closed');
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
        av = (ca?.base ?? 0) + (ca?.bonus ?? 0) + (ca?.annual_equity ?? 0);
        bv = (cb?.base ?? 0) + (cb?.bonus ?? 0) + (cb?.annual_equity ?? 0);
      }
      const cmp = av - bv;
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [applications, compByApp, search, statusFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sort.key === col ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null;

  const toggleStatus = (s: AppStatus) => {
    setStatusFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleCommitField = async (appId: string, field: 'base' | 'bonus' | 'annual_equity' | 'total_equity', value: number) => {
    const existing = compByApp[appId];
    await upsertCompensation({
      application_id: appId,
      base: field === 'base' ? value : (existing?.base ?? 0),
      bonus: field === 'bonus' ? value : (existing?.bonus ?? 0),
      annual_equity: field === 'annual_equity' ? value : (existing?.annual_equity ?? 0),
      total_equity: field === 'total_equity' ? value : (existing?.total_equity ?? 0),
      notes: existing?.notes ?? '',
    });
  };

  const handleCommitNotes = async (appId: string, notes: string) => {
    const existing = compByApp[appId];
    await upsertCompensation({
      application_id: appId,
      base: existing?.base ?? 0,
      bonus: existing?.bonus ?? 0,
      annual_equity: existing?.annual_equity ?? 0,
      total_equity: existing?.total_equity ?? 0,
      notes,
    });
  };

  const thClass = `text-left text-xs font-medium cursor-pointer select-none px-3 py-2.5 whitespace-nowrap ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`;

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

  const avgPackage = useMemo(() => {
    const withComp = rows.filter(a => compByApp[a.id]?.base);
    if (withComp.length === 0) return null;
    const sum = withComp.reduce((acc, a) => {
      const c = compByApp[a.id];
      return acc + (c.base + c.bonus + c.annual_equity);
    }, 0);
    return Math.round(sum / withComp.length);
  }, [rows, compByApp]);

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
              rows.map(app => (
                <CompensationRow
                  key={app.id}
                  app={app}
                  comp={compByApp[app.id]}
                  darkMode={darkMode}
                  onCommitField={handleCommitField}
                  onCommitNotes={handleCommitNotes}
                  onUpdateApplication={updateApplication}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {rows.length} result{rows.length !== 1 ? 's' : ''}
        {avgPackage !== null && (
          <span className="ml-3">avg package: <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{fmtFull(avgPackage)}</span></span>
        )}
      </div>
    </div>
  );
}
