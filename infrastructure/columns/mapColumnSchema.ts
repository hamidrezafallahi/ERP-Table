import type { ColumnSchema } from '../../domain/types/ColumnSchema';
import type {
  ColumnDefinition,
  ColumnViewBinding,
} from '../../domain/types/ColumnDefinition';

/**
 * Maps host/legacy ColumnSchema into core ColumnDefinition + view bindings.
 * Domain/runtime should prefer ColumnDefinition; React renderers stay in bindings.
 */
export function toColumnDefinition(schema: ColumnSchema): ColumnDefinition {
  return {
    fieldName: schema.fieldName,
    fieldCaption: schema.fieldCaption,
    fieldType: schema.fieldType,
    fieldCollection: schema.fieldCollection,
    order: schema.order,
    editable: schema.editable,
    isUnique: schema.isUnique,
    hidden: schema.hidden,
    disable: schema.disable,
    noCache: schema.noCache,
    expandable: schema.expandable,
    rules: schema.rules,
    options: schema.options,
    visibility: schema.visibility,
    dynamicSource: schema.dynamicSource
      ? {
          endpoint: schema.dynamicSource.endpoint,
          dependsOn: schema.dynamicSource.dependsOn,
          dependOn: schema.dynamicSource.dependOn,
          params: schema.dynamicSource.params,
        }
      : undefined,
    computed: schema.computed
      ? { dependsOn: schema.computed.dependsOn }
      : undefined,
    selectOptions: schema.selectOptions,
    minWidth: schema.minWidth,
    labelValue: schema.labelValue,
  };
}

export function toColumnViewBinding(schema: ColumnSchema): ColumnViewBinding {
  return {
    fieldName: schema.fieldName,
    className: schema.className,
    minWidth: schema.minWidth,
    style: schema.style,
    render: schema.returnDisplayValue as ColumnViewBinding['render'],
    displayFormat: schema.displayFormat,
    onChange: schema.onChange,
    indexOptions: schema.indexOptions,
    popUpWidth: schema.popUpWidth,
    dynamicSelectFilterOption: schema.dynamicSelectFilterOption,
  };
}

export function mapColumnSchemas(schemas: ColumnSchema[]): {
  definitions: ColumnDefinition[];
  bindings: ColumnViewBinding[];
} {
  return {
    definitions: schemas.map(toColumnDefinition),
    bindings: schemas.map(toColumnViewBinding),
  };
}
