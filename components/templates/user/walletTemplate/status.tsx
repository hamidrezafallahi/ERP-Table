import React from 'react';

import { TxStatus } from './type';

const Status: React.FC<{ status: TxStatus }> = ({ status }) => (
  <span
    className={
      "inline-flex items-center sm:gap-1  sm:px-2.5 sm:py-1 text-xs " +
      (status ? " text-gray-gray10 dark:text-gray-gray4" : "  text-redBadge ")
    }
  >
    <span className={"h-1.5 w-1.5 rounded-full "} />
    {status ? "موفق" : "ناموفق"}
  </span>
);

export default Status;
