import { Badge } from 'antd';
import { shallowEqual } from 'react-redux';

import {
  Close,
  FilterIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import type { IProps } from './type';

export default function Filter({
  onResetFilters,
  openFilterModal,
  filterCount,
}: IProps) {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  return match ? (
    <>
      <span
        className={`${filterCount > 0 ? "cursor-pointer" : "cursor-not-allowed"} flex items-center bg-gray-gray3 hover:bg-gray-gray5 dark:bg-gray-gray9 p-3 h-full text-black-black95 dark:text-gray-gray2`}
        onClick={() => {
          if (filterCount > 0) {
            onResetFilters();
          } else {
            null;
          }
        }}
      >
        <Close
          config={{
            width: 12,
            height: 12,
          }}
        />
      </span>

      <div
        onClick={openFilterModal}
        className="flex justify-center items-center w-full hover:text-black-black8 cursor-pointer"
      >
        {filterCount > 0 && (
          <span className="bg-main-white dark:bg-gray-gray10 me-1 p-0 rounded-full w-5 h-5 dark:!text-white text-sm text-center">
            {filterCount}
          </span>
        )}

        <FilterIcon
          config={{
            width: 18,
            height: 18,
          }}
        />
      </div>
    </>
  ) : (
    <>
      <div
        onClick={openFilterModal}
        className="flex justify-center items-center w-full hover:text-black-black8 cursor-pointer"
      >
        <Badge offset={[-2, 2]} dot={filterCount > 0 ? true : false}>
          <FilterIcon
            config={{
              width: 20,
              height: 20,
            }}
          />
        </Badge>
      </div>
    </>
  );
}
