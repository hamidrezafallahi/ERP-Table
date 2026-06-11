import React from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { useInitializePage } from '@hooks/custom';
import { PageStateEnum } from '@slice/pages/enum';

const CustomButtonWithIcons = ({ icon1, icon2, form = null, list = null }) => {
  const initializePage = useInitializePage();
  const t = useTranslations();

  const handleRouting = () => {
    if (form) {
      initializePage({
        config: {
          RepoId: form.formRepoId,
          SystemId: form.formSystemId,
          url: `${form.formUrl}`,
          originalPageState: PageStateEnum.Opened,
          pageState: PageStateEnum.Opened,
          // keyName: form.keyName,
          // keyValue: form.keyValue,
          caption: "",
          captionII: form.label,
          data: form,
        },
      });
    } else {
      initializePage({
        config: {
          RepoId: list.listRepoId,
          SystemId: list.listSystemId,
          url: list.listUrl,
          data: list,
          originalPageState: PageStateEnum.Opened,
          pageState: PageStateEnum.Opened,
          caption: "",
          captionII: `${t("general.list")} ${list.label}`,
        },
      });
    }
  };

  return (
    <CustomButton
      type="text"
      className="group relative active:!bg-transparent m-0 p-0 rounded-full w-6 h-6"
      onClick={handleRouting}
    >
      <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-0 transition-opacity duration-300">
        {icon1}
      </div>
      <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {icon2}
      </div>
    </CustomButton>
  );
};

export default CustomButtonWithIcons;
