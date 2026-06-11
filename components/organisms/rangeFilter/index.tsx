import moment from 'moment';
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
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setViewData } from '@slice/pages';

interface IProps {
  handlerChange?: (
    type: "FinancialYear" | "Date",
    date: IDate,
    yearIds: number[],
  ) => void;
  handleSubmit?: (
    type: "FinancialYear" | "Date",
    date: IDate,
    yearIds: number[],
  ) => void;
  handleReject?: () => void;
  label?: boolean;
}

function RangeFilter({ handleSubmit, handleReject,label }: IProps) {
  const { viewData, lang } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)?.viewData,
      lang: state.withPersist.config.lang,
    }),
    shallowEqual,
  );
  //array state
  const dispatch = useDispatch();

  const resetDate = () => {
    if (handleReject) {
      handleReject();
    }
  };

  const HandleSubmitDate = (type, date) => {
    console.log(type, date)
    if (type !== "financial") {
      if (date.date.from !== null && date.date.to !== null) {
        dispatch(
          setViewData({
            ...viewData,
            StartDate:
              lang == "fa"
                ? moment(date.from)
                    .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                    .replace(/[۰-۹]/g, (d) =>
                      "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                    )
                : moment.utc(date.from).toISOString(),
            EndDate:
              lang == "fa"
                ? moment(date.to)
                    .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
                    .replace(/[۰-۹]/g, (d) =>
                      "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
                    )
                : moment.utc(date.to).toISOString(),
            YearIds: [],
          }),
        );
        if (handleSubmit) {
          handleSubmit(type, date.date, []);
        }
      }
    } else if (type == "financial") {
      dispatch(
        setViewData({
          ...viewData,
          StartDate: null,
          EndDate: null,
          YearIds: date.customData?.yearIds,
        }),
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
          // onChange={(e) => {
          //   HandleSubmitDate("financial", e);
          // }}
        />
      ),
    },
  ];

  type RangePickerData = {
    date: {
      from: string | Date | null;
      to: string | Date | null;
    };
  };
  return (
    <RangePicker
      showComparison={false}
      label={label}
      exportType="IsoString"
      calendarType={lang == "fa" ? "jalali" : "gregorian"}
      onSubmit={({
        type,
        Data,
      }: {
        type: string;
        Data: RangePickerData;
      }) => {
        HandleSubmitDate(type, Data);
      }}
      
      onReject={resetDate}
      additionalElement={template}
    />
  );
}

export default RangeFilter;
