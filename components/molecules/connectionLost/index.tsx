import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { ConnectionLostIcon } from "@components/atoms/iconComponents";
import { useNetworkStatus } from "@hooks/custom";

export default function ConnectionLost() {
  const t = useTranslations();
  const isOnline = useNetworkStatus();

  const [errorConnectionOpen, setErrorConnectionOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      setErrorConnectionOpen(true);
    } else {
      setErrorConnectionOpen(false);
    }
  }, [isOnline]);
  return (
    <CustomModal
      closeModal={null}
      centered
      isModalOpen={errorConnectionOpen}
      disableTitle
      content={
        <div
          className={`w-fit h-fit justify-center items-center lg:px-12 lg:py-8 flex flex-col gap-4 bg-white rounded`}
        >
          <div className="flex justify-center items-center">
            <ConnectionLostIcon />
          </div>
          <div className="flex flex-col justify-center items-center gap-9">
            <div className="flex flex-col justify-center items-center gap-3 text-gray-gray85">
              <span>{t("general.networkConnectionDescI")}</span>
              <span>{t("general.networkConnectionDescII")}</span>
            </div>
            <CustomButton
              type="text"
              className={`flex flex-1 lg:flex-none justify-center items-center bg-black-black8 !hover:bg-white px-6 py-1 border hover:border-black-black8 rounded h-full text-white`}
              onClick={() => null}
            >
              {t("general.tryAgain")}
            </CustomButton>
          </div>
        </div>
      }
      closable={false}
    />
  );
}
