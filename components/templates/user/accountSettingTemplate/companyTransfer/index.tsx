import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Checkbox } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { Play } from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';

import { sampleData } from '../type';
import AgreementAndTransfer from './agreementAndTransfer';
import HistorySection from './historySection';
import PhoneSearch from './phoneSearch';
import StatusStep from './statusStep';
import {
  AccountInfo,
  CompanyItem,
  fakeCompanies,
  Props,
  Step,
} from './type';

export default function MultiCompanyTransfer({ data = sampleData }: Props) {
  // data
  const [companies, setCompanies] = useState<CompanyItem[]>([]);

  // UI/flow
  const [step, setStep] = useState<Step>("pick");
  const [confirmKey, setConfirmKey] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agree, setAgree] = useState(false);
  // selections
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const selectedNames = useMemo(
    () =>
      companies.filter((c) => selectedIds.includes(c.id)).map((c) => c.name),
    [companies, selectedIds]
  );

  // phone + search
  const [inputPhone, setInputPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const t = useTranslations();
  // transfer status
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
    setCompanies(fakeCompanies);
  }, []);

  // Reset when list changes
  useEffect(() => {
    setSelectedIds([]);
    setInputPhone("");
    setSearchedPhone(null);
    setAccount(null);
    setStep("pick");
    setShowConfirmModal(false);
  }, [companies.length]);

  const toggleSelect = (id: number | string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const hasSelection = selectedIds.length > 0;

  // unified open/close handlers in parent (no change to CustomModal)
  const handleOpenConfirm = () => {
    if (!hasSelection) return; // guard: فقط وقتی انتخاب هست باز کن
    setConfirmKey((k) => k + 1); // force remount
    setAgree(false); // reset agree every open
    setShowConfirmModal(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmModal(false);
    setAgree(false);
  };

  const handleConfirmYes = () => {
    handleCloseConfirm();
    setStep("phone");
  };

  // -------- Search logic (kept behavior) --------
  const handleSearch = async () => {
    const phoneValid = /^\d{11}$/.test(inputPhone);
    if (!phoneValid) return;

    if (step === "status" && !isStatusComplete) return;
    setLoading(true);
    setAgree(false);

    setTimeout(() => {
      const demo: AccountInfo = {
        id: "u-1",
        name: "مریم محسنی",
        phone: inputPhone,
      };
      setAccount(demo);
      setSearchedPhone(inputPhone);
      setLoading(false);

      if (step === "status") {
        setStep("phone");
      }
    }, 700);
  };

  // -------- Transfer logic (kept behavior) --------
  const handleTransfer = async () => {
    setTransferring(true);
    setStep("status");
    setStatus({ request: true, user: false, company: false });

    // clear phone input while transfer runs
    setInputPhone("");

    setTimeout(() => setStatus((s) => ({ ...s, user: true })), 10000);
    setTimeout(() => setStatus((s) => ({ ...s, company: true })), 10000);
    setTimeout(() => setTransferring(false), 10000);
  };
  const { direction, match } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );
  return (
    <div className="space-y-6">
      {/* ---------------- Step 1: Pick Companies ---------------- */}
      {step === "pick" && (
        <div className="space-y-0">
          <div
            className="hidden items-center sm:grid grid-cols-[80px_130px_1fr] mb-4 px-4 border border-gray-gray3 rounded-lg h-14"
            style={{ boxShadow: "0px 2px 8px 0px #00000005" }}
          >
            <p className="text-gray-gray10 dark:text-gray-gray1 text-xs">
              {t("general.row")}{" "}
            </p>
            <p className="text-gray-gray10 dark:text-gray-gray1 text-xs">
           {t("general.companyName")}
            </p>
          </div>

          <div className="sm:space-y-3 w-full">
            {companies.map((item, idx) => {
              const checked = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={[
                    "items-center flex dark:bg-gray-gray11 bg-gray-gray1 sm:bg-gray-gray2 my-2 sm:px-4 px-3  border justify-between !border-gray-gray5 sm:!border-gray-gray11   rounded sm:h-14  h-9 cursor-pointer",
                    checked ? "border-gray-900 bg-gray-50" : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 sm:gap-20">
                    <span className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
                      {item.name}
                    </span>
                  </div>

                  <span
                    className={[" place-items-center flex justify-end"].join(
                      " "
                    )}
                  >
                    {checked ? <Checkbox checked /> : <Checkbox />}
                  </span>
                </div>
              );
            })}
            <div className="justify-end mt-3 sm:!mt-5 w-full text-left">
              <CustomButton
                onClick={handleOpenConfirm}
                disabled={!hasSelection}
                className="bg-main-black disabled:bg-gray-300 dark:disabled:bg-gray-gray11 mr-auto px-4 rounded w-full sm:w-16 h-9 text-white text-xs"
              >
               {t("general.accept")}
              </CustomButton>
            </div>
          </div>

          <CustomModal
            key={confirmKey} // <- use the key so CustomModal remounts each open
            contentClassName={`${match && "w-[527px] h-[300px]"} `}
            closeModal={handleCloseConfirm}
            closeIcon={null}
            isModalOpen={showConfirmModal}
            content={
              <div className="flex flex-col justify-center items-center space-y-9 mx-auto w-full sm:w-[484px] h-64 text-center">
                <p className="text-gray-800 dark:text-gray-gray1 text-sm">
                {t("general.areYouInterestedInTransferringTheCompany")}

                {" "}

                  {` ${selectedNames.length > 1 && t("general.s") } `}
                  <span className="font-semibold mx-2"> 
                   {selectedNames.join(  t("general.and") ) }  
                  </span> 
                  {" "} 
                  {t("general.areYouSureText")}
                </p>

                <div className="flex justify-center gap-3 sm:gap-7">
                  <CustomButton
                    onClick={handleCloseConfirm}
                    className="bg-gray-100 dark:bg-gray-gray12 px-6 border border-gray-300 rounded lg:w-44 min-w-24 h-10 text-gray-700 dark:text-gray-gray1 text-sm"
                  >
                      {t("general.no")}
                  </CustomButton>
                  <CustomButton
                    onClick={handleConfirmYes}
                    className="bg-main-black px-6 rounded lg:w-44 min-w-24 h-10 text-white text-sm"
                  >
                    {t("general.yes")}
                  </CustomButton>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* ---------------- Step 2: Phone + Rules + Result ---------------- */}
      {step === "phone" && (
        <div className="relative w-full">
          <div className="flex items-center gap-3 mb-2 text-right">
            <Play />
            <p className="font-bold text-gray-gray135 dark:text-gray-gray1 text-sm">
             {t("general.transferTo")}
            </p>
          </div>

          <PhoneSearch
            direction={direction}
            value={inputPhone}
            setValue={setInputPhone}
            loading={loading}
            onSearch={handleSearch}
            className="w-full sm:w-[578px] h-16"
          />

          {/* Show result + rules after at least one successful search */}
          {account && searchedPhone === account.phone && (
            <div className="bg-gray-50 dark:bg-gray-gray11 mt-9 p-4 sm:p-5 border-2 border-gray-gray1 dark:border-gray-gray1 rounded w-full sm:w-[495px]">
              <div className="flex justify-between sm:justify-start items-center gap-14 mb-3">
                <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
                  {account.name}
                </div>
                <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
                  {account.phone}
                </div>
              </div>

              <ol className="sm:space-y-2 pr-2 sm:pr-5 text-gray-gray10 dark:text-gray-gray1 text-xs leading-5 sm:leading-7 list-decimal">
                <li>
                {t("companyTransfer.text1")}
                </li>
                <li>
                {t("companyTransfer.text2")}    
                 </li>
                <li>
                {t("companyTransfer.text3")}   
                </li>
                <li>
                {t("companyTransfer.text4")}
              
                </li>
              </ol>

              <AgreementAndTransfer
                agree={agree}
                setAgree={setAgree}
                onTransfer={() => {
                  handleTransfer();
                }}
                transferring={transferring}
              />
            </div>
          )}

          {/* History (extracted) */}
          <HistorySection data={data} />
        </div>
      )}

      {/* ---------------- Step 3: Status (includes search box too) ---------------- */}
      {step === "status" && (
        <div className="space-y-10">
          <PhoneSearch
            value={inputPhone}
            setValue={setInputPhone}
            loading={loading}
            onSearch={handleSearch}
            className="w-[578px] h-16"
            direction={direction}
          />

          <StatusStep
            account={account}
            status={status}
            setStep={setStep}
            setSelectedIds={setSelectedIds}
          />
          <HistorySection data={data} />
        </div>
      )}
    </div>
  );
}
