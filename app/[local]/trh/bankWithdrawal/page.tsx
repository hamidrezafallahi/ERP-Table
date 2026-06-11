import AdvancedBankWithdrawal
  from '@components/organisms/receiptAndPayment/bank/withdrawal';
import { MasterForm } from '@components/templates/form';
import type {
  IBankWithdrawal,
  IRequest,
} from '@services/trh/bankWithdrawal/type';

export default function BankWithdrawalFormPage() {
  return (
    <MasterForm<IBankWithdrawal, IRequest>
      caption={"title.bankWithdrawal"}
      detailFieldKey="VoucherDetailId"
      headerFieldKey="VoucherHeaderId"
      listUrl="trh/withdrawalList"
      pageIcon="BankWithdrawalIcon"
      addUrl="api/trh/bankStatement/advanced/Withdrawal"
      updateUrl="api/trh/update/bankStatement/advanced/withdrawal"
      tableTitle="اقلام"
      Component={AdvancedBankWithdrawal}
      headerGetUrl="api/trh/select/bankStatement/withdrawal"
      DefaultHeaderRepoViewId={3020}
      DefaultDetailRepoViewId={3020}
      storeName="receiptAndPayment"
      detailGetUrl="api/trh/select/checkDetail/issuance"
    />
  );
}
