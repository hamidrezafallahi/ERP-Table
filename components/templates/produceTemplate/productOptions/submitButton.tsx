import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  RectangleTickIcon,
  UTurnIcon,
} from '@components/atoms/iconComponents';

function SubmitButton() {
  const [state, setState] = useState(true);
  const [hover, setHover] = useState(false);
  const t = useTranslations()
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
      className={`!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded h-9 relative overflow-hidden   ${state? hover ? "w-32":"w-10":hover ?"w-52 rtl:w-48":"w-10"} transition-all duration-300`}
      onClick={handleClick}
    >


         
      {state ? <div className='absolute flex gap-3 px-[10px] end-0'>
      {t("general.finalSubmit")}
      <RectangleTickIcon/>
      </div>
      
      
      
      : <div className='absolute flex gap-3 px-[10px] end-0'>
      {t("general.returnFromFinalSubmit")}
      <UTurnIcon/>
      </div>}

    </CustomButton>
  );
}

export default SubmitButton;
 
