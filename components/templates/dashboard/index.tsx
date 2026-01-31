"use client";
import React from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { EditPencil } from "@components/atoms/iconComponents";
import Title from "@components/atoms/Title";

import DashboardChart from "./dashboardChart";
import DateBox from "./dateBox";
import DocumentCard from "./documentCard";
import InvoiceCard from "./invoiceCard";
import Notifications from "./notifications";
import QuickAccess from "./quickAccess";
import RangeTime from "./rangeTime";
import Reminders from "./reminder";
import Reports from "./reports";

function Dashboard() {
  return (
    <>
      <Title caption={"title.dashboard"} />
      <div className="relative w-full h-full">
        <div className="hidden-show-scrollBar flex flex-col gap-4 w-full h-full overflow-y-auto">
          {/* گزارش */}
          <div className="flex lg:flex-row flex-col gap-7">
            <div className="p-4 border rounded-xxl w-full h-14">
              <DateBox />
            </div>
            <div className="p-4 border rounded-xxl w-full h-32 lg:h-14">
              <RangeTime />
            </div>
          </div>
          {/* نمودار و کارتها */}
          <div className="flex lg:flex-row flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-xxl !h-full">
              <div className="shadow-md p-4 rounded-xxl lg:w-52 !h-[120px] lg:!h-[173px]">
                {
                  <DocumentCard
                    percentage={20}
                    today={4}
                    total={4554}
                    key={59}
                  />
                }
              </div>
              <div className="shadow-md p-4 rounded-xxl lg:w-52 !h-[120px] lg:!h-[173px]">
                <InvoiceCard percentage={-20} total={100} key={1} today={5} />
              </div>
            </div>
            <div className="p-4 border rounded-xxl w-full !h-[365px]">
              <DashboardChart />
            </div>
          </div>
          {/*یاد آوری گزارشات اطلاعیه  */}
          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            <div className="lg:flex-1 shadow-sm p-4 border rounded-xxl w-full !h-64 overflow-y-hidden">
              <Reminders />
            </div>
            <div className="hidden lg:flex lg:flex-1 shadow-sm p-4 border rounded-xxl w-full !h-64 overflow-y-hidden">
              <Reports />
            </div>
            <div className="lg:flex-[1.02] shadow-sm border rounded-xxl w-full !h-64 overflow-y-hidden">
              <Notifications />
            </div>
          </div>
          <div className="mb-4 lg:mb-0 p-4 border rounded-xxl w-full !h-[130px] lg:!h-[150px]">
            <QuickAccess />
          </div>
          <div className="flex justify-end w-full">
            <CustomButton className="bg-gray-gray4 border-none w-20 h-9">
              <div className="flex gap-1">
                <EditPencil config={{ width: 15, height: 15 }} />
                <span className="font-normal text-gray-gray9 text-xs">
                  ویرایش
                </span>
              </div>
            </CustomButton>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
