import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';
import { levelUrl } from '@utils/core';

function ReportSidebar() {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const t = useTranslations();
  const dispatch = useDispatch();

  const handleButtonClick = (Level) => {
    dispatch(
      setViewData({
        ...activePage?.viewData,
        url: levelUrl(Level),
        Level,
        steps: [],
        selectedItems: [],
        FilterIds: [],
        TreeView: false,
      })
    );
  };
  const buttonList = Array.from({ length: 13 }, (_, index) => {
    const level = index;
    return {
      name: t(`report.sidebar.level${level + 1}`),
      url: levelUrl(index),
      level,
    };
  });
  return (
    <div className="flex flex-col gap-3 p-3 w-full h-full overflow-y-auto">
      {buttonList.map(({ name, level }) => {
        if (
          activePage?.viewData?.AccessLevel &&
          level < activePage?.viewData?.AccessLevel
        ) {
          return (
            <CustomButton
              type="text"
              ghost
              className={`w-full h-10 text-center text-xs bg-gray-gray2 dark:bg-gray-gray95  dark:text-white border-gray-gray5 active:bg-gray-gray9 active:font-medium ${
                activePage?.viewData?.Level === level &&
                "!bg-gray-gray7 !font-medium text-main-black border border-gray-gray7"
              }`}
              key={name}
              onClick={() => handleButtonClick(level)}
            >
              {name}
            </CustomButton>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

export default ReportSidebar;
