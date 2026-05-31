import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Collapse,
  SelectProps,
  Skeleton,
} from 'antd';
import { CollapseProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
  CustomSelect,
  CustomTag,
} from '@components/atoms/defaultElements';
import {
  DownChevron,
  EditPencil,
  TagIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type { ITagInfo } from '@services/base/type';
import { addDefaultTags } from '@slice/container';
import type { IInitialContainer } from '@slice/container/type';
import {
  setShowTags,
  setViewData,
} from '@slice/pages';
import type { ISelectOption } from '@type/elementType';
import { getSystemNameById } from '@utils/core';

import CustomTable from './customTable';
import type { IModalObject } from './type';

interface IProps {
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
}
export default function TagFilters({ ...props }: IProps) {
  const { minimize, setMinimize } = props;

  const dispatch = useDispatch();
  const t = useTranslations();
  const [isActive, setIsActive] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  
  const { activePage, init ,match ,SystemId} = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
      SystemId:state.withPersist.pages?.find((item) => item.isActive)?.SystemId,
      init: state.withPersist.init,
     match : state.withPersist.config.initMatch
    }),
    shallowEqual
  );
  const sysName = useMemo(()=>{

return getSystemNameById(SystemId)
  },[SystemId])

  const {
    data: tagResponse,
    isSuccess,
    isLoading,
    refetch,
  } = useGetData<ISelectOption[], null>({
    url: `/api/${sysName}/select/tag`,
    body: {
      RepoViewId: 11,
    },
  });
  const editTags: IModalObject = {
    title: (
      <div>
        <div className="font-medium text-black-black5">
          {t("sidebar.editTagsModalHeader")}
        </div>
        <div className="font-normal text-gray-gray85 text-xs">
          {t("sidebar.editTagsModalDesc")}
        </div>
      </div>
    ),
    content: (
      <>
        <CustomTable defaultTagsRefetch={refetch} />
      </>
    ),
  };

  type TagRender = SelectProps["tagRender"];

  const options = useMemo(
    () =>
      tagResponse?.Data?.map((item) => ({
        value: item._SelectId,
        label: item._SelectDisplay,
        title: item._SelectDisplay,
      })),
    [tagResponse?.Data]
  );
  const filteredOptions = options?.filter(
    (o) => !activePage.viewData?.Filters?.TagIdsFilter?.includes(o.value)
  );
  const processedOption = filteredOptions?.map((item) => ({
    value: item.value,
    label: item.label,
    title: item.label,
  }));

  const handleShowTag = () => {
    dispatch(setShowTags({}));
  };
  const handleTagChange = (values) => {
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          TagIdsFilter: values.length > 0 ? values : null,
        },
      })
    );
  };

  const removeAllTagFilters = () => {
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          TagIdsFilter: null,
        },
      })
    );
  };

  const handleEditTags = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModal(true);
  };
  const tagRender: TagRender = (props) => {
    const { onClose, value } = props;

    const selectedOption = options?.find((i) => i.value === value);

    const tag: ITagInfo = {
      Title: selectedOption?.label,
      TagId: selectedOption?.value,
      RepoTagId: selectedOption?.value,
    };
    const deleteTagHandler = (tag) => {
      onClose();
    };
    return (
      <CustomTag
        tag={tag}
        deleteTagHandler={deleteTagHandler}
        className="!m-1 max-w-52 text-[10px] [&>.anticon-close]:!text-gray-gray10"
      />
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div
          className={`flex ${minimize ? "justify-center" : "justify-between"}`}
          onClick={() => {
            setIsActive(!isActive);
            setMinimize?.(false);
          }}
        >
          <div className="flex items-center gap-2" title="برچسب ها">
            {minimize ? (
              <TagIcon
                config={{
                  width: 24,
                  height: 24,
                }}
              />
            ) : (
              <TagIcon config={{ width: 24, height: 24 }} />
            )}

            <span
              className={`${
                minimize ? "hidden" : "text-sm text-gray-gray10 dark:text-white"
              }`}
            >
              {t("sidebar.tags")}
            </span>
            <span
              className={`
              ${isActive && "rotate-180 "}
              ${
                minimize
                  ? "hidden"
                  : "transition-transform duration-200 ease-in-out"
              }
              `}
            >
              <DownChevron />
            </span>
          </div>
          <CustomButton
            type="text"
            className={`${minimize ? "hidden" : "p-1"} `}
            onClick={handleEditTags}
          >
            <EditPencil />
          </CustomButton>
        </div>
      ),

      children: (
        <div>
          <div className={`text-3xs text-blue-blue4 ${minimize && "hidden"}`}>
            {t("sidebar.tagsFilterHint")}
          </div>
          <CustomSelect
            mode="multiple"
            virtual={false}
            style={{ width: "100%" }}
            className={`!bg-gray-gray3 dark:!bg-gray-gray10 ${
              minimize && "hidden"
            } !m-0 !p-1 [&>.ant-select-selector]:!p-0 rounded w-full h-fit`}
            options={processedOption}
            optionFilterProp={"label"}
            value={activePage?.viewData?.Filters?.TagIdsFilter}
            tagRender={tagRender}
            onChange={handleTagChange}
            maxLength={63}
            allowClear={match}
            notFoundContent={t("sidebar.notFound")}
            suffixIcon={<DownChevron />}
          />

          {match && (
            <div
              onClick={handleShowTag}
              className={` w-full text-end text-[10px] cursor-pointer text-gray-gray85 ${
                minimize && "hidden"
              }`}
            >
              {activePage.viewData?.ShowTags ? (
                <>{t("sidebar.notShowTags")}</>
              ) : (
                <>{t("sidebar.showTags")}</>
              )}
            </div>
          )}
        </div>
      ),
      showArrow: false,
    },
  ];
  useEffect(() => {
    refetch();
  }, [init]);
  useEffect(() => {
    if (tagResponse?.Data?.length > 0) {
      const defaultTags: IInitialContainer["defaultTags"] =
        tagResponse?.Data?.map((item) => ({
          TagId: item._SelectId,
          Title: item._SelectDisplay,
        }));
      dispatch(addDefaultTags({ defaultTags, minimize }));
    }
  }, [tagResponse]);
  return (
    <>
      {isLoading ? (
        <Skeleton.Button
          active={true}
          size={"default"}
          shape={"default"}
          block={true}
        />
      ) : (
        <Collapse
          className={`[&>.ant-collapse-item>.ant-collapse-header]:!p-[1px] !text-sm relative w-full  !z-[999] `}
          defaultActiveKey={["1"]}
          rootClassName=""
          style={{
            backgroundColor: "white",
            padding: 0,
            margin: 0,
          }}
          items={items}
          bordered={false}
        />
      )}
      <CustomModal
        title={editTags.title}
        content={editTags.content}
        closeModal={() => {
          setOpenModal(false);
        }}
        isModalOpen={openModal}
      />
    </>
  );
}
