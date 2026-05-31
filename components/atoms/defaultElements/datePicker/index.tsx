// "use client";

// import "./style.css";

// import React, { useEffect, useState } from "react";

// import { Button, ConfigProvider } from "antd";
// import {
//   DatePicker as DatePickerJalali,
//   JalaliLocaleListener,
// } from "antd-jalali";
// import en_US from "antd/lib/locale/en_US";
// import fa_IR from "antd/lib/locale/fa_IR";
// import dayjs from "dayjs";
// // import jalaliday from 'jalaliday';
// // import jalaliday from "jalali-plugin-dayjs";
// import { useDispatch } from "react-redux";

// import { RightChevron } from "@components/atoms/iconComponents";
// import Calendar from "react-persian-range-picker";
// import { useAppSelector } from '@hooks/custom/useAppSelector';

// import { setPageData } from "@slice/pages";
// import { PageStateEnum } from "@slice/pages/enum";

// import { CustomModal } from "../modal";
// import type { IProps } from "./type";

// // dayjs.extend(jalaliday);

// export const CustomDatePicker = ({
//   config,
//   primaryColor,
//   accentColor,
//   highlightColor,
//   secondaryColor,
//   tertiaryColor,
//   ...rest
// }: IProps) => {
//   const dispatch = useDispatch();
//   const locale = useAppSelector((state) => state.withPersist.config.lang);
//   const activePage = useAppSelector((state) =>
//     state.withPersist.pages.find((item) => item.isActive)
//   );

//   const [isModal, setIsModal] = useState(false);

//   const [selectedDate, setSelectedDate] = useState(
//     rest.defaultValue ? rest.defaultValue : dayjs()
//   );

//   useEffect(() => {
//     if (config) {
//       const {
//         caption,
//         help,
//         name,
//         order,
//         placeHolder,
//         rules,
//         type,
//         setFieldValue,
//         form,
//         selectEndpoint,
//       } = config;
//       const myElement = activePage?.pageData?.find(
//         (element) => element.name === name
//       );

//       if (myElement && myElement.value) {
//         // newValue = dayjs(myElement.value);
//         setSelectedDate(dayjs(myElement.value));
//         if (form) {
//           form.setFieldValue(name, dayjs(myElement.value).toISOString());
//         }
//         if (setFieldValue) {
//           setFieldValue(name, dayjs(myElement.value).toISOString());
//         }
//         // Set to existing value if available
//       }
//       if (
//         activePage?.pageState === PageStateEnum.Opened &&
//         !activePage?.url.includes("id")
//       ) {
//         dispatch(
//           setPageData({
//             caption,
//             help,
//             name,
//             order,
//             placeHolder,
//             rules,
//             type,
//             selectEndpoint,
//             value: dayjs().toISOString(),
//           })
//         );
//         if (form) {
//           form.setFieldValue(name, dayjs().toISOString());
//         }
//         if (setFieldValue) {
//           setFieldValue(name, dayjs().toISOString());
//         }
//       }
//     }
//   }, [activePage]);

//   const handleChange = (date: dayjs.Dayjs, dateString: string) => {
//     const h = new Date().getHours();
//     const m = new Date().getMinutes();
//     const s = new Date().getSeconds();
//     const TDate = date?.hour(h)?.minute(m)?.second(s);

//     const value = TDate?.toISOString();
//     setSelectedDate(TDate);
//     if (config && value) {
//       const {
//         caption,
//         help,
//         name,
//         order,
//         placeHolder,
//         rules,
//         type,
//         setFieldValue,
//         form,
//         selectEndpoint,
//       } = config;
//       dispatch(
//         setPageData({
//           caption,
//           help,
//           name,
//           order,
//           placeHolder,
//           rules,
//           type,
//           selectEndpoint,
//           value,
//         })
//       );

//       if (form) {
//         form.setFieldValue(name, value);
//       }
//       if (setFieldValue) {
//         setFieldValue(name, value);
//       }
//     }
//     rest.onChange?.(TDate, dateString);
//   };

