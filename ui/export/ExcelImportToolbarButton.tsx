"use client";

import React, { useRef, useState } from 'react';

import type { PluginHost } from '../../application/plugins/PluginHost';
import { ToolbarIconButton } from '../a11y/ToolbarIconButton';
import { useHostToast, useTranslations } from '../host';
import { ExcelImport, Spin, SpinIcon } from '../primitives';

const EXCEL_IMPORT_PLUGIN = 'excel-import';
const XLSX_ACCEPT =
  '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type Props = {
  pluginHost?: PluginHost;
};

/**
 * Desktop/mobile toolbar control. Renders only when ExcelImportPlugin is registered.
 */
export function ExcelImportToolbarButton({ pluginHost }: Props) {
  const t = useTranslations();
  const { success, error } = useHostToast();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!pluginHost?.has(EXCEL_IMPORT_PLUGIN)) return null;

  const handleImport = async (file: File) => {
    if (busy) return;
    setBusy(true);
    try {
      await pluginHost.requestImport({ format: 'xlsx', data: file });
      success(t('general.importFromExcelSuccess'));
    } catch {
      error(t('general.importFromExcelError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ToolbarIconButton
        label={t('general.importFromExcel')}
        disabled={busy}
        data-erp-xlsx-import=""
        className={busy ? 'opacity-60 cursor-wait' : ''}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {busy ? (
          <Spin
            size="small"
            indicator={<SpinIcon config={{ width: 16, height: 16 }} />}
          />
        ) : (
          <ExcelImport config={{ width: 18, height: 18 }} />
        )}
      </ToolbarIconButton>
      <input
        ref={inputRef}
        type="file"
        accept={XLSX_ACCEPT}
        hidden
        data-erp-xlsx-import-input=""
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void handleImport(file);
        }}
      />
    </>
  );
}
