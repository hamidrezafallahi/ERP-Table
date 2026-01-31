import { useState } from 'react';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  ReportIcon,
  ReportMakerIcon,
} from '@components/atoms/iconComponents';

interface Reports {
  id: number;
  text: string;
}

const reportsData: Reports[] = [
  { id: 1, text: "فاکتور فروش" },
  { id: 2, text: "گزارش شماره دو" },
  { id: 3, text: "گزارش شماره سه" },
  { id: 4, text: "گزارش شماره چهار" },
];

export default function Reports() {
  const [reports, setReports] = useState<Reports[]>(reportsData);

  return (
    <div className="relative w-full max-w-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-800">
          <ReportIcon config={{ width: 20, height: 20 }} />
          گزارشات نشان شده
        </h2>
      </div>

      <div className="hidden-show-scrollBar flex flex-col gap-3 max-h-72 overflow-y-auto">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="flex items-start gap-3 bg-gray-gray05 shadow-md p-3 rounded-xl"
            >
              <button className="text-gray-400 hover:text-gray-600"></button>

              <div className="flex-1">
                <p className="mb-1 text-gray-700 text-sm">{report.text}</p>
                <span className="font-medium text-blue-blue4 text-sm">
                  محل نمایش
                </span>
              </div>
              <div className="flex items-center h-full">
                <CustomButton className="font-normal text-2xs text-gray-gray10">
                  نمایش
                </CustomButton>
              </div>
            </div>
          ))
        ) : (
          <div className="z-10 absolute inset-0 flex flex-wrap backdrop-blur-sm pt-10 w-full h-full">
            <div className="flex flex-wrap justify-center gap-y-3 w-full">
              <ReportMakerIcon />
              <p className="flex justify-center w-full font-bold text-gray-gray10 text-sm">
                گزارش‌های عمیق را از داده‌هایتان استخراج کنید!
              </p>
            </div>
            <div className="flex flex-wrap w-full font-medium text-gray-gray8 text-xs leading-5">
              <p className="flex justify-center w-full">
                با گزارش‌ساز، گزارش‌ها فقط اعداد و جداول نیستند؛
              </p>
              <p className="flex justify-center w-full">
                شروعی برای روایت‌های مؤثر و حرفه‌ای‌اند.{" "}
              </p>
            </div>
            <div className="flex justify-center w-full">
              <a
                href=""
                className="font-medium text-blue-blue4 text-xs underline"
              >
                ورود به گزارش ساز
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
