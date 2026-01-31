import { useState } from 'react';

import { Divider } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@redux/index';

import Container from '../container';
import Customer from '../Customer';
import DebouncedQuickSearch from '../debouncedQuickSearch';
import GoodsCategoriesSteps from '../goodsCategoriesSteps';
import Orders from '../orders';

export default function DesktopView() {
  const [showNoData, setShowNoData] = useState(false);
  const { customer } = useAppSelector((state) => {
const customer = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "customer")?.value;
    return {
      customer,
    };
  }, shallowEqual);
  const t = useTranslations();
  console.log(customer);
  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex gap-3 w-full h-full">
        <div className="flex flex-col gap-2 w-full !h-full">
          {!customer && (
            <div className="z-10 absolute inset-0 flex justify-center items-center backdrop-blur-md">
              {t("general.customerRequired")}
            </div>
          )}
          <div className="w-full lg:h-20">
            <GoodsCategoriesSteps setShowNoData={setShowNoData} />
          </div>
          <DebouncedQuickSearch />
          <div className="flex w-full h-[calc(100dvh-530px)] overflow-y-auto">
            <Container setShowNoData={setShowNoData} showNoData={showNoData} />
          </div>
        </div>
        <Divider type="vertical" className="m-0 p-0 h-full" />
        <div className="hidden lg:flex flex-col gap-3 min-w-[40%] !h-full">
          <Customer />
          <Orders />
        </div>
      </div>
      {/* <Additions /> */}
      {/* <div className="flex gap-2">
        <div className="flex flex-col gap-2 border-b w-3/5 h-30">
          <GoodsCategoriesSteps setShowNoData={setShowNoData} />
          <DebouncedQuickSearch />
        </div>
        <Divider type="horizontal" className="bg-gray-gray10 m-0 p-0" /> 
        <div className="w-2/5">
          <Customer />
        </div>
      </div>
      <div className="flex gap-2 h-[calc(100dvh-530px)]">
        <div className="w-3/5">
          <Container setShowNoData={setShowNoData} showNoData={showNoData} />
        </div>
        <div className="w-2/5">
          <Orders />
        </div>
      </div> */}
    </div>
  );
}

// const { data: defaultValue } = useGetData<IElk[]>({
//   url: "/api/sale/select/customer/elk",
//   body: {
//     CustomerId: detailRequiredValue,
//     Price: totalDetailAmount,
//   },
//   skip: !!id || !detailRequiredValue,
// });
