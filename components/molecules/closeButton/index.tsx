import { useState } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import { ClosePageIcon } from '@components/atoms/iconComponents';
import {
  useInitializePage,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import {
  removePage,
  setActivePage,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type { IPage } from '@slice/pages/type';

export default function CloseButton() {
  const [page, setPage] = useState<IPage>(null);
  const [confirmCloseModalIsOpen, setConfirmCloseModalIsOpen] = useState(false);
  const [confirmCloseDrawerIsOpen, setConfirmCloseDrawerIsOpen] =
    useState(false);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const dispatch = useDispatch();
  const t = useTranslations();
  const { navigateBack } = useNavigatePage();
  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((item) => item.isActive);
    return {
      activePage,
    };
  }, shallowEqual);

  const initializePage = useInitializePage();
  const handleClosePage = () => {
    if (activePage && activePage.pageState === PageStateEnum.Changed) {
      setPage(activePage);
      match
        ? setConfirmCloseModalIsOpen(true)
        : setConfirmCloseDrawerIsOpen(true);
    } else {
      handleConfirm(activePage);
    }
  };

  const handleConfirm = async (item: IPage) => {
    if (item) {
      dispatch(removePage(item.pageId));
    }
    if (confirmCloseDrawerIsOpen) {
      setConfirmCloseDrawerIsOpen(false);
    }
    if (confirmCloseModalIsOpen) {
      setConfirmCloseModalIsOpen(false);
    }

    navigateBack();
  };
  const handleCancel = () => {
    setConfirmCloseModalIsOpen(false);
    setPage(null);
  };
  const openPage = (item: IPage) => {
    const u = item.url.split("id=");

    dispatch(setActivePage(item.pageId));
    initializePage({
      config: {
        RepoId: item.RepoId,
        SystemId: item.SystemId,
        url: item.url,
        pageId: item.pageId,
        Id: u.length > 0 ? Number(u[1]) : 0,
      },
    });
    if (confirmCloseDrawerIsOpen) {
      setConfirmCloseDrawerIsOpen(false);
    }
    if (confirmCloseModalIsOpen) {
      setConfirmCloseModalIsOpen(false);
    }
  };

  return (
    <>
      <CustomButton
        id="closeButton"
        type="text"
        data-pageid={activePage?.pageId}
        data-id={activePage?.Id}
        className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
        onClick={handleClosePage}
      >
        <ClosePageIcon />
      </CustomButton>
      {confirmCloseModalIsOpen && (
        <CustomModal
          width={300}
          centered
          disableTitle
          closeModal={() => {
            setConfirmCloseModalIsOpen(false);
            setPage(null);
          }}
          isModalOpen={confirmCloseModalIsOpen}
          content={
            <div
              className={`${
                match ? "p-4" : ""
              } flex flex-col justify-center items-center gap-2 rounded custom-confirm-modal`}
            >
              <span className="text-center">{t("general.confirmText")}</span>
              <div className="flex justify-between gap-4 mt-4 w-full">
                <CustomButton
                  type="text"
                  onClick={handleCancel}
                  className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
                >
                  {t("general.no")}
                </CustomButton>
                <CustomButton
                  data-pageid={activePage?.pageId}
                  data-id={activePage?.Id}
                  onClick={() => handleConfirm(page)}
                  className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
                >
                  {t("general.yes")}
                </CustomButton>
                {activePage?.pageId !== page?.pageId && (
                  <CustomButton
                    type="text"
                    onClick={() => openPage(page)}
                    className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
                  >
                    {t("general.showForm")}
                  </CustomButton>
                )}
              </div>
            </div>
          }
        />
      )}

      <CustomDrawer
        isOpen={confirmCloseDrawerIsOpen}
        onClose={() => {
          setConfirmCloseDrawerIsOpen(false);
          setPage(null);
        }}
        content={
          <div
            className={`${
              match ? "p-4" : ""
            } flex flex-col justify-center items-center gap-2 px-4 rounded custom-confirm-modal`}
          >
            <span className="text-center">{t("general.confirmText")}</span>

            <div className="flex flex-wrap justify-between gap-4 mt-4 w-full">
              <CustomButton
                type="text"
                onClick={handleCancel}
                className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
              >
                {t("general.no")}
              </CustomButton>
              <CustomButton
                type="text"
                data-pageid={activePage?.pageId}
                data-id={activePage?.Id}
                onClick={() => handleConfirm(page)}
                className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
              >
                {t("general.yes")}
              </CustomButton>
              {activePage?.pageId !== page?.pageId && (
                <CustomButton
                  type="text"
                  onClick={() => openPage(page)}
                  className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
                >
                  {t("general.showForm")}
                </CustomButton>
              )}
            </div>
          </div>
        }
      />
    </>
  );
}
