import { useState } from "react";

import { useTranslations } from "next-intl";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { BarcodeIcon } from "@components/atoms/iconComponents";

import VideoCapture from "./VideoCapture/VideoCapture";

export default function SoftScanner() {
  const [openModal, setOpenModal] = useState(false);
  const t = useTranslations();
  const closeModalHandler = () => {
    setOpenModal(false);
  };

  return (
    <>
      <CustomButton
        className="!bg-main-black p-2 w-fit h-10"
        onClick={() => setOpenModal(true)}
      >
        <BarcodeIcon />
      </CustomButton>
      <CustomModal
        contentClassName="!max-h-full  overflow-hidden relative "
        className="[&>div>div]:!bg-main-black [&>div>div>div.ant-modal-header]:!bg-main-black [&>div>div>div.ant-modal-body]:!p-0"
        closeModal={closeModalHandler}
        isModalOpen={openModal}
        title={
          <div className="text-main-white">{t("general.scanBarcode")}</div>
        }
        content={<VideoCapture />}
      />
    </>
  );
}
