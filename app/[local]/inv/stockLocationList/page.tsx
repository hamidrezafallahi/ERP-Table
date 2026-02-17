import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  IRequest,
  IStockLocation,
} from '@services/inv/stockLocation/type';

export default function StockLocationList() {
  const t = useTranslations();

  return (
    <ViewList<IStockLocation, IRequest>
      url="/api/inv/select/stockLocation"
      deleteUrl="/api/inv/delete/stockLocation"
      staticKey="StockLocationId"
      rowFieldKey="StockLocationId"
      formUrl="inv/stockLocation"
      addCaption={t("general.addNew")}
      caption={"title.stockLocationList"}
      baseRepoId={2006}
      pageIcon="StockIcon"
      EditField="stockLocationDesc"
    />
  );
}
