"use client";



import React, { type CSSProperties, type ReactNode } from 'react';



import type { ColumnSchema } from '../../bootstrap/type';

import type { ColumnWindowModel } from './columnWindow';



type SpacerKind = 'start' | 'end';



type Props = {

  window: ColumnWindowModel;

  /** Render a real pinned / scrollable column cell. */

  renderColumn: (col: ColumnSchema, absoluteIndex: number) => ReactNode;

  /** Element type for horizontal spacers (`th` in header, `td` elsewhere). */

  spacerElement: 'th' | 'td';

  spacerRole?: 'columnheader' | 'presentation' | 'gridcell';

  spacerStyle?: CSSProperties;

};



function renderPinnedColumns(

  cols: ColumnSchema[],

  model: ColumnWindowModel,

  renderColumn: Props['renderColumn'],

  keyPrefix: string,

) {

  const nodes: ReactNode[] = [];

  for (const col of cols) {

    const abs = model.allVisible.findIndex((c) => c.fieldName === col.fieldName);

    nodes.push(

      <React.Fragment key={`${keyPrefix}-${col.fieldName}`}>

        {renderColumn(col, abs >= 0 ? abs : 0)}

      </React.Fragment>,

    );

  }

  return nodes;

}



/**

 * Shared column chrome for header / body / footer (PR-98 / PR-110):

 * pin start → spacerStart → scrollable window → spacerEnd → pin end.

 */

export function ColumnWindowCells({

  window: model,

  renderColumn,

  spacerElement: Spacer,

  spacerRole = 'presentation',

  spacerStyle,

}: Props) {

  const nodes: ReactNode[] = [];



  nodes.push(

    ...renderPinnedColumns(model.pinnedStart, model, renderColumn, 'pin-start'),

  );



  if (model.spacerStart > 0) {

    nodes.push(

      <Spacer

        key="pdg-col-spacer-start"

        aria-hidden

        role={spacerRole}

        data-pdg-col-spacer="start"

        style={{

          width: model.spacerStart,

          minWidth: model.spacerStart,

          padding: 0,

          border: 'none',

          ...spacerStyle,

        }}

      />,

    );

  }



  model.scrollable.forEach((col, i) => {

    const abs = model.scrollableAbsIndices[i] ?? i;

    nodes.push(

      <React.Fragment key={`scr-${col.fieldName}`}>

        {renderColumn(col, abs)}

      </React.Fragment>,

    );

  });



  if (model.spacerEnd > 0) {

    nodes.push(

      <Spacer

        key="pdg-col-spacer-end"

        aria-hidden

        role={spacerRole}

        data-pdg-col-spacer="end"

        style={{

          width: model.spacerEnd,

          minWidth: model.spacerEnd,

          padding: 0,

          border: 'none',

          ...spacerStyle,

        }}

      />,

    );

  }



  nodes.push(

    ...renderPinnedColumns(model.pinnedEnd, model, renderColumn, 'pin-end'),

  );



  return <>{nodes}</>;

}



export type { SpacerKind };


