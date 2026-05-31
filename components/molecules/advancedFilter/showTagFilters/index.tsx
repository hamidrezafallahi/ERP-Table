import { Fragment } from 'react';

import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  CustomButton,
  CustomTag,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import { Close } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type { ITagInfo } from '@services/base/type';
import { setViewData } from '@slice/pages';

export default function ShowTagFilters() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { activePage, TagIdsFilter, tags } = useAppSelector((state) => ({
    activePage: state.withPersist.pages?.find((item) => item.isActive),
    TagIdsFilter: state.withPersist.pages?.find((item) => item.isActive)
      ?.viewData?.Filters?.TagIdsFilter,
    tags: state.withoutPersist.container.defaultTags,
  }));
  const removeTagFilterHandler = (removeTag: ITagInfo) => {
    const newTagIdsFilter = activePage.viewData.Filters.TagIdsFilter.filter(
      (item) => item !== removeTag.TagId
    );
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          TagIdsFilter: newTagIdsFilter.length === 0 ? null : newTagIdsFilter,
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
  const commonValues = () => {
    if (tags && tags.length > 0 && TagIdsFilter) {
      const temp = tags.filter((item) => {
        for (let i = 0; i < TagIdsFilter.length; i++) {
          if (item.TagId == TagIdsFilter[i]) {
            return true;
          }
        }
        return false;
      });
      return temp;
    } else {
      return [];
    }
  };
  return (
    <>
      {commonValues().length == 0 ? null : (
        <div className="hidden-show-scrollBar flex flex-wrap gap-2 pt-2 max-w-[550px] overflow-x-auto">
          {commonValues().map((tag, index) => (
            <Fragment key={index}>
              <CustomTag
                tag={tag}
                deleteTagHandler={removeTagFilterHandler}
                className="min-w-fit h-8 text-[10px]"
              />
            </Fragment>
          ))}
          {TagIdsFilter && TagIdsFilter.length > 0 && (
            <CustomButton
              type="text"
              className="bg-gray-gray5 px-3 border hover:border-black-black8 rounded text-main-black"
              onClick={removeAllTagFilters}
            >
              <CustomTooltip title={t("general.delete")}>
                <div className="flex justify-center items-center gap-1">
                  <Close config={{ width: 8, height: 8 }} />
                </div>
              </CustomTooltip>
            </CustomButton>
          )}
        </div>
      )}
    </>
  );
}
