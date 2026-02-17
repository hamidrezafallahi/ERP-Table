import { Mutex } from "async-mutex";

import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import {
  createCookie,
  deleteCookie,
  getTokens,
  showConfirmToast,
  showErrorByErrorCode,
  showErrorToast,
  showErrorToastDelete,
  showSuccessToast,
} from "@utils/core";
import type { IDeleteResults, ILoginResponse } from "./auth/base/type";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const mutex = new Mutex();
let refreshTokenRequest: Promise<string | null> | null = null;
export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});
const allowedUrls = ["/api/auth/login", "/api/mng/select/place"];
export async function baseQueryByToken(args, api, extraOptions) {
  const { getState } = api;
  const state = getState();
  const ManagementAccount =
    state?.withPersist?.config?.defaultConfigs?.ManagementAccountId;
  const PlaceId = state?.withPersist?.config?.defaultConfigs?.PlaceId;
  const isAllowedUrl = allowedUrls.some((url) => args.url.includes(url));
  setDefaultsIntoRequest(args, api);

  if (!PlaceId) {
    if (isAllowedUrl) {
      const result: any = await fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
          const token = getTokens("_auth");
          if (token) {
            headers.set("Authorization", `Bearer ${token.val}`);
          }
          return headers;
        },
      })(args, api, extraOptions);
      if (result.meta?.response?.status === 401) {
        if (!refreshTokenRequest) {
          const release = await mutex.acquire();
          refreshTokenRequest = refreshAccessToken(ManagementAccount).finally(
            () => {
              refreshTokenRequest = null;
              release();
            }
          );
        }
        const newToken = await refreshTokenRequest;
        if (!newToken) {
          deleteCookie("_auth");
          deleteCookie("_rAuth");
          location.replace("/");
          return { error: { status: 401, data: "Unable to refresh token" } };
        }
        return fetchBaseQuery({
          baseUrl,
          prepareHeaders: (headers) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            return headers;
          },
        })(args, api, extraOptions);
      }

      return result;
    }
  } else {
    const result: any = await fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers) => {
        const token = getTokens("_auth");
        if (token) {
          headers.set("Authorization", `Bearer ${token.val}`);
        }
        return headers;
      },
    })(args, api, extraOptions);

    if (result.meta?.response?.status === 401) {
      if (!refreshTokenRequest) {
        const release = await mutex.acquire();
        refreshTokenRequest = refreshAccessToken(ManagementAccount).finally(
          () => {
            refreshTokenRequest = null;
            release();
          }
        );
      }

      const newToken = await refreshTokenRequest;
      if (!newToken) {
        deleteCookie("_auth");
        deleteCookie("_rAuth");
        location.replace("/");
        return { error: { status: 401, data: "Unable to refresh token" } };
      }
      return fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
          headers.set("Authorization", `Bearer ${newToken}`);
          return headers;
        },
      })(args, api, extraOptions);
    } else if (result.meta?.response?.status === 403) {
      showErrorToast(
        "به علت عدم  دسترسی پاسخی دریافت نشد . کد 403",
        "forbidden"
      );
    } else if (
      (result.data?.Result == false &&
        result.data?.StatusCode == "ServerError") ||
      result.meta?.response?.status === 500
    ) {
      // location.replace(`/${slug}/500`);
    } else if (result.error?.status == "FETCH_ERROR") {
      return {
        error: { status: 400, data: "PlaceId is missing and URL not allowed" },
      };
    } else if (result?.data?.Result === "Failed") {
      if (result?.data?.ErrorCode) {
        showErrorByErrorCode(result?.data?.ErrorCode, result?.data?.Error);
      } else if (result?.data?.DeleteResults?.length > 0) {
        result?.data?.DeleteResults?.map((item: IDeleteResults) => {
          if (item.IsDelete) {
            showSuccessToast("عملیات با موفقیت انجام شد", item.Key);
          } else {
            if (item?.ErrorCode === "NoDelete_Used") {
              showErrorToastDelete(
                item?.Error,
                item?.Data,
                `${item.Key} - حذف ناموفق`
              );
            } else {
              showErrorToast(item?.Error, `${item.Key} - ${item?.ErrorCode}`);
            }
          }
        });
      } else {
        if (result?.data?.InnerException) {
          showErrorToast(result?.data?.InnerException);
        } else {
          showErrorToast(result?.data?.Error, result?.data?.ErrorCode);
        }
      }
      return result;
    } else if (result?.data?.Result === "Warning") {
      const handleConfirm = async () => {
        const newData = { additionalField: "someValue" };
        const newArgs = {
          ...args,
          body: {
            ...args.body,
            ...newData,
          },
        };

        const newResult: any = await fetchBaseQuery({
          baseUrl,
          prepareHeaders: (headers) => {
            const token = getTokens("_auth");
            if (token) {
              headers.set("Authorization", `Bearer ${token.val}`);
            }
            return headers;
          },
        })(newArgs, api, extraOptions);
        if (newResult?.data?.Result === "Failed") {
          showErrorToast(result?.data?.Error, result?.data?.ErrorCode);
        } else if (newResult?.data?.Result === "Success") {
          showSuccessToast("عملیات با موفقیت انجام شد");
        }
      };

      showConfirmToast(
        result?.data?.Warnings?.map((item) => item.Mess),
        "اخطار",
        handleConfirm
      );
    }
    return result;
  }
}

async function refreshAccessToken(ManagementAccount): Promise<string | null> {
  try {
    const accessToken = getTokens("_auth");
    const refreshToken = getTokens("_rAuth");
    const DeviceToken = localStorage.getItem("fcm_token");

    if (!refreshToken) return null;

    const refreshBody = JSON.stringify({
      Token: accessToken.val,
      Refresh_Token: refreshToken.val,
      IsRefreshToken: true,
      DeviceToken: DeviceToken,
      ManagementAccountId: ManagementAccount?.id,
    });
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: refreshBody,
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ILoginResponse;
    if (data?.Result !== "Success") return null;
    createCookie("_auth", data.access_token);
    // createCookie("_rAuth", data.refresh_token);
    return data.access_token;
  } catch (err) {
    showErrorToast(err, "خطا");
    return null;
  }
}

function setDefaultsIntoRequest(args, api) {
  const { getState } = api;
  const state = getState();
  const PlaceId = state?.withPersist?.config?.defaultConfigs?.PlaceId;
  const LanguageId = state?.withPersist?.config?.defaultConfigs?.LanguageId;
  const YearId = state?.withPersist?.config?.defaultConfigs?.YearId;
  const CashierId = state?.withPersist?.config?.defaultConfigs?.CashierId;
  const CurrencyId = state?.withPersist?.config?.defaultConfigs?.CurrencyId;

  if (args.body instanceof FormData) {
    args.body.append("Defaults.CurrencyId", CurrencyId.id.toString());
    args.body.append("Defaults.CashierId", CashierId.id.toString());
    args.body.append("Defaults.PlaceId", PlaceId.id.toString());
    args.body.append("Defaults.YearId", YearId.id.toString());
    args.body.append("Defaults.LangId", LanguageId.id.toString());
  } else if (args.body) {
    args.body = {
      ...args.body,
      Defaults: {
        CurrencyId: CurrencyId?.id,
        CashierId: CashierId?.id,
        PlaceId: PlaceId?.id,
        YearId: YearId?.id,
        LanguageId: LanguageId?.id,
      },
    };
  }
}
