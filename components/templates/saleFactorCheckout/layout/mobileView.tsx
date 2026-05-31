import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import {
  MenuSquareIcon,
  MoreVertical,
  New,
  RightArrow,
} from '@components/atoms/iconComponents';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import Container from '../container';
import Customer from '../Customer';
import DebouncedQuickSearch from '../debouncedQuickSearch';
import GoodsCategoriesSteps from '../goodsCategoriesSteps';
import Orders from '../orders';
import SoftScanner from '../softScanner';
import Summary from '../summary';

export default function MobileView() {
  const { customer } = useAppSelector((state) => {
    const customer = state.withPersist.pages?.find(
      (item) => item.isActive
    )?.pageData?.find(i=>i.name ==="customer")?.value;
  

    return { customer };
  }, shallowEqual);
  const [openModal, setOpenModal] = useState(false);

  const { navigateBack } = useNavigatePage();
  const t = useTranslations();
  const closeModalHandler = () => {
    setOpenModal(false);
  };
  const handleNavigate = () => {
    console.log("navigate button ");
    navigateBack();
  };

  return (
    <div className="flex gap-3 w-full h-full">
      <div className="lg:flex flex-col gap-3 w-full lg:min-w-[509px] !h-full">
        <div className="flex justify-between py-5 border-gray-gray6 border-b-[0.5px] w-full lg:h-12">
          <button
            className="flex gap-2 p-0 font-bold text-gray-gray10 text-sm"
            onClick={handleNavigate}
          >
            <RightArrow />
            {t("title.retailSalesInvoice")}
          </button>
          <div className="flex items-center gap-3">
            <MenuSquareIcon />
            <MoreVertical />
          </div>
        </div>
        <div className="flex gap-2 w-full lg:h-32">
          <Customer />
        </div>
        <div className="relative">
          {!customer && (
            <div className="z-50 absolute inset-0 flex justify-center items-center backdrop-blur-md">
              {t("general.customerRequired")}
            </div>
          )}
          <div>
            <div className="flex gap-2 py-2">
              <CustomButton
                className="!p-0 border-dashed w-full h-10"
                onClick={() => {
                  setOpenModal(true);
                }}
              >
                <New />
                افزودن کالا
              </CustomButton>
              <SoftScanner />
            </div>
            <div
              className={`flex flex-col  justify-end  rounded-lg h-[calc(100dvh-160px)]`}
            >
              <>
                <Orders />
                <Summary />
              </>
            </div>
          </div>
        </div>
      </div>
      <CustomModal
        closeModal={closeModalHandler}
        isModalOpen={openModal}
        title={<div className="text-gray-gray10">{t("title.goodList")}</div>}
        content={<GoodsList closeModalHandler={closeModalHandler} />}
      />
    </div>
  );
}

function GoodsList({ ...props }) {
  const [showNoData, setShowNoData] = useState(false);
  return (
    <div className={`flex flex-col gap-2 border-b w-full !h-full`}>
      <DebouncedQuickSearch {...props} />

      <div className="w-full lg:h-20">
        <GoodsCategoriesSteps setShowNoData={setShowNoData} />
      </div>
      <div className="flex w-full h-[calc(100%-148px)]">
        <Container
          {...props}
          setShowNoData={setShowNoData}
          showNoData={showNoData}
        />
      </div>
    </div>
  );
}
