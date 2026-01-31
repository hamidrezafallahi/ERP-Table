import React, { useEffect, useMemo, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { useAppSelector } from "@redux/index";
import { IAccountSetting } from "@services/acc/accountSetting/type";
import { useGetData } from "@services/base";
import { IRequest } from "@services/mng/report/type";

import { sampleData } from "../type";
import ConfirmStep from "./confirmStep";
import PhoneForm from "./phoneForm";
import StatusStep from "./statusStep";
import TransferHistory from "./transferHistory";
import { AccountInfo, Props, Step } from "./type";
import usePhoneInput from "./usePhoneInput";

export default function AccountTransfer({ apiUrl, data = sampleData }: Props) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const API_URL = apiUrl ?? process.env.NEXT_PUBLIC_ACCOUNT_SETTING_URL ?? "";
  const { data: defaultValue } = useGetData<IAccountSetting[], IRequest>({
    url: API_URL,
    body: {},
  });

  const { direction } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
    }),
    shallowEqual
  );

  const phoneHook = usePhoneInput("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [step, setStep] = useState<Step>("search");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [agree, setAgree] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [status, setStatus] = useState({
    request: true,
    user: false,
    company: false,
  });

  const isStatusComplete = useMemo(
    () => status.request && status.user && status.company,
    [status]
  );

  useEffect(() => {
    form.resetFields();
    phoneHook.setValue("");
    setSearchedPhone("");
    setAccount(null);
    setAgree(false);
    setStep("search");
  }, [defaultValue?.Data]);

  const handleSearch = async () => {
    if (!phoneHook.isValid) return;
    setAgree(false);
    if (step === "status" && !isStatusComplete) return;

    setLoading(true);
    setSearchedPhone(phoneHook.value);

    // demo: replace with real API call
    setTimeout(() => {
      const demo: AccountInfo = { name: "مریم محسنی", phone: phoneHook.value };
      setAccount(demo);
      setStep("confirm");
      setLoading(false);
    }, 800);
  };

  const handleTransfer = async () => {
    setTransferring(true);
    setStep("status");
    setStatus({ request: true, user: false, company: false });

    // simulate timeline
    setTimeout(() => setStatus((s) => ({ ...s, user: true })), 3000);
    setTimeout(() => setStatus((s) => ({ ...s, company: true })), 3000);
    setTimeout(() => setTransferring(false), 3000);
    setAgree(false);
  };

  return (
    <>
      {/* search area */}
      {(step === "search" || step === "confirm") && (
        <div className="relative w-full">
          <PhoneForm
            direction={direction}
            phoneHook={phoneHook}
            onSearch={handleSearch}
            submitLabel={t("general.search")}
            disabled={!phoneHook.isValid || loading}
          />

          {/* confirm card */}
          {step === "confirm" && (
            <ConfirmStep
              account={account}
              searchedPhone={searchedPhone}
              agree={agree}
              setAgree={setAgree}
              onTransfer={handleTransfer}
              transferring={transferring}
            />
          )}

          {/* history */}
          <TransferHistory data={data} />
        </div>
      )}

      {/* status step */}
      {step === "status" && account && (
        <div className={`relative w-full  gap-4`}>
          <div className="block relative md:flex md:gap-4 w-full sm:w-[578px] sm:h-16">
            <Form
              form={form}
              onFinish={handleSearch}
              className="w-full sm:max-w-[495px]"
            >
              <Form.Item
                layout="vertical"
                className="w-full"
                label={t("general.accountPhoneNumber")}
                name="phone"
                rules={[
                  { required: true, message: t("general.enterPhoneNumber") },
                  {
                    pattern: /^\d{11}$/,
                    message: t("general.thePhoneNumberMustBeExactly11Digits"),
                  },
                ]}
              >
                <InputText
                  value={phoneHook.value}
                  onChange={(e) => phoneHook.setValue(e.target.value)}
                  onKeyDown={phoneHook.handleKeyDown}
                  onBeforeInput={phoneHook.handleBeforeInput}
                  onPaste={phoneHook.handlePaste}
                  inputMode="numeric"
                  autoComplete="tel"
                  pattern="\d*"
                  maxLength={11}
                  className="!h-14 sm:!h-9"
                />
                <p className="my-2 text-blue-blue5 text-xs">
                  {t(
                    "general.toTransferFundsEnterTheRecipientsMobileNumberInThisField"
                  )}
                </p>
              </Form.Item>
            </Form>

            <div
              className={` ${
                direction == "rtl" ? "sm:left-[0px]" : "sm:right-0"
              } sm:-bottom-1  sm:absolute`}
            >
              <CustomButton
                type="text"
                htmlType="submit"
                onClick={handleSearch}
                disabled={
                  !phoneHook.isValid ||
                  loading ||
                  transferring ||
                  !isStatusComplete
                }
                className="bg-main-black disabled:bg-gray-gray55 dark:disabled:bg-gray-gray11 w-full sm:w-16 h-9 text-white disabled:text-gray-gray8 text-xs disabled:cursor-not-allowed"
              >
                {t("general.search")}
              </CustomButton>
            </div>
          </div>

          <StatusStep
            account={account}
            status={status}
            setStep={setStep}
            phoneHook={phoneHook}
          />

          <TransferHistory data={data} />
        </div>
      )}
    </>
  );
}
