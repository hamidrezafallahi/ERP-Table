import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  BookMarkIconFilled,
  Close,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

export default function ShowBookmarkFilter() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { activePage } = useAppSelector((state) => ({
    activePage: state.withPersist.pages.find((item) => item.isActive),
  }));
  // if(activePage?.viewData?.ShowBookmarked == false ){return}

  const removeShowBookmarkedFilter = () => {
    dispatch(
      setViewData({
        ...activePage.viewData,
        Filters: {
          ...activePage.viewData.Filters,
          ShowOnlyBookmarked: false,
        },
      })
    );
  };
  return (
    <>
      {activePage?.viewData?.Filters?.ShowOnlyBookmarked && (
        <div className="flex gap-2 pt-2">
          <div className="flex justify-center items-center gap-2 bg-gray-gray4 px-2 rounded text-gray-gray10">
            <BookMarkIconFilled />
            {t("general.bookmarks")}
          </div>
          <CustomButton
            type="text"
            className="bg-gray-gray5 dark:bg-gray-gray12 px-3 py-1 border hover:border-black-black8 rounded text-main-black"
            onClick={removeShowBookmarkedFilter}
          >
            <CustomTooltip title={t("general.delete")}>
              <div className="flex justify-center items-center gap-1">
                <Close config={{ width: 8, height: 8 }} />
              </div>
            </CustomTooltip>
          </CustomButton>
        </div>
      )}
    </>
  );
}
