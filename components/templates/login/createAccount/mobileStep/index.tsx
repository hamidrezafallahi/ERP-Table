"use client";
import React, { useState } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { Captcha } from '@components/atoms/defaultElements/captcha';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setMobile,
  setVerifyExpireTime,
} from '@slice/account';

interface Props {
  onNext: (mobile: string) => void;
}

const MobileStep: React.FC<Props> = ({ onNext }) => {
  const dispatch = useDispatch();
const { mobile } = useAppSelector(
  (state) => ({
    mobile: state.withPersist.account.mobile,

  }),
  shallowEqual
);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaTouched, setCaptchaTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaValid) {
      setCaptchaTouched(true);
      return;
    }

    if (!/^09\d{9}$/.test(mobile)) {
      alert("شماره موبایل معتبر نیست");
      return;
    }

    const expireTime = Date.now() + 2 * 60 * 1000; // 2 دقیقه
    dispatch(setVerifyExpireTime(expireTime));
    onNext(mobile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    // فقط اعداد
    rawValue = rawValue.replace(/[^\d\u06F0-\u06F9]/g, "");

    // تبدیل اعداد فارسی به انگلیسی
    const persianToEnglishDigits = (str: string) =>
      str.replace(/[\u06F0-\u06F9]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 1728)
      );

    let normalized = persianToEnglishDigits(rawValue);
    if (normalized.length > 11) normalized = normalized.slice(0, 11);

    dispatch(setMobile(normalized));
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen">
      <div className="relative bg-main-white rounded-xl w-full max-w-[874px] min-h-[600px] sm:min-h-[640px] md:min-h-[665px]">
        <div className="absolute inset-0 flex justify-center items-center px-4 xs:px-0 py-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-y-6 xs:gap-y-8 w-full max-w-md h-full"
          >
            <h2 className="font-bold text-xl xs:text-2xl text-center">
              خرید اکانت
            </h2>
            <p className="font-medium text-base xs:text-xl text-center">
              برای ادامه شماره موبایل خود را وارد کنید
            </p>

            {/* شماره موبایل */}
            <div className="flex flex-col">
              <label className="flex w-full text-gray-gray95 text-sm xs:text-base">
                شماره موبایل
              </label>
              <input
                value={mobile}
                onChange={handleChange}
                placeholder="09123456789"
                maxLength={11}
                className="!bg-gray-gray5 mt-2 p-4 xs:p-5 border-none rounded-xl outline-none w-full placeholder:!text-gray-gray7 text-sm xs:text-base"
              />
            </div>

            {/* کپچا */}
            <Captcha
              onValidate={(isValid) => {
                setCaptchaValid(isValid);
                if (captchaTouched) setCaptchaTouched(true);
              }}
              invalid={captchaTouched && !captchaValid}
            />

            <p className="text-gray-gray8 text-xs xs:text-sm text-center leading-5">
              استفاده از آرین تک به معنی پذیرش <b>قوانین و مقررات</b> این سرویس
              است
            </p>

            <CustomButton
              htmlType="submit"
              className="bg-blue-blue py-5 rounded-xl w-full font-medium text-white text-sm"
            >
              تایید و دریافت کد
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MobileStep;
