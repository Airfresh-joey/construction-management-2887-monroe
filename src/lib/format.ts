export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function statusColor(status: string): string {
  switch (status) {
    case 'complete':
    case 'paid':
    case 'contracted':
      return 'bg-emerald-100 text-emerald-800';
    case 'active':
    case 'pending':
    case 'prospect':
      return 'bg-amber-100 text-amber-800';
    case 'needed':
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
