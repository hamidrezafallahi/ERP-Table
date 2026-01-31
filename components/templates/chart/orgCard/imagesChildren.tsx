import React from "react";

import { Modal } from "antd";

import { CloseSm } from "@components/atoms/iconComponents";

import { ImageLoader } from "./";

// import { IProps } from "./type";

function ImagesChildren({
  data,
  setOpenModalImagesItem,
  openModalImagesItem,
}: any) {
  const { id, name, images } = data;
  return (
    <div>
      <Modal
        closable={false}
        open={openModalImagesItem}
        onCancel={() => setOpenModalImagesItem(false)}
        afterClose={() => setOpenModalImagesItem(false)}
        footer={[]}
      >
        <div className="flex flex-col !w-[712px]">
          <div className="flex justify-between items-center p-4 w-full">
            <p className="font-medium text-black-black5 text-base leading-6">
              تصاویر پروفایل
            </p>
            <div
              className="cursor-pointer"
              onClick={() => setOpenModalImagesItem(false)}
            >
              <CloseSm config={{ width: 14, height: 14 }} />
            </div>
          </div>
          <div className="border-gray-gray4 border-b w-full"></div>
          <div className="gap-8 grid grid-cols-2 p-4 max-h-72 overflow-y-scroll">
            {images?.map((img, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-gray-gray4 rounded-full">
                  <ImageLoader item={img} width={100} height={100} />
                </div>
                {name}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ImagesChildren;
