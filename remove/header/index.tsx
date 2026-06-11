import { MainHeaderCard } from '@components/molecules/receiptAndPayment';

import { mainCardConfig } from '../../components/organisms/receiptAndPayment/config';

export const MainHeaderSection = () => {
  return (
    <div
      className={`lg:gap-3 lg:grid lg:grid-cols-4 lg:w-full flex flex-col gap-2`}
    >
      {mainCardConfig.map((item, index) => (
        <div key={index} className="col-span-1">
          <MainHeaderCard item={item} />
        </div>
      ))}
    </div>
  );
};
