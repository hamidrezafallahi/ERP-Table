import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import {
  EditPencil,
  PlusIcon,
  SaleListIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';

import CustomerCard from './customerCard';
import CustomerList from './CustomerList';
import Report from './report';

export default function Customer() {
  const [openModal, setOpenModal] = useState(false);
  const t = useTranslations();

  const { customer, match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const customer = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "customer")?.value;
    return { customer, match };
  }, shallowEqual);

  return (
    <>
      {customer ? (
        <div className="flex gap-2 w-full">
          <CustomerCard setOpenModal={setOpenModal} />
          <Report />
        </div>
      ) : (
        <div className="z-20 flex justify-center items-center w-full h-full xxl:h-40">
          <CustomButton
            type={!match ? "text" : "default"}
            className={`p-0 ${
              !match
                ? "w-full flex justify-between  border-none"
                : "w-[90px] h-[90px] border hover:border-main-black "
            }`}
            style={!match && { background: "none" }}
            onClick={() => setOpenModal(true)}
          >
            {!match ? (
              <div className="flex justify-between items-center py-3 !w-full">
                <div className="flex items-center">
                  <p className="font-medium text-gray-gray10 text-sm">
                    مشتری خود را انتخاب کنید
                  </p>
                </div>
                <EditPencil />
              </div>
            ) : (
              <PlusIcon />
            )}
          </CustomButton>
        </div>
      )}
      <CustomModal
        zIndex={10001}
        contentClassName="w-full h-auto"
        closeModal={() => setOpenModal(false)}
        isModalOpen={openModal}
        content={<CustomerList setOpenModal={setOpenModal} />}
        title={
          <div className="flex items-center gap-2">
            <SaleListIcon />
            <span>{t("general.clientList")}</span>
          </div>
        }
      />
    </>
  );
}
