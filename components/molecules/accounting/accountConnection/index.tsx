"use client";
import {
  FC,
  useEffect,
} from 'react';

import {
  Checkbox,
  Form,
  FormProps,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import type { IRequest } from '@services/acc/account/type';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { showSuccessToast } from '@utils/toast';

import type {
  IDataConnection,
  IProps,
} from './type';

const levelTextMapping = (level: number) => {
  const levelMap: { [key: number]: string } = {
    4: "تفصیلی",
    5: "سطح پنجم",
    6: "سطح ششم",
    7: "سطح هفتم",
    8: "سطح هشتم",
    9: "سطح نهم",
    10: "سطح دهم",
    11: "سطح یازدهم",
    12: "سطح دوازدهم",
    13: "سطح سیزدهم",
  };

  return levelMap[level] || `سطح ${level}`;
};

export const AccountConnection: FC<IProps> = ({ id, onClose }) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { data } = useGetData<IDataConnection[], IRequest>({
    url: "/api/acc/select/tafsiliTypeWithLevel",
    body: {
      RepoViewId: 10004,
      AccountId: id,
    },
    skip: !id,
    id: id,
  });

  const dataOfLevel = data?.Data;

  const [trigger, { isLoading }] = useCUDDataMutation();

  const onSubmit: FormProps<any>["onFinish"] = async (values) => {
    let command = [];

    Object.entries(values).forEach(([key, value]) => {
      const [assigneLevel, tafsiliTypeId, initValue] = key.split("-");
      const initialValue = initValue === "true";
      if (initialValue !== value) {
        command.push({
          TafsiliTypeId: parseInt(tafsiliTypeId, 10),
          AssigneLevel: parseInt(assigneLevel, 10),
          Mode: value ? "emInsert" : "emDelete",
        });
      }
    });

    try {
      const triggerMultiAccountResponse = await trigger({
        url: "/api/acc/insert/multiAccountTafsili",
        body: {
          ReturnInsertedRow: false,
          AccountId: id,
          AccountTafsiliMultiAddCommands: command,
        },
        id: id,
      }).unwrap();

      if (triggerMultiAccountResponse?.Result === "Success") {
        dispatch(
          apiService.util.invalidateTags([
            { type: "tafsilitypewithlevel", id: id },
            { type: "account", id: "All" },
            { type: "account", id: id },
          ])
        );

        showSuccessToast(t("toast.save"));
        command = [];
        form.resetFields();
        onClose();
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (dataOfLevel) {
      form.resetFields();
      dataOfLevel.map((item) =>
        item?.TafsilyTypes?.map((data) =>
          form.setFieldValue(
            `${item.Level}-${data.TafsilyTypeId}-${data.IsSelected}`,
            data.IsSelected
          )
        )
      );
    }
    return () => form.resetFields();
  }, [data, dataOfLevel, form]);

  return (
    <Form
      className="flex flex-col gap-2 p-4"
      name="AccountConnection"
      layout="vertical"
      onFinish={onSubmit}
      form={form}
      autoComplete="off"
    >
      <div
        className={`lg:flex lg:flex-wrap lg:gap-2 lg:w-fit grid gap-2 hidden-show-scrollBar p-2`}
      >
        {dataOfLevel?.map((item, index) => {
          return (
            <div key={index}>
              {item?.TafsilyTypes?.length > 0 && (
                <div className="flex flex-col flex-shrink-0 gap-4 w-auto">
                  <div className="bg-gray-gray3 dark:bg-gray-gray10 py-2 text-center">
                    {levelTextMapping(item.Level)}
                  </div>
                  <div>
                    {item?.TafsilyTypes?.map((data) => {
                      return (
                        <div
                          key={`${item.Level}-${data.TafsilyTypeId}-${data.IsSelected}`}
                        >
                          <Form.Item<any>
                            name={`${item.Level}-${data.TafsilyTypeId}-${data.IsSelected}`}
                            valuePropName="checked"
                            className="m-0 p-0 text-xs"
                          >
                            <Checkbox>{data.TafsilyDesc}</Checkbox>
                          </Form.Item>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Form.Item className="m-0 p-0 text-xs">
        <div
          className={`lg:flex lg:justify-end  lg:items-center lg:gap-2 grid grid-cols-1 bg-white pt-4 border-t border-t-gray-gray5 w-full text-xs`}
        >
          <CustomButton
            htmlType="submit"
            type="text"
            loading={isLoading}
            className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-1 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
          >
            {t("general.submit")}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
