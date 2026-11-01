/**
 * Format number to Bangladeshi Taka (৳)
 * e.g. 25000 -> "৳25,000"
 */
export function formatBDT(amount: number, options?: { showSign?: boolean; compact?: boolean }): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (options?.compact) {
    if (abs >= 10000000) {
      return `${isNegative ? '-' : ''}৳${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${isNegative ? '-' : ''}৳${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      return `${isNegative ? '-' : ''}৳${(abs / 1000).toFixed(1)}k`;
    }
    return `${isNegative ? '-' : ''}৳${abs.toLocaleString('en-IN')}`;
  }

  // Format with Bangladeshi / South Asian numbering grouping (en-IN)
  const formattedNumber = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  if (options?.showSign) {
    if (amount > 0) return `+৳${formattedNumber}`;
    if (amount < 0) return `-৳${formattedNumber}`;
    return `৳${formattedNumber}`;
  }

  return `${isNegative ? '-৳' : '৳'}${formattedNumber}`;
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthYear(yearMonth: string): string {
  if (!yearMonth) return '';
  const parts = yearMonth.split('-');
  if (parts.length < 2) return yearMonth;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
