import { useStore } from '../../store/useStore';
import { ApplicationsTable } from './ApplicationsTable';

export function ApplicationsScreen() {
  const { darkMode } = useStore();
  return (
    <div className="space-y-4">
      <div>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Applications</h1>
        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Your full pipeline</p>
      </div>
      <ApplicationsTable />
    </div>
  );
}
