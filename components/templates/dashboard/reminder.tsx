import { useState } from 'react';

import {
  MoreVertical,
  ReminderMakerIcon,
  RemindMeIcon,
  TrashBin,
} from '@components/atoms/iconComponents';

interface Reminder {
  id: number;
  day: string;
  month: string;
  text: string;
  time: string;
}

const remindersData: Reminder[] = [
  {
    id: 1,
    day: "17",
    month: "شهریور",
    text: "اول اشخاص و حساب بانکی رو تعریف کنم بعد برم سراغ بقیه.",
    time: "۰۹:۳۰",
  },
  {
    id: 2,
    day: "19",
    month: "شهریور",
    text: "ثبت فاکتور فروش شرکت مرمز ایرانیان",
    time: "۱۲:۱۵",
  },
  {
    id: 3,
    day: "19",
    month: "شهریور",
    text: "ثبت فاکتور فروش شرکت مرمز ایرانیان",
    time: "۱۲:۱۵",
  },
  {
    id: 4,
    day: "19",
    month: "شهریور",
    text: "ثبت فاکتور فروش شرکت مرمز ایرانیان",
    time: "۱۲:۱۵",
  },
];

export default function Reminders() {
  const [reminders, setReminders] = useState(remindersData);

  const removeAll = () => setReminders([]);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-800">
          <RemindMeIcon config={{ width: 20, height: 20 }} />
          یادآوری ها
        </h2>
        <button
          onClick={removeAll}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm"
        >
          حذف همه
          <TrashBin />
        </button>
      </div>

      <div className="hidden-show-scrollBar flex flex-col gap-3 max-h-72 overflow-y-auto">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-start gap-3 bg-gray-gray05 shadow-md p-3 rounded-xl"
            >
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical />
              </button>

              <div className="flex flex-col justify-center items-center bg-gray-gray05 shadow px-2 py-1 rounded-xl min-w-[60px]">
                <span className="font-bold text-gray-gray10 text-lg">
                  {reminder.day}
                </span>
                <span className="font-normal text-gray-gray9 text-xs">
                  {reminder.month}
                </span>
              </div>

              <div className="flex-1">
                <p className="mb-1 font-medium text-gray-gray8 text-xs">
                  {reminder.text}
                </p>
                <span className="font-medium text-blue-blue4 text-sm">
                  {reminder.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="z-10 absolute inset-0 flex flex-wrap items-center backdrop-blur-sm pt-10 w-full h-full">
            <div className="flex flex-wrap justify-center gap-y-3 w-full">
              <ReminderMakerIcon />
              <p className="flex justify-center w-full font-bold text-gray-gray10 text-sm">
                هیچ کار مهمی را فراموش نکنید!
              </p>
            </div>
            <div className="flex flex-wrap pt-2 w-full font-medium text-gray-gray8 text-xs leading-5">
              <p className="flex justify-center w-full">
                در هر لیستی، مانند لیست فاکتور‌ها، یک مورد را انتخاب
              </p>
              <p className="flex justify-center w-full">
                کنید و از بالای لیست، گزینه سه نقطه (⋮) را بزنید.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
