import { useEffect, useRef, useState } from "react";

import { Divider, Form } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import Confirmation from "@components/molecules/confirmation";
import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { ISelectOption } from "@type/elementType";
import type { IToolbarMenu } from "@type/toolbar";
import { showSuccessToast, transformDotNotationToNested } from "@utils/core";

import { BankDeposit } from "./bankDeposit";
import { Cash } from "./cash";
import { Cheque } from "./cheque";
import { defaultListConfig } from "./config";
import { SettlementTab } from "./tab";
import { type IProps, SettlementTypeEnum } from "./type";

export const Settlement = ({ id }: IProps) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const { locale, cashierId, match } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      isFullScreen: state.withPersist.config.fullScreen,
      cashierId: state.withPersist.config.defaultConfigs.CashierId.id,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const [bankAccounts, setBankAccounts] = useState<{
    id: number;
    desc: string;
    showSingle: boolean;
  }>({
    id: null,
    desc: null,
    showSingle: false,
  });

  const getUrl = "api/sale/select/invoiceSettlement";
  const getRemaining = "api/sale/select/remainingAmount";
  const deleteUrl = "api/sale/delete/invoiceSettlement";
  const updateUrl = "api/sale/update/invoiceSettlement";
  const createUrl = "api/sale/insert/invoiceSettlement";
  const repoViewId = null;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"Delete" | "Confirm">(
    "Delete"
  );

  const [changeFields, setChangeFields] = useState([]);
  const [listConfig, setListConfig] = useState(defaultListConfig);
  const [originalValues, setOriginalValues] = useState(null);
  const [active, setActive] = useState({
    key: "1",
    value: SettlementTypeEnum.Cash,
    fieldKey: "CashStatementId",
  });
  const [selectedId, setSelectedId] = useState<number>(null);
  const [amount, setAmount] = useState({
    remaining: 0,
    payable: 0,
  });

  const { data: amountData, refetch: refetchAmountData } = useGetData<
    any,
    null
  >({
    url: getRemaining,
    body: {
      HeaderId: id,
    },
  });

  const { data: tableData, isFetching: tableIsLoading } = useGetData<any, null>(
    {
      url: getUrl,
      body: {
        InvoiceHeaderId: id,
        Type: active.value,
      },
      id: id,
    }
  );

  const { data: defaultValue } = useGetData<any, null>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      InvoiceHeaderId: id,
      // [active.fieldKey]: selectedId,
      Id: selectedId,
      Type: active.value,
    },
    skip: !selectedId || active.value === SettlementTypeEnum.All,
  });

  const { data: bankAccountsData } = useGetData<ISelectOption[], null>({
    url: "api/com/Select/bankAccount4SelectOption",
    body: {
      RepoViewId: 106081,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 10,
      },
    },
  });

  const actions =
    active.key !== "4"
      ? [
          {
            MenuId: null,
            Icon: ' <svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 15 15"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M5.50015 2H3.40015C2.56007 2 2.13972 2 1.81885 2.16349C1.5366 2.3073 1.3073 2.5366 1.16349 2.81885C1 3.13972 1 3.56007 1 4.40015V11.6001C1 12.4402 1 12.86 1.16349 13.1809C1.3073 13.4632 1.5366 13.6929 1.81885 13.8367C2.1394 14 2.55925 14 3.39768 14H10.6023C11.4408 14 11.86 14 12.1805 13.8367C12.4628 13.6929 12.6929 13.4629 12.8367 13.1807C13 12.8601 13 12.4408 13 11.6023V9.5M10 2.75L5.5 7.25V9.5H7.75L12.25 5M10 2.75L12.25 0.5L14.5 2.75L12.25 5M10 2.75L12.25 5"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n        strokeLinejoin="round"\r\n      />\r\n    </svg>',
            ActionId: null,
            MenuDesc: "ویرایش",
            key: "ویرایش",
            FatherId: null,
            MenuType: null,
            loggedInUserId: null,
          },
          {
            MenuId: null,
            Icon: '<svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 18 18"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M15.3751 4.5H2.625"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        opacity="0.5"\r\n        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"\r\n        stroke="#585858"\r\n      />\r\n    </svg>',
            ActionId: null,
            MenuDesc: "حذف",
            key: "حذف",
            FatherId: null,
            MenuType: null,
            WebLink: "",
            loggedInUserId: null,
          },
        ]
      : [];
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const onClear = () => setSelectedId(null);

  const handleActionClick = async (
    action: IToolbarMenu,
    id: number,
    PendingStatusId: number | null
  ) => {
    setSelectedId(id);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          break;

        case ActionLabelsEnum.Delete as string:
          setConfirmMode("Delete");
          match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
          break;

        case ActionLabelsEnum.Confirm1 as string:
        case ActionLabelsEnum.Confirm2 as string:
          setConfirmMode("Confirm");
          match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
          break;

        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };

  const handleConfirmation = async () => {
    try {
      const confirmResult = await mutateItem({
        url: confirmMode === "Delete" ? deleteUrl : "",
        body: { InvoiceHeaderId: selectedId, Type: active?.value, Id: id },
      }).unwrap();

      if (confirmMode === "Delete") {
        if (confirmResult.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
          setSelectedId(null);

          // (dispatch as any)(
          //   apiService.util.updateQueryData(
          //     "getInfinite",
          //     {
          //       url: getUrl,
          //       body: {
          //         RepoViewId: repoViewId,
          //         [sourceKey]: id,
          //       },
          //       id: "All",
          //     },
          //     (draft) => {
          //       if (draft?.Data) draft.Data = [];
          //     },
          //     false
          //   )
          // );

          // setPageNumber(1);
          // await refetch();
        }
        setIsConfirmModalOpen(false);
        setIsConfirmDrawerOpen(false);
      } else {
        if (confirmResult.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
          setSelectedId(null);

          // (dispatch as any)(
          //   apiService.util.updateQueryData(
          //     "getInfinite",
          //     {
          //       url: config.listConfig.selectUrl,
          //       body: {
          //         RepoViewId: config.listConfig.repoViewId,
          //         [sourceKey]: id,
          //       },
          //       id: "All",
          //     },
          //     (draft) => {
          //       if (draft?.Data) draft.Data = [];
          //     },
          //     false
          //   )
          // );

          // setPageNumber(1);
          // await refetch();
        }
        setIsConfirmModalOpen(false);
        setIsConfirmDrawerOpen(false);
      }
    } catch (error) {
      null;
    }
  };

  const handleSubmit = async (values) => {
    let formValues = values;

    if (
      active?.value === SettlementTypeEnum.Cash ||
      active?.value === SettlementTypeEnum.Cheque
    ) {
      formValues = {
        ...formValues,
        CashierId: cashierId,
      };
    }
    if (active?.value === SettlementTypeEnum.Bank && bankAccounts.showSingle) {
      formValues = {
        ...formValues,
        BankAccountId: bankAccounts.id,
      };
    }

    const cleanValues = transformDotNotationToNested(formValues);

    let mutateResult;
    try {
      if (selectedId) {
        mutateResult = await mutateItem({
          url: updateUrl,
          body: {
            ...cleanValues,
            Type: active?.value,
            InvoiceHeaderId: id,
            Id: selectedId,
            ChangeFields: changeFields,
          },
          id: id,
        }).unwrap();
      } else {
        mutateResult = await mutateItem({
          url: createUrl,
          body: { ...cleanValues, Type: active?.value, InvoiceHeaderId: id },
          id: id,
        }).unwrap();
      }

      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        refetchAmountData();
      }
    } catch (error) {
      null;
    }
  };

  const renderTab = {
    "1": (
      <Cash
        form={form}
        mutateIsLoading={mutateIsLoading}
        onClear={onClear}
        formValues={formValues}
      />
    ),
    "2": (
      <BankDeposit
        form={form}
        mutateIsLoading={mutateIsLoading}
        onClear={onClear}
        bankAccounts={bankAccounts}
        formValues={formValues}
      />
    ),
    "3": (
      <Cheque
        form={form}
        mutateIsLoading={mutateIsLoading}
        onClear={onClear}
        bankAccounts={bankAccounts}
        formValues={formValues}
      />
    ),
  };

  useEffect(() => {
    if (originalValues) {
      for (const key in formValues) {
        if (originalValues[key] !== formValues[key]) {
          const exist = changeFields.find((item) => item === key);

          if (!exist) {
            setChangeFields((prevState) => [...prevState, key]);
          }
        }
      }
    }
  }, [formValues, originalValues]);

  useEffect(() => {
    form.resetFields();
    setChangeFields([]);
    setOriginalValues(null);

    if (id && defaultValue?.Data) {
      const defaultValues = defaultValue?.Data[0];

      // const dateFields = {
      //   ["VoucherDate"]: dayjs(defaultValues["VoucherDate"]),
      // };

      // const combinedResult = combineValues(defaultValues, dateFields);

      form.setFieldsValue(defaultValues);
      setOriginalValues(defaultValues);
    }
  }, [defaultValue?.Data, form, id]);

  useEffect(() => {
    if (bankAccountsData?.Data && bankAccountsData?.Data?.length === 1) {
      const option = bankAccountsData.Data[0];
      setBankAccounts({
        desc: option?._SelectDisplay,
        id: option?._SelectId,
        showSingle: true,
      });
    } else {
      setBankAccounts({
        desc: null,
        id: null,
        showSingle: false,
      });
    }
  }, [bankAccountsData?.Data]);

  useEffect(() => {
    const configs: Record<SettlementTypeEnum, any[]> = {
      [SettlementTypeEnum.All]: [
        {
          fieldName: "VoucherDate",
          fieldCaption: "تاریخ",
          fieldType: "date",
          order: 1,
        },
        {
          fieldName: "Type",
          fieldCaption: "نوع",
          fieldType: "conditional",
          order: 3,
          conditionalConfig: [
            { title: "واریز به بانک", value: SettlementTypeEnum.Bank },
            { title: "نقد", value: SettlementTypeEnum.Cash },
            { title: "چک", value: SettlementTypeEnum.Cheque },
          ],
        },
      ],
      [SettlementTypeEnum.Cash]: [
        {
          fieldName: "VoucherDate",
          fieldCaption: "تاریخ پرداخت",
          fieldType: "date",
          order: 1,
        },
      ],
      [SettlementTypeEnum.Bank]: [
        {
          fieldName: "VoucherDate",
          fieldCaption: "تاریخ واریز",
          fieldType: "date",
          order: 1,
        },
        {
          fieldName: "BankAccount.AccountName",
          fieldCaption: "حساب جاری",
          fieldType: "string",
          order: 3,
        },
        {
          fieldName: "FishNumber",
          fieldCaption: "شماره فیش",
          fieldType: "string",
          order: 4,
        },
      ],
      [SettlementTypeEnum.Cheque]: [
        {
          fieldName: "VoucherDate",
          fieldCaption: "تاریخ چک",
          fieldType: "date",
          order: 1,
        },
        {
          fieldName: "Bank.BankDesc",
          fieldCaption: "بانک",
          fieldType: "string",
          order: 3,
        },
        {
          fieldName: "Num",
          fieldCaption: "شماره چک",
          fieldType: "string",
          order: 4,
        },
      ],
    };

    const listConfig =
      configs[active.value] !== undefined
        ? {
            ...defaultListConfig,
            column: [...defaultListConfig.column, ...configs[active.value]],
          }
        : defaultListConfig;

    setListConfig(listConfig);
  }, [active.value]);

  useEffect(() => {
    const payableAmount = amountData?.Data?.[0]?.PayableAmount || 0;
    const remainingAmount = amountData?.Data?.[0]?.RemainingAmount || 0;
    const currentPayment = formValues?.PaymentAmount || 0;
    const latestPayment = !selectedId
      ? 0
      : defaultValue?.Data?.[0]?.PaymentAmount || 0;

    const finalRemaining = remainingAmount + latestPayment - currentPayment;

    setAmount({
      payable: payableAmount,
      remaining: finalRemaining,
    });
  }, [amountData, formValues?.PaymentAmount, defaultValue, selectedId]);

  const reyhanRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 mx-4 my-5 h-[80dvh]">
      <div className="flex flex-col gap-4" ref={reyhanRef}>
        <div className="flex items-center justify-end w-full gap-4">
          <div className="flex justify-center gap-1 w-fit">
            <span>{t("systemSetting.payableAmount")}</span>
            <span className="font-bold">
              {amount.payable?.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="flex justify-center gap-1 w-fit">
            <span>{t("systemSetting.remainingAmount")}</span>
            <span className="font-bold text-red-600">
              {amount.remaining?.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>
        <Form
          form={form}
          name="validateOnly"
          layout="vertical"
          onFinish={handleSubmit}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col border-[0.063rem] px-4 py-5 border-gray-gray55 rounded-lg border-dashed ">
              <span className="font-medium mb-3 text-gray-gray10 text-base">
                {t("general.paymentMethod")}
              </span>
              <SettlementTab active={active} setActive={setActive} />
              {active.key !== "4" && (
                <>
                  <div>{renderTab[active.key]}</div>
                </>
              )}
            </div>
            <div
              className={`${
                active.value === SettlementTypeEnum.All
                  ? "h-[550px]"
                  : "h-[291px]"
              }`}
            >
              {match ? (
                <TableDynamicModal
                  isLoading={tableIsLoading}
                  actions={actions}
                  columnsList={listConfig}
                  data={tableData?.Data}
                  handleAction={handleActionClick}
                  locale={locale}
                  fieldKey={active.fieldKey}
                  scroll={{ x: undefined, y: 262 }}
                />
              ) : (
                <CardDynamicModal
                  actions={actions}
                  columnsList={listConfig}
                  data={tableData?.Data}
                  onActionClick={handleActionClick}
                  fieldKey={active.fieldKey}
                  staticKey={"Amount"}
                  ref={null}
                />
              )}
            </div>
          </div>
        </Form>
      </div>
      {isConfirmModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsConfirmModalOpen(false)}
          isModalOpen={isConfirmModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedId}
              mode={confirmMode}
              onCancel={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirmation}
              onLoading={mutateIsLoading}
            />
          }
        />
      )}
      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedId}
            mode={confirmMode}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
            onLoading={mutateIsLoading}
          />
        }
      />
    </div>
  );
};
