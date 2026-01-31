import Link from 'next/link';

export default function ServerNotAvailable() {
  return (
    <div className="flex flex-col justify-center items-center gap-7 bg-gradient-to-t from-gray-gray7 to-gray-gray05 w-[100dvw] h-[100dvh]">
      <div className="font-BaiJamjuree font-semibold text-[80px] lg:text-[80px]">
        Server not available
      </div>
      <div className="font-Yekan text-gray-gray10 text-base lg:text-2xl">
        متاسفم این صفحه در دسترس نیست !
      </div>
      <div className="font-Arimo font-semibold text-gray-gray10 text-base lg:text-2xl">
        Sorry ! this page isn’t available
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
