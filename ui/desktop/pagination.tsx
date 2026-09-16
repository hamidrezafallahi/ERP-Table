// ui/pagination.tsx

import { Pagination } from '../primitives';
import {
  formatLocaleNumber,
  useDirection,
  useLocale,
  useNumberingSystem,
  useTranslations,
} from '../host';
import { LeftChevron, RightChevron } from '../primitives';

import { UITableController } from '../../infrastructure/ui/UITableController';

interface Props {
  controller: UITableController;
  tableKey: string;
  store: string;
}

export default function ERPTablePagination({
  controller,
  tableKey
}: Props) {
  const table = controller.getViewState();
  const locale = useLocale();
  const numberingSystem = useNumberingSystem();
  const direction = useDirection();
  const t = useTranslations();
  if (!table) return null;
  const { page, pageSize, totalPages, totalRows } = table.pagination;
  const handlePageChange = (e: number) => {
    controller.dispatch({ type: "CHANGE_PAGE", page: e });
  };
  const handlePageSizeChange = (_page: number, pageSize: number) => {
    controller.dispatch({ type: "CHANGE_PAGE_SIZE", pageSize: pageSize });
  };
  const fmt = (n: number) =>
    formatLocaleNumber(n, { locale, numberingSystem, useGrouping: true });

  return (
    <div className="flex justify-center items-center gap-3 bg-main-white p-2 border-gray-gray5 border-t w-full">
      <Pagination
        current={page}
        prevIcon={direction === "rtl" ? <RightChevron /> : <LeftChevron />}
        nextIcon={direction === "rtl" ? <LeftChevron /> : <RightChevron />}
        jumpNextIcon={<span>...</span>}
        jumpPrevIcon={<span>...</span>}
        pageSize={pageSize}
        total={totalRows}
        showSizeChanger={true}
        onShowSizeChange={handlePageSizeChange}
        pageSizeOptions={["9", "10", "20", "50", "100"]}
        // hideOnSinglePage
        locale={{ items_per_page: "" }}
        showTotal={(total: number) => (
          <div className="flex items-center gap-1 h-full font-light text-gray-gray10 text-xs">
            <span>{fmt(total)}</span>
            <span>{t('general.rowsIn')}</span>
            <span>{fmt(totalPages)}</span>
            <span>{t('general.page')}</span>
          </div>
        )}
        onChange={handlePageChange}
        direction={direction}
      />
    </div>
  );
}
