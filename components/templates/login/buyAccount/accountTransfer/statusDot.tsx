import React from 'react';

import { shallowEqual } from 'react-redux';

import { TickIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

export default function StatusDot({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {


  const { lang } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
    }),
    shallowEqual
  );




  return (
    <div className="flex sm:flex-row flex-col-reverse justify-center items-center gap-1 sm:gap-2">
      <div
        className={[
          "grid sm:h-6 sm:w-6  w-5 h-5 place-items-center rounded-full border",
          active
            ? "border-gray-gray13 text-gray-900 bg-white dark:bg-main-black dark:text-gray-gray1 "
            : "border-gray-gray8 text-gray-300 bg-gray-gray55 ",
        ].join(" ")}
      >
        {active && <TickIcon />}
      </div>
      <span
        className={`sm:text-sm  text-3xs xs:text-2xs   text-nowrap absolute sm:-top-6   -top-4 justify-center ${
          active
            ? "text-gray-800 dark:text-white "
            : "text-gray-500 dark:text-gray-gray4"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
