import { type ClassValue, clsx } from 'clsx';
import { Stage, STAGES, Priority, Outcome, EventType } from './types';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

function parseLocalDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr.replace(/-/g, '/'));
}

export function formatDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
}

export function formatRelativeDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

export function isStale(dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 7;
}

export function getStageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function getNextStage(stage: Stage): Stage | null {
  const idx = STAGES.indexOf(stage);
  if (idx === -1 || idx === STAGES.length - 1) return null;
  return STAGES[idx + 1];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'P0': return 'bg-red-600 text-white';
    case 'P0.5': return 'bg-orange-500 text-white';
    case 'P1': return 'bg-blue-500 text-white';
    case 'P2': return 'bg-gray-500 text-white';
  }
}

export function getPriorityBorderColor(priority: Priority): string {
  switch (priority) {
    case 'P0': return 'border-red-600';
    case 'P0.5': return 'border-orange-500';
    case 'P1': return 'border-blue-500';
    case 'P2': return 'border-gray-500';
  }
}

export function getOutcomeColor(outcome: Outcome | null | undefined): string {
  if (!outcome) return 'bg-gray-700 text-gray-300';
  switch (outcome) {
    case 'Scheduled': return 'bg-sky-900 text-sky-300';
    case 'Complete': return 'bg-teal-900 text-teal-300';
    case 'Reject': return 'bg-rose-900 text-rose-400';
    case 'Ghosted': return 'bg-slate-700 text-slate-400';
    case 'Role Closed': return 'bg-zinc-700 text-zinc-400';
    case 'Withdrew': return 'bg-stone-700 text-stone-400';
    default: return 'bg-gray-700 text-gray-300';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Not Started': return 'bg-gray-800 text-gray-400';
    case 'Active': return 'bg-green-900 text-green-300';
    case 'Pending Response': return 'bg-amber-900 text-amber-300';
    case 'Closed': return 'bg-red-950 text-red-400';
    default: return 'bg-gray-700 text-gray-300';
  }
}

export function getEventIcon(type: EventType): string {
  switch (type) {
    case 'Completed': return '✅';
    case 'Scheduled': return '📅';
    case 'Rejected': return '❌';
    case 'Ghosted': return '👻';
    case 'Withdrew': return '✂️';
    case 'Outreach': return '✉️';
    case 'Note': return '📝';
  }
}
