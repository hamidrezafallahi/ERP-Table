import React, {
  useCallback,
  useState,
} from 'react';

import {
  message,
  Modal,
} from 'antd';

import { CustomButton } from '@components/atoms/defaultElements';

type DeleteChildrenProps = {
  data: { id: number; name?: string };
  refetchChart: () => Promise<any> | void;
  fetchApi: (args: { url: string; body: any }) => Promise<any>;
  setOpenModalDeleteItem: (open: boolean) => void;
  openModalDeleteItem: boolean;
};

const DeleteChildren: React.FC<DeleteChildrenProps> = ({
  data,
  refetchChart,
  fetchApi,
  setOpenModalDeleteItem,
  openModalDeleteItem,
}) => {
  const { id, name } = data || {};
  const [submitting, setSubmitting] = useState(false);

  const closeModal = useCallback(() => {
    setOpenModalDeleteItem(false);
  }, [setOpenModalDeleteItem]);

  const handleConfirm = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const deleteResult = await fetchApi({
        url: "/api/hr/delete/organizationChart",
        body: { Id: id },
      });

      const ok =
        deleteResult?.data?.Result === "Success" ||
        deleteResult?.Result === "Success";

      if (ok) {
        await Promise.resolve(refetchChart?.());
        message.success(`آیتم${name ? ` «${name}»` : ""} با موفقیت حذف شد.`);
      } else {
        const errMsg =
          deleteResult?.data?.Message ||
          deleteResult?.Message ||
          "آیتم حذف نشد.";
        message.error(errMsg);
      }
    } catch (error: any) {
      message.error(
        error?.message ? `حذف انجام نشد: ${error.message}` : "آیتم حذف نشد."
      );
    } finally {
      setSubmitting(false);
    }
  }, [fetchApi, id, name, refetchChart, submitting, closeModal]);

  const handleCancel = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!submitting) closeModal();
    },
    [submitting, closeModal]
  );

  return (
    <Modal
      open={openModalDeleteItem}
      closable={false}
      onCancel={closeModal}
      footer={[
        <div className="flex items-center gap-4 p-4 pt-0" key="footer">
          <CustomButton
            type="text"
            className="bg-main-black hover:bg-gray-gray2 active:bg-red-500 hover:!border_2 hover:!border-main-black !rounded-md w-full !text-white hover:!text-main-black"
            onClick={handleConfirm}
            loading={submitting as any}
            disabled={submitting}
          >
            {submitting ? "در حال حذف..." : "بله"}
          </CustomButton>

          <CustomButton
            className="bg-gray-gray2 hover:!border_3 hover:!border-main-black !rounded-md w-full text-main-black hover:!text-main-black"
            onClick={handleCancel}
            disabled={submitting}
          >
            خیر
          </CustomButton>
        </div>,
      ]}
    >
      <div className="flex justify-center items-center p-4">
        <p>آیا اطمینان دارید که این اطلاعات حذف شود؟</p>
      </div>
    </Modal>
  );
};

export default DeleteChildren;
