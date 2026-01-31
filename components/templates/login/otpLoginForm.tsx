"use client";
import React, {
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  ResendCodeIcon,
  RightArrow,
} from '@components/atoms/iconComponents';
import { setVerifyExpireTime } from '@slice/container';

import StopWatch from './stopWatch';

interface OtpLoginFormProps {
  mobile: string;
  onSubmit?: (values: { otp: number }) => void;
  onResend?: () => void;
  reset?: number;
  isLoading: boolean;
  otpLength?: number;
  onBack?: () => void;
  error?: string | null;
}

const OtpLoginForm: FC<OtpLoginFormProps> = ({
  mobile,
  onSubmit,
  onResend,
  reset,
  isLoading,
  otpLength = 4,
  onBack,
  error,
}) => {
  const t = useTranslations();
  const [code, setCode] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);
  const dispatch = useDispatch();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const codeArray = (code?.toString().split("") ?? [])
    .concat(Array(otpLength).fill(""))
    .slice(0, otpLength);

  useEffect(() => {
    setCanResend(false);
    setCode(null);
    inputRefs.current[0]?.focus();
  }, [reset]);

  const toEnglishDigits = (str: string) =>
    str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const handleChange = (val: string, index: number) => {
    const englishVal = toEnglishDigits(val);
    const char = englishVal.replace(/\D/g, "").slice(0, 1);
    const newCodeArray = [...codeArray];
    newCodeArray[index] = char;
    const newCodeString = newCodeArray.join("");
    setCode(newCodeString ? Number(newCodeString) : null);

    if (char && index < newCodeArray.length - 1) {
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
    const codeStr = code?.toString() ?? "";
    if (codeStr.length === otpLength) {
      onSubmit?.({ otp: Number(code) });
    } else {
      alert("کد وارد شده کامل نیست");
    }
  };

  const handleResend = () => {
    setCanResend(false);
    setCode(null);
    inputRefs.current[0]?.focus();
    onResend?.();
    dispatch(setVerifyExpireTime(Date.now() + 2 * 60 * 1000));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mx-auto pb-6 w-full max-w-md"
    >
      <p className="font-medium text-gray-gray10 text-base text-center">
        {t("general.otpSent")} {mobile} {t("general.sent")}
      </p>

      <button
        onClick={onBack}
        type="button"
        className="flex justify-center items-center gap-1 font-normal text-blue-blue5 text-xs"
      >
        <RightArrow config={{ stroke: "#086EDC", width: 18, height: 18 }} />
        اصلاح شماره موبایل
      </button>

      <div className="flex justify-center gap-4" dir="ltr">
        {codeArray.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="number"
            value={val}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`bg-gray-gray3 border ${
              error ? "border-red-500" : "border-gray-300 focus:border-black"
            } rounded-xl outline-none w-14 h-14 text-xl text-center hide-arrow`}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
      )}

      {!canResend ? (
        <p className="mt-4 text-gray-gray8 text-sm text-center" dir="rtl">
          <StopWatch onFinish={() => setCanResend(true)} />
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          className="flex justify-center items-center gap-1 mt-4 font-medium text-gray-gray10 text-sm"
        >
          <ResendCodeIcon />
          {t("general.resendCode")}
        </button>
      )}

      <CustomButton
        htmlType="submit"
        loading={isLoading}
        disabled={isLoading || (code?.toString().length ?? 0) !== otpLength}
        className={`w-full h-12 rounded-lg font-medium text-sm transition-all
          ${
            (code?.toString().length ?? 0) === otpLength
              ? "bg-black-black9 text-main-white hover:!bg-white hover:!text-black-black9"
              : "!bg-gray-gray6 !text-main-white cursor-not-allowed border-none"
          }`}
      >
        {t("general.acceptAndContinue")}
      </CustomButton>

      <style jsx>{`
        input::-webkit-inner-spin-button,
        input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </form>
  );
};

export default OtpLoginForm;
