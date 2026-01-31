import { useState } from 'react';

import { TourProps } from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTour,
} from '@components/atoms/defaultElements';
import { GuidanceIcon } from '@components/atoms/iconComponents';

export default function GuidanceButton({
  tourStepItems,
  minimize,
}: {
  tourStepItems: TourProps['steps'];
  minimize:boolean
}) {
  const [guidanceTourIsOpen, setGuidanceTourIsOpen] = useState(false);
const t = useTranslations()
  return (
    <>
      <CustomButton
        type='text'
        className="flex justify-start gap-1 p-0 h-9 text-gray-gray85 hover:text-main-black dark:text-white text-sm transition-all duration-300"
        onClick={() => setGuidanceTourIsOpen(true)}
      >
        <GuidanceIcon /> <div className={`${minimize && "  hidden"}`}>{t("general.guide")}</div>
      </CustomButton>
      {/* <Tour open={guidanceTourIsOpen} onClose={() => setGuidanceTourIsOpen(false)} steps={tourStepItems} /> */}




      <CustomTour
        tourStepItems={tourStepItems}
        open={guidanceTourIsOpen}
        onClose={() => setGuidanceTourIsOpen(false)}
      />
    </>
  );
}
