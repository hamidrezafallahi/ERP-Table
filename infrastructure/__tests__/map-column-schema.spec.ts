import { describe, expect, it } from 'vitest';

import {
  mapColumnSchemas,
  toColumnDefinition,
  toColumnViewBinding,
} from '../columns/mapColumnSchema';
import type { ColumnSchema } from '../../domain/types/ColumnSchema';

const schema: ColumnSchema = {
  fieldName: 'qty',
  fieldCaption: 'Quantity',
  fieldType: 'number',
  fieldCollection: 'lines',
  editable: true,
  visibility: { kind: 'always' },
  className: 'qty-col',
  minWidth: 80,
  style: { textAlign: 'right' },
  displayFormat: (v) => String(v),
  computed: {
    dependsOn: ['price'],
    compute: async () => 0,
  },
};

describe('mapColumnSchema', () => {
  it('strips React/view concerns from ColumnDefinition', () => {
    const definition = toColumnDefinition(schema);

    expect(definition.fieldName).toBe('qty');
    expect(definition.fieldType).toBe('number');
    expect(definition.computed).toEqual({ dependsOn: ['price'] });
    expect(definition).not.toHaveProperty('className');
    expect(definition).not.toHaveProperty('style');
    expect(definition).not.toHaveProperty('displayFormat');
  });

  it('keeps presentation fields on ColumnViewBinding', () => {
    const binding = toColumnViewBinding(schema);

    expect(binding.fieldName).toBe('qty');
    expect(binding.className).toBe('qty-col');
    expect(binding.minWidth).toBe(80);
    expect(binding.style).toEqual({ textAlign: 'right' });
    expect(typeof binding.displayFormat).toBe('function');
  });

  it('maps lists of schemas into definitions and bindings', () => {
    const { definitions, bindings } = mapColumnSchemas([schema]);
    expect(definitions).toHaveLength(1);
    expect(bindings).toHaveLength(1);
    expect(definitions[0].fieldCaption).toBe('Quantity');
    expect(bindings[0].className).toBe('qty-col');
  });
});
