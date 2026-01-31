import React, { useEffect, useRef, useState } from "react";

import { Input, Modal } from "antd";

import { CustomButton } from "@components/atoms/defaultElements";
import { CloseSm } from "@components/atoms/iconComponents";

import { IUpdateChildrenProps } from "../type";

const UpdateChildren = ({
  data,
  fetchApi,
  setOpenModalUpdateItem,
  openModalUpdateItem,
  refetchChart,
}: IUpdateChildrenProps) => {
  const { id, name } = data;
  const [position, setPosition] = useState(name);
  const inputRef = useRef(null); // Create a ref for the input

  // Focus the input when the modal opens
  useEffect(() => {
    if (openModalUpdateItem && inputRef.current) {
      inputRef.current.focus();
    }
  }, [openModalUpdateItem]);
  const submitUpdateItem = async (name, id) => {
    if (position?.trim().length > 0 && position !== name) {
      const updateResult = await fetchApi({
        url: "/api/hr/update/organizationChart",
        body: {
          OrganizationChartId: id,
          OrganizationChartName: position,
          ChangeFields: ["OrganizationChartName"],
        },
      });

      if (updateResult?.data?.Result === "Success") {
        refetchChart();
      }
      setOpenModalUpdateItem(false);
    }
  };

  const cancelUpdateItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModalUpdateItem(false);
  };
  return (
    <div>
      <Modal
        closable={false}
        open={openModalUpdateItem}
        onCancel={() => {
          setOpenModalUpdateItem(false);
        }}
        footer={[
          <div
            className="flex justify-end items-center gap-4 px-4 py-5 border-gray-gray4 border-t w-full"
            key="1"
          >
            <CustomButton
              type="text"
              className="bg-main-black hover:bg-gray-gray2 p-3 hover:!border_2 hover:!border-main-black !rounded-md text-white hover:!text-main-black"
              onClick={() => {
                submitUpdateItem(name, id);
              }}
            >
              ذخیره
            </CustomButton>
          </div>,
        ]}
      >
        <div className="flex flex-col !w-[712px]">
          <div className="flex flex-col justify-start p-4">
            <div className="flex justify-between items-center w-full">
              <p className="font-medium text-black-black5 text-base leading-6">
                ویرایش
              </p>
              <div className="cursor-pointer" onClick={cancelUpdateItem}>
                <CloseSm
                  config={{
                    width: 14,
                    height: 14,
                  }}
                />
              </div>
            </div>
            <p className="text-gray-gray7 dark:text-white text-xs leading-5">
              اطلاعات چارت سازماتی
            </p>
          </div>

          <div className="!mb-10 border-gray-gray4 border-b w-full"></div>
          <div className="flex flex-col gap-3 p-4">
            <label className="w-full" htmlFor="">
              سمت
            </label>
            <Input
              value={position}
              ref={inputRef}
              size="middle"
              className="!bg-gray-gray3 dark:!bg-gray-gray10 p-4 !border-none focus:!border-none rounded !w-full h-[2.125rem]"
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          <div className="!mt-10 !mb-3 w-full"></div>
        </div>
      </Modal>
    </div>
  );
};

export default UpdateChildren;
