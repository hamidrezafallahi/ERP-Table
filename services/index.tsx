import {
  AuthToken,
  Exist,
  ForgetPassWord,
  LoginByPassword,
  SendOtp,
  SendOtpCode,
  SetNewPassWord,
} from "./auth/base";
import { apiService } from "./base";
import { toolbarServices } from "./toolbar/index";

const ServiceRootReducer = () => {
  return {
    serviceReducer: {
      [Exist.reducerPath]: Exist.reducer,
      [LoginByPassword.reducerPath]: LoginByPassword.reducer,
      [SendOtp.reducerPath]: SendOtp.reducer,
      [SendOtpCode.reducerPath]: SendOtpCode.reducer,
      [ForgetPassWord.reducerPath]: ForgetPassWord.reducer,
      [SetNewPassWord.reducerPath]: SetNewPassWord.reducer,
      [AuthToken.reducerPath]: AuthToken.reducer,
      [toolbarServices.reducerPath]: toolbarServices.reducer,
      [apiService.reducerPath]: apiService.reducer,
    },
    serviceMiddleware: [
      Exist.middleware,
      LoginByPassword.middleware,
      SendOtp.middleware,
      SendOtpCode.middleware,
      SetNewPassWord.middleware,
      AuthToken.middleware,
      toolbarServices.middleware,
      apiService.middleware,
      ForgetPassWord.middleware,
    ],
  };
};

export default ServiceRootReducer;
