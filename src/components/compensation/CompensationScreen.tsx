import { useStore } from '../../store/useStore';
import { CompensationTable } from './CompensationTable';

export function CompensationScreen() {
  const { darkMode } = useStore();

  return (
    <div>
      <div className="mb-5">
        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compensation</h1>
        <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Track and compare compensation across all applications. Click any value to edit inline.
        </p>
      </div>
      <CompensationTable />
    </div>
  );
}
