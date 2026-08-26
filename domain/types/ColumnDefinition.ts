import type {
  ColumnVisibilityRule,
  FieldType,
  IDependOn,
} from '../types/ColumnSchema';
import type { IRule } from '../value-objects';

/**
 * Core column definition without React/DOM bindings.
 * Host adapters attach renderers via ColumnViewBinding.
 */
export interface ColumnDefinition {
  readonly fieldName: string;
  readonly fieldCaption: string;
  readonly fieldType: FieldType;
  readonly fieldCollection?: string;
  readonly order?: number;
  readonly editable?: boolean;
  readonly isUnique?: boolean;
  readonly hidden?: boolean;
  readonly disable?: boolean;
  readonly noCache?: boolean;
  readonly expandable?: boolean;
  readonly rules?: IRule[];
  readonly options?: ReadonlyArray<{
    label?: string;
    value?: string | number;
    title?: string;
  }>;
  readonly visibility: ColumnVisibilityRule;
  readonly dynamicSource?: {
    endpoint: string;
    dependsOn?: string[];
    dependOn?: IDependOn | IDependOn[];
    params?: Record<string, string>;
  };
  readonly computed?: {
    dependsOn: readonly string[];
  };
  readonly selectOptions?: ReadonlyArray<{ label: string; value: string | number }>;
  readonly minWidth?: number;
  readonly labelValue?: 'selectDisplay' | 'selectValue';
}

/**
 * Presentation binding kept outside Domain (Adapter / Host).
 * `render` is intentionally untyped here to avoid React import in core.
 */
export interface ColumnViewBinding {
  readonly fieldName: string;
  readonly className?: string;
  readonly minWidth?: number;
  readonly style?: unknown;
  readonly render?: (...args: unknown[]) => unknown;
  readonly displayFormat?: (value: unknown) => unknown;
  readonly onChange?: (...args: unknown[]) => void;
  readonly indexOptions?: (...args: unknown[]) => unknown[];
  readonly popUpWidth?: number;
  readonly dynamicSelectFilterOption?: (
    inputValue: string,
    option: unknown,
  ) => boolean;
}
