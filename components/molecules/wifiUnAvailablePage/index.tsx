import Link from 'next/link';

import { WifiUnAvailable } from '@components/atoms/iconComponents';

export default function WifiUnAvailablePage() {
  return (
    <div className="flex flex-col justify-center items-center gap-7 bg-gradient-to-t from-gray-gray7 to-gray-gray05 w-[100dvw] h-[100dvh]">
      <WifiUnAvailable />
      <div className="font-Yekan text-gray-gray10 text-base lg:text-2xl">
        لطفا دسترسی به شبکه را چک کنید .{" "}
      </div>
      <div className="font-Arimo font-semibold text-gray-gray10 text-base lg:text-2xl">
        Please check the Wifi{" "}
      </div>
      <Link
        href={`/`}
        className="flex justify-center items-center bg-main-black rounded-lg w-56 h-11 text-main-white text-xs lg:text-lg"
      >
        تلاش مجدد
      </Link>
    </div>
  );
}
