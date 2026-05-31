import { Form } from '@components/templates/form';
import type {
  IRequest,
  ISaleTeam,
} from '@services/sale/saleTeam/type';

export default function SaleTeamFormPage() {
  return (
    <Form<ISaleTeam, IRequest>
      fieldKey="SaleTeamId"
      caption={"title.saleTeam"}
      url="/api/sale/select/saleTeam"
      listUrl="sale/saleTeamList"
      titleKey="SaleTeamDesc"
      pageIcon="SaleTeamIcon"
    />
  );
}
