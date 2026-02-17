import Form from "@components/templates/form";
import type { IRequest, IStaff } from "@services/hr/staff/type";

export default function StaffFormPage() {
  return (
    <Form<IStaff, IRequest>
      fieldKey="StaffId"
      caption={"title.staff"}
      url="/api/hr/select/staff"
      listUrl="hr/staffList"
      titleKey={["FullName","StaffCode"]}
      pageIcon="StaffIcon"
    />
  );
}
