import { MainInfoCard } from '@components/molecules/inventoryVoucher';

export const MainInfoSection = ({ data }) => {
  return (
    <div
      // className={`lg:gap-3 lg:grid lg:grid-cols-6 lg:w-full lg:overflow-y-auto flex flex-col gap-2`}
      className={`lg:gap-3 lg:grid lg:grid-cols-4 lg:w-full lg:overflow-y-auto flex flex-col gap-2`}
    >
      {data.map((item, idx) => (
        <div className="flex flex-col gap-2 col-span-2" key={idx}>
          <div
            className={`bg-gray-gray2 text-gray-gray10 text-sm !h-9 !w-full rounded-lg flex items-center justify-center p-1  whitespace-nowrap text-ellipsis overflow-hidden`}
          >
            {item.title}
          </div>
          <div
            className={`lg:gap-3 lg:grid lg:grid-cols-2 lg:h-fit lg:max-h-full flex flex-col gap-2`}
          >
            {item?.list?.map((item, index) => (
              <MainInfoCard temp={item} key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
