"use client";
import {
    useEffect,
    useState,
} from 'react';

import { Spin } from 'antd';
import {
    shallowEqual,
    useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import List from '@components/organisms/list';
import NestedList from '@components/organisms/nestedList';
import { useInvalidateTag } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import {
    filterTypeStringEnum,
    type IBaseDto,
} from '@services/base/type';
import type { IRequest } from '@services/mng/report/type';
import {
    addNewPage,
    setPageState,
    setViewData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type { IPageConfig } from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import type { IToolbar } from '@type/toolbar';

import type { IProps } from './type';

export default function ViewList<T extends IBaseDto, K>({
    url,
    deleteUrl,
    confirmUrl,
    staticKey,
    filterKey,
    staticKeyII,
    rowFieldKey,
    additionalFieldKey,
    formUrl,
    caption,
    addCaption,
    baseRepoId,
    pageIcon,
    conditionalActions,
    EditField,
    isNested,
    nestedListAddChildCondition,
    withoutActivation,
    rangeFilterKey,
    customColumns,
    bodyKey,
    renderCustomActions,
    filteringAction,
    titleKey,
    isShowChangeStatus = false,
    system
}: IProps<T, K>) {
    const dispatch = useDispatch();
    const { invalidate } = useInvalidateTag();

    const { activePage, pages, initPage } = useAppSelector((state) => {
        const activePage = state.withPersist.pages?.find((item) => item.isActive);
        const initPage = state.withPersist.init;
        const pages = state.withPersist.pages;
        return { activePage, pages, initPage };
    }, shallowEqual);
    const repoId = initPage?.RepoId;
    const pageId = initPage?.pageId;
    const systemId = initPage?.SystemId;
    const baseUrl = initPage?.url;
    const data = initPage?.data;
    const id = initPage?.Id;
    const filterValue = initPage?.data?.[filterKey];
    const bodyValue = activePage?.data?.[bodyKey];
    const [fetchToolbarData, SetFetchToolbarData] = useState(true);

    const recordHeight = 40;
    const deviceHeight = window.innerHeight;
    const recordsPerPage = Math.floor((deviceHeight - 240) / recordHeight);

    const {
        data: dataToolbar,
        isSuccess,
        isFetching: toolbarIsLoading,
    } = useGetData<IToolbar, IRequest>({
        url: "/api/menu/getToolbarData",
        body: { RepoId: repoId, SystemId: systemId, Type: PageTypeEnum.List },
        id: repoId,
        skip: !repoId,
    });

    const priority = {
        ویرایش: 1,
        حذف: 2,
        default: 3,
    };

    const actions = dataToolbar?.Data?.GridMenu;
    const sortedActions =
        actions?.length > 0 &&
        [...actions].sort((a, b) => {
            const priorityA = priority[a.MenuDesc] || priority.default;
            const priorityB = priority[b.MenuDesc] || priority.default;
            return priorityA - priorityB;
        });

    const nestedListConfig = dataToolbar?.Data?.List?.ListProp?.find(
        (item) => item?.Type === PageTypeEnum.NestedList,
    )?.Config;
    // const nestedListConfig = dataToolbar?.Data?.List?.ListProp?.[0]?.Config;

    useEffect(() => {
        if (
            activePage?.pageId === initPage?.pageId &&
            activePage?.pageState === PageStateEnum.NeedReload
        ) {
            const pageUrl = pages.find((page) => page.pageId === initPage.pageId)
                ?.viewData?.url;

            const timeoutId = setTimeout(() => {
                invalidate(pageUrl);

                dispatch(
                    setViewData({
                        ...activePage?.viewData,
                        deletedItems: [],
                        statusItems: [],
                        PagingInfo: {
                            PageNumber: 1,
                            PageRecordCount:
                                activePage?.viewData?.PagingInfo?.PageRecordCount,
                        },
                    }),
                );

                dispatch(
                    setPageState({
                        ...activePage,
                        pageState: PageStateEnum.Opened,
                    }),
                );
            }, 800);

            return () => clearTimeout(timeoutId);
        }
    }, [activePage?.pageId]);

    useEffect(() => {
        if (
            isSuccess &&
            dataToolbar?.Result &&
            dataToolbar.Data &&
            dataToolbar.Data.List &&
            dataToolbar.Data.List.ListProp &&
            fetchToolbarData
        ) {
            try {
                const Config: IPageConfig = JSON.parse(
                    dataToolbar?.Data?.List?.ListProp[0]?.Config,
                );

                const info = {
                    addEndpoint: Config.addEndpoint,
                    deleteEndpoint: Config.deleteEndpoint,
                    updateEndpoint: Config.updateEndpoint,
                    formIdField: Config.formIdField,
                };
                dispatch(
                    addNewPage({
                        pageId: pageId,
                        caption: caption,
                        captionII: initPage.caption ?? "",
                        icon: pageIcon,
                        pageState: PageStateEnum.Opened,
                        type: isNested ? PageTypeEnum.NestedList : PageTypeEnum.List,
                        RepoId: repoId,
                        SystemId: systemId,
                        url: baseUrl,
                        pageData: [],
                        data: data,
                        pageInfo: info,
                        toolbarData: {
                            ...dataToolbar?.Data,
                            GridMenu: sortedActions ? sortedActions : [],
                        },
                        viewData: {
                            RepoViewId: dataToolbar?.Data?.List?.ListProp[0]?.Id,
                            PagingInfo: {
                                PageNumber: 1,
                                PageRecordCount: recordsPerPage,
                            },
                            url: url,
                            deletedItems: [],
                            statusItems: [],
                            Filters: {
                                FilterInfo: filterKey
                                    ? [
                                        {
                                            ColName: filterKey,
                                            Value: filterValue,
                                            FilterType: filterTypeStringEnum.Equal,
                                        },
                                    ]
                                    : [],
                                ShowOnlyBookmarked: false,
                                TagIdsFilter: null,
                            },
                            OrderInfo: [],
                            FullSearchPhrase: "",
                            ShowTags: false,
                            // data: initPage.data,
                        },
                    }),
                );
                SetFetchToolbarData(false);
            } catch (error) {
                null;
            }
        }
    }, [isSuccess, id]);

    if (toolbarIsLoading) return <Spin fullscreen />;

    return (
        <>
            <Title caption={caption} />

            {isSuccess && dataToolbar?.Result && dataToolbar.Data && (
                <>
                    {activePage?.type === PageTypeEnum.List ? (
                        <List<T, K>
                            url={url}
                            recordPerPage={recordsPerPage}
                            deleteUrl={deleteUrl}
                            confirmUrl={confirmUrl}
                            staticKey={staticKey}
                            filterKey={filterKey}
                            bodyValue={bodyValue}
                            bodyKey={bodyKey}
                            staticKeyII={staticKeyII}
                            rowFieldKey={rowFieldKey}
                            additionalFieldKey={additionalFieldKey}
                            formUrl={formUrl}
                            addCaption={addCaption}
                            repoId={repoId}
                            systemId={systemId}
                            baseRepoId={baseRepoId}
                            conditionalActions={conditionalActions}
                            EditField={EditField}
                            withoutActivation={withoutActivation}
                            rangeFilterKey={rangeFilterKey}
                            customColumns={customColumns}
                            renderCustomActions={renderCustomActions}
                            filteringAction={filteringAction}
                            isShowChangeStatus={isShowChangeStatus}
                            system={system }
                        />
                    ) : activePage?.type === PageTypeEnum.NestedList &&
                        nestedListConfig ? (
                        <NestedList
                            caption={caption}
                            config={JSON.parse(nestedListConfig)}
                            addChildCondition={nestedListAddChildCondition}
                            withoutActivation={withoutActivation}
                            titleKey={titleKey}
                        />
                    ) : null}
                </>
            )}
        </>
    );
}
