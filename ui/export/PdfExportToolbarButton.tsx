"use client";

import React, { useState } from 'react';

import type { PluginHost } from '../../application/plugins/PluginHost';
import { ToolbarIconButton } from '../a11y/ToolbarIconButton';
import { useDirection, useHostToast, useTranslations } from '../host';
import { PdfIcon, Spin, SpinIcon } from '../primitives';

const PDF_EXPORT_PLUGIN = 'pdf-export';

type Props = {
  pluginHost?: PluginHost;
};

/**
 * Desktop/mobile toolbar control. Renders only when PdfExportPlugin is registered.
 */
export function PdfExportToolbarButton({ pluginHost }: Props) {
  const t = useTranslations();
  const direction = useDirection();
  const { success, error } = useHostToast();
  const [busy, setBusy] = useState(false);

  if (!pluginHost?.has(PDF_EXPORT_PLUGIN)) return null;

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await pluginHost.requestExport({
        format: 'pdf',
        direction,
        fileName: `export-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      success(t('general.exportToPdfSuccess'));
    } catch {
      error(t('general.exportToPdfError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolbarIconButton
      label={t('general.exportToPdf')}
      disabled={busy}
      data-erp-pdf-export=""
      className={busy ? 'opacity-60 cursor-wait' : ''}
      onClick={() => {
        void handleExport();
      }}
    >
      {busy ? (
        <Spin
          size="small"
          indicator={<SpinIcon config={{ width: 16, height: 16 }} />}
        />
      ) : (
        <PdfIcon config={{ width: 18, height: 18 }} />
      )}
    </ToolbarIconButton>
  );
}
