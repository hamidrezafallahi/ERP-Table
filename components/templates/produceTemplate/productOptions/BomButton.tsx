import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { BomIcon } from '@components/atoms/iconComponents';

function BomButton() {
  const [state, setState] = useState(true);
  const [hover, setHover] = useState(false);
  const t = useTranslations();
  const handleClick = () => {
    setState(!state);
  };
  const handleEnter = () => {
    setHover(true);
  };
  const handleLeave = () => {
    setHover(false);
  };
  return (
    <CustomButton
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      type="text"
      className={`!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded h-9 relative overflow-hidden   ${
        hover ? "w-32" : "w-10"
      } transition-all duration-300`}
      onClick={handleClick}
    >
      <div className="absolute flex gap-3 px-[10px] end-0">
        {t("general.ShowBOM")}
        <BomIcon />
      </div>
    </CustomButton>
  );
}

export default BomButton;
