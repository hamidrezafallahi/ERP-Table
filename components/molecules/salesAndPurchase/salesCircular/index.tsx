import { useEffect, useState } from "react";

import { Divider, Form, Radio } from "antd";
import { useDispatch } from "react-redux";

import {
  CustomRadio,
  DynamicMultiSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import EndDateTimePicker from "@components/atoms/defaultElements/endDateTimePicker";
import InputText from "@components/atoms/defaultElements/inputText";
import StartDateTimePicker from "@components/atoms/defaultElements/startDateTimePicker";
import DynamicRadio from "@components/molecules/dynamicRadioList";
import { setPageData } from "@slice/pages";
import { SystemEnum } from "@type/enum";

import type { IProps } from "./type";

export const SalesCircularForm = ({ activePage, form }: IProps) => {
  const dispatch = useDispatch();
  const [isNow, setIsNow] = useState(false);

  const formTypeClientValue = Form.useWatch("formTypeClient", form);
  const customerValue = activePage?.pageData?.find(
    (item) => item.name === "CustomerRuleIds"
  )?.value;
  const customerGroupValue = activePage?.pageData?.find(
    (item) => item.name === "CustomerGroupRuleIds"
  )?.value;
  const goodsValue = activePage?.pageData?.find(
    (item) => item.name === "GoodsRuleIds"
  )?.value;
  const goodsCategoryValue = activePage?.pageData?.find(
    (item) => item.name === "GoodsCategoryRuleIds"
  )?.value;
  const customerOrgValue = activePage?.pageData?.find(
    (item) => item.name === "CustomerRuleIds"
  )?.originalValue;
  const customerOrgGroupValue = activePage?.pageData?.find(
    (item) => item.name === "CustomerGroupRuleIds"
  )?.originalValue;
  const goodsOrgValue = activePage?.pageData?.find(
    (item) => item.name === "GoodsRuleIds"
  )?.originalValue;
  const goodsCategoryOrgValue = activePage?.pageData?.find(
    (item) => item.name === "GoodsCategoryRuleIds"
  )?.originalValue;

  useEffect(() => {
    if (customerOrgValue?.length > 0) {
      form.setFieldValue("formTypeClient", 1);
    }
    if (customerOrgGroupValue?.length > 0) {
      form.setFieldValue("formTypeClient", 2);
    }
    if (goodsOrgValue?.length > 0) {
      form.setFieldValue("formTypeClient", 3);
    }
    if (goodsCategoryOrgValue?.length > 0) {
      form.setFieldValue("formTypeClient", 4);
    }
  }, [
    customerOrgValue,
    customerOrgGroupValue,
    goodsOrgValue,
    goodsCategoryOrgValue,
  ]);

  useEffect(() => {
    if (customerValue?.length > 0) {
      dispatch(
        setPageData({
          name: "CustomerGroupRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsCategoryRuleIds",
          value: [],
        })
      );
    }
  }, [customerValue]);
  useEffect(() => {
    if (customerGroupValue?.length > 0) {
      dispatch(
        setPageData({
          name: "CustomerRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsCategoryRuleIds",
          value: [],
        })
      );
    }
  }, [customerGroupValue]);
  useEffect(() => {
    if (goodsValue?.length > 0) {
      dispatch(
        setPageData({
          name: "CustomerGroupRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "CustomerRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsCategoryRuleIds",
          value: [],
        })
      );
    }
  }, [goodsValue]);
  useEffect(() => {
    if (goodsCategoryValue?.length > 0) {
      dispatch(
        setPageData({
          name: "CustomerGroupRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "CustomerRuleIds",
          value: [],
        })
      );
      dispatch(
        setPageData({
          name: "GoodsRuleIds",
          value: [],
        })
      );
    }
  }, [goodsCategoryValue]);

  const options = [
    {
      caption: "مشتری",
      value: 1,
    },
    {
      caption: "گروه مشتری",
      value: 2,
    },
    {
      caption: "کالا",
      value: 3,
    },
    {
      caption: "گروه کالا",
      value: 4,
    },
  ];

  return (
    <Form
      form={form}
      name="salesCircularForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-4 hidden-show-scrollBar`}
    >
      <Form.Item
        label="تاریخ بخشنامه"
        name="SaleRuleDate"
        className="col-span-1 !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
          className="!w-full"
          config={{
            name: "SaleRuleDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="شماره"
        name="SaleRuleNumber"
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            caption: "شماره",
            name: "SaleRuleNumber",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نوع"
        name="formTypeClient"
        className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
      >
        <Radio.Group
          name="formTypeClient"
          className="flex flex-wrap gap-4 w-full"
        >
          {options.map((option, index) => (
            <CustomRadio key={index} value={option.value}>
              {option.caption}
            </CustomRadio>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item
        // label="تاریخ شروع"
        name="StartDate"
        className="col-span-2 !mb-0 !pb-0 text-xs"
      >
        <StartDateTimePicker
          isNow={isNow}
          setIsNow={setIsNow}
          config={{
            name: "StartDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        // label="تاریخ پایان"
        name="EndDate"
        className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
      >
        <EndDateTimePicker
          config={{
            name: "EndDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label="نوع بخشنامه"
        name="RuleType"
        className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
      >
        <DynamicRadio
          item={{
            radioValues: [
              {
                caption: "توقف فروش",
                value: 1,
              },
              {
                caption: "توقف تخفیف",
                value: 2,
              },
              {
                caption: "توقف مالیات",
                value: 3,
              },
              {
                caption: "جلوگیری از موجودی",
                value: 4,
              },
              {
                caption: "غیر فعال",
                value: 5,
              },
            ],
          }}
          config={{
            caption: "نوع بخشنامه",
            name: "RuleType",
            type: "radio",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Divider className="col-span-4 m-2" />

      {formTypeClientValue === 1 && (
        <Form.Item
          label="مشتری"
          name="CustomerRuleIds"
          className="flex flex-col col-span-1 !mb-0 !pb-0 text-xs"
        >
          <DynamicMultiSelect
            dynamicValue={{
              addWebUrl: "api/sale/select/customer4SelectOption",
              endpoint: "api/sale/select/customer4SelectOption",
              repoViewId: 130045,
              addButton: {
                url: "sale/customer",
                RepoId: 1012,
                SystemId: SystemEnum.sale,
              },
            }}
            config={{
              caption: "مشتری",
              name: "CustomerRuleIds",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {formTypeClientValue === 2 && (
        <Form.Item
          label="گروه مشتری"
          name="CustomerGroupRuleIds"
          className="flex flex-col col-span-1 !mb-0 !pb-0 text-xs"
        >
          <DynamicMultiSelect
            dynamicValue={{
              addWebUrl: "api/sale/select/customerGroup4SelectOption",
              endpoint: "api/sale/select/customerGroup4SelectOption",
              repoViewId: 130054,
              addButton: {
                url: "sale/customerGroup",
                RepoId: 1018,
                SystemId: SystemEnum.sale,
              },
            }}
            config={{
              caption: "گروه مشتری",
              name: "CustomerGroupRuleIds",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {formTypeClientValue === 3 && (
        <Form.Item
          label="کالا"
          name="GoodsRuleIds"
          className="flex flex-col col-span-1 !mb-0 !pb-0 text-xs"
        >
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
              name: "GoodsRuleIds",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {formTypeClientValue === 4 && (
        <Form.Item
          label="گروه کالا"
          name="GoodsCategoryRuleIds"
          className="flex flex-col col-span-1 !mb-0 !pb-0 text-xs"
        >
          <DynamicTree
            multiple
            dynamicValue={{
              addWebUrl: "api/sale/select/GoodsCategory",
              endpoint: "api/sale/select/GoodsCategory",
              repoViewId: 130061,
              addButton: {
                url: "com/goodsCategory",
                RepoId: 106027,
                SystemId: SystemEnum.com,
              },
            }}
            config={{
              caption: "گروه کالا",
              name: "GoodsCategoryRuleIds",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
    </Form>
  );
};
