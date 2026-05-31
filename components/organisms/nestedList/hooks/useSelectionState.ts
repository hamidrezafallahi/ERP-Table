import { useState } from "react";

export const useSelectionState = () => {
  const [selection, setSelection] = useState({
    selectedId: null as number | null,
    id: null as number | null,
    fatherId: null as number | null,
    level: null as number | null,
    title: null as string | null,
  });
  return { selection, setSelection };
};
