import {
  Tour,
  TourProps,
} from 'antd';
import { useTranslations } from 'next-intl';

import { showErrorToast } from '@utils/core';

import type { IProps } from './type';

export const CustomTour = ({...props
 
}: IProps) => {
  const { open,
  onClose,
  tourStepItems,
  conditionalCloseFunction,}=props
  const t = useTranslations();
  const tourSteps: TourProps["steps"] = tourStepItems.map((step, index) => ({
    title: step.title,
    description: step.description,
    target:step.target,
    nextButtonProps: {
      className:
        "!bg-gray-gray5 text-xs hover:!bg-gray-gray7 !border-1 border-gray-gray7 text-gray-gray7 px-4",
      children:
        index === tourStepItems.length - 1
          ? t("general.finish")
          : t("general.next"),
    },
    prevButtonProps:
      index > 0
        ? {
            children: t("general.prev"),
            className:
              "!bg-gray-gray5 text-xs hover:!bg-gray-gray7 !border-1 !border-gray-gray7 text-gray-gray7 px-4 hover:!text-white",
          }
        : undefined,

    onFinish:
      index === tourStepItems.length - 1
        ? () => {
            if (conditionalCloseFunction) {
              const resultCondition = conditionalCloseFunction();
              if (resultCondition) {
                onClose();
              } else {
                showErrorToast(
                  t("guide.descMessage"),
                  t("guide.requiredMessage")
                );
              }
            } else {
              onClose();
            }
          }
        : undefined,
  }));

  return (
    <Tour
    {...props}
      open={open}
      onClose={onClose}
      steps={tourSteps}
      arrow
      animated
      gap={{ offset: 6, radius: 16 }}
    />
  );
};
