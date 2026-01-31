import React from 'react';

import {
  Form,
  FormInstance,
  Skeleton,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';

interface IProps {
  relatedStockIsLoading: boolean;
  form: FormInstance;
}
function InventoryTypesForm(props: IProps) {
  const { relatedStockIsLoading, form } = props;
  const { pageData } = useAppSelector(
    (state) => ({
      pageData: state.withPersist.pages.find((p) => p.isActive)?.pageData,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const t = useTranslations();

  const handleChangeCheckbox = (name, id, value) => {
    const temp = pageData
      .find((item) => item.name === name)
      ?.value?.map((it) => (it.name == id ? { ...it, value: value } : it));
    console.log(pageData.find((i) => i.name == name)?.value, temp);

    dispatch(setPageData({ name: name, value: temp }));
  };

  return (
    <Form
      layout="vertical"
      className="content-start gap-4 grid grid-cols-2 h-full"
      form={form}
    >
      <Form.Item
        name="InventoryDesc"
        className="col-span-2 lg:col-span-1"
        label={t("general.title")}
        rules={[{ required: true, message: t("form.required") }]}
      >
        <InputText config={{ name: "InventoryDesc" }} />
      </Form.Item>
      <Form.Item
        name="Rate"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-2 lg:col-span-1"
        label={t("general.rate")}
      >
        <CustomInputNumber config={{ name: "Rate" }} />
      </Form.Item>

      <div className="hidden lg:block col-span-2 lg:col-span-1"></div>
      <div className="relative gap-4 grid grid-cols-2 col-span-2 h-[calc(100vh-310px)] lg:h-[calc(100vh-290px)]">
        <div className="hidden-show-scrollbar col-span-2 lg:col-span-1 p-3 border-2 border-dashed overflow-y-auto">
          <span className="-top-3 z-10 absolute bg-main-white dark:bg-gray-gray13 px-3 start-0">
            {t("general.relatedInventory")}
          </span>
          {relatedStockIsLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
            </div>
          ) : (
            <>
              {pageData
                ?.find((i) => i.name == "StockIds")
                ?.value?.map((s, i) => (
                  <div key={i}>
                    <CustomCheckbox
                      onChange={(e) => {
                        handleChangeCheckbox(
                          "StockIds",
                          s.name,
                          e.target.checked
                        );
                      }}
                      checked={s.value}
                    />
                    {s.caption}
                  </div>
                ))}
            </>
          )}
        </div>
        <div className="hidden-show-scrollbar col-span-2 lg:col-span-1 p-3 border-2 border-dashed overflow-y-auto">
          <span className="-top-3 z-10 absolute bg-main-white dark:bg-gray-gray13 px-3 start-[calc(50%+8px)]">
            {t("general.relatedDocument")}
          </span>
          {relatedStockIsLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
              <Skeleton.Button block size="small" active={true} />
            </div>
          ) : (
            <>
              {pageData
                ?.find((i) => i.name == "VoucherTypeIds")
                ?.value?.map((vt, i) => (
                  <div key={i}>
                    <CustomCheckbox
                      onChange={(e) => {
                        handleChangeCheckbox(
                          "VoucherTypeIds",
                          vt.name,
                          e.target.checked
                        );
                      }}
                      checked={vt.value}
                    />
                    {vt.caption}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </Form>
  );
}

export default InventoryTypesForm;
