import { useState } from 'react';
import { formatCurrency } from '../lib/format';
import { Calculator, TrendingUp, Info } from 'lucide-react';

interface CostRange {
  trade: string;
  lowPerSqft: number;
  highPerSqft: number;
  unit: string;
  notes: string;
}

const DENVER_COST_DATA: CostRange[] = [
  { trade: 'Foundation', lowPerSqft: 8, highPerSqft: 15, unit: 'sqft', notes: 'Includes excavation, forms, concrete, waterproofing' },
  { trade: 'Framing', lowPerSqft: 7, highPerSqft: 16, unit: 'sqft', notes: 'Lumber, labor, hardware; trusses extra' },
  { trade: 'Roofing', lowPerSqft: 4, highPerSqft: 9, unit: 'sqft', notes: 'Asphalt shingles; metal/tile higher' },
  { trade: 'HVAC', lowPerSqft: 25, highPerSqft: 35, unit: 'sqft', notes: 'Forced air system, ductwork, thermostat' },
  { trade: 'Electrical', lowPerSqft: 5, highPerSqft: 12, unit: 'sqft', notes: 'Rough-in + finish; panel upgrade extra' },
  { trade: 'Plumbing', lowPerSqft: 8, highPerSqft: 15, unit: 'sqft', notes: 'Rough-in + fixtures; water heater extra' },
  { trade: 'Insulation', lowPerSqft: 1.5, highPerSqft: 3.5, unit: 'sqft', notes: 'Batt or blown-in; spray foam higher' },
  { trade: 'Drywall', lowPerSqft: 2, highPerSqft: 4, unit: 'sqft', notes: 'Hang, tape, texture, prime' },
  { trade: 'Flooring', lowPerSqft: 3, highPerSqft: 12, unit: 'sqft', notes: 'LVP/carpet low end; hardwood high end' },
  { trade: 'Tile', lowPerSqft: 10, highPerSqft: 25, unit: 'sqft', notes: 'Material + labor; natural stone higher' },
  { trade: 'Paint', lowPerSqft: 2, highPerSqft: 5, unit: 'sqft', notes: 'Interior walls & trim; 2 coats' },
  { trade: 'Windows', lowPerSqft: 0, highPerSqft: 0, unit: 'each', notes: '$300-$1,200 per window installed' },
];

export default function CostEstimator() {
  const [sqft, setSqft] = useState<number>(500);
  const [selectedTrades, setSelectedTrades] = useState<string[]>(
    DENVER_COST_DATA.filter(c => c.unit === 'sqft').map(c => c.trade)
  );

  const toggleTrade = (trade: string) => {
    setSelectedTrades(prev =>
      prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]
    );
  };

  const estimates = DENVER_COST_DATA.filter(c => selectedTrades.includes(c.trade) && c.unit === 'sqft');
  const totalLow = estimates.reduce((sum, c) => sum + c.lowPerSqft * sqft, 0);
  const totalHigh = estimates.reduce((sum, c) => sum + c.highPerSqft * sqft, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">AI Cost Estimator</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Denver market construction cost ranges per square foot</p>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Project Square Footage</label>
            <input
              type="number"
              value={sqft}
              onChange={e => setSqft(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-lg font-semibold"
              placeholder="Enter sqft"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Estimated Total Range</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
              {formatCurrency(totalLow)} — {formatCurrency(totalHigh)}
            </p>
          </div>
        </div>
      </div>

      {/* Trade selection */}
      <div className="flex gap-2 flex-wrap">
        {DENVER_COST_DATA.filter(c => c.unit === 'sqft').map(c => (
          <button
            key={c.trade}
            onClick={() => toggleTrade(c.trade)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              selectedTrades.includes(c.trade)
                ? 'bg-navy text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {c.trade}
          </button>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Trade</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Low $/sqft</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">High $/sqft</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Low Est.</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">High Est.</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300 hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {DENVER_COST_DATA.map(cost => (
              <tr key={cost.trade} className={`border-b border-gray-100 dark:border-slate-700 ${
                selectedTrades.includes(cost.trade) ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900 opacity-50'
              }`}>
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gray-400" />
                  {cost.trade}
                </td>
                <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">
                  {cost.unit === 'sqft' ? `$${cost.lowPerSqft}` : '—'}
                </td>
                <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">
                  {cost.unit === 'sqft' ? `$${cost.highPerSqft}` : '—'}
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {cost.unit === 'sqft' ? formatCurrency(cost.lowPerSqft * sqft) : '—'}
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {cost.unit === 'sqft' ? formatCurrency(cost.highPerSqft * sqft) : '—'}
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-slate-400 text-xs hidden md:table-cell">{cost.notes}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-navy/5 dark:bg-navy-light/20 font-semibold">
              <td className="py-3 px-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-navy dark:text-blue-400" /> Selected Totals
              </td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4 text-right text-navy dark:text-blue-400">{formatCurrency(totalLow)}</td>
              <td className="py-3 px-4 text-right text-navy dark:text-blue-400">{formatCurrency(totalHigh)}</td>
              <td className="py-3 px-4 hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Estimates based on 2025–2026 Denver metro construction costs. Actual costs vary by project complexity, site conditions, material choices, and contractor. Always get 3+ quotes.</p>
      </div>
    </div>
  );
}
