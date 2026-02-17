<!-- services -->

## سرویس ها `.\services`

یکی از دو قسمت اصلی حافظه میباشد که کار مدیریت درخواستها را بر عهده دارد.

از کتابخانه ی `RTK QUERY` بابت مدیریت درخواستها استفاده شده .
در صفحه ی `index.tsx` تمامی درخواستها ادغام میشود .
و به عنوان خروجی اصلی سرویس ها به `store` ارسال میشود .

## مدیریت درخواست های احراز شده و احراز نشده

برای کتابخانه ی `RTK Query` متدی برای آدرس پیشفرض درخواست وجود دارد به نام `fetchBaseQuery `.
که ما برای درخواست های بدون توکن و با توکن دو متغیر مینویسیم و به یکی از آنها مقدار توکن رو پاس میدهیم به شکل زیر .`services\customBaseQuery.ts`

```
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { AppInfo } from '../public/AppSetting.json';
import { getCookie } from "@utils/core";
 const token =''// getCookie("autt").val
export const baseQuery = fetchBaseQuery({ baseUrl: AppInfo.AppSetting.ApiUrl, })  //این مقدار از داخل پوشه public قرار میگیرد
export const baseQueryByToken = fetchBaseQuery({ baseUrl: AppInfo.AppSetting.ApiUrl,
  headers: { 'authorization': `Bearer ${token}` }})
```

برای به دست آوردن لینک سرور میتوان از فایل جیسون موجود در `AppSetting`استفاده کرد.`\public\AppSetting.json`

از این پس برای سرویسهایی که نیاز به توکن دارند از مقدار `baseQueryByToken` استفاده میکنیم .

## ساختار `RTK QUERY` و بدنه ی سرویس `services\Auth\index.ts`

برای مدیریت درخواستها به شکل زیر عمل میکنیم
برای درخواستهای بدون توکن از `baseQuery` استفاده میکنیم

```
export const comAuth = createApi({
  reducerPath: "comAuth",       //نامی که در فایل جمع آوری درخواستها برای middleware استفاده میشود
  baseQuery: baseQuery,       //این مقدار برای درخواستهای بدون توکن قرار میگیرد
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginRequest>({ //ایجاد هوک useLoginMutation
      query: (params) => {  //پارامتر هایی که برای لاگین کردن نیاز است بدینصورت از هوک گرفته میشود
        return {
          url: "/api/auth/login",   //در این قسمت آدرس ریشه ی لاگین رو اضافه میکنیم
          body: { ...params },      //در این قسمت مقادیر مورد نیاز برای لاگین را در بدنه ی درخواست قرار میدهیم
          headers: { "Content-Type": "application/json" },
          method: "POST" // در این قسمت متد درخواست رو مشخص میکنیم
        }
      }
    }),
  })
});
```

برای درخواستهای با توکن از `baseQueryByToken` استفاده میکنیم .`\services\Auth\index.ts`

```
export const ComAuthToken = createApi({
  reducerPath: "ComAuthToken",
  baseQuery: baseQueryByToken,  //در این قسمت به همراه درخواستهامون توکن اضافه میکنیم
  endpoints: (builder) => ({
    getRole: builder.query<IBaseGetReturn<IRoleDto[]>, IBaseGet>({
      query: (params) => {
        return {
          url: "/api/auth/select/role",
          body: { ...params },
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      }
    })
  })
});

export const { useGetRoleQuery} = ComAuthToken; // {hook}=middleware
export const { useLoginMutation } = comAuth;

```

و در نهایت از این دو سرویس ساخته شده دو هوک و دو middleware به شکل زیر استخراج میگردد

هوک ها برای درخواست دادن به کار میروند .

از middleware ها برای ذخیره سازی مقادیر برگشتی استفاده میگردد.

و به شکل زیر به مجموعه ی دیگر سرویسها متصل میگردد.`\services\index.tsx`

```
const ServiceRootReducer = () => {

   return {
       serviceReducer: {
           [comAuth.reducerPath]: comAuth.reducer, // هوک
           [ComAuthToken.reducerPath]: ComAuthToken.reducer,
       },
       serviceMiddleware: [ // در این قسمت برای caching, invalidation, polling استفاده میشود
           comAuth.middleware,//middleware
           ComAuthToken.middleware,
           rtkQueryErrorLogger
       ]

   }
}

export default ServiceRootReducer;
```

و به شکل زیر به بدنه ی حافظه متصل میگردد.`\store\index.tsx`

