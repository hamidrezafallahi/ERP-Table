"use client";
import React, { FC, useEffect, useRef, useState } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { ResendCodeIcon } from "@components/atoms/iconComponents";
import { useAppDispatch, useAppSelector } from "@redux/index";
import { setCode, setVerifyExpireTime } from "@slice/account";

import Backward from "../backward";
import StopWatch from "../stopWatch";

interface Props {
  mobile: string;
  onBack: () => void;
  onNext: () => void;
  reset: number;
}

const VerifyStep: FC<Props> = ({ mobile, onBack, onNext, reset }) => {
  const dispatch = useAppDispatch();
  const code = useAppSelector((state) => state.withPersist.account.code);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const codeArray = code.split("").concat(Array(5).fill("")).slice(0, 5);

  useEffect(() => {
    setCanResend(false);
    dispatch(setCode(""));
    inputRefs.current[0]?.focus();
  }, [reset, dispatch]);

  const toEnglishDigits = (str: string) =>
    str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const handleChange = (val: string, index: number) => {
    const char = toEnglishDigits(val).replace(/\D/g, "").slice(0, 1);
    const newCode = [...codeArray];
    newCode[index] = char;
    dispatch(setCode(newCode.join("")));
    if (char && index < newCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !codeArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 5) {
      onNext();
    } else {
      alert("کد وارد شده کامل نیست");
    }
  };

  const handleResendCode = () => {
    dispatch(setVerifyExpireTime(Date.now() + 2 * 60 * 1000));
    setCanResend(false);
    dispatch(setCode(""));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative bg-main-white rounded-xl w-full max-w-[874px] min-h-[600px] sm:min-h-[640px] md:min-h-[665px]">
        <Backward />
        <div className="absolute inset-0 flex justify-center items-center">
          <form onSubmit={handleSubmit} className="flex flex-col w-1/2 !h-full">
            <h2 className="mt-14 font-bold text-2xl text-center">
              کد تایید را وارد کنید
            </h2>
            <p className="mt-3 font-medium text-xl text-center">
              کد ۵ رقمی به شماره {mobile} ارسال شد
            </p>
            <button
              onClick={onBack}
              type="button"
              className="mt-8 font-bold text-gray-gray95 text-base"
            >
              اصلاح شماره موبایل
            </button>

            <div className="flex justify-center gap-2 lg:gap-6">
              {codeArray.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  ref={(el: any) => (inputRefs.current[idx] = el)}
                  value={val}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="bg-gray-gray5 mt-5 border rounded-xl outline-none w-16 h-16 text-xl text-center"
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {!canResend ? (
              <p className="mt-14 font-normal text-gray-gray8 text-sm text-center">
                <StopWatch onFinish={() => setCanResend(true)} />
              </p>
            ) : (
              <div className="w-full *:text-blue-button">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="flex justify-center items-center gap-1 mt-14 w-full font-medium text-center"
                >
                  <ResendCodeIcon config={{ stroke: "#025099" }} />
                  ارسال مجدد کد پیامکی
                </button>
              </div>
            )}

            <CustomButton
              htmlType="submit"
              className={`mt-6 py-5 rounded-xl w-full font-medium text-white text-sm ${
                code.length === 5 ? "bg-blue-blue" : "bg-blue-blue19"
              }`}
            >
              تایید
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyStep;
