import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  Dots,
  Undo,
} from '@components/atoms/iconComponents';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@redux/index';

import CustomDropdownButton from '../customDropdownButton';

const UserInfoToollbar = ({ handleReset }: { handleReset: () => void }) => {
  const t = useTranslations();
  const { lang } = useAppSelector((state) => {
    const lang = state.withPersist.config.lang;
    return { lang };
  }, shallowEqual);
  return (
    <div
      className={`-top-16 absolute flex gap-4 ${
        lang == "fa" ? "left-0" : "right-0"
      }`}
    >
      <CustomTooltip title={t("formToolbar.closePage")}>
        <CloseButton />
      </CustomTooltip>
      <CustomTooltip
        className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full"
        title={t("general.fullScreenMode")}
        id="fullScreenMode"
      >
        <ExpandedButton />
      </CustomTooltip>
      <CustomDropdownButton
        // placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
        className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
        // items={moreItems}
      >
        <span className="cursor-pointer">
          <Dots />
        </span>
      </CustomDropdownButton>
      <CustomTooltip
        title={t("formToolbar.revalidate")}
        className="hidden xxl:block"
      >
        <CustomButton
          type="text"
          className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[6px] border rounded h-9 text-gray dark:text-white"
          onClick={handleReset}
          id="reload"
        >
          <Undo
            config={{
              width: 24,
              height: 24,
            }}
          />
        </CustomButton>
      </CustomTooltip>

      <CustomButton
        htmlType="submit"
        type="text"
        className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-3 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
      >
        {t("general.save")}
      </CustomButton>
    </div>
  );
};

export default UserInfoToollbar;
