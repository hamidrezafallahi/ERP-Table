import React, { useState } from 'react';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { FormulaIcon } from '@components/atoms/iconComponents';

import FormulaMakerContent from './formulaMakerContent';

const FormulaMaker = ({ disabled }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomButton
        className="!bg-gray-gray3 px-3 py-0 rounded h-9"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <FormulaIcon /> ساخت فرمول{" "}
      </CustomButton>{" "}
      <CustomModal
        isModalOpen={open}
        headerIcon={<FormulaIcon />}
        headerName="ساخت فرمول"
        closeModal={() => setOpen(false)}
        className="rounded-lg !w-[1000px] !max-w-[1000px] lg:h-[500px]"
        content={<FormulaMakerContent onCloseModal={() => setOpen(false)} />}
      />{" "}
    </>
  );
};

export default FormulaMaker;
