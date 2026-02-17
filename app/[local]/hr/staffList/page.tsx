import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, IStaff } from "@services/hr/staff/type";

export default function StaffList() {
  const t = useTranslations();

  return (
    <ViewList<IStaff, IRequest>
      url="/api/hr/select/staff"
      deleteUrl="/api/hr/delete/staff"
      staticKey="StaffId"
      rowFieldKey="StaffId"
      formUrl="hr/staff"
      addCaption={t("general.addNew")}
      caption={"title.staffList"}
      baseRepoId={9001}
      pageIcon="StaffIcon"
      EditField="StaffCode"
      additionalFieldKey="PersonId"
    />
  );
}
