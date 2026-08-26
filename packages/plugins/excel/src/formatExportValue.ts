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
    case 'date':
      if (typeof val === 'string' && val.length > 0) {
        try {
          return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(val));
        } catch {
          return String(val);
        }
      }
      return '';
    default:
      return String(val);
  }
}
