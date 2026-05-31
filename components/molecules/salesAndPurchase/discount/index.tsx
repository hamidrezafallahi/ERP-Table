import {
  useEffect,
  useState,
} from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';
import { v4 as uuid } from 'uuid';

import {
  CustomSelect,
  DynamicMultiSelect,
  DynamicSelect,
  DynamicTreeWithList,
  MultiSelectWithList,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import { DynamicTree } from '@components/atoms/defaultElements/dynamicTree';
import EndDateTimePicker
  from '@components/atoms/defaultElements/endDateTimePicker';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import StartDateTimePicker
  from '@components/atoms/defaultElements/startDateTimePicker';
import { PlusIcon } from '@components/atoms/iconComponents';
import DynamicRadio from '@components/molecules/dynamicRadioList';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';
import { SystemEnum } from '@type/enum';

import type {
  ConditionRow,
  IProps,
} from './type';

export const DiscountForm = ({ defOpt, form, id }: IProps) => {
  const t = useTranslations();
  const [isNow, setIsNow] = useState(false);
  const dispatch = useDispatch();
  const { match, activePage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const activePage = state.withPersist.pages?.find((item) => item.isActive);
    return { match, activePage };
  }, shallowEqual);

  const conditionRowsInitialValue = activePage?.pageData?.find(
    (item) => item.name === "DiscountConditions",
  )?.originalValue;
  const conditionRowsValue = activePage?.pageData?.find(
    (item) => item.name === "DiscountConditions",
  )?.value;

  const isEqual =
    JSON.stringify(conditionRowsInitialValue) ===
    JSON.stringify(conditionRowsValue);

  const discountType = Form.useWatch("DiscountType", form);
  const timeEffective = Form.useWatch("timeEffectiveDate", form);
  const dateEffective = Form.useWatch("dateEffectiveDate", form);
  const timeExpire = Form.useWatch("timeExpireDate", form);
  const dateExpire = Form.useWatch("dateExpireDate", form);

  const [conditions, setConditions] = useState<ConditionRow[]>([
    { id: uuid() },
  ]);

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
    }),
  );
  const DiscountSaleTeamsDef = defOpt?.[0]?.DiscountSaleTeams.map((item) => ({
    name: item.SaleTeamDesc,
    value: item.SaleTeamId,
  }));
  const discountLocationsDef = defOpt?.[0]?.DiscountLocations.map((item) => ({
    name: item.DiscountName,
    value: item.DiscountId,
  }));

  const addRow = () => {
    setConditions((prev) => [...prev, { id: uuid() }]);
  };
  const removeRow = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };
  const changeRow = (value: any, id: string, field: keyof ConditionRow) => {
    setConditions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  useEffect(() => {
    const effectiveDateValue = new Date(dateEffective)?.setTime(timeEffective);

    if (effectiveDateValue) {
      dispatch(
        setPageData({
          caption: "تاریخ شروع",
          name: "EffectiveDate",
          value: new Date(effectiveDateValue)?.toISOString(),
          type: "date",
        }),
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
        }),
      );
    }
  }, [timeExpire, dateExpire]);

  useEffect(() => {
    if (defOpt?.[0]?.DiscountConditions?.length > 0) {
      const conditionsFromApi = defOpt[0].DiscountConditions.map((c) => ({
        ConditionId: c.ConditionId,
        Oprator: c.Oprator,
        Value: c.Value ?? null,
      }));

      setConditions(conditionsFromApi.map((item) => ({ id: uuid(), ...item })));
    }
  }, [defOpt, id]);

  useEffect(() => {
    const correctValue = conditions
      ?.filter(
        (r: any) =>
          r?.ConditionId &&
          r?.Oprator &&
          r?.Value !== undefined &&
          r?.Value !== null,
      )
      ?.map((el) => ({
        ConditionId: el.ConditionId,
        Oprator: el.Oprator,
        Value: el.Value,
      }));

    dispatch(
      setPageData({
        name: "DiscountConditions",
        value: correctValue,
      }),
    );

    if (conditions?.length === 0) {
      setConditions([{ id: uuid() }]);
    }
  }, [conditions]);

  useEffect(() => {
    if (conditionRowsInitialValue?.length > 0) {
      const correctValue = conditionRowsInitialValue?.map((item) => ({
        id: uuid(),
        ConditionId: item.ConditionId,
        Oprator: item.Oprator,
        Value: item.Value,
      }));
      setConditions(correctValue);
    }
    if (isEqual) {
      const correctValue = conditionRowsInitialValue?.map((item) => ({
        id: uuid(),
        ConditionId: item.ConditionId,
        Oprator: item.Oprator,
        Value: item.Value,
      }));
      setConditions(correctValue);
    }
  }, [conditionRowsInitialValue, isEqual]);

  return (
    <Form
      form={form}
      initialValues={{
        IsSetNow: false,
        DiscountType: true,
        DiscountConditions: [{}],
      }}
      name="discountForm"
      layout="vertical"
      className="hidden-show-scrollBar gap-5 lg:gap-y-5 grid grid-cols-12 mt-4 lg:mt-0 h-auto overflow-auto"
    >
      {/* ================= عنوان + انتخاب نوع تخفیف ================= */}
      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        <Form.Item
          label={t("discount.discountTitle")}
          name="DiscountTitle"
          className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText
            config={{
              caption: t("discount.discountTitle"),
              name: "DiscountTitle",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>

        <Form.Item
          label={t("discount.discountTypeId")}
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
              caption: t("discount.discountTypeId"),
              name: "DiscountTypeId",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>

      {/* ================= نوع تخفیف + مبلغ/درصد + حداقل مبلغ ================= */}

      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        <Form.Item
          label={t("discount.discountType")}
          name="DiscountType"
          className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
        >
          <DynamicRadio
            item={{
              radioValues: [
                { caption: t("discount.aPercentageOf"), value: true },
                { caption: t("discount.aSumOfMoney"), value: false },
              ],
            }}
            config={{
              caption: t("discount.discountType"),
              name: "DiscountType",
              type: "radio",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>

        {discountType === true && (
          <Form.Item
            label={t("discount.percentage")}
            name="DiscountAmount"
            className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
            rules={[{ required: true, message: t("form.required") }]}
          >
            <CustomInputNumber
              min={0}
              max={100}
              controls={false}
              config={{
                caption: t("discount.percentage"),
                name: "DiscountAmount",
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        )}

        {discountType === false && (
          <>
            <Form.Item
              label={t("discount.discountAmount")}
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
                  caption: t("discount.discountAmount"),
                  name: "DiscountAmount",
                  setFieldValue: form.setFieldValue,
                }}
              />
            </Form.Item>

            <Form.Item
              label={t("title.currency")}
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
                    caption: t("title.currency"),
                    name: "CurrencyId",
                    setFieldValue: form.setFieldValue,
                  }}
                />
              </div>
            </Form.Item>
          </>
        )}
      </div>

      {/* =================   قابلیت ترکیب   + اولویت ================= */}

      <div className="gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        <Form.Item
          name="IsNonStackable"
          valuePropName="checked"
          className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
        >
          <CustomCheckbox
            config={{
              name: "IsNonStackable",
              caption: t("discount.canBeCombinedWithOtherDiscounts"),
              type: "checkbox",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          >
            {t("discount.canBeCombinedWithOtherDiscounts")}{" "}
          </CustomCheckbox>
        </Form.Item>

        <Form.Item
          label={t("discount.priority")}
          name="Priority"
          className="col-span-12 lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
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
              caption: t("discount.priority"),
              name: "Priority",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
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
        <Form.Item
          label={t("discount.customerDiscountIds")}
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
                caption: t("discount.customerDiscountIds"),
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
                caption: t("discount.customerDiscountIds"),
                name: "CustomerDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        <Form.Item
          label={t("discount.customerGroupDiscountIds")}
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
                caption: t("discount.customerGroupDiscountIds"),
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
                caption: t("discount.customerGroupDiscountIds"),
                name: "CustomerGroupDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        <Form.Item
          label={t("discount.goodsDiscountIds")}
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
                caption: t("discount.goodsDiscountIds"),
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
                caption: t("discount.goodsDiscountIds"),
                name: "GoodsDiscountIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>

        <Form.Item
          label={t("discount.goodsCategoryDiscountIds")}
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
                caption: t("discount.goodsCategoryDiscountIds"),
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
                caption: t("discount.goodsCategoryDiscountIds"),
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
        <Form.Item
          label={t("discount.discountSaleTypesIds")}
          name="DiscountSaleTypesIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/Type4SelectOption",
                endpoint: "api/sale/Select/Type4SelectOption",
                repoViewId: 130044,
              }}
              config={{
                caption: t("discount.discountSaleTypesIds"),
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
                caption: t("discount.discountSaleTypesIds"),
                name: "DiscountSaleTypesIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
        <Form.Item
          label={t("discount.discountPaymentWaysIds")}
          name="DiscountPaymentWaysIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
                endpoint: "api/sale/Select/PaymentWay4SelectOption",
                repoViewId: 130051,
              }}
              config={{
                caption: t("discount.discountPaymentWaysIds"),
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
                caption: t("discount.discountPaymentWaysIds"),
                name: "DiscountPaymentWaysIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
        <Form.Item
          label={t("discount.discountLocationsIds")}
          name="DiscountLocationsIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/com/Select/Location4selectoption",
                endpoint: "api/com/Select/Location4selectoption",
              }}
              config={{
                caption: t("discount.discountLocationsIds"),
                name: "DiscountLocationsIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={discountLocationsDef}
              dynamicValue={{
                addWebUrl: "api/com/Select/Location4selectoption",
                endpoint: "api/com/Select/Location4selectoption",
              }}
              config={{
                caption: t("discount.discountLocationsIds"),
                name: "DiscountLocationsIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
        <Form.Item
          label={t("discount.discountSaleTeamIds")}
          name="DiscountSaleTeamIds"
          className="col-span-12 lg:col-span-3 !mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/sale/Select/SaleTeam4SelectOption",
                endpoint: "api/sale/Select/SaleTeam4SelectOption",
                repoViewId: 130048,
              }}
              config={{
                caption: t("discount.discountSaleTeamIds"),
                name: "DiscountSaleTeamIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={DiscountSaleTeamsDef}
              dynamicValue={{
                addWebUrl: "api/sale/Select/SaleTeam4SelectOption",
                endpoint: "api/sale/Select/SaleTeam4SelectOption",
                repoViewId: 130048,
              }}
              config={{
                caption: t("discount.discountSaleTeamIds"),
                name: "DiscountSaleTeamIds",
                setFieldValue: form.setFieldValue,
              }}
              listHeight={95}
            />
          )}
        </Form.Item>
      </div>

      {/* ================= conditions ================= */}
      <div className="items-center gap-5 lg:gap-4 grid grid-cols-12 col-span-12">
        {conditions?.map((row, index) => {
          const isComplete =
            conditions[index]?.ConditionId &&
            conditions[index]?.Oprator &&
           (conditions[index]?.Value || conditions[index]?.Value === 0);
          return (
            <div
              key={index}
              className="items-center gap-5 grid grid-cols-12 col-span-12"
            >
              {/* condition */}
              <div className="flex flex-col gap-2 col-span-12 lg:col-span-3">
                <span className="text-gray-gray10 text-xs">
                  {t("discount.condition")}
                </span>
                <DynamicSelect
                  dynamicValue={{
                    addWebUrl: "api/com/select/CommonInfo/DiscountCondition",
                    endpoint: "api/com/select/CommonInfo/DiscountCondition",
                  }}
                  value={conditions?.[index]?.ConditionId}
                  onClear={() => {
                    setConditions(
                      conditions.map((item) =>
                        item.id === row.id
                          ? {
                              ...item,
                              ConditionId: undefined,
                              Oprator: undefined,
                              Value: undefined,
                            }
                          : row,
                      ),
                    );
                  }}
                  onChange={(value) => {
                    changeRow(value, row.id, "ConditionId");
                  }}
                />
              </div>

              {/* operator */}
              <div className="flex flex-col gap-2 col-span-12 lg:col-span-3">
                <span className="text-gray-gray10 text-xs">
                  {t("discount.operator")}
                </span>
                <CustomSelect
                  options={[
                    { label: "=", value: "Equal" },
                    { label: "!=", value: "NotEqual" },
                    { label: "<", value: "LessThan" },
                    { label: ">", value: "GreaterThan" },
                    { label: "<=", value: "LessThanOrEqual" },
                    { label: ">=", value: "GreaterThanOrEqual" },
                  ]}
                  disabled={!row?.ConditionId}
                  value={conditions?.[index]?.Oprator}
                  onChange={(value) => {
                    changeRow(value, row.id, "Oprator");
                  }}
                />
              </div>

              {/* value */}
              <div className="flex flex-col gap-2 col-span-12 lg:col-span-3">
                <span className="text-gray-gray10 text-xs">
                  {t("discount.value")}
                </span>
                <CustomInputNumber
                  disabled={!row?.ConditionId}
                  min={0}
                  controls={false}
                  parser={(value) =>
                    value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  value={conditions?.[index]?.Value}
                  onChange={(value) => {
                    changeRow(value, row.id, "Value");
                  }}
                />
              </div>

              <div className="flex justify-center col-span-1">
                {conditions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="hover:bg-red-50 mt-7 rounded-lg w-9 h-9 text-red-500"
                  >
                    ✖
                  </button>
                )}
              </div>

              <div className="flex justify-center col-span-1">
                {isComplete && index === conditions.length - 1 && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex justify-center items-center hover:bg-green-50 mt-7 p-2 rounded-lg"
                  >
                    <PlusIcon config={{ width: 22, height: 22 }} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Form>
  );
};
