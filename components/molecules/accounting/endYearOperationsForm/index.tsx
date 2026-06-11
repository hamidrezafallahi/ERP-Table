import {
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
  CustomTooltip,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import {
  CheckOutlinedIcon,
  ClosePageIcon,
  InfoIcon,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useInitializePage } from '@hooks/custom/useInitializePage';
import { useCUDDataMutation } from '@services/base';
import {
  resetEndYearOperation,
  setEndYearCheckOperationErrors,
  setEndYearMode,
  setEndYearOperationErrors,
  setEndYearValidationOperationErrors,
  startEndYearOperation,
} from '@slice/endYearOperations';
import {
  EndYearStepStatusEnum,
  StepProcessTypeEnum,
} from '@slice/endYearOperations/type';
import { SystemEnum } from '@type/enum';
import {
  convertDate,
  findingPageState,
} from '@utils/core';

export const EndYearOperationsForm = ({ setMobileDrawerContent }: any) => {
  const t = useTranslations();
  const initializePage = useInitializePage();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [showErrorListModal, setShowErrorListModal] = useState({
    isOpen: false,
    headerName: "",
  });
  const [IsPervOprationDone, setIsPervOprationDone] = useState(false);

  const { locale, match, process, activePage } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
      process: state.withPersist.endYearOperations,
      activePage: state.withPersist.pages?.find((page) => page.isActive),
    }),
    shallowEqual,
  );

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const [GeIsDon, { isLoading: GeIsDonLoading }] = useCUDDataMutation();

  const [DeleteYearOpration, { isLoading: DeleteYearOprationLoading }] =
    useCUDDataMutation();
  const isOpening = Form.useWatch(["HasOpening"], form);

  useEffect(() => {
    dispatch(setEndYearMode(isOpening ? "withOpening" : "withoutOpening"));
  }, [dispatch, isOpening]);

  useEffect(() => {
    const checkVoucher = async () => {
      const geIsDon = await GeIsDon({
        url: "/api/acc/Select/CheckVoucherHasConclusion",
        body: {},
      }).unwrap();

      if (geIsDon?.Result === "Success") {
        if (geIsDon?.Data?.[0]?.HasConclusion) {
          setIsPervOprationDone(true);
        } else {
          setIsPervOprationDone(false);
        }
      }
    };

    checkVoucher();
  }, []);

  const handleDeleteYearOprate = async () => {
    const deleteYearOpration = await DeleteYearOpration({
      url: "/api/acc/reverce/finishingvoucher",
      body: {},
    }).unwrap();
    if (deleteYearOpration?.Result === "Success") {
      setIsPervOprationDone(false);
    } else {
      setIsPervOprationDone(true);
    }
  };
  const handleSubmit = async (values) => {
    dispatch(resetEndYearOperation());
    try {
      dispatch(
        startEndYearOperation({
          mode: isOpening ? "withOpening" : "withoutOpening",
        }),
      );
      const mutateResult = await mutateItem({
        url: "/api/acc/voucher/finishingVoucher",
        body: {
          ...values,
        },
      }).unwrap();

      if (mutateResult?.Result === "Success") {
        const errors = mutateResult?.Data?.map((item) => ({
          errorDesc: item.MainResponse?.Error,
        }));
        const checkErrorList = mutateResult?.Data?.[0]?.VoucherValidation?.map(
          (item) => ({
            voucherHeaderId: item.VoucherHeaderId,
            rowNum: item.RowNum,
            voucherNumber: item.VoucherNumber,
            detailDesc: item.DetailDesc,
            errorMessage: item.ErrorMessage,
            voucherDate: item.VoucherDate,
          }),
        );
        const validationErrorList =
          mutateResult?.Data?.[0]?.CheckConfirmedVoucherValidation?.map(
            (item) => ({
              voucherHeaderId: item.VoucherHeaderId,
              rowNum: item.RowNum,
              voucherNumber: item.VoucherNumber,
              detailDesc: item.DetailDesc,
              errorMessage: item.ErrorMessage,
              voucherDate: item.VoucherDate,
            }),
          );

        errors && dispatch(setEndYearOperationErrors(errors));
        checkErrorList?.length > 0 &&
          dispatch(setEndYearCheckOperationErrors(checkErrorList));
        validationErrorList?.length > 0 &&
          dispatch(setEndYearValidationOperationErrors(validationErrorList));
      }
    } catch (error) {
      null;
    }
  };

  const handleReturn = (id: number) => {
    initializePage({
      config: {
        RepoId: 5010,
        SystemId: SystemEnum.acc,
        url: `acc/voucher?id=${id}`,
        pageState: findingPageState(null),
        originalPageState: findingPageState(null),
        Id: Number(id),
        listPageId: activePage.pageId,
        Key: Number(id),
        selectedView: null,
        data: activePage.data,
        returnPageId: activePage.pageId,
      },
    });
  };

  const handleOpenErrorListModal = (headerName: string) => {
    setShowErrorListModal({
      isOpen: true,
      headerName: headerName,
    });
  };

  const handleCloseErrorListModal = () => {
    setShowErrorListModal({
      isOpen: false,
      headerName: "",
    });
  };

  const steps = isOpening
    ? [
        {
          label: "بررسی",
          errorList: process.checkErrorsList,
          value: StepProcessTypeEnum.Review,
        },
        {
          label: "صحت",
          errorList: process.validationErrorsList,
          value: StepProcessTypeEnum.Validation,
        },
        {
          label: "بستن حساب های هزینه",
          value: StepProcessTypeEnum.CloseExpenseAccounts,
        },
        {
          label: "بستن حساب های درآمد",
          value: StepProcessTypeEnum.CloseIncomeAccounts,
        },
        {
          label: "بستن حساب های سود",
          value: StepProcessTypeEnum.CloseProfitAccounts,
        },
        {
          label: "سند اختتامیه",
          value: StepProcessTypeEnum.ClosingDocument,
        },
        {
          label: "سند افتتاحیه",
          value: StepProcessTypeEnum.OpeningDocument,
        },
      ]
    : [
        {
          label: "بررسی",
          errorList: process.checkErrorsList,
          value: StepProcessTypeEnum.Review,
        },
        {
          label: "صحت",
          errorList: process.validationErrorsList,
          value: StepProcessTypeEnum.Validation,
        },
        {
          label: "بستن حساب های هزینه",
          value: StepProcessTypeEnum.CloseExpenseAccounts,
        },
        {
          label: "بستن حساب های درآمد",
          value: StepProcessTypeEnum.CloseIncomeAccounts,
        },
        {
          label: "بستن حساب های سود",
          value: StepProcessTypeEnum.CloseProfitAccounts,
        },
        {
          label: "سند اختتامیه",
          value: StepProcessTypeEnum.ClosingDocument,
        },
      ];

  const renderErrorStep = () => {
    return (
      <div className="p-3 border-2 border-red-600 rounded-full">
        <ClosePageIcon config={{ stroke: "#dc2626" }} />
      </div>
    );
  };
  const renderSuccessStep = () => {
    return (
      <div className="p-3 border-2 border-green-600 rounded-full">
        <CheckOutlinedIcon
          config={{ stroke: "#16a34a", width: 24, height: 24 }}
        />
      </div>
    );
  };

  const renderSkipStep = () => {
    return (
      <div className="p-3 border-2 border-blue-600 rounded-full">
        {/* <ArrowCircleUpLeft
          config={{ stroke: "#2563eb", width: 24, height: 24 }}
        /> */}
        <span className="w-6 h-6 font-bold text-blue-600">{`---->`}</span>
      </div>
    );
  };

  const renderWaitStep = () => {
    return (
      <div className="bg-gray-gray3 p-3 border-2 border-gray-gray6 rounded-full">
        <div className="w-6 h-6"></div>
      </div>
    );
  };
  const renderActiveStep = () => {
    return (
      <div className="rounded-full">
        <SpinIcon config={{ width: 52, height: 52 }} />
      </div>
    );
  };
  const renderDivider = () => {
    return (
      <div className="flex justify-center items-center text-gray-gray7">
        <div className="h-6">{`- - - - >`}</div>
      </div>
    );
  };

  const renderCorrectStep = (status) => {
    const normalized = Number(status);

    switch (normalized) {
      case EndYearStepStatusEnum.Failed:
        return renderErrorStep();

      case EndYearStepStatusEnum.Success:
        return renderSuccessStep();

      case EndYearStepStatusEnum.Skip:
        return renderSkipStep();

      default:
        return renderWaitStep();
    }
  };

  const renderStepper = () => {
    return (
      <div className="flex gap-1">
        {steps.map((step, idx) => {
          const lastItem = idx === steps.length - 1;
          const isRunning = process.isRunning;
          const status =
            process.statusByValue?.[step.value] ??
            EndYearStepStatusEnum.Pending;
          const isActive = isRunning && process.activeStepValue === step.value;

          return (
            <div key={step.value} className="flex flex-col gap-2">
              <div className="flex justify-center items-center gap-2">
                {isActive ? renderActiveStep() : renderCorrectStep(status)}
                {!lastItem && renderDivider()}
              </div>

              <div className="flex items-center">
                {step?.errorList?.length > 0 && (
                  <div
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                    onClick={() => handleOpenErrorListModal(step.label)}
                  >
                    <InfoIcon config={{ width: 16, height: 16 }} />
                  </div>
                )}
                <span
                  className={`ps-2 text-xs "text-gray-800" ${isActive ? "font-bold" : ""}`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const renderErrors = () => {
    return (
      <>
        {process?.errors?.[0]?.errorDesc &&
          process.errors?.map((err, idx) => (
            <div key={idx} className="flex items-center gap-2 text-red-600">
              <span>◂ خطا :</span>
              <span className="text-xs">{err.errorDesc}</span>
            </div>
          ))}
      </>
    );
  };

  const renderErrorList = () => {
    const isCheck = showErrorListModal.headerName === "بررسی";
    const correctErrorList = isCheck
      ? process.checkErrorsList
      : process.validationErrorsList;

    return (
      <div className="flex flex-col justify-between gap-2 p-4 text-xs">
        <div className="justify-items-center gap-4 grid grid-cols-10 bg-gray-gray3 p-2 rounded text-gray-gray8">
          <span></span>
          <span className="col-span-2">شماره سند</span>
          <span>تاریخ سند</span>
          {isCheck && <span>شماره ردیف</span>}
          {isCheck && <span>شرح ردیف</span>}
          <span className={`${!isCheck ? "col-span-6" : "col-span-4"}`}>
            خطا
          </span>
        </div>
        <div className="h-[370px] overflow-y-auto">
          {correctErrorList?.map((el, idx) => {
            const date = el?.voucherDate
              ? convertDate({
                  dateString: el?.voucherDate,
                  locale: locale,
                })
              : "نامشخص";
            return (
              <div
                key={idx}
                className="justify-items-center gap-4 grid grid-cols-10 p-2 rounded"
              >
                <span className="flex items-center gap-2">
                  {idx + 1}
                  {el.voucherHeaderId && (
                    <CustomTooltip title={"رفتن به سند مربوطه"}>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          handleReturn(el.voucherHeaderId);
                        }}
                      >
                        <InfoIcon config={{ width: 16, height: 16 }} />
                      </span>
                    </CustomTooltip>
                  )}
                </span>
                <span className="col-span-2">{el?.voucherNumber}</span>
                <span>{date}</span>
                {isCheck && <span>{el?.rowNum}</span>}
                {isCheck && <span>{el?.detailDesc}</span>}
                <span className={`${!isCheck ? "col-span-6" : "col-span-4"}`}>
                  {el?.errorMessage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return GeIsDonLoading == true ? (
    <div className="flex justify-center items-center w-full h-72">
      <SpinIcon />
    </div>
  ) : IsPervOprationDone == false ? (
    <Form
      form={form}
      name="endYearOperations"
      onFinish={handleSubmit}
      layout="vertical"
      className="gap-1 grid grid-cols-2"
      initialValues={{
        HasOpening: true,
      }}
    >
      <Form.Item
        label="بستن هزینه"
        name="BlanceVoucherBalancedAccountId"
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          showSearch
          config={{
            name: "BlanceVoucherBalancedAccountId",
            caption: "بستن هزینه",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          infinite={true}
          dynamicValue={{
            endpoint: "/api/acc/select/account/moeen",
            repoViewId: null,
            OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
          }}
        />
      </Form.Item>
      <Form.Item
        label="بستن درآمد"
        name="BalancedEarnedAccountId"
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          showSearch
          config={{
            name: "BalancedEarnedAccountId",
            caption: "بستن درآمد",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/account/moeen",
            repoViewId: null,
            OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
          }}
        />
      </Form.Item>
      <Form.Item
        label="سود و زیان"
        name="ProfitAccountId"
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          showSearch
          config={{
            name: "ProfitAccountId",
            caption: "سود و زیان",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/account/moeen",
            repoViewId: null,
            OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
          }}
        />
      </Form.Item>
      <Form.Item
        label="حساب های انباشته"
        name="BalancedProfitAccountId"
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          showSearch
          config={{
            name: "BalancedProfitAccountId",
            caption: "حساب های انباشته",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/account/moeen",
            repoViewId: null,
            OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
          }}
        />
      </Form.Item>
      <Form.Item
        label="سند اختتامیه"
        name="ConclusionAccountId"
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          showSearch
          config={{
            name: "ConclusionAccountId",
            caption: "سند اختتامیه",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/account/moeen",
            repoViewId: null,
            OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
          }}
        />
      </Form.Item>
      <div className="gap-1 grid grid-cols-1 md:grid-cols-2 col-span-2">
        <Form.Item
          name="HasOpening"
          valuePropName="checked"
          className="md:col-span-2 m-0 p-0 text-xs"
        >
          <Checkbox>زدن افتتاحیه</Checkbox>
        </Form.Item>

        {isOpening && (
          <Form.Item
            label="سال مالی"
            name="OpeningYearId"
            className="gap-1 grid grid-cols-1"
            rules={[
              { required: true, message: t("form.required"), type: "number" },
            ]}
          >
            <DynamicSelect
              showSearch
              config={{
                name: "OpeningYearId",
                caption: "سال مالی",
                type: "selectOption",
                setFieldValue: form.setFieldValue,
              }}
              dynamicValue={{
                addWebUrl: "/api/com/select/year4SelectOption",
                endpoint: "/api/com/select/year4SelectOption",
                repoViewId: null,
              }}
            />
          </Form.Item>
        )}
      </div>

      {/*{isOpening && (*/}
      {/*  <Form.Item*/}
      {/*    label="سند افتتاحیه"*/}
      {/*    name="BalancedOpeningAccountId"*/}
      {/*    rules={[*/}
      {/*      { required: true, message: t("form.required"), type: "number" },*/}
      {/*    ]}*/}
      {/*  >*/}
      {/*    <DynamicSelect*/}
      {/*      showSearch*/}
      {/*      config={{*/}
      {/*        name: "BalancedOpeningAccountId",*/}
      {/*        caption: "سند افتتاحیه",*/}
      {/*        type: "selectOption",*/}
      {/*        setFieldValue: form.setFieldValue,*/}
      {/*      }}*/}
      {/*      dynamicValue={{*/}
      {/*        endpoint: "/api/acc/select/account/moeen",*/}
      {/*        repoViewId: null,*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  </Form.Item>*/}
      {/*)}*/}

      <div className="flex flex-col justify-center items-center gap-4 col-span-2 py-6">
        {renderStepper()}
      </div>
      <div className="flex flex-col justify-center items-center gap-2 col-span-2">
        {renderErrors()}
      </div>
      <Form.Item className="col-span-2 m-0 p-0 pt-4 text-xs">
        <div className="flex flex-col justify-center items-center gap-4 col-span-2">
          <CustomButton
            type="text"
            htmlType="submit"
            // disabled={id ? changeFields.length === 0 : !formIsValid}
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.operationStart")
            )}
          </CustomButton>
          {mutateIsLoading && (
            <span className="text-blue-blue4 text-sm">
              لطفا تا پایان عملیات از بستن صفحه خودداری بفرمایید .
            </span>
          )}
        </div>
      </Form.Item>
      {showErrorListModal.isOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[820px] h-[470px]" : ""}`}
          headerName={showErrorListModal.headerName}
          closeModal={handleCloseErrorListModal}
          isModalOpen={showErrorListModal.isOpen}
          content={<div>{renderErrorList()}</div>}
        />
      )}
    </Form>
  ) : (
    <div className="flex flex-col justify-center items-center gap-3 h-[250px]">
      <span>
        عملیات پایان سال برای سال جاری انجام شده است در صورت نیاز با استفاده از
        دکمه زیر عملیات پایان سال را حذف کنید
      </span>
      <div className="text-xs">
        {" "}
        توجه داشته باشید که با حذف عملیات پایان سال سند های مربوطه حذف خواهد شد
      </div>
      <CustomButton
        onClick={handleDeleteYearOprate}
        type="text"
        className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded w-[100px] text-white disabled:text-gray-gray6 text-xs"
      >
        {DeleteYearOprationLoading ? (
          <Spin size="large" indicator={<SpinIcon />} />
        ) : (
          <span>حذف پایان سال</span>
        )}
      </CustomButton>
    </div>
  );
};
