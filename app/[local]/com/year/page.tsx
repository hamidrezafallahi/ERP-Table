import { Form } from '@components/templates/form';
import type {
  IRequest,
  IYear,
} from '@services/com/year/type';

export default function YearFormPage() {
  return (
    <Form<IYear, IRequest>
      caption={"title.year"}
      fieldKey="YearId"
      url="/api/com/select/year"
      listUrl="com/yearList"
      titleKey="YearDesc"
      pageIcon="FinancialYearIcon"
    />
  );
}
