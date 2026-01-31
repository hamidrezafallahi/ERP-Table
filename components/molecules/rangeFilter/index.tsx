import { Mask } from 'react-persian-range-picker';
import { useDispatch } from 'react-redux';

import { Close } from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { filterTypeDateEnum } from '@services/base/type';
import { setViewData } from '@slice/pages';

import type { IProps } from './type';

export const RangeFilter = ({ onResetFilters, rangeFilterKey }: IProps) => {
  const dispatch = useDispatch();
  const activePage = useAppSelector((state) =>
    state.withPersist.pages.find((page) => page.isActive)
  );

  const fromRangeFilterValue = activePage?.viewData?.Filters?.FilterInfo?.find(
    (item) => item.FilterType === filterTypeDateEnum.GreaterThanOrEqual
  )?.Value;
  const toRangeFilterValue = activePage?.viewData?.Filters?.FilterInfo?.find(
    (item) => item.FilterType === filterTypeDateEnum.LessThanOrEqual
  )?.Value;
  const handleChange = (val: number | string, name: "from" | "to") => {
    if (name === "from") {
      dispatch(
        setViewData({
          ...activePage?.viewData,
          Filters: {
            ...activePage?.viewData?.Filters,
            FilterInfo: [
              ...(activePage?.viewData?.Filters?.FilterInfo ?? []),
              {
                ColName: rangeFilterKey,
                FilterType: filterTypeDateEnum.GreaterThanOrEqual,
                Value: val,
              },
            ],
          },
        })
      );
    } else {
      dispatch(
        setViewData({
          ...activePage?.viewData,
          Filters: {
            ...activePage?.viewData?.Filters,
            FilterInfo: [
              ...(activePage?.viewData?.Filters?.FilterInfo ?? []),
              {
                ColName: rangeFilterKey,
                FilterType: filterTypeDateEnum.LessThanOrEqual,
                Value: val,
              },
            ],
          },
        })
      );
    }
  };
  return (
    <div className="flex items-center gap-1 bg-gray-gray3 dark:bg-gray-gray9 rounded">
      <span
        className="flex items-center bg-gray-gray6 hover:bg-gray-gray7 dark:bg-gray-gray9 p-3 rounded h-full text-black-black95 dark:text-gray-gray2 cursor-pointer"
        onClick={onResetFilters}
      >
        <Close
          config={{
            width: 12,
            height: 12,
          }}
        />
      </span>

      <div className="flex justify-center items-center gap-1 px-2 w-full hover:text-black-black8">
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-gray-gray9 text-xs whitespace-nowrap">
            بازه زمانی از
          </span>
          <Mask
            MaskFontStyle={{ color: "#6BA8EA", fontSize: 12 }}
            defaultValue={new Date(fromRangeFilterValue).valueOf()}
            onMaskChange={(e: string| number ) => handleChange(e, "from")}
            isTodaySelectPreset={false}
            Style={{ width: 75 }}
          />
        </div>
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-gray-gray9 text-xs whitespace-nowrap">تا</span>
          <Mask
            MaskFontStyle={{ color: "#6BA8EA", fontSize: 12 }}
            defaultValue={new Date(toRangeFilterValue).valueOf()}
            onMaskChange={(e: number | string) => handleChange(e, "to")}
            isTodaySelectPreset={false}
            Style={{ width: 75 }}
          />
        </div>
      </div>
    </div>
  );
};
