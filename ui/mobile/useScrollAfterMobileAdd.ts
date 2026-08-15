import { RefObject, useEffect, useRef } from 'react';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { useMobileEditorState } from '../hooks/useEngineSelector';
import { scrollToTableEnd } from './scrollToTableEnd';

export function useScrollAfterMobileAdd(
  scrollRef: RefObject<HTMLElement | null>,
  controller: UITableController,
  revealAllRows: () => void,
) {
  const mobileEditor = useMobileEditorState(controller);
  const previousEditorRef = useRef(mobileEditor);

  useEffect(() => {
    const previousEditor = previousEditorRef.current;
    previousEditorRef.current = mobileEditor;

    if (previousEditor?.mode !== 'add' || mobileEditor) {
      return;
    }

    revealAllRows();

    const rowId = previousEditor.rowId;
    requestAnimationFrame(() => {
      scrollToTableEnd(scrollRef.current, rowId);
      requestAnimationFrame(() => {
        scrollToTableEnd(scrollRef.current, rowId);
      });
    });
  }, [mobileEditor, revealAllRows, scrollRef]);
}
