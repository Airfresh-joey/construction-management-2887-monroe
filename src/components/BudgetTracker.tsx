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
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading budget...</div>;
  }

  // Group by category
  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Budget Tracker</h2>
        <p className="text-gray-500 mt-1">Track estimates vs actual spend by category</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Estimate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actual</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Variance</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
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
                      className={`border-b border-gray-100 hover:bg-gray-50 ${overBudget ? 'bg-red-50' : ''}`}
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {idx === 0 ? cat : ''}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{item.item}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Number(item.estimate))}</td>
                      <td className="py-3 px-4 text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(item.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button onClick={() => saveEdit(item.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={overBudget ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                            {formatCurrency(Number(item.actual))}
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Number(item.actual) > 0 ? (variance >= 0 ? '+' : '') + formatCurrency(variance) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">{item.notes}</td>
                      <td className="py-3 px-4">
                        {editingId !== item.id && (
                          <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
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
              <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-4 text-gray-900" colSpan={2}>TOTAL</td>
                <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totalEstimate)}</td>
                <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totalActual)}</td>
                <td className={`py-3 px-4 text-right ${totalEstimate - totalActual < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
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
