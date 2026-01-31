import { CustomDropdownButton } from "@components/atoms/defaultElements";
import { DownChevron } from "@components/atoms/iconComponents";

import { IProps } from "./type";

interface ITabConfig {
  key: string;
  label: string;
  value: number;
  extra?: any;
  disabled?: boolean;
  children?: ITabConfig[];
}

const tabConfig: ITabConfig[] = [
  {
    key: "صندوق",
    value: 1,
    label: "صندوق",
    extra: {
      fieldKey: "CashStatementId",
      detailKey: "CashStatements",
    },
    // disabled: false,
  },
  {
    key: "تنخواه",
    value: 2,
    label: "تنخواه",
    extra: {
      fieldKey: "TankhahStatementId",
      detailKey: "TankhahStatements",
    },
    // disabled: true,
  },
  {
    key: "افراد",
    value: 3,
    label: "افراد",
    extra: {
      fieldKey: "TafsiliStatementId",
      detailKey: "TafsiliStatements",
    },
    // disabled: true,
  },
  {
    key: "حساب بانکی",
    value: 4,
    label: "حساب بانکی",
    extra: {
      fieldKey: "BankStatementId",
      detailKey: "BankStatements",
    },
    // disabled: true,
  },
];

export const WithdrawalTab = ({ active, setActive }: IProps) => {
  const renderOption = (items: ITabConfig[]) =>
    items.map((item) => {
      return {
        key: item.key,
        disabled: item.disabled,
        label: (
          <span
            className="flex text-sm"
            onClick={() => {
              setActive({
                key: item.key,
                value: item.value,
                fieldKey: item.extra.fieldKey,
                detailKey: item.extra.detailKey,
                detailCaption: item.label,
              });
            }}
          >
            {item.label}
          </span>
        ),
      };
    });

  return (
    <div className="gap-x-4 grid grid-cols-4 bg-gray-gray2 mt-6 border rounded">
      {tabConfig.map((item) => {
        const isActive = item.value === active.value;
        const options = item.children ? renderOption(item.children) : [];
        const activeLabel = options
          ? item.children?.find(
              (el) => el.key === active.key && el.value === active.value
            )?.label
          : null;

        return (
          <div
            className={`${
              isActive
                ? "bg-gray-gray55 cursor-default"
                : item.disabled
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } flex items-center gap-2 p-2 w-full  rounded`}
            key={item.key}
          >
            {options.length > 0 ? (
              <CustomDropdownButton placement="bottom" items={options}>
                <span className="flex flex-1 justify-between items-center px-1 text-gray-gray10 dark:text-white text-xs cursor-pointer">
                  {activeLabel ? activeLabel : item.label}
                  <DownChevron />
                </span>
              </CustomDropdownButton>
            ) : (
              <span
                onClick={() => {
                  if (!item.disabled && !item.children) {
                    setActive({
                      key: item.key,
                      value: item.value,
                      fieldKey: item.extra.fieldKey,
                      detailKey: item.extra.detailKey,
                      detailCaption: item.label,
                    });
                  }
                  setActive({
                    key: item.key,
                    value: item.value,
                    fieldKey: item.extra.fieldKey,
                    detailKey: item.extra.detailKey,
                    detailCaption: item.label,
                  });
                }}
                className="flex-1 px-1 text-gray-gray10 dark:text-white text-xs"
              >
                {activeLabel ? activeLabel : item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
