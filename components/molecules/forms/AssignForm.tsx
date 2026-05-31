import {
  Key,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import type {
  FormProps,
  TableColumnsType,
} from 'antd';
import {
  Divider,
  Form,
  Pagination,
  Radio,
  Table,
} from 'antd';
import dayjs from 'dayjs';
import jalali from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  EditPencil,
  LeftChevron,
  New,
  RightChevron,
  TrashBin,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import type { IBaseQueryResponse } from '@services/base/type';
import { getSystemNameById } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

type FieldType = {
  RoleId: number[];
  UserId: number[];
  ExpireDate: string;
  IsAssignToMe: boolean;
  IsAssign: boolean;
  IsCanUpdate: boolean;
  IsCanDelete: boolean;
  IsCanShare: boolean;
  AssignId: null;
};
interface ISelect4Assign {
  roleList: IRoleList[];
  userList: IUserList[];
}
interface IRoleList {
  roleId: number;
  roleName: string;
}
interface IUserList {
  userId: number;
  userName: string;
}
function AssignForm() {
  const params = useSearchParams();
  const ReferId = Number(params.get("id"));
  const [form] = Form.useForm();
  const [selectedRadio, setSelectedRadio] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [assignId, setAssignId] = useState(null);
  const t = useTranslations();
  const { SystemId, RepoId } = useAppSelector(
    (state) => ({
      SystemId: state.withPersist.pages?.find((item) => item.isActive).SystemId,
      RepoId: state.withPersist.pages?.find((item) => item.isActive).RepoId,
    }),
    shallowEqual,
  );

  const { data: tableResponse, refetch } = useGetData<ISelect4Assign, any>({
    url: `/api/${getSystemNameById(SystemId)}/select4form/assign `,
    body: {
      RepoId,
      ReferId,
      RepoViewId: 23,
    },
  });
  const [trigger] = useCUDDataMutation();
  const [getData] = useGetConditionallyMutation();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    let body;
    const changeFields = [
      "RoleId",
      "UserId",
      "ExpireDate",
      "IsAssign",
      "IsCanUpdate",
      "IsCanDelete",
      "IsCanShare",
      "IsAssignToMe",
    ];
    const expireDate = form.getFieldValue("ExpireDate");
    if (values.AssignId == null) {
      body = {
        RepoId,
        ReferIds: [ReferId],
        UserIds: selectedRadio == 2 ? [form.getFieldValue("UserId")] : [],
        RoleIds: selectedRadio == 3 ? [form.getFieldValue("RoleId")] : [],
        IsAssignToMe: selectedRadio == 1,
        ExpireDate: expireDate ? dayjs(expireDate).toISOString() : null,
        IsAssign: form.getFieldValue("IsAssign"),
        IsCanUpdate: form.getFieldValue("IsCanUpdate"),
        IsCanDelete: form.getFieldValue("IsCanDelete"),
        IsCanShare: form.getFieldValue("IsCanShare"),
        AssignId: form.getFieldValue("AssignId"),
      };
    } else {
      body = {
        UserId: selectedRadio == 2 ? form.getFieldValue("UserId") : null,
        RoleId: selectedRadio == 3 ? form.getFieldValue("RoleId") : null,
        IsAssignToMe: selectedRadio == 1,
        ExpireDate: expireDate ? dayjs(expireDate).toISOString() : null,
        IsAssign: form.getFieldValue("IsAssign"),
        IsCanUpdate: form.getFieldValue("IsCanUpdate"),
        IsCanDelete: form.getFieldValue("IsCanDelete"),
        IsCanShare: form.getFieldValue("IsCanShare"),
        AssignId: form.getFieldValue("AssignId"),
        ChangeFields: changeFields,
      };
    }
    try {
      const submitFormResponse = await trigger({
        url: `/api/${getSystemNameById(SystemId)}/${
          values.AssignId == null ? "insert" : "update"
        }/assign`,
        body: body,
      }).unwrap();

      if (submitFormResponse?.Result == "Success") {
        showSuccessToast(t("toast.successTitle"));
        refetch();
      }
    } catch (err) {
      null;
    }
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };
  const handleRadioChange = (e) => {
    setSelectedRadio(e.target.value);
  };
  const valueOptionUser = {
    repoViewId: 20014,
    addWebUrl: "api/auth/select/user4selectOption",
    endpoint: "api/auth/select/user4selectOption",
  };
  const valueOptionRole = {
    repoViewId: 20015,
    addWebUrl: "/api/auth/select/role4selectOption",
    endpoint: "/api/auth/select/role4selectOption",
  };
  const handleResetForm = () => {
    form.resetFields();
    setAssignId(null);
    setSelectedRadio(1);
  };
  const handleFetchFormData = async (AssignId) => {
    // TODO: add type
    try {
      const formResponse: IBaseQueryResponse<any> = await getData({
        url: `/api/${getSystemNameById(SystemId)}/select/assign`,
        body: {
          Id: AssignId,
        },
      }).unwrap();

      if (formResponse?.Result === "Success") {
        setSelectedRadio(
          formResponse?.Data[0]?.IsAssignToMe
            ? 1
            : formResponse?.Data[0]?.UserId
              ? 2
              : 3,
        );
        form.setFieldValue("RoleId", formResponse.Data[0].RoleId);
        form.setFieldValue("UserId", formResponse.Data[0].UserId);
        form.setFieldValue("IsAssignToMe", formResponse.Data[0].IsAssignToMe);
        form.setFieldValue("IsAssign", formResponse.Data[0].IsAssign);
        form.setFieldValue("IsCanUpdate", formResponse.Data[0].IsCanUpdate);
        form.setFieldValue("IsCanDelete", formResponse.Data[0].IsCanDelete);
        form.setFieldValue("IsCanShare", formResponse.Data[0].IsCanShare);
        form.setFieldValue("AssignId", formResponse.Data[0].AssignId);
        if (formResponse.Data[0].ExpireDate === "0001-01-01T00:00:00+00:00") {
          form.setFieldValue("ExpireDate", dayjs()); // اینجا باید زمان مورد نظر برای شرایط مادام العمر قرار داد
        } else {
          form.setFieldValue(
            "ExpireDate",
            dayjs(formResponse.Data[0].ExpireDate),
          );
        }
      }
    } catch (err) {
      null;
    }
  };

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };
  useEffect(() => {
    if (assignId) {
      handleFetchFormData(assignId);
    }
  }, [assignId]);

  return (
    <div className="bg-gray-gray05 dark:!bg-black-black5 px-8 py-5 w-full h-full overflow-y-auto">
      <Form
        name="assign"
        initialValues={{
          RoleId: [],
          UserId: [],
          ExpireDate: dayjs(),
          IsAssignToMe: false,
          IsAssign: false,
          IsCanUpdate: false,
          IsCanDelete: false,
          IsCanShare: false,
          AssignId: null,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className=""
        form={form}
      >
        <Form.Item name="AssignId" hidden>
          <CustomCheckbox className={"hidden"} />
        </Form.Item>
        <Form.Item name="IsAssignToMe" hidden>
          <CustomCheckbox className={"hidden"} />
        </Form.Item>
        <div className="flex items-center gap-6 w-full">
          <div className="w-full">
            <Radio.Group
              name="assign"
              className="w-full"
              value={selectedRadio}
              onChange={handleRadioChange}
            >
              <Form.Item<FieldType>
                label={
                  <Radio
                    value={1}
                    name="IsAssignToMe"
                    className={`${
                      selectedRadio && selectedRadio !== 1 && "text-gray-gray7"
                    }`}
                  >
                    {t("sidebar.assignToMe")}
                  </Radio>
                }
                name="IsAssignToMe"
                layout="vertical"
                className="!mb-0 pb-5 w-full"
              ></Form.Item>
              <Form.Item<FieldType>
                label={
                  <Radio
                    value={2}
                    className={`${
                      selectedRadio && selectedRadio !== 2 && "text-gray-gray7"
                    }`}
                  >
                    {t("sidebar.assignToSomeOne")}
                  </Radio>
                }
                name="UserId"
                layout="vertical"
                className="!mb-0 pb-10"
              >
                <DynamicSelect
                  className="h-fit"
                  disabled={selectedRadio && selectedRadio !== 2}
                  dynamicValue={valueOptionUser}
                  value={form.getFieldValue("UserId")}
                />
              </Form.Item>
              <Form.Item<FieldType>
                label={
                  <Radio
                    value={3}
                    className={`${
                      selectedRadio && selectedRadio !== 3 && "text-gray-gray7"
                    }`}
                  >
                    {t("sidebar.assignToRole")}
                  </Radio>
                }
                name="RoleId"
                layout="vertical"
                className="!mb-0 pb-10"
              >
                <DynamicSelect
                  className="h-fit"
                  disabled={selectedRadio && selectedRadio !== 3}
                  dynamicValue={valueOptionRole}
                  value={form.getFieldValue("RoleId")}
                />
              </Form.Item>
            </Radio.Group>
          </div>
          <div className="flex flex-col justify-center items-center w-full !h-full">
            <Form.Item<FieldType>
              label={t("general.expireTo")}
              name="ExpireDate"
              className="m-0 p-0 pb-10 w-full text-xs"
              layout="vertical"
            >
              <NewDatePicker />
            </Form.Item>
            <div className="flex justify-center items-center gap-x-5 py-6 border border-dashed w-full">
              <Form.Item<FieldType> name="IsCanDelete" className="!mb-0 pb-0">
                <CustomCheckbox
                  checked={Form.useWatch("IsCanDelete", form)}
                  className="!m-0 !p-0"
                  onChange={(e) => {
                    form.setFieldValue("IsCanDelete", e.target.checked);
                  }}
                />
                <span className="text-2xs text-gray-gray10 dark:text-white">
                  {t("general.delete")}
                </span>
              </Form.Item>
              <Form.Item<FieldType> name="IsCanUpdate" className="!mb-0 pb-0">
                <CustomCheckbox
                  checked={Form.useWatch("IsCanUpdate", form)}
                  className="!m-0 !p-0"
                  onChange={(e) => {
                    form.setFieldValue("IsCanUpdate", e.target.checked);
                  }}
                />
                <span className="text-2xs text-gray-gray10 dark:text-white">
                  {t("general.update")}
                </span>
              </Form.Item>
              <Form.Item<FieldType> name="IsCanShare" className="!mb-0 pb-0">
                <CustomCheckbox
                  checked={Form.useWatch("IsCanShare", form)}
                  className="!m-0 !p-0"
                  onChange={(e) => {
                    form.setFieldValue("IsCanShare", e.target.checked);
                  }}
                />
                <span className="text-2xs text-gray-gray10 dark:text-white">
                  {t("general.share")}
                </span>
              </Form.Item>
              <Form.Item<FieldType> name="IsAssign" className="!mb-0 pb-0">
                <CustomCheckbox
                  checked={Form.useWatch("IsAssign", form)}
                  className="!m-0 !p-0"
                  onChange={(e) => {
                    form.setFieldValue("IsAssign", e.target.checked);
                  }}
                />
                <span className="text-2xs text-gray-gray10 dark:text-white">
                  {t("general.assignTo")}
                </span>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end gap-3">
          <CustomButton
            type="text"
            className="bg-gray-gray5 dark:!bg-gray-gray95 !m-0 !p-0 hover:border-black-black8 w-9 h-9"
            onClick={handleResetForm}
          >
            <New config={{ stroke: "#000" }} />
          </CustomButton>
          <CustomButton
            type="text"
            className="bg-black-black8 !hover:bg-white dark:!bg-white px-5 hover:border-black-black8 rounded h-9 text-main-white dark:!text-main-black text-xs"
            htmlType="submit"
          >
            {assignId == null ? t("general.submit") : t("general.update")}
          </CustomButton>
        </div>
      </Form>
      <Divider className="!mx-0 !my-6" />
      <AssignTable
        setAssignId={setAssignId}
        SystemId={SystemId}
        refetch={refetch}
        response={tableResponse}
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
      />
      <div className="flex justify-between items-end">
        {tableResponse?.Result == "Success" && (
          <>
            <Pagination
              className=""
              prevIcon={
                <CustomButton
                  type="text"
                  className="m-0 p-0 rounded w-fit hover"
                >
                  <RightChevron />
                </CustomButton>
              }
              nextIcon={
                <CustomButton type="text" className="m-0 p-0 w-fit">
                  <LeftChevron />
                </CustomButton>
              }
              current={pageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={5}
              total={tableResponse.TotalCount}
              showSizeChanger={false}
              onChange={handlePaginationChange}
              showTitle={false}
            />
            <CustomButton
              type="text"
              className="px-5 border-gray-gray10 hover:border-black-black8 rounded h-9 text-gray-gray9 hover:text-black-black8 text-xs"
              htmlType="submit"
            >
              {t("general.deleteAll")}
            </CustomButton>
          </>
        )}
      </div>
    </div>
  );
}
export default AssignForm;

interface DataType {
  key: Key;
  id: number;
  type: number;
  name: string;
  AssignId: boolean;
  IsAssign: boolean;
  IsCanUpdate: boolean;
  IsCanDelete: boolean;
  IsCanShare: boolean;
  status: ReactNode;
  expireDate: string;
}
export const AssignTable = ({
  setAssignId,
  SystemId,
  refetch,
  response,
  setPageNumber,
  pageNumber,
}) => {
  const t = useTranslations();
  const [tableRows, setTableRows] = useState([]);
  const [trigger] = useCUDDataMutation();

  const handleDeleteRow = async (record) => {
    // TODO: check without refetch please
    try {
      const deleteResponse = await trigger({
        url: `/api/${getSystemNameById(SystemId)}/delete/assign `,
        body: {
          Id: record.AssignId,
        },
      }).unwrap();

      if (deleteResponse?.Result == "Success") {
        refetch();
      }
    } catch (err) {
      null;
    }
  };
  const handleEditRow = (record: DataType) => {
    setAssignId(record.AssignId);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: () => (
        <div style={{ textAlign: "center" }}>
          {t("general.role")}/{t("general.user")}
        </div>
      ),
      dataIndex: "name",
      colSpan: 1,
      align: "center",
      className: "h-9",
    },
    {
      title: t("general.status"),
      dataIndex: "status",
      colSpan: 1,
      align: "center",
      render: (item) => (
        <span
          className={`${
            item
              ? "bg-state-success2 text-state-success1"
              : "bg-gray-gray4 text-gray-gray9"
          } text-3xs rounded-sm px-2 py-1 `}
        >
          {item ? t("general.active") : t("general.notActive")}
        </span>
      ),
    },
    {
      title: t("general.expireTo"),
      dataIndex: "expireDate",
      colSpan: 1,
      align: "center",
      render: (date: string) => {
        if (!date || date === "0001-01-01T00:00:00+00:00") {
          return t("general.timeless");
        }
        return jalali(date).format("jYYYY/jMM/jDD");
      },
    },
    {
      title: t("general.action"),
      dataIndex: "actions",
      colSpan: 1,
      align: "center",
      render: (_, record) => (
        <>
          <CustomButton
            type="text"
            className="m-0 p-1"
            onClick={() => {
              handleDeleteRow(record);
            }}
          >
            <TrashBin />
          </CustomButton>
          <CustomButton
            type="text"
            className="m-0 p-1"
            onClick={() => {
              handleEditRow(record);
            }}
          >
            <EditPencil />
          </CustomButton>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (response?.Data) {
      setTableRows(
        response?.Data?.map((item) => {
          return {
            key: item.Name,
            name: item.Name,
            status: item.Status,
            expireDate: item.ExpireDate,
            AssignId: item.AssignId,
          };
        }),
      );
    }
  }, [response]);
  return (
    <div className="relative">
      {response?.Result == "Success" && response?.Data?.length > 0 && (
        <>
          <Table<DataType>
            columns={columns}
            dataSource={tableRows}
            pagination={false}
            className="pb-4 !border-none text-center"
            size="large"
          />
        </>
      )}
    </div>
  );
};
