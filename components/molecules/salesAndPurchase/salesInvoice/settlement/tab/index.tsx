import { CustomDropdownButton } from "@components/atoms/defaultElements";
import { DownChevron } from "@components/atoms/iconComponents";

import { SettlementTypeEnum } from "../type";
import { IProps } from "./type";

interface ITabConfig {
  key: string;
  label: string;
  value: number;
  fieldKey: string;
  disabled?: boolean;
  children?: ITabConfig[];
}

const tabConfig: ITabConfig[] = [
  {
    key: "1",
    value: SettlementTypeEnum.Cash,
    label: "نقد",
    fieldKey: "CashStatementId",
    // disabled: false,
  },
  {
    key: "2",
    value: SettlementTypeEnum.Bank,
    fieldKey: "BankStatementId",
    label: "واریز به بانک",
    // disabled: true,
  },
  {
    key: "3",
    value: SettlementTypeEnum.Cheque,
    label: "چک",
    fieldKey: "CheckReceiptHeaderId",
    // disabled: true,
  },
  {
    key: "4",
    value: SettlementTypeEnum.All,
    label: "لیست پرداختی ها",
    fieldKey: "",
    // disabled: true,
  },
];

export const SettlementTab = ({ active, setActive }: IProps) => {
  const renderOption = (items: ITabConfig[]) =>
    items.map((item) => {
      return {
        key: item.key,
        disabled: item.disabled,
        label: (
          <span
            className="flex justify-center items-center text-sm"
            onClick={() => {
              setActive({
                key: item.key,
                value: item.value,
                fieldKey: item.fieldKey,
              });
            }}
          >
            {item.label}
          </span>
        ),
      };
    });

  return (
    <div className="justify-items-center gap-x-4 grid grid-cols-4 bg-gray-gray2 mb-6 h-10 border-[0.063rem] border-gray-gray6 rounded-lg">
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
                ? "bg-gray-gray55 cursor-default border-e-[0.063rem] border-s-[0.063rem] border-gray-gray6 rounded-lg"
                : item.disabled
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } flex justify-center items-center gap-2 p-1 w-full rounded`}
            key={item.key}
            onClick={() => {
              if (!item.disabled && !item.children) {
                setActive({
                  key: item.key,
                  value: item.value,
                  fieldKey: item.fieldKey,
                });
              }
              setActive({
                key: item.key,
                value: item.value,
                fieldKey: item.fieldKey,
              });
            }}
          >
            {options.length > 0 ? (
              <CustomDropdownButton placement="bottom" items={options}>
                <span className="flex flex-1 px-1 text-gray-gray10 dark:text-white text-xs cursor-pointer">
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
                      fieldKey: item.fieldKey,
                    });
                  }
                  setActive({
                    key: item.key,
                    value: item.value,
                    fieldKey: item.fieldKey,
                  });
                }}
                className="flex justify-center items-center px-1 font-medium text-sm text-gray-gray10 dark:text-white "
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
