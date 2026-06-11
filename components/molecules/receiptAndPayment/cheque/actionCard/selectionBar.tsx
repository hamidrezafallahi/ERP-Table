import { Checkbox } from "antd";
import { Close } from "@components/atoms/iconComponents";
import { useTranslations } from "next-intl";

interface SelectionBarProps {
  indeterminate: boolean;
  selectAll: boolean;
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
  onClose: () => void;
}

const SelectionBar = (props: SelectionBarProps) => {
  const { indeterminate, onClose, onSelectAll, selectAll, selectedCount } =
    props;
  const t = useTranslations();
  return (
    <div className="-top-[52px] absolute flex justify-between items-center bg-white px-2 w-full h-[38px]">
      <div className="flex items-center gap-2">
        <Checkbox
          indeterminate={indeterminate}
          checked={selectAll}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
        <p className="text-gray-gray10 dark:text-white text-xs">
          {t("general.selectAll")}
        </p>
        {selectedCount > 0 && (
          <span className="text-gray-gray10 dark:text-white text-xs">
            ( {selectedCount} {t("general.item")} )
          </span>
        )}
      </div>
      <div className="cursor-pointer" onClick={onClose}>
        <Close config={{ height: 18, width: 18, stroke: "#585858" }} />
      </div>
    </div>
  );
};
export default SelectionBar;
