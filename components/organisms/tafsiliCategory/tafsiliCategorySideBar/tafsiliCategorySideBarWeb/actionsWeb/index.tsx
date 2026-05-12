import { CustomTooltip } from "@components/atoms/defaultElements";
import { EditIcon, TrashBin } from "@components/atoms/iconComponents";
import { useTranslations } from "next-intl";
import { ActionsWebType } from "./type";
import React from "react";

interface ActionsWebProps {
  handleSidebarEdit: (id?: number) => void;
  handleSidebarDelete: (id?: number) => void;
}

export const ActionsWeb = (props: ActionsWebProps) => {
  const { handleSidebarEdit, handleSidebarDelete } = props;

  const t = useTranslations();

  const actions: ActionsWebType = [
    {
      key: "edit",
      title: t("general.update"),
      icon: (
        <EditIcon
          config={{
            width: 18,
            height: 18,
          }}
        />
      ),
      onClick: handleSidebarEdit,
    },
    {
      key: "delete",
      title: t("general.delete"),
      icon: <TrashBin />,
      onClick: handleSidebarDelete,
    },
  ];

  return (
    <div className="flex justify-end items-center gap-2" >
      {actions.map((item) => (
        <CustomTooltip
          key={item.key}
          title={item.title}
          className="flex justify-center items-center w-4 h-4 cursor-pointer"
        >
          <button
            type="button"
            className="flex justify-center items-center w-full h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            {item.icon}
          </button>
        </CustomTooltip>
      ))}
    </div>
  );
};
