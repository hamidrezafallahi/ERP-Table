import { useDispatch } from "react-redux";

import { apiService } from "@services/base";

export const useInvalidateTag = (url?: string) => {
  const dispatch = useDispatch();

  const getTagFromUrl = (urlStr: string) => {
    const parts = urlStr.split("/");
    const operationIndex = parts.findIndex((el) =>
      ["insert", "update", "delete", "select"].includes(el.toLowerCase())
    );
    const endpoint = parts?.[operationIndex + 1]?.toLowerCase() || "unknown";
    const tag = endpoint.split("4", 1)[0];
    return tag;
  };

  const invalidate = (customUrl?: string) => {
    const realUrl = customUrl || url;
    if (!realUrl) return;
    const tag = getTagFromUrl(realUrl);
    dispatch(apiService.util.invalidateTags([{ type: tag, id: "LIST" }]));
  };

  return { invalidate };
};
