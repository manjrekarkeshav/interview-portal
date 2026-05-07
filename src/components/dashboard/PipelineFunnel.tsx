import { useStore } from '../../store/useStore';
import { STAGES, Stage, AppStatus } from '../../lib/types';

interface Props {
  onStageClick?: (stage: Stage) => void;
}

const STATUS_COLORS: Record<AppStatus, { bg: string; darkBg: string; label: string }> = {
  'Active':           { bg: 'bg-emerald-500', darkBg: 'bg-emerald-500', label: 'Active' },
  'Pending Response': { bg: 'bg-amber-400',   darkBg: 'bg-amber-400',   label: 'Pending Response' },
  'Closed':           { bg: 'bg-rose-500',    darkBg: 'bg-rose-500',    label: 'Closed' },
  'Not Started':      { bg: 'bg-gray-400',    darkBg: 'bg-gray-500',    label: 'Not Started' },
};

const STATUS_ORDER: AppStatus[] = ['Active', 'Pending Response', 'Not Started', 'Closed'];

export function PipelineFunnel({ onStageClick }: Props) {
  const { applications, darkMode } = useStore();

  const stageCounts = STAGES.map(stage => {
    const apps = applications.filter(a => a.current_stage === stage);

    const byStatus: Record<AppStatus, number> = {
      'Active': 0,
      'Pending Response': 0,
      'Closed': 0,
      'Not Started': 0,
    };
    apps.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    return { stage, count: apps.length, byStatus };
  });

  const maxCount = Math.max(...stageCounts.map(s => s.count), 1);

  const shortNames: Record<Stage, string> = {
    'Recruiter Outreach': 'Outreach',
    'Recruiter Screen': 'Rec. Screen',
    'Hiring Manager': 'HM',
    'Product Sense': 'Prod. Sense',
    'Onsite': 'Onsite',
    'Post Onsite': 'Post Onsite',
    'Offer': 'Offer',
    'Sign-on': 'Sign-on',
  };

  const legendStatuses = STATUS_ORDER.filter(s =>
    stageCounts.some(sc => sc.byStatus[s] > 0)
  );

  return (
    <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pipeline Funnel</h3>

      {legendStatuses.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {legendStatuses.map(status => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${darkMode ? STATUS_COLORS[status].darkBg : STATUS_COLORS[status].bg}`} />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {stageCounts.map(({ stage, count, byStatus }) => (
          <div
            key={stage}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onStageClick?.(stage)}
          >
            <div className={`text-xs font-mono w-24 shrink-0 text-right ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {shortNames[stage]}
            </div>
            <div className="flex-1 h-5 rounded overflow-hidden relative flex">
              {count === 0 ? (
                <div className="w-0" />
              ) : (
                STATUS_ORDER.map(status => {
                  const n = byStatus[status];
                  if (n === 0) return null;
                  const pct = (n / maxCount) * 100;
                  return (
                    <div
                      key={status}
                      className={`h-full transition-all duration-300 group-hover:opacity-80 ${darkMode ? STATUS_COLORS[status].darkBg : STATUS_COLORS[status].bg}`}
                      style={{ width: `${pct}%` }}
                      title={`${status}: ${n}`}
                    />
                  );
                })
              )}
            </div>
            <span className={`text-xs font-mono w-6 shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
