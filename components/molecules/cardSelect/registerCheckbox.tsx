"use client";

import { useDispatch } from 'react-redux';

import {
  setPackageId,
  setPackageType,
} from '@slice/account';

interface IProps {
  Active: boolean;
  itemId: number | null;
  itemTitle: string;
}
function RegisterCheckbox({ ...props }: IProps) {
  const { Active, itemId, itemTitle } = props;
  const dispatch = useDispatch();

  const handleSelectLicense = (packageId: number | null) => {
    dispatch(setPackageId(packageId));
    dispatch(setPackageType(itemTitle));
  };
  return (
    <label className="top-7 right-4 z-10 absolute flex items-center gap-2">
      <input
        type="checkbox"
        checked={Active}
        onChange={() => {
          const newSelected = Active ? null : itemId;

          handleSelectLicense(newSelected);
        }}
        className={`
                  ml-3 w-5 h-5 rounded-md border  border-gray-gray8
                  appearance-none cursor-pointer 
                  bg-gray-gray55 checked:bg-main-black
                  relative transition-all duration-200
                  checked:before:content-['✔']
                  checked:before:absolute
                  checked:before:inset-0
                  checked:before:flex
                  checked:before:items-center
                  checked:before:justify-center
                  checked:before:text-white
                  checked:before:text-md
                  `}
      />
    </label>
  );
}

export default RegisterCheckbox;
