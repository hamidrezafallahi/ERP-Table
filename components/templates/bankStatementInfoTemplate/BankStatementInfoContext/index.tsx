"use client";

import { useEffect, useState } from "react";
import { Form, Table, Spin } from "antd";
import { useTranslations } from "next-intl";
import { NewDatePicker } from "@components/atoms/defaultElements";
import { NoData, SpinIcon } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

export default function BankStatementInfoContext({ data, accountId }) {
  const [form] = Form.useForm();
  const t = useTranslations();
  const [deviceHeight, setDeviceHeight] = useState(700); // default
  const contentHeight = 430;
  const [tableData, setTableData] = useState([]);
  const { locale } = useAppSelector(
    (state) => ({ locale: state.withPersist.config.lang }),
    shallowEqual,
  );

  // Set deviceHeight safely
  useEffect(() => {
    setDeviceHeight(window.innerHeight);
  }, []);

  // Load data
  useEffect(() => {
    if (!data) {
      setTableData([]);
      return;
    }
    const dataArray = Array.isArray(data) ? data : [data];
    const filtered = dataArray.filter(
      (item) => Number(item.BankAccountId) === Number(accountId),
    );
    setTableData(filtered);
  }, [data, accountId]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat(
      locale === "fa" ? "fa-IR-u-ca-persian" : "en-US",
      { year: "numeric", month: "2-digit", day: "2-digit" },
    ).format(new Date(date));
  };

  const columns = [
    { title: "BankStatementId", dataIndex: "BankStatementId", width: 120 },
    { title: "VoucherTypeId", dataIndex: "VoucherTypeId" },
    { title: "RpWayId", dataIndex: "RpWayId" },
    { title: "تاریخ", dataIndex: "VoucherDate", render: formatDate },
    { title: "VoucherDesc", dataIndex: "VoucherDesc" },
    { title: "YearId", dataIndex: "YearId" },
    { title: "BankAccountId", dataIndex: "BankAccountId" },
    { title: "طرف حساب (ID)", dataIndex: "TafsiliId" },
    {
      title: "مبلغ (ریال)",
      dataIndex: "Price",
      render: (value) => (
        <span className={value > 0 ? "text-green-500" : "text-red-500"}>
          {Number(value).toLocaleString()}
        </span>
      ),
    },
    { title: "شماره فیش", dataIndex: "FishNumber" },
    { title: "شرح", dataIndex: "TafsiliDesc" },
  ];

  return (
    <div className="flex flex-col gap-2 m-2">
      <Form
        form={form}
        layout="vertical"
        className="gap-x-4 lg:gap-y-3 grid grid-cols-3"
      >
        <Form.Item
          label="از تاریخ"
          name="FromDate"
          className="lg:flex lg:flex-col col-span-12 lg:col-span-1 text-xs"
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
        <Form.Item
          label="تا تاریخ"
          name="ToDate"
          className="lg:flex lg:flex-col col-span-12 lg:col-span-1 text-xs"
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
      </Form>

      <Table
        loading={{
          spinning: false,
          indicator: <Spin size="large" indicator={<SpinIcon />} />,
        }}
        scroll={{ x: "max-content", y: deviceHeight - contentHeight - 40 }}
        tableLayout="fixed" 
        locale={{
          emptyText: (
            <div className="flex flex-col justify-center items-center gap-4 m-8">
              <NoData config={{ width: 80, height: 80 }} />
              <span className="text-gray-gray9 dark:text-white text-sm">
                {t("general.noData")}
              </span>
            </div>
          ),
        }}
        size="small"
        pagination={false}
        rowKey="BankStatementId"
        columns={columns.map((col) => ({
          ...col,
          width: col.width || 120, 
          onCell: () => ({
            style: {
              padding: "5px", 
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis", 
            },
          }),
        }))}
        dataSource={tableData}
      />
    </div>
  );
}
