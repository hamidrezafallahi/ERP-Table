import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  IInventoryType,
  IRequest,
} from '@services/inv/inventoryType/type';

export default function InventoryTypeListPage() {
  const t = useTranslations();
  return (
    <ViewList<IInventoryType, IRequest>
      url="api/inv/select/inventory/simple"
      deleteUrl="api/inv/delete/inventory"
      staticKey="InventoryDesc"
      rowFieldKey="InventoryId"
      formUrl="inv/inventoryTypes"
      addCaption={t("general.addNew")}
      caption={"title.inventoryTypeList"}
      baseRepoId={2005}
      pageIcon="InventoryTypeIcon"
    />
  );
}
