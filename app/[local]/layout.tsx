import { ReactNode } from 'react';

import { getMessages } from 'next-intl/server';

// import { headers } from "next/headers";
import BaseLayout from '@layout/baseLayout/layout';
import type { TLang } from '@slice/config/type';

interface IProps {
  children: ReactNode;
  params: Promise<{
    local: TLang;
  }>;
}

export default async function BodyLayout({ children, params }: IProps) {
  const { local } = await params;

  // const headersList = headers();
  // const userAgent = headersList.get("user-agent");
  // const deviceType = userAgent?.match(
  //   /Mobile|Android|iPhone|iPad|iPod|Opera Mini|BlackBerry|IEMobile/
  // )
  //   ? "mobile"
  //   : "desktop";
  const messages = await getMessages();

  return (
    <BaseLayout local={local} messages={messages}>
      {children}
    </BaseLayout>
  );
}
