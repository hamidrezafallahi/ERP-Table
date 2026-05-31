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

import {
  ERPTableApi,
  ERPTableProps,
} from '@components/organisms/erp-table/ui';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import {
  addNewPage,
  removePage,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { IPageConfig } from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import { showSuccessToast } from '@utils/toast';

export function useERPGrid(props: any) {
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
        captionII,
        storeName,
        tableTitle,
        columnConfig,
        formHeight = 500,
        recordHeight = 40,
        mobileRecordsPerPage = 100,
        setIsFormSubmitting
    } = props;

    const [pageReady, setPageReady] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [tableApi, setTableApi] = useState<ERPTableApi | null>(null);
    const [toolbar, setToolbar] = useState<any>(null);

    const dispatch = useDispatch();
    const t = useTranslations();
    const params = useSearchParams();
    const path = usePathname();
    const { navigateBack } = useNavigatePage();
    const id = Number(params.get("id"));

    const [fetchMutation] = useGetConditionallyMutation();
    const [getToolbarData] = useGetConditionallyMutation();
    const [itemMutate] = useGetConditionallyMutation();

    const { initPage, activePage, match } = useAppSelector(
        (state) => ({
            initPage: state.withPersist.init,
            activePage: state?.withPersist?.pages?.find((item) => item.isActive),
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

    // ۲. مقداردهی اولیه صفحه (Initialize)
    useEffect(() => {
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
                    captionII: captionII ?? "",
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
                    values: { ...item }
                })));
            }
        };
        loadDetails();
    }, [id]);

    const handleSubmit = useCallback(async () => {
        if (!tableApi) return;
        setIsFormSubmitting(true);
        function mapSnapshotToDetailsDynamic(snapshot: any) {
            return snapshot.rows
                .filter((row: any) => row.rowState !== "None")
                .map((row: any) => {
                    const detail: Record<string, any> = {};
                    detail.RowState = row.rowState;
                    detail.ChangeFields = row.changeFields;
                    if (id && row.rowState !== "Add") {
                        detail[detailFieldKey] = row.id;
                    }
                    Object.entries(row.cells).forEach(([col, cell]: [string, any]) => {
                        if (cell == null || cell == undefined) return;
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
        }
        try {
            const currentData = activePage?.pageData || [];
            const formValues = Object.fromEntries(currentData.map(i => [i.name, i.value]));

            const changeFields = currentData
                .filter(i => i.value !== i.originalValue)
                .map(i => i.name);

            const payload = {
                ...formValues,
                ChangeFields: id !== 0 ? changeFields : undefined,
                Details: mapSnapshotToDetailsDynamic(tableApi?.getSnapShot()),
                [headerFieldKey]: id !== 0 ? id : undefined
            };
            const res = await itemMutate({ url: !id ? addUrl : updateUrl, body: payload }).unwrap();
            if (res?.Result === "Success") {
                showSuccessToast(t("toast.successTitle"), t(caption));
                dispatch(removePage(activePage.pageId));
                navigateBack();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFormSubmitting(false);
        }
    }, [tableApi, activePage, id]);

    const tableProps = useMemo<ERPTableProps>(() => ({
        actor: props.actor || { userId: "1", roles: ["ADMIN"] },
        store: storeName,
        tableKey: params.get("id") ?? activePage?.pageId ?? "",
        rows,
        columns: columnConfig,
        tableHeight,
        tableTitle,
    }), [rows, columnConfig, tableHeight, id]);

    return {
        pageReady,
        tableProps,
        handleSubmit,
        setTableApi,
        tableHeight,
        tableApi,
        id,
        toolbar,
        t,
    };
}
