# قالب بندی بر اساس دستگاه

---

اگر شما با موبایل به سایت وارد شوید نیازی به ساید بار ندارید.
همچنین اگر با دسکتاپ وارد سایت شوید نیازی به navigation bar نخواهید داشت.
از این رو برای حذف کامل المانهای غیر ضروری صفحه با توجه به user-agent موجود در header میتوان نوع دستگاه را تشخیص داده و نوع قالب بندی سایت را تغییر دهیم
برای انجام این کار نیاز است در لایه های بالا این مقدار را مطابق کد زیر گرفته و مقایسه کنیم و در صورت وجود یا عدم وجود شرط لایه متناسب با دستگاه را بارگزاری کنیم و از رندر اعضای مخفی شده در DOM جلوگیری به عمل آوریم.
در این پروژه یک پوشه جداگانه از کامپوننتها و صفحات برای اعضای خاص که در موبایل و دسکتاپ متغیر میباشند بوجود آورده و این مساله رو در آن پوشه مدیریت میکنیم . `\app\[local]\layout.tsx`

```

import BaseLayout from "../../layout/baseLayout/layout";
import { headers } from "next/headers";
export default async function BodyLayout({ children, params: { local } }: { children: ReactNode; params: { local: string } }) {
  const headersList = headers()
  const userAgent = headersList.get("user-agent");
  const deviceType = userAgent?.match(/Mobile|Android|iPhone|iPad|iPod|Opera Mini|BlackBerry|IEMobile/) ? 'mobile' : 'desktop';
  return (<html lang={local}>
    <body dir={local === 'fa' || local === undefined ? "rtl" : ""} >
      <BaseLayout  local={local}>
        {children}
      </BaseLayout>
    </body>
  </html>
  );
}
```

و در نهایت در لایه اصلی دو لایه موبایل و دسکتاپ رو از همدیگر جدا میکنیم`\layout\baseLayout\layout.tsx`

```
import { ReactNode } from "react";
import "../../styles/globals.css";
import DesktopSizeLayout from "../mainLayout/desktopSizeLayout";
import MobileSizeLayout from "../mainLayout/mobileSizelayout";
import ReduxProvider from "@redux/Provider";

const BaseLayout = (props: { children: ReactNode,local:string }) => {
    const { children,local } = props
    return (<>
        {
            match ?
                <DesktopSizeLayout local={local}>
                    {children}
                </DesktopSizeLayout>
                :
                <MobileSizeLayout>
                    {children}
                </MobileSizeLayout>
        }
    </>);
}
export default BaseLayout;
```

.که در هر لایه مخصوص المانهایی وجود دارند که تنها در همان لایه رندر میشوند

.همچنین در این لایه تمامی تامین کننده ها رو که مقادیرشان باید در تمام پروژه در دسترس باشد ،اضافه میکنیم

تامین کنندگانی مثل theme ,store ,locale,... `\layout\mainLayout\desktopSizeLayout\index.tsx`

```
'use client'
import LOADING from "@components/atoms/LOADING";
import Theme from "@components/templates/Theme";
import DashboardLayout from "@layout/mainLayout/desktopSizeLayout/dashboardLayout/layout";
import ReduxProvider from "@redux/Provider";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { ReactNode, Suspense } from "react";
const DesktopLayout = (props: { children: ReactNode, local: string }) => {
   const { children, local } = props
   const route = usePathname()
   return (
       <NextIntlClientProvider  locale={local}>
       <ReduxProvider >
           <Theme>

               {
                   route.endsWith(`/${local}`) ? <>{children}</> :
                       <DashboardLayout>
                           <Suspense fallback={<LOADING />}>{children}</Suspense>
                       </DashboardLayout>
               }
           </Theme>
       </ReduxProvider>
       </NextIntlClientProvider>
   );
}
export default DesktopLayout
```
