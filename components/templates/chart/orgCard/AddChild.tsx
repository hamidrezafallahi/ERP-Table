import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Input,
  Modal,
} from 'antd';

import { CustomButton } from '@components/atoms/defaultElements';
import { CloseSm } from '@components/atoms/iconComponents';

// import { IProps } from '../type';

function AddChild({
  fetchApi,
  refetchChart,
  data,
  setOpenModalAddItem,
  openModalAddItem,
}: any) {
  const { id, name } = data;
  const [inputText, setInputText] = useState(null);
  const inputRef = useRef(null); // Create a ref for the input

  // Focus the input when the modal opens
  useEffect(() => {
    if (openModalAddItem && inputRef.current) {
      inputRef.current.focus();
    }
  }, [openModalAddItem]);
  const submitAddChildren = async (name, id) => {
    const addChildResult: any = await fetchApi({
      url: "/api/hr/insert/organizationChart",
      body: {
        OrganizationChartFatherId: id,
        OrganizationChartName: inputText,
        UnitType: true,
        CreateUserId: 0,
        ModifierUserId: 0,
      },
    });
    console.log(addChildResult);
    if (addChildResult?.data?.Result == "Success") {
      refetchChart();
    }
    setInputText("");
    setOpenModalAddItem(false);
  };

  return (
    <>
      <div>
        <Modal
          closable={false}
          onCancel={() => setOpenModalAddItem(false)}
          open={openModalAddItem}
          footer={[
            <div
              className="flex justify-end items-center gap-4 px-4 py-5 border-gray-gray4 border-t w-full"
              key="1"
            >
              <CustomButton
                type="text"
                className="bg-main-black hover:bg-gray-gray2 p-3 hover:!border_2 hover:!border-main-black !rounded-md text-white hover:!text-main-black"
                onClick={() => {
                  submitAddChildren(name, id);
                }}
              >
                انتخاب
              </CustomButton>
            </div>,
          ]}
        >
          <div className="flex flex-col !w-[712px]">
            <div className="flex flex-col justify-start p-4">
              <div className="flex justify-between items-center w-full">
                <p className="font-medium text-black-black5 text-base leading-6">
                  افزودن
                </p>
                <div
                  className="cursor-pointer"
                  onClick={() => setOpenModalAddItem(false)}
                >
                  <CloseSm config={{ width: 14, height: 14 }} />
                </div>
              </div>
              <p className="text-gray-gray7 text-xs leading-5">
                اطلاعات چارت سازماتی
              </p>
            </div>

            <div className="!mb-10 border-gray-gray4 border-b w-full"></div>
            <div className="flex flex-col gap-3 p-4">
              <label className="w-full" htmlFor="">
                سمت
              </label>
              <Input
                value={inputText}
                ref={inputRef}
                className="!bg-gray-gray3 dark:!bg-gray-gray11 p-4 !border-none focus:!border-none rounded !w-full h-[2.125rem]"
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="!mt-10 !mb-3 w-full"></div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default AddChild;
