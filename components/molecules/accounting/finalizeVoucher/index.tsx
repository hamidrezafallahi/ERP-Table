import {
  Form,
  Spin,
} from 'antd';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';
import { NewDatePicker } from "@components/atoms/defaultElements";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { IRequest } from "@services/mng/report/type";
import { Reload, SpinIcon, TrashBin } from "@components/atoms/iconComponents";
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { showSuccessToast } from '@utils/toast';

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

  const { data: lastCloseDate, refetch } = useGetData<ILastCloseDate, IRequest>(
    {
      url: "/api/acc/select/finished/lastDate",
      body: {},
    },
  );

  const closeDate = lastCloseDate?.Data?.[0]?.Date
    ? moment(lastCloseDate.Data[0].Date)
        .locale(locale === "fa" ? "fa" : "en")
        .format(locale === "fa" ? "jYYYY/jMM/jDD" : "YYYY/MM/DD")
    : "";

  const [mutateItem, { isLoading: removeFinish }] = useCUDDataMutation();
  const handelRemove = async () => {
    const res = await mutateItem({
      url: "api/acc/Reverce/Confirmation",
      body: {},
    }).unwrap();
    if (res?.Result == "Pending") {
      const newId = res?.Key;
      showSuccessToast(
        "عملیات برگشت زمان برست . درخواست برگشت ثبت شد پس از پایان نتیجه به اطلاع شما خواهد رسید",
      );
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <Form form={form}>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <div className="font-normal text-blue-blue5 text-xs">
              {closeDate.length ? (
                <div className="flex items-center gap-2">
                  <div>{t("account.lastCloseDate", { date: closeDate })}</div>
                  {removeFinish == true ? (
                    <Spin size="large" indicator={<SpinIcon />} />
                  ) : (
                    <div
                      onClick={handelRemove}
                      className="flex gap-2 items-center cursor-pointer"
                    >
                      <TrashBin />
                      <span className="text-gray-gray10">
                        {t("general.returnFromOutage")}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                "تاریخی ثبت نشده."
              )}
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer font-normal text-xs"
              onClick={() => refetch()}
            >
              <Reload
                config={{
                  height: 16,
                  width: 16,
                }}
              />
              <span className="text-gray-gray10">{t("general.reload")}</span>
            </div>
          </div>
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
      <div className="flex flex-col gap-3">
        <div className="text-redBadge">توجه :</div>
        <div className="text-xs">
          <span className="font-bold">عملیات قطعی کردن : </span>
          <p>
            برای این عملیات باید <strong>ناریخ</strong> مشخص کنید . این عملیات
            در صورتی قبلا در این سال مالی همیچ عملیات قطعی کردن انجام نداده اید
            از{" "}
            <span className="underline">
              <strong>تاریخ شروع سال مالی</strong>
            </span>{" "}
            و در صورتی که قبلا این عملیات را انجان داده باشید از{" "}
            <span className="underline">
              <strong>تاریخ عملیات قبلی</strong>
            </span>{" "}
            تا تاریخی که الان مشخص می کنید در تمام سرویس ها تا تاریخ مذکور را
            بسته واجازه ثبت سند در باز مذکور رو نخواهد داد . از طرف دیگر تمام
            اسناد مابین این تاریخ را به وضعیت قطعی شده تغییر خواهد داد . توجه
            داشته باشید که این عملیات{" "}
            <span className="underline">
              <strong>زمانبر</strong>
            </span>{" "}
            است و ممکن است بین چند ثانیه تا چند دقیقه طول بکشد نتیجه بعد از
            پایان عملیات به اطلاع شما خواهد رسید . برای انجام عملیات نیز نیست
            حتما صفحه باز یا حتی در این صفحه بمانید سیستم به صورت خودکار عملیات
            را انجام خواهد داد
          </p>
        </div>

        <div className="text-xs">
          <span className="font-bold">عملیات برگشن از قطعی : </span>
          <p>
            عملیات برگشت از قطعی دقیقا{" "}
            <span className="underline">
              <strong>برعکس عملیات قطعی کردن</strong>
            </span>{" "}
            عمل می کند . برای انجام این عملیات{" "}
            <span className="underline">
              <strong>باید حداقل در این سال مالی یه عملیات قطعی کردن</strong>
            </span>{" "}
            انجام داده باشید . عملیات برگشن از قطعی مرحله به مرحله به عقب بر
            میگردد به این صورت که از اخرین تاریخ یکی یکی میتوان به تاریخ های قبل
            برگشت . پس از انجام موقیت امیز این عملیات اسناد در تمام سرویس ها ما
            ببین این تاریخ به وضعیت تنظیم شده بازخواهند گشت و امکان ثبت ثند در
            این بازه زمانی وجود خواهد داشت
          </p>
        </div>
      </div>
    </div>
  );
};