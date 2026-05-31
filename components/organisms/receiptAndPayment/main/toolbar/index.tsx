import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  MenuArrowBack,
  MenuSquareIcon,
} from '@components/atoms/iconComponents';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import PanelList from '@layout/baseLayout/desktop/actionBar/panelList';

export const ReceiptAndPaymentToolbar = () => {
  const t = useTranslations();
  const { activePage, lang, match } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true
      ),
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const { navigateBack } = useNavigatePage();
  const [openPanelModal, setOpenPanelModal] = useState(false);

  return (
    <>
      <div
        className={`${
          match ? "justify-end" : "justify-between"
        } flex items-center gap-2  w-full h-full`}
      >
        {match ? (
          <div className="flex gap-2">
            <CustomTooltip title={t("formToolbar.closePage")}>
              <CloseButton />
            </CustomTooltip>
            <CustomTooltip title={t("general.fullScreenMode")}>
              <ExpandedButton />
            </CustomTooltip>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`${
                  lang !== "fa" ? "rotate-180" : ""
                } flex bg-white p-[6px] rounded h-full`}
                onClick={navigateBack}
              >
                <MenuArrowBack config={{ width: 24, height: 24 }} />
              </div>
              <span className="text-xs">{t(activePage?.caption)}</span>
            </div>
            <div className="flex gap-2">
              <div
                className="flex bg-white p-[6px] rounded h-full"
                onClick={() => setOpenPanelModal(true)}
              >
                <MenuSquareIcon config={{ width: 24, height: 24 }} />
              </div>
            </div>
          </>
        )}
      </div>

      {openPanelModal && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerName={t("sidebar.listPanel")}
          closeModal={() => setOpenPanelModal(false)}
          isModalOpen={openPanelModal}
          content={<PanelList />}
        />
      )}
    </>
  );
};
