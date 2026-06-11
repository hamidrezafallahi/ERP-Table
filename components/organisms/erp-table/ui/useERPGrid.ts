import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  usePathname,
  useSearchParams,
} from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { ERPTableProps } from '@components/organisms/erp-table/ui';
import { MasterToolbar } from '@components/organisms/formToolbar/type';
import {
  useInitializePage,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import {
  addNewPage,
  removePage,
  setPageState,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import {
  GridContainedPageProps,
  IFormFieldConfig,
  IPageConfig,
} from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import { showSuccessToast } from '@utils/toast';

import { IDetailColumnConfig } from '../bootstrap/type';
import { TableSnapShot } from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';
import { IMultiSelectConfig } from './type';

interface IUseERPGrid extends MasterToolbar {
    headerGetUrl: string
    DefaultHeaderRepoViewId: number
    formConfig: IFormFieldConfig[]
    headerFieldKey: string
    detailGetUrl: string
    DefaultDetailRepoViewId: number
    detailFieldKey: string
    addUrl: string
    updateUrl: string
    listUrl: string
    caption: string
    pageIcon: string
    captionII?: string
    storeName: string
    tableType?: string
    tableTitle: string
    columnConfig: IDetailColumnConfig[]
    multiSelectConfig?: IMultiSelectConfig
    actor?: { userId: string, roles: string[] }
    formHeight?: number
    recordHeight?: number
    mobileRecordsPerPage?: number
}
export function useERPGrid(props: Omit<GridContainedPageProps, "Component" | "form">) {
    const {
        headerGetUrl,
        DefaultHeaderRepoViewId,
        formConfig,
        headerFieldKey,
        detailGetUrl,
        DefaultDetailRepoViewId,
        detailFieldKey,
        addUrl,
        updateUrl,
        listUrl,
        caption,
        pageIcon,
        storeName,
        tableTitle,
        columnConfig,
        multiSelectConfig,
        actor = { userId: "1", roles: ["ADMIN"] },
        tableType = "default",
        formHeight = 500,
        recordHeight = 40,
        mobileRecordsPerPage = 100,
        masterForm,
        setMasterForm
    } = props;

    const [pageReady, setPageReady] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [controller, setController] = useState<UITableController | null>(null);
    const [toolbar, setToolbar] = useState<any>(null);
    const { navigateBack } = useNavigatePage()
    const dispatch = useDispatch();
    const t = useTranslations();
    const params = useSearchParams();
    const path = usePathname();
    const id = Number(params.get("id"));

    const [fetchMutation] = useGetConditionallyMutation();
    const [getToolbarData] = useGetConditionallyMutation();
    const [itemMutate] = useGetConditionallyMutation();

    const { initPage, activePage, pages, match } = useAppSelector(
        (state) => ({
            initPage: state.withPersist.init,
            activePage: state?.withPersist?.pages?.find((item) => item.isActive),
            pages: state?.withPersist?.pages,
            match: state.withPersist.config.initMatch,
        }),
        shallowEqual
    );
    const {
        pageId,
        RepoId,
        SystemId,
        url,
        pageState,
        originalPageState,
        Id,
        data: initData
    } = initPage;
    const deviceHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const tableHeight = deviceHeight - formHeight;
    const recordsPerPage = !match ? mobileRecordsPerPage : Math.floor(tableHeight / recordHeight);
    const listPages = pages.filter((item) => item.url === activePage?.listUrl);
    const initializePage = useInitializePage();
    const fetchDefaultValues = async (recordId: number) => {
        if (!recordId) return formConfig.map(i => ({ ...i, value: i.value, originalValue: i.value }));

        const res = await fetchMutation({
            url: headerGetUrl,
            body: { Id: recordId, RepoViewId: DefaultHeaderRepoViewId }
        }).unwrap();

        if (res.Result === "Success") {
            const serverData = res.Data[0];
            const storedData = activePage?.pageData;

            const mapped = formConfig.map((item: any) => {
                const currentVal = storedData?.find((i: any) => i.name === item.name)?.value ?? serverData[item.name];
                return {
                    ...item,
                    value: currentVal,
                    originalValue: serverData[item.name],
                    isTitleField: item.name === headerFieldKey
                };
            });

            mapped.push({ name: headerFieldKey, value: recordId, originalValue: recordId, type: "hidden" });
            return mapped;
        }
        return formConfig;
    };
    const safeParse = (s: any) => {
        try {
            return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        console.log("init")
        const init = async () => {
            const toolbar = await getToolbarData({
                url: "/api/menu/getToolbarData",
                body: { RepoId: initPage.RepoId, SystemId: initPage.SystemId, Type: PageTypeEnum.Form }
            }).unwrap();

            if (toolbar.Result) {
                setToolbar(toolbar.Data)
                const Config: IPageConfig =
                    safeParse(toolbar?.Data?.List?.ListProp?.[0]?.Config) ||
                    ({} as IPageConfig);
                const info = {
                    addEndpoint: Config.addEndpoint,
                    deleteEndpoint: Config.deleteEndpoint,
                    updateEndpoint: Config.updateEndpoint,
                    formIdField: Config.formIdField,
                };
                const formData = await fetchDefaultValues(id);
                dispatch(addNewPage({
                    Id: Id,
                    pageId,
                    icon: pageIcon,
                    caption: caption,
                    pageState: pageState ? pageState : PageStateEnum.Opened,
                    originalPageState: originalPageState
                        ? originalPageState
                        : PageStateEnum.Opened,
                    type: PageTypeEnum.Form,
                    pageData: formData,
                    viewData: {
                        PagingInfo: {
                            PageNumber: 1,
                            PageRecordCount: recordsPerPage,
                        },
                    },
                    data: initData,
                    RepoId,
                    SystemId,
                    url,
                    pageInfo: info,
                    listUrl
                }));
                setPageReady(true);
            }
        };
        init();
    }, [path]);

    useEffect(() => {
        if (!id || id === 0) {
            setRows([]);
            return;
        }
        const loadDetails = async () => {
            const res = await fetchMutation({
                url: detailGetUrl,
                body: { HeaderId: id, RepoViewId: DefaultDetailRepoViewId, PagingInfo: { PageNumber: 1, PageRecordCount: recordsPerPage } }
            }).unwrap();

            if (res.Result === "Success") {
                setRows(res.Data.map((item: any) => ({
                    id: item[detailFieldKey],
                    values: { ...item, rowType: tableType }
                })));
            }
        };
        loadDetails();
    }, [id]);




    const handleAdd = useCallback(() => {
        const u = activePage.url.split("?id=");
        if (u[1]?.length > 0) {
            initializePage({
                config: {
                    RepoId: activePage.RepoId,
                    SystemId: activePage.SystemId,
                    type: activePage.type,
                    caption: activePage.caption,
                    captionII: activePage.captionII,
                    pageState: PageStateEnum.Opened,
                    originalPageState: PageStateEnum.Opened,
                    pageData: [],
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

    const handleSubmit = useCallback(async () => {
        if (!controller) return;
        setMasterForm((prev) => ({ ...prev, loading: true }));
        function mapSnapshotToDetailsDynamic(snapshot: TableSnapShot) {
            const rows = snapshot.rows.filter((row: any) => row.rowState !== "None");

            const mapped = rows.map((row: any) => {
                const detail: Record<string, any> = {
                    RowState: row.rowState,
                    rowType: row.rowType,
                    ChangeFields: row.changeFields
                };

                if (id && row.rowState !== "Add") {
                    detail[detailFieldKey] = row.id;
                }

                if (row.isSaveDescription) {
                    detail.isSaveDescription = row.isSaveDescription;
                }

                Object.entries(row.cells ?? {}).forEach(([col, cell]: [string, any]) => {
                    if (cell == null) return;

                    if (col === "index") {
                        detail.RowNum = cell;
                        return;
                    }

                    const value =
                        typeof cell === "object" && "value" in cell ? cell.value : cell;

                    detail[col] = value;
                });

                return detail;
            });

            const hasCustomType = mapped.some(r => r.rowType && r.rowType !== "default");

            if (!hasCustomType) {
                return { Details: mapped };
            }

            const grouped = mapped.reduce((acc: Record<string, any[]>, row) => {
                const key = row.rowType || "default";
                (acc[key] ??= []).push(row);
                return acc;
            }, {});

            return grouped;
        }

        try {
            const currentData = activePage?.pageData || [];
            const formValues = Object.fromEntries(currentData.map(i => [i.name, i.value]));

            const changeFields = currentData
                .filter(i => i.value !== i.originalValue)
                .map(i => i.name);
            const snapshotDetails = mapSnapshotToDetailsDynamic(
                controller?.getSnapShot() as TableSnapShot
            );

            const payload = {
                ...formValues,
                ChangeFields: id !== 0 ? changeFields : undefined,
                ...snapshotDetails,
                [headerFieldKey]: id !== 0 ? id : undefined
            };
            const res = await itemMutate({ url: !id ? addUrl : updateUrl, body: payload }).unwrap();
            if (res?.Result === "Success") {
                showSuccessToast(t("toast.successTitle"), t(caption));
                dispatch(
                    setPageState({
                        ...activePage,
                        pageState: PageStateEnum.Saved,
                    }),
                );
                if (masterForm.action === "saveAndClose") {
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
                    controller.dispose();
                } else if (masterForm.action === "saveAndNew") {
                    handleAdd()
                } else {
                    const listPage = listPages.at(-1);
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

            }
        } catch (e) {
            console.error(e);
        } finally {
            setMasterForm((prev) => ({ ...prev, loading: false }));
        }
    }, [controller, activePage, id]);

    const tableProps = useMemo<ERPTableProps>(() => ({
        actor: actor,
        store: storeName,
        tableKey:pageId,
        rows,
        columns: columnConfig,
        tableHeight,
        tableTitle,
        tableType,
        multiSelectConfig
    }), [rows, columnConfig, tableHeight, id, tableType]);

    return {
        pageReady,
        tableProps,
        handleSubmit,
        setController,
        tableHeight,
        controller,
        id,
        toolbar,
        t,
    };
}
