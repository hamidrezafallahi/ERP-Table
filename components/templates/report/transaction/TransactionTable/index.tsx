import { useInitializePage } from '@hooks/custom/useInitializePage';
import { SystemEnum } from '@type/enum';

import MainTable from '../../partials/Table';
import useFetchDataForTransaction from '../hook/useFetchDataForTransaction';

function TransactionTable() {
  const { data, isLoading, PageRecordCount, PageNumber } =
    useFetchDataForTransaction();
  const initializePage = useInitializePage();

  const handleRowClick = (record: any) => {
    initializePage({
      config: {
        RepoId: 5010,
        SystemId: SystemEnum.acc,
        url: `acc/voucher?id=${record.VoucherHeaderId}`,
      },
    });
  };
  return (
    <MainTable
      data={data}
      isLoading={isLoading}
      PageRecordCount={PageRecordCount}
      PageNumber={PageNumber}
      handleRowClick={handleRowClick}
    />
  );
}

export default TransactionTable;