```
import { configureStore } from '@reduxjs/toolkit';
import ServiceRootReducer from "@services/index";   //در این قسمت اضافه میشود
import SliceRootReducer from "@slice/index";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
const { serviceMiddleware, serviceReducer } = ServiceRootReducer() //در این قسمت خروجی های آن فایل از یکدیگر جدا میشوند
const AppReduxStore = configureStore({
    reducer: {
        ...serviceReducer, //در این قسمت خود سرویس اضافه میشود
          ...SliceRootReducer(),
         },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
    .concat(serviceMiddleware)//در این قسمت middleware اضافه میشود
});


export default AppReduxStore;
```

و توسط یک provider به عنوان حافظه ی اصلی به کار برده میشود .`\store\Provider\index.tsx`

```
import AppReduxStore from '@store/index'
import { Provider } from 'react-redux';

const ReduxProvider = (props: any) => {

    return (
        <Provider store={AppReduxStore}>{props.children}</Provider>
    );
}

export default ReduxProvider;
```

و در نهایت در یک لایه سطح بالا به بدنه ی پروژه وصل میشود`\layout\mainLayout\desktopSizeLayout\index.tsx` .

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
        <ReduxProvider > //در این قسمت به پروژه اضافه شده
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

و در این مثال شما نحوه ی استفاده از این هوک را میبینید.`components\templates\Login\index.tsx`

```
"use client"
import Btn from '@components/atoms/defaultElements/BTN';
import { usePathname, useRouter } from 'next/navigation';
import { useLoginMutation } from '@services/Auth';
import { createCookie, getElementValue} from '@utils/core';
import INPUT from '@components/atoms/defaultElements/INPUT';
import type { Type } from '@components/atoms/defaultElements/type';

const Login = () => {
    const pathname = usePathname()
    const {push}=useRouter()
    const [login,{data,status,isSuccess,isLoading,reset}] = useLoginMutation()  //در این قسمت هوک صدا زده شده
  if(data?.access_token){
    createCookie("autt",data.access_token,6) //در این قسمت توکن ساخته شده
    reset()
    push(`${pathname}/desktop`) //پس از لاگین با ساخت توکن به صفحه ی بعدی هدایت میشود
  }

const loginSubmit = async () => {
        const password=getElementValue({pageId,name:"txt_password",type:Type.Text}) //مقادیر ورودی از داخل ریداکس خوانده میشوند
        const username=getElementValue({pageId,name:"txt_username",type:Type.Text}) // در قسمت اسلایس منطق این خط آورده شده
     login({ Grant_Type: "password", Password:password , UserName: username, Refresh_Token: "" })
     // تابع درخواست لاگین از داخل هوک اینجا صدا زده میشود و مقادیر لازم پاس داده میشود
}
  return (
      <INPUT config={{pageId,name:"txt_username",caption:"نام کاربری",type:Type.Text}}/> //کامپوننت های شخصی سازی شده
      <INPUT  mode='Password' config={{pageId,name:"txt_password",caption:"رمز عبور",type:Type.Text}}/>
      <Btn loading={isLoading} onClick={loginSubmit}>ورود</Btn>
  )
}

export default Login;
```

### مدیریت ارور ها در پاسخ سرور `.services\rtkQueryErrorLogger.ts`

همگی بصورت اعلان باید نمایش داده شوند و مدیریت آن توسط یک middleware از درون خود ریداکس کوئری رخ میدهد.
که این middleware نیز بصورت جداگانه به `store` ارسال میشود.

این رفتار توسط فایل `rtkQueryErrorLogger`مدیریت میشود.
بدین صورت که متدی داخل ریداکس وجود دارد به نام `isRejectedWithValue` که دور درخواست پیچیده میشود به شکل زیر و در صورت پاسخ ارور یک فعالیتی را انجام میدهد.

```
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action.payload.status !== 401) {
        //اینجا باید یه بار رفرش توکن با سرویس لاگین صدا زده بشه و پارامتر رفرش توکن فرستاده بشه
        //بعد اگه دوباره به همین ارور خورد پاپ اپ لاگین یا هدات شود به لندگینگ یا لاگین ...
    showToast({message:"The HTTP status code 401, often denoted as UNAUTHORIZED , signifies that the client lacks proper authentication credentials or has provided invalid credentials. In simpler terms, the server has failed to identify the user"})
    }
  }
  return next(action);
};

```

همچنین در قسمت middleware به store اضافه میگردد.`services\index.tsx`

```
const ServiceRootReducer = () => {
    return {
        serviceReducer: {
            [comAuth.reducerPath]: comAuth.reducer,
            [ComAuthToken.reducerPath]: ComAuthToken.reducer,
        },
        serviceMiddleware: [
            comAuth.middleware,
            ComAuthToken.middleware,
            rtkQueryErrorLogger          //در این قسمت به درخواستهای ما اضافه میگردد
        ]

    }

}

export default ServiceRootReducer;

```
