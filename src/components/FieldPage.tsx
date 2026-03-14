import { useState } from 'react';
import NotesJournal from './NotesJournal';
import InspectionScheduler from './InspectionScheduler';
import MaterialCalculator from './MaterialCalculator';
import { BookOpen, ClipboardCheck, Package } from 'lucide-react';

const subTabs = [
  { id: 'notes', label: 'Field Notes', icon: BookOpen },
  { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
  { id: 'materials', label: 'Materials', icon: Package },
] as const;

type SubTabId = typeof subTabs[number]['id'];

export default function FieldPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('notes');

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-navy text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === 'notes' && <NotesJournal />}
      {activeSubTab === 'inspections' && <InspectionScheduler />}
      {activeSubTab === 'materials' && <MaterialCalculator />}
    </div>
  );
}
