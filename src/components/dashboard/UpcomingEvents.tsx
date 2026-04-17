import { useStore } from '../../store/useStore';
import { Calendar, AlertTriangle } from 'lucide-react';
import { formatDate, isStale } from '../../lib/utils';

export function UpcomingEvents() {
  const { applications, events, darkMode, setView } = useStore();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcoming = events
    .filter(e => {
      const d = new Date(e.date.includes('T') ? e.date : e.date.replace(/-/g, '/'));
      return e.event_type === 'Scheduled' && d >= todayStart && d <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
    .map(e => {
      const app = applications.find(a => a.id === e.application_id);
      return { event: e, app };
    })
    .filter(({ app }) => !!app);

  const stale = applications.filter(a => {
    if (a.status === 'Closed') return false;
    if (a.priority !== 'P0' && a.priority !== 'P0.5') return false;
    return isStale(a.updated_at);
  });

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-blue-400" />
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Next 7 Days ({upcoming.length})
          </h3>
        </div>
        {upcoming.length === 0 ? (
          <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No scheduled events</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(({ event, app }) => (
              <div
                key={event.id}
                className={`flex items-start gap-2 cursor-pointer rounded-lg p-2 transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                onClick={() => setView('detail', app!.id)}
              >
                <span className="text-xs font-mono mt-0.5 shrink-0 text-blue-400">{formatDate(event.date)}</span>
                <div>
                  <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app?.company}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{event.description || event.stage}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stale.length > 0 && (
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Stale P0/P0.5 ({stale.length})
            </h3>
          </div>
          <div className="space-y-1">
            {stale.map(app => (
              <div
                key={app.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setView('detail', app.id)}
              >
                <span className={`text-xs font-medium ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>{app.company}</span>
                <span className={`text-xs font-mono ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{app.current_stage}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
