import { Form } from "antd";
import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { NewDatePicker } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IRequest } from "@services/mng/report/type";

interface ILastCloseDate {
  Date: string;
}
export const FinalizeVoucher = ({ form, setMobileDrawerContent }) => {
  const t = useTranslations();
  const { locale } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
    }),
    shallowEqual,
  );

  const { data: lastCloseDate } = useGetData<ILastCloseDate, IRequest>({
    url: "/api/acc/select/finished/lastDate",
    body: {},
  });

  const closeDate = lastCloseDate?.Data?.[0]?.Date
    ? moment(lastCloseDate.Data[0].Date)
        .locale(locale === "fa" ? "fa" : "en")
        .format(locale === "fa" ? "jYYYY/jMM/jDD" : "YYYY/MM/DD")
    : "";

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <span className="font-normal text-blue-blue5 text-xs">
          {closeDate.length
            ? t("account.lastCloseDate", {
                date: closeDate,
              })
            : "تاریخی ثبت نشده."}
        </span>
        <Form.Item
          label="تا تاریخ"
          name="Date"
          rules={[{ required: true, message: "این فیلد الزامی است." }]}
          className="flex flex-col !mb-0 !pb-0 w-60 text-xs"
        >
          <NewDatePicker
            config={{
              name: "Date",
              caption: "تا تاریخ",
              type: "date",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>
    </Form>
  );
};
