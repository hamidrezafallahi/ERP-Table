export const getAllKeys = <T extends { key: any; children?: T[] }>(
  data: T[],
): any[] => {
  const keys = [];
  const traverse = (nodes) => {
    nodes.forEach((node) => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(data);
  return keys;
};

export const handleFilterTreeData = (data: any[], searchTerm: string) => {
  if (!searchTerm) return data;
  return data
    .map((item) => {
      const title = item.name?.toLowerCase() || "";
      const isMatch = title.includes(searchTerm.toLowerCase());

      const filteredChildren = handleFilterTreeData(
        item.children || [],
        searchTerm,
      );
      if (isMatch) {
        return {
          ...item,
          children: item.children?.length > 0 ? item.children : undefined,
        };
      }
      if (filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter(Boolean);
};

