import { CustomDropdownButton } from "@components/atoms/defaultElements";
import { DownChevron } from "@components/atoms/iconComponents";

import type { IProps } from "./type";

interface ITabConfig {
  key: string;
  label: string;
  value: number;
  disabled?: boolean;
  children?: ITabConfig[];
}

const tabConfig: ITabConfig[] = [
  {
    key: "1",
    label: "خزانه داری",
    value: 1,
    // disabled: false,
    children: [
      {
        key: "1-1",
        value: 1,
        label: "نحوه خزانه داری",
        // disabled: false,
      },
      {
        key: "1-2",
        value: 1,
        label: "شابلون خزانه داری",
        // disabled: true,
      },
    ],
  },
  {
    key: "2",
    value: 2,
    label: "فروش",
    // disabled: true,
  },
  {
    key: "3",
    value: 3,
    label: "خرید",
    // disabled: true,
  },
  {
    key: "4",
    value: 4,
    label: "حقوق و دستمزد",
    // disabled: true,
  },
  {
    key: "5",
    value: 5,
    label: "انبارداری",
    // disabled: true,
  },
];

export const AccountSettingTab = ({ active, setActive }: IProps) => {
  const renderOption = (items: ITabConfig[]) =>
    items.map((item) => {
      return {
        key: item.key,
        disabled: item.disabled,
        label: (
          <span
            className="flex text-sm"
            onClick={() => {
              setActive({ key: item.key, value: item.value });
            }}
          >
            {item.label}
          </span>
        ),
      };
    });

  return (
    <div className="gap-x-4 grid grid-cols-5 bg-gray-gray2 mb-6 border rounded">
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
            } flex items-center gap-2 p-1 w-full  rounded`}
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
                    setActive({ key: item.key, value: item.value });
                  }
                  setActive({ key: item.key, value: item.value });
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
