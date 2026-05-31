import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  BookMarkIcon,
  BookMarkIconFilled,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import { setPageState } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { getSystemNameById } from '@utils/core';

import type { IProps } from './type';

export default function Bookmarker({ ...props }: IProps) {
  const { minimize } = props;
  const dispatch = useDispatch();
  const params = useSearchParams();
  const t = useTranslations();
  const { activePage, ListPage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
      ListPage: state.withPersist.pages?.find(
        (item) =>
          item.url ==
          state.withPersist.pages?.find((item) => item.isActive).listUrl
      ),
    }),
    shallowEqual
  );
  const { RepoId, SystemId } = activePage;
  const hasBookMark = activePage.pageData?.find((item) => item.type == "info");
  const [bookmark, setBookmark] = useState(
    hasBookMark && hasBookMark.value == true ? true : false
  );
  const [trigger, { isLoading: bookMarkIsLoading }] = useCUDDataMutation();
  const RefId = Number(params.get("id"));

  const Bookmarked = async () => {
    getSystemNameById(SystemId);
    try {
      const result = await trigger({
        url: `/api/${getSystemNameById(SystemId)}/insert/bookmark `,
        body: {
          RepoId,
          RefId,
        },
      }).unwrap();
      if (result && result?.Result == "Success") {
        setBookmark(!bookmark);
        dispatch(
          setPageState({
            ...ListPage,
            pageState: PageStateEnum.NeedReload,
          })
        );
      }
    } catch (err) {
      null;
    }
  };
  return (
    <CustomButton
      type="text"
      className={`hover:!bg-transparent ${
        minimize ? "justify-center" : "flex justify-between  p-0 w-full"
      }`}
      onClick={Bookmarked}
    >
      <div className="group flex items-center gap-2">
        <span
          title="نشان کردن "
          className={` ${
            minimize
              ? " "
              : "w-4 transition-all group-hover:translate-y-1 duration-500"
          } `}
        >
          {bookMarkIsLoading ? (
            <SpinIcon />
          ) : bookmark ? (
            minimize ? (
              <BookMarkIconFilled
                config={{
                  width: 28,
                  height: 28,
                }}
              />
            ) : (
              <BookMarkIconFilled />
            )
          ) : minimize ? (
            <BookMarkIcon
              config={{
                width: 28,
                height: 28,
              }}
            />
          ) : (
            <BookMarkIcon />
          )}
        </span>
        <span
          className={` ${
            minimize
              ? " hidden"
              : "text-gray-gray85 hover:text-main-black text-sm transition-all duration-300 dark:text-white "
          }`}
        >
          {t("sidebar.bookmark")}
        </span>
      </div>
    </CustomButton>
  );
}
