import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import {
  CustomButton,
  CustomDropdownButton,
  CustomModal,
} from "@components/atoms/defaultElements";
import {
  AdvancedSortIcon,
  Close,
  SortAscending,
} from "@components/atoms/iconComponents";
import AdvancedSort from "@components/molecules/advancedSort";
import type { IRequestConfig } from "@type/elementType";

interface ISortOptions {
  value: string;
  label: string;
  type?: string;
  valueOption?: IRequestConfig;
}
interface ISortBody {
  ColName: string;
  Asc: boolean;
}

export interface ISortModalProps {
  label?: string;
  sortOptions: ISortOptions[];
  handleChangeSort: (sort: ISortBody[]) => void;
}

function SortModal({ ...props }: ISortModalProps) {
  const { label = null, sortOptions, handleChangeSort } = props;
  const [openModal, setOpenModal] = useState(false);
  const [sort, setSort] = useState([{ ColName: "AccCode", Asc: true }]);
  const t = useTranslations();

  const handleApplySorts = (e) => {
    if (e.length > 0) {
      setSort(
        e.map((item) => ({
          ColName: item.field,
          Asc: item.order == "asc" ? true : false,
        }))
      );
      setOpenModal(false);
    }
  };
  const handleResetSortOrder = () => {
    setSort([{ ColName: "AccCode", Asc: true }]);
    setOpenModal(false);
  };
  useEffect(() => {
    handleChangeSort(sort);
  }, [sort]);
  return (
    <>
      <div className="flex flex-col gap-1 overflow-hidden">
        {label && (
          <div className="text-gray-gray10 dark:text-white text-xs">
            {label}
          </div>
        )}
        <SortButton
          sort={sort}
          setSort={setSort}
          setOpenModal={setOpenModal}
          handleApplySorts={handleApplySorts}
          onResetSortOrder={handleResetSortOrder}
          data={sortOptions}
          sortedCount={sort.length}
        />
      </div>

      <CustomModal
        contentClassName={`w-[520px] h-fit`}
        headerIcon={<SortAscending />}
        headerName={t("general.sortData")}
        isModalOpen={openModal}
        closeModal={() => {
          setOpenModal(false);
        }}
        content={
          <AdvancedSort
            data={sortOptions}
            onReset={handleResetSortOrder}
            onApplySort={handleApplySorts}
          />
        }
      />
    </>
  );
}

export default SortModal;

const SortButton = ({
  sort,
  setSort,
  setOpenModal,
  data,
  onResetSortOrder,
  handleApplySorts,
  sortedCount,
}) => {
  const t = useTranslations();
  const menu = data && [{ value: "", label: t("general.default") }, ...data];

  return (
    <div className="flex justify-between items-center gap-2 bg-gray-gray3 dark:bg-gray-gray10 rounded min-w-[96px] h-9 overflow-hidden">
      {sortedCount > 1 ? (
        <>
          <div
            className="flex items-center bg-gray-gray3 hover:bg-gray-gray5 dark:bg-gray-gray10 p-2 rounded !w-10 h-full cursor-pointer"
            onClick={onResetSortOrder}
          >
            <Close
              config={{
                width: 14,
                height: 14,
              }}
            />
          </div>
          <div className="flex justify-center items-center bg-main-white dark:bg-gray-gray10 p-2 rounded-full !w-6 h-6 text-sm">
            {sortedCount}
          </div>
        </>
      ) : (
        <>
          <CustomButton
            className="flex justify-center items-center bg-gray-gray6 dark:bg-gray-gray10 !border-none hover:!border-none !rounded-none rounded-r !w-10 h-full cursor-pointer"
            disabled={sort.length == 0}
            onClick={() => {
              setSort(
                sort[0].Asc
                  ? [{ ...sort[0], Asc: false }]
                  : [{ ...sort[0], Asc: true }]
              );
            }}
          >
            <span
              className={`${
                sort[0]?.Asc ? "" : "rotate-180"
              } transition-all duration-200`}
            >
              <SortAscending />
            </span>
          </CustomButton>
          <CustomDropdownButton
            placement="bottom"
            className="flex justify-center items-center !w-fit !min-w-16 hover:text-main-black"
            items={menu?.map((item) => ({
              key: item.value,
              label: item.label,
              className: `${
                item.label === t("general.default") &&
                "border-b-2 border-dashed !text-gray-gray7 dark:text-white"
              }`,
            }))}
            onClick={(item) => {
              if (item.key === "") {
                setSort([{ ColName: "AccCode", Asc: true }]);
              } else {
                setSort([{ ColName: item.key, Asc: true }]);
              }
            }}
          >
            <span className="w-full text-[10px] text-gray-gray10 dark:text-white cursor-pointer">
              {sort[0]?.ColName
                ? menu?.find((i) => i.value === sort[0].ColName)?.label
                : t("general.default")}
            </span>
          </CustomDropdownButton>
        </>
      )}
      <span className="ps-1">|</span>
      <span
        className="flex items-center pe-2 h-full cursor-pointer"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        <AdvancedSortIcon />
      </span>
    </div>
  );
};
