import {
  FC,
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  DownChevron,
  TrashBin,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { setPageData } from '@slice/pages';
import type { ISelectOption } from '@type/elementType';

import { CustomSelect } from '../select';
import type { IProps } from './type';

interface IOption {
  key: number;
  value: number;
  label: string;
  title: string;
  disabled: boolean;
  listHeight?: number;
}

export const MultiSelectWithList: FC<IProps> = ({
  dynamicValue,
  defOption,
  config,
  listHeight = "h-28", // مقدار پیش‌فرض
  ...props
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { selectedItems } = useAppSelector(
    (state) => ({
      selectedItems: state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((item) => item.name === config.name)?.value,
    }),
    shallowEqual
  );

  const [allOptions, setAllOptions] = useState<IOption[]>([]);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const pageRecordCount = 10;

  const { endpoint, repoViewId, dependOn, ...bodyRequest } = dynamicValue;
  const body = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    FullSearchPhrase: searchPhrase.length > 3 ? searchPhrase : "",
    PagingInfo: {
      PageRecordCount: pageRecordCount,
      PageNumber: pageNumber,
    },
    RepoViewId: repoViewId,
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value !== null)
  );

  const { data, isFetching } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });

  useEffect(() => {
    if (data?.Data) {
      const dynamicOptions: IOption[] = data.Data.map(
        (option: ISelectOption) => ({
          key: option._SelectId,
          value: option._SelectId,
          label: option._SelectDisplay,
          title: option._SelectDisplay,
          disabled: selectedItems?.some(
            (item) => item?.value === option._SelectId
          ),
        })
      );

      const optionMap = new Map<string | number, IOption>();

      allOptions.forEach((opt) => {
        optionMap.set(opt.value, opt);
      });

      dynamicOptions.forEach((opt) => {
        optionMap.set(opt.value, opt);
      });

      setAllOptions(Array.from(optionMap.values()));
    }
  }, [data?.Data, selectedItems]);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

    if (bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount &&
        setPageNumber((prev) => prev + 1);
    }
  };

  const handleDelete = (value) => {
    const updated = selectedItems.filter((item) => item !== value);
    dispatch(
      setPageData({
        name: config.name,
        value: updated,
      })
    );
  };

  const currentOptions = allOptions.filter(
    (option) =>
      !selectedItems?.some((selected) => selected?.value === option.value)
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      <CustomSelect
        showSearch
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        className="custom-select-single"
        options={currentOptions}
        onSearch={(value) => setSearchPhrase(value)}
        onPopupScroll={handleScroll}
        notFoundContent={isFetching ? "..." : t("sidebar.notFound")}
        placeholder={t("general.selectField")}
        suffixIcon={<DownChevron />}
        tagRender={() => null}
        config={config}
      />

      <div
        className="flex flex-col gap-2 p-2 border border-gray-gray5 rounded overflow-auto"
        style={{ height: listHeight }}
      >
        {selectedItems &&
          selectedItems?.map((value: number, index: number) => {
            const element = allOptions?.find(
              (option) => option?.value === value
            );

            const def = defOption?.find((item) => item?.value === value);

            const title = element?.title || element?.label || def?.name;
            const correctValue = element?.value || def?.value;

            return (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-gray3 p-1 rounded text-xs"
              >
                <span>{title}</span>
                <button
                  className="hover:bg-red-300 p-1 rounded text-white text-xs cursor-pointer"
                  onClick={() => handleDelete(correctValue)}
                >
                  <TrashBin />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};
