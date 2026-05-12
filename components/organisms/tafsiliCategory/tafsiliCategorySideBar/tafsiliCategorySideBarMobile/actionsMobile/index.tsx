import { CustomTooltip } from "@components/atoms/defaultElements";
import {
  Close,
  EditIcon,
  PlusIcon,
  SavePlus,
  TrashBin,
} from "@components/atoms/iconComponents";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import { ActionsMobileType } from "./type";
import { FormInstance } from "antd";

interface ActionsMobileProps {
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  handleSidebarEdit: (id?: number) => void;
  handleSidebarDelete: (id?: number) => void;
  disableActions?: boolean;
  form: FormInstance<any>;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

export const ActionsMobile = (props: ActionsMobileProps) => {
  const {
    setOpenModal,
    handleSidebarEdit,
    disableActions,
    form,
    isEdit,
    setIsEdit,
    handleSidebarDelete,
  } = props;
  const t = useTranslations();

  const actions: ActionsMobileType = [
    {
      key: "delete",
      title: disableActions
        ? t("general.notActive")
        : isEdit
          ? t("general.close")
          : t("general.delete"),

      icon: isEdit ? (
        <Close
          config={{
            width: 15,
            height: 15,
            stroke: "black",
          }}
        />
      ) : (
        <TrashBin config={{ stroke: disableActions ? "#9CA3AF" : "black" }} />
      ),
      onClick: isEdit ? () => setIsEdit(false) : handleSidebarDelete,
      disabled: disableActions,
    },
    {
      key: "edit",
      title: disableActions
        ? t("general.notActive")
        : isEdit
          ? t("general.save")
          : t("general.update"),
      icon: (
        <>
          {isEdit ? (
            <SavePlus
              config={{
                width: 18,
                height: 18,
                stroke: "black",
              }}
            />
          ) : (
            <EditIcon
              config={{
                width: 18,
                height: 18,
                stroke: disableActions ? "#9CA3AF" : "black",
              }}
            />
          )}
        </>
      ),
      onClick: isEdit ? () => form.submit() : handleSidebarEdit,
      disabled: disableActions && !isEdit,
    },
    {
      key: "add",
      title: t("general.addNew"),
      icon: (
        <PlusIcon
          config={{
            width: 26,
            height: 26,
            stroke: "black",
          }}
        />
      ),
      onClick: () => setOpenModal(true),
      disabled: false,
    },
  ];

  return (
    <div className="flex justify-end items-center gap-3">
      {actions.map((item) => (
        <CustomTooltip
          key={item.key}
          title={item.title}
          className={`
             bg-gray-gray3 flex justify-center items-center w-8 h-8 rounded
              ${item.disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
            `}
        >
          <span
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
              }
            }}
          >
            {item.icon}
          </span>
        </CustomTooltip>
      ))}
    </div>
  );
};
