import { Play } from "@components/atoms/iconComponents";
import { Divider } from "antd";
import { useTranslations } from "next-intl";
import { CustomFormBaseProps, CustomFormComponentProps } from "../../types";
import CustomForm from "./customForm";

interface ContextHeaderProps extends CustomFormBaseProps {
  ExternalCustomForm?: React.ComponentType<CustomFormComponentProps>;
}

export function ContextHeader(props: ContextHeaderProps) {
  const {
    form,
    typeId,
    config,
    editingRecord,
    setEditingRecord,
    ExternalCustomForm,
    refetchCard,
    refetchTable,
  } = props;
  const t = useTranslations();

  const CustomFormComponent = ExternalCustomForm ?? CustomForm;

  return (
    <>
      <div className="flex gap-2 mb-3 item-center">
        <Play />
        <p className="-mt-[6px] font-bold text-gray-gray135 text-sm">
          {t("general.newItem")}
        </p>
      </div>
      <CustomFormComponent
        typeId={typeId}
        form={form}
        config={config}
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        refetchCard={refetchCard}
        refetchTable={refetchTable}
      />
      <Divider className="my-2" />
    </>
  );
}
