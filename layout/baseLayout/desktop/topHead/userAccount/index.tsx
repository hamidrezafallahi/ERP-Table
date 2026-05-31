import { useState } from 'react';

import {
  Dropdown,
  MenuProps,
} from 'antd';
import moment from 'moment-jalaali';
import {
  useFormatter,
  useTranslations,
} from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import {
  AccountSettingIcon,
  LogOutIcon,
  MyDevicesIcon,
  TickIcon,
  UserIcon2,
  UserInfoIcon,
  VaultIcon,
} from '@components/atoms/iconComponents';
import { LookIcon } from '@components/atoms/iconComponents/icons/look';
import {
  useHandle,
  useInitializePage,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { ManagementAccount } from '@services/auth/base/type';
import { apiService } from '@services/base';
import {
  setMenuBar,
  setUserSession,
} from '@slice/config';
import { resetPages } from '@slice/pages';
import { SystemEnum } from '@type/enum';

import LoginModal from './loginModal';

const UserAccount = ({ ...props }: { list?: boolean }) => {
  const { list = false } = props;
  const [changeAccountModalOpen, setChangeAccountModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ManagementAccount>(null);
  const t = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const { userSession, ManagementAccount, lang, match } = useAppSelector(
    (state) => ({
      userSession: state.withPersist.config?.userSession,
      ManagementAccount:
        state.withPersist.config?.defaultConfigs?.ManagementAccountId,
      lang: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );
  const removeMenuSide = () => {
    dispatch(setMenuBar({ menuBar: { value: 0, label: "" } }));
  };

  const initializePage = useInitializePage();
  const { handleLogout,handleFullLogout } = useHandle();

  const userInfoRouteHandler = () => {
    removeMenuSide();
    initializePage({
      config: {
        RepoId: 2,
        SystemId: SystemEnum.inv,
        url: `auth/userInfo?id=${userSession.UserInfo.UserId}`,
        Id: userSession.UserInfo.UserId,
      },
    });
  };
  const changePasswordRouteHandler = () => {
    removeMenuSide();

    router.replace(`auth/changePassword`);
  };
  const userWalletRouteHandler = () => {
    removeMenuSide();

    router.replace(`auth/wallet`);
  };
  const userSettingRouteHandler = () => {
    removeMenuSide();
    initializePage({
      config: {
        RepoId: 2,
        SystemId: SystemEnum.inv,
        url: `auth/accountSetting`,
        Id: userSession.UserInfo.UserId,
      },
    });
  };
  const myDevicesRouteHandler = () => {
    removeMenuSide();
    initializePage({
      config: {
        RepoId: 2,
        SystemId: SystemEnum.inv,
        url: `auth/myDevices`,
        Id: userSession.UserInfo.UserId,
      },
    });
  };
  const handleCancelAccount = () => {
    setChangeAccountModalOpen(false);
    setModalContent(null);
  };
  const changeRoleHandler = (item) => {
    dispatch(
      setUserSession({
        userSession: {
          ...userSession,
          RoleDto: userSession.RoleDto.map((ex) => ({
            ...ex,
            isActiveRole: ex.RoleId == item.RoleId,
          })),
        },
      })
    );
    dispatch(resetPages({}));
    dispatch(apiService.util.resetApiState());
  };
  const supporter = userSession.RoleDto.find(
    (item) => item.isActiveRole
  )?.IsSupporter;
  const admin = userSession.UserInfo.IsAdmin;
  const accounts = userSession?.ManagementAccounts?.filter(
    (item) => !item.InActive
  );
  const myAccount = userSession?.ManagementAccounts?.find(
    (item) => item.ManagementAccountId == ManagementAccount.id
  );

  const items = [
    {
      key: "100",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.userDetails")}
        </div>
      ),
      onClick: userInfoRouteHandler,
      icon: <UserInfoIcon />,
    },
    {
      type: "divider",
    },
    {
      key: "101",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.changePassword")}
        </div>
      ),
      onClick: changePasswordRouteHandler,
      icon: <LookIcon />,
    },
    {
      type: "divider",
    },
    {
      key: "102",
      label: (
        <div className="flex sm:flex-col justify-between !w-full font-medium text-gray-gray10">
          <div className="flex gap-2">
            <VaultIcon /> {t("topHead.vault")}
          </div>
          <div className="font-medium text-gray-gray7 text-end">
            {Price({ amount: myAccount?.Credit })}
          </div>
        </div>
      ),
      onClick: userWalletRouteHandler,

      hidden: !admin,
    },
    {
      type: "divider",
      hidden: !admin,
    },
    {
      key: "103",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.accountSetting")}
        </div>
      ),
      onClick: userSettingRouteHandler,
      icon: <AccountSettingIcon />,
      hidden: !admin,
    },
    {
      type: "divider",
      hidden: !admin,
    },
    {
      key: "104",
      type: "group",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.otherAccounts")}
        </div>
      ),
      children:
        accounts?.length > 0
          ? accounts
              .filter(
                (item) => item.ManagementAccountId !== ManagementAccount?.id
              )
              .map((item, index) => ({
                key: `104-${index}`,
                label: (
                  <div className="p-1 font-medium text-gray-gray10">
                    {item.ManagementAccountDesc}
                  </div>
                ),
                onClick: () => {
                  setModalContent(item);
                  setChangeAccountModalOpen(true);
                },
              }))
          : [],
      hidden: supporter || accounts?.length < 2,
    },
    {
      type: "divider",
      hidden: supporter || accounts?.length < 2,
    },
    {
      key: "105",
      type: "group",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.otherRoles")}
        </div>
      ),
      children:
        userSession.RoleDto?.length > 1
          ? userSession.RoleDto.map((item, index) => ({
              key: `105-${index}`,
              label: (
                <div className="p-1 font-medium text-gray-gray10">
                  {item.RoleName}
                </div>
              ),
              onClick: () => {
                changeRoleHandler(item);
              },
              icon: userSession.RoleDto?.find((item) => item.isActiveRole)
                ?.RoleName == item.RoleName && <TickIcon />,
            }))
          : [],
      hidden: userSession.RoleDto?.length < 2,
    },
    {
      type: "divider",
      hidden: userSession.RoleDto?.length < 2,
    },
    {
      key: "107",
      label: (
        <div className="p-1 font-medium text-gray-gray10">
          {t("topHead.myDevices")}
        </div>
      ),
      onClick: myDevicesRouteHandler,
      icon: <MyDevicesIcon />,
      hidden: !admin,
    },
    {
      type: "divider",
    },
    {
      key: "106",
      label: <div className="p-1 text-state-error1">{t("topHead.exit")}</div>,
      icon: <LogOutIcon />,
      onClick: handleLogout,
    },
    {
      key: "108",
      label: <div className="p-1 text-state-error1">{t("topHead.fulllogout")}</div>,
      icon: <LogOutIcon />,
      onClick: handleFullLogout,
    },
  ].filter((item) => !item.hidden);

  const persianDate = myAccount?.ExpireDate
    ? lang === "fa"
      ? moment(myAccount?.ExpireDate).format("jYYYY/jMM/jDD")
      : moment(myAccount?.ExpireDate).utc().format("YYYY/MM/DD")
    : t("general.dateIsNotAvailable");

  return (
    <>
      {list ? (
        <>
          <div className={`flex flex-col ${match && "gap-4 "}`}>
            {items
              .filter(
                (item) =>
                  (item.hidden == undefined || !item.hidden == true) &&
                  item.type !== "divider"
              )
              .map((item, index) => (
                <CustomButton
                  key={index}
                  type="text"
                  className={`  ${
                    match ? "m-0 px-0 py-4" : "py-6"
                  } flex justify-start gap-2  border-b-gray-gray7 rounded-none w-full text-start`}
                  onClick={item.onClick}
                >
                  {item.icon && <div>{item.icon}</div>}
                  <div className="w-full">{item.label}</div>
                </CustomButton>
              ))}
          </div>
        </>
      ) : (
        <>
          <Dropdown menu={{ items } as MenuProps} className="">
            <div className="flex flex-nowrap justify-center items-center gap-1 w-fit">
              <CustomButton
                shape="circle"
                type="text"
                className="p-2 rounded-lg"
              >
                {userSession?.UserInfo?.UserPic?.length > 0 ? (
                  <Image
                    src={userSession.UserInfo.UserPic}
                    alt="user avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserIcon2 />
                )}
              </CustomButton>
              <div className="flex flex-col gap-1 text-xs">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {userSession.UserInfo?.UserName}
                </div>
                <div className="text-gray-gray10 whitespace-nowrap">
                  {persianDate}
                </div>
              </div>
            </div>
          </Dropdown>
        </>
      )}

      <CustomModal
        width={300}
        centered
        disableTitle
        closeModal={() => {
          handleCancelAccount();
        }}
        isModalOpen={changeAccountModalOpen}
        content={<LoginModal item={modalContent} />}
      />
    </>
  );
};
export default UserAccount;

function Price({ amount }: { amount: number }) {
  const format = useFormatter();
  const valueInToman = amount;
  const formatted = format.number(valueInToman, {
    style: "currency",
    currency: "IRR",
  });
  const withToman = formatted.replace(/ریال/g, "").trim() + " تومان";
  return <span>{withToman}</span>;
}
