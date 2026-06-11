import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type {
  IRequest,
  IYear,
} from '@services/com/year/type';

interface IProps {
  onChange?: (value: any) => void;
  value: number[];
}
interface ICheckbox {
  YearId: number;
  isChecked: boolean;
  YearDesc: string;
}

function FinancialYear({ ...props }: IProps) {
  const { onChange, value } = props;
  const [isCompareActive, setIsCompareActive] = useState(false);
  const [yearIds, setYearIds] = useState(value);
  const [compareYearIds, setCompareYearIds] = useState([]);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const [internalYearIds, setInternalYearIds] = useState([]);
  const t = useTranslations();
  const { data } = useGetData<IYear[], IRequest>({
    url: "/api/com/Select/YearSelect4Default",
    body: {
      RepoViewId: 30061,
      ShowMode: 10,
    },
  });
  const checkboxValues: ICheckbox[] = useMemo(() => {
    return (
      data?.Data?.map((item) =>
        match
          ? {
              YearId: item.YearId,
              isChecked: yearIds?.includes(item.YearId),
              YearDesc: item.YearDesc,
            }
          : {
              YearId: item.YearId,
              isChecked: internalYearIds?.includes(item.YearId),
              YearDesc: item.YearDesc,
            }
      ) || []
    );
  }, [data, yearIds, internalYearIds]);

  const handleCheckbox = (event, item) => {
    const { checked } = event.target;
    setIsCompareActive(true);
    if (match) {
      setYearIds(() =>
        yearIds?.length > 0
          ? checked
            ? [...yearIds, item.YearId]
            : yearIds.filter((yearId) => yearId !== item.YearId)
          : checked
          ? [item.YearId]
          : []
      );
    } else {
      setInternalYearIds(() =>
        checked
          ? [...internalYearIds, item.YearId]
          : internalYearIds.filter((yearId) => yearId !== item.YearId)
      );
    }
  };

  const handleSetYearIds = () => {
    setYearIds(internalYearIds);
    setIsCompareActive(true);
  };
  useEffect(() => {
    if (yearIds?.length > 0) {
      onChange?.({ yearIds, compareYearIds });
    }
  }, [yearIds, compareYearIds]);

  return (
    <>
      <div className="w-full h-[calc(100dvh-180px)] overflow-y-auto">
        <div className="w-full overflow-y-auto">
          <div className="gap-3 gap-x-2 grid grid-cols-2 h-full">
            {checkboxValues?.map(({ YearId, isChecked, YearDesc }) => (
              <div
                key={YearId}
                className="flex justify-between items-center gap-4 bg-gray-gray15 px-4 rounded w-full !h-8 whitespace-nowrap"
              >
                <CustomCheckbox
                  onChange={(event) => handleCheckbox(event, { YearId })}
                  checked={isChecked}
                />
                <div className="w-full overflow-hidden text-gray-gray8 text-xs text-ellipsis">
                  {YearDesc}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:hidden right-0 bottom-0 left-0 z-20 fixed bg-main-white px-4 py-3">
          <CustomButton
            className="bg-main-black w-full text-main-white"
            onClick={handleSetYearIds}
          >
            {t("general.apply")}
          </CustomButton>
        </div>
        {/* <FinancialYearCompare
          data={data}
          setCompareYearIds={setCompareYearIds}
          compareYearIds={compareYearIds}
          isCompareActive={isCompareActive}
        /> */}
      </div>
    </>
  );
}

export default FinancialYear;

// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';

// import { useTranslations } from 'next-intl';
// import { shallowEqual } from 'react-redux';

// import { CustomButton } from '@components/atoms/defaultElements';
// import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
// import { useAppSelector } from '@hooks/custom/useAppSelector';
// import { useGetData } from '@services/base';
// import type {
//   IRequest,
//   IYear,
// } from '@services/com/year/type';

// interface IProps {
//   handleChange: (value: any) => void;
//   value: number[];
// }
// interface ICheckbox {
//   YearId: number;
//   isChecked: boolean;
//   YearDesc: string;
// }

// function FinancialYear({ ...props }: IProps) {
//   const { handleChange, value } = props;
//   const [isCompareActive, setIsCompareActive] = useState(false);
//   const [yearIds, setYearIds] = useState(value);
//   const [compareYearIds, setCompareYearIds] = useState([]);
//   const { match } = useAppSelector((state) => {
//     const match = state.withPersist.config.initMatch;
//     return { match };
//   },shallowEqual);
//   const [internalYearIds, setInternalYearIds] = useState([]);
//   const t = useTranslations();
//   const { data } = useGetData<IYear[], IRequest>({
//     url: "/api/com/Select/YearSelect4Default",
//     body: {
//       RepoViewId: 30061,
//       ShowMode: 10,
//     },
//   });
//   const checkboxValues: ICheckbox[] = useMemo(() => {
//     return (
//       data?.Data?.map((item) =>
//         match
//           ? {
//               YearId: item.YearId,
//               isChecked: yearIds?.includes(item.YearId),
//               YearDesc: item.YearDesc,
//             }
//           : {
//               YearId: item.YearId,
//               isChecked: internalYearIds?.includes(item.YearId),
//               YearDesc: item.YearDesc,
//             }
//       ) || []
//     );
//   }, [data, yearIds, internalYearIds]);

//   const handleCheckbox = (event, item) => {
//     const { checked } = event.target;
//     setIsCompareActive(true);
//     if (match) {
//       setYearIds(() =>
//         yearIds?.length > 0
//           ? checked
//             ? [...yearIds, item.YearId]
//             : yearIds.filter((yearId) => yearId !== item.YearId)
//           : checked
//           ? [item.YearId]
//           : []
//       );
//     } else {
//       setInternalYearIds(() =>
//         checked
//           ? [...internalYearIds, item.YearId]
//           : internalYearIds.filter((yearId) => yearId !== item.YearId)
//       );
//     }
//   };

//   const handleSetYearIds = () => {
//     setYearIds(internalYearIds);
//     setIsCompareActive(true);
//   };
//   useEffect(() => {
//     if (yearIds?.length > 0) {
//       handleChange?.({ yearIds, compareYearIds });
//     }
//   }, [yearIds, compareYearIds]);

//   return (
//     <>
//       <div className="w-full h-[calc(100dvh-180px)] overflow-y-auto">
//         <div className="w-full overflow-y-auto">
//           <div className="gap-3 gap-x-2 grid grid-cols-2 h-full">
//             {checkboxValues?.map(({ YearId, isChecked, YearDesc }) => (
//               <div
//                 key={YearId}
//                 className="flex justify-between items-center gap-4 bg-gray-gray15 px-4 rounded w-full !h-8 whitespace-nowrap"
//               >
//                 <CustomCheckbox
//                   onChange={(event) => handleCheckbox(event, { YearId })}
//                   checked={isChecked}
//                 />
//                 <div className="w-full overflow-hidden text-gray-gray8 text-xs text-ellipsis">
//                   {YearDesc}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="lg:hidden right-0 bottom-0 left-0 z-20 fixed bg-main-white px-4 py-3">
//           <CustomButton
//             className="bg-main-black w-full text-main-white"
//             onClick={handleSetYearIds}
//           >
//             {t("general.apply")}
//           </CustomButton>
//         </div>
//         {/* <FinancialYearCompare
//           data={data}
//           setCompareYearIds={setCompareYearIds}
//           compareYearIds={compareYearIds}
//           isCompareActive={isCompareActive}
//         /> */}
//       </div>
//     </>
//   );
// }

// export default FinancialYear;
