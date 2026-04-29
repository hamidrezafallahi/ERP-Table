import { Play } from "@components/atoms/iconComponents";
import { Divider } from "antd";
import { useTranslations } from "next-intl";
import { FormInstance } from "antd/lib";
import { IDynamicModalConfig, RecordType } from "../../type";
import CustomForm from "./customForm";
import { Dispatch, SetStateAction } from "react";

interface ContextHeaderProps {
  form: FormInstance<any>;
  typeId: number;
  config: IDynamicModalConfig;
  editingRecord: RecordType;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
}

export function ContextHeader({
  form,
  typeId,
  config,
  editingRecord,
  setEditingRecord,
}: ContextHeaderProps) {
  const t = useTranslations();

  return (
    <>
      <div className="flex gap-2 mb-3 item-center">
        <Play />
        <p className="-mt-[6px] font-bold text-gray-gray135 text-sm">
          {t("general.newItem")}
        </p>
      </div>
      <CustomForm
        typeId={typeId}
        form={form}
        config={config}
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
      />
      <Divider className="my-2" />
    </>
  );
}
