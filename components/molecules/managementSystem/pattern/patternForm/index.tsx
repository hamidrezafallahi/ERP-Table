import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
} from "@components/atoms/defaultElements";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { CloseCircle, PlusOutline } from "@components/atoms/iconComponents";
import type { IPatternItem } from "@services/mng/pattern/type";
import { setPageData } from "@slice/pages";
import type { IPage } from "@slice/pages/type";
import type { IOption } from "@type/elementType";
import { Form, FormInstance, Radio, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState, type ChangeEvent } from "react";
import { useDispatch } from "react-redux";

enum fieldType {
  element = 1,
  constant = 2,
}

const SeparatorSelectWrapper = (props: Record<string, any>) => {
  const { onEditPatternItem, separatorOptions, value, onChange, ...rest } =
    props;
  return (
    <Select
      {...rest}
      options={separatorOptions}
      value={value}
      className="!bg-gray-gray3 dark:!bg-gray-gray95 rounded w-full !h-[34px] text-sm"
      onChange={(val: string) => {
        onEditPatternItem?.("Separator", val, null);
        onChange?.(val);
      }}
    />
  );
};

const ElementSelectWrapper = (props: Record<string, any>) => {
  const { onEditPatternItem, elementConfig, editingPatternItemValue, ...rest } =
    props;
  return (
    <DynamicSelect
      {...rest}
      showSearch
      allowClear
      dynamicValue={elementConfig}
      value={editingPatternItemValue?.PatternObjectId}
      onChange={(value: string, option: IOption) => {
        onEditPatternItem?.(
          "PatternObjectId",
          value,
          option?.label?.split(" - ")[1],
        );
        props.onChange?.(value);
      }}
    />
  );
};

const TextInputWrapper = (props: Record<string, any>) => {
  const { onEditPatternItem, ...rest } = props;
  return (
    <InputText
      {...rest}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onEditPatternItem?.("Text", e.target.value, null);
        props.onChange?.(e);
      }}
    />
  );
};

