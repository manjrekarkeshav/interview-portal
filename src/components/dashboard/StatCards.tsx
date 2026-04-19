import { useStore } from '../../store/useStore';
import { Activity } from 'lucide-react';

export function StatCards() {
  const { applications, darkMode } = useStore();

  const active = applications.filter(a => a.status !== 'Closed');

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Active Pipeline</span>
          <Activity size={14} className="text-blue-400" />
        </div>
        <div className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{active.length}</div>
        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>applications in flight</div>
      </div>
    </div>
  );
}
