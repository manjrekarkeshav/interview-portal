import { Application, TimelineEvent, EventType, Priority, AppStatus, Stage, Outcome } from './types';

function parsePriority(val: string): Priority {
  const v = val?.trim().toUpperCase();
  if (v === 'P0') return 'P0';
  if (v === 'P0.5') return 'P0.5';
  if (v === 'P1') return 'P1';
  if (v === 'P2') return 'P2';
  return 'P1';
}

function parseStatus(val: string): AppStatus {
  const v = val?.trim().toLowerCase();
  if (v === 'closed' || v === 'complete' || v === 'done') return 'Closed';
  return 'Active';
}

function parseStage(val: string): Stage {
  const v = val?.trim().toLowerCase();
  if (v.includes('recruiter screen') || v.includes('phone screen')) return 'Recruiter Screen';
  if (v.includes('recruiter outreach') || v.includes('outreach')) return 'Recruiter Outreach';
  if (v.includes('hiring manager') || v.includes('hm')) return 'Hiring Manager';
  if (v.includes('product sense') || v.includes('ps')) return 'Product Sense';
  if (v.includes('onsite') || v.includes('on-site')) return 'Onsite';
  if (v.includes('post onsite') || v.includes('post-onsite')) return 'Post Onsite';
  if (v.includes('offer')) return 'Offer';
  if (v.includes('sign')) return 'Sign-on';
  return 'Recruiter Outreach';
}

function detectEventType(line: string): EventType {
  if (line.includes('✅') || line.toLowerCase().includes('completed') || line.toLowerCase().includes('done')) return 'Completed';
  if (line.includes('❌') || line.toLowerCase().includes('reject')) return 'Rejected';
  if (line.includes('👻') || line.toLowerCase().includes('ghost')) return 'Ghosted';
  if (line.includes('✂️') || line.toLowerCase().includes('withdrew')) return 'Withdrew';
  if (line.includes('📅') || line.toLowerCase().includes('schedule')) return 'Scheduled';
  if (line.includes('✉️') || line.toLowerCase().includes('outreach')) return 'Outreach';
  return 'Note';
}

function parseNotesLines(notes: string): Partial<TimelineEvent>[] {
  if (!notes?.trim()) return [];
  const lines = notes.split('\n').filter(l => l.trim());
  const events: Partial<TimelineEvent>[] = [];

  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
    const date = dateMatch ? parseDate(dateMatch[1]) : new Date().toISOString().split('T')[0];
    const description = line.replace(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*[-–]\s*/, '').trim();
    const event_type = detectEventType(line);

    events.push({ date, event_type, description, stage: '' });
  }

  return events;
}

function parseDate(str: string): string {
  try {
    const parts = str.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export interface ImportResult {
  applications: Omit<Application, 'id' | 'created_at' | 'updated_at'>[];
  events: { appIndex: number; event: Omit<TimelineEvent, 'id' | 'application_id' | 'created_at'> }[];
  errors: string[];
}

export function parseCSV(csvText: string): ImportResult {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { applications: [], events: [], errors: ['CSV is empty or has no data rows'] };

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const applications: ImportResult['applications'] = [];
  const events: ImportResult['events'] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });

      const company = row['company'] || row['company_name'] || '';
      const role = row['role'] || row['position'] || row['job_title'] || '';
      if (!company && !role) continue;

      const app: ImportResult['applications'][0] = {
        company: company || 'Unknown',
        role: role || 'Unknown',
        priority: parsePriority(row['priority'] || 'P1'),
        status: parseStatus(row['status'] || 'Active'),
        outcome: null,
        current_stage: parseStage(row['stage'] || row['current_stage'] || ''),
        recruiter_name: row['recruiter'] || row['recruiter_name'] || '',
        recruiter_contact: row['recruiter_contact'] || row['recruiter_email'] || '',
        referral_source: row['referral'] || row['referral_source'] || '',
        h1b_sponsorship: 'Unknown',
        notes: row['details'] || row['notes'] || '',
      };

      const appIndex = applications.length;
      applications.push(app);

      const notesCol = row['notes'] || row['timeline'] || row['activity'] || '';
      const parsedEvents = parseNotesLines(notesCol);
      for (const e of parsedEvents) {
        events.push({
          appIndex,
          event: {
            date: e.date || new Date().toISOString().split('T')[0],
            event_type: e.event_type || 'Note',
            stage: e.stage || app.current_stage,
            description: e.description || '',
          },
        });
      }
    } catch (err) {
      errors.push(`Row ${i + 1}: ${String(err)}`);
    }
  }

  return { applications, events, errors };
}
