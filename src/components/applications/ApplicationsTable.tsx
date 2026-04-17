import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Ghost, ArrowRight, Plus, Trash2, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Application, Priority, AppStatus, Outcome, Stage, STAGES, PRIORITIES, STATUSES, OUTCOMES } from '../../lib/types';
import { PriorityPill } from '../common/PriorityPill';
import { OutcomePill, StatusPill } from '../common/StatusPill';
import { formatRelativeDate, isStale, getStageIndex } from '../../lib/utils';
import { NewApplicationModal } from './NewApplicationModal';

interface Props {
  filterStage?: Stage | null;
  activeOnly?: boolean;
}

type SortKey = 'company' | 'priority' | 'current_stage' | 'updated_at' | 'status' | 'outcome';
type SortDir = 'asc' | 'desc';

export function ApplicationsTable({ filterStage, activeOnly }: Props) {
  const { applications, events, darkMode, setView, markGhosted, advanceStage, deleteApplication, updateApplication } = useStore();
  const [search, setSearch] = useState('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [statuses, setStatuses] = useState<AppStatus[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'priority', dir: 'asc' });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<{ appId: string; field: 'status' | 'outcome' | 'stage' } | null>(null);
  const [editingRole, setEditingRole] = useState<{ appId: string; value: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  useEffect(() => {
    if (editingRole) {
      roleInputRef.current?.focus();
      roleInputRef.current?.select();
    }
  }, [editingRole?.appId]);

  const commitRoleEdit = () => {
    if (!editingRole) return;
    const trimmed = editingRole.value.trim();
    if (trimmed) updateApplication(editingRole.appId, { role: trimmed });
    setEditingRole(null);
  };

  const getLastActivity = (app: Application) => {
    const appEvents = events.filter(e => e.application_id === app.id);
    if (appEvents.length === 0) return app.updated_at;
    return appEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date;
  };

  const getNextEvent = (app: Application) => {
    const now = new Date();
    const upcoming = events
      .filter(e => e.application_id === app.id && e.event_type === 'Scheduled' && new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  };

  const filtered = useMemo(() => {
    let list = [...applications];

    if (!showAll) {
      list = list.filter(a => a.status !== 'Closed');
    }
    if (filterStage) {
      list = list.filter(a => a.current_stage === filterStage);
    }
    if (priorities.length > 0) {
      list = list.filter(a => priorities.includes(a.priority));
    }
    if (stages.length > 0) {
      list = list.filter(a => stages.includes(a.current_stage));
    }
    if (statuses.length > 0) {
      list = list.filter(a => statuses.includes(a.status));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.recruiter_name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sort.key === 'priority') {
        const order: Record<Priority, number> = { P0: 0, 'P0.5': 1, P1: 2, P2: 3 };
        av = order[a.priority];
        bv = order[b.priority];
      } else if (sort.key === 'current_stage') {
        av = getStageIndex(a.current_stage);
        bv = getStageIndex(b.current_stage);
      } else if (sort.key === 'updated_at') {
        av = getLastActivity(a);
        bv = getLastActivity(b);
      } else if (sort.key === 'outcome') {
        av = a.outcome ?? '';
        bv = b.outcome ?? '';
      } else {
        av = a[sort.key] as string;
        bv = b[sort.key] as string;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [applications, events, search, priorities, stages, statuses, showAll, filterStage, sort, activeOnly]);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sort.key === col ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const thClass = `text-left text-xs font-medium cursor-pointer select-none px-3 py-2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`;
  const tdClass = `px-3 py-2.5 text-sm`;

  const toggleMulti = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const InlineDropdown = ({
    appId, field, options, currentVal, renderCurrent, renderOption,
  }: {
    appId: string;
    field: 'status' | 'outcome' | 'stage';
    options: string[];
    currentVal: string | null | undefined;
    renderCurrent: () => React.ReactNode;
    renderOption: (val: string) => React.ReactNode;
  }) => {
    const isOpen = openDropdown?.appId === appId && openDropdown?.field === field;
    return (
      <div className="relative inline-block" ref={isOpen ? dropdownRef : undefined}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : { appId, field });
          }}
          className="cursor-pointer"
        >
          {renderCurrent()}
        </div>
        {isOpen && (
          <div className={`absolute left-0 top-full mt-1 z-20 rounded-lg shadow-xl border py-1 min-w-max ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {options.map(opt => (
              <button
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  if (field === 'status') updateApplication(appId, { status: opt as AppStatus });
                  else if (field === 'outcome') updateApplication(appId, { outcome: opt === '— Clear —' ? null : opt as Outcome });
                  else if (field === 'stage') updateApplication(appId, { current_stage: opt as Stage });
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                  opt === currentVal
                    ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {renderOption(opt)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const FilterChip = <T extends string>({ val, selected, onClick }: { val: T; selected: boolean; onClick: () => void }) => (
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

  return (
    <div>
      {!activeOnly && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className={`flex-1 min-w-48 px-3 py-1.5 rounded-lg text-sm border outline-none ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
              placeholder="Search company, role, recruiter..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={() => setShowAll(s => !s)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${showAll
                ? darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-700'
                : darkMode ? 'border-gray-700 text-gray-500 hover:border-gray-500' : 'border-gray-300 text-gray-500'}`}
            >
              {showAll ? 'Show Active Only' : 'Show All'}
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 font-medium"
            >
              <Plus size={12} /> New
            </button>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Priority:</span>
            {PRIORITIES.map(p => <FilterChip key={p} val={p} selected={priorities.includes(p)} onClick={() => toggleMulti(priorities, p, setPriorities)} />)}
            <span className={`text-xs ml-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Stage:</span>
            {STAGES.map(s => <FilterChip key={s} val={s} selected={stages.includes(s)} onClick={() => toggleMulti(stages, s, setStages)} />)}
          </div>
        </div>
      )}

      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
              <th className={thClass} onClick={() => toggleSort('priority')}>Priority <SortIcon col="priority" /></th>
              <th className={thClass} onClick={() => toggleSort('company')}>Company <SortIcon col="company" /></th>
              <th className={`${thClass} hidden md:table-cell`}>Role</th>
              <th className={`${thClass} hidden lg:table-cell`} onClick={() => toggleSort('current_stage')}>Stage <SortIcon col="current_stage" /></th>
              <th className={thClass} onClick={() => toggleSort('status')}>Status <SortIcon col="status" /></th>
              <th className={thClass} onClick={() => toggleSort('outcome')}>Outcome <SortIcon col="outcome" /></th>
              <th className={thClass} onClick={() => toggleSort('updated_at')}>Last Activity <SortIcon col="updated_at" /></th>
              <th className={`${thClass} hidden xl:table-cell`}>Next Event</th>
              <th className={`${thClass} hidden lg:table-cell`}>Recruiter</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className={`text-center py-12 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  No applications found
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const lastActivity = getLastActivity(app);
                const nextEvent = getNextEvent(app);
                const stale = isStale(lastActivity) && app.status === 'Active';

                return (
                  <tr
                    key={app.id}
                    className={`border-b cursor-pointer transition-colors ${
                      darkMode
                        ? 'border-gray-800 hover:bg-gray-800/50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => setView('detail', app.id)}
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
                      {app.referral_source && (
                        <span className={`ml-1.5 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>↑{app.referral_source.split(' ')[0]}</span>
                      )}
                    </td>
                    <td className={`${tdClass} hidden md:table-cell`} onClick={e => e.stopPropagation()}>
                      {editingRole?.appId === app.id ? (
                        <input
                          ref={roleInputRef}
                          value={editingRole.value}
                          onChange={e => setEditingRole({ appId: app.id, value: e.target.value })}
                          onBlur={commitRoleEdit}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRoleEdit();
                            if (e.key === 'Escape') setEditingRole(null);
                          }}
                          className={`w-full text-sm rounded px-1.5 py-0.5 outline-none border ${
                            darkMode
                              ? 'bg-gray-800 border-blue-500 text-white'
                              : 'bg-white border-blue-400 text-gray-900'
                          }`}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingRole({ appId: app.id, value: app.role })}
                          className={`text-sm cursor-text hover:underline decoration-dashed underline-offset-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          {app.role}
                        </span>
                      )}
                    </td>
                    <td className={`${tdClass} hidden lg:table-cell`}>
                      <InlineDropdown
                        appId={app.id}
                        field="stage"
                        options={STAGES}
                        currentVal={app.current_stage}
                        renderCurrent={() => (
                          <span className={`text-xs font-mono hover:underline decoration-dashed underline-offset-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}>
                            {app.current_stage}
                            <span className={`ml-1.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{getStageIndex(app.current_stage) + 1}/{STAGES.length}</span>
                          </span>
                        )}
                        renderOption={(opt) => (
                          <span className="font-mono">{opt}</span>
                        )}
                      />
                    </td>
                    <td className={tdClass}>
                      <InlineDropdown
                        appId={app.id}
                        field="status"
                        options={STATUSES}
                        currentVal={app.status}
                        renderCurrent={() => <StatusPill status={app.status} />}
                        renderOption={(opt) => <StatusPill status={opt as AppStatus} />}
                      />
                    </td>
                    <td className={tdClass}>
                      <InlineDropdown
                        appId={app.id}
                        field="outcome"
                        options={['— Clear —', ...OUTCOMES]}
                        currentVal={app.outcome}
                        renderCurrent={() => app.outcome
                          ? <OutcomePill outcome={app.outcome} />
                          : <span className={`text-xs ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}>—</span>
                        }
                        renderOption={(opt) => opt === '— Clear —'
                          ? <span className={`text-xs italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{opt}</span>
                          : <OutcomePill outcome={opt as Outcome} />
                        }
                      />
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>
                      <span className={stale ? 'text-red-400' : darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {formatRelativeDate(lastActivity)}
                      </span>
                    </td>
                    <td className={`${tdClass} hidden xl:table-cell text-xs font-mono`}>
                      {nextEvent ? (
                        <span className="text-blue-400">{nextEvent.date} · {nextEvent.stage}</span>
                      ) : (
                        <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>—</span>
                      )}
                    </td>
                    <td className={`${tdClass} hidden lg:table-cell text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {app.recruiter_name || '—'}
                    </td>
                    <td className={tdClass} onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === app.id ? null : app.id)}
                          className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenu === app.id && (
                          <div className={`absolute right-0 top-7 z-10 rounded-lg shadow-xl border py-1 w-44 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <button onClick={() => { setView('detail', app.id); setOpenMenu(null); }} className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                              <Eye size={12} /> View Details
                            </button>
                            <button onClick={() => { advanceStage(app.id); setOpenMenu(null); }} className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                              <ArrowRight size={12} /> Advance Stage
                            </button>
                            <button onClick={() => { markGhosted(app.id); setOpenMenu(null); }} className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-purple-400' : 'hover:bg-gray-50 text-purple-600'}`}>
                              <Ghost size={12} /> Mark Ghosted
                            </button>
                            <div className={`my-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />
                            <button onClick={() => { deleteApplication(app.id); setOpenMenu(null); }} className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-500'}`}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </div>

      {showNew && <NewApplicationModal onClose={() => setShowNew(false)} onCreated={(id) => setView('detail', id)} />}
    </div>
  );
}
