import React from 'react';

import { FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';
import { removePage } from '@slice/pages';

function InventoryTypesToolBar({form}:{form:FormInstance}) {
  const { activePage } = useAppSelector(
    (state) => ({
     activePage:
        state.withPersist.pages?.find((p) => p.isActive),
    }),
    shallowEqual
  );
const dispatch=useDispatch()
  const t = useTranslations();
    const params = useSearchParams();
  const id = params.get("id");
  const [setInventoryTypes] = useCUDDataMutation();
  const { navigateBack } = useNavigatePage();
  const handleSubmitForm = async () => {
    await form.validateFields();
    const pageData = activePage?.pageData ||[]
    const inventoryDesc = pageData?.find(
      (i) => i.name === "InventoryDesc"
    )?.value;
    const StockIds =
      pageData
        ?.find((i) => i.name === "StockIds")
        ?.value?.filter((t) => t.value)
        ?.map((x) => x.name) || [];
    const VoucherTypeIds =
      pageData
        ?.find((i) => i.name === "VoucherTypeIds")
        ?.value?.filter((t) => t.value)
        ?.map((x) => x.name) || [];
    const rate = pageData?.find((i) => i.name === "Rate")?.value;

    const res: any = await setInventoryTypes({
      url: "api/inv/insert/inventory",
      body: {
        InventoryDesc: inventoryDesc,
        StockIds: StockIds,
        VoucherTypeIds: VoucherTypeIds,
        Rate: rate,
       InventoryId: id??undefined,
      }
    }).unwrap();

    if (res.Result == "Success") {
      dispatch(removePage(activePage.pageId));
      navigateBack()
    }
  };

  return (
    <div className="-top-14 absolute flex gap-4 -end-3">
      <CloseButton />
      <ExpandedButton />
      <CustomButton
        type="text"
        className="bg-main-black dark:bg-main-white dark:border-main-white h-9 text-main-white dark:text-main-black"
        onClick={handleSubmitForm}
      >
        {t("general.save")}
      </CustomButton>
    </div>
  );
}

export default InventoryTypesToolBar;
