// Lazy module: rebuilds a persisted row's visibilityCondition on re-open.
import type { Row } from '../domain/entities/Row';
import type { ColumnSchema } from './type';

/**
 * بازسازی visibilityCondition یک سطر از روی مقادیر فعلی سلول‌هایش.
 * کلیدها fieldName ستون‌های whenFieldTruthy (مقدارِ ستون منبع) و
 * whenRemoteFlag (ستون خودش) هستند — دقیقاً همان کلیدهایی که UI
 * (cellRenderer / MobileRowFormModal) و isInitiallyHidden چک می‌کنند.
 * Only rows of the column's OWN collection are consulted — no cross-collection leak.
 */
export function rebuildRowVisibilityCondition(
  row: Row,
  columnMeta: Map<string, ColumnSchema>,
): void {
  const rowCollection = row.getCollection() ?? 'default';
  const condition: Record<string, boolean> = {};
  for (const colCfg of columnMeta.values()) {
    if ((colCfg.fieldCollection ?? 'default') !== rowCollection) continue;
    const v = colCfg.visibility;
    if (v?.kind === 'whenFieldTruthy') {
      condition[colCfg.fieldName] = !!row.readValue(v.fieldName);
    } else if (v?.kind === 'whenRemoteFlag') {
      // فلگ ریموت در دسترس نیست؛ «محتوا داشتن» خودش دلیل کافی برای نمایش است.
      condition[colCfg.fieldName] = !!row.readValue(colCfg.fieldName);
    }
  }
  row.setVisibilityCondition(condition);
}

