import { useRouter } from "next/navigation";

import { CustomBadge, CustomButton } from "@components/atoms/defaultElements";
import { ArianLogo, Bell, House } from "@components/atoms/iconComponents";

export default function MobileHeader() {
  const route = useRouter();

  return (
    <div className="top-0 z-10 sticky flex justify-between items-center bg-main-white mx-4 my-3 py-1 w-[calc(100%-32px)] h-9">
      <div className="flex items-center">
        <div className="w-10 h-6">
          <ArianLogo />
        </div>
        <div className="">آرین سیستم</div>
      </div>
      <div>
        <div className="flex justify-around items-center w-[64px]">
          <CustomButton
            shape="circle"
            type="text"
            className=""
            onClick={() => {
              route.replace("/");
            }}
          >
            <House
              config={{
                width: 28,
                height: 26,
              }}
            />
          </CustomButton>
          <CustomButton shape="circle" type="text" className="relative">
            <CustomBadge
              count={2}
              size="small"
              className={`top-0 rtl:right-0 left-0
              absolute`}
            />
            <Bell
              config={{
                width: 28,
                height: 28,
              }}
            />
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
