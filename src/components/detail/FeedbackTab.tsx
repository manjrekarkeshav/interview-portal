import { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Application, FeedbackNote } from '../../lib/types';
import { formatDate } from '../../lib/utils';

interface Props {
  app: Application;
}

function FeedbackBlock({ note, darkMode }: { note: FeedbackNote; darkMode: boolean }) {
  const { updateFeedback, deleteFeedback } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...note });

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;

  const handleSave = async () => {
    await updateFeedback(note.id, { interviewer_name: form.interviewer_name, date: form.date, round: form.round, content: form.content });
    setEditing(false);
  };

  return (
    <div className={`rounded-xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <input className={inputClass} placeholder="Interviewer" value={form.interviewer_name} onChange={e => setForm(f => ({ ...f, interviewer_name: e.target.value }))} />
            <input className={inputClass} placeholder="Round (e.g. HM Screen)" value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))} />
            <input type="date" className={inputClass} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <textarea
            className={`${inputClass} resize-none font-mono text-xs`}
            rows={6}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Notes... (markdown supported)"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500">
              <Check size={11} /> Save
            </button>
            <button onClick={() => setEditing(false)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <X size={11} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{note.interviewer_name || 'Unknown'}</span>
              {note.round && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>{note.round}</span>
              )}
              <span className={`text-xs font-mono ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{formatDate(note.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setEditing(true)} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-600 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400'}`}>
                <Edit2 size={12} />
              </button>
              <button onClick={() => deleteFeedback(note.id)} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-600 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {note.content ? (
            <pre className={`text-xs whitespace-pre-wrap font-mono leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{note.content}</pre>
          ) : (
            <span className={`text-xs italic ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No notes</span>
          )}
        </div>
      )}
    </div>
  );
}

export function FeedbackTab({ app }: Props) {
  const { feedbackNotes, interviewStructures, createFeedback, upsertInterviewStructure, darkMode } = useStore();
  const [adding, setAdding] = useState(false);
  const [newNote, setNewNote] = useState({ interviewer_name: '', round: '', date: new Date().toISOString().split('T')[0], content: '' });

  const appNotes = feedbackNotes.filter(n => n.application_id === app.id);
  const structure = interviewStructures.find(s => s.application_id === app.id);
  const [rounds, setRounds] = useState(structure?.rounds?.join('\n') || '');
  const [generalNotes, setGeneralNotes] = useState(structure?.general_notes || '');
  const [structureSaved, setStructureSaved] = useState(false);

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${
    darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;
  const labelClass = `block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`;

  const handleAddFeedback = async () => {
    await createFeedback({ ...newNote, application_id: app.id });
    setNewNote({ interviewer_name: '', round: '', date: new Date().toISOString().split('T')[0], content: '' });
    setAdding(false);
  };

  const handleSaveStructure = async () => {
    await upsertInterviewStructure({
      application_id: app.id,
      rounds: rounds.split('\n').map(r => r.trim()).filter(Boolean),
      general_notes: generalNotes,
    });
    setStructureSaved(true);
    setTimeout(() => setStructureSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Interviewer Feedback</h3>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500"
          >
            <Plus size={12} /> Add Feedback
          </button>
        </div>

        {adding && (
          <div className={`rounded-xl border p-4 mb-3 ${darkMode ? 'border-blue-800/50 bg-blue-900/10' : 'border-blue-200 bg-blue-50'}`}>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input className={inputClass} placeholder="Interviewer name" value={newNote.interviewer_name} onChange={e => setNewNote(n => ({ ...n, interviewer_name: e.target.value }))} autoFocus />
                <input className={inputClass} placeholder="Round (e.g. HM Screen)" value={newNote.round} onChange={e => setNewNote(n => ({ ...n, round: e.target.value }))} />
                <input type="date" className={inputClass} value={newNote.date} onChange={e => setNewNote(n => ({ ...n, date: e.target.value }))} />
              </div>
              <textarea className={`${inputClass} resize-none font-mono text-xs`} rows={5} placeholder="Notes..." value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={handleAddFeedback} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500">Save</button>
                <button onClick={() => setAdding(false)} className={`px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {appNotes.length === 0 && !adding && (
            <div className={`text-center py-8 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No feedback yet</div>
          )}
          {appNotes.map(note => <FeedbackBlock key={note.id} note={note} darkMode={darkMode} />)}
        </div>
      </div>

      <div className={`border-t pt-6 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Interview Structure</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Loop Rounds (one per line)</label>
            <textarea
              className={`${inputClass} resize-none font-mono text-xs`}
              rows={4}
              placeholder="Recruiter Screen (30 min)&#10;HM Intro (45 min)&#10;Product Sense (60 min)&#10;Onsite: 4x 45 min loops"
              value={rounds}
              onChange={e => setRounds(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>General Notes</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Notes about the process, timeline, etc."
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
            />
          </div>
          <button
            onClick={handleSaveStructure}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${structureSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {structureSaved ? '✓ Saved' : 'Save Structure'}
          </button>
        </div>
      </div>
    </div>
  );
}
