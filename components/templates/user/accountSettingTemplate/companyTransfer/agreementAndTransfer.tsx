import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import { Checkbox } from 'antd';
import { useTranslations } from 'next-intl';

export default function AgreementAndTransfer({
  onTransfer,
  transferring,
  agree,
  setAgree,
}: {
  onTransfer: () => void;
  transferring: boolean;
  agree: boolean;
  setAgree: Dispatch<SetStateAction<boolean>>;
}) {
  const t = useTranslations();
  return (
    <div>
      <label className="flex items-center gap-2 mt-4 text-gray-gray10 dark:text-white text-sm">
        <Checkbox
          checked={agree}
          type="checkbox"
          className="border-gray-300 rounded w-4 h-4"
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span> {t("general.iHaveReadAndAgreeToTheAboveProvisions")}</span>
      </label>
      <div className="flex justify-end items-center gap-3 mt-4">
        <button
          onClick={onTransfer}
          disabled={!agree || transferring}
          className="bg-main-black disabled:bg-gray-gray55 rounded w-16 h-9 sm:h-10 text-white disabled:text-gray-gray11 text-xs disabled:cursor-not-allowed"
        >
          {transferring ? "در حال انتقال…" : "انتقال"}
        </button>
      </div>
    </div>
  );
}
