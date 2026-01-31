import React, { useState } from "react";

import { Dropdown, MenuProps } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import { Close } from "@components/atoms/iconComponents";
import { useGetData } from "@services/base";

import type { IAccessByAuthorizedList } from "./type";

function AccessByAuthorizedList({ ...props }: IAccessByAuthorizedList) {
  const { item, handleChange, handleSubmit, title, hasCheckbox = true } = props;

  const [checkItem, setCheckItem] = useState(item);
  const [open, setOpen] = useState(false);
  const [exceptList, setExceptList] = useState([]);

  const submitHandler = () => {
    handleSubmit({ ...checkItem, Places: exceptList });
    setOpen(false);
  };

  const changeHandler = (e) => {
    setCheckItem({ ...checkItem, Mode: e.target.checked });
    handleChange({
      ActionId: checkItem.ActionId,
      Mode: e.target.checked ? "Add" : "Delete",
    });
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <AuthorizedList
          submitHandler={submitHandler}
          setOpen={setOpen}
          item={item}
          setExceptList={setExceptList}
        />
      ),
    },
  ];

  return (
    <div className="flex justify-center gap-0 w-full">
      {hasCheckbox && (
        <CustomCheckbox onChange={changeHandler} checked={checkItem.Mode} />
      )}
      <Dropdown
        trigger={["click"]}
        open={open}
        className=""
        openClassName=""
        rootClassName="[&>ul>li]:!p-0 [&>ul>.ant-dropdown-menu-item-active]:!bg-main-white [&>ul]:!p-0"
        menu={{ items }}
      >
        <div
          onClick={() => {
            setOpen(!open);
          }}
        >
          {title}
        </div>
      </Dropdown>
    </div>
  );
}

export default AccessByAuthorizedList;

const AuthorizedList = ({ item, submitHandler, setOpen, setExceptList }) => {
  const t = useTranslations();
  //TODO: add type
  const { data } = useGetData<any, any>({
    url: "/api/auth/select/roleActionPlace",
    body: {
      RoleId: item.id,
      ActionId: item.ActionId,
    },
  });
  const detailDropChange = (e) => {
    setExceptList((prevState) => {
      const exists = prevState.some((item) => item.id === e.id);
      if (exists) {
        return prevState.map((item) => (item.id === e.id ? e : item));
      } else {
        return [...prevState, e];
      }
    });
  };

  const detailDrop = data?.Data?.[0]?.ActionPlaceAccesses?.map((item) => ({
    label: item.PlaceDesc,
    key: item.PlaceId,
    icon: (
      <InnerCheckBox
        onChange={detailDropChange}
        checked={item.HasAccess}
        id={item.PlaceId}
        label={item.PlaceDesc}
      />
    ),
  }));

  return (
    <div className="flex flex-col justify-end w-full">
      <div className="flex justify-between items-center gap-8 p-2 border-b w-full font-medium">
        {t("general.authorizedCompanies")}
        <div className="">
          <CustomButton
            type="text"
            ghost
            className="hover:!bg-transparent m-0 p-0 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Close config={{ width: 16, height: 16 }} />
          </CustomButton>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-gray-gray05 px-2 py-3 w-56 max-h-52 overflow-x-hidden overflow-y-auto">
        {detailDrop?.map((item, index) => (
          <div key={index} className="flex gap-2">
            {item.icon}
            <div className="flex items-center w-full overflow-hidden font-normal text-2xs text-gray-gray9 text-ellipsis whitespace-nowrap">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end items-center px-2 py-3 border-t w-full">
        <CustomButton
          type="text"
          ghost
          onClick={() => {
            submitHandler();
          }}
          className="bg-main-black hover:bg-main-white hover:border-main-black w-fit text-main-white hover:text-main-black"
        >
          اعمال
        </CustomButton>
      </div>
    </div>
  );
};
const InnerCheckBox = ({ onChange, checked, id, label }) => {
  const [tick, setTick] = useState(checked);

  const handleChange = (e) => {
    const temp = {
      checked: e.target.checked,
      id,
      label,
    };
    setTick(e.target.checked);
    onChange(temp);
  };

  return <CustomCheckbox onChange={handleChange} checked={tick} />;
};
