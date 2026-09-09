'use client';

import React, { useRef, useState } from 'react';

import { useTranslations } from '../host';
import { CustomTooltip, Magnifier } from '../primitives';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { GridSearchPanel } from './GridSearchPanel';

interface GridSearchControlProps {
  controller: UITableController;
}

export function GridSearchControl({ controller }: GridSearchControlProps) {
  const t = useTranslations();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchAnchorRef = useRef<HTMLDivElement>(null);

  const toggleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSearchOpen((prev) => {
      if (prev) {
        void controller.dispatch({ type: 'UI_CLEAR_GRID_SEARCH' });
      }
      return !prev;
    });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    void controller.dispatch({ type: 'UI_CLEAR_GRID_SEARCH' });
  };

  return (
    <div className="relative" ref={searchAnchorRef}>
      <CustomTooltip title={t("general.search")}>
        <button
          type="button"
          className={`flex justify-center items-center p-1 border rounded ${
            searchOpen ? "bg-blue-blue11" : ""
          }`}
          onClick={toggleSearch}
        >
          <Magnifier config={{ width: 18, height: 18 }} />
        </button>
      </CustomTooltip>
      <GridSearchPanel
        controller={controller}
        isOpen={searchOpen}
        anchorRef={searchAnchorRef}
        onClose={closeSearch}
      />
    </div>
  );
}
