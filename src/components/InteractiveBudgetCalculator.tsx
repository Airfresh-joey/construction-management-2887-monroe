import { useState } from 'react';
import { formatCurrency } from '../lib/format';
import { Wrench, UserCheck, Percent, TrendingDown, TrendingUp, Info, DollarSign } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { name: 'Demo & Site Prep', pct: 4, diyable: true },
  { name: 'Foundation & Excavation', pct: 10, diyable: false },
  { name: 'Framing & Structural', pct: 15, diyable: false },
  { name: 'Roofing', pct: 5, diyable: false },
  { name: 'HVAC', pct: 10, diyable: false },
  { name: 'Electrical', pct: 8, diyable: false },
  { name: 'Plumbing', pct: 8, diyable: false },
  { name: 'Insulation', pct: 3, diyable: false },
  { name: 'Drywall', pct: 4, diyable: false },
  { name: 'Flooring & Tile', pct: 7, diyable: false },
  { name: 'Paint & Finishes', pct: 4, diyable: true },
  { name: 'Windows & Doors', pct: 5, diyable: false },
  { name: 'Permits & Engineering', pct: 3, diyable: false },
  { name: 'General Contractor Fee', pct: 14, diyable: false },
];

interface ToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  icon: React.ComponentType<{ className?: string }>;
  savingsAmount?: string;
}

function SavingsToggle({ label, description, active, onToggle, icon: Icon, savingsAmount }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        active
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${active ? 'text-emerald-800 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
          <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </div>
      </div>
      {active && savingsAmount && (
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2 ml-[52px]">
          Save {savingsAmount}
        </p>
      )}
    </button>
  );
}

export default function InteractiveBudgetCalculator() {
  const [totalBudget, setTotalBudget] = useState(300000);
  const [diyDemo, setDiyDemo] = useState(false);
  const [actAsGC, setActAsGC] = useState(false);
  const [negotiate, setNegotiate] = useState(false);

  // Calculate category amounts with savings applied
  let totalSavings = 0;
  const categories = DEFAULT_CATEGORIES.map(cat => {
    let amount = (cat.pct / 100) * totalBudget;
    const original = amount;

    // DIY Demo: save 70% on demo & site prep, 50% on paint
    if (diyDemo && cat.diyable) {
      const savePct = cat.name === 'Demo & Site Prep' ? 0.7 : 0.5;
      const saved = amount * savePct;
      totalSavings += saved;
      amount -= saved;
    }

    // Act as GC: eliminate GC fee entirely
    if (actAsGC && cat.name === 'General Contractor Fee') {
      totalSavings += amount;
      amount = 0;
    }

    // Negotiate 15%: reduce trade costs (not permits, not GC fee)
    if (negotiate && !['Permits & Engineering', 'General Contractor Fee'].includes(cat.name)) {
      const saved = amount * 0.15;
      totalSavings += saved;
      amount -= saved;
    }

    return { ...cat, amount, original };
  });

  const totalAllocated = categories.reduce((s, c) => s + c.amount, 0);
  const remaining = totalBudget - totalAllocated;
  const diyDemoSavings = (DEFAULT_CATEGORIES.find(c => c.name === 'Demo & Site Prep')?.pct || 0) / 100 * totalBudget * 0.7
    + (DEFAULT_CATEGORIES.find(c => c.name === 'Paint & Finishes')?.pct || 0) / 100 * totalBudget * 0.5;
  const gcSavings = (DEFAULT_CATEGORIES.find(c => c.name === 'General Contractor Fee')?.pct || 0) / 100 * totalBudget;
  const negotiateSavings = DEFAULT_CATEGORIES
    .filter(c => !['Permits & Engineering', 'General Contractor Fee'].includes(c.name))
    .reduce((s, c) => s + (c.pct / 100) * totalBudget * 0.15, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Interactive Budget Calculator</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Adjust your budget and see real-time cost breakdowns</p>
      </div>

      {/* Total Budget Slider */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">My Total Budget</label>
        <div className="flex items-baseline gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-navy dark:text-blue-400" />
          <input
            type="number"
            value={totalBudget}
            onChange={e => setTotalBudget(Math.max(150000, Math.min(500000, Number(e.target.value) || 150000)))}
            className="text-3xl font-bold text-navy dark:text-white bg-transparent border-none outline-none w-48 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <input
          type="range"
          min={150000}
          max={500000}
          step={5000}
          value={totalBudget}
          onChange={e => setTotalBudget(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy"
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
          <span>$150K</span>
          <span>$250K</span>
          <span>$350K</span>
          <span>$500K</span>
        </div>
      </div>

      {/* Savings Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SavingsToggle
          label="DIY Demo & Paint"
          description="Do demolition and painting yourself"
          active={diyDemo}
          onToggle={() => setDiyDemo(!diyDemo)}
          icon={Wrench}
          savingsAmount={formatCurrency(diyDemoSavings)}
        />
        <SavingsToggle
          label="Act as GC"
          description="Manage subcontractors directly"
          active={actAsGC}
          onToggle={() => setActAsGC(!actAsGC)}
          icon={UserCheck}
          savingsAmount={formatCurrency(gcSavings)}
        />
        <SavingsToggle
          label="Negotiate 15%"
          description="Get 3+ bids and negotiate pricing"
          active={negotiate}
          onToggle={() => setNegotiate(!negotiate)}
          icon={Percent}
          savingsAmount={formatCurrency(negotiateSavings)}
        />
      </div>

      {/* Budget Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          With this budget, here is what you can expect
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Category breakdown based on typical Denver residential addition costs</p>

        <div className="space-y-4">
          {categories.filter(c => c.amount > 0 || c.original > 0).map(cat => {
            const pctOfBudget = (cat.amount / totalBudget) * 100;
            const hasSavings = cat.amount < cat.original;

            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700 dark:text-slate-300">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    {hasSavings && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 line-through">
                        {formatCurrency(cat.original)}
                      </span>
                    )}
                    <span className={`text-sm font-semibold ${
                      cat.amount === 0 ? 'text-emerald-600 dark:text-emerald-400' :
                      hasSavings ? 'text-emerald-600 dark:text-emerald-400' :
                      'text-gray-900 dark:text-white'
                    }`}>
                      {cat.amount === 0 ? '$0 (You!)' : formatCurrency(cat.amount)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      hasSavings || cat.amount === 0 ? 'bg-emerald-500' : 'bg-navy dark:bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(pctOfBudget, 0.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-xl p-5 ${
          remaining >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {remaining >= 0
              ? <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              : <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            }
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {remaining >= 0 ? 'Remaining Budget' : 'Over Budget'}
              </p>
              <p className={`text-2xl font-bold ${
                remaining >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Total Savings</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allocated vs Budget bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Budget Utilization</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            {formatCurrency(totalAllocated)} of {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              totalAllocated > totalBudget ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
          {Math.round((totalAllocated / totalBudget) * 100)}% allocated
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Percentages based on typical Denver residential addition costs. Actual costs vary by scope, materials, and market conditions. Acting as your own GC saves the most but requires significant time and construction knowledge.</p>
      </div>
    </div>
  );
}
