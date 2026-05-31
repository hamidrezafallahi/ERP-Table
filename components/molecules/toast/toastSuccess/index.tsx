"use client";

import { shallowEqual } from 'react-redux';

import { CheckAll } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

export default function ToastSuccess({ message, title = null }) {
  const { match, lang } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    return { match, lang };
  }, shallowEqual);

  return match ? (
    <div className={`font-en rtl:font-IRANSans relative p-2 `}>
      <div className="-z-10 absolute -inset-10 bg-state-success2"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CheckAll config={{ width: 24, height: 24 }} />
          <div className="font-medium text-state-success1 text-base">
            {title}
          </div>
        </div>
        <div className="ps-4 w-[300px] font-normal text-gray-gray9 text-sm">
          {message}
        </div>
      </div>
    </div>
  ) : (
    <div className={`  font-en rtl:font-IRANSans relative`}>
      <div className="-z-10 absolute -inset-9 bg-state-success2"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CheckAll config={{ width: 24, height: 24 }} />
          <div className="w-[calc(100dvw-110px)] font-normal text-[12px] text-state-success1">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
