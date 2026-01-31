import React from 'react';

import { useTranslations } from 'next-intl';

const CallAdmin: React.FC = () => {
  const t = useTranslations();
  return (
    <>
      <div className="pt-7 pb-4 font-normal text-gray-gray10 text-sm text-center">
        <p>دسترسی شما به دلیل پایان اعتبار پکیج غیرفعال شده است.</p>
        <p>
          لطفاً برای تمدید پکیج و ادامه‌ی استفاده از سیستم، با کاربر اصلی یا
        </p>
        <p>ادمین شرکت خود تماس بگیرید.</p>
      </div>
    </>
  );
};

export default CallAdmin;
