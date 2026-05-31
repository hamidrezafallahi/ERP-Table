import {
  FC,
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import { useGetData } from '@services/base';
import type {
  IOption,
  ISelectOption,
} from '@type/elementType';

import { CustomSelect } from '../select';
import type { IProps } from './type';

export const DynamicSelect: FC<IProps> = ({
  className,
  value,
  onChange,
  dynamicValue,
  showId = false,
  infinite = false,
  onSearchPhrase,
  config,
  onOptionsChange,
  labelValue = "selectDisplay",
  selectFirstDefault = false,
  displayFormatter,
  disabled,
  ...props
}) => {
  const t = useTranslations();
  const [options, setOptions] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const pageRecordCount = 5000;

  const {
    endpoint,
    repoViewId,
    addButton,
    dependOn,
    dependsOn,
    ...bodyRequest
  } = dynamicValue;

  const getOptionLabel = (option: ISelectOption) => {
    if (displayFormatter) return displayFormatter(option);
    return option._SelectDisplay;
  };

  const body = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    // FullSearchPhrase: props.showSearch
    //   ? searchPhrase && searchPhrase?.length > 2
    //     ? searchPhrase
    //     : ""
    //   : "",
    PagingInfo: infinite
      ? {
          PageRecordCount: pageRecordCount,
          PageNumber: pageNumber,
        }
      : null,
    RepoViewId: repoViewId,
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== null),
  );
  const { data, isFetching, refetch } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });

  const handleRefetch = () => {
    setPageNumber(1);
    if (dependOn && !dependOn.value) {
      console.log(dynamicValue);
      console.log(
        `هنوز وابستگی ${dependOn.fieldName} پر نشده که بخواهد داده واکشی کند  skip ٝعال هست هنوز `,
        dependOn,
      );
    } else {
      refetch();
    }
  };
  useEffect(() => {
    if (data?.Data) {
      if (infinite) {
        if (showId) {
          const dynamicOptions = data?.Data?.map((option: ISelectOption) => {
            return {
              key: option._SelectId,
              value: option._SelectId,
              // label: showIdInDesc
              //   ? `${option._SelectId} - ${option._SelectDisplay}`
              //   : `${option._SelectDisplay}`,
              label:
                labelValue == "selectValue"
                  ? option._SelectValue
                  : getOptionLabel(option),
              title: getOptionLabel(option),
              option: option,
            };
          });
          if (pageNumber === 1) {
            setOptions(dynamicOptions);
          } else {
            setOptions((prevState) => [...prevState, ...dynamicOptions]);
            if (selectFirstDefault) {
              onChange?.(dynamicOptions[0]?.value);
            }
          }
        } else {
          const dynamicOptions = data?.Data?.map((option: ISelectOption) => {
            return {
              key: option._SelectId,
              value: option._SelectId,
              label:
                labelValue == "selectValue"
                  ? option._SelectValue
                  : getOptionLabel(option),
              title: getOptionLabel(option),
              option: option,
            };
          });
          if (pageNumber === 1) {
            setOptions(dynamicOptions);
          } else {
            setOptions((prevState) => [...prevState, ...dynamicOptions]);
          }
        }
      } else {
        if (showId) {
          const staticOptions = data?.Data?.map((option: ISelectOption) => {
            return {
              key: option._SelectId,
              value: option._SelectId,
              // label: `${option._SelectId} - ${option._SelectDisplay}`,
              label:
                labelValue == "selectValue"
                  ? option._SelectValue
                  : getOptionLabel(option),
              title: getOptionLabel(option),
              option: option,
            };
          });
          setOptions(staticOptions);
        } else {
          const staticOptions = data?.Data?.map((option: ISelectOption) => {
            return {
              key: option._SelectId,
              value: option._SelectId,
              label:
                labelValue == "selectValue"
                  ? option._SelectValue
                  : getOptionLabel(option),
              title: getOptionLabel(option),
              option: option,
            };
          });
          setOptions(staticOptions);
        }
      }
    }
  }, [data?.Data]);

  useEffect(() => {
    if (infinite) {
      if (searchPhrase?.length > 2) {
        setPageNumber(1);
      }
    }
  }, [searchPhrase]);

  useEffect(() => {
    if (onOptionsChange && options) {
      onOptionsChange(options);
    }
    if (selectFirstDefault) {
      onChange?.(options[0]?.value);
    }
  }, [options, onOptionsChange]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

    if (infinite && bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount &&
        setPageNumber((prev) => prev + 1);
    }
  };

  const findOptionWithTitle = (data: IOption[], searchTerm: string) => {
    const results = [];
    const search = (items) => {
      items.forEach((item) => {
        if (
          item?.title?.includes(searchTerm) ||
          item?.label?.includes(searchTerm)
        ) {
          results.push(item);
        }
        if (item.children && item.children.length > 0) {
          search(item.children);
        }
      });
    };
    search(data);
    return results;
  };

  return (
    <>
      <CustomSelect
        labelInValue={false}
        isFetching={isFetching}
        handleRefetch={handleRefetch}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        handleScroll={handleScroll}
        {...props}
        disabled={disabled}
        className={`${className}`}
        value={value}
        onClear={() => {
          if (infinite) {
            setSearchPhrase("");
            setPageNumber(1);
          }
          props.onClear;
        }}
        placeholder={
          props.placeholder
            ? props.placeholder
            : props.showSearch
              ? t("general.search")
              : t("general.selectField")
        }
        optionRender={(originNode, info) => {
          return (
            <div className="flex justify-between items-center !h-fit">
              <span>{originNode.data.title}</span>
            </div>
          );
        }}
        onPopupScroll={handleScroll}
        notFoundContent={isFetching ? "Loading..." : "No options found"}
        onChange={onChange}
        filterOption={(input, option) => {
          if(props.filterOption && typeof props.filterOption === "function"){
            return props.filterOption(input, option)
          }else{

            const label = option?.label;
            return (
              typeof label === "string" &&
              label.toLowerCase().includes(input.toLowerCase())
            );
          }
        }}
        onSearch={(value) => {
          if (infinite) {
            setSearchPhrase(value);
            const correctOption = findOptionWithTitle(options, value);
            if (correctOption.length === 1) {
              if (onSearchPhrase) {
                return onSearchPhrase(
                  correctOption[0].value,
                  correctOption[0]?.title,
                  correctOption,
                );
              }
            }
          }
          props.onSearch;
        }}
        options={options}
        config={config}
        addButton={addButton}
      />
    </>
  );
};
