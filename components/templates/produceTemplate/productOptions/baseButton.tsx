import React, {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  PinIcon2,
  UnPinIcon2,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';

function BaseButton() {
  const [state, setState] = useState(true);
  const [hover, setHover] = useState(false);
  const { selectedGoodId, selectedVersionId, baseSPlanId } = useAppSelector(
    (state) => ({
      selectedGoodId: state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedGoodId")?.value,
      selectedVersionId: state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedVersionId")?.value,
      baseSPlanId: state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "baseSPlanId")?.value,
    }),
    shallowEqual
  );
  const [itemMutate] = useCUDDataMutation();
  const t = useTranslations();

  const handleClick = async () => {
    const res = await itemMutate({
      url: "api/prd/update/sPlan4IsBase",
      body: {
        GoodId: selectedGoodId,
        SPlanId: selectedVersionId,
      },
    }).unwrap();
    if (res.Result === "Success") {
    }
    setState(!state);
  };
  const handleEnter = () => {
    setHover(true);
  };
  const handleLeave = () => {
    setHover(false);
  };
  useEffect(() => {
    if (selectedVersionId && baseSPlanId) {
      setState(selectedVersionId == baseSPlanId ? false : true);
    }
  }, [selectedVersionId, baseSPlanId]);
  return (
    <CustomButton
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      type="text"
      className={`!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded h-9 relative overflow-hidden   ${
        state
          ? hover
            ? "w-32 rtl:w-36"
            : "w-10"
          : hover
          ? "w-36 rtl:w-36"
          : "w-10"
      } transition-all duration-300`}
      onClick={handleClick}
    >
      {state ? (
        <div className="absolute flex gap-3 px-[10px] end-0">
          {t("general.setAsBase")}
          <PinIcon2 />
        </div>
      ) : (
        <div className="absolute flex gap-3 px-[10px] end-0">
          {t("general.returnAsBase")}
          <UnPinIcon2 />
        </div>
      )}
    </CustomButton>
  );
}

export default BaseButton;
