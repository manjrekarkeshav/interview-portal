import { useStore } from '../../store/useStore';
import { STAGES, Stage, Priority } from '../../lib/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

function Section({ title, children, darkMode }: { title: string; children: React.ReactNode; darkMode: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {children}
    </div>
  );
}

export function Analytics() {
  const { applications, events, compensations, darkMode } = useStore();

  const tooltipStyle = { background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 };
  const tickStyle = { fontSize: 11, fill: darkMode ? '#6b7280' : '#9ca3af' };

  const funnelData = STAGES.map((stage, i) => {
    const atOrBeyond = applications.filter(a => STAGES.indexOf(a.current_stage) >= i);
    const reached = applications.filter(a => {
      const pastEvents = events.filter(e => e.application_id === a.id && e.stage === stage);
      return pastEvents.length > 0 || STAGES.indexOf(a.current_stage) >= i;
    });
    return { stage: stage.replace('Recruiter ', 'Rec. '), count: reached.length, total: applications.length };
  });

  const conversionData = STAGES.slice(0, -1).map((stage, i) => {
    const nextStage = STAGES[i + 1];
    const atStage = funnelData[i].count;
    const atNext = funnelData[i + 1].count;
    const rate = atStage > 0 ? Math.round((atNext / atStage) * 100) : 0;
    return { from: stage.split(' ').pop(), to: nextStage.split(' ').pop(), rate };
  });

  const ghostByStage = STAGES.map(stage => ({
    stage: stage.replace('Recruiter ', 'Rec. '),
    count: applications.filter(a => a.outcome === 'Ghosted' && a.current_stage === stage).length,
  })).filter(d => d.count > 0);

  const priorityData = (['P0', 'P0.5', 'P1', 'P2'] as Priority[]).map(p => {
    const apps = applications.filter(a => a.priority === p);
    const responded = apps.filter(a => {
      return events.some(e => e.application_id === a.id && e.event_type === 'Completed');
    });
    return {
      priority: p,
      total: apps.length,
      responded: responded.length,
      rate: apps.length > 0 ? Math.round((responded.length / apps.length) * 100) : 0,
    };
  }).filter(d => d.total > 0);

  const compData = compensations
    .map(c => {
      const app = applications.find(a => a.id === c.application_id);
      const total = c.base + c.bonus + c.annual_equity;
      if (!app || total === 0) return null;
      return { name: app.company, total };
    })
    .filter(Boolean)
    .sort((a, b) => b!.total - a!.total);

  const outcomeData = [
    { name: 'Active', value: applications.filter(a => a.status === 'Active').length },
    { name: 'Complete', value: applications.filter(a => a.outcome === 'Complete').length },
    { name: 'Scheduled', value: applications.filter(a => a.outcome === 'Scheduled').length },
    { name: 'Rejected', value: applications.filter(a => a.outcome === 'Reject').length },
    { name: 'Ghosted', value: applications.filter(a => a.outcome === 'Ghosted').length },
    { name: 'Withdrew', value: applications.filter(a => a.outcome === 'Withdrew' || a.outcome === 'Role Closed').length },
  ].filter(d => d.value > 0);

  const OUTCOME_COLORS = ['#3b82f6', '#10b981', '#f87171', '#a78bfa', '#6b7280'];

  const activityByWeek = (() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const key = `W${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      weeks[key] = 0;
    }
    events.forEach(e => {
      const d = new Date(e.date);
      const diff = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (diff >= 0 && diff < 12) {
        const key = `W${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        if (key in weeks) weeks[key]++;
      }
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  })();

  if (applications.length === 0) {
    return (
      <div className={`text-center py-24 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        Add some applications to see analytics.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Pipeline Funnel" darkMode={darkMode}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={tickStyle} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: darkMode ? '#374151' : '#f3f4f6' }} />
                <Bar dataKey="count" radius={4} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Outcome Distribution" darkMode={darkMode}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {outcomeData.map((_, i) => <Cell key={i} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: darkMode ? '#9ca3af' : '#6b7280' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Stage Conversion Rates (%)" darkMode={darkMode}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} margin={{ bottom: 20, left: 0, right: 10 }}>
                <XAxis dataKey="from" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Conversion']} />
                <Bar dataKey="rate" radius={4}>
                  {conversionData.map((d, i) => (
                    <Cell key={i} fill={d.rate > 50 ? '#10b981' : d.rate > 25 ? '#3b82f6' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Response Rate by Priority" darkMode={darkMode}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ bottom: 0 }}>
                <XAxis dataKey="priority" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Response Rate']} />
                <Bar dataKey="rate" radius={4}>
                  {priorityData.map((d, i) => {
                    const colors = { P0: '#ef4444', 'P0.5': '#f97316', P1: '#3b82f6', P2: '#9ca3af' };
                    return <Cell key={i} fill={colors[d.priority] || '#3b82f6'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {ghostByStage.length > 0 && (
          <Section title="Ghosted by Stage" darkMode={darkMode}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ghostByStage} layout="vertical" margin={{ left: 70, right: 20 }}>
                  <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={tickStyle} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={4} fill="#a78bfa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        <Section title="Activity by Week (last 12 weeks)" darkMode={darkMode}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByWeek} margin={{ bottom: 20 }}>
                <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={2} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={4} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {compData.length > 0 && (
          <Section title="Compensation Distribution" darkMode={darkMode}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compData as any[]} margin={{ bottom: 20, left: 0 }}>
                  <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Total Comp']} />
                  <Bar dataKey="total" radius={4} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
