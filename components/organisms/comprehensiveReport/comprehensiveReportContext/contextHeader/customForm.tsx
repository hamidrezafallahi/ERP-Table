import React, {
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';

import {
  Checkbox,
  Form,
  FormInstance,
  Radio,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import { setPageFilters } from '@slice/pages';
import { IViewData } from '@slice/pages/type';

import { ManualReport } from '../../../report';
import {
  checkboxItems,
  neededFields,
} from './content';
import { CurrencyReportEnum } from './enum';

interface CustomFormProps {
  setMutateIsLoading: Dispatch<SetStateAction<boolean>>;
  sidebarForm: FormInstance<any>;
  setReportState: Dispatch<
    SetStateAction<{
      viewDataFilter: Partial<IViewData>;
      tableData: any[];
      cardData: any;
    }>
  >;
}

export default function CustomForm(props: CustomFormProps) {
  const { sidebarForm, setReportState, setMutateIsLoading } = props;
  const t = useTranslations();
  const [form] = Form.useForm();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const dispatch = useDispatch();
  const sidebarFormValues = Form.useWatch([], sidebarForm);
  const { viewData, activePage } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData,
      activePage: state.withPersist.pages?.find((p) => p.isActive),
    }),
    shallowEqual,
  );

  useEffect(() => {
    setMutateIsLoading(mutateIsLoading);
  }, [mutateIsLoading]);

  useEffect(() => {
    if (viewData) {
      form.setFieldsValue(viewData);
      setReportState((prev) => ({
        ...prev,
        cardData: [],
        tableData: [],
      }));
    }
  }, [viewData]);

  const viewDataFilter = neededFields?.reduce((acc, key) => {
    acc[key] = viewData?.[key];
    return acc;
  }, {} as Partial<IViewData>);

  useEffect(() => {
    if (activePage && viewData && viewData.CurrencyReportType === undefined) {
      const defaultValues = {
        CurrencyReportType: CurrencyReportEnum.IsRial,
        ShowInadept: true,
        ShowCreditor: true,
        ShowHasRemain: true,
        ShowHasNotRemain: true,
      };
      dispatch(setPageFilters(defaultValues));
    }
  }, [activePage, viewData, dispatch]);

  const handleSubmit = async () => {
    const simple = sidebarFormValues.ReportType === "Simple";
    const fieldsToValidate = simple
      ? ["ColsType", "ReportType", "ReportMode"]
      : ["ColsType", "ReportType"];
    await sidebarForm.validateFields(fieldsToValidate);
    const commonBody = {
      ShowMode: "Normal",
      ShowInadept: viewData?.ShowInadept,
      ShowCreditor: viewData?.ShowCreditor,
      ShowHasRemain: viewData?.ShowHasRemain,
      ShowHasNotRemain: viewData?.ShowHasNotRemain,
      ReportMode: viewData?.ReportMode,
      ColsType: viewData?.ColsType,
      CurrencyReportType: viewData?.CurrencyReportType,
      StartDate: viewData?.StartDate,
      EndDate: viewData?.EndDate,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 10000,
      },
      Filters: viewData?.Filters,
    };
    const url = simple
      ? "/api/acc/select/globalReport"
      : "/api/acc/select/globalanalyzereport";
    const body = simple
      ? commonBody
      : {
          ...commonBody,
          GrohGroupLevel: viewData?.GrohGroupLevel,
          ColGroupLevel: viewData?.ColGroupLevel,
          MoeenGroupLevel: viewData?.MoeenGroupLevel,
          FourthLevelGroup: viewData?.FourthLevelGroup,
          FifthLevelGroup: viewData?.FifthLevelGroup,
          SixthLevelGroup: viewData?.SixthLevelGroup,
          SeventhLevelGroup: viewData?.SeventhLevelGroup,
          EightLevelGroup: viewData?.EightLevelGroup,
          NinthLevelGroup: viewData?.NinthLevelGroup,
          TenthLevelGroup: viewData?.TenthLevelGroup,
          EleventhLevelGroup: viewData?.EleventhLevelGroup,
          TwelfthLevelGroup: viewData?.TwelfthLevelGroup,
          ThirteenthLevelGroup: viewData?.ThirteenthLevelGroup,
        };
    const res = await mutateItem({
      url,
      body,
    }).unwrap();
    if (res?.Result == "Success") {
      const tableDataWithDesc =
        res?.Data?.map((item) => ({
          ...item,
        })) ?? [];
      setReportState({
        tableData: tableDataWithDesc,
        cardData: res?.Data,
        viewDataFilter,
      });
    }
  };

  return (
    <div>
      <Form
        form={form}
        name="contextForm"
        layout="vertical"
        onFinish={handleSubmit}
        className="gap-4 grid grid-cols-12"
        initialValues={{
          ShowInadept: true,
          ShowCreditor: true,
          ShowHasRemain: true,
          ShowHasNotRemain: true,
          CurrencyReportType: 1,
        }}
        onValuesChange={(_, allValues) => {
          dispatch(setPageFilters(allValues));
        }}
      >
        <Form.Item
          name="CurrencyReportType"
          label="براساس"
          className="col-span-12 lg:col-span-6 !mb-0"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <Radio.Group className="flex gap-10">
            <Radio value={CurrencyReportEnum.IsRial}>ریال</Radio>
            <Radio value={CurrencyReportEnum.IsRefer}>تعداد</Radio>
            <Radio value={CurrencyReportEnum.IsCurrency}>ارز</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="flex flex-wrap gap-10 col-span-12">
          {checkboxItems.map((item) => (
            <Form.Item
              key={item.name}
              name={item.name}
              valuePropName="checked"
              initialValue={item.defaultValue ?? true}
              className="m-0 p-0 text-xs"
            >
              <Checkbox>{item.label}</Checkbox>
            </Form.Item>
          ))}
        </div>
        <div className="flex justify-end items-end col-span-12">
          <Form.Item className="m-0 p-0 text-xs">
            <div className="flex gap-2">
              <ManualReport
                reportBtnName={"چاپ"}
                rules={[
                  {
                    condition: (x) => x.ColsType === 2,

                    apiUrl: "/api/acc/select/globalReport",

                    reportFile: {
                      fileUrl: "/reports/JameSimple2Column.mrt",
                      dataSourceName: "globalReport",
                    },
                  },

                  {
                    condition: (x) => x.ColsType === 4,

                    apiUrl: "/api/acc/select/globalReport",

                    reportFile: {
                      fileUrl: "/reports/JameSimple4Column.mrt",
                      dataSourceName: "globalReport",
                    },
                  },
                  {
                    condition: (x) => x.ColsType === 6,

                    apiUrl: "/api/acc/select/globalReport",

                    reportFile: {
                      fileUrl: "/reports/JameSimple6Column.mrt",
                      dataSourceName: "globalReport",
                    },
                  },
                ]}
              />
              <CustomButton
                type="text"
                htmlType="submit"
                className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
              >
                {mutateIsLoading ? (
                  <Spin size="large" indicator={<SpinIcon />} />
                ) : (
                  t("general.show")
                )}
              </CustomButton>
            </div>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
