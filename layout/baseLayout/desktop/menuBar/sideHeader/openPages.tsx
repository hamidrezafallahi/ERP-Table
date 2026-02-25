"use client";
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import {
  Close,
  New,
} from '@components/atoms/iconComponents';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { resetItemsByPage } from '@slice/items';
import {
  removePage,
  setPageOrder,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type { IPage } from '@slice/pages/type';
import { PageTypeEnum } from '@type/enum';
import { renderPageState } from '@utils/core';

export default function OpenPages() {
  const t = useTranslations();
  const initializePage = useInitializePage();
  const router = useRouter();

  const dispatch = useDispatch();
  const { pages, local, activePage, match } = useAppSelector(
    (state) => ({
      pages: state.withPersist.pages,
      local: state.withPersist.config.lang,
      activePage: state.withPersist.pages.find((item) => item.isActive),
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );
  const drag = useRef<IPage>(null);
  const drop = useRef<IPage>(null);

  const [page, setPage] = useState<IPage>(null);
  const [confirmCloseModalIsOpen, setConfirmCloseModalIsOpen] = useState(false);
  const [confirmCloseDrawerIsOpen, setConfirmCloseDrawerIsOpen] =
    useState(false);

  // const [trigger, { isLoading }] = useCUDDataMutation();

  useEffect(() => {
    if (pages && pages.length == 0) {
      router.replace(`/${local}/dashboard`);
    }
  }, [local, pages, router]);

  const openPage = (item: IPage) => {
    const u = item.url?.split("id=");

    initializePage({
      config: {
        RepoId: item.RepoId,
        SystemId: item.SystemId,
        url: item.url,
        pageId: item.pageId,
        Id: u?.length > 0 ? Number(u[1]) : 0,
      },
    });
    if (confirmCloseDrawerIsOpen) {
      setConfirmCloseDrawerIsOpen(false);
    }
    if (confirmCloseModalIsOpen) {
      setConfirmCloseModalIsOpen(false);
    }
  };
  const handleAddNew = (page: IPage) => {
    const newPageId =
      Number(page.pageId.split("_", 1)) +
      "_" +
      (Math.random() * 1000).toFixed(0);
    initializePage({
      config: {
        RepoId: page.RepoId,
        SystemId: page.SystemId,
        url: page.url,
        pageId: newPageId,
        Id: 0,
      },
    });
  };
  const handleConfirm = async (item: IPage) => {
    const existPages = pages.filter((el) => el.pageId !== item.pageId);

    dispatch(removePage(item.pageId));
    dispatch(resetItemsByPage({ pageId: item.pageId }));

    const lastPage = existPages[0];

    if (lastPage) {
      if (item.isActive) {
        openPage(lastPage);
      }
    } else {
      router.replace(`/${local}/dashboard`);
    }

    match
      ? setConfirmCloseModalIsOpen(false)
      : setConfirmCloseDrawerIsOpen(false);
  };
  const handleCancel = () => {
    setConfirmCloseModalIsOpen(false);
    setPage(null);
  };

  const handleDrop = () => {
    dispatch(
      setPageOrder({
        draggedPageOrder: drag.current?.pageOrder,
        dropPageOrder: drop.current?.pageOrder,
      }),
    );
  };

  const renderTitleWithRedAfterDash = (text: string) => {
    const [first, ...rest] = text.split(" - ");

    if (!rest.length) return <span>{first}</span>;

    return (
      <div className="flex item-center">
        <span>{first}</span>
        <span className="mx-1">-</span>
        <span className="font-thin text-gray-gray8 text-xs">
          {rest.join(" - ")}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {pages
        ?.filter((item) => !item.isModal)
        .sort((a, b) => b.pageOrder - a.pageOrder)
        .map((item, index) => {
          const captionI = item.caption ? t(item.caption) : "";
          const captionII = item.captionII ?? "";
          const finalCaption = [captionI, captionII]
            .filter(Boolean)
            .join(" - ");

          const titleFields = item.pageData
            ?.filter((i) => i.isTitleField === true)
            ?.map((i) => i.value)
            ?.filter(Boolean)
            ?.join(" - ");
          return (
            <div
              key={index}
              draggable
              onDragStart={() => {
                drag.current = item;
              }}
              onDragOver={() => {
                drop.current = item;
              }}
              onDragEnd={() => {
                handleDrop();
              }}
              className={`w-full relative
                flex min-w-28 justify-between items-center ${
                  item.isActive && "text-main-black font-bold  dark:text-white "
                } `}
            >

              <CustomButton
                ghost
                className={`!border-none`}
                data-pageid={item.pageId}
                data-id={item.Id}
                size="small"
                onClick={() => {
                  if (item.pageState === PageStateEnum.Changed) {
                    setPage(item);
                    match
                      ? setConfirmCloseModalIsOpen(true)
                      : setConfirmCloseDrawerIsOpen(true);
                  } else {
                    handleConfirm(item);
                  }
                }}
              >
                <Close
                  config={{
                    width: 10,
                    height: 10,
                  }}
                />
              </CustomButton>
              <div
                onClick={() => {
                  openPage(item);
                }}
                className="flex items-center gap-2 w-full text-[13px] line-clamp-1 cursor-pointer"
              >
                <div className="overflow-hidden dark:text-gray-gray55 text-ellipsis">
                  {renderTitleWithRedAfterDash(
                    item.url?.includes("id")
                      ? finalCaption + " - " + titleFields
                      : item.type === PageTypeEnum.Form
                        ? item.pageState === PageStateEnum.Pending ||
                          item.pageState === PageStateEnum.PendingDelete ||
                          item.pageState === PageStateEnum.PendingUpdate ||
                          item.pageState === PageStateEnum.Saved
                          ? finalCaption + " - " + titleFields
                          : finalCaption + " - " + t("general.newForm")
                        : finalCaption,
                  )}
                </div>
                <div className="flex justify-center items-center">
                  {renderPageState(item.pageState)}
                </div>
              </div>
              <CustomButton
                onClick={() => handleAddNew(item)}
                ghost
                className="!p-0 !border-none"
              >
                <New
                  config={{
                    width: 20,
                    height: 20,
                  }}
                />
              </CustomButton>
            </div>
          );
        })}

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
              } flex flex-col justify-center items-center gap-2 px-4 rounded custom-confirm-modal`}
            >
              <span className="mx-4 text-center">
                {t("general.confirmText")}
              </span>

              <div className="flex justify-between gap-4 mt-4 w-full">
                <CustomButton
                  type="text"
                  onClick={handleCancel}
                  className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
                >
                  {t("general.no")}
                </CustomButton>
                <CustomButton
                  type="text"
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
                {/* <CustomButton
                  type="text"
                  onClick={() => handleSaveAndClose(page)}
                  className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
                >
                  {isLoading ? (
                    <Spin size="large" indicator={<SpinIcon />} />
                  ) : (
                    t("general.saveAndClose")
                  )}
                </CustomButton> */}
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
            <span className="mx-4 text-center">{t("general.confirmText")}</span>

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
              {/* <CustomButton
                type="text"
                onClick={() => handleSaveAndClose(page)}
                className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
              >
                {isLoading ? (
                  <Spin size="large" indicator={<SpinIcon />} />
                ) : (
                  t("general.saveAndClose")
                )}
              </CustomButton> */}
            </div>
          </div>
        }
      />
    </div>
  );
}
