import React, {
  useEffect,
  useState,
} from 'react';

import type { FormInstance } from 'antd/es/form';
import { Form } from 'antd/lib';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTextArea,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  PlusIcon,
  TrashBin,
} from '@components/atoms/iconComponents';
import DynamicRadio from '@components/molecules/dynamicRadioList';
import { IRequestConfig } from '@type/elementType';

interface MessageFormProps {
  form: FormInstance;
}

function MessagingForm({ ...props }: MessageFormProps) {
  const t = useTranslations();
  const [formType, setFormType] = useState<boolean>(true);
  const { form } = props;
  const handleSubmitForm = () => {};
  const temp = Form.useWatch("FilterType", form);
  useEffect(() => {
    if (temp && temp !== formType) {
      if (temp === "SendToAll") {
        setFormType(true);
      } else if (temp === "SendToSpecifics") {
        setFormType(false);
      }
    }
  }, [temp]);
  const userDynamicValue: IRequestConfig = {
    addWebUrl: "",
    endpoint: "",
    repoViewId: 1111,
  };
  const packageDynamicValue: IRequestConfig = {
    addWebUrl: "",
    endpoint: "",
    repoViewId: 1111,
  };
  const handleSetContent = (e) => {
    console.log(e);
  };
  const [value, setValue] = useState("");

  return (
    <>
      <h1 className="mb-4 font-medium text-gray-gray12 text-md">
        {" "}
        {t("general.recipientsFilter")}
      </h1>
      <Form
        form={form}
        layout="vertical"
        name="messaging"
        className="hidden-show-scrollBar gap-4 grid grid-cols-2 w-full h-full overflow-y-auto"
        onFinish={handleSubmitForm}
      >
        <Form.Item
          layout="horizontal"
          className="flex col-span-2 sm:col-span-1"
          name={"FilterType"}
          label={
            <div className="pl-5 font-medium !text-gray-gray10 text-sm">
              نوع
            </div>
          }
        >
          <DynamicRadio
            item={{
              radioValues: [
                { caption: "ارسال به همه", value: "SendToAll" },
                { caption: "انتخاب کاربران خاص", value: "SendToSpecifics" },
              ],
            }}
            config={{ name: "FilterType", setFieldValue: form.setFieldValue }}
          />
        </Form.Item>

        <Form.Item
          className="flex items-center col-span-2 sm:col-span-1"
          name={"Subject"}
        >
          <CustomCheckbox
            config={{ name: "sendAsInfo", setFieldValue: form.setFieldValue }}
            name={"sendAsInfo"}
          />
          <span className="px-2">{"ارسال پیام به صورت اطلاعیه"}</span>
        </Form.Item>

        {formType ? (
          <Form.Item
            className="col-span-2 sm:col-span-1"
            name={"UserName"}
            label={"نام کاربر"}
          >
            <DynamicSelect
              showSearch
              dynamicValue={userDynamicValue}
              infinite
              showId
              config={{
                name: "UserName",
                setFieldValue: form.setFieldValue,
              }}
              form={form}
            />
          </Form.Item>
        ) : (
          <div className={`col-span-2 sm:col-span-1 h-0 sm:h-[88px] `}></div>
        )}
        <div className="relative flex sm:flex-row flex-col justify-around items-center gap-2 col-span-2 sm:col-span-1 w-full">
          <span className="-top-3 absolute px-2 start-5">
            بازه زمانی عضویت در سیستم
          </span>
          <Form.Item
            name={"StartDuration"}
            label={"از"}
            layout="horizontal"
            className="my-auto w-full"
          >
            <div
              onClick={() => {
                console.log("here");
              }}
            >
              <NewDatePicker
                config={{
                  name: "StartDuration",
                  setFieldValue: form.setFieldValue,
                }}
              />
            </div>
          </Form.Item>{" "}
          <Form.Item
            name={"EndDuration"}
            label={"تا"}
            layout="horizontal"
            className="my-auto w-full"
          >
            <NewDatePicker
              config={{
                name: "EndDuration",
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
          <div className="w-24"></div>
        </div>
        <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
          <div className="col-span-2 sm:col-span-1 w-full h-[88px]">
            <Form.Item
              name={"packageType"}
              label={"نوع پکیج"}
              className="h-[88px]"
            >
              <DynamicSelect
                showSearch
                dynamicValue={packageDynamicValue}
                infinite
                showId
                config={{
                  name: "packageType",
                  setFieldValue: form.setFieldValue,
                }}
                form={form}
              />
            </Form.Item>
          </div>
          <div className="col-span-2 sm:col-span-1 border border-dashed w-full h-[88px]">
            <div className="flex bg-main-white px-2 w-fit -translate-y-3">
              {"نوع دستگاه"}
            </div>
            <div className="flex justify-between sm:justify-around items-center gap-2">
              <Form.Item
                className="flex items-start col-span-2 sm:col-span-1 w-full"
                name={"Subject"}
              >
                <CustomCheckbox
                  config={{
                    name: "sendAsInfo",
                    setFieldValue: form.setFieldValue,
                  }}
                  name={"sendAsInfo"}
                />
                <span className="px-2">{"دسکتاپ"}</span>
              </Form.Item>
              <Form.Item
                className="flex items-start col-span-2 sm:col-span-1 w-full"
                name={"Subject"}
              >
                <CustomCheckbox
                  config={{
                    name: "sendAsInfo",
                    setFieldValue: form.setFieldValue,
                  }}
                  name={"sendAsInfo"}
                />
                <span className="px-2">{"موبایل"}</span>
              </Form.Item>
            </div>
          </div>
        </div>

        <Incrementals form={form} />

        <Form.Item className="col-span-2" name={"Subject"} label={"موضوع"}>
          <InputText
            config={{ name: "subject", setFieldValue: form.setFieldValue }}
          />
        </Form.Item>
        <Form.Item className="col-span-2" name={"Description"} label={"شرح"}>
          <CustomTextArea rows={4} config={{ name: "description" }} />
          {/* <TextEditor value={value}  setValue={setValue} /> */}
        </Form.Item>
      </Form>
    </>
  );
}

export default MessagingForm;
const emptyElement = () => ({
  key: Math.random(),
  name: null,
  value: null,
});

const Incrementals = ({ form }: { form: FormInstance }) => {
  const [elements, setElements] = useState([emptyElement()]);

  const handleAddElement = () => {
    setElements([...elements, emptyElement()]);
  };

  const handleDeleteElement = (key: number) => {
    setElements(elements.filter((item) => item.key !== key));
  };

  const packageDynamicValue: IRequestConfig = {
    addWebUrl: "",
    endpoint: "",
    repoViewId: 1111,
  };

  return (
    <div className="flex flex-col gap-4 col-span-2 sm:col-span-1 w-full">
      {elements.map((el, index) => (
        <div
          key={el.key}
          className="relative flex sm:flex-row flex-col justify-around items-end gap-2 col-span-2 sm:col-span-1 w-full"
        >
          <Form.Item
            name={["elements", index, "element"]}
            label={"مورد"}
            className="w-full"
          >
            <DynamicSelect
              showSearch
              dynamicValue={packageDynamicValue}
              infinite
              showId
              config={{
                name: `elements[${index}].element`,
                setFieldValue: form.setFieldValue,
              }}
              form={form}
            />
          </Form.Item>

          <Form.Item
            name={["elements", index, "count"]}
            label={"تعداد"}
            className="w-full"
          >
            <DynamicSelect
              showSearch
              dynamicValue={packageDynamicValue}
              infinite
              showId
              config={{
                name: `elements[${index}].count`,
                setFieldValue: form.setFieldValue,
              }}
              form={form}
            />
          </Form.Item>

          <div className="flex items-center h-full">
            {index === 0 ? (
              <CustomButton
                type="text"
                className="bg-main-black dark:bg-main-white m-0 p-2 h-[34px] text-main-white dark:text-main-black translate-y-[3px]"
                onClick={handleAddElement}
              >
                <PlusIcon config={{ width: 24, height: 26 }} />
              </CustomButton>
            ) : (
              <CustomButton
                type="text"
                className="m-0 p-2 h-[34px] translate-y-[3px]translate-y-[3px]"
                onClick={() => handleDeleteElement(el.key)}
              >
                <TrashBin config={{ width: 24, height: 24, stroke: "#f00" }} />
              </CustomButton>
            )}
          </div>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-1 border border-dashed w-full h-[88px]">
        <div className="flex bg-main-white px-2 w-fit -translate-y-3">
          {"مالکیت حساب"}
        </div>
        <div className="flex justify-between sm:justify-around items-center gap-2 w-full">
          <Form.Item
            className="flex items-start col-span-2 sm:col-span-1 w-full"
            name={"Subject"}
          >
            <CustomCheckbox
              config={{
                name: "sendAsInfo",
                setFieldValue: form.setFieldValue,
              }}
              name={"sendAsInfo"}
            />
            <span className="px-2">{"کاربر اصلی"}</span>
          </Form.Item>
          <Form.Item
            className="flex items-start col-span-2 sm:col-span-1 w-full"
            name={"Subject"}
          >
            <CustomCheckbox
              config={{
                name: "sendAsInfo",
                setFieldValue: form.setFieldValue,
              }}
              name={"sendAsInfo"}
            />
            <span className="px-2">{"کاربر عادی"}</span>
          </Form.Item>
        </div>
      </div>
    </div>
  );
};