export const PatternForm = ({
  form,
  activePage,
  handleClearAll,
}: {
  form: FormInstance;
  activePage: IPage;
  handleClearAll: () => void;
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const typeValue = Form.useWatch("type", form);

  const [editingItem, setEditingItem] = useState<IPatternItem | null>(null);

  const separatorOptions = [
    {
      label: "/",
      value: "/",
    },
    {
      label: "-",
      value: "-",
    },
    {
      label: "_",
      value: "_",
    },
    {
      label: ".",
      value: ".",
    },
    {
      label: ",",
      value: ",",
    },
    {
      label: "|",
      value: "|",
    },

    {
      label: "%",
      value: "%",
    },
    {
      label: "*",
      value: "*",
    },
    {
      label: "#",
      value: "#",
    },
    {
      label: "&",
      value: "&",
    },
  ];
  const elementConfig = {
    addWebUrl: "/api/mng/select/patternObject4SelectOption",
    endpoint: "/api/mng/select/patternObject4SelectOption",
    repoViewId: null,
  };

  const patternItemsValue = activePage?.pageData?.find(
    (item) => item.name === "PatternItem",
  )?.value;

  const correctPatternItemsValue: IPatternItem =
    patternItemsValue?.find((item) => item.key === editingItem?.key) || null;

  const handleSelectPatternItem = (item: IPatternItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      type: item.PatternObjectId ? fieldType.element : fieldType.constant,
      PatternObjectId: item.PatternObjectId,

      Text: item.Text,
      Separator: item.Separator,
    });
  };

  const handleEditPatternItem = (field: string, value: any, desc: string) => {
    if (!editingItem) return;

    const newPatternItemsValue = patternItemsValue?.map((item) => {
      if (item.key === editingItem.key) {
        const updates: Partial<IPatternItem> = {
          [field]: value,
          ...(desc != null && { PatternObjectDesc: desc }),
        };
        if (field === "Text") {
          updates.PatternObjectId = null;
          updates.PatternObjectDesc = null;
        }
        return {
          ...item,
          ...updates,
        };
      }
      return item;
    });

    form.setFieldsValue({
      [field]: value,
      ...(field === "Text" && { PatternObjectId: null }),
    });
    dispatch(
      setPageData({
        name: "PatternItem",
        value: newPatternItemsValue,
      }),
    );
  };
  const handleClear = () => {
    setEditingItem(null);
    form.setFieldsValue({
      type: fieldType.element,
      PatternObjectId: null,
      Text: null,
      Separator: null,
    });
  };

  const handleAddPatternItem = () => {
    const newItem: IPatternItem = {
      key: Math.floor(Math.random() * 100000),
      PatternObjectId: null,
      PatternObjectDesc: null,
      Text: null,
      Separator: "/",
      Order: patternItemsValue?.length + 1 || 1,
    };
    dispatch(
      setPageData({
        name: "PatternItem",
        value: [...patternItemsValue, newItem],
      }),
    );
    setEditingItem(newItem);
  };

  const handleDeletePatternItem = (itemId: number) => {
    dispatch(
      setPageData({
        name: "PatternItem",
        value: patternItemsValue?.filter((item) => item.key !== itemId),
      }),
    );
  };

  const renderPatternItems = () => {
    return patternItemsValue
      ?.slice()
      ?.sort((a, b) => a.Order - b.Order)
      ?.map((item: IPatternItem) => (
        <div
          className={`flex items-center gap-2 text-xs w-fit relative ${
            editingItem?.key === item.key
              ? "border border-dashed border-black-black8 p-2 rounded "
              : ""
          }`}
          onClick={() => handleSelectPatternItem(item)}
          key={item.key}
        >
          {editingItem?.key === item.key && (
            <div
              className="-top-2 -right-2 absolute bg-red-500 rounded-full cursor-pointer"
              onClick={() => handleDeletePatternItem(item.key)}
            >
              <CloseCircle config={{ width: 16, height: 16, stroke: "#fff" }} />
            </div>
          )}
          <div>{item.Separator}</div>
          <div>{item.PatternObjectId ? item.PatternObjectDesc : item.Text}</div>
        </div>
      ));
  };

  const renderClearEditItem = () => {
    return (
      <CustomButton
        type="text"
        onClick={handleClear}
        className="bg-black-black8 hover:bg-white me-4 px-2 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
      >
        <PlusOutline />
      </CustomButton>
    );
  };

  return (
    <div className="gap-3 grid grid-cols-6 px-2">
      <div className="col-span-6">
        <div className="grid grid-cols-2">
          <Form.Item
            label="عنوان الگو"
            name="PatternDesc"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText
              config={{
                name: "PatternDesc",
                caption: "عنوان الگو",
                help: "",
                placeHolder: "",
                type: "text",
                selectEndpoint: {},
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        </div>
      </div>

      <div className="col-span-2">
        <Form.Item
          label="تعداد شماره های اندیکاتور"
          name="IndicatorCount"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber
            controls={false}
            config={{
              name: "IndicatorCount",
              caption: "تعداد شماره های اندیکاتور",
              help: "",
              placeHolder: "",
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>
      <div className="col-span-2">
        <Form.Item
          label="شماره شروع"
          name="StartNumber"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber
            controls={false}
            config={{
              name: "StartNumber",
              caption: "شماره شروع",
              help: "",
              placeHolder: "",
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>
      <div className="col-span-2">
        <Form.Item
          label="شماره پایان"
          name="EndNumber"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber
            controls={false}
            config={{
              name: "EndNumber",
              caption: "شماره پایان",
              help: "",
              placeHolder: "",
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </div>
      <div className="col-span-2 p-2 border-2 border-dashed">
        <Form.Item
          name="ResetYear"
          valuePropName="checked"
          initialValue={false}
          className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
        >
          <CustomCheckbox
            config={{
              name: "ResetYear",
              caption: "در سال مالی باز نشانی شود",
              help: "",
              placeHolder: "",
              type: "checkbox",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          >
            در سال مالی باز نشانی شود
          </CustomCheckbox>
        </Form.Item>
      </div>
      <span className="col-span-6 text-xs">آیتم های الگو به ترتیب</span>
      <div className="flex flex-wrap gap-2 col-span-6 bg-gray-gray3 p-4 rounded">
        {renderClearEditItem()}
        {renderPatternItems()}
      </div>
      <Form.Item
        label="نوع"
        name="type"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
      >
        <Radio.Group
          value={
            correctPatternItemsValue?.PatternObjectId
              ? fieldType.element
              : fieldType.constant
          }
          className="flex gap-16"
        >
          <Radio value={fieldType.element}>المان</Radio>
          <Radio value={fieldType.constant}>مقدار ثابت</Radio>
        </Radio.Group>
      </Form.Item>
      {typeValue === fieldType.element ? (
        <Form.Item
          label="المان"
          name="PatternObjectId"
          className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
        >
          <ElementSelectWrapper
            onEditPatternItem={handleEditPatternItem}
            elementConfig={elementConfig}
            editingPatternItemValue={correctPatternItemsValue}
          />
        </Form.Item>
      ) : (
        <Form.Item
          label="مقدار ثابت"
          name="Text"
          className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
        >
          <TextInputWrapper onEditPatternItem={handleEditPatternItem} />
        </Form.Item>
      )}
      <Form.Item
        label="جدا کننده"
        name="Separator"
        className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
      >
        <SeparatorSelectWrapper
          onEditPatternItem={handleEditPatternItem}
          separatorOptions={separatorOptions}
        />
      </Form.Item>
      <Form.Item className="flex justify-end items-end col-span-2 m-0 text-xs">
        <div className="flex justify-end items-end gap-2">
          <CustomTooltip title={t("general.newForm")}>
            <CustomButton
              type="text"
              onClick={handleClearAll}
              className="bg-black-black8 hover:bg-white px-2 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
            >
              <PlusOutline />
            </CustomButton>
          </CustomTooltip>
          <CustomButton
            type="text"
            onClick={handleAddPatternItem}
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {t("general.add")}
          </CustomButton>
        </div>
      </Form.Item>
    </div>
  );
};
