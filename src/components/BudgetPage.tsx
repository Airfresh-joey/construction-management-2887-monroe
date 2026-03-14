import { useState } from 'react';
import BudgetTracker from './BudgetTracker';
import CostEstimator from './CostEstimator';
import PaymentLedger from './PaymentLedger';
import InteractiveBudgetCalculator from './InteractiveBudgetCalculator';
import { BarChart3, Calculator, CreditCard, SlidersHorizontal } from 'lucide-react';

const subTabs = [
  { id: 'tracker', label: 'Budget Tracker', icon: BarChart3 },
  { id: 'calculator', label: 'What-If Calculator', icon: SlidersHorizontal },
  { id: 'estimator', label: 'Cost Estimator', icon: Calculator },
  { id: 'payments', label: 'Payments', icon: CreditCard },
] as const;

type SubTabId = typeof subTabs[number]['id'];

export default function BudgetPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('tracker');

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
      {activeSubTab === 'tracker' && <BudgetTracker />}
      {activeSubTab === 'calculator' && <InteractiveBudgetCalculator />}
      {activeSubTab === 'estimator' && <CostEstimator />}
      {activeSubTab === 'payments' && <PaymentLedger />}
    </div>
  );
}
