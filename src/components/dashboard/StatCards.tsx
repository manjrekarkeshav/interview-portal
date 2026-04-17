import { useStore } from '../../store/useStore';
import { TrendingUp, Ghost, Trophy, Activity } from 'lucide-react';

export function StatCards() {
  const { applications, events, darkMode } = useStore();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const active = applications.filter(a => a.status !== 'Closed');
  const recruiterScreens = applications.filter(a => {
    const stages = ['Recruiter Screen', 'Hiring Manager', 'Product Sense', 'Onsite', 'Post Onsite', 'Offer', 'Sign-on'];
    return stages.includes(a.current_stage) || (a.status === 'Closed' && a.outcome !== 'Ghosted' && a.outcome !== 'Reject');
  });
  const totalRecruiterOutreach = applications.filter(a => {
    const evts = events.filter(e => e.application_id === a.id);
    return evts.some(e => e.event_type === 'Completed' && e.stage === 'Recruiter Screen') ||
           ['Hiring Manager', 'Product Sense', 'Onsite', 'Post Onsite', 'Offer', 'Sign-on'].includes(a.current_stage);
  });
  const responseRate = totalRecruiterOutreach.length > 0
    ? Math.round((recruiterScreens.length / Math.max(applications.length, 1)) * 100)
    : 0;

  const ghostsThisMonth = applications.filter(a =>
    a.outcome === 'Ghosted' && new Date(a.updated_at) >= monthStart
  ).length;

  const offerCount = applications.filter(a => a.outcome === 'Complete').length;

  const cards = [
    { icon: Activity, label: 'Active Pipeline', value: active.length, sub: 'applications in flight', color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Response Rate', value: `${responseRate}%`, sub: 'past recruiter screen', color: 'text-green-400' },
    { icon: Ghost, label: 'Ghosts This Month', value: ghostsThisMonth, sub: 'no response', color: 'text-purple-400' },
    { icon: Trophy, label: 'Offers', value: offerCount, sub: 'lifetime', color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, sub, color }) => (
        <div key={label} className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</span>
            <Icon size={14} className={color} />
          </div>
          <div className={`text-2xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
