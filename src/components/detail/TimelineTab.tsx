import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Application } from '../../lib/types';
import { getEventIcon, formatDate } from '../../lib/utils';
import { LogEventModal } from './LogEventModal';

interface Props {
  app: Application;
}

export function TimelineTab({ app }: Props) {
  const { events, deleteEvent, darkMode, advanceStage, markGhosted } = useStore();
  const [showLog, setShowLog] = useState(false);

  const appEvents = events
    .filter(e => e.application_id === app.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 font-medium"
          >
            <Plus size={12} /> Log Event
          </button>
          <button
            onClick={() => advanceStage(app.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            → Advance Stage
          </button>
          <button
            onClick={() => markGhosted(app.id)}
            className="px-3 py-1.5 rounded-lg text-xs border border-purple-800 text-purple-400 hover:bg-purple-900/30 font-medium"
          >
            👻 Mark Ghosted
          </button>
        </div>
      </div>

      {appEvents.length === 0 ? (
        <div className={`text-center py-12 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          No events yet. Log your first event above.
        </div>
      ) : (
        <div className="space-y-1">
          {appEvents.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 rounded-lg group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
            >
              <span className="text-base mt-0.5 shrink-0">{getEventIcon(event.event_type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(event.date)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {event.event_type}
                  </span>
                  {event.stage && (
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>· {event.stage}</span>
                  )}
                </div>
                {event.description && (
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{event.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteEvent(event.id)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${darkMode ? 'hover:bg-gray-700 text-gray-600 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showLog && <LogEventModal applicationId={app.id} currentStage={app.current_stage} onClose={() => setShowLog(false)} />}
    </div>
  );
}
