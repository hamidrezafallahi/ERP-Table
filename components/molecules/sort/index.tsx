import {
  useEffect,
  useState,
} from 'react';

import { Badge } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import {
  AdvancedSortIcon,
  Close,
  SortAscending,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { apiService } from '@services/base';
import { setViewData } from '@slice/pages';

import type { IProps } from './type';

export default function Sort({
  openSortModal,
  data,
  viewData,
  onResetSortOrder,
  rowFieldKey,
}: IProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);

  const [sort, setSort] = useState({ field: rowFieldKey, order: "" });

  const menu = data && [
    { value: rowFieldKey, label: t("general.default") },
    ...data,
  ];

  const orderCount = viewData?.OrderInfo?.length;

  const handleFieldChange = (field) => {
    if (field === "") {
      setSort({ field: "", order: "" });
    } else {
      setSort({ field: field, order: sort.order === "asc" ? "desc" : "asc" });
    }
  };

  useEffect(() => {
    if (orderCount > 1) {
      setSort({ field: "", order: "" });
    }
    if (orderCount === 1) {
      setSort({
        field: viewData?.OrderInfo[0].ColName,
        order: viewData?.OrderInfo[0].Asc ? "asc" : "desc",
      });
    }
  }, [orderCount]);

  const onApplySort = (sort: { field: string; order: string }) => {
    if (sort.field !== "") {
      dispatch(
        setViewData({
          ...viewData,
          OrderInfo: [
            {
              ColName: sort.field,
              Asc: sort.order === "asc" ? false : true,
            },
          ],
          PagingInfo: {
            PageNumber: 1,
            PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
          },
        })
      );
      dispatch(apiService.util.resetApiState());
    } else {
      dispatch(
        setViewData({
          ...viewData,
          OrderInfo: [],
          PagingInfo: {
            PageNumber: 1,
            PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
          },
        })
      );
    }
  };

  const mobileItems = [
    {
      key: "0",
      label: "خاص",
      onClick: openSortModal,
    },
    {
      key: "1",
      label: "پیش فرض (صعودی)",

      onClick: () => {
        setSort({ field: rowFieldKey, order: "asc" });
        onApplySort(sort);
      },
      disabled: orderCount > 1 || sort.order === "asc",
    },
    {
      key: "2",
      label: "پیش فرض (نزولی)",
      onClick: () => {
        setSort({ field: rowFieldKey, order: "desc" });
        onApplySort(sort);
      },
      disabled: orderCount > 1 || sort.order === "desc",
    },
  ];

  return match ? (
    <>
      {orderCount > 1 ? (
        <span
          className="flex items-center bg-gray-gray3 hover:bg-gray-gray5 dark:bg-gray-gray10 p-2 rounded h-full cursor-pointer"
          onClick={onResetSortOrder}
        >
          <Close
            config={{
              width: 14,
              height: 14,
            }}
          />
        </span>
      ) : (
        <div
          className="flex justify-center !px-0 items-center hover:bg-gray-gray6 bg-gray-gray6 rounded selection:rounded-s h-full cursor-pointer"
          onClick={() => {
            handleFieldChange(sort.field);
            sort.field && onApplySort(sort);
          }}
        >
          <span
            className={`transition-all duration-300 w-full mx-2 ${
              sort.order === "asc" ? "" : "rotate-180 text-gray-gray2"
            }`}
          >
            <SortAscending config={{ stroke: "#0e0e0e" }} />
          </span>
        </div>
      )}

      {orderCount > 1 ? (
        <span className="bg-main-white dark:bg-gray-gray10 me-1 p-0 rounded-full w-5 h-5 text-sm text-center">
          {orderCount}
        </span>
      ) : (
        <CustomDropdownButton
          placement="bottom"
          className="flex items-center hover:text-main-black"
          items={menu?.map((item) => ({
            key: item.value,
            label: item.label,
            className: `${
              item.label === t("general.default") &&
              "border-b-2 border-dashed !text-gray-gray7 "
            }`,
          }))}
          onClick={(item) => {
            handleFieldChange(item.key);
            if (item.key === "") {
              onApplySort({ field: "", order: "" });
            } else {
              onApplySort({ field: item.key, order: "asc" });
            }
          }}
        >
          <span className="w-full text-[10px] text-gray-gray10 dark:text-white cursor-pointer">
            {sort.field
              ? menu?.find((i) => i.value === sort.field)?.label
              : t("general.default")}
          </span>
        </CustomDropdownButton>
      )}
      <span className="ps-1">|</span>
      <span
        className="flex items-center pe-2 h-full cursor-pointer"
        onClick={openSortModal}
      >
        <AdvancedSortIcon />
      </span>
    </>
  ) : (
    <>
      <CustomDropdownButton
        placement="bottom"
        className="flex items-center hover:text-main-black dark:text-white"
        items={mobileItems}
      >
        <span
          className={`transition-all duration-300 w-full mx-2 cursor-pointer ${
            sort.order === "asc" ? "" : "rotate-180 text-gray-gray2"
          }`}
        >
          <Badge offset={[-2, 3]} dot={orderCount > 0 ? true : false}>
            <SortAscending
              config={{
                width: 20,
                height: 20,
              }}
            />
          </Badge>
        </span>
      </CustomDropdownButton>
    </>
  );
}
