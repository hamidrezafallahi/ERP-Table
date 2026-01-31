import React from "react";

import { MenuArrowBack } from "@components/atoms/iconComponents";
import { useAppDispatch, useAppSelector } from "@redux/index";
import { prevStep } from "@slice/account";

function Backward() {
  const dispatch = useAppDispatch();

  const currentStep = useAppSelector(
    (state) => state.withPersist.account.currentStep
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
