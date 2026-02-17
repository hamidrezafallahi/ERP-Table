import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryByToken } from "@services/customBaseQuery";

import type { IRequestToolbarData, IResponseToolbarData } from "./type";

export const toolbarServices = createApi({
  reducerPath: "toolbarServices",
  baseQuery: baseQueryByToken,
  endpoints: (builder) => ({
    getToolbarData: builder.query<IResponseToolbarData, IRequestToolbarData>({
      query: (params) => {
        return {
          url: "/api/menu/getToolbarData",
          body: { ...params },
          method: "POST",
        };
      },
    }),
  }),
});
export const { useGetToolbarDataQuery, useLazyGetToolbarDataQuery } =
  toolbarServices;
