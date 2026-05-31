import React from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { MenuArrowBack } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { prevStep } from '@slice/account';

function Backward() {
  const dispatch = useDispatch();
const { currentStep } = useAppSelector(
  (state) => ({
    currentStep: state.withPersist.account.currentStep,
  }),
  shallowEqual
);

  const handleClick = () => {
    if (currentStep > 1) {
      dispatch(prevStep());
    }
  };

  return (
    <button
      className="top-3 right-3 z-10 absolute cursor-pointer"
      onClick={handleClick}
    >
      <MenuArrowBack config={{ width: 18, height: 18 }} />
    </button>
  );
}

export default Backward;
