import React, {
  useCallback,
  useState,
} from 'react';

import {
  FormInstance,
  Modal,
} from 'antd';

import { CustomButton } from '@components/atoms/defaultElements';

type DeleteChildrenProps = {
  setIsModalOpen: (open: boolean) => void;

  isModalOpen: boolean;
  form: FormInstance;
};

const ModalForGoodQc: React.FC<DeleteChildrenProps> = ({
  setIsModalOpen,
  form,
  isModalOpen,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleCancel = useCallback(() => {
    if (submitting) return;

    form?.setFieldValue("HasInputQuality", true);

    closeModal();
  }, [form, submitting, closeModal]);

  const handleConfirm = useCallback(() => {
    if (submitting) return;
    form?.setFieldValue("HasInputQuality", false);
    closeModal();
  }, [form, submitting, closeModal]);

  return (
    <Modal
      open={isModalOpen}
      closable={false}
      title={null}
      footer={null}
      width={627}
      height={346}
      onCancel={closeModal}
      centered
    >
      <div className="flex flex-col justify-between items-center w-full h-full">
        <div className="p-16 w-full font-medium *:text-gray-gray9 text-lg text-center">
          <p>
            {" "}
            اگر این گزینه را غیرفعال کنید، تمام تغییرات و عملیات‌هایی که در
          </p>
          <p>
            {" "}
            <span className="text-main-black text-xl">
              طرح کنترلی کالا
            </span>{" "}
            اعمال کرده‌اید پاک شده و قابل بازیابی نخواهند
          </p>
          <p> بود. لطفاً قبل از ادامه از تصمیم خود اطمینان حاصل کنید.</p>
        </div>

        <div className="flex justify-center gap-4 p-4 pt-0 pb-8 w-full">
          <CustomButton
            className="bg-gray-gray2 mb-6 border-2 border-main-black !rounded-md w-[175px] h-[40px] text-main-black"
            onClick={handleCancel}
            disabled={submitting}
          >
            انصراف
          </CustomButton>

          <CustomButton
            type="text"
            className="bg-main-black hover:bg-gray-gray2 mb-6 hover:!border-main-black !rounded-md w-[175px] h-[40px] !text-white hover:!text-main-black"
            onClick={handleConfirm}
            loading={submitting as any}
            disabled={submitting}
          >
            {submitting ? "در حال حذف..." : "تایید و ادامه"}
          </CustomButton>
        </div>
      </div>
    </Modal>
  );
};

export default ModalForGoodQc;
