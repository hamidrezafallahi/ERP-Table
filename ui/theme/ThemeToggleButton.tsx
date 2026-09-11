"use client";

import React from 'react';

import { useERPTableHost, useTranslations } from '../host';
import { MoonIcon, SunIcon } from '../primitives';
import { isStockDarkTheme } from './resolveActiveTheme';
import { ToolbarIconButton } from '../a11y/ToolbarIconButton';

export function ThemeToggleButton() {
  const t = useTranslations();
  const { themeToggle, themeLocked, theme, onToggleTheme } = useERPTableHost();
  if (!themeToggle || themeLocked || !onToggleTheme || !theme) return null;

  const isDark = isStockDarkTheme(theme);
  const label = isDark ? t('general.themeLight') : t('general.themeDark');

  return (
    <ToolbarIconButton
      label={label}
      data-erp-theme-toggle=""
      aria-pressed={isDark}
      onClick={onToggleTheme}
    >
      {isDark ? (
        <SunIcon config={{ width: 18, height: 18 }} />
      ) : (
        <MoonIcon config={{ width: 18, height: 18 }} />
      )}
    </ToolbarIconButton>
  );
}
