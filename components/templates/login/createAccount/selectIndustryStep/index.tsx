"use client";

import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { RootState } from "@redux/index";
import { setIndustryType, setIsEditing, setStep } from "@slice/account";

import Backward from "../backward";

const industryOptions = [
  "پزشکی و درمانی",
  "فناوری و نرم‌افزار",
  "فروشگاهی",
  "تولیدی",
  "بازرگانی",
  "خدماتی",
  "کشاورزی و دامداری",
  "پیمانکاری",
];

interface SelectIndustryStepProps {
  onNext: () => void;
}

const SelectIndustryStep: React.FC<SelectIndustryStepProps> = ({ onNext }) => {
  const dispatch = useDispatch();

  const industryType = useSelector(
    (state: RootState) => state.withPersist.account.industryType
  );
  const isEditing = useSelector(
    (state: RootState) => state.withPersist.account.isEditing
  );

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(
    industryType
  );

  useEffect(() => {
    setSelectedIndustry(industryType);
  }, [industryType]);

  const handleSubmit = () => {
    if (!selectedIndustry) {
      alert("لطفاً یک نوع صنعت را انتخاب کنید.");
      return;
    }
    dispatch(setIndustryType(selectedIndustry));
    onNext();
  };

  const handleReturnToInfo = () => {
    if (selectedIndustry) {
      dispatch(setIndustryType(selectedIndustry));
    }
    dispatch(setIsEditing(0));
    dispatch(setStep(11));
  };

  return (
    <div className="flex justify-center items-center px-4 sm:px-6 min-h-screen">
      <div className="relative bg-main-white py-10 xs:py-0 rounded-xl w-full xs:w-[874px] xs:h-[665px] min-h-[90vh]">
        <Backward />

        <div className="absolute inset-0 flex justify-center items-center px-4 sm:px-8">
          <div
            className="space-y-6 w-full h-full overflow-auto text-center"
            dir="rtl"
          >
            {/* عنوان */}
            <div className="px-2 sm:px-0">
              <h2 className="mt-10 xs:mt-14 font-bold text-2xl">
                نوع صنعت خود را انتخاب کنید
              </h2>
              <p className="mt-2 font-medium text-base xs:text-xl">
                لطفاً صنعتی را که کسب‌وکار شما در آن فعالیت دارد انتخاب کنید تا
                امکانات
              </p>
              <p className="mt-2 font-medium text-base xs:text-xl">
                و تنظیمات متناسب با نیازهای شما نمایش داده شود.
              </p>
            </div>

            {/* گزینه‌ها */}
            <div className="flex flex-wrap justify-center gap-y-4 mx-auto mt-6 xs:mt-10 px-2 w-full xs:w-1/2">
              {industryOptions.map((option) => (
                <label
                  key={option}
                  className="flex justify-end xs:justify-center items-center gap-2 pr-2 w-1/2 text-right cursor-pointer"
                >
                  <span className="my-3 font-medium text-gray-gray85 text-sm xs:text-base">
                    {option}
                  </span>
                  <input
                    type="radio"
                    name="industry"
                    value={option}
                    checked={selectedIndustry === option}
                    onChange={() => setSelectedIndustry(option)}
                    className="accent-main-black"
                  />
                </label>
              ))}
            </div>

            {/* دکمه ذخیره */}
            <div className="flex justify-center mt-10 xs:mt-14 px-4 w-full">
              {isEditing === 6 ? (
                <button
                  type="button"
                  onClick={handleReturnToInfo}
                  className="bg-blue-blue px-6 xs:px-28 py-3 rounded-lg w-full xs:w-fit font-medium text-white text-sm"
                >
                  ذخیره و برگشت به صفحه اطلاعات
                </button>
              ) : (
                <CustomButton
                  htmlType="button"
                  onClick={handleSubmit}
                  className="bg-blue-blue px-6 xs:px-48 py-5 rounded-lg w-full xs:w-fit font-medium text-white text-sm"
                >
                  ذخیره
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectIndustryStep;
