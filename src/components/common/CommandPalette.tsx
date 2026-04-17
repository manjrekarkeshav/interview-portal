import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowRight, Ghost, Plus, BarChart3, Table2, LayoutDashboard, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface CommandOption {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const { applications, setCommandPaletteOpen, setView, markGhosted, advanceStage, darkMode } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const allOptions = useMemo((): CommandOption[] => {
    const nav: CommandOption[] = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={14} />, action: () => { setView('dashboard'); setCommandPaletteOpen(false); } },
      { id: 'nav-apps', label: 'Go to Applications', icon: <Table2 size={14} />, action: () => { setView('applications'); setCommandPaletteOpen(false); } },
      { id: 'nav-analytics', label: 'Go to Analytics', icon: <BarChart3 size={14} />, action: () => { setView('analytics'); setCommandPaletteOpen(false); } },
      { id: 'nav-referrals', label: 'Go to Referrals', icon: <Users size={14} />, action: () => { setView('referrals'); setCommandPaletteOpen(false); } },
      { id: 'new-app', label: 'New Application', sub: '+ Create', icon: <Plus size={14} />, action: () => { setView('applications'); setCommandPaletteOpen(false); } },
    ];

    const appActions: CommandOption[] = applications.flatMap(app => [
      {
        id: `view-${app.id}`,
        label: `${app.company}`,
        sub: `${app.role} · ${app.current_stage}`,
        icon: <ArrowRight size={14} />,
        action: () => { setView('detail', app.id); setCommandPaletteOpen(false); },
      },
      {
        id: `ghost-${app.id}`,
        label: `Mark ${app.company} as ghosted`,
        sub: app.role,
        icon: <Ghost size={14} />,
        action: () => { markGhosted(app.id); setCommandPaletteOpen(false); },
      },
      {
        id: `advance-${app.id}`,
        label: `Advance ${app.company} stage`,
        sub: `${app.current_stage} → next`,
        icon: <ArrowRight size={14} />,
        action: () => { advanceStage(app.id); setCommandPaletteOpen(false); },
      },
    ]);

    return [...nav, ...appActions];
  }, [applications]);

  const filtered = useMemo(() => {
    if (!query) return allOptions.slice(0, 8);
    const q = query.toLowerCase();
    return allOptions.filter(o =>
      o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, allOptions]);

  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [filtered]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); filtered[selected]?.action(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />
      <div className={`relative w-full max-w-xl rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <Search size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
          <input
            ref={inputRef}
            className={`flex-1 text-sm outline-none bg-transparent ${darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
            placeholder="Search apps, log event, navigate..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd className={`text-xs px-1.5 py-0.5 rounded border font-mono ${darkMode ? 'border-gray-700 text-gray-600' : 'border-gray-200 text-gray-400'}`}>esc</kbd>
        </div>
        <div className="py-1">
          {filtered.length === 0 ? (
            <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No results</div>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={opt.id}
                onClick={opt.action}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selected
                    ? darkMode ? 'bg-gray-800' : 'bg-gray-50'
                    : ''
                }`}
              >
                <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{opt.label}</div>
                  {opt.sub && <div className={`text-xs truncate ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{opt.sub}</div>}
                </div>
                {i === selected && <ArrowRight size={12} className={darkMode ? 'text-gray-600' : 'text-gray-300'} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
