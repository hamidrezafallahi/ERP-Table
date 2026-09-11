"use client";

import React from 'react';

import { useERPTableHost, useTranslations } from '../host';
import { CustomTooltip, MoonIcon, SunIcon } from '../primitives';
import { isStockDarkTheme } from './resolveActiveTheme';

export function ThemeToggleButton() {
  const t = useTranslations();
  const { themeToggle, themeLocked, theme, onToggleTheme } = useERPTableHost();
  if (!themeToggle || themeLocked || !onToggleTheme || !theme) return null;

  const isDark = isStockDarkTheme(theme);
  const label = isDark ? t('general.themeLight') : t('general.themeDark');

  return (
    <CustomTooltip title={label}>
      <button
        type="button"
        data-erp-theme-toggle
        aria-pressed={isDark}
        aria-label={label}
        className="flex justify-center items-center p-1 border rounded"
        onClick={onToggleTheme}
      >
        {isDark ? (
          <SunIcon config={{ width: 18, height: 18 }} />
        ) : (
          <MoonIcon config={{ width: 18, height: 18 }} />
        )}
      </button>
    </CustomTooltip>
  );
}
