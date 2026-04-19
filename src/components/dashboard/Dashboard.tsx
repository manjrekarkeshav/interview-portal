import { useState } from 'react';
import { Plus, Upload, Activity } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PipelineFunnel } from './PipelineFunnel';
import { UpcomingEvents } from './UpcomingEvents';
import { NewApplicationModal } from '../applications/NewApplicationModal';
import { ApplicationsTable } from '../applications/ApplicationsTable';
import { Stage } from '../../lib/types';
import { parseCSV } from '../../lib/csvImport';

export function Dashboard() {
  const { darkMode, importApplications, setView, applications } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [stageFilter, setStageFilter] = useState<Stage | null>(null);
  const [importing, setImporting] = useState(false);

  const activeCount = applications.filter(a => a.status !== 'Closed').length;

  const handleCSVImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const text = await file.text();
        const { applications, events, errors } = parseCSV(text);
        if (errors.length > 0) {
          console.warn('CSV import errors:', errors);
        }
        await importApplications(applications, events);
        alert(`Imported ${applications.length} applications with ${events.length} events.`);
      } catch (err) {
        alert('Failed to import CSV: ' + String(err));
      }
      setImporting(false);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Your job search at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCSVImport}
            disabled={importing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload size={12} />
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 font-medium transition-colors"
          >
            <Plus size={12} />
            New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className={`rounded-xl p-4 border flex items-center justify-between ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div>
              <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Active Pipeline</p>
              <p className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activeCount}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>applications in flight</p>
            </div>
            <Activity size={20} className="text-blue-400 shrink-0" />
          </div>
          <PipelineFunnel onStageClick={(s) => setStageFilter(s)} />
        </div>
        <UpcomingEvents />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Active Pipeline
            {stageFilter && (
              <button onClick={() => setStageFilter(null)} className="ml-2 text-xs text-blue-400 font-normal">
                (filtered: {stageFilter}) ×
              </button>
            )}
          </h2>
          <button onClick={() => setView('applications')} className="text-xs text-blue-400 hover:text-blue-300">
            View all →
          </button>
        </div>
        <ApplicationsTable filterStage={stageFilter} activeOnly />
      </div>

      {showNew && <NewApplicationModal onClose={() => setShowNew(false)} onCreated={(id) => setView('detail', id)} />}
    </div>
  );
}
