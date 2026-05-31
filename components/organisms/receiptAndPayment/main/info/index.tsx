import { shallowEqual } from 'react-redux';

import { MainInfoCard } from '@components/molecules/mainInfoCard';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import {
  bankInfoConfig,
  cashFundInfoConfig,
  cashInfoConfig,
  documentInfoConfig,
} from '../../config';

export const MainInfoSection = () => {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  return (
    <div
      className={`${
        match
          ? "gap-3 grid grid-cols-5 w-full max-h-[calc(100dvh-330px)] overflow-y-auto"
          : "flex flex-col gap-2 "
      }`}
    >
      <div className="flex flex-col gap-2 col-span-2">
        <div
          className={`bg-gray-gray2 text-gray-gray10 text-sm h-[3.125rem] !w-full rounded-lg flex items-center justify-center p-1  whitespace-nowrap text-ellipsis overflow-hidden`}
        >
          {documentInfoConfig.title}
        </div>
        <div
          className={`${
            match
              ? "gap-3 grid grid-cols-2 h-fit max-h-full"
              : "flex flex-col gap-2"
          }`}
        >
          {documentInfoConfig.actions.map((item, index) => (
            <MainInfoCard
              temp={item}
              key={index}
              titleGroup="receiptsAndPayments"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={`bg-gray-gray2 text-gray-gray10 text-sm h-[3.125rem] !w-full rounded-lg flex items-center justify-center p-1  whitespace-nowrap text-ellipsis overflow-hidden`}
        >
          {bankInfoConfig.title}
        </div>
        <div
          className={`${
            match
              ? "gap-3 grid grid-cols-1 h-fit max-h-full"
              : "flex flex-col gap-2"
          }`}
        >
          {bankInfoConfig.actions.map((item, index) => (
            <MainInfoCard
              temp={item}
              key={index}
              titleGroup="receiptsAndPayments"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={`bg-gray-gray2 text-gray-gray10 text-sm h-[3.125rem] !w-full rounded-lg flex items-center justify-center p-1  whitespace-nowrap text-ellipsis overflow-hidden`}
        >
          {cashInfoConfig.title}
        </div>
        <div
          className={`${
            match
              ? "gap-3 grid grid-cols-1 h-fit max-h-full"
              : "flex flex-col gap-2"
          }`}
        >
          {cashInfoConfig.actions.map((item, index) => (
            <MainInfoCard
              temp={item}
              key={index}
              titleGroup="receiptsAndPayments"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={`bg-gray-gray2 text-gray-gray10 text-sm h-[3.125rem] !w-full rounded-lg flex items-center justify-center p-1 font-medium whitespace-nowrap text-ellipsis overflow-hidden`}
        >
          {cashFundInfoConfig.title}
        </div>
        <div className="gap-3 grid grid-cols-1 h-fit max-h-full">
          {cashFundInfoConfig.actions.map((item, index) => (
            <MainInfoCard
              temp={item}
              key={index}
              titleGroup="receiptsAndPayments"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
