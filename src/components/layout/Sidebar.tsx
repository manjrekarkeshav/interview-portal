import { LayoutDashboard, Table2, BarChart3, Users, Sun, Moon, Download, Upload } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { View } from '../../lib/types';

const navItems: { icon: React.ElementType; label: string; view: View }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: Table2, label: 'Applications', view: 'applications' },
  { icon: BarChart3, label: 'Analytics', view: 'analytics' },
  { icon: Users, label: 'Referrals', view: 'referrals' },
];

export function Sidebar() {
  const { view, setView, darkMode, toggleDarkMode, applications, events, compensations, feedbackNotes, interviewStructures, referrals } = useStore();

  const handleExport = () => {
    const data = { applications, events, compensations, feedbackNotes, interviewStructures, referrals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        alert(`JSON import: ${data.applications?.length || 0} applications found. Use CSV import for bulk import.`);
      } catch {
        alert('Invalid JSON file');
      }
    };
    input.click();
  };

  return (
    <div className={`w-14 flex flex-col items-center py-4 gap-1 border-r ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} fixed left-0 top-0 h-full z-20`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 font-bold text-sm ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
        P
      </div>

      {navItems.map(({ icon: Icon, label, view: v }) => (
        <button
          key={v}
          onClick={() => setView(v)}
          title={label}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            view === v
              ? darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              : darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="mt-auto flex flex-col items-center gap-1">
        <button
          onClick={handleExport}
          title="Export JSON backup"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          <Download size={16} />
        </button>
        <button
          onClick={handleImportJSON}
          title="Import JSON"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          <Upload size={16} />
        </button>
        <button
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
