import { useState } from 'react';
import Schedule from './Schedule';
import VendorRoster from './VendorRoster';
import DocumentChecklist from './DocumentChecklist';
import PhotoLog from './PhotoLog';
import { CalendarDays, Users, FileText, Camera } from 'lucide-react';

const subTabs = [
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Camera },
] as const;

type SubTabId = typeof subTabs[number]['id'];

export default function ProjectPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('schedule');

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
      {activeSubTab === 'schedule' && <Schedule />}
      {activeSubTab === 'vendors' && <VendorRoster />}
      {activeSubTab === 'documents' && <DocumentChecklist />}
      {activeSubTab === 'photos' && <PhotoLog />}
    </div>
  );
}
