import {
  FC,
  useMemo,
  useState,
} from 'react';

import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  DownChevron,
  ListIcon,
  Reload,
} from '@components/atoms/iconComponents';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  useDarkMode,
  useInvalidateTag,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setPageState,
  setPageType,
  setViewData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { IToolbarList } from '@type/toolbar';
import { getColoredIcon } from '@utils/core';

import type { IProps } from './type';

export const NestedListToolbar: FC<IProps> = ({
  expandAll,
  collapseAll,
  refetch,
  handleAddFirstItem,
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { invalidate } = useInvalidateTag();

  const { mode = "light" } = useDarkMode();

  const [listName, setListName] = useState(t("general.showList"));

  const { activePage, lang, match } = useAppSelector(
    (state) => ({
      match: state.withPersist.config.initMatch,
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
      lang: state.withPersist.config.lang,
    }),
    shallowEqual,
  );

  const toolbarData = activePage?.toolbarData;

  const handleRefreshData = () => {
    refetch();
    dispatch(
      setPageState({
        ...activePage,
        pageState: PageStateEnum.Opened,
      }),
    );
    dispatch(
      setViewData({
        ...activePage?.viewData,
        deletedItems: [],
        statusItems: [],
      }),
    );
  };

  const displayListItems = useMemo(() => {
    const handleChangeList = (listItem: IToolbarList) => {
      setListName(listItem.Desc);
      dispatch(
        setViewData({
          ...activePage.viewData,
          RepoViewId: listItem.Id,
        }),
      );
      if (activePage?.type !== listItem?.Type)
        dispatch(setPageType(listItem?.Type));
    };

    if (!toolbarData?.List?.ListProp || toolbarData == undefined) {
      return [];
    } else {
      toolbarData.List.ListProp &&
        setListName(toolbarData.List.ListProp[0]?.Desc);

      return toolbarData?.List?.ListProp?.map((listItem: IToolbarList) => ({
        key: listItem.Id,
        label: listItem.Desc,
        icon: listItem.icon && (
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(getColoredIcon(listItem.icon, mode)),
            }}
          />
        ),
        onClick: () => handleChangeList(listItem),
      }));
    }
  }, [dispatch, toolbarData]);

  return (
    <div className={`${match && "-top-[60px] -left-[10px] absolute"} `}>
      <div className="flex justify-end items-center gap-2 w-full h-full">
        {match && (
          <CustomTooltip title={t("general.fullScreenMode")}>
            <ExpandedButton />
          </CustomTooltip>
        )}
        {displayListItems.length > 1 && (
          <CustomDropdownButton
            placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
            className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 xxl:w-28 h-9 hover:text-main-black dark:hover:text-white text-xs"
            items={displayListItems}
          >
            <div className="cursor-pointer" id="discount">
              <div className="hidden xxl:flex justify-between items-center w-full">
                {listName} <DownChevron />
              </div>
              <div className="xxl:hidden block">
                <ListIcon />
              </div>
            </div>
          </CustomDropdownButton>
        )}

        {/* <CustomDropdownButton
          placement="bottomRight"
          className="flex bg-gray-gray3 p-[6px] rounded h-full"
          items={[]}
        >
          <a
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Dots />
          </a>
        </CustomDropdownButton>

        <CustomButton className="flex bg-gray-gray3 p-[6px] border-0 rounded h-full">
          <Printer />
        </CustomButton> */}
        <CustomTooltip
          className="flex bg-gray-gray3 dark:!bg-gray-gray11 rounded h-full"
          title={t("general.reload")}
        >
          <div
            className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
            onClick={handleRefreshData}
            id="reload"
          >
            <Reload
              config={{
                width: 24,
                height: 24,
              }}
            />
          </div>
        </CustomTooltip>
        <CustomButton
          className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] border-0 rounded h-9"
          onClick={expandAll}
        >
          {t("general.openAll")}
        </CustomButton>
        <CustomButton
          className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] border-0 rounded h-9"
          onClick={collapseAll}
        >
          {t("general.closeAll")}
        </CustomButton>
        <CustomButton
          type="text"
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          onClick={handleAddFirstItem}
        >
          {t("general.addMainBranch")}
        </CustomButton>
      </div>
    </div>
  );
};
