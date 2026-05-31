import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByToken } from '@services/customBaseQuery';

import { endpoints } from './endpoints';
import type {
  IBaseQueryResponse,
  IBaseRequest,
  ICommandResponse,
  IService,
} from './type';

export const apiService = createApi({
  reducerPath: "apiService",
  baseQuery: baseQueryByToken,
  tagTypes: endpoints.map((e) => e.toLowerCase()),
  endpoints: (builder) => ({
    getInfinite: builder.query<
      IBaseQueryResponse<any>,
      { url: string; body: IBaseRequest<any>; id: number | string }
    >({
      query: ({ url, body, id }) => ({
        url,
        method: "POST",
        body,
        id,
      }),

      // serializeQueryArgs: ({ queryArgs }) => {
      //   if (queryArgs.body?.RepoViewId) {
      //     return `${queryArgs.url}-${queryArgs.body.RepoViewId}`;
      //   } else return queryArgs.url;
      // },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${JSON.stringify(queryArgs)}`;
      },
      // merge: (currentCache, newItems) => {
      //   if (!newItems?.Data?.length) return;

      //   if (!currentCache.Data) currentCache.Data = [];

      //   const filtered = newItems.Data.filter(
      //     (newItem) =>
      //       !currentCache.Data.some(
      //         (oldItem) => JSON.stringify(oldItem) === JSON.stringify(newItem),
      //       ),
      //   );

      //   if (filtered.length > 0) {
      //     currentCache.Data.push(...filtered);
      //   }
      // },
      merge: (currentCache, newItems, { arg }) => {
        //در حالت موبایل بخش refetch data مشکل داشت و بعد از هر تغییری دیتا تغییری نمیکرد بنابراین این merge جایگزین merge قبلی شده.
        const page = arg?.body?.PagingInfo?.PageNumber;
        if (!newItems?.Data) return;
        if (page === 1) {
          currentCache.Data = newItems.Data;
          return;
        }
        if (!currentCache.Data) currentCache.Data = [];
        const existingIds = new Set(currentCache.Data.map((i) => i.Id));
        const filtered = newItems.Data.filter(
          (item) => !existingIds.has(item.Id),
        );
        currentCache.Data.push(...filtered);
      },

      forceRefetch({ currentArg, previousArg }) {
        if (!previousArg) return true;

        return (
          currentArg.body.PagingInfo.PageNumber !==
          previousArg.body.PagingInfo.PageNumber
        );
      },

      providesTags: (result, error, { url, id }) => {
        const parts = url.split("/");
        const operationIndex = parts?.findIndex(
          (el) => el.toLowerCase() === "select",
        );
        const endpoint =
          parts?.[operationIndex + 1]?.toLowerCase() || "unknown";
        const tag = endpoint.split("4", 1)[0];
        return [{ type: tag, id: id ? id : "All" }];
      },
    }),

    get: builder.query<
      IBaseQueryResponse<any>,
      { url: string; body: IBaseRequest<any>; id: number | string }
    >({
      query: ({ url, body, id }) => ({
        url,
        method: "POST",
        body,
        id,
      }),

      providesTags: (result, error, { url, id }) => {
        const parts = url.split("/");

        const operationIndex = parts?.findIndex(
          (el) => el.toLowerCase() === "select",
        );
        const endpoint =
          parts?.[operationIndex + 1]?.toLowerCase() || "unknown";
        const tag = endpoint.split("4", 1)[0];
        return [{ type: tag, id: id ? id : "All" }];
      },
    }),

    getConditionally: builder.mutation<
      IBaseQueryResponse<any>,
      { url: string; body: IBaseRequest<any>; id?: number | string, skip?: boolean }
    >({
      query: ({ url, body, id, skip = false }) => ({
        url,
        method: "POST",
        body,
        id: id ? id : "All",
        skip
      }),
    }),

    CUDData: builder.mutation<
      ICommandResponse,
      { url: string; body: any; id?: number | string }
    >({
      query: ({ url, body, id }) => ({
        url,
        method: "POST",
        body,
        id: id ? id : "All",
      }),

      invalidatesTags: (result, error, { url, id }) => {
        if (id !== "LIST") {
          if (result?.Result === "Success") {
            const parts = url.split("/");

            const operationIndex = parts?.findIndex(
              (el) =>
                el.toLowerCase() === "insert" ||
                el.toLowerCase() === "update" ||
                el.toLowerCase() === "delete" ||
                el.toLowerCase() === "inactive",
            );
            const endpoint =
              parts?.[operationIndex + 1]?.toLowerCase() || "unknown";

            const tag = endpoint.split("4", 1)[0];

            return [{ type: tag, id: id ? id : "All" }];
          }
          if (result?.Result === "Pending") {
            const parts = url.split("/");

            const operationIndex = parts?.findIndex(
              (el) =>
                el.toLowerCase() === "insert" ||
                el.toLowerCase() === "update" ||
                el.toLowerCase() === "delete" ||
                el.toLowerCase() === "inactive",
            );
            const endpoint =
              parts?.[operationIndex + 1]?.toLowerCase() || "unknown";

            const tag = endpoint.split("4", 1)[0];

            return [{ type: tag, id: id ? id : "All" }];
          }
        }

        return [];
      },
    }),
    CUDFormData: builder.mutation<
      ICommandResponse,
      {
        url: string; body: any; id?: number | string
      }
    >({
      query: ({ url, body, id }) => ({
        url,
        method: "POST",
        body,
        id: id ? id : "All",

      }),

      invalidatesTags: (result, error, { url, id }) => {
        if (result?.Result === "Success") {
          const parts = url.split("/");

          const operationIndex = parts?.findIndex(
            (el) =>
              el.toLowerCase() === "insert" ||
              el.toLowerCase() === "update" ||
              el.toLowerCase() === "delete" ||
              el.toLowerCase() === "inactive",
          );
          const endpoint =
            parts?.[operationIndex + 1]?.toLowerCase() || "unknown";
          const tag = endpoint.split("4", 1)[0];

          return [{ type: tag, id: id ? id : "All" }];
        }

        return [];
      },
    }),
  }),
});

export const {
  useGetQuery,
  useCUDDataMutation,
  useGetInfiniteQuery,
  useCUDFormDataMutation,
  useGetConditionallyMutation,
} = apiService;

export const useGetInfinite = <T, K = unknown>({
  url,
  body,
  id = "All",
  skip = false,
}: IService<T, K>) => {
  const { data, ...rest } = useGetInfiniteQuery(
    {
      url,
      body,
      id,
    },
    {
      skip,
      refetchOnMountOrArgChange: false, //من اینو کامنت کردم چون باعث ارسال ریکوئست با هر تغییر ریداکس میشد.
      selectFromResult: (result) => ({
        ...result,
        data: result.data as IBaseQueryResponse<T> | undefined,
      }),
    },
  );

  return {
    data,
    ...rest,
  };
};

export const useGetData = <T, K = unknown>({
  url,
  body,
  id = "All",
  skip = false,
}: IService<T, K>) => {
  const { data, ...rest } = useGetQuery(
    {
      url,
      body,
      id,
    },
    {
      skip,
      selectFromResult: (result) => ({
        ...result,
        data: result.data as IBaseQueryResponse<T> | undefined,
      }),
      refetchOnMountOrArgChange: false, //من اینو کامنت کردم چون باعث ارسال ریکوئست با هر تغییر ریداکس میشد.
    },
  );

  return {
    data,
    ...rest,
  };
};
