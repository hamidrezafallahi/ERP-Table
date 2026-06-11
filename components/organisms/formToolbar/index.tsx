import {
  lazy,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Drawer,
  Menu,
  Spin,
} from 'antd';
import type { MenuProps } from 'antd/lib';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  AddCircle,
  Dots,
  DownChevron,
  FormIcon,
  MenuArrowBack,
  MenuSquareIcon,
  PlusOutline,
  Printer,
  RemindMeIcon,
  ReportIcon,
  SavePlus,
  SpinIcon,
  Undo,
} from '@components/atoms/iconComponents';
import CloseButton from '@components/molecules/closeButton';
import ContactInfo from '@components/molecules/contactInfo';
import CurrencyConversion from '@components/molecules/currencyConversion';
import { CustomerCredit } from '@components/molecules/customerCredit';
import { CustomerGroupCredit } from '@components/molecules/customerGroupCredit';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  ExpireDateAccountList,
} from '@components/molecules/expireDateAccountList';
import GoodExtraInfo from '@components/molecules/goodExtraInfo';
import { GoodPrice } from '@components/molecules/goodPrice';
import { GoodQc } from '@components/molecules/goodQc';
import { GoodSettings } from '@components/molecules/goodSettings';
import GoodVariantValues from '@components/molecules/goodVariantValues';
import { InventoryControl } from '@components/molecules/inventoryControl';
import { UserReport } from '@components/molecules/managementSystem/reports';
import Navigate from '@components/molecules/navigate';
import RemindMe from '@components/molecules/remindMe';
import {
  ChangeInvoiceCurrency,
  ChangeInvoiceCurrencyRate,
  Settlement,
} from '@components/molecules/salesAndPurchase/salesInvoice';
import {
  Education,
  PhysicalCharacteristicsModal,
  SpecialServices,
  Sponsor,
  TrainingCourse,
  WorkHistory,
} from '@components/molecules/staff';
import { FormulaParameter } from '@components/molecules/staff/formulaParameter';
import { StockWarehouse } from '@components/molecules/stockWarehouse';
import { TaxSettings } from '@components/molecules/taxSettings';
import {
  useDarkMode,
  useFormHandlers,
  useNavigatePage,
  useNavigateRecordsForm,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import Uploader from '@layout/baseLayout/desktop/actionBar/panelForm/uploader';
import { ReportTypeEnum } from '@services/mng/report/type';
import { clearReportData } from '@slice/config';
import {
  setAllPageData,
  setPageData,
  setSelectedViewIndex,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';
import type {
  IReportPosition,
  IToolbarList,
  IToolbarMenu,
} from '@type/toolbar';
import {
  createCookie,
  getCookie,
} from '@utils/cookie';
import {
  getColoredIcon,
  renderPageState,
} from '@utils/core';

import ChatWidget from '../chat';
import DynamicModal from '../dynamicModal';
import { ActionLabelsEnum } from '../list/enum';
import {
  ShowPrinter,
  ShowReport,
} from '../managementSystem';
import ShorthandFormToolbar from './shorthandFormToolbar';
import type { IProps } from './type';

const PanelForm = lazy(
  () => import("@layout/baseLayout/desktop/actionBar/panelForm"),
);

export default function FormToolbar({
  listUrl,
  toolbarData,
  id,
  fieldKey,
  conditionalActions,
  form,
  selectedView,
  mutationSystemId,
  listPageId,
  getUrl,
  submitCaption,
  withSubmitButton = true,
  hasShorthandFormToolbar,
  setMasterForm,
  masterForm,
  saveAsDraft = false,
}: IProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { mode = "light" } = useDarkMode();
  const { navigateBack } = useNavigatePage();
  const { pages, activePage, lang, match, userId } = useAppSelector((state) => {
    const pages = state?.withPersist?.pages;
    const activePage =
      pages && pages.length > 0
        ? pages?.find((item) => item.isActive === true)
        : null;
    const match = state.withPersist.config.initMatch;
    const userId = state.withPersist.config.userSession.UserInfo.UserId;
    return {
      pages,
      activePage,
      match,
      lang: state?.withPersist?.config?.lang,
      userId,
    };
  }, shallowEqual);
  const hasDetails = activePage?.pageData?.find(
    (item) => item.name === "Details",
  );
  const selectedViewIndex = activePage?.selectedViewIndex ?? 0;

  const [formName, setFormName] = useState(t("formToolbar.displayList"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [dynamicAction, setDynamicAction] = useState<IToolbarMenu>(null);
  // const [attachmentTitle, setAttachmentTitle] = useState(t("general.pictures"));
  const [isMobileMenuDrawerOpen, setIsMobileMenuDrawerOpen] = useState(false);
  const [isStockWarehouseModalOpen, setIsStockWarehouseModalOpen] =
    useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [printId, setPrintId] = useState(null);
  const [
    isChangeInvoiceCurrencyRateModalOpen,
    setIsChangeInvoiceCurrencyRateModalOpen,
  ] = useState(false);
  const {
    handleAdd,
    handleReset,
    handleSubmit,
    handleSubmitAndClean,
    handleSubmitAndClose,
    isLoading,
  } = useFormHandlers({
    activePage: activePage,
    pages: pages,
    form: form,
    masterForm: masterForm,
    setMasterForm: setMasterForm,
    mutationSystemId: mutationSystemId,
  });

  const {
    handleNextItem,
    handlePrevItem,
    disabledNextButton,
    disabledPrevButton,
  } = useNavigateRecordsForm({
    fieldKey,
    getUrl,
    id,
    listPageId,
    pages,
    pageId: activePage?.pageId,
    formUrl: activePage?.url,
  });

  const handleMoreMenuAction = (menuItem: IToolbarMenu) => {
    try {
      switch (menuItem.MenuDesc) {
        case ActionLabelsEnum.RemindMe as string:
          setIsModalOpen(true);
          setModalContent(
            <RemindMe
              repoId={activePage.RepoId}
              refId={id}
              onClose={() => setIsModalOpen(false)}
              isOpen={isModalOpen}
            />,
          );
          break;
        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };
  const handleAction = async (action: IToolbarMenu) => {
    try {
      setDynamicAction(action);

      switch (action.MenuDesc) {
        case ActionLabelsEnum.Attachment as string:
          setIsModalOpen(true);
          setModalContent(
            <Uploader
              onlyAcceptImage
              RefId={id}
              // setModalTitle={setAttachmentTitle}
              RepoId={activePage.RepoId}
            />,
          );
          break;
        case ActionLabelsEnum.GoodVariantValues as string:
          setIsModalOpen(true);
          setModalContent(
            <GoodVariantValues
              id={id}
              sourceKey={fieldKey}
              listUrl={listUrl}
            />,
          );
          break;
        case ActionLabelsEnum.GoodExtraInfo as string:
          setIsModalOpen(true);
          setModalContent(<GoodExtraInfo id={id} sourceKey={fieldKey} />);
          break;
        case ActionLabelsEnum.UserReport as string:
          setIsModalOpen(true);
          setModalContent(<UserReport id={id} sourceKey={fieldKey} />);
          break;
        case ActionLabelsEnum.GoodPrice as string:
          setIsModalOpen(true);
          setModalContent(
            <GoodPrice
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.PersonContact as string:
          setIsModalOpen(true);
          setModalContent(<ContactInfo id={id} sourceKey={fieldKey} />);
          break;
        case ActionLabelsEnum.ExpireDate as string:
          setIsModalOpen(true);
          setModalContent(
            <TaxSettings
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.TaxSettings as string:
          setIsModalOpen(true);
          setModalContent(
            <ExpireDateAccountList
              id={id}
              sourceKey={fieldKey}
              handleClose={() => {
                setIsModalOpen(false);
              }}
            />,
          );
          break;
        case ActionLabelsEnum.GoodSettings as string:
          setIsModalOpen(true);
          setModalContent(
            <GoodSettings
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.Settlement as string:
          setIsModalOpen(true);
          setModalContent(<Settlement id={id} />);
          break;
        case ActionLabelsEnum.GoodQc as string:
          setIsModalOpen(true);
          setModalContent(<GoodQc id={id} sourceKey={fieldKey as string} />);
          break;
        case ActionLabelsEnum.InventoryControl as string:
          setIsModalOpen(true);
          setModalContent(
            <InventoryControl
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.TrainingCourse as string:
          setIsModalOpen(true);
          setModalContent(<TrainingCourse id={id} />);
          break;
        case ActionLabelsEnum.Education as string:
          setIsModalOpen(true);
          setModalContent(<Education id={id} />);
          break;
        case ActionLabelsEnum.WorkHistory as string:
          setIsModalOpen(true);
          setModalContent(<WorkHistory id={id} />);
          break;
        case ActionLabelsEnum.Sponsor as string:
          setIsModalOpen(true);
          setModalContent(<Sponsor id={id} />);
          break;
        case ActionLabelsEnum.PhysicalCharacteristics as string:
          setIsModalOpen(true);
          setModalContent(
            <PhysicalCharacteristicsModal
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.SpecialServices as string:
          setIsModalOpen(true);
          setModalContent(<SpecialServices id={id} />);
          break;
        case ActionLabelsEnum.FormulaParameter as string:
          setIsModalOpen(true);
          setModalContent(<FormulaParameter id={id} />);
          break;
        case ActionLabelsEnum.ChangeInvoiceCurrency as string:
          setIsModalOpen(true);
          setModalContent(
            <ChangeInvoiceCurrency
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.ChangeInvoiceCurrencyRate as string:
          setIsChangeInvoiceCurrencyRateModalOpen(true);
          break;
        case ActionLabelsEnum.CustomerCredit as string:
          setIsModalOpen(true);
          setModalContent(
            <CustomerCredit
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.CustomerGroupCredit as string:
          setIsModalOpen(true);
          setModalContent(
            <CustomerGroupCredit
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.DeleteAccountingDocument as string:
          setIsModalOpen(true);
          setModalContent(
            <CurrencyConversion
              id={id}
              sourceKey={fieldKey}
              rowId={id}
              mode="delete"
              closeModal={() => setIsModalOpen(false)}
            />,
          );
          break;
        case ActionLabelsEnum.CurrencyConversion as string:
          setIsModalOpen(true);
          setModalContent(
            <CurrencyConversion
              id={id}
              sourceKey={fieldKey}
              rowId={id}
              closeModal={() => setIsModalOpen(false)}
            />,
          );
          break;
        default:
          setIsDynamicModalOpen(true);
          break;
      }
    } catch (error) {
      null;
    }
  };

  const displayListItems = useMemo(() => {
    if (!toolbarData?.List?.ListProp) return [];

    const handleChangeList = (listItem: IToolbarList, index: number) => {
      if (hasDetails) {
        dispatch(setAllPageData([]));
      }
      setFormName(listItem?.Desc);
      dispatch(setSelectedViewIndex(index));
    };

    return toolbarData?.List?.ListProp.map((listItem, index) => ({
      key: listItem.Id,
      label: listItem.Desc,
      icon: listItem.icon ? (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(getColoredIcon(listItem.icon, mode)),
          }}
        />
      ) : null,
      onClick: () => !selectedView && handleChangeList(listItem, index),
    }));
  }, [toolbarData, mode, hasDetails, dispatch]);

  const reportItems = useMemo(() => {
    const handleChangeReport = (report: IReportPosition) => {
      setReportId(report?.ReportId);

      setIsReportModalOpen(true);
    };

    const correctReportItems = toolbarData?.ReportPosition?.filter(
      (item: IReportPosition) =>
        item.RepoViewId === activePage?.viewData?.RepoViewId &&
        item.Type !== ReportTypeEnum.Print,
    );

    if (!correctReportItems || toolbarData === undefined) {
      return [];
    } else {
      return correctReportItems?.map((reportItem: IReportPosition) => ({
        key: reportItem.Id,
        label: reportItem.FormViewName,

        onClick: () => handleChangeReport(reportItem),
      }));
    }
  }, [dispatch, toolbarData?.ReportPosition, activePage?.viewData?.RepoViewId]);

  const printItems = useMemo(() => {
    const handleChangeList = (print: IReportPosition) => {
      setPrintId(print?.ReportId);
      setIsModalOpen(true);
      setModalContent(<ShowPrinter printId={printId} ids={[id]} />);
    };

    const correctPrintItems = toolbarData?.ReportPosition?.filter(
      (item: IReportPosition) =>
        item.RepoViewId === activePage?.viewData?.RepoViewId &&
        item.Type === ReportTypeEnum.Print,
    );

    if (!correctPrintItems || toolbarData === undefined || !id) {
      return [];
    } else {
      return correctPrintItems?.map((printItem: IReportPosition) => ({
        key: printItem.Id,
        label: printItem.FormViewName,

        onClick: () => handleChangeList(printItem),
      }));
    }
  }, [toolbarData?.ReportPosition, activePage?.viewData?.RepoViewId]);
  const remindMeItem = {
    key: t("general.addRemindMe"),
    label: t("general.addRemindMe"),
    icon: (
      <div>
        <RemindMeIcon />
      </div>
    ),
    onClick: () =>
      handleMoreMenuAction({
        key: t("general.addRemindMe"),
        MenuDesc: t("general.addRemindMe"),
        loggedInUserId: null,
      }),
  };
  const moreActionItems = useMemo(() => {
    if (!toolbarData?.GridMenu) return [];
    const filteredMoreAction = toolbarData?.GridMenu?.filter(
      (menuItem: IToolbarMenu) =>
        !(
          menuItem.MenuDesc === ActionLabelsEnum.Edit ||
          menuItem.MenuDesc === ActionLabelsEnum.Delete
        ),
    );
    if (!filteredMoreAction) return [];
    return filteredMoreAction.map((menuItem: IToolbarMenu) => {
      const isDisabled =
        conditionalActions?.some((el) =>
          el.conditionallyAction === menuItem.MenuDesc
            ? el.opposite
              ? !!activePage?.pageData?.find(
                  (item) => item.name === el.conditionalProperty,
                )?.originalValue
              : !activePage?.pageData?.find(
                  (item) => item.name === el.conditionalProperty,
                )?.originalValue
            : false,
        ) ?? false;

      return {
        key: menuItem?.MenuId,
        label: menuItem?.MenuDesc,
        disabled: isDisabled,

        icon: (
          <>
            {typeof menuItem.Icon === "string" && (
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    getColoredIcon(menuItem?.Icon, mode),
                  ),
                }}
              />
            )}
          </>
        ),
        onClick: () => handleAction(menuItem),
      };
    });
  }, [toolbarData, activePage?.pageData, id, mode]);
  const moreMenuItems = useMemo(() => {
    if (!toolbarData?.MoreMenu) return [];
    return toolbarData.MoreMenu.map((menuItem: IToolbarMenu) => ({
      key: menuItem.MenuId,
      label: menuItem.MenuDesc,
      icon: (
        <>
          {typeof menuItem.Icon === "string" && (
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(getColoredIcon(menuItem.Icon, mode)),
              }}
            />
          )}
        </>
      ),
      onClick: () => handleMoreMenuAction(menuItem),
    }));
  }, [toolbarData, id, mode]);

  const moreItems = useMemo(() => {
    if (id) {
      return [...moreMenuItems, ...moreActionItems, remindMeItem];
    }
    return moreMenuItems;
  }, [id, moreMenuItems, moreActionItems]);

  const mobileMoreMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <span className="flex justify-start gap-x-2 text-gray-gray10 text-sm">
          {t("general.show")}
        </span>
      ),
      type: "group",
      children: displayListItems,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: (
        <span className="flex justify-start gap-x-2 text-gray-gray10 text-sm">
          {t("formToolbar.moreMenu")}
        </span>
      ),
      type: "group",
      children: moreItems,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: (
        <span className="flex justify-start gap-x-2 text-gray-gray10 text-sm">
          {t("formToolbar.print")}
        </span>
      ),
      type: "group",
      children: printItems,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      type: "group",
      children: [
        {
          key: "4",
          label: t("formToolbar.revalidate"),
          icon: (
            <div className="">
              <Undo config={{ width: 16, height: 16 }} />
            </div>
          ),
          onClick: handleReset,
          type: "item",
        },
        {
          key: "5",
          label: t("general.new"),
          icon: (
            <div className="">
              <PlusOutline />
            </div>
          ),
          onClick: handleAdd,
          type: "item",
        },
        {
          key: "6",
          label: t("formToolbar.saveAndNew"),
          icon: (
            <div className="">
              <SavePlus config={{ width: 16, height: 16 }} />
            </div>
          ),
          onClick: () => {
            handleSubmitAndClean;
          },
          type: "item",
        },
      ],
    },
  ];
  const defaultSubmitKey = getCookie("ArianSubmitForm");

  const [selectedSubmit, setSelectedSubmit] = useState(
    defaultSubmitKey ? defaultSubmitKey : "1",
  );

  const handleSelectedSubmit = (key) => {
    setSelectedSubmit(key);
    createCookie("ArianSubmitForm", key);
  };

  const allItems: MenuProps["items"] = [
    {
      label: t("general.save"),
      key: "1",
      onClick: () => {
        handleSelectedSubmit("1");
        handleSubmit();
      },
    },
    {
      label: t("general.saveAndClose"),
      key: "2",
      onClick: () => {
        handleSelectedSubmit("2");
        handleSubmit();
      },
    },
  ];

  const items = allItems.filter((button) => button.key !== selectedSubmit);

  const activeSubmitButton: any = allItems.find(
    (button) => button.key === selectedSubmit,
  );

  useEffect(() => {
    if (!toolbarData?.List?.ListProp) return;

    const exactItemIndex = toolbarData.List.ListProp.findIndex(
      (item) => item.Id === selectedView,
    );

    if (exactItemIndex !== -1) {
      dispatch(setSelectedViewIndex(exactItemIndex));
      setFormName(toolbarData.List.ListProp[exactItemIndex]?.Desc);
    } else {
      setFormName(toolbarData.List.ListProp[selectedViewIndex]?.Desc);
    }
  }, [toolbarData, selectedView, selectedViewIndex]);

  return (
    <>
      {!match && (
        <div className="top-0 right-0 left-0 z-0 absolute shadow-gray-gray3 shadow-sm w-full !h-[50px]"></div>
      )}
      <div
        className={`${
          match ? "justify-end" : "justify-between"
        } flex items-center gap-2 w-full h-full`}
      >
        {toolbarData &&
          (match ? (
            <div className="flex gap-2">
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
              {moreItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
                  items={moreItems}
                >
                  <span className="cursor-pointer" id="formActions">
                    <Dots />
                  </span>
                </CustomDropdownButton>
              )}
              {hasShorthandFormToolbar && (
                <ShorthandFormToolbar
                  handleReset={handleReset}
                  handleSubmitAndSave={handleSubmitAndClean}
                  handleAdd={handleAdd}
                  handleNextItem={handleNextItem}
                  handlePrevItem={handlePrevItem}
                  disabledNextButton={disabledNextButton}
                  disabledPrevButton={disabledPrevButton}
                />
              )}
              {displayListItems.length > 1 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:bg-gray-gray11 p-[6px] rounded w-fit xxl:w-24 h-9 hover:text-main-black dark:hover:!text-gray-gray2 text-xs"
                  items={displayListItems}
                  disabled={!!selectedView}
                >
                  <div
                    className="grid grid-cols-3 cursor-pointer"
                    id="chooseTypeForm"
                  >
                    <div className="hidden xxl:block col-span-2 w-full truncate text-ellipsis text-nowrap">
                      <CustomTooltip title={formName}>{formName}</CustomTooltip>
                    </div>

                    <div className="hidden xxl:block">
                      <DownChevron />
                    </div>
                    <div className="xxl:hidden block col-span-3">
                      <FormIcon />
                    </div>
                  </div>
                </CustomDropdownButton>
              )}
              {reportItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={reportItems}
                  popupRender={(originalMenu) => {
                    if (reportItems.length === 1) return <></>;
                    return <>{originalMenu}</>;
                  }}
                >
                  <div
                    className="cursor-pointer"
                    id="reportButton"
                    onClick={() =>
                      reportItems?.length === 1 && reportItems?.[0]?.onClick()
                    }
                  >
                    <CustomTooltip title={t("general.report")}>
                      <ReportIcon />
                    </CustomTooltip>
                  </div>
                </CustomDropdownButton>
              )}
              {printItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={printItems}
                  popupRender={(originalMenu) => {
                    if (printItems.length === 1) return <></>;
                    return <>{originalMenu}</>;
                  }}
                >
                  <div
                    className="cursor-pointer"
                    id="printButton"
                    onClick={() =>
                      printItems?.length === 1 && printItems?.[0]?.onClick()
                    }
                  >
                    <CustomTooltip title={t("general.print")}>
                      <Printer />
                    </CustomTooltip>
                  </div>
                </CustomDropdownButton>
              )}
              {!!id && (
                <Navigate
                  listPageId={listPageId}
                  getUrl={getUrl}
                  pages={pages}
                  fieldKey={fieldKey}
                  id={id}
                  formUrl={activePage?.url}
                  pageId={activePage?.pageId}
                  rootClassName="hidden xxl:flex"
                />
              )}
              {saveAsDraft && (
                <div>
                  <CustomTooltip title={t("general.saveDraft")}>
                    <CustomButton
                      loading={isLoading || (masterForm?.loading && masterForm.action ==="saveAndClose")}
                      type="text"
                      className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[10px] border rounded h-9 text-gray dark:text-white"
                      onClick={() => {
                        dispatch(
                          setPageData({
                            name: "DocStatusId",
                            value: 3,
                            type: "number",
                          }),
                        );

                        handleSubmitAndClose();
                      }}
                    >
                      <AddCircle />
                    </CustomButton>
                  </CustomTooltip>
                </div>
              )}
            </div>
          ) : (
            <div className="z-10 flex justify-between items-center mt-2 w-full">
              <div className="flex items-center gap-2">
                <div
                  className={`${
                    lang !== "fa" ? "rotate-180" : ""
                  } z-10 flex bg-white dark:bg-gray-gray11 pt-1 rounded h-full`}
                  onClick={navigateBack}
                >
                  <MenuArrowBack
                    config={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </div>
                <span className="text-sm">
                  {activePage?.url?.includes("id")
                    ? t(activePage.caption) +
                      " - " +
                      activePage.pageData?.find((i) => i.isTitleField === true)
                        ?.value
                    : activePage?.type === PageTypeEnum.Form
                      ? activePage?.pageState === PageStateEnum.Pending ||
                        activePage?.pageState === PageStateEnum.PendingUpdate ||
                        activePage?.pageState === PageStateEnum.PendingDelete ||
                        activePage?.pageState === PageStateEnum.Saved
                        ? t(activePage.caption) +
                          " - " +
                          activePage.pageData?.find(
                            (i) => i.isTitleField === true,
                          )?.value
                        : t(activePage?.caption) + " - " + t("general.newForm")
                      : t(activePage?.caption)}
                </span>
                <div className="flex justify-center items-center">
                  {renderPageState(activePage?.pageState)}
                </div>
              </div>
              <div className="flex gap-1">
                <div className="flex gap-3">
                  {!!userId && <ChatWidget />}
                  <div
                    className="flex bg-white dark:bg-gray-gray11 rounded h-full"
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalContent(<PanelForm />);
                    }}
                  >
                    <MenuSquareIcon />
                  </div>
                </div>
                <div
                  className="flex justify-end items-center"
                  onClick={() => setIsMobileMenuDrawerOpen(true)}
                >
                  <span className="w-4">
                    <Dots
                      config={{
                        stroke: "#585858",
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}

        {match && withSubmitButton && (
          <>
            {!submitCaption ? (
              <>
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

                <CustomTooltip
                  title={t("general.new")}
                  className="hidden xxl:block"
                >
                  <CustomButton
                    type="text"
                    className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[10px] border rounded h-9 text-gray dark:text-white"
                    onClick={handleAdd}
                    id="newRecord"
                  >
                    <PlusOutline />
                  </CustomButton>
                </CustomTooltip>

                <CustomTooltip
                  title={t("formToolbar.saveAndNew")}
                  className="hidden xxl:block"
                >
                  <CustomButton
                    loading={isLoading|| (masterForm?.loading && masterForm.action ==="saveAndNew")}
                    type="text"
                    className="flex justify-center items-center bg-gray-gray3 hover:bg-gray-gray8 dark:bg-gray-gray11 px-[6px] border rounded h-9 text-gray dark:text-white"
                    onClick={handleSubmitAndClean}
                    id="SavePlus"
                  >
                    <SavePlus />
                  </CustomButton>
                </CustomTooltip>
                <div className="flex justify-between items-center bg-black-black8 hover:!bg-gray-gray3 dark:bg-white dark:hover:bg-darkHover border border-1 border-black-black95 hover:border-black-black8 rounded h-9 text-white hover:!text-black-black95 dark:text-main-black text-sm">
                  <div className="flex gap-2 px-3 py-[6px] border-e-[1px] hover:border-black-black95 cursor-pointer">
                    <span onClick={activeSubmitButton?.onClick}>
                      {activeSubmitButton?.label}
                    </span>
                    {(isLoading || (masterForm?.loading && masterForm.action ==="save")) && (
                      <Spin
                        size="small"
                        indicator={
                          <SpinIcon config={{ width: 20, height: 20 }} />
                        }
                      />
                    )}
                  </div>
                  <CustomDropdownButton
                    dropdownClassName="!shadow-2xl"
                    placement="bottomRight"
                    items={items}
                  >
                    <span className="px-1 text-inherit cursor-pointer">
                      <DownChevron
                        inheritStyle
                        config={{ stroke: mode === "dark" ? "#333" : "#eeee" }}
                      />
                    </span>
                  </CustomDropdownButton>
                </div>
              </>
            ) : (
              <div>
                <CustomButton
                  loading={isLoading || (masterForm?.loading && masterForm.action ==="saveAndClose")}
                  type="text"
                  className={`flex flex-1 lg:flex-none justify-center items-center bg-black-black8 !hover:bg-white px-3  border hover:border-black-black8 rounded h-9 text-white dark:bg-gray-gray11 dark:text-white !text-sm`}
                  onClick={handleSubmitAndClose}
                >
                  {submitCaption}
                </CustomButton>
              </div>
            )}
          </>
        )}
      </div>
      {isDynamicModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] h-[470px]" : ""}`}
          headerName={dynamicAction?.MenuDesc}
          headerIcon={
            <>
              {typeof dynamicAction?.Icon === "string" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(dynamicAction?.Icon, mode),
                  }}
                  style={{ width: "18px", height: "17px" }}
                />
              )}
            </>
          }
          closeModal={() => setIsDynamicModalOpen(false)}
          isModalOpen={isDynamicModalOpen}
          content={
            <DynamicModal
              id={id}
              sourceKey={fieldKey}
              config={
                JSON.parse(dynamicAction.Config)
                // dynamicModalConfig.find(
                //   (item) => item.name === dynamicAction.MenuDesc
                // ).config
              }
            />
          }
        />
      )}
      {isModalOpen && (
        <CustomModal
          contentClassName={`${match ? "!min-w-max h-full" : ""}`}
          // headerName={attachmentTitle}
          headerName={dynamicAction?.MenuDesc}
          headerIcon={
            match && (
              <>
                {typeof dynamicAction?.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(dynamicAction?.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </>
            )
          }
          closeModal={() => setIsModalOpen(false)}
          isModalOpen={isModalOpen}
          content={modalContent}
        />
      )}
      {isReportModalOpen && (
        <CustomModal
          withFullscreen
          contentClassName={`${match ? "min-w-[950px] " : ""}  overflow-hidden`}
          headerIcon={<ReportIcon />}
          headerName={t("general.report")}
          closeModal={() => {
            dispatch(clearReportData(null));
            setIsReportModalOpen(false);
          }}
          isModalOpen={isReportModalOpen}
          content={<ShowReport url={getUrl} reportId={reportId} />}
        />
      )}

      {/* این ایراد داره و هیچ جا دستور باز شدن نداره  */}
      {isStockWarehouseModalOpen && (
        <CustomModal
          contentClassName={`${match ? "!w-[720px] h-[520px]" : ""}`}
          headerName={dynamicAction?.MenuDesc}
          headerIcon={
            match && (
              <>
                {typeof dynamicAction?.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(dynamicAction?.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </>
            )
          }
          closeModal={() => setIsStockWarehouseModalOpen(false)}
          isModalOpen={isStockWarehouseModalOpen}
          content={<StockWarehouse id={id} sourceKey={fieldKey as string} />}
        />
      )}
      {isChangeInvoiceCurrencyRateModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] h-[470px]" : ""}`}
          headerName={dynamicAction?.MenuDesc}
          headerIcon={
            match && (
              <>
                {typeof dynamicAction?.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(dynamicAction?.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </>
            )
          }
          closeModal={() => setIsChangeInvoiceCurrencyRateModalOpen(false)}
          isModalOpen={isChangeInvoiceCurrencyRateModalOpen}
          content={
            <ChangeInvoiceCurrencyRate
              id={id}
              sourceKey={fieldKey}
              handleClose={() => setIsChangeInvoiceCurrencyRateModalOpen(false)}
            />
          }
        />
      )}

      <Drawer
        width="70%"
        placement={lang === "fa" ? "right" : "left"}
        closable={false}
        onClose={() => setIsMobileMenuDrawerOpen(false)}
        open={isMobileMenuDrawerOpen}
      >
        <Menu
          onClick={() => setIsMobileMenuDrawerOpen(false)}
          style={{ width: "100%", border: "none" }}
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["1"]}
          mode="inline"
          items={mobileMoreMenuItems}
        />
      </Drawer>
    </>
  );
}
