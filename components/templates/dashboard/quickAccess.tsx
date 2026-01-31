import {
  ArrowUpIcon,
  MoreVertical,
  QuickAccessIcon,
} from '@components/atoms/iconComponents';

export default function QuickAccess() {
  return (
    <div className="flex flex-wrap">
      <h3 className="flex justify-between items-center gap-1 mb-4 w-full font-bold">
        <span className="flex items-center gap-1">
          <QuickAccessIcon />
          دسترسی سریع
        </span>
        <span className="flex">
          <MoreVertical />
        </span>
      </h3>

      {/* دکمه‌ها */}
      <div className="flex flex-wrap sm:flex-nowrap justify-start gap-3 sm:gap-6 w-full font-medium text-gray-gray9 text-xs">
        <button className="flex items-center gap-2 px-3 py-1">
          فرم سند حسابداری
          <ArrowUpIcon />
        </button>
        <button className="flex items-center lg:gap-2 lg:px-3 py-1">
          لیست مشتری
          <ArrowUpIcon />
        </button>
        <button className="flex items-center lg:gap-2 lg:px-3 py-1">
          فاکتور فروش فروشگاهی
          <ArrowUpIcon />
        </button>
        <button className="flex items-center lg:gap-2 lg:px-3 py-1">
          فرم اشخاص شرکت ها
          <ArrowUpIcon />
        </button>
        <button className="hidden lg:flex items-center lg:gap-2 lg:px-3 py-1">
          انبار
          <ArrowUpIcon />
        </button>
        <button className="hidden lg:flex items-center lg:gap-2 lg:px-3 py-1">
          دسته چک
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
