/**
 * Pure string formatter for Excel/PDF export (no React).
 * Mirrors ui/helper valueParser for common field types.
 */
export function formatExportValue(
  val: unknown,
  fieldType?: string,
): string {
  if (val == null || val === '') {
    return fieldType === 'selectOption' ? '' : '';
  }

  switch (fieldType) {
    case 'checkbox':
      return val ? '✔' : '✘';
    case 'price':
      return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    case 'date': {
      // The grid's date editor stores ISO strings or numeric ms timestamps.
      const date =
        val instanceof Date
          ? val
          : typeof val === 'string' || typeof val === 'number'
            ? new Date(val)
            : null;
      if (!date) return '';
      if (Number.isNaN(date.getTime())) return String(val);
      try {
        return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      } catch {
        return String(val);
      }
    }
    default:
      return String(val);
  }
}
