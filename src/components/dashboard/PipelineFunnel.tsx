import { useStore } from '../../store/useStore';
import { STAGES, Stage } from '../../lib/types';

interface Props {
  onStageClick?: (stage: Stage) => void;
}

export function PipelineFunnel({ onStageClick }: Props) {
  const { applications, darkMode } = useStore();

  const stageCounts = STAGES.map(stage => {
    const stageIdx = STAGES.indexOf(stage);
    const count = applications.filter(a => {
      const appIdx = STAGES.indexOf(a.current_stage);
      return appIdx >= stageIdx;
    }).length;
    return { stage, count };
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

  return (
    <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pipeline Funnel</h3>
      <div className="space-y-2">
        {stageCounts.map(({ stage, count }) => (
          <div
            key={stage}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onStageClick?.(stage)}
          >
            <div className={`text-xs font-mono w-24 shrink-0 text-right ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {shortNames[stage]}
            </div>
            <div className="flex-1 h-5 rounded overflow-hidden relative">
              <div
                className={`h-full rounded transition-all duration-300 group-hover:opacity-80 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
                style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? '2rem' : '0' }}
              />
            </div>
            <span className={`text-xs font-mono w-6 shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
