"use client";
import { useState } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  DeleteNodeIcon,
  MenuArrowBack,
  PlusIcon,
  WonderIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setCompanies,
  setIsEditing,
  setStep,
} from '@slice/account';

import Backward from '../backward';

const CompanyStep = ({ onNext }: { onNext: () => void }) => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");

const { companies, maxCompanies, isEditing } = useAppSelector(
  (state) => ({
    companies: state.withPersist.account.companies,
    maxCompanies: state.withPersist.account.maxCompanies,
    isEditing: state.withPersist.account.isEditing,
  }),
  shallowEqual
);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (companies.includes(trimmed)) return;
    if (companies.length >= maxCompanies) return;

    dispatch(setCompanies([...companies, trimmed]));
    setInputValue("");
  };

  const handleChange = (value: string, index: number) => {
    const updated = [...companies];
    updated[index] = value;
    dispatch(setCompanies(updated));
  };

  const handleDelete = (index: number) => {
    const updated = [...companies];
    updated.splice(index, 1);
    dispatch(setCompanies(updated));
  };

  const handleConfirm = () => {
    onNext();
  };

  const handleReturnToInfo = () => {
    dispatch(setIsEditing(0));
    dispatch(setStep(11));
  };

  return (
    <div
      className="flex justify-center items-start sm:items-center min-h-screen text-right"
      dir="rtl"
    >
      <div className="relative bg-main-white rounded-xl w-full xs:w-[874px] h-full xs:h-[665px]">
        <Backward />

        <div className="absolute inset-0 flex justify-center items-start">
          <div className="mx-auto mt-4 sm:mt-8 py-6 sm:py-8 rounded-2xl w-full max-w-xl text-center">
            <h2 className="mb-2 font-bold text-xl sm:text-2xl">
              مدیریت شرکت‌ها
            </h2>

            <div className="mb-4 px-1 sm:px-0 font-medium text-main-black text-base sm:text-xl">
              برای مدیریت ساختار سازمانی، شرکت‌های خود را اینجا تعریف کنید.
              <div className="flex justify-center items-center mt-2 sm:mt-3">
                <WonderIcon />
                <span className="mr-1 font-normal text-gray-gray85 text-xs sm:text-sm">
                  با توجه به پکیج فعلی شما، امکان تعریف حداکثر{" "}
                  <span className="text-main-black text-base">
                    {maxCompanies} شرکت
                  </span>{" "}
                  وجود دارد.
                </span>
              </div>
            </div>

            <div className="mx-auto w-3/4">
              <div className="space-y-3 mt-4 sm:mt-12 mb-4 xs:max-h-[180px] overflow-y-auto text-right">
                {companies.map((name, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleChange(e.target.value, index)}
                      className="bg-gray-gray3 p-3 sm:p-4 border-none rounded-lg sm:rounded-xl outline-none w-full text-gray-gray85 text-sm sm:text-base text-right"
                    />
                    <button
                      className="p-1 sm:p-2"
                      onClick={() => handleDelete(index)}
                    >
                      <DeleteNodeIcon
                        config={{ width: 33, height: 33, stroke: "#585858" }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {companies.length < maxCompanies && (
                <div className="flex items-center gap-2 sm:gap-3 mt-4">
                  <input
                    type="text"
                    placeholder="نام شرکت"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-gray-gray3 p-3 sm:p-4 border-none rounded-lg sm:rounded-xl outline-none w-full text-sm sm:text-base text-right"
                  />
                  <button
                    onClick={handleAdd}
                    className="flex justify-center items-center p-1 sm:p-2"
                  >
                    <PlusIcon
                      config={{ width: 35, height: 34, stroke: "#025099" }}
                    />
                  </button>
                </div>
              )}

              {isEditing === 7 ? (
                <button
                  type="button"
                  className="bg-blue-blue6 mt-6 sm:mt-10 py-3 rounded-lg sm:rounded-xl w-full font-medium text-white text-sm"
                  onClick={handleReturnToInfo}
                >
                  ذخیره و برگشت به صفحه اطلاعات
                </button>
              ) : (
                <div className="flex xs:flex-row flex-col gap-2 sm:gap-3 mt-6 w-full">
                  <CustomButton
                    onClick={onNext}
                    className="py-5 border border-blue-button w-full sm:w-2/6 font-medium text-blue-button text-sm"
                  >
                    رد کردن
                  </CustomButton>

                  <CustomButton
                    onClick={handleConfirm}
                    className="flex justify-center items-center gap-2 !bg-blue-blue mr-2 py-5 w-full sm:w-4/6 font-medium !text-main-white text-sm"
                    disabled={companies.length === 0}
                  >
                    ذخیره و مرحله بعد
                    <MenuArrowBack
                      config={{ stroke: "#FFFFFF", width: 21, height: 20 }}
                    />
                  </CustomButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStep;
