import { useCallback } from 'react';

import { FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';
import { addHistory } from '@slice/history';
import { HistoryTypeEnum } from '@slice/history/enum';
import {
  addNewPage,
  removePage,
  resetPageData,
  setPageData,
  setPageState,
  setSavePageData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type { IPage } from '@slice/pages/type';
import {
  findingPageState,
  showInfoToast,
  showSuccessToast,
  transformDotNotationToNested,
} from '@utils/core';

import { useInitializePage } from './useInitializePage';
import { useNavigatePage } from './useNavigatePage';

export const useFormHandlers = ({
  pages,
  activePage,
  form = null,
  mutationSystemId = null,
}: {
  pages: IPage[];
  activePage: IPage;
  form?: FormInstance<any>;
  mutationSystemId?: number;
}) => {
  const dispatch = useDispatch();
  const { navigateBack } = useNavigatePage();
  const pathname = usePathname();

  const { historyItems } = useAppSelector(
    (state) => ({
      historyItems: state.withPersist.history,
    }),
    shallowEqual,
  );
  const t = useTranslations();
  const [trigger, { isLoading }] = useCUDDataMutation();
  const initializePage = useInitializePage();
  const formData = activePage?.pageData;
  const id =
    formData?.find((item) => item.caption === "MainIdField")?.value ??
    activePage?.Key;
  const listPages = pages.filter((item) => item.url === activePage?.listUrl);
  const extractBodyAndChangedFields = useCallback(() => {
    const body: any = {};
    const changedFields: string[] = [];

    if (!id) {
      formData?.forEach((item: any) => {
        if (
          item.value !== undefined &&
          item.value !== null &&
          item.type !== "noShow"
        ) {
          if (item.type == "array") {
            body[item.name] = item.value;
          } else if (item.type == "text") {
            body[item.name] = item.value;
          } else if (item.type == "date") {
            try {
              body[item.name] = item.value;
            } catch (error) {
              null;
            }
          } else if (item.type == "number") {
            body[item.name] = +item.value;
          } else {
            body[item.name] = item.value;
          }
        }
      });
    } else {
      formData?.forEach((item: any) => {
        if (
          (item.value !== undefined && item.value !== item.originalValue) ||
          item.caption === "MainIdField"
        ) {
          if (
            item.caption !== "MainIdField" &&
            ![
              "Details",
              "BankStatements",
              "TafsiliStatements",
              "TankhahStatements",
              "CashStatements",
              "TaxItems",
              "AddElement",
              "DiscountItems",
              "InvoiceHeaderId",
              "AllData",
            ].includes(item.name)
          ) {
            changedFields.push(item.name);
          }
          if (item.type == "array") {
            body[item.name] = item.value;
          } else if (item.type == "text") {
            body[item.name] = item.value;
          } else if (item.type == "date") {
            try {
              body[item.name] = item.value;
            } catch (error) {
              null;
            }
          } else if (item.type == "number") {
            body[item.name] = +item.value;
          } else {
            body[item.name] = item.value;
          }
        }
      });

      if (mutationSystemId) {
        body["SystemId"] = mutationSystemId;
      }
    }

    return { body, changedFields };
  }, [activePage, id, mutationSystemId]);
  const handleSave = useCallback(async () => {
    const currentForm = form ? form : null;

    try {
      await currentForm?.validateFields();
        const { body, changedFields } = extractBodyAndChangedFields();

        const cleanBody = transformDotNotationToNested(body);
        const result = await trigger({
          url: id
            ? activePage?.pageInfo?.updateEndpoint
            : activePage?.pageInfo?.addEndpoint,
          body: id
            ? {
              ...cleanBody,
              ChangeFields: changedFields,
            }
            : cleanBody,
          id: id || null,
        }).unwrap();

        if (result?.Result === "Success" || result?.Result === "Pending") {
          if (result?.Result === "Success") showSuccessToast(t("toast.save"));
          if (result?.Result === "Pending") showInfoToast(t("toast.Pending"));
          const pageState = findingPageState(result.PendingStatusId.toString());
          const existItem = historyItems.find(
            (item) =>
              item.key === result.Key &&
              item.type === (id ? HistoryTypeEnum.Update : HistoryTypeEnum.Add),
          );
          if (!existItem) {
            dispatch(
              addHistory({
                initConfig: {
                  RepoId: activePage.RepoId,
                  SystemId: activePage.SystemId,
                  url: !id
                    ? `${activePage.url}?id=${result.Key}`
                    : activePage.url,
                  pageId: activePage.pageId,
                  Id: result.Key,
                  originalPageState: null,
                  pageState: null,
                  listPageId: activePage.listPageId,
                  returnPageId: activePage.returnPageId,
                  selectedView: activePage.selectedView,
                  Key: result.Key,
                },
                key: result.Key,
                type: id ? HistoryTypeEnum.Update : HistoryTypeEnum.Add,
                pageName: activePage.caption,
                name: formData.find((i: any) => i.isTitleField)?.value,
                pageIcon: activePage?.icon,
              }),
            );
          }
          const keyName = activePage?.pageData?.find(
            (i) => i.caption === "MainIdField",
          )?.name;
          dispatch(
            setPageData({
              name: keyName,
              value: result.Key,
              originalValue: result.Key,
            }),
          );

          dispatch(setSavePageData(result.Key));
          dispatch(
            setPageState({
              ...activePage,
              caption:
                activePage.caption +
                " - " +
                formData.find((i: any) => i.isTitleField)?.value,
              Key: result.Key,
              pageState: pageState,
            }),
          );
          return result;
        } else {
          return false;
        }
      
    } catch (error) {
      null;
    }
  }, [
    form,
    activePage,
    listPages,
    id,
    formData,
    extractBodyAndChangedFields,
    trigger,
    initializePage,
  ]);
  const handleSubmit = useCallback(async () => {
    const result: any = await handleSave();
    if (result?.Result === "Success" || result?.Result === "Pending") {
      const listPage = listPages.at(-1);

      if (pathname.includes("/patterns")) return;

      if (listPage) {
        const u = listPage.url.split("id=");
        initializePage({
          config: {
            RepoId: listPage.RepoId,
            SystemId: listPage.SystemId,
            url: listPage.url,
            pageId: listPage.pageId,
            Id: u.length > 0 ? Number(u[1]) : 0,
            originalPageState: listPage.originalPageState,
            pageState: listPage.pageState,
          },
        });
      } else {
        navigateBack();
      }
    }
  }, [
    form,
    activePage,
    listPages,
    id,
    formData,
    extractBodyAndChangedFields,
    trigger,
    initializePage,
  ]);
  const handleSubmitAndClose = useCallback(async () => {
    const result: any = await handleSave();
    if (result?.Result === "Success" || result?.Result === "Pending") {
      if (listPages && listPages.length > 0) {
        listPages.map((listPage) => {
          dispatch(
            setPageState({
              ...listPage,
              pageState: PageStateEnum.NeedReload,
            }),
          );
        });
      }
      navigateBack();
      dispatch(removePage(activePage.pageId));
    }
  }, [
    form,
    activePage,
    listPages,
    id,
    formData,
    extractBodyAndChangedFields,
    trigger,
    initializePage,
  ]);
  const handleSubmitAndClean = useCallback(async () => {
    const result: any = await handleSave();
    if (result?.Result === "Success" || result?.Result === "Pending") {
      handleAdd();
    }
  }, [handleSave, activePage]);

  const handleAdd = useCallback(() => {
    const u = activePage.url.split("?id=");

    if (u[1]?.length > 0) {
      initializePage({
        config: {
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: u[0],
          Id: u.length > 0 ? Number(u[1]) : 0,
        },
      });
    } else {
      const newPageId = Math.floor(Math.random() * 1000).toString();
      dispatch(
        addNewPage({
          pageId: newPageId,
          caption: activePage.caption,
          pageState: PageStateEnum.Opened,
          originalPageState: PageStateEnum.Opened,
          type: activePage.type,
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: activePage.url,
          toolbarData: activePage.toolbarData,
          listUrl: activePage.listUrl,
          listPageId: activePage.listPageId,
        }),
      );
    }
  }, [activePage]);

  const handleReset = useCallback(() => {
    if (form) {
      form.resetFields();
    }
    dispatch(resetPageData({}));
  }, [form]);

  return {
    handleSubmit,
    handleSubmitAndClean,
    handleSubmitAndClose,
    handleAdd,
    handleReset,
    isLoading,
  };
};
