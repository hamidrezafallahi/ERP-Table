import {
  Fragment,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomTag } from '@components/atoms/defaultElements';
import { useMediaQuery } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

import type { IProps } from './type';

export const TagsRenderer = ({ RefId, defaultOpen }: IProps) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
      const { match: minDesktop } = useMediaQuery("XLUP");
    const { match: maxDesktop } = useMediaQuery("XXLUP");
  const { activePage, TagsInfo,minimize } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find((item) => item.isActive);
    const RepoId = activePage ? activePage.RepoId : null;
    const TagsInfo = RepoId
      ? state.withoutPersist.container.recordsTags.find(
          (item) => item.RepoId === RepoId && item.RefId === RefId
        )?.tags
      : null;
   
    const minimize = state.withoutPersist.container.minimize
    return { activePage, TagsInfo,minimize };
  }, shallowEqual);

  const dispatch = useDispatch();

  const showTagsHandler = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  const hideTagsHandler = (e) => {
    e.stopPropagation();
    setOpen(false);
  };

  const setTagFilterHandler = (e) => {
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData?.Filters,
          TagIdsFilter: [e.TagId],
        },
      })
    );
  };
    const limitDesktop = minDesktop && !maxDesktop
  const limitation = TagsInfo && !minimize && limitDesktop
  return (
    <div
      className={`flex flex-row-reverse gap-2 overflow-visible  ${minimize ? "w-[160px]" : "w-fit" }`}
      onMouseEnter={showTagsHandler}
      onMouseLeave={hideTagsHandler}
    >
    {TagsInfo ? (
  limitation ? (
    <div
      className={`flex flex-row-reverse bg-main-white dark:bg-gray-gray10 gap-x-2 px-2 py-1 overflow-hidden absolute top-[2px] ${
        open
          ? "w-fit shadow rounded"
          : minimize
          ? "w-[200px]"
          : "w-[92px]"
      }`}
    >
      {TagsInfo.map((tag, index) => (
        <Fragment key={index}>
          <CustomTag
            className="min-w-[72px] !h-5 !font-semibold !text-2xs text-center"
            tag={tag}
            selectTagHandler={() => setTagFilterHandler(tag)}
            Loading={false}
            closable={false}
          />
        </Fragment>
      ))}
      <span
        className={`absolute rtl:right-0 left-0 
          top-[2px] shadow border bg-main-white dark:bg-gray-gray10 dark:text-gray-gray3 px-2 w-[35px] text-[15px] rounded flex justify-center items-center ${
          TagsInfo.length >= 3 && !open ? "" : "hidden"
        }`}
      >
        {minimize ? `${TagsInfo.length - 2}+` : `${TagsInfo.length - 1}+`}
      </span>
    </div>
  ) : TagsInfo.length < 2 ? (
    <>
      {TagsInfo.map((tag, index) => (
        <Fragment key={index}>
          <CustomTag
            tag={tag}
            selectTagHandler={() => setTagFilterHandler(tag)}
            Loading={false}
            closable={false}
            className="!h-5 !font-semibold !text-2xs"
          />
        </Fragment>
      ))}
    </>
  ) : (
    <div
      className={`flex flex-row-reverse bg-main-white dark:bg-gray-gray10 gap-x-2 px-2 py-1 overflow-hidden absolute top-[2px] ${
        !TagsInfo
          ? "hidden"
          : open
          ? "w-fit shadow rounded"
          : minimize
          ? "w-[200px]"
          : "w-[92px]"
      }`}
    >
      {TagsInfo.map((tag, index) => (
        <Fragment key={index}>
          <CustomTag
            className="min-w-[72px] !h-5 !font-semibold !text-2xs text-center"
            tag={tag}
            selectTagHandler={() => setTagFilterHandler(tag)}
            Loading={false}
            closable={false}
          />
        </Fragment>
      ))}
      <span
        className={`absolute rtl:right-0 left-0 
         top-[2px] shadow border bg-main-white dark:bg-gray-gray10 dark:text-gray-gray3 px-2 w-[35px] text-[15px] rounded flex justify-center items-center ${
          TagsInfo.length >= 3 && !open ? "" : "hidden"
        }`}
      >
        {minimize ? `${TagsInfo.length - 2}+` : `${TagsInfo.length - 1}+`}
      </span>
    </div>
  )
) : null}

    </div>
  );
};
