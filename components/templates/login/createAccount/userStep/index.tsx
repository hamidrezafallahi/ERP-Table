"use client";
import React, { FC } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppDispatch, useAppSelector } from "@redux/index";
import { setFullName, setIsEditing, setName, setStep } from "@slice/account";

import Backward from "../backward";

interface Props {
  onFinish: () => void;
  onBack?: () => void;
}

const UserStep: FC<Props> = ({ onFinish, onBack }) => {
  const dispatch = useAppDispatch();
  const name = useAppSelector((state) => state.withPersist.account.name);
  const fullName = useAppSelector(
    (state) => state.withPersist.account.fullName
  );
  const isEditing = useAppSelector(
    (state) => state.withPersist.account.isEditing
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fullName) {
      return alert("لطفاً همه فیلدها را پر کنید");
    }
    onFinish();
  };

  const handleReturnToInfo = () => {
    dispatch(setIsEditing(0));
    dispatch(setStep(11));
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative bg-main-white rounded-xl w-full xs:w-[874px] h-full xs:h-[665px]">
        <Backward />
        {onBack && (
          <button
            onClick={onBack}
            className="top-6 left-6 absolute font-medium text-blue-600 text-sm"
          ></button>
        )}
        <div className="absolute inset-0 flex justify-center items-center w-full">
          <form
            onSubmit={handleSubmit}
            className="z-10 flex flex-col w-4/6 !h-full"
          >
            <h2
              className="mt-14 w-full font-bold text-2xl text-center"
              dir="rtl"
            >
              لطفاً نام و نام خانوادگی خود را به صورت کامل وارد کنید.
            </h2>
            <p className="mt-3 font-medium text-2xl text-center" dir="rtl">
              مطابق با اطلاعات شناسنامه‌ای
            </p>
            <div className="mx-auto w-3/4">
              <label
                htmlFor="name"
                className="flex mt-8 w-full text-gray-gray95"
              >
                نام
              </label>
              <div className="relative mt-2 w-full">
                <input
                  id="name"
                  className="bg-gray-gray3 p-5 border-none rounded-xl outline-none w-full text-gray-gray95 text-right"
                  type="text"
                  placeholder="امیر"
                  value={name}
                  onChange={(e) => dispatch(setName(e.target.value))}
                />
              </div>

              <label
                htmlFor="fullName"
                className="flex mt-8 w-full text-gray-gray95"
              >
                نام خانوادگی
              </label>
              <input
                id="fullName"
                className="bg-gray-gray3 mt-2 p-5 border-none rounded-xl outline-none w-full text-gray-gray95 text-right"
                type="text"
                placeholder="اکبری"
                value={fullName}
                onChange={(e) => dispatch(setFullName(e.target.value))}
              />

              {isEditing === 3 ? (
                <button
                  type="button"
                  className="bg-blue-blue mt-10 py-3 rounded-xl w-full font-medium text-white text-sm"
                  onClick={handleReturnToInfo}
                >
                  ذخیره و برگشت به صفحه اطلاعات
                </button>
              ) : (
                <CustomButton
                  htmlType="submit"
                  className="bg-blue-blue mx-auto mt-10 py-5 rounded-xl w-full font-medium text-white text-sm"
                >
                  ذخیره
                </CustomButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserStep;