//   const defaultClassName = `${
//     match ? "h-[2.125rem]" : "h-[42px] text-sm"
//   } !bg-gray-gray3 rounded w-full !border-none `;

//   return (
//     <ConfigProvider
//       locale={locale === "fa" ? fa_IR : en_US}
//       direction={locale === "fa" ? "rtl" : "ltr"}
//     >
//       <JalaliLocaleListener />

//       {/* <DatePicker lang="fa" /> */}

//       {config ? (
//         match ? (
//           <DatePickerJalali
//             {...rest}
//             className={rest.className ? rest.className : defaultClassName}
//             direction={locale === "fa" ? "rtl" : "ltr"}
//             value={selectedDate}
//             onChange={handleChange}
//             format={{
//               format: "YYYY/MM/DD",
//               type: "mask",
//             }}
//           />
//         ) : (
//           <DatePickerJalali
//             {...rest}
//             className={rest.className ? rest.className : defaultClassName}
//             panelRender={(originPanel) => {
//               null;
//             }}
//             onClick={() => setIsModal(true)}
//             direction={locale === "fa" ? "rtl" : "ltr"}
//             value={selectedDate}
//             onChange={handleChange}
//             format={{
//               format: "YYYY/MM/DD",
//               type: "mask",
//             }}
//           />
//         )
//       ) : match ? (
//         <DatePickerJalali
//           {...rest}
//           className={rest.className ? rest.className : defaultClassName}
//           direction={locale === "fa" ? "rtl" : "ltr"}
//           defaultValue={selectedDate}
//           onChange={handleChange}
//           renderPanel={() => null}
//           format={{
//             format: "YYYY/MM/DD",
//             type: "mask",
//           }}
//         />
//       ) : (
//         <DatePickerJalali
//           {...rest}
//           className={rest.className ? rest.className : defaultClassName}
//           direction={locale === "fa" ? "rtl" : "ltr"}
//           value={selectedDate} // Set the default value here
//           onChange={handleChange}
//           panelRender={(originPanel) => {
//             null;
//           }}
//           onClick={() => setIsModal(true)}
//           format={{
//             format: "YYYY/MM/DD",
//             type: "mask",
//           }}
//         />
//       )}

//       {isModal && (
//         <CustomModal
//           centered
//           closeModal={() => setIsModal(false)}
//           isModalOpen={isModal}
//           content={
//             <div className="flex flex-col justify-between h-[90%]">
//               {/* <Calendar
//                 className="customCalendar"
//                 value={selectedDate}
//                 onChange={(date) => setSelectedDate(date)}
//               /> */}
//               <div className="top-0 right-0 bottom-0 left-0 z-[2000] fixed flex flex-col bg-white p-6">
//                 <Button
//                   className="flex justify-center items-center shadow-primaryShadow rounded-[0.625rem] w-8 h-8"
//                   icon={<RightChevron config={{ stroke: "#aaa" }} />}
//                   onClick={() => setIsModal(false)}
//                 />
//                 <Calendar
//                   onChange={(startDate, endDate) => {
//                     const val = new Date(startDate).toISOString();
//                     handleChange(dayjs(val), null);
//                     setIsModal(false);
//                   }}
//                   disablePreviousDays={false}
//                   startDate={selectedDate.valueOf()}
//                   endDate={null}
//                   containerClassName="mt-14"
//                   locale="fa"
//                   model="date"
//                   calenderClassName="!bg-red-500"
//                   primaryColor={primaryColor}
//                   accentColor={accentColor}
//                   backgroundColor={highlightColor}
//                   highlightColor={highlightColor}
//                   secondaryColor={secondaryColor}
//                   tertiaryColor={tertiaryColor}
//                 />
//               </div>
//             </div>
//           }
//         />
//       )}
//     </ConfigProvider>
//   );
// };
