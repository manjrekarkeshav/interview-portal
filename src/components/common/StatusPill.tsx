import { Outcome, AppStatus } from '../../lib/types';
import { getOutcomeColor, getStatusColor } from '../../lib/utils';

interface OutcomePillProps {
  outcome: Outcome | null;
}

interface StatusPillProps {
  status: AppStatus;
}

export function OutcomePill({ outcome }: OutcomePillProps) {
  const color = getOutcomeColor(outcome);
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${color}`}>
      {outcome || '—'}
    </span>
  );
}

export function StatusPill({ status }: StatusPillProps) {
  const color = getStatusColor(status);
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${color}`}>
      {status}
    </span>
  );
}
