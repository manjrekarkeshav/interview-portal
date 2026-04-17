import { Priority } from '../../lib/types';
import { getPriorityColor } from '../../lib/utils';

interface Props {
  priority: Priority;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function PriorityPill({ priority, onClick, size = 'sm' }: Props) {
  const color = getPriorityColor(priority);
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center rounded font-mono font-semibold ${color} ${sizeClass} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {priority}
    </span>
  );
}
