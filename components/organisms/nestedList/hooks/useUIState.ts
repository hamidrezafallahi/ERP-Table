import { useState } from "react";

export const useUIState = () => {
  const [ui, setUi] = useState({
    searchTerm: "",
    expandedKeys: [] as any[],
    draggedKey: null as any,
  });
  return { ui, setUi };
};
