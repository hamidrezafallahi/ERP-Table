"use client";
import { FC, useState } from "react";

import { useAppDispatch, useAppSelector } from "@redux/index";
import { setIsEditing, setStep } from "@slice/account";

import Backward from "../backward";
import Cards from "./cards";

interface Props {
  onFinish: () => void;
}

const SelectPackageStep: FC<Props> = ({ onFinish }) => {
  const packageId = useAppSelector(
    (state) => state.withPersist.account.packageId
  );
  const isEditing = useAppSelector(
    (state) => state.withPersist.account.isEditing
  );
  const dispatch = useAppDispatch();

  const [selectedDuration, setSelectedDuration] = useState("یک ماهه");

  const durations = ["یک ساله", "شش ماهه", "سه ماهه", "یک ماهه"];

  const handleConfirm = () => {
    if (packageId !== null) {
      onFinish();
    } else {
      alert("لطفاً یک پکیج را انتخاب کنید.");
    }
  };

  const handleReturnToInfo = () => {
    dispatch(setIsEditing(0));
    dispatch(setStep(11));
  };

  return (
    <div className="relative flex flex-col justify-between items-center bg-main-white mx-auto px-4 xs:px-6 py-6 border-2 rounded-lg w-full xs:w-fit h-auto xs:!h-fit">
      <Backward />

      <h2 className="px-2 pt-5 pb-3 font-medium text-lg xs:text-2xl text-center">
        لطفاً پکیج مورد نظر خود را بر اساس نیازها و اولویت‌هایتان انتخاب نمایید
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDuration(d)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
              selectedDuration === d
                ? "bg-blue-blue text-main-white border-none"
                : " text-blue-button  border border-blue-button bg-main-white hover:bg-gray-100"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="w-full">
        <Cards selectedDuration={selectedDuration} />
      </div>

      <div className="flex justify-center mt-10 px-2 w-full">
        {isEditing == 5 ? (
          <button
            type="button"
            className="bg-blue-blue px-6 xs:px-28 py-3 rounded-lg w-full xs:w-fit font-medium text-main-white text-sm"
            onClick={handleReturnToInfo}
          >
            ذخیره و برگشت به صفحه اطلاعات
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="bg-blue-blue px-6 xs:px-48 py-3 rounded-lg w-full xs:w-fit font-medium text-main-white text-sm"
          >
            تایید
          </button>
        )}
      </div>
    </div>
  );
};

export default SelectPackageStep;
