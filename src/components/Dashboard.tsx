import { useTable } from '../hooks/useSupabase';
import { formatCurrency } from '../lib/format';
import type { BudgetItem, Vendor, Payment, SchedulePhase } from '../types';
import { DollarSign, Users, CreditCard, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: budget, loading: budgetLoading } = useTable<BudgetItem>('budget_items');
  const { data: vendors } = useTable<Vendor>('vendors');
  const { data: payments } = useTable<Payment>('payments');
  const { data: phases } = useTable<SchedulePhase>('schedule_phases', 'phase_number');

  const totalBudget = budget.reduce((s, b) => s + Number(b.estimate), 0);
  const totalSpent = budget.reduce((s, b) => s + Number(b.actual), 0);
  const remaining = totalBudget - totalSpent;
  const vendorsSecured = vendors.filter(v => ['contracted', 'active', 'complete'].includes(v.status)).length;
  const paymentsMade = payments.filter(p => p.status === 'paid').length;
  const completedPhases = phases.filter(p => p.status === 'complete').length;
  const progressPct = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0;

  if (budgetLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;
  }

  const kpis = [
    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
    { label: 'Spent to Date', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Remaining', value: formatCurrency(remaining), icon: DollarSign, color: remaining < 0 ? 'text-red-600 bg-red-50' : 'text-navy bg-gray-50' },
    { label: 'Vendors Secured', value: `${vendorsSecured} / ${vendors.length}`, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Payments Made', value: String(paymentsMade), icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Project Dashboard</h2>
        <p className="text-gray-500 mt-1">2887 S. Monroe St, Denver CO 80210 — Phase 1: Primary Suite Addition</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-sm font-medium text-gray-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {completedPhases} of {phases.length} phases complete
        </p>
      </div>

      {/* Schedule overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Schedule Overview</h3>
        <div className="space-y-2">
          {phases.map((phase) => (
            <div key={phase.id} className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                phase.status === 'complete' ? 'bg-emerald-500' :
                phase.status === 'active' ? 'bg-amber-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm text-gray-700 flex-1">{phase.name}</span>
              {phase.requires_inspection && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Inspection</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                phase.status === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                phase.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {phase.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget snapshot */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Budget by Category</h3>
        <div className="space-y-2">
          {budget.map((item) => {
            const pct = item.estimate > 0 ? (Number(item.actual) / Number(item.estimate)) * 100 : 0;
            const overBudget = Number(item.actual) > Number(item.estimate);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-40 flex-shrink-0 truncate">{item.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${overBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-24 text-right ${overBudget ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatCurrency(Number(item.actual))} / {formatCurrency(Number(item.estimate))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
