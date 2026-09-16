<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const props = defineProps<{
  name: 'basic' | 'sorting' | 'filtering' | 'editing' | 'selection' | 'grouping' | 'virtualization' | 'keyboard' | 'theming' | 'i18n' | 'dates' | 'export';
}>();

const host = ref<HTMLElement | null>(null);
let root: Root | null = null;

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  basic: () => import('../../../demos/BasicGrid'),
  sorting: () => import('../../../demos/SortingGrid'),
  filtering: () => import('../../../demos/FilteringGrid'),
  editing: () => import('../../../demos/EditingGrid'),
  selection: () => import('../../../demos/SelectionGrid'),
  grouping: () => import('../../../demos/GroupingGrid'),
  virtualization: () => import('../../../demos/VirtualizationGrid'),
  keyboard: () => import('../../../demos/KeyboardGrid'),
  theming: () => import('../../../demos/ThemingGrid'),
  i18n: () => import('../../../demos/I18nGrid'),
  dates: () => import('../../../demos/DatesGrid'),
  export: () => import('../../../demos/ExportGrid'),
};

onMounted(async () => {
  if (!host.value) return;
  const mod = await loaders[props.name]();
  root = createRoot(host.value);
  root.render(createElement(mod.default as never));
});

onBeforeUnmount(() => {
  root?.unmount();
  root = null;
});
</script>

<template>
  <div class="pdg-live-demo" ref="host" />
</template>
