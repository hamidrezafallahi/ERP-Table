import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, IVoucher } from "@services/acc/voucher/type";

export default function VoucherListPage() {
    const t = useTranslations();
    return (
        <ViewList<IVoucher, IRequest>
            url="/api/acc/select/voucher"
            deleteUrl="/api/acc/delete/voucher"
            staticKey="VoucherNumber"
            
            rowFieldKey="VoucherHeaderId"
            formUrl="acc/voucher"
            addCaption={t("title.addNew")}
            caption={"title.voucherList"}
            baseRepoId={5010}
            EditField="VoucherNumber"
            isShowChangeStatus={true}
            system={"acc"}
            withoutActivation={true}
        />
    );
}
