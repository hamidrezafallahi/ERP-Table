import { Close, New } from "../iconComponents";
import type { IProps } from "./type";

export default function OpenPages({ pageData }: IProps) {
  return (
    <>
      <div className="flex justify-between items-center py-[14px] w-full h-5">
        <div className="flex items-center w-5 h-5">
          <Close config={{ width: 10, height: 10 }} />
        </div>
        <div className="flex justify-self-start items-center w-full h-5">
          <span className="">{pageData.caption}</span>
          <span className="inline-flex justify-center items-center bg-[#E8F4E6] ms-1 rounded-sm w-[37px] h-[17px] font-thin text-[#2C8440] text-[6px]">
            ذخیره شده
          </span>
        </div>
        <div className="flex items-center w-7 h-5">
          <New config={{ width: 20, height: 20 }} />
        </div>
      </div>
    </>
  );
}
