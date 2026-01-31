import { MenuProps } from "antd";
import { useTranslations } from "next-intl";

import { CustomDropdownButton } from "@components/atoms/defaultElements";
import { ShorthandFormToolbarIcon } from "@components/atoms/iconComponents";

function ShorthandFormToolbar({ ...props }) {
  const {
    handleReset,
    handleAdd,
    handleSubmitAndSave,
    handleNextItem,
    handlePrevItem,
    disabledNextButton,
    disabledPrevButton,
  } = props;
  const t = useTranslations();

  const shorthandsItems: MenuProps["items"] = [
    {
      key: 1,
      label: "جدید",
      onClick: () => handleAdd(),
    },
    {
      key: 2,
      label: "ذخیره و جدید",
      onClick: () => handleSubmitAndSave(),
    },
    {
      key: 3,
      label: "باز نشانی",
      onClick: () => handleReset(),
    },
    {
      key: 4,
      label: "چاپ",
      onClick: () => console.log("چاپ"),
    },
    {
      type: "divider",
    },
    {
      key: 6,
      label: "رکورد قبل",
      onClick: () => handlePrevItem(),
    },
    {
      key: 7,
      label: "رکورد بعد",
      onClick: () => handleNextItem(),
    },
  ];
  return (
    <CustomDropdownButton
      className="xxl:hidden flex justify-center items-center !bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
      items={shorthandsItems}
    >
      <span className="cursor-pointer">
        <ShorthandFormToolbarIcon />
      </span>
    </CustomDropdownButton>
  );
}

export default ShorthandFormToolbar;
