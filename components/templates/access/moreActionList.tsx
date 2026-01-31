import React, { useEffect, useRef, useState } from "react";

import { Dropdown, MenuProps } from "antd";
import { useTranslations } from "next-intl";

import { Dots, DownChevron } from "@components/atoms/iconComponents";

import AccessByAuthorizedList from "./AccessByAuthorizedList";
import type { Action, ISystemId } from "./type";

interface IProps {
  actions: Action[];
  systemIds: ISystemId[];
  handleSubmit: (e: any) => void;
  id: string | number;
  handleChange: (e: any) => void;
}
function MoreActionList({ ...props }: IProps) {
  const [open, setOpen] = useState(false);
  const { actions, handleSubmit, systemIds, id, handleChange } = props;
  const t = useTranslations();

  const submitHandler = (e) => {
    handleSubmit(e);
  };
  const changeHandler = (e) => {
    handleChange(e);
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <ActionsList
          systemIds={systemIds}
          handleChange={changeHandler}
          handleSubmit={submitHandler}
          setOpen={setOpen}
          actions={actions}
          id={id}
        />
      ),
    },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      open={open}
      className="flex justify-start items-center"
      openClassName=""
      rootClassName="[&>ul>li]:!p-0 [&>ul>.ant-dropdown-menu-item-active]:!bg-main-white [&>ul]:!p-0 [&>ul]:!w-40"
      menu={{ items }}
    >
      <div
        onClick={() => {
          setOpen(!open);
        }}
      >
        {t("general.moreAction")} <DownChevron />
      </div>
    </Dropdown>
  );
}

export default MoreActionList;

const ActionsList = ({
  actions,
  setOpen,
  systemIds,
  handleChange,
  handleSubmit,
  id,
}) => {
  const t = useTranslations();
  const containerRef = useRef(null);
  const submit = (e) => {
    handleSubmit(e);
  };
  const change = (e) => {
    handleChange(e);
  };

  const detailDrop = actions.map((item, index) => ({
    label: item.ActionName,
    key: index,
    icon: (
      <AccessByAuthorizedList
        systemIds={systemIds}
        item={{
          Mode: item?.HasAccess,
          ActionId: item?.ActionId,
          RepoId: item.RepoId,
          id,
        }}
        handleChange={change}
        handleSubmit={submit}
        title={
          <span className="cursor-pointer">
            <Dots config={{ height: 20, width: 16 }} />
          </span>
        }
        endPoint={"/api/auth/select/access"}
        ActionType={item.ActionType}
        actionTypeId={2}
      />
    ),
  }));
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={containerRef} className="flex flex-col justify-end w-40">
      <div className="flex flex-col gap-2 px-2 py-3 w-40 max-h-52 overflow-x-hidden overflow-y-auto">
        {detailDrop?.map((item, index) => (
          <div key={index} className="flex gap-2">
            {item.icon}
            <div className="flex items-center w-full overflow-hidden font-normal text-2xs text-gray-gray9 text-ellipsis whitespace-nowrap">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
