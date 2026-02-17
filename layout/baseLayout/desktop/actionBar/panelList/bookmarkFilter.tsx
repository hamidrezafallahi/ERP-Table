import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  BookMarkIcon,
  BookMarkIconFilled,
} from '@components/atoms/iconComponents';
import { useDarkMode } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

interface IProps {
  minimize?: boolean;
}

export default function BookmarkFilter({ ...props }: IProps) {
  const { minimize } = props;
  const { mode = "light" } = useDarkMode();
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const t = useTranslations();

  const handleShowBookmark = () => {
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          ShowOnlyBookmarked: !activePage.viewData?.Filters?.ShowOnlyBookmarked,
        },
        PagingInfo: {
          ...activePage.viewData.PagingInfo,
          PageNumber: 1,
        },
      })
    );
  };

  return (
    <div
      className="z-10 relative flex items-center gap-2 px-1 h-8 text-gray-gray10 dark:text-white text-sm cursor-pointer"
      onClick={handleShowBookmark}
      title="نشان شده ها "
    >
      {activePage.viewData?.Filters?.ShowOnlyBookmarked ? (
        <BookMarkIconFilled
          config={{
            width: 20,
            height: 20,
            stroke: mode === "dark" ? "#FBFBFB" : "#585858",
            fill: mode === "dark" ? "#FBFBFB" : "#585858",
          }}
        />
      ) : (
        <BookMarkIcon
          config={{
            width: 20,
            height: 20,
            stroke: mode === "dark" ? "#FBFBFB" : "#585858",
          }}
        />
      )}
      <span className={` ${minimize && "hidden"}`}>
        {t("sidebar.bookmarks")}
      </span>
    </div>
  );
}
