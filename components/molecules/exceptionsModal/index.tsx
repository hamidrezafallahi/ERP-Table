import {
  useEffect,
  useState,
} from 'react';

import {
  Divider,
  Form,
  Spin,
} from 'antd';
import { SelectProps } from 'antd/lib';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  TimePicker,
} from 'react-persian-range-picker';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  CalendarInfoIcon,
  PendingIcon,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { IBaseQueryResponse } from '@services/base/type';
import { IExceptionCalendar } from '@services/com/calendar/type';
import type { IRequest } from '@services/com/good/type';

import RadioList from '../radioList';

const initForm = {
  CalendarType: "date",
  changeType: 0,
  IsRange: false,
  IsWeekDays:false,
  ApplyUnTilEndOfYear: false,
  CalendarDesc: null,
  SelectedDay: null,
  CalendarExceptions: [],
  CalendarId: null,
  EndTime: null,
  Fri: null,
  Mon: null,
  Sat: null,
  StartAndEndDate: null,
  StartDayWeek: 1,
  StartTime: null,
  StartWeekDay: null,
  Sun: null,
  Thu: null,
  Tue: null,
  Wed: null,
  WorkDays: null,
  Dates: null,
};
interface IProps {
  handleClose: () => void;
  id: number;
  rowData: {
    CalendarDesc: string;
    CalendarExceptions: any[];
    length: number;
    CalendarId: number;
    EndTime: string;
    Fri: boolean;
    Mon: boolean;
    Sat: boolean;
    StartAndEndDate: string;
    StartDayWeek: number;
    StartTime: string;
    StartWeekDay: string;
    Sun: boolean;
    Thu: boolean;
    Tue: boolean;
    Wed: boolean;
    WorkDays: string;
  };
}
export const ExceptionsModal = ({ ...props }: IProps) => {
  const { handleClose, id, rowData } = props;
  const [exceptions, setExceptions] = useState<IExceptionCalendar[]>([]);
  const [selectedDay, setSelectedDay] = useState<IExceptionCalendar>(undefined);
  const { data: defaultValue } = useGetData<
    IBaseQueryResponse<IExceptionCalendar[]>,
    IRequest
  >({
    url: "api/com/select/calendarException",
    body: {
      RepoViewId: 106009,
      CalendarId: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();
  const handleSubmit = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);
    const res = await mutateItem({
      url: "api/com/insert/calendarException",
      body: {
        ApplyUnTilEndOfYear: values.ApplyUnTilEndOfYear,
        Dates: typeof values.Dates === "string" ? [values.Dates] : values.Dates,
        EndTime:
          values.changeType !== 1
            ? moment(values.EndTime).format("HH:mm:ss")
            : undefined,
        StartTime:
          values.changeType !== 1
            ? moment(values.StartTime).format("HH:mm:ss")
            : undefined,
        IsHoliday: values.changeType == 0 ? false : true,
        IsRange: values.CalendarType == "date" ? false : true,
        CalendarId: rowData.CalendarId,
        IsWeekDays:values.IsWeekDays
      },
    }).unwrap();
    if (res.Result === "Success") {
      console.log(res);
    }
    // handleClose();
  };

  const handleApplyUnTilEndOfYear = (e) => {
    form.setFieldValue("ApplyUnTilEndOfYear", e.target.checked);
  };
  const handleChangeStartHour = (e) => {
    // console.log(moment(e).format("HH:mm:ss"));
    // form.setFieldValue("StartHour", moment(e).format("HH:mm:ss"));
    form.setFieldValue("StartHour", e);
  };
  const handleChangeEndHour = (e) => {
    // form.setFieldValue("EndHour", moment(e).format("HH:mm:ss"));
    form.setFieldValue("EndHour", e);
  };
  useEffect(() => {
    if (defaultValue?.Result === "Success") {
      const data: any = defaultValue.Data;
      setExceptions(data as IExceptionCalendar[]);
    }
  }, [defaultValue]);
  const changeTypeOption: SelectProps["options"] = [
    {
      title: t("general.changeWorkingTime"),
      value: 0,
      label: t("general.changeWorkingTime"),
    },
    { title: t("general.holiday"), value: 1, label: t("general.holiday") },
  ];
  const changeCalendarOption: SelectProps["options"] = [
    {
      title: t("general.chooseDayOfWeekOrMonth"),
      value: "date",
      label: t("general.chooseDayOfWeekOrMonth"),
    },
    {
      title: t("general.chooseRange"),
      value: "range",
      label: t("general.chooseRange"),
    },
  ];
  const dayKeys = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const handleSelectDate = (e) => {
    if(Array.isArray(e)){
       form.setFieldValue("Dates", null);
    form.setFieldValue(
      "Dates",
      e.map((i) => i.isoJalali)
    );
    form.setFieldValue(
      "IsWeekDays",true
      )
    }else{

      form.setFieldValue(
        "IsWeekDays",false
      )
      const dayIndex = new Date(e).getDay() + 1;
      const dayKey = dayKeys[dayIndex];
      const matched = exceptions.find(
        (ex) =>
          new Date(e).setHours(0, 0, 0, 0).valueOf() ===
        new Date(ex.Date as string).setHours(0, 0, 0, 0).valueOf()
      );
      const exist = matched
      ? {
        CalendarExceptionId: matched.CalendarExceptionId,
          CalendarId: rowData.CalendarId,
          StartTime: matched.IsHoliday ? null : matched.StartTime,
          EndTime: matched.IsHoliday ? null : matched.EndTime,
          Date: matched.Date,
          IsHoliday: matched.IsHoliday,
        }
        : {
          CalendarExceptionId: null,
          CalendarId: rowData.CalendarId,
          StartTime: !rowData[dayKey] ? null : rowData.StartTime,
          EndTime: !rowData[dayKey] ? null : rowData.EndTime,
          Date: e,
          IsHoliday: !rowData[dayKey],
        };
        setSelectedDay(exist);
      }
  };
  const changeType = Form.useWatch("changeType", form);
  const CalendarType =
    Form.useWatch("CalendarType", form) ?? initForm.CalendarType;
  const dates = Form.useWatch("Dates", form) ?? initForm.Dates;

  return (
    <Form
      form={form}
      initialValues={initForm}
      layout="vertical"
      onFinish={handleSubmit}
      className="flex flex-col justify-between w-full h-full"
    >
      <div className="hidden-show-scrollbar flex flex-col gap-3 px-3 pb-0 w-full h-[100%] overflow-y-auto">
        <div className="flex items-center gap-4">
          <div>
            <CalendarInfoIcon />
          </div>
          <div className="whitespace-nowrap">{t("general.calendarInfo")}</div>
          <div className="grid grid-cols-3 px-3 py-2 border rounded-lg">
            <div className="flex justify-start items-center gap-4 col-span-1 text-gray-gray10 text-xs">
              {" "}
              <div>{t("general.title")}</div>
              <div>{rowData.CalendarDesc}</div>
            </div>
            <div className="flex justify-start items-center gap-4 col-span-1 text-gray-gray10 text-xs">
              {" "}
              <div>{t("general.start/end-time")}</div>
              <div>{rowData.StartAndEndDate}</div>
            </div>
            <div className="flex justify-end items-center gap-4 col-span-1 text-gray-gray10 text-xs">
              {" "}
              <div>{t("general.startDayOfWeek")}</div>
              <div>{rowData.StartWeekDay}</div>
            </div>
          </div>
        </div>
        <div className="flex">
          <div
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <div className="py-2 text-blue-blue5 text-xs">
              {!selectedDay && t("general.startActionByChoosingOneDay")}
              <Form.Item
                name="CalendarType"
                label="مدل تغییر"
                layout="horizontal"
                className="m-0 p-0 bg"
              >
                <RadioList
                  options={changeCalendarOption}
                  value={CalendarType}
                  defaultValue={CalendarType}
                  onChange={() => {
                    form.setFieldValue("Dates", null);
                  }}
                />
              </Form.Item>
            </div>
            <Form.Item name="Dates" className="shadow-md m-0 p-0">
              <Calendar
                onChange={handleSelectDate}
                model={CalendarType}
                selectableCols={CalendarType === "date"}
                value={dates}
                tertiaryColor="#000"
                specialDays={exceptions.map((i) =>
                  new Date(i.Date as string).setHours(0, 0, 0, 0).valueOf()
                )}
                renderDayStyle={({
                  isSpecial,
                  isSelected,
                  isInRange,
                  isToday,
                  isDisabled,
                }) => ({
                  width: "30px",
                })}
                // ={handleSelectCol}
                renderDayContent={({ day, isSpecial }) => (
                  <>
                    <span
                      className="relative aspect-square"
                      style={{
                        border: isSpecial ? "2px dashed #939393" : undefined,
                        padding: "2px",
                        borderRadius: "4px",
                      }}
                    >
                      {day}
                      {isSpecial && (
                        <span className="-top-2 z-10 absolute">
                          <PendingIcon />
                        </span>
                      )}
                    </span>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item name="IsWeekDays" className="flex gap-2 p-2">
              {selectedDay && (
                <>
                  <label className="flex-1 font-medium text-gray-gray8 text-xs">
                    {t("general.status")}
                    <div className="flex flex-1 items-center bg-gray-gray3 p-2 h-10">
                      {selectedDay.IsHoliday
                        ? t("general.holiday")
                        : t("general.weekday")}
                    </div>
                  </label>
                  <label className="flex-1 font-medium text-gray-gray8 text-xs">
                    {t("general.startTime")}
                    <div className="flex flex-1 items-center bg-gray-gray3 p-2 h-10">
                      {selectedDay?.StartTime ?? "--------"}
                    </div>
                  </label>
                  <label className="flex-1 font-medium text-gray-gray8 text-xs">
                    {t("general.endTime")}
                    <div className="flex flex-1 items-center bg-gray-gray3 p-2 h-10">
                      {selectedDay?.EndTime ?? "--------"}
                    </div>
                  </label>
                </>
              )}
            </Form.Item>
          </div>
          <Divider type="vertical" className="h-full" />
          <div className="flex flex-col flex-1 gap-4">
            {/* <div className="py-2 text-blue-blue5 text-xs">
              {t("general.YourSelectedPeriodIncludesDifferentConditions")}
            </div> */}
            {/* <div>
            <CustomSwitch />
            <span className="px-4">{t("general.changeToWorkDay")}</span>
          </div> */}
            <div className="flex gap-4">
              <Form.Item
                name="changeType"
                label="نوع تغییرات"
                layout="horizontal"
              >
                {/* <label className="whitespace-nowrap">نوع تغییرات</label> */}
                <RadioList
                  options={changeTypeOption}
                  value={changeType}
                  defaultValue={changeType}
                />
              </Form.Item>
            </div>
            <div className="flex gap-4">
              {changeType === 0 && (
                <div className="flex justify-between items-center gap-4 w-1/2 h-14">
                  <Form.Item
                    name="StartTime"
                    rules={[{ required: true, message: t("form.required") }]}
                    label={
                      <span className="font-medium text-gray-gray8 text-xs">
                        {t("general.startTime")}
                      </span>
                    }
                    layout="vertical"
                  >
                    <TimePicker
                      onChange={handleChangeStartHour}
                      placeholder={false}
                      icon={false}
                      value={form.getFieldValue("StartTime")}
                    />
                  </Form.Item>
                  <Form.Item
                    name="EndTime"
                    rules={[{ required: true, message: t("form.required") }]}
                    label={
                      <span className="font-medium text-gray-gray8 text-xs">
                        {t("general.endTime")}
                      </span>
                    }
                    layout="vertical"
                    className="font-medium text-gray-gray8 text-xs"
                  >
                    <TimePicker
                      onChange={handleChangeEndHour}
                      placeholder={false}
                      icon={false}
                      value={form.getFieldValue("EndTime")}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
            <Form.Item
              name="ApplyUnTilEndOfYear"
              className="flex justify-start items-center px-4 border-2 border-dashed w-full h-14 text-gray-gray8 text-xs"
            >
              <CustomCheckbox
                value={form.getFieldValue("ApplyUnTilEndOfYear")}
                onChange={handleApplyUnTilEndOfYear}
              />
              <span>: {t("general.applyUnTilEndOfYear")}</span>
            </Form.Item>
            {/* <div className="flex justify-start items-center px-4 border-2 border-dashed w-full h-14 text-gray-gray8 text-xs">
            <CustomCheckbox />
            <span>: {t("general.applyUntilEndOfYearForAllMonths")}</span>
          </div> */}
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center p-4 border-t">
        <CustomButton
          type="text"
          onClick={handleSubmit}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.submit")
          )}
        </CustomButton>
      </div>
    </Form>
  );
};
