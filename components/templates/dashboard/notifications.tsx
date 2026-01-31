import { useState } from 'react';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  MoreVertical,
  NotificationIcon,
  NotificationNotFound,
} from '@components/atoms/iconComponents';

interface Notification {
  id: number;
  text: string;
  desc: string;
}

const NotificationsData: Notification[] = [
  {
    id: 1,
    text: "فاکتور فروش",
    desc: "به اطلاع می‌رساند که در راستای بهبود عملکرد و افزایش امنیت سیستم ERP، به‌روزرسانی سراسری در تاریخ سه‌شنبه 1 مهر 1404 از ساعت 22:00 الی 03:00 بامداد انجام خواهد شد. در طول این بازه زمانی، دسترسی به بخش‌های مختلف از جمله صدور فاکتور، مدیریت انبار و ثبت سفارش‌ها به‌طور موقت غیرفعال خواهد بود.",
  },
  {
    id: 2,
    text: "گزارش شماره دو",
    desc: "به اطلاع می‌رساند که در راستای بهبود عملکرد و افزایش امنیت سیستم ERP، به‌روزرسانی سراسری در تاریخ سه‌شنبه 1 مهر 1404 از ساعت 22:00 الی 03:00 بامداد انجام خواهد شد. در طول این بازه زمانی، دسترسی به بخش‌های مختلف از جمله صدور فاکتور، مدیریت انبار و ثبت سفارش‌ها به‌طور موقت غیرفعال خواهد بود.",
  },
  {
    id: 3,
    text: "گزارش شماره سه",
    desc: "به اطلاع می‌رساند که در راستای بهبود عملکرد و افزایش امنیت سیستم ERP، به‌روزرسانی سراسری در تاریخ سه‌شنبه 1 مهر 1404 از ساعت 22:00 الی 03:00 بامداد انجام خواهد شد. در طول این بازه زمانی، دسترسی به بخش‌های مختلف از جمله صدور فاکتور، مدیریت انبار و ثبت سفارش‌ها به‌طور موقت غیرفعال خواهد بود.",
  },
  {
    id: 4,
    text: "گزارش شماره چهار",
    desc: "به اطلاع می‌رساند که در راستای بهبود عملکرد و افزایش امنیت سیستم ERP، به‌روزرسانی سراسری در تاریخ سه‌شنبه 1 مهر 1404 از ساعت 22:00 الی 03:00 بامداد انجام خواهد شد. در طول این بازه زمانی، دسترسی به بخش‌های مختلف از جمله صدور فاکتور، مدیریت انبار و ثبت سفارش‌ها به‌طور موقت غیرفعال خواهد بود.",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(NotificationsData);

  return (
    <div className="relative bg-white p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-800">
          <NotificationIcon />
          اطلاعیه ها
        </h2>
        <CustomButton className="bg-gray-gray95 font-normal text-2xs text-gray-gray1">
          مشاهده همه
        </CustomButton>
      </div>

      <div className="hidden-show-scrollBar flex flex-col gap-3 max-h-72 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 bg-gray-gray05 shadow-md p-3 rounded-xl"
            >
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical />
              </button>

              <div className="flex-1">
                <h3 className="mb-1 font-bold text-blue-blue5 text-sm">
                  {notification.text}
                </h3>
                <p className="mb-2 text-blue-blue3 text-xs leading-5">
                  {notification.desc}
                </p>
              </div>

              <div className="flex items-center h-full">
                <CustomButton className="font-normal text-2xs text-gray-gray10">
                  نمایش
                </CustomButton>
              </div>
            </div>
          ))
        ) : (
          <div className="z-10 absolute inset-0 flex flex-wrap items-center backdrop-blur-sm pt-12 w-full h-full">
            <div className="flex flex-wrap justify-center gap-y-3 w-full">
              <NotificationNotFound />
              <p className="flex justify-center w-full font-bold text-gray-gray10 text-sm">
                در حال حاضر هیچ اطلاعیه ای وجود ندارد !
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
