import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatDate, statusColor } from '../lib/format';
import type { SchedulePhase } from '../types';
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function Schedule() {
  const { data: phases, loading, update } = useTable<SchedulePhase>('schedule_phases', 'phase_number');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const toggleExpand = (id: string, notes: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setNoteText(notes || '');
    }
  };

  const saveNote = async (id: string) => {
    await update(id, { notes: noteText });
  };

  const cycleStatus = async (phase: SchedulePhase) => {
    const next = phase.status === 'pending' ? 'active' : phase.status === 'active' ? 'complete' : 'pending';
    await update(phase.id, { status: next });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Construction Schedule</h2>
        <p className="text-gray-500 mt-1">April – October 2026 &middot; 11 phases</p>
      </div>

      <div className="space-y-3">
        {phases.map((phase) => (
          <div key={phase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(phase.id, phase.notes)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                phase.status === 'complete' ? 'bg-emerald-100 text-emerald-700' :
                phase.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {phase.phase_number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                  {phase.requires_inspection && (
                    <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      <ClipboardCheck className="w-3 h-3" /> Inspection
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{phase.tasks}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-500 hidden sm:block">
                  {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); cycleStatus(phase); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(phase.status)} hover:opacity-80`}
                >
                  {phase.status}
                </button>
                {expandedId === phase.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            {expandedId === phase.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-500">Start Date</span>
                    <p className="font-medium text-gray-900">{formatDate(phase.start_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">End Date</span>
                    <p className="font-medium text-gray-900">{formatDate(phase.end_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Inspection Required</span>
                    <p className="font-medium text-gray-900">{phase.requires_inspection ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Field Notes</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/30"
                    placeholder="Add field notes for this phase..."
                  />
                  <button
                    onClick={() => saveNote(phase.id)}
                    className="mt-2 px-4 py-1.5 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
