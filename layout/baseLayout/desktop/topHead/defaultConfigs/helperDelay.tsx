import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import {
  Tour,
  TourProps,
} from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { IDefaultConfigs } from '@slice/config/type';
import { getCookie } from '@utils/cookie';
import { showErrorToast } from '@utils/toast';

import { IRequiredStep } from './type';

interface IProps {
  tourOpen: boolean;
  setTourOpen: Dispatch<SetStateAction<boolean>>;
  requiredSteps: IRequiredStep[];
  conditionalCloseFunction: boolean;
}

function HelperDelay({ ...props }: IProps) {
  const { tourOpen, setTourOpen, requiredSteps, conditionalCloseFunction } =
    props;
  const { CashierId, CurrencyId, LanguageId, PlaceId, YearId } = useAppSelector(
    (state) => {
      const CashierId = state.withPersist.config.defaultConfigs?.CashierId;
      const CurrencyId = state.withPersist.config.defaultConfigs?.CurrencyId;
      const LanguageId = state.withPersist.config.defaultConfigs?.LanguageId;
      const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
      const YearId = state.withPersist.config.defaultConfigs?.YearId;
      return { CashierId, CurrencyId, LanguageId, PlaceId, YearId };
    },
    shallowEqual,
  );

  const [show, setShow] = useState(false);
  const t = useTranslations();

  const globals: IDefaultConfigs = {
    CurrencyId,
    CashierId,
    PlaceId,
    YearId,
    LanguageId,
  };

  const tourSteps: TourProps["steps"] = requiredSteps?.map((step, index) => {
    return {
      title: step.title,
      description: step.description,
      target: step.target,
      nextButtonProps: {
        disabled:
          !globals["PlaceId" as keyof IDefaultConfigs] &&
          step.id !== "initialSettings",
        className:
          "!bg-gray-gray5 text-xs hover:!bg-gray-gray7 !border-1 border-gray-gray7 text-gray-gray7 px-4  ",
        children:
          index === requiredSteps.length - 1
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
        index === requiredSteps.length - 1
          ? () => {
              if (conditionalCloseFunction) {
                const resultCondition = conditionalCloseFunction;
                if (resultCondition) {
                  setTourOpen(false);
                } else {
                  showErrorToast(
                    t("guide.descMessage"),
                    t("guide.requiredMessage"),
                  );
                }
              } else {
                setTourOpen(false);
              }
            }
          : undefined,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 300); // تاخیر 2 ثانیه‌ای

    return () => clearTimeout(timer); // پاکسازی تایمر
  }, []);
  return (
    <Tour
      {...props}
      open={tourOpen && show}
      onClose={() => setTourOpen(false)}
      steps={tourSteps}
      arrow
      animated
      rootClassName="dark:bg-main-white dark:bg-opacity-60 rounded-lg "
      placement={
        Number(getCookie("LanguageId")?.split("/")[1]) == 2 ? "right" : "left"
      }
      gap={{ offset: 6, radius: 16 }}
    />
  );
}

export default HelperDelay;
