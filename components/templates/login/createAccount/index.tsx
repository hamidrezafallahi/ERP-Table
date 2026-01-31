"use client";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@redux/index";
import {
  nextStep,
  prevStep,
  setMobile,
  setVerifyExpireTime,
} from "@slice/account";

import CompanyStep from "./companyStep";
import CompleteProfileStep from "./completeProfileStep";
import CurrencyStep from "./currencyStep";
import FinalReviewStep from "./finalReviewStep";
import FundStep from "./fundStep";
import MobileStep from "./mobileStep";
import SelectIndustryStep from "./selectIndustryStep";
import SelectPackageStep from "./selectPackageStep";
import UserStep from "./userStep";
import VerifyStep from "./verifyStep";
import WarehouseStep from "./warehouseStep";

const CreateAccount = () => {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(
    (state) => state.withPersist.account.currentStep
  );
  const mobile = useAppSelector((state) => state.withPersist.account.mobile);

  const [verifyReset, setVerifyReset] = useState(0);

  const goToVerifyStep = () => {
    setVerifyReset(Math.random()); // برای reset کردن VerifyStep
    dispatch(nextStep());
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MobileStep
            onNext={(mobileNumber) => {
              dispatch(setMobile(mobileNumber));
              dispatch(setVerifyExpireTime(Date.now() + 2 * 60 * 1000));
              goToVerifyStep();
            }}
          />
        );

      case 2:
        return (
          <VerifyStep
            reset={verifyReset}
            mobile={mobile}
            onBack={() => dispatch(prevStep())}
            onNext={() => dispatch(nextStep())}
          />
        );

      case 3:
        return <UserStep onFinish={() => dispatch(nextStep())} />;

      case 4:
        return <CompleteProfileStep onFinish={() => dispatch(nextStep())} />;

      case 5:
        return (
          <div className="bg-gray-gray3 pt-5 w-full h-[100dvh]">
            <SelectPackageStep onFinish={() => dispatch(nextStep())} />
          </div>
        );

      case 6:
        return <SelectIndustryStep onNext={() => dispatch(nextStep())} />;

      case 7:
        return <CompanyStep onNext={() => dispatch(nextStep())} />;

      case 8:
        return <WarehouseStep onNext={() => dispatch(nextStep())} />;

      case 9:
        return <FundStep onNext={() => dispatch(nextStep())} />;

      case 10:
        return <CurrencyStep onNext={() => dispatch(nextStep())} />;

      case 11:
        return (
          <div className="bg-gray-gray3 pt-5 w-full h-[100dvh]">
            <FinalReviewStep onSave={() => alert("ثبت‌نام کامل شد!")} />
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full h-full">{renderStep()}</div>;
};

export default CreateAccount;
