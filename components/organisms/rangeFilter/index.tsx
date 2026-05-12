import {
  type AdditionalElementType,
  type IDate,
  RangePicker,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import FinancialYear from '@components/molecules/financialYear';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

interface IProps {
  handlerChange?: (
    type: "FinancialYear" | "Date",
    date: IDate,
    yearIds: number[]
  ) => void;
  handleSubmit?: (
    type: "FinancialYear" | "Date",
    date: IDate,
    yearIds: number[]
  ) => void;
  handleReject?: () => void;
}

function RangeFilter({ handleSubmit, handleReject }: IProps) {
  const { viewData, lang } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages.find((item) => item.isActive)?.viewData,
      lang: state.withPersist.config.lang,
    }),
    shallowEqual
  );
  //array state
  const dispatch = useDispatch();

  const resetDate = () => {
    if (handleReject) {
      handleReject();
    }
  };

  const HandleSubmitDate = (type, date) => {
    if (type == "range") {
      if (date.date.from !== null && date.date.to !== null) {
        dispatch(
          setViewData({
            ...viewData,
            FromDate: date.date.from,
            ToDate: date.date.to,
            YearIds: [],
          })
        );
        if (handleSubmit) {
          handleSubmit(type, date.date, []);
        }
      }
    } else if (type == "financial") {
      dispatch(
        setViewData({
          ...viewData,
          FromDate: null,
          ToDate: null,
          YearIds: date.customData?.yearIds,
        })
      );
      if (handleSubmit) {
        handleSubmit(type, { from: null, to: null }, date.yearIds);
      }
    }
  };
  const template: AdditionalElementType[] = [
    {
      key: "financial",
      label: "سال مالی",
      content: (
        <FinancialYear
          value={viewData?.YearIds ?? []}
          onChange={(e) => {
            HandleSubmitDate("financial", e);
          }}
        />
      ),
    },
  ];

  return (
    <RangePicker
      // showComparison={false}
      exportType='IsoString'
      calendarType={lang == "fa" ? "jalali" : "gregorian"}
      handleSubmit={({ type, Data }) => {
        HandleSubmitDate(type, Data);
      }}
      handleReject={resetDate}
      additionalElement={template}
    />
  );
}

export default RangeFilter;
