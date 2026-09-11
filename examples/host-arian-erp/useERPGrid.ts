// @ts-nocheck
// Host page glue for ERP grids (Next.js / redux slices). Outside package core.
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
  IPageConfig,
} from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import { RowStateEnum } from '../domain/value-objects';
import { TableSnapShot } from '../engine/type';
import { UITableController } from '../infrastructure/ui/UITableController';

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
        activeCollection = "default",
        formHeight = 500,
        recordHeight = 40,
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
    const copyFrom = Number(params.get("copyFrom"));
    const isCopy = !!copyFrom && !id;
    const sourceId = id || copyFrom;

    const [fetchMutation] = useGetConditionallyMutation();
    const [getToolbarData] = useGetConditionallyMutation();
    const [itemMutate] = useGetConditionallyMutation();

    const { initPage, activePage, pages } = useAppSelector(
        (state) => ({
            initPage: state.withPersist.init,
            activePage: state?.withPersist?.pages?.find((item) => item.isActive),
            pages: state?.withPersist?.pages,
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
    const recordsPerPage = Math.floor(tableHeight / recordHeight);
    const listPages = pages.filter((item) => item.url === activePage?.listUrl);
    const initializePage = useInitializePage();
    const fetchDefaultValues = async (recordId: number, asCopy = false) => {
        // Look up by this page's id ΓÇö on tab return activePage may still be the previous tab
        const storedData =
            pages.find((p) => p.pageId === pageId)?.pageData ??
            activePage?.pageData;

        if (!recordId) {
            if (storedData?.length) return storedData;
            return formConfig.map(i => ({ ...i, value: i.value, originalValue: i.value }));
        }

        const res = await fetchMutation({
            url: headerGetUrl,
            body: { Id: recordId, RepoViewId: DefaultHeaderRepoViewId }
        }).unwrap();

        if (res.Result === "Success") {
            const serverData = res.Data[0];

            // On copy: clear PK + auto-generated document numbers (API expects int/null, not "").
            const copyResetFields = new Set([
                headerFieldKey,
                "VoucherNumber",
                "ReferNumber",
            ]);
            const mapped = formConfig.map((item: any) => {
                const isIdentityField =
                    asCopy &&
                    (copyResetFields.has(item.name) ||
                        item.caption === "MainIdField");
                const storedVal = storedData?.find((i: any) => i.name === item.name)?.value;
                const currentVal =
                    storedVal !== undefined
                        ? storedVal
                        : serverData
                            ? serverData[item.name] ?? undefined
                            : undefined;
                return {
                    ...item,
                    value: isIdentityField ? null : currentVal,
                    originalValue: isIdentityField
                        ? null
                        : serverData
                          ? serverData[item.name] ?? undefined
                          : undefined,
                    isTitleField: item.name === headerFieldKey
                };
            });

            mapped.push({
                name: headerFieldKey,
                value: asCopy ? null : recordId,
                originalValue: asCopy ? null : recordId,
                type: "hidden",
            });
            return mapped;
        }
        return storedData?.length ? storedData : formConfig;
    };
    const safeParse = (s: any) => {
        try {
            return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const toolbar = await getToolbarData({
                    url: "/api/menu/getToolbarData",
                    body: {
                        RepoId: initPage.RepoId,
                        SystemId: initPage.SystemId,
                        Type: PageTypeEnum.Form
                    }
                }).unwrap();

                if (toolbar.Result) {
                    setToolbar(toolbar.Data);
                    setMasterForm((prev) => ({ ...prev, toolbarData: toolbar.Data }))
                    const Config: IPageConfig =
                        safeParse(toolbar?.Data?.List?.ListProp?.[0]?.Config) ||
                        ({} as IPageConfig);

                    const info = {
                        addEndpoint: Config.addEndpoint,
                        deleteEndpoint: Config.deleteEndpoint,
                        updateEndpoint: Config.updateEndpoint,
                        formIdField: Config.formIdField,
                    };

                    const existingPage = pages.find((p) => p.pageId === pageId);
                    const formData =
                        existingPage?.pageData?.length
                            ? existingPage.pageData
                            : await fetchDefaultValues(sourceId, isCopy);

                    dispatch(
                        addNewPage({
                            Id: Id,
                            pageId,
                            icon: pageIcon,
                            caption: caption,
                            pageState: existingPage?.pageState
                                ?? (pageState ? pageState : PageStateEnum.Opened),
                            originalPageState: existingPage?.originalPageState
                                ?? (originalPageState ? originalPageState : PageStateEnum.Opened),
                            type: PageTypeEnum.Form,
                            pageData: formData,
                            toolbarData:toolbar.Data,
                            viewData: existingPage?.viewData ?? {
                                PagingInfo: {
                                    PageNumber: 1,
                                    PageRecordCount: recordsPerPage,
                                },
                            },
                            data: existingPage?.data ?? initData,
                            RepoId,
                            SystemId,
                            url,
                            pageInfo: info,
                            listUrl
                        })
                    );

                    setPageReady(true);
                }
            } catch (error) {
                console.error("Error initializing page:", error);

                // optional
                setPageReady(false);

                // ╪º┌»╪▒ toast ╪»╪º╪▒█î:
                showErrorToast("╪«╪╖╪º ╪»╪▒ ╪»╪▒█î╪º┘ü╪¬ ╪º╪╖┘ä╪º╪╣╪º╪¬ ╪╡┘ü╪¡┘ç", error);
            }
        };
        init();
    }, [path]);

    useEffect(() => {
        if (!sourceId || sourceId === 0) {
            setRows([]);
            return;
        }
        const loadDetails = async () => {
            const res = await fetchMutation({
                url: detailGetUrl,
                body: { HeaderId: sourceId, RepoViewId: DefaultDetailRepoViewId, PagingInfo: { PageNumber: 1, PageRecordCount: recordsPerPage } }
            }).unwrap();

            if (res.Result === "Success") {
                setRows(res.Data.map((item: any) => {
                    if (isCopy) {
                        const { [detailFieldKey]: _pk, ...rest } = item;
                        return {
                            id: Math.floor(Math.random() * 100000),
                            values: {
                                ...rest,
                                [detailFieldKey]: undefined,
                                RowState: RowStateEnum.Added,
                                collection: activeCollection,
                            },
                        };
                    }
                    return {
                        id: item[detailFieldKey],
                        values: { ...item, collection: activeCollection },
                    };
                }));
            }
        };
        loadDetails();
    }, [sourceId, isCopy]);




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
                };

                if (id && row.rowState !== "Add") {
                    detail[detailFieldKey] = row.id;
                }

                if (row.isSaveDescription) {
                    detail.isSaveDescription = row.isSaveDescription;
                }

                Object.entries(row.cells ?? {}).forEach(([col, cell]: [string, any]) => {
                    if (cell == null) return;
                    if (col === "collection" || col === "rowType" || col === "ChangeFields") {
                        return;
                    }

                    if (col === "index") {
                        detail.RowNum = cell;
                        return;
                    }

                    const value =
                        typeof cell === "object" && "value" in cell ? cell.value : cell;

                    detail[col] = value;
                });

                return {
                    detail,
                    collection: row.collection || "default",
                };
            });

            const hasCustomCollection = mapped.some(
                (r) => r.collection && r.collection !== "default",
            );

            if (!hasCustomCollection) {
                return { Details: mapped.map((r) => r.detail) };
            }

            return mapped.reduce((acc: Record<string, any[]>, row) => {
                (acc[row.collection] ??= []).push(row.detail);
                return acc;
            }, {});
        }

        try {
            const currentData = activePage?.pageData || [];
            const numericFieldNames = new Set([
                "VoucherNumber",
                "ReferNumber",
                headerFieldKey,
            ]);
            const formValues = Object.fromEntries(
                currentData.map((i) => {
                    let value = i.value;
                    if (value === "") value = null;
                    if (
                        value != null &&
                        (i.type === "number" || numericFieldNames.has(i.name))
                    ) {
                        const n = Number(value);
                        value = Number.isNaN(n) ? null : n;
                    }
                    return [i.name, value];
                }),
            );

            const snapshotDetails = mapSnapshotToDetailsDynamic(
                controller?.getSnapShot() as TableSnapShot
            );

            const payload = {
                ...formValues,
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
                    controller.dispose();
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
                    dispatch(removePage(activePage.pageId));
                    controller.dispose();

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
        tableKey: pageId,
        rows,
        columns: columnConfig,
        recordPerPage: recordsPerPage,
        tableHeight,
        tableTitle,
        activeCollection,
        multiSelectConfig
    }), [rows, columnConfig, recordsPerPage, tableHeight, id, activeCollection, tableTitle, multiSelectConfig, storeName, pageId, actor]);

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
