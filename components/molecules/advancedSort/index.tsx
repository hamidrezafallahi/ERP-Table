import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  Close,
  SortAscending,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import type { IProps } from './type';

export default function AdvancedSort({
  data,
  onApplySort,
  onReset,
  viewData,
}: IProps) {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const [sorts, setSorts] = useState<
    { id: number; field: string; order: string }[]
  >([]);

  useEffect(() => {
    if (viewData?.OrderInfo?.length > 0) {
      const newSorts = viewData.OrderInfo.map((item) => ({
        id: Date.now(),
        field: item.ColName,
        order: item.Asc ? "asc" : "desc",
      }));

      if (sorts.length !== newSorts.length) {
        setSorts(newSorts);
      }
    }
  }, [viewData?.OrderInfo]);

  const handleFieldChange = (id: number, value: string) => {
    setSorts(
      sorts.map((sort) => (sort.id === id ? { ...sort, field: value } : sort)),
    );
  };

  const handleOrderChange = (id: number, value: "asc" | "desc") => {
    setSorts(
      sorts.map((sort) => (sort.id === id ? { ...sort, order: value } : sort)),
    );
  };

  const handleAddSort = () => {
    setSorts([...sorts, { id: Date.now(), field: "", order: "asc" }]);
  };

  const removeSortHandler = (id: number) => {
    setSorts(sorts.filter((sort) => sort.id !== id));
  };

  const handleApplySorts = () => {
    const appliedSorts = sorts.filter((sort) => sort.field);
    onApplySort(appliedSorts);
  };

  const handleResetSorts = () => {
    setSorts([]);
    onReset();
  };

  return (
    <div className="flex flex-col justify-between px-3 py-3">
      {!match && (
        <div className="flex justify-start">
          <CustomButton
            type="text"
            className="bg-black-black8 px-3 py-1 border hover:border-black-black8 rounded text-white text-xs"
            onClick={handleAddSort}
          >
            {t("general.add")}
          </CustomButton>
        </div>
      )}
      <ul className="hidden-show-scrollBar h-auto lg:!max-h-[25rem] overflow-y-scroll">
        {sorts.map((sort) => (
          <li key={sort.id}>
            <div className="flex justify-between items-center gap-2 py-2 border-b border-dashed">
              <div className="flex-1 w-full">
                <CustomSelect
                  className="!h-10 text-xs"
                  value={sort.field}
                  placeholder={t("general.selectField")}
                  onChange={(value) => handleFieldChange(sort.id, value)}
                  options={data?.map((item) => ({
                    value: item.value,
                    label: item.label,
                    title: item.label,
                  }))}
                />
              </div>
              <CustomButton
                type="text"
                className="bg-gray-gray5 px-3 py-1 border hover:border-black-black8 rounded h-[42px] text-main-black"
                onClick={() =>
                  handleOrderChange(
                    sort.id,
                    sort.order === "asc" ? "desc" : "asc",
                  )
                }
              >
                <CustomTooltip
                  title={
                    sort.order === "asc" ? t("general.desc") : t("general.asc")
                  }
                >
                  <div
                    className={` justify-center transition-all duration-300 flex gap-1 items-center ${
                      sorts.find((item) => item.id === sort.id)?.order === "asc"
                        ? ""
                        : "rotate-180 text-gray-gray2"
                    }`}
                  >
                    <SortAscending
                      config={{
                        width: 25,
                        height: 25,
                      }}
                    />
                  </div>
                </CustomTooltip>
              </CustomButton>

              <CustomButton
                type="text"
                className="bg-gray-gray5 px-3 py-1 border hover:border-black-black8 rounded h-[42px] text-main-black"
                onClick={() => removeSortHandler(sort.id)}
              >
                <CustomTooltip title={t("general.delete")}>
                  <div className="flex justify-center items-center gap-1">
                    <Close config={{ width: 8, height: 8 }} />
                  </div>
                </CustomTooltip>
              </CustomButton>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end lg:justify-between items-center gap-2 bg-white dark:bg-gray-gray12 px-2 pt-4 w-full text-xs">
        {match && (
          <CustomButton
            type="text"
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded text-white text-xs"
            onClick={handleAddSort}
          >
            {t("general.add")}
          </CustomButton>
        )}
        <div className="flex gap-2">
          <CustomButton
            type="text"
            onClick={handleResetSorts}
            className="bg-gray-gray5 px-3 py-1 border hover:border-black-black8 rounded text-main-black text-xs"
          >
            {t("general.clearOrders")}
          </CustomButton>
          <CustomButton
            type="text"
            onClick={handleApplySorts}
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded text-white hover:text-black-black8 text-xs"
          >
            {t("general.applySorts")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
