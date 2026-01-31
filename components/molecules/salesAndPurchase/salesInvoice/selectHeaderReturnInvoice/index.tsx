import { useEffect, useState } from "react";

import moment from "moment-jalaali";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomRadio,
  CustomSelect,
  CustomSpin,
} from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import { setPageData } from "@slice/pages";

import { IProps, ISelectHeaderReturnInvoice } from "./type";

export const SelectHeader = ({ config }: IProps) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { locale, currentValue } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      currentValue: config
        ? state.withPersist.pages
            .find((item) => item.isActive)
            ?.pageData?.find((element) => element.name === config.name)
            ?.value ?? null
        : undefined,
    }),
    shallowEqual
  );

  const [options, setOptions] = useState<
    {
      key: number;
      value: number;
      label: string;
      Id: number;
      VoucherDate: string;
      VoucherDesc: string;
      DetailCount: number;
      TotalAddition: number;
      TotalDeduction: number;
      TotalTax: number;
      TotalDiscount: number;
      TotalAmount: number;
      CustomerName: string;
      VoucherNumber: number;
    }[]
  >([]);
  const [searchPhrase, setSearchPhrase] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const pageRecordCount = 10;

  const body = {
    FullSearchPhrase: searchPhrase ? searchPhrase : "",
    PagingInfo: {
      PageRecordCount: pageRecordCount,
      PageNumber: pageNumber,
    },
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== null)
  );

  const { data, refetch, isFetching } = useGetData<
    ISelectHeaderReturnInvoice[],
    null
  >({
    url: "api/sale/select/invoice4selectOption/elk",
    body: existBody,
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (id: number) => {
    const {
      caption,
      help,
      name,
      order,
      placeHolder,
      rules,
      type,
      selectEndpoint,
    } = config;
    dispatch(
      setPageData({
        caption,
        help,
        name,
        order,
        placeHolder,
        rules,
        type,
        selectEndpoint,
        value: id,
      })
    );
    handleToggle();
  };

  const handleRefetch = () => {
    setPageNumber(1);
    refetch();
  };

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

    if (bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount &&
        setPageNumber((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (data?.Data) {
      const dynamicOptions = data?.Data?.map(
        (option: ISelectHeaderReturnInvoice) => {
          return {
            ...option,
            key: option.Id,
            value: option.Id,
            label: option.VoucherNumber?.toString() ?? option.VoucherDesc,
          };
        }
      );
      if (pageNumber === 1) {
        setOptions(dynamicOptions);
      } else {
        setOptions((prevState) => [...prevState, ...dynamicOptions]);
      }
      // if (searchPhrase === null && !currentValue) {
      //   // setOptions([]);
      // } else {
      //   if (pageNumber === 1) {
      //     setOptions(dynamicOptions);
      //   } else {
      //     setOptions((prevState) => [...prevState, ...dynamicOptions]);
      //   }
      // }
    }
  }, [data?.Data]);

  return (
    <>
      <CustomSelect
        id={config.name}
        className="w-fit"
        showSearch
        allowClear
        popupMatchSelectWidth={400}
        config={config}
        placeholder={t("general.search")}
        options={options}
        value={currentValue}
        onClear={() => {
          setSearchPhrase(null);
          setPageNumber(1);
        }}
        handleRefetch={handleRefetch}
        handleScroll={handleScroll}
        onPopupScroll={handleScroll}
        setSearchPhrase={setSearchPhrase}
        searchPhrase={searchPhrase}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleChange(options[0].Id);
          }
        }}
        open={isOpen}
        onOpenChange={() => handleToggle()}
        popupRender={(menu) => (
          <div className="flex flex-col gap-2 p-2 h-[400px] overflow-y-auto">
            {options?.map((option) => (
              <div
                key={option.key}
                onClick={() => handleChange(option.Id)}
                className="flex flex-col gap-2 hover:bg-gray-gray2 p-2 border border-gray-300 dark:border-gray-950 rounded"
              >
                <div className="flex items-center gap-2 font-bold">
                  <CustomRadio
                    value={option.Id}
                    checked={option.Id === currentValue}
                  />
                  <span>{option.CustomerName}</span>
                </div>
                <div className="flex justify-between items-center gap-2 text-gray-gray10 text-sm">
                  <span>
                    {moment(option.VoucherDate)
                      .locale("fa")
                      .format("jYYYY/jMM/jDD")}
                  </span>
                  <span>{option.VoucherNumber}</span>
                </div>
                <span className="flex justify-end text-blue-blue4 text-lg">
                  {locale === "fa"
                    ? option?.TotalAmount?.toLocaleString("fa-IR")
                    : option?.TotalAmount?.toLocaleString("en-US")}
                </span>
              </div>
            ))}

            {isFetching && (
              <div className="flex justify-center">
                <CustomSpin className="w-full" size="large" />
              </div>
            )}
            {/* {options.length === 0 && (
              <div className="flex justify-center">
                <span>{t("general.noSearchTerm")}</span>
              </div>
            )} */}
          </div>
        )}
        onSearch={(value) => setSearchPhrase(value)}
      />
    </>
  );
};
