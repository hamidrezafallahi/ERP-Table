import Link from 'next/link';

export default function ServerError() {
  return (
    <div className="flex flex-col justify-center items-center gap-7 bg-gradient-to-t from-gray-gray7 to-gray-gray05 w-[100dvw] h-[100dvh]">
      <div className="font-BaiJamjuree font-semibold text-[110px] lg:text-[150px]">
        500
      </div>
      <div className="font-Yekan text-gray-gray10 text-base lg:text-2xl">
        خطای سرور داخلی
      </div>
      <div className="font-Arimo font-semibold text-gray-gray10 text-base lg:text-2xl">
        ! Internal server Error
      </div>
      <Link
        href={`/`}
        className="flex justify-center items-center bg-main-black rounded-lg w-56 h-11 text-main-white text-xs lg:text-lg"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
