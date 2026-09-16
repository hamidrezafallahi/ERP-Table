"use client";

import React, { type ReactNode } from 'react';

import { useTranslations } from '../host';
import { NoData, SpinIcon } from '../primitives';
import {
  resolveGridOverlay,
  type GridOverlayKind,
} from './resolveGridOverlay';

export type GridOverlayContext = {
  loading: boolean;
  rowCount: number;
  kind: Exclude<GridOverlayKind, null>;
};

export type GridOverlayComponent = (ctx: GridOverlayContext) => ReactNode;

export type GridOverlaysProps = {
  loading?: boolean;
  rowCount: number;
  loadingOverlayComponent?: GridOverlayComponent;
  noRowsOverlayComponent?: GridOverlayComponent;
};

function DefaultLoadingOverlay() {
  const t = useTranslations();
  return (
    <div className="pdg-overlay__panel" data-pdg-overlay-default="loading">
      <SpinIcon config={{ width: 28, height: 28 }} />
      <span>{t('general.loading')}</span>
    </div>
  );
}

function DefaultNoRowsOverlay() {
  const t = useTranslations();
  return (
    <div className="pdg-overlay__panel" data-pdg-overlay-default="noRows">
      <NoData config={{ width: 56, height: 56 }} />
      <span>{t('general.noData')}</span>
    </div>
  );
}

/**
 * Absolute layer over the scroll body: loading or empty (PR-103).
 */
export function GridOverlays({
  loading,
  rowCount,
  loadingOverlayComponent,
  noRowsOverlayComponent,
}: GridOverlaysProps) {
  const kind = resolveGridOverlay(loading, rowCount);
  if (!kind) return null;

  const ctx: GridOverlayContext = {
    loading: Boolean(loading),
    rowCount,
    kind,
  };

  let body: ReactNode;
  if (kind === 'loading') {
    body = loadingOverlayComponent ? (
      loadingOverlayComponent(ctx)
    ) : (
      <DefaultLoadingOverlay />
    );
  } else {
    body = noRowsOverlayComponent ? (
      noRowsOverlayComponent(ctx)
    ) : (
      <DefaultNoRowsOverlay />
    );
  }

  return (
    <div
      className="pdg-overlay"
      data-pdg-overlay={kind}
      role="status"
      aria-live="polite"
      aria-busy={kind === 'loading' ? true : undefined}
    >
      {body}
    </div>
  );
}
