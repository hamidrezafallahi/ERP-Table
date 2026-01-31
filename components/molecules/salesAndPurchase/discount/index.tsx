import { useEffect, useState } from "react";

import { Form, Select } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomSelect,
  DynamicMultiSelect,
  DynamicSelect,
  DynamicTreeWithList,
  MultiSelectWithList,
} from "@components/atoms/defaultElements";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import EndDateTimePicker from "@components/atoms/defaultElements/endDateTimePicker";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import StartDateTimePicker from "@components/atoms/defaultElements/startDateTimePicker";
import DynamicRadio from "@components/molecules/dynamicRadioList";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { SystemEnum } from "@type/enum";
import { v4 as uuid } from "uuid";
import type { IProps } from "./type";

type ConditionRow = {
  id: string;
  conditionType?: string;
  operatorType?: string;
  value?: string;
};

export const DiscountForm = ({ defOpt, form }: IProps) => {
  const t = useTranslations();
  const [isNow, setIsNow] = useState(false);
  const dispatch = useDispatch();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const discountType = Form.useWatch("DiscountType", form);
  const timeEffective = Form.useWatch("timeEffectiveDate", form);
  const dateEffective = Form.useWatch("dateEffectiveDate", form);
  const timeExpire = Form.useWatch("timeExpireDate", form);
  const dateExpire = Form.useWatch("dateExpireDate", form);

  const [conditions, setConditions] = useState<ConditionRow[]>([
    { id: uuid() },
  ]);

  const addRow = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: uuid(),
        conditionType: undefined,
        operatorType: undefined,
        value: undefined,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setConditions((prev) => prev.filter((r) => r.id !== id));
  };

  const customerDef = defOpt?.[0]?.CustomerDiscounts.map((item) => ({
    name: item.CustomerName,
    value: item.CustomerId,
  }));

  const goodsDef = defOpt?.[0]?.GoodsDiscounts.map((item) => ({
    name: item.GoodsName,
    value: item.GoodsId,
  }));

  const goodsCategoryDef = defOpt?.[0]?.CustomerGroupDiscounts.map((item) => ({
    name: item.GoodsCategoryName,
    value: item.GoodsCategoryId,
  }));

  const customerGroupDef = defOpt?.[0]?.CustomerGroupDiscounts.map((item) => ({
    name: item.CustomerGroupName,
    value: item.CustomerGroupId,
  }));

  const DiscountSaleTypesDef = defOpt?.[0]?.DiscountSaleTypes.map((item) => ({
    name: item.CustomerName,
    value: item.CustomerId,
  }));

  const DiscountPaymentWaysIdsDef = defOpt?.[0]?.DiscountPaymentWays.map(
    (item) => ({
      name: item.PaymentWayDesc,
      value: item.PaymentWayId,
    })
  );

  const DiscountSaleTeamssDef = defOpt?.[0]?.DiscountSaleTeams.map((item) => ({
    name: item.SaleTeamDesc,
    value: item.SaleTeamId,
  }));

  // اینو باید بعدا چک کنی مشکل بک

  // const discountLocationsDef = defOpt?.[0]?.DiscountLocations.map((item) => ({
  //   name: item.DiscountName,
  //   value: item.DiscountId,
  // }));

  // useEffect(() => {
  //   if (conditionValue === undefined) {
  //     form.setFieldsValue({ DiscountType: false });
  //   }
  // }, []);

  useEffect(() => {
    const pureData = conditions.map(({ id, ...rest }) => rest);
    form.setFieldValue("Conditions", pureData);
  }, [conditions]);

  useEffect(() => {
    const conditions = form.getFieldValue("Conditions");
    if (!conditions || conditions.length === 0) {
      form.setFieldsValue({
        Conditions: [{}],
      });
    }
  }, []);

  useEffect(() => {
    const effectiveDateValue = new Date(dateEffective)?.setTime(timeEffective);

    if (effectiveDateValue) {
      dispatch(
        setPageData({
          caption: "تاریخ شروع",
          name: "EffectiveDate",
          value: new Date(effectiveDateValue)?.toISOString(),
          type: "date",
        })
      );
    }
  }, [timeEffective, dateEffective]);

  useEffect(() => {
    const expireDateValue = new Date(dateExpire)?.setTime(timeExpire);

    if (expireDateValue) {
      dispatch(
        setPageData({
          caption: "تاریخ پایان",
          name: "ExpireDate",
          value: new Date(expireDateValue)?.toISOString(),
          type: "date",
        })
      );
    }
  }, [timeExpire, dateExpire]);
  return (
    <Form
      onValuesChange={(_, all) => {
        console.log("FORM 👉", all);
      }}
      form={form}
      initialValues={{
        IsSetNow: false,
        DiscountType: true,
        Conditions: [{}],
      }}
      name="discountForm"
      layout="vertical"
      className="hidden-show-scrollBar gap-5 lg:gap-y-10 grid grid-cols-12 mt-4 lg:mt-0 h-auto overflow-auto"
    >
      {/* ================= عنوان + انتخاب نوع تخفیف ================= */}
      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        <Form.Item
          label="عنوان"
          name="DiscountTitle"
          className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText
            config={{
              caption: "عنوان",
              name: "DiscountTitle",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>

        <Form.Item
          label="انتخاب نوع تخفیف"
          name="DiscountTypeId"
          className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <DynamicSelect
            dynamicValue={{
              addWebUrl: "/api/com/select/commonInfo/discountType",
              endpoint: "/api/com/select/commonInfo/discountType",
              repoViewId: 1052,
            }}
            config={{
              caption: "انتخاب نوع تخفیف",
              name: "DiscountTypeId",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>

      {/* ================= نوع تخفیف + مبلغ/درصد + حداقل مبلغ ================= */}

      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        <Form.Item
          label="نوع تخفیف"
          name="DiscountType"
          className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
        >
          <DynamicRadio
            item={{
              radioValues: [
                { caption: "درصدی", value: true },
                { caption: "مبلغی", value: false },
              ],
            }}
            config={{
              caption: "نوع تخفیف",
              name: "DiscountType",
              type: "radio",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>

        {discountType === true && (
          <Form.Item
            label="درصد"
            name="DiscountAmount"
            className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
            rules={[{ required: true, message: t("form.required") }]}
          >
            <CustomInputNumber
              min={0}
              max={100}
              controls={false}
              config={{
                caption: "درصد",
                name: "DiscountAmount",
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        )}

        {discountType === false && (
          <>
            <Form.Item
              label="مبلغ"
              name="DiscountAmount"
              className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
              rules={[{ required: true, message: t("form.required") }]}
            >
              <CustomInputNumber
                min={0}
                controls={false}
                parser={(value) =>
                  value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                }
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                config={{
                  caption: "مبلغ",
                  name: "DiscountAmount",
                  setFieldValue: form.setFieldValue,
                }}
              />
            </Form.Item>

            <Form.Item
              label="ارز"
              name="CurrencyId"
              className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
              style={{ display: "inline-block" }}
              rules={[{ required: true, message: t("form.required") }]}
            >
              <div className="w-full">
                <DynamicSelect
                  dynamicValue={{
                    addWebUrl: "/api/sale/select/currencyAvailable",
                    endpoint: "/api/sale/select/currencyAvailable",
                    repoViewId: 130076,
                  }}
                  config={{
                    caption: "ارز",
                    name: "CurrencyId",
                    setFieldValue: form.setFieldValue,
                  }}
                />
              </div>
            </Form.Item>
          </>
        )}
      </div>

      {/* ================= تاریخ شروع و پایان (بدون تغییر) ================= */}
      <Form.Item
        name="EffectiveDate"
        className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
      >
        <StartDateTimePicker
          isNow={isNow}
          setIsNow={setIsNow}
          config={{
            name: "EffectiveDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        name="ExpireDate"
        className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
      >
        <EndDateTimePicker
          config={{
            name: "ExpireDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      {/* ================= مشتری + گروه مشتری + کالا + گروه کالا ================= */}
      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        {/* مشتری */}
        <Form.Item
          label="مشتری"
          name="CustomerDiscountIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/select/Customer4SelectOption",
                endpoint: "api/sale/select/Customer4SelectOption",
                repoViewId: 130045,
                addButton: {
                  url: "sale/customer",
                  RepoId: 1012,
                  SystemId: SystemEnum.sale,
                },
              }}
              config={{
                caption: "مشتری",
                name: "CustomerDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={customerDef}
              dynamicValue={{
                addWebUrl: "api/sale/select/Customer4SelectOption",
                endpoint: "api/sale/select/Customer4SelectOption",
                repoViewId: 130045,
              }}
              config={{
                caption: "مشتری",
                name: "CustomerDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        {/* گروه مشتری */}
        <Form.Item
          label="گروه مشتری"
          name="CustomerGroupDiscountIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/select/customerGroup4SelectOption",
                endpoint: "api/sale/select/customerGroup4SelectOption",
                repoViewId: 1061,
                addButton: {
                  url: "sale/customerGroup",
                  RepoId: 1018,
                  SystemId: SystemEnum.sale,
                },
              }}
              config={{
                caption: "گروه مشتری",
                name: "CustomerGroupDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={customerGroupDef}
              dynamicValue={{
                addWebUrl: "api/sale/select/customerGroup4SelectOption",
                endpoint: "api/sale/select/customerGroup4SelectOption",
                repoViewId: 1061,
              }}
              config={{
                caption: "گروه مشتری",
                name: "CustomerGroupDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        {/* کالا */}
        <Form.Item
          label="کالا"
          name="GoodsDiscountIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/select/goods",
                endpoint: "api/sale/select/goods",
                repoViewId: 130063,
                addButton: {
                  url: "com/good",
                  RepoId: 106023,
                  SystemId: SystemEnum.com,
                },
              }}
              config={{
                caption: "کالا",
                name: "GoodsDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={goodsDef}
              dynamicValue={{
                addWebUrl: "api/sale/select/goods",
                endpoint: "api/sale/select/goods",
                repoViewId: 130063,
              }}
              config={{
                caption: "کالا",
                name: "GoodsDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        {/* گروه کالا */}
        <Form.Item
          label="گروه کالا"
          name="GoodsCategoryDiscountIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicTree
              multiple
              dynamicValue={{
                addWebUrl: "api/sale/select/goodsCategory",
                endpoint: "api/sale/select/goodsCategory",
                repoViewId: 130061,
                addButton: {
                  url: "com/goodsCategory",
                  RepoId: 106027,
                  SystemId: SystemEnum.com,
                },
              }}
              config={{
                caption: "گروه کالا",
                name: "GoodsCategoryDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <DynamicTreeWithList
              defOption={goodsCategoryDef}
              dynamicValue={{
                addWebUrl: "api/sale/select/goodsCategory",
                endpoint: "api/sale/select/goodsCategory",
                repoViewId: 130061,
              }}
              config={{
                caption: "گروه کالا",
                name: "GoodsCategoryDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
      </div>

      {/* ================= نوع فروش +  نحوه پرداخت + محل جغرافیایی +  تیم فروش ================= */}
      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        {/* نوع فروش */}
        <Form.Item
          label="نوع فروش "
          name="DiscountSaleTypesIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/Type4SelectOption",
                endpoint: "api/sale/Select/Type4SelectOption",
                repoViewId: 130044,
                // addButton: {
                //   url: "sale/...",
                //   RepoId: 1012,
                //   SystemId: SystemEnum.sale,
                // },
              }}
              config={{
                caption: "نوع فروش",
                name: "DiscountSaleTypesIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={DiscountSaleTypesDef}
              dynamicValue={{
                addWebUrl: "api/sale/Select/Type4SelectOption",
                endpoint: "api/sale/Select/Type4SelectOption",
                repoViewId: 130044,
              }}
              config={{
                caption: "نوع فروش ",
                name: "DiscountSaleTypesIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        {/*  "نحوه پرداخت" */}
        <Form.Item
          label="نحوه پرداخت"
          name="DiscountPaymentWaysIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
                endpoint: "api/sale/Select/PaymentWay4SelectOption",
                repoViewId: 130051,
                // addButton: {
                //   url: "sale/..",
                //   RepoId: 1012,
                //   SystemId: SystemEnum.sale,
                // },
              }}
              config={{
                caption: "نحوه پرداخت",
                name: "DiscountPaymentWaysIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={DiscountPaymentWaysIdsDef}
              dynamicValue={{
                addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
                endpoint: "api/sale/Select/PaymentWay4SelectOption",
                repoViewId: 130051,
              }}
              config={{
                caption: "نحوه پرداخت",
                name: "DiscountPaymentWaysIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        {/* محل جغرافیایی */}
        <Form.Item
          label="محل جغرافیایی"
          name="DiscountLocationsIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/com/Select/Location4selectoption",
                endpoint: "api/com/Select/Location4selectoption",
                // repoViewId: 130045,
                // addButton: {
                //   url: "sale/..",
                //   RepoId: 1012,
                //   SystemId: SystemEnum.sale,
                // },
              }}
              config={{
                caption: "محل جغرافیایی",
                name: "DiscountLocationsIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              // defOption={discountLocationsDef}
              dynamicValue={{
                addWebUrl: "api/com/Select/Location4selectoption",
                endpoint: "api/com/Select/Location4selectoption",
              }}
              config={{
                caption: "محل جغرافیایی",
                name: "DiscountLocationsIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
        {/*  تیم فروش */}
        <Form.Item
          label="تیم فروش"
          name="DiscountSaleTeamIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs "
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/SaleTeam4SelectOption",
                endpoint: "api/sale/Select/SaleTeam4SelectOption",
                repoViewId: 130048,
                // addButton: {
                //   url: "sale/..",
                //   RepoId: 1012,
                //   SystemId: SystemEnum.sale,
                // },
              }}
              config={{
                caption: " تیم فروش ",
                name: "DiscountSaleTeamIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={DiscountSaleTeamssDef}
              dynamicValue={{
                addWebUrl: "api/sale/Select/SaleTeam4SelectOption",
                endpoint: "api/sale/Select/SaleTeam4SelectOption",
                repoViewId: 130048,
              }}
              config={{
                caption: "تیم فروش",
                name: "DiscountSaleTeamIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
      </div>

      {/* ================= شرط-  عملگر- مقدار================= */}

      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12 items-center">
        {conditions.map((row, index) => (
          <div
            key={row.id}
            className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12 items-center"
          >
            <Form.Item
              label="شرط"
              name="ConditionId"
              className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
            >
              <div className="w-full">
                <DynamicSelect
                  dynamicValue={{
                    addWebUrl: "api/com/select/CommonInfo/DiscountCondition",
                    endpoint: "api/com/select/CommonInfo/DiscountCondition",
                  }}
                  config={{
                    caption: "شرط",
                    name: "ConditionId",
                    setFieldValue: form.setFieldValue,
                  }}
                />
              </div>
            </Form.Item>

            <Form.Item
              label={t("discount.operator")}
              name="Oprator"
              className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
            >
              <div className="w-full">
                <CustomSelect
                  config={{
                    caption: t("discount.operator"),
                    name: "Oprator",
                    setFieldValue: form.setFieldValue,
                  }}
                  options={[
                    { label: t("discount.Equal"), value: "Equal" },
                    { label: t("discount.notEqual"), value: "NotEqual" },
                    { label: t("discount.lessThan"), value: "LessThan" },
                    { label: t("discount.greaterThan"), value: "GreaterThan" },
                    {
                      label: t("discount.lessThanOrEqual"),
                      value: "LessThanOrEqual",
                    },
                    {
                      label: t("discount.greaterThanOrEqual"),
                      value: "GreaterThanOrEqual",
                    },
                  ]}
                />
              </div>
            </Form.Item>

            <Form.Item
              label={t("discount.value")}
              name="Value"
              className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
            >
              <InputText
                config={{
                  caption: t("discount.value"),
                  name: "Value",
                  setFieldValue: form.setFieldValue,
                }}
              />
            </Form.Item>

            <div className="col-span-6 lg:col-span-1 flex justify-center items-end ">
              {conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="h-9 w-9 mt-7  rounded-lg text-red-500 hover:bg-red-50"
                >
                  ✖
                </button>
              )}
            </div>

            <div className="col-span-6 lg:col-span-1 flex justify-center">
              {index === conditions.length - 1 && (
                <button
                  type="button"
                  onClick={addRow}
                  className="h-9 w-9 mt-7 rounded-lg text-green-600 hover:bg-green-50"
                >
                  ➕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};
