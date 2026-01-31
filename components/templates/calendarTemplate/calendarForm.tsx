import React, { useEffect } from 'react';

import { Form } from 'antd';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { CustomSelect } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import InputText from '@components/atoms/defaultElements/inputText';
import { NewTimePicker } from '@components/atoms/defaultElements/newTimePicker';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';

type CalendarFormValues = {
  title?: string;
  startHour?: any;
  endHour?: any;
  allDays?: boolean;
  Sat?: boolean;
  Sun?: boolean;
  Mon?: boolean;
  Tue?: boolean;
  Wed?: boolean;
  Thu?: boolean;
  Fri?: boolean;
  StartDayWeek?: number;
};
const initForm = {
  Sat: false,
  Sun: false,
  Mon: false,
  Tue: false,
  Wed: false,
  Thu: false,
  Fri: false,
};
function CalendarForm({ form }) {
  const { locale } = useAppSelector((state) => ({
    locale: state.withPersist.config.lang,
  }));
 
  const t = useTranslations();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const { data } = useGetData({
    url: "api/com/select/calendar",
    body: { Id: id },
    skip: !id,
  });

  useEffect(() => {
    if (data?.Result === "Success") {
      const d = data.Data[0];
      form.setFieldsValue({
        title: d.CalendarDesc,
        StartTime: convertToIsoWithLocale(d.StartTime, locale),
        EndTime: convertToIsoWithLocale(d.EndTime, locale),
        StartDayWeek: d.StartDayWeek,
        Sat: d.Sat,
        Sun: d.Sun,
        Mon: d.Mon,
        Tue: d.Tue,
        Wed: d.Wed,
        Thu: d.Thu,
        Fri: d.Fri,
      });
    }
  }, [data]);

  const StartDayWeek = [
    { label: t("week.Saturday"), value: 0, title: "Sat" },
    { label: t("week.Sunday"), value: 1, title: "Sun" },
    { label: t("week.Monday"), value: 2, title: "Mon" },
    { label: t("week.Tuesday"), value: 3, title: "Tue" },
    { label: t("week.Wednesday"), value: 4, title: "Wed" },
    { label: t("week.Thursday"), value: 5, title: "Thu" },
    { label: t("week.Friday"), value: 6, title: "Fri" },
  ];

  const formValues = Form.useWatch<CalendarFormValues>([], form);

  useEffect(() => {

    if (!formValues) return;

    const allChecked = StartDayWeek.every((day) => formValues?.[day.title]);
    const currentAllDays = formValues?.allDays;

    if (allChecked && !currentAllDays) {
      form.setFieldValue("allDays", true);
    } else if (!allChecked && currentAllDays) {
      form.setFieldValue("allDays", false);
    }
  }, [formValues]);
  return (
    <Form
      form={form}
      initialValues={initForm}
      className="relative flex flex-col gap-6 gap-y-7 p-3 pb-10 w-full h-fit"
    >
      <div className="relative flex items-center gap-6 w-full">
        <Form.Item
          layout="vertical"
          className="w-full sm:w-2/3"
          label={t("general.title")}
          name="title"
          rules={[{ required: true, message: "عنوان را وارد کنید" }]}
          style={{ minHeight: "50px", height: "50px" }}
        >
          <InputText />
        </Form.Item>

        <Form.Item
          className="w-full sm:w-1/3"
          layout="vertical"
          label={t("general.startHour")}
          name="StartTime"
          rules={[{ required: true, message: "ساعت شروع را وارد کنید" }]}
          style={{ minHeight: "50px", height: "50px" }}
        >
          <NewTimePicker
            format="HH:mm"
            icon={false}
            placeholder={false}
            Style={{ width: "100%", paddingRight: "8px" }}
            value={form.getFieldValue("StartTime")}
            onChange={(e) => {
              form.setFieldValue("StartTime", e);
            }}
          />
        </Form.Item>

        <Form.Item
          className="w-full sm:w-1/3"
          layout="vertical"
          label={t("general.endHour")}
          name="EndTime"
          rules={[{ required: true, message: "ساعت پایان را وارد کنید" }]}
          style={{ minHeight: "50px", height: "50px" }}
        >
          <NewTimePicker
            format="HH:mm"
            icon={false}
            placeholder={false}
            Style={{ width: "100%", paddingRight: "8px" }}
            value={form.getFieldValue("EndTime")}
            onChange={(e) => {
              form.setFieldValue("EndTime", e);
            }}
          />
        </Form.Item>
      </div>

      <div className="relative mt-6 pr-4 border-2 border-dashed w-full h-fit">
        <p className="-top-4 absolute font-medium">{t("general.workDays")}</p>

        <div className="flex flex-wrap">
          <Form.Item
            name="allDays"
            valuePropName="checked"
            className="pt-4 w-full"
          >
            <CustomCheckbox
              onChange={(e) => {
                const checked = e.target.checked;
                form.setFieldsValue({
                  allDays: checked,
                  ...Object.fromEntries(
                    StartDayWeek.map((day) => [day.title, checked])
                  ),
                });
              }}
            >
              همه
            </CustomCheckbox>
          </Form.Item>

          <div className="flex gap-12 w-full">
            {StartDayWeek.map((day) => (
              <Form.Item
                name={day.title}
                
                key={day.title}
                valuePropName="checked"

              >
                <CustomCheckbox
                >{day.label}</CustomCheckbox>
              </Form.Item>
            ))}
          </div>
        </div>
      </div>

      <Form.Item
        layout="vertical"
        className="w-full sm:w-1/2"
        label="روز شروع هفته"
        name="StartDayWeek"
        rules={[{ required: true, message: "روز شروع هفته را انتخاب کنید" }]}
        style={{ minHeight: "50px", height: "50px" }}
      >
        <CustomSelect placeholder="انتخاب کنید" options={StartDayWeek} />
      </Form.Item>
    </Form>
  );
}

export default CalendarForm;
export function convertToIsoWithLocale(
  timeString: string,
  locale: "fa" | "en"
) {
  const offset = locale === "fa" ? "+03:30" : "+00:00";

  return moment()
    .utcOffset(offset)
    .set({
      hour: Number(timeString.split(":")[0]),
      minute: Number(timeString.split(":")[1]),
      second: 0,
      millisecond: 0,
    })
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}
