import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import {
  Edit,
  Info,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';
import { IRequestConfig } from '@type/elementType';
import { SystemEnum } from '@type/enum';

export default function CustomerCard({ ...props }) {
  const { setOpenModal } = props;
  const { customer } = useAppSelector((state) => {
    const customer = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name == "customer")?.value;
    return { customer };
  }, shallowEqual);
  const dispatch = useDispatch();
  const t = useTranslations();
  const handleChangeCustomer = () => {
    setOpenModal(true);
  };
  const handleSetSaleType = (typeId: number) => {
    dispatch(setPageData({ name: "saleTypeId", value: typeId }));
  };
  const salesTypeConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/type4SelectOption",
    endpoint: "api/sale/select/type4SelectOption",
    repoViewId: 130044,
    addButton: {
      url: "sale/saleType",
      RepoId: 1006,
      SystemId: SystemEnum.sale,
    },
  };
  return (
    <div className="flex flex-col gap-2 w-2/5">
      <DynamicSelect
        className="!bg-transparent border border-gray-gray10 dark:border-black-black0 rounded-lg"
        dynamicValue={salesTypeConfig}
        onChange={handleSetSaleType}
        placeholder={t("general.saleType")}
      />
      <CustomButton
        type="text"
        className="flex lg:flex-col justify-between lg:justify-center items-center gap-1 px-0 py-3 !border border-gray-gray10 dark:border-black-black0 rounded-lg w-full lg:h-[88px]"
        onClick={handleChangeCustomer}
      >
        <div className="hidden lg:block font-bold text-gray-gray95 dark:text-white text-xl text-center">
          {customer?.Person.FullName}
        </div>
        <div className="flex items-center gap-1 font-medium text-gray-gray10 dark:text-white text-sm text-center">
          {customer?.CustomerCode}

          <Info />
        </div>
        <div className="hidden lg:block text-gray-gray10 dark:text-white text-lg">
          مانده بدهی
        </div>
        <div className="lg:hidden text-gray-gray10 dark:text-white text-lg">
          <Edit />
        </div>
      </CustomButton>
    </div>
  );
}
