import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  IBaseQueryResponse,
  IBaseRequest,
} from '@services/base/type';
import {
  baseQuery,
  baseQueryByToken,
} from '@services/customBaseQuery';

import type {
  IForgetPassWordRequest,
  IForgetPassWordResponse,
  ILoginRequest,
  ILoginResponse,
  ISendOtpCodeRequest,
  ISendOtpCodeResponse,
  ISendOtpRequest,
  ISendOtpResponse,
  ISetNewPassWordRequest,
  ISetNewPassWordResponse,
  RoleDto,
} from './type';

export const Exist = createApi({
  reducerPath: "Exist",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    loginByPhoneNumber: builder.mutation<ILoginResponse, ILoginRequest>({
      query: (params) => {
        return {
          url: "/api/auth/user/exist",
          body: { ...params },
          method: "POST",
        };
      },
    }),
  }),
});
export const LoginByPassword = createApi({
  reducerPath: "LoginByPassword",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    loginByPassword: builder.mutation<ILoginResponse, ILoginRequest>({
      query: (params) => {
        return {
          url: "/api/auth/login",
          body: { ...params },
          method: "POST",
        };
      },
    }),
  }),
});
export const SendOtp = createApi({
  reducerPath: "SendOtp",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    SendOtp: builder.mutation<ISendOtpResponse, ISendOtpRequest>({
      query: (params) => {
        return {
          url: "api/auth/Select/User/SendOTP",
          body: { ...params },
          method: "POST",
        };
      },
    }),
  }),
});
export const SendOtpCode = createApi({
  reducerPath: "SendOtpCode",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    SendOtpCode: builder.mutation<ISendOtpCodeResponse, ISendOtpCodeRequest>({
      query: (params) => {
        return {
          url: "api/auth/Select/User/ValidationOTP",
          body: { ...params },
          method: "POST",
        };
      },
    }),
  }),
});
export const SetNewPassWord = createApi({
  reducerPath: "SetNewPassWord ",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    SetNewPassWord: builder.mutation<
      ISetNewPassWordResponse,
      ISetNewPassWordRequest
    >({
      query: (params) => {
        return {
          url: "api/auth/Insert/User/Password",
          body: { UserName: params.UserName, Password: params.Password },
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.token}`,
          },
        };
      },
    }),
  }),
});
export const ForgetPassWord = createApi({
  reducerPath: "ForgetPassWord ",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    ForgetPassWord: builder.mutation<
      IForgetPassWordResponse,
      IForgetPassWordRequest
    >({
      query: (params) => {
        return {
          url: "api/auth/forget/Password",
          body: { UserName: params.UserName, Password: params.Password },
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.token}`,
          },
        };
      },
    }),
  }),
});

export const AuthToken = createApi({
  reducerPath: "AuthToken",
  baseQuery: baseQueryByToken,
  endpoints: (builder) => ({
    getRole: builder.query<IBaseQueryResponse<RoleDto[]>, IBaseRequest<null>>({
      query: (params) => {
        return {
          url: "/api/auth/role",
          body: { ...params },
          method: "POST",
        };
      },
    }),
    // getMenu: builder.query<IBaseQueryResponse<IMenu[]>, IMenu>({
    //   query: (params) => {
    //     return {
    //       url: "/api/auth/menu",
    //       body: { ...params },
    //       method: "POST",
    //     };
    //   },
    // }),
  }),
});

export const { useGetRoleQuery } = AuthToken;
export const { useLoginByPhoneNumberMutation } = Exist;
export const { useLoginByPasswordMutation } = LoginByPassword;
export const { useSendOtpMutation } = SendOtp;
export const { useSendOtpCodeMutation } = SendOtpCode;
export const { useSetNewPassWordMutation } = SetNewPassWord;
export const { useForgetPassWordMutation } = ForgetPassWord;

export const { useLoginByPasswordMutation: useLoginMutation } = LoginByPassword;
