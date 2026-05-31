"use client";

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Login from '@components/templates/login';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { getCookie } from '@utils/cookie';

export default function Home() {
  const local = useAppSelector((state) => state.withPersist.config.lang);
  const route = useRouter();
  const token = getCookie("_auth");

  useEffect(() => {
    if (token) {
      route.replace(`/${local}/dashboard`);
    }
  }, []);
  return (
    <main>
      <div className="flex justify-center items-center lg:bg-gray-gray3 lg:dark:bg-gray-gray10 w-full min-h-screen">
        {/* <Scanner /> */}
        {!token && <Login />}
      </div>
    </main>
  );
}
