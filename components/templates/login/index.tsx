"use client";
import {
  useEffect,
  useState,
} from 'react';

import { useForm } from 'antd/es/form/Form';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
} from '@components/atoms/defaultElements';
import {
  LoginLanguageIcon,
  RightArrow,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import {
  useDeviceInfo,
  useFcmToken,
  useNavigatePage,
} from '@hooks/custom';
import { useGetPlaceConfigs } from '@hooks/custom/useGetPlaceConfigs';
import DarkLogo from '@public/images/ArianTechDark.png';
import LightLogo from '@public/images/ArianTechLight.png';
import { useAppSelector } from '@redux/index';
import {
  useForgetPassWordMutation,
  useLoginByPasswordMutation,
  useLoginByPhoneNumberMutation,
  useSendOtpCodeMutation,
  useSendOtpMutation,
  useSetNewPassWordMutation,
} from '@services/auth/base';
import { ManagementAccount } from '@services/auth/base/type';
import { apiService } from '@services/base';
import {
  setDefaultConfig,
  setLanguage,
  setUserSession,
} from '@slice/config';
import {
  createCookie,
  randomString,
  showErrorToast,
} from '@utils/core';

import BuyAccount from './buyAccount';
import CallAdmin from './callAdmin';
import CreateAccount from './createAccount';
import DoNotExistForm from './doNotExistForm';
import Forget from './forget';
import ForgetNewPassword from './forgetNewPassword';
import ForgetOtp from './forgetOtp';
import LoginForm from './loginForm';
import ManagmentAccounts from './managmentAccounts';
import NewPassWord from './newPassWord';
import OtpLoginForm from './otpLoginForm';
import PasswordLoginForm from './passwordLoginForm';
import SuccessfulChangePass from './successfulChangePass';
import type { IFieldType } from './type';
import WelcomeStep from './welcomeStep';

export type TStep =
  | "login"
  | "password"
  | "otp"
  | "doNotExist"
  | "newPassword"
  | "welcome"
  | "managementAccounts"
  | "forgetPassword"
  | "resetPasswordOtp"
  | "setNewPassword"
  | "successfullyChangePass"
  | "buyAccount"
  | "callAdmin"
  | "createAccount";

export default function Login() {
  const preDeviceToken = localStorage.getItem("fcm_token");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [managementAccounts, setManagementAccounts] =
    useState<ManagementAccount[]>(null);
  const { lang, theme } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      theme: state.withPersist.config.theme,
    }),
    shallowEqual,
  );

  const [form] = useForm<IFieldType>();

  const { fcmToken } = useFcmToken();
  const [exist, { isLoading: isExistLoading }] =
    useLoginByPhoneNumberMutation();
  const [loginByPassword, { isLoading: isLoggingInLoading }] =
    useLoginByPasswordMutation();
  const [step, setStep] = useState<TStep>("login");

  const t = useTranslations();
  const dispatch = useDispatch();
  const { deviceInfo } = useDeviceInfo();
  const router = useRouter();
  const [SendOTP, { isLoading: isOtpLoading }] = useSendOtpMutation();
  const [SendOTPCode, { isLoading: isSendOtpLoading }] =
    useSendOtpCodeMutation();
  const [SetNewPassWord, { isLoading: isSetNewPassWordLoading }] =
    useSetNewPassWordMutation();
  const [ForgetPassWord, { isLoading: isForgetPassWordLoading }] =
    useForgetPassWordMutation();
  const { navigateLast } = useNavigatePage();
  const { getPlaceConfigs } = useGetPlaceConfigs();
  const [token, setToken] = useState(
    preDeviceToken?.length > 0 ? preDeviceToken : randomString(80),
  );

  const [acceptAccountModalOpen, setAcceptAccountModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ManagementAccount>(null);
  const params = useSearchParams();
  const handleLoginByPhoneNumber = async () => {
    const phoneNumber = form.getFieldValue("phoneNumber");
    try {
      const res: any = await exist({
        UserName: phoneNumber,
        DeviceToken: token,
      }).unwrap();

      if (res?.Result === "Success" && res.Data?.length > 0) {
        const condition = res.Data[0];
        if (!condition.Exist) {
          setStep("doNotExist");
        } else if (condition.Inactive) {
          await SendOTP({ UserName: phoneNumber });
          setStep("otp");
        } else {
          setStep("password");
        }
      } else {
        console.error("Server returned unexpected result:", res);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleNewPassword = async () => {
    const phoneNumber = form.getFieldValue("phoneNumber");
    const pass = form.getFieldValue("newPassword");
    const resetPasswordToken = form.getFieldValue("resetPassWordToken");

    try {
      const res: any = await SetNewPassWord({
        UserName: phoneNumber,
        Password: pass,
        token: resetPasswordToken,
      }).unwrap();

 
      if (res?.Result === true) {
        form.setFieldValue("password", pass);
        setStep("welcome");
      } else {
        console.error("Set password failed:", res.Error);
        setOtpError("عملیات با خطا مواجه شد");
      }
    } catch (err) {
      console.error("Set new password failed", err);
      setOtpError("عملیات با خطا مواجه شد");
    }
  };
  const handleCreateAccount = async () => {
    setStep("createAccount");
  };
  const handlePasswordLogin = async () => {
    const phoneNumber = form.getFieldValue("phoneNumber");
    const pass = form.getFieldValue("password");
    try {
      const res = await loginByPassword({
        UserName: phoneNumber,
        Password: pass,
        Grant_Type: "password",
        DeviceToken: token,
        DeviceType: deviceInfo.mobile ? 2 : 1,
        IsRefreshToken: false,
        LangId: 1,
        Refresh_Token: null,
      }).unwrap();
      if (res?.Result === "Success") {
        if (res?.ManagementAccounts?.length == 1) {
          if (res?.ManagementAccounts[0].InActive) {
            setAcceptAccountModalOpen(true);
            setModalContent(res?.ManagementAccounts[0]);
          } else {
            handleLoginByAccount(res.ManagementAccounts[0]);
          }
        } else {
          setManagementAccounts(res.ManagementAccounts);
          setStep("managementAccounts");
        }
        
        // createCookie("_auth", res.access_token, 6);
        // createCookie("_rAuth", res.refresh_token, 6);
        // dispatch(
          //   setUserSession({
            //     userSession: res.UserSession,
            //   })
            // );
            // dispatch(
              //   setDefaultConfig({
                //     ManagementAccountId: {
                  //       id: res.ManagementAccounts[0].ManagementAccountId,
                  //       desc: res.ManagementAccounts[0].ManagementAccountDesc,
                  //     },
                  //   })
                  // );
                  // localStorage.setItem("fcm_token", token);
        // navigateLast();
      } else {
        showErrorToast(res.Error);
      }
    } catch {
      showErrorToast("خطا در ورود با پسورد");
    }
  };

  const handleChangeLanguage = (newLang: "fa" | "en") => {
    dispatch(setLanguage({ lang: newLang }));
    router.replace(newLang);
  };

  const handleLoginByAccount = async (item: ManagementAccount) => {
    const pass = form.getFieldValue("password");
    const phoneNumber = form.getFieldValue("phoneNumber");
     const res = await loginByPassword({
      Grant_Type: "password",
      DeviceToken: token,
      DeviceType: deviceInfo.mobile ? 2 : 1,
      IsRefreshToken: false,
      LangId: 1,
      UserName: phoneNumber,
      Password: pass,
      Refresh_Token: null,
      ManagementAccountId: item.ManagementAccountId,
    }).unwrap();
      if (res?.Result == "Success") {
      if (res.IsExpire) {
        if (res.UserSession?.UserInfo?.IsAdmin) {
          setStep("buyAccount");
        } else {
          setStep("callAdmin");
        }
      } else {
        createCookie("_auth", res.access_token, 6);
        createCookie("_rAuth", res.refresh_token, 6);
        dispatch(
          setUserSession({
            userSession: {
              UserInfo: res.UserSession.UserInfo,
              ManagementAccounts: res.ManagementAccounts,
              RoleDto: res.UserSession?.RoleDto.map((item, index) => ({
                ...item,
                IsSupporter: item.IsSupporter ?? false,
                isActiveRole: index == 0,
              })),
            },
          }),
        );
        dispatch(
          setDefaultConfig({
            ManagementAccountId: {
              id: item.ManagementAccountId,
              desc: item.ManagementAccountDesc,
            },
          }),
        );
        localStorage.setItem("fcm_token", token);
        getPlaceConfigs()
        navigateLast();
      }
    } else {
      showErrorToast(res.Error);
    }
  };

  const settingMenuItems = [
    {
      key: "fa",
      label: (
        <span
          className="flex items-center gap-3 text-sm"
          onClick={() => handleChangeLanguage("fa")}
        >
          فارسی
        </span>
      ),
    },
    {
      key: "en",
      label: (
        <span
          className="flex items-center gap-3 text-sm"
          onClick={() => handleChangeLanguage("en")}
        >
          English
        </span>
      ),
    },
  ];

  const handleOtpLogin = async (values: { otp: number }) => {
    const user = params.get("phone");
    const phoneNumber =
      user?.length > 0 ? user : form.getFieldValue("phoneNumber");

    try {
      const res: any = await SendOTPCode({
        UserName: phoneNumber,
        Otp: values.otp,
        UsertDevice: token,
      }).unwrap();

      if (res?.Result === true) {
        form.setFieldValue("resetPassWordToken", res?.Data?.Token);

        setStep("newPassword");
      } else {
        setOtpError("کد وارد شده اشتباه است");
      }
    } catch (err) {
      setOtpError("کد وارد شده اشتباه است");
    }
  };

  const handleForgetSubmit = async (values: { phoneNumber: string }) => {
    try {
      const res: any = await SendOTP({ UserName: values.phoneNumber }).unwrap();
      if (res?.Result === true) {
        setOtpError(null);
        setStep("resetPasswordOtp");
      } else {
        setOtpError("کد وارد شده اشتباه است");
      }
    } catch (err) {
      setOtpError("کد وارد شده اشتباه است");
    }
  };

  const handleOtpSubmit = async (values: { otp: number }) => {
    const user = params.get("phone");
    const phoneNumber =
      user?.length > 0 ? user : form.getFieldValue("phoneNumber");

    try {
      const res: any = await SendOTPCode({
        UserName: phoneNumber,
        Otp: values.otp,
        UsertDevice: token,
      }).unwrap();

      if (res?.Result === true) {
        form.setFieldValue("resetPassWordToken", res?.Data?.Token);
        setOtpError(null);
        setStep("setNewPassword");
      } else {
        setOtpError("کد وارد شده اشتباه است");
      }
    } catch (err) {
      setOtpError("کد وارد شده اشتباه است");
    }
  };

  const handleNewPasswordSubmit = async () => {
    const user = params.get("phone");
    const phoneNumber =
      user?.length > 0 ? user : form.getFieldValue("phoneNumber");
    const newPassword = form.getFieldValue("newPassword");
    const resetToken = form.getFieldValue("resetPassWordToken");
    try {
      const res: any = await ForgetPassWord({
        UserName: phoneNumber,
        Password: newPassword,
        token: resetToken,
      }).unwrap();

      if (res?.Result === "Success") {
        form.setFieldValue("password", newPassword);
        setStep("successfullyChangePass");
      } else {
        console.error("خطا در تنظیم رمز جدید", res);
      }
    } catch (err) {
      console.error("خطا در تنظیم رمز جدید", err);
    }
  };

  const renderStep = (step: TStep) => {
    switch (step) {
      case "login":
        return (
          <LoginForm
            isLoading={isLoggingInLoading || isOtpLoading}
            onFinish={handleLoginByPhoneNumber}
            form={form}
          />
        );
      case "password":
        return (
          <PasswordLoginForm
            form={form}
            isLoading={isLoggingInLoading}
            handlePasswordLogin={handlePasswordLogin}
            onForgetClick={() => {
              setStep("forgetPassword");
            }}
          />
        );

      case "otp":
        return (
          <OtpLoginForm
            onBack={() => {
              setStep("login");
            }}
            mobile={form.getFieldValue("phoneNumber")}
            onSubmit={handleOtpLogin}
            onResend={async () => {
              try {
                const sendOTPResult: any = await SendOTP({
                  UserName: form.getFieldValue("phoneNumber"),
                }).unwrap();

                if (sendOTPResult?.Result === true) {
                  setOtpError(null);
                } else {
                  console.log("ارسال کد با خطا مواجه شد");
                }
              } catch (error) {
                console.error("OTP resend failed:", error);
                setOtpError("ارسال مجدد کد با خطا مواجه شد");
              }
            }}
            isLoading={isSendOtpLoading}
            error={otpError}
          />
        );
      case "doNotExist":
        return <DoNotExistForm onFinish={handleCreateAccount} />;
      case "newPassword":
        return (
          <NewPassWord
            form={form}
            onFinish={handleNewPassword}
            isLoading={isSetNewPassWordLoading}
          />
        );
      case "welcome":
        return <WelcomeStep onFinish={handlePasswordLogin} />;
      case "managementAccounts":
        return (
          <ManagmentAccounts
            acceptAccountModalOpen={acceptAccountModalOpen}
            handleLoginByAccount={handleLoginByAccount}
            managementAccounts={managementAccounts}
            modalContent={modalContent}
            setAcceptAccountModalOpen={setAcceptAccountModalOpen}
            setModalContent={setModalContent}
          />
        );
      case "forgetPassword":
        return (
          <Forget
            onFinish={handleForgetSubmit}
            form={form}
            onClose={() => setStep("login")}
            isLoading={isForgetPassWordLoading}
          />
        );
      case "resetPasswordOtp":
        return (
          <ForgetOtp
            mobile={form.getFieldValue("phoneNumber")}
            onSubmit={handleOtpSubmit}
            isLoading={isOtpLoading || isSendOtpLoading}
            onClose={() => setStep("login")}
            error={otpError}
          />
        );

      case "setNewPassword":
        return (
          <ForgetNewPassword
            form={form}
            onFinish={handleNewPasswordSubmit}
            isLoading={isSetNewPassWordLoading}
            onClose={() => setStep("login")}
          />
        );
      case "successfullyChangePass":
        return (
          <SuccessfulChangePass
            onClick={handlePasswordLogin}
            onClose={() => setStep("login")}
          />
        );

      case "buyAccount":
        return <BuyAccount />;
      case "callAdmin":
        return <CallAdmin />;

      default:
        return null;
    }
  };

  useEffect(() => {
    const user = params.get("phone");
    if (user?.length > 0) {
      form.setFieldValue("phoneNumber", user);
      handleLoginByPhoneNumber();
    }
  }, [params]);
  useEffect(() => {
    dispatch(apiService.util.resetApiState());
    if (fcmToken) {
      localStorage.setItem("fcm_token", fcmToken);
      setToken(fcmToken);
    }
  }, [fcmToken]);

  return (
    <>
      <Title caption={"title.login"} />
      <div className="flex justify-center items-center bg-main-white lg:bg-gray-gray3 dark:bg-black-black8 w-full">
        {step === "buyAccount" ? (
          <div className="flex justify-center items-center bg-main-white lg:bg-gray-gray3 dark:bg-black-black8 p-6 w-full">
            <div className="relative flex flex-wrap justify-center items-center bg-main-white dark:bg-gray-gray13 shadow-md p-8 rounded-2xl max-w-[990px]">
              <CustomDropdownButton placement="bottom" items={settingMenuItems}>
                <div
                  className={`top-4 absolute cursor-pointer left-4 w-fit flex justify-start text-gray-gray8 dark:text-white`}
                >
                  <div className="flex gap-2" dir="ltr">
                    {lang == "fa" ? "فارسی" : "English"} <LoginLanguageIcon />
                  </div>
                </div>
              </CustomDropdownButton>
              <CustomButton
                onClick={() => setStep("login")}
                className="top-4 right-4 absolute border-none"
              >
                <RightArrow />
              </CustomButton>
              <div className="w-full">
                <Image
                  priority
                  src={theme == "light" ? DarkLogo : LightLogo}
                  alt={t("company.name")}
                  width={174}
                  height={38}
                  className="mx-auto"
                />
              </div>
              <BuyAccount />
            </div>
          </div>
        ) : step === "createAccount" ? (
          <CreateAccount />
        ) : (
          <div
            className={`relative flex flex-col justify-center items-center place-content-center bg-main-white dark:bg-gray-gray13 px-10 sm:rounded-2xl w-full h-full sm:min-w-[492px] sm:max-w-[492px] sm:h-[365px]`}
          >
            {![
              "forgetPassword",
              "resetPasswordOtp",
              "setNewPassword",
              "successfullyChangePass",
              "createAccount",
            ].includes(step) && (
              <>
                <CustomDropdownButton
                  placement="bottom"
                  items={settingMenuItems}
                >
                  <div
                    className={`top-4 absolute cursor-pointer left-4 w-fit flex justify-start text-gray-gray8 dark:text-white`}
                  >
                    <div className="flex gap-2" dir="ltr">
                      {lang == "fa" ? "فارسی" : "English"} <LoginLanguageIcon />
                    </div>
                  </div>
                </CustomDropdownButton>

                {!["login"].includes(step) && (
                  <CustomButton
                    onClick={() => setStep("login")}
                    className="top-4 right-4 absolute border-none"
                  >
                    <RightArrow />
                  </CustomButton>
                )}

                <div className="pt-[30px] pb-[10px]">
                  <Image
                    priority
                    src={theme == "light" ? DarkLogo : LightLogo}
                    alt={t("company.name")}
                    width={174}
                    height={38}
                    className="mx-auto mb-1"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col justify-center items-center gap-6 w-full">
              {isExistLoading ? <>loading...</> : renderStep(step)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
