"use client";
import "react-toastify/dist/ReactToastify.css";

import { NextIntlClientProvider } from "next-intl";

import { ConfigSyncRoot } from "@components/templates/configSyncRoot";
import Providers from "@layout/providers";

import type { IProps } from "./type";

export default function BaseLayout({ children, local, messages }: IProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={local}>
      <Providers local={local}>
        <ConfigSyncRoot />
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
