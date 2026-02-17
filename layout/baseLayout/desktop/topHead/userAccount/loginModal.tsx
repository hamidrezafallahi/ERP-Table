import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  InputPassword,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  useDeviceInfo,
  useFcmToken,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useLoginMutation } from '@services/auth/base';
import { ManagementAccount } from '@services/auth/base/type';
import { apiService } from '@services/base';
import {
  setDefaultConfig,
  setUserSession,
} from '@slice/config';
import {
  createCookie,
  resetData,
} from '@utils/core';

const LoginModal = ({ ...props }: { item: ManagementAccount }) => {
  const { item } = props;
  const [loggingIn, { data, isLoading }] = useLoginMutation();

  const { ManagementAccounts, locale } = useAppSelector((state) => {
    const ManagementAccounts =
      state?.withPersist?.config?.userSession?.ManagementAccounts;
    const locale = state.withPersist.config.lang;

    return { ManagementAccounts, locale };
  }, shallowEqual);
  const { fcmToken } = useFcmToken();
  const { deviceInfo } = useDeviceInfo();
  const [form] = useForm();
  const t = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLoginByAccountId = async (item) => {
    const user = form.getFieldValue("username");
    const pass = form.getFieldValue("password");
    const res = await loggingIn({
      Grant_Type: "password",
      DeviceToken: fcmToken ? fcmToken : localStorage.getItem("fcm_token"),
      DeviceType: deviceInfo.mobile ? 2 : 1,
      IsRefreshToken: false,
      LangId: 1,
      UserName: user,
      Password: pass,
      Refresh_Token: null,
      ManagementAccountId: item.ManagementAccountId,
    }).unwrap();
    if (res?.Result == "Success") {
      createCookie("_auth", res.access_token, 6);
      createCookie("_rAuth", res.refresh_token, 6);
      resetData(dispatch);
      dispatch(apiService.util.resetApiState());
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
        })
      );
      dispatch(
        setDefaultConfig({
          ManagementAccountId: {
            id: item.ManagementAccountId,
            desc: item.ManagementAccountDesc,
          },
        })
      );
      router.replace(`/${locale}/dashboard`);
    }
  };
  return (
    <Form
      form={form}
      className="flex flex-col justify-center items-center gap-4 px-2 pt-10 w-96 h-[300px]"
      name="Login"
      layout="vertical"
      onFinish={() => handleLoginByAccountId(item)}
    >
      <Form.Item
        className="!w-full"
        label={
          <span className="!text-gray-gray10 dark:!text-gray-gray1">
            {t("general.userName")}
          </span>
        }
        name="username"
      >
        <InputText
          placeholder={t("general.userNamePlaceholder")}
          className="dark:!bg-gray-gray11 border-none w-full text-gray-gray10 dark:!text-gray-gray1"
          type="string"
          name="username"
        />
      </Form.Item>
      <Form.Item
        className="!w-full"
        label={
          <span className="!text-gray-gray10 dark:!text-gray-gray1">
            {t("general.password")}
          </span>
        }
        name="password"
      >
        <InputPassword
          placeholder="**********"
          className="dark:!bg-gray-gray11 border-1 focus:border-gray-gray5 active:border-gray-gray5 text-gray-gray10 dark:!text-gray-gray1"
          type="string"
          name="password"
        />
      </Form.Item>

      <Form.Item className="w-full">
        <CustomButton
          disabled={isLoading}
          loading={isLoading}
          className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-10 text-main-white hover:!text-black-black9 dark:!text-main-black"
          htmlType="submit"
        >
          {t("general.loggingIn")}
        </CustomButton>
      </Form.Item>
    </Form>
  );
};
export default LoginModal;
