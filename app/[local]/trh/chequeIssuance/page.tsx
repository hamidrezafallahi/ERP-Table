import FormGenerator from '@components/organisms/formGenerator';
import ChequeIssuance
  from '@components/organisms/receiptAndPayment/cheque/issuance';
import type {
  IChequeIssuance,
  IRequest,
} from '@services/trh/chequeIssuance/type';

export default function ChequeIssuanceFormPage() {

  return (
    <FormGenerator<IChequeIssuance, IRequest>
      fieldKey="CheckIssuanceHeaderId"
      caption={"title.chequeIssuance"}
      url="api/trh/select/check/issuance"
      listUrl="trh/chequeIssuanceList"
      titleKey="VoucherNumber"
      pageIcon="ChequeIssuanceIcon"
      addUrl="api/trh/insert/check/issuance"
      updateUrl="api/trh/update/check/issuance"
      tableTitle="اقلام"
      Component={ChequeIssuance}
      fromIndexedDb
      headerGetUrl="api/trh/select/check/issuance"
      detailGetUrl="api/trh/select/checkDetail/issuance"
     
    />
  );
}
