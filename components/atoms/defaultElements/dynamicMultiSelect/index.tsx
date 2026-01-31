import { FC, useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { DownChevron } from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";
import type { ISelectOption } from "@type/elementType";

import { CustomSelect } from "../select";
import type { IProps } from "./type";

export const DynamicMultiSelect: FC<IProps> = ({
  dynamicValue,
  config,
  ...props
}) => {
  const t = useTranslations();

  const [options, setOptions] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const pageRecordCount = 10;

  const { endpoint, repoViewId, addButton, dependOn, ...bodyRequest } =
    dynamicValue;
  const body = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    FullSearchPhrase:
      searchPhrase && searchPhrase?.length > 3 ? searchPhrase : "",
    PagingInfo: {
      PageRecordCount: pageRecordCount,
      PageNumber: pageNumber,
    },

    RepoViewId: repoViewId,
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== null)
  );

  const { data, isFetching, refetch } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });

  const handleRefetch = () => {
    setPageNumber(1);
    refetch();
  };

  useEffect(() => {
    if (data?.Data) {
      const dynamicOptions = data?.Data?.map((option: ISelectOption) => {
        return {
          key: option._SelectId,
          value: option._SelectId,
          label: option._SelectDisplay,
          title: option._SelectDisplay,
        };
      });
      if (pageNumber === 1) {
        setOptions(dynamicOptions);
      } else {
        setOptions((prevState) => [...prevState, ...dynamicOptions]);
      }
    }
  }, [data?.Data]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

    if (bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount &&
        setPageNumber((prev) => prev + 1);
    }
  };

  return (
    <>
      <CustomSelect
        handleRefetch={handleRefetch}
        isFetching={isFetching}
        mode="multiple"
        virtual={false}
        style={{ width: "100%" }}
        className="!bg-gray-gray3 dark:!bg-gray-gray10 !h-[42px] lg:!h-[2.125rem] !m-0 !p-1 [&>.ant-select-selector]:!p-0 rounded w-full h-fit"
        options={options}
        optionFilterProp={"label"}
        onChange={props.onChange}
        onSearch={(value) => setSearchPhrase(value)}
        config={config}
        maxLength={63}
        notFoundContent={isFetching ? "..." : t("sidebar.notFound")}
        suffixIcon={<DownChevron />}
        onPopupScroll={handleScroll}
        addButton={addButton}
      />
    </>
  );
};
