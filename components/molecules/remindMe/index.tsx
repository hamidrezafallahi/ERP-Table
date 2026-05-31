import {
  useEffect,
  useState,
} from 'react';

import {
  Form,
  Input,
} from 'antd';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import {
  CustomSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import { NewTimePicker } from '@components/atoms/defaultElements/newTimePicker';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { showSuccessToast } from '@utils/toast';

import type { IProps } from './type';

const remindOptions = [
  { value: "30min", label: "30 دقیقه" },
  { value: "1h", label: "1 ساعت" },
  { value: "4h", label: "4 ساعت" },
  { value: "1d", label: "یک روز" },
  { value: "manual", label: "دستی" },
];

export default function RemindMe({
  refId,
  repoId,
  onClose,
  isOpen,
}: IProps & { isOpen: boolean }) {
  const t = useTranslations();
  const [form] = Form.useForm();

  // const isSubmittingRef = useRef(false);   ///check kon ......
  const [shouldFetch, setShouldFetch] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const { data: defaultValueData, isSuccess: defaultValueSuccess } = useGetData(
    {
      url: "/api/job/select/scheduleTask",
      body: { RepoId: repoId, RefId: refId },
      skip: !shouldFetch,
    },
  );

  const [remindToMe] = useCUDDataMutation();

  const defaultValue = defaultValueData?.Data?.[0];

  useEffect(() => {
    if (!isOpen) {
      setShouldFetch(false);
      form.resetFields();
      setFormInitialized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!defaultValueSuccess || formInitialized) return;

    const now = dayjs();

    if (defaultValue) {
      const recurrencePatterns = JSON.parse(
        defaultValue.RecurrencePatterns || "{}",
      );
      const dateValue = dayjs(recurrencePatterns?.At);

      form.setFieldsValue({
        Caption: defaultValue.Caption,
        atDate: dateValue,
        atTime: dateValue,
        RemindOption: "manual",
      });
    } else {
      form.setFieldsValue({
        Caption: "",
        atDate: now,
        atTime: now,
        RemindOption: "manual",
      });
    }

    setFormInitialized(true);
  }, [defaultValueSuccess, defaultValue, form, formInitialized]);

  const onSubmit = async () => {
    const values = form.getFieldsValue();
    if (!values.atDate || !values.atTime || !values.Caption) return;

    try {
      // isSubmittingRef.current = true;

      const time = dayjs(values.atTime);
      const at = dayjs(values.atDate).hour(time.hour()).minute(time.minute());

      const recurrencePatterns = {
        Type: 1,
        RecurringWeeks: [],
        RecurringMonths: [],
        Times: null,
        At: at.toISOString(),
      };

      const body = {
        RecurrencePatterns: JSON.stringify(recurrencePatterns),
        Caption: values.Caption,
      };

      const res = await remindToMe({
        url: defaultValue?.ScheduleTaskId
          ? "/api/job/update/scheduleTask"
          : "/api/job/insert/scheduleTask",
        body: defaultValue?.ScheduleTaskId
          ? {
              ...body,
              ScheduleTaskId: defaultValue.ScheduleTaskId,
              ChangeFields: ["RecurrencePatterns", "Caption"],
            }
          : {
              ...body,
              ReturnInsertedRow: false,
              ScheduleTaskType: 1,
              ScheduleType: 1,
              RepoId: repoId,
              RefId: refId,
              StartDate: dayjs().toISOString(),
              NeedStop: true,
              SendingTypeId: 4,
            },
      }).unwrap();

      if (res?.Result === "Success") {
        showSuccessToast(t("toast.save"));
        form.resetFields();
        setFormInitialized(false);
        onClose();
      }
    } catch (e) {
      console.error("❌ error while saving:", e);
    }
    // finally {
    //   isSubmittingRef.current = false;
    // }
  };

  const remindOptionWatch = Form.useWatch("RemindOption", form);
  useEffect(() => {
    if (!formInitialized) return;
    if (!remindOptionWatch || remindOptionWatch === "manual") return;

    const now = dayjs();
    const offsetMap: Record<string, number> = {
      "30min": 30,
      "1h": 60,
      "4h": 240,
      "1d": 1440,
    };

    if (remindOptionWatch in offsetMap) {
      const minutesToAdd = offsetMap[remindOptionWatch];
      const newTime = now.add(minutesToAdd, "minute");
      form.setFieldsValue({
        atDate: newTime,
        atTime: newTime,
      });
    }
  }, [remindOptionWatch, form, formInitialized]);

  return (
    <Form
      className="flex flex-col justify-between gap-2 p-4"
      name="remindMe"
      requiredMark={false}
      layout="vertical"
      form={form}
      autoComplete="off"
    >
      <div className={`flex flex-col gap-2 lg:grid lg:grid-cols-3`}>
        <Form.Item
          name="RemindOption"
          label={t("general.remindToMe")}
          className="m-0 p-0 text-xs"
        >
          <CustomSelect options={remindOptions} />
        </Form.Item>

        <Form.Item
          name="atDate"
          label={t("general.remindMeIn")}
          className="m-0 p-0 text-xs"
          rules={[
            { required: true, message: t("form.required"), type: "date" },
          ]}
        >
          <NewDatePicker />
        </Form.Item>

        <Form.Item
          name="atTime"
          label=" "
          className="m-0 p-0 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <NewTimePicker className="!bg-gray-gray3 dark:!bg-gray-gray10 !border-none hover:!border-none focus-within:!border-none !rounded hover:!ring-none w-full h-[2.125rem] !text-gray-gray9" />
        </Form.Item>

        <div className="col-span-3">
          <Form.Item
            name="Caption"
            label={t("general.caption")}
            className="m-0 p-0 text-xs"
            rules={[{ required: true, message: t("form.required") }]}
          >
            <Input.TextArea
              rows={4}
              style={{ height: 120, resize: "none" }}
              className="!bg-gray-gray3 dark:!bg-gray-gray10 rounded"
            />
          </Form.Item>
        </div>
      </div>

      <Form.Item className="m-0 p-0 text-xs" validateFirst>
        <div
          className={`lg:justify-end flex items-center gap-2 bg-white dark:bg-gray-gray12 w-full text-xs`}
        >
          <button
            onClick={onSubmit}
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
          >
            {t("general.submit")}
          </button>
        </div>
      </Form.Item>
    </Form>
  );
}
