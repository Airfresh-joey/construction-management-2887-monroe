import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatCurrency } from '../lib/format';
import { statusColor } from '../lib/format';
import type { BudgetItem } from '../types';
import { Pencil, Check, X } from 'lucide-react';

export default function BudgetTracker() {
  const { data: items, loading, update } = useTable<BudgetItem>('budget_items');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const totalEstimate = items.reduce((s, i) => s + Number(i.estimate), 0);
  const totalActual = items.reduce((s, i) => s + Number(i.actual), 0);

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValue(String(item.actual));
  };

  const saveEdit = async (id: string) => {
    const val = parseFloat(editValue) || 0;
    await update(id, { actual: val });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">Loading budget...</div>;
  }

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Budget Tracker</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Track estimates vs actual spend by category</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Item</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Estimate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Actual</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Variance</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Notes</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const catItems = items.filter(i => i.category === cat);
                return catItems.map((item, idx) => {
                  const variance = Number(item.estimate) - Number(item.actual);
                  const overBudget = Number(item.actual) > Number(item.estimate) && Number(item.actual) > 0;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 ${overBudget ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {idx === 0 ? cat : ''}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-slate-300">{item.item}</td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-slate-300">{formatCurrency(Number(item.estimate))}</td>
                      <td className="py-3 px-4 text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-right text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(item.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button onClick={() => saveEdit(item.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={overBudget ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-700 dark:text-slate-300'}>
                            {formatCurrency(Number(item.actual))}
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${variance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {Number(item.actual) > 0 ? (variance >= 0 ? '+' : '') + formatCurrency(variance) : '\u2014'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-slate-400 text-xs max-w-[200px] truncate">{item.notes}</td>
                      <td className="py-3 px-4">
                        {editingId !== item.id && (
                          <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-slate-600 font-bold">
                <td className="py-3 px-4 text-gray-900 dark:text-white" colSpan={2}>TOTAL</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(totalEstimate)}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(totalActual)}</td>
                <td className={`py-3 px-4 text-right ${totalEstimate - totalActual < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {(totalEstimate - totalActual >= 0 ? '+' : '') + formatCurrency(totalEstimate - totalActual)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
