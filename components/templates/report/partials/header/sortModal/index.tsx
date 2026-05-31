import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { CustomModal } from '@components/atoms/defaultElements';
import { SortAscending } from '@components/atoms/iconComponents';
import AdvancedSort from '@components/molecules/advancedSort';
import type { IRequestConfig } from '@type/elementType';

import SortButton from './sortButton';

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
        })),
      );
      setOpenModal(false);
    }
  };
  const handleResetSortOrder = () => {
    setSort([{ ColName: "AccCode", Asc: true }]);
    setOpenModal(false);
  };
 
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
          setSort={(e)=>{handleChangeSort(sort)}}
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
        destroyOnHidden
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


