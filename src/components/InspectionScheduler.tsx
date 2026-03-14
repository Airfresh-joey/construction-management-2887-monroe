import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatDate } from '../lib/format';
import type { SchedulePhase } from '../types';
import { ClipboardCheck, Phone, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

interface InspectionType {
  name: string;
  code: string;
  description: string;
  typicalPhase: string;
}

const INSPECTION_TYPES: InspectionType[] = [
  { name: 'Foundation', code: 'FOUND', description: 'Verify footings, rebar, drainage before pour', typicalPhase: 'Foundation' },
  { name: 'Framing', code: 'FRAME', description: 'Structural framing, shear walls, hold-downs', typicalPhase: 'Framing' },
  { name: 'MEP Rough-In', code: 'MEP-R', description: 'Mechanical, electrical, plumbing rough-in before close-up', typicalPhase: 'MEP Rough-In' },
  { name: 'Insulation', code: 'INSUL', description: 'Insulation R-values, vapor barrier, air sealing', typicalPhase: 'Insulation' },
  { name: 'Final', code: 'FINAL', description: 'Final building inspection — all systems complete', typicalPhase: 'Final Touches' },
];

interface ScheduledInspection {
  type: string;
  requestedDate: string;
  status: 'not_scheduled' | 'requested' | 'scheduled' | 'passed' | 'failed';
  notes: string;
}

export default function InspectionScheduler() {
  const { data: phases } = useTable<SchedulePhase>('schedule_phases', 'phase_number');

  const [inspections, setInspections] = useState<ScheduledInspection[]>(
    INSPECTION_TYPES.map(t => ({
      type: t.name,
      requestedDate: '',
      status: 'not_scheduled',
      notes: '',
    }))
  );

  const updateInspection = (index: number, updates: Partial<ScheduledInspection>) => {
    setInspections(prev => prev.map((insp, i) => i === index ? { ...insp, ...updates } : insp));
  };

  const statusIcon = (status: ScheduledInspection['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'requested': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
    }
  };

  const statusLabel = (status: ScheduledInspection['status']) => {
    const map: Record<string, { label: string; classes: string }> = {
      not_scheduled: { label: 'Not Scheduled', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
      requested: { label: 'Requested', classes: 'bg-amber-100 text-amber-800' },
      scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-800' },
      passed: { label: 'Passed', classes: 'bg-emerald-100 text-emerald-800' },
      failed: { label: 'Failed', classes: 'bg-red-100 text-red-800' },
    };
    const s = map[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.classes}`}>{s.label}</span>;
  };

  const statusOptions: ScheduledInspection['status'][] = ['not_scheduled', 'requested', 'scheduled', 'passed', 'failed'];

  const passedCount = inspections.filter(i => i.status === 'passed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Inspection Scheduler</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track Denver Building Department inspections</p>
      </div>

      {/* Denver Building Dept Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <Phone className="w-5 h-5 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Denver Building Department</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              <strong>Phone:</strong> 720-865-2730
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Schedule Lead Time:</strong> 5–7 business days
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Call to schedule inspections. Have your permit number ready. Inspections are typically scheduled between 7 AM – 3 PM.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Inspection Progress</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{passedCount} / {inspections.length} passed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(passedCount / inspections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Inspection Cards */}
      <div className="space-y-3">
        {INSPECTION_TYPES.map((type, index) => {
          const insp = inspections[index];
          const relatedPhase = phases.find(p => p.name.toLowerCase().includes(type.typicalPhase.toLowerCase()));

          return (
            <div key={type.code} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start gap-4">
                {statusIcon(insp.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{type.name} Inspection</h4>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{type.code}</span>
                    {statusLabel(insp.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>

                  {relatedPhase && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Related phase: {relatedPhase.name} — {relatedPhase.status === 'complete' ? 'Complete' : relatedPhase.start_date ? `Starts ${formatDate(relatedPhase.start_date)}` : 'Not started'}
                    </p>
                  )}

                  <div className="flex gap-3 mt-3 flex-wrap items-center">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Target Date</label>
                      <input
                        type="date"
                        value={insp.requestedDate}
                        onChange={e => updateInspection(index, { requestedDate: e.target.value })}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Status</label>
                      <select
                        value={insp.status}
                        onChange={e => updateInspection(index, { status: e.target.value as ScheduledInspection['status'] })}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Notes</label>
                      <input
                        value={insp.notes}
                        onChange={e => updateInspection(index, { notes: e.target.value })}
                        placeholder="Inspector comments, corrections needed..."
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Schedule inspections at least 5–7 business days in advance. Failed inspections require corrections and re-inspection. Keep your permit posted on-site at all times.</p>
      </div>
    </div>
  );
}
