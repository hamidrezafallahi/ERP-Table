"use client";
import React, { FC, useState } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { CircleIcon, Eye, EyeClose } from "@components/atoms/iconComponents";
import { useAppDispatch, useAppSelector } from "@redux/index";
import { setIsEditing, setPassword, setStep } from "@slice/account";

import Backward from "../backward";

const validatePasswordRules = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-\\/[\]=+؛،<>~]/.test(password),
  };
};

interface Props {
  onFinish: () => void;
  onBack?: () => void;
}

const CompleteProfileStep: FC<Props> = ({ onFinish, onBack }) => {
  const dispatch = useAppDispatch();
  const [repeatPassword, setRepeatPasswordLocal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const { password, isEditing } = useAppSelector(
    (state) => state.withPersist.account
  );

  const passwordRules = validatePasswordRules(password);

  const validateAndSubmit = () => {
    if (!password || !repeatPassword) {
      alert("لطفاً همه فیلدها را پر کنید");
      return false;
    }
    if (password !== repeatPassword) {
      alert("رمزها با هم تطابق ندارند");
      return false;
    }

    const allValid = Object.values(passwordRules).every(Boolean);
    if (!allValid) {
      alert("رمز عبور شما تمام شروط امنیتی را رعایت نکرده است.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAndSubmit()) onFinish();
  };

  const handleReturnToInfo = () => {
    if (validateAndSubmit()) {
      dispatch(setIsEditing(0));
      dispatch(setStep(11));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative bg-main-white rounded-xl w-full max-w-[874px] min-h-[600px] sm:min-h-[640px] md:min-h-[665px]">
        <Backward />

        {onBack && (
          <button
            onClick={onBack}
            className="top-6 left-6 absolute font-medium text-blue-600 text-sm"
          >
            ←
          </button>
        )}

        <div className="absolute inset-0 flex justify-center items-center px-4 xs:px-0 py-6">
          <form
            onSubmit={handleSubmit}
            className="z-10 relative flex flex-col w-1/2 !h-full"
          >
            <h2 className="mt-14 font-bold text-2xl text-center">
              لطفاً رمز عبور خود را تنظیم و تأیید کنید
            </h2>
            <p className="mt-3 font-medium text-2xl text-center" dir="rtl">
              به نکات امنیتی رمز عبور توجه کنید.
            </p>

            <label
              htmlFor="password"
              className="flex mt-8 w-full text-gray-gray95"
            >
              رمز عبور
            </label>

            <div className="relative mt-2 w-full">
              <input
                id="password"
                className="bg-gray-gray3 p-5 border-none rounded-xl outline-none w-full text-gray-gray95 text-right"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() =>
                  setTimeout(() => setShowPasswordRules(false), 100)
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="top-1/2 left-6 absolute bg-gray-gray3 -translate-y-1/2 transform"
              >
                {showPassword ? <Eye /> : <EyeClose />}
              </button>
            </div>

            {showPasswordRules && (
              <div
                className="top-[200px] -left-[300px] z-50 absolute space-y-6 bg-gray-gray1 shadow-lg p-7 rounded-xl w-[275px] h-[194px] text-sm text-right"
                dir="rtl"
              >
                <div className="flex items-center text-gray-gray7">
                  <span className="ml-2">
                    <CircleIcon
                      config={{
                        fill: passwordRules.minLength ? "#3ED060" : "#D1D5DB",
                      }}
                    />
                  </span>
                  حداقل ۸ کاراکتر طول داشته باشد
                </div>

                <div className="flex items-center text-gray-gray7">
                  <span className="ml-2">
                    <CircleIcon
                      config={{
                        fill: passwordRules.hasNumber ? "#3ED060" : "#D1D5DB",
                      }}
                    />
                  </span>
                  شامل حداقل یک عدد (۰-۹) باشد
                </div>

                <div className="flex items-center text-gray-gray7">
                  <span className="ml-2">
                    <CircleIcon
                      config={{
                        fill: passwordRules.hasSpecialChar
                          ? "#3ED060"
                          : "#D1D5DB",
                      }}
                    />
                  </span>
                  شامل حداقل یک نماد خاص (@، #، $ ...) باشد
                </div>
              </div>
            )}

            <label
              htmlFor="repeat-password"
              className="flex mt-8 w-full text-gray-gray95"
            >
              تکرار رمز عبور
            </label>
            <input
              id="repeat-password"
              className="bg-gray-gray3 mt-2 p-5 border-none rounded-xl outline-none w-full text-gray-gray95 text-right"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPasswordLocal(e.target.value)}
            />

            {isEditing === 4 ? (
              <CustomButton
                htmlType="button"
                className="bg-blue-blue mt-10 py-5 rounded-xl w-full font-medium text-white text-sm"
                onClick={handleReturnToInfo}
              >
                ذخیره و برگشت به صفحه اطلاعات
              </CustomButton>
            ) : (
              <CustomButton
                htmlType="submit"
                className="bg-blue-blue mt-10 py-5 rounded-xl w-full font-medium text-white text-sm"
              >
                ذخیره
              </CustomButton>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileStep;
