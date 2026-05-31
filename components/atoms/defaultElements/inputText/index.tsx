import {
  ChangeEvent,
  useEffect,
  useState,
} from 'react';

import { Input } from 'antd';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';

import type { IProps } from './type';

const InputText = ({ onChange, config, className, ...rest }: IProps) => {
  const dispatch = useDispatch();

  const { initElement } = useAppSelector((state) => {
    const initElement = config
      ? state.withPersist.pages
          .find((item) => item.isActive)
          ?.pageData?.find((element) => element.name === config.name)?.value
      : null;
    return { initElement };
  }, shallowEqual);

  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
    }
  }, [initElement, config]);
  const [inputValue, setInputValue] = useState(initElement);

  const defaultClass = `h-[42px] lg:!h-[2.125rem] text-sm !bg-gray-gray3 dark:!bg-gray-gray11 rounded w-full ${className} !border-none `;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (config) {
      const {
        caption,
        help,
        name,
        order,
        placeHolder,
        rules,
        type,
        selectEndpoint,
      } = config;
      dispatch(
        setPageData({
          caption,
          help,
          name,
          order,
          placeHolder,
          rules,
          type,
          selectEndpoint,
          value,
        })
      );
    }
    onChange?.(e);
  };
  useEffect(() => {
    if (initElement !== inputValue) {
      setInputValue(initElement);
    }
  }, [initElement]);
  return (
    <>
      {config ? (
        <Input
          {...rest}
          type={rest?.type ? rest?.type : config?.mode ? config?.mode : "text"}
          minLength={rest?.minLength ? rest?.minLength : config?.minLength}
          maxLength={rest?.maxLength ? rest?.maxLength : config?.maxLength}
          value={inputValue}
          className={defaultClass}
          onChange={handleChange}
          placeholder={config?.placeHolder}
        />
      ) : (
        <Input
          {...rest}
          type={rest?.type ? rest?.type : config?.mode ? config?.mode : "text"}
          minLength={rest?.minLength ? rest?.minLength : config?.minLength}
          maxLength={rest?.maxLength ? rest?.maxLength : config?.maxLength}
          className={defaultClass}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default InputText;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { ChangeEvent, useEffect, useState } from "react";
// import { Input } from "antd";
//     />
//   );
// };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import { ChangeEvent, useEffect, useState } from "react";
// import { Input } from "antd";
// import { useDispatch } from "react-redux";
// import { useAppSelector } from '@hooks/custom/useAppSelector';

// import { setPageData } from "@slice/pages";
// import type { IProps } from "./type";
// import { CustomButton } from "../button";
// import { TranslationIcon } from "@components/atoms/iconComponents";
// import { CustomModal } from "../modal";
// import { useTranslations } from "next-intl";
// import { getCookie } from "@utils/core";

// const InputText = ({ onChange, config, className, ...rest }: IProps) => {
//   const langId = Number(getCookie("LanguageId").split("/")[0]);
//   const dispatch = useDispatch();
//   const initElement = useAppSelector((state) => {
//     if (config) {
//       const { name } = config;
//       const myElement = state.withPersist.pages
//         .find((item) => item.isActive)
//         ?.pageData?.find((element) => element.name === name);
//       return myElement?.value ?? [];
//     }
//     return null;
//   });
//   const [inputValue, setInputValue] = useState(initElement);
//   const defaultClass = ` h-[2.125rem] !bg-gray-gray3 rounded w-full ${className} !border-none `;
//   const initConfig = {
//     name: config?.name,
//     value: [
//       {
//         langId: 10000006,
//         value: "23",
//       },
//       {
//         langId: 10,
//         value: "23",
//       },
//       {
//         langId: 11,
//         value: "23",
//       },
//     ],
//   };
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setInputValue(value);
//     if (config) {
//       const {
//         caption,
//         help,
//         name,
//         order,
//         placeHolder,
//         rules,
//         type,
//         selectEndpoint,
//       } = config;
//       let newValue = [{ langId: 12, value: value }];
//       if (initElement) {
//         const myValue = initElement.find((item) => item.langId == langId);
//         if (myValue) {
//           newValue = initElement.map((item) =>
//             item.langId == langId ? { langId: langId, value: value } : item
//           );
//         } else {
//           newValue = [...initElement, { langId: langId, value: value }];
//         }
//       }
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
//           value: newValue,
//         })
//       );
//     }
//     onChange?.(e);
//   };
//   // useEffect(() => {
//   //   setInputValue(initElement?.find((item) => item.langId == langId)?.value);
//   //   if (config) {
//   //     const { setFieldValue } = config;
//   //     if (initElement && initElement.length > 0) {
//   //       if (setFieldValue) {
//   //         setFieldValue(
//   //           name,
//   //           initElement?.find((item) => item.langId == langId)?.value
//   //         );
//   //       }
//   //     }
//   //   }
//   // }, [initElement]);
//   return (
//     <>
//       {config ? (
//         <div className="relative">
//           <Input
//             {...rest}
//             value={inputValue}
//             className={defaultClass}
//             onChange={handleChange}
//             placeholder={config?.placeHolder}
//           />
//           <div className="top-[2px] left-0 absolute">
//             <LangModal initConfig={initConfig} />
//           </div>
//         </div>
//       ) : (
//         <Input {...rest} className={defaultClass} onChange={handleChange} />
//       )}
//     </>
//   );
// };

// export default InputText;
// const LangModal = ({ ...props }) => {
//   const { initConfig } = props;
//   const [openModal, setOpenModal] = useState(false);
//   const closeModal = () => {
//     setOpenModal(false);
//   };
//   const handleLangModal = () => {
//     setOpenModal(true);
//   };
//   return (
//     <>
//       <CustomButton className="p-0 px-1" type="text" onClick={handleLangModal}>
//         <TranslationIcon />
//       </CustomButton>
//       <CustomModal
//         contentClassName="!min-w-[564px] "
//         closeModal={closeModal}
//         isModalOpen={openModal}
//         title={<Title />}
//         content={
//           <Content handleSubmitForm={closeModal} initConfig={initConfig} />
//         }
//       />
//     </>
//   );
// };
// const Title = () => {
//   const t = useTranslations();
//   return (
//     <div>
//       <div>{t("general.Languages")}</div>
//       <div className="text-gray-gray85 text-xs">
//         {t("general.chooseLanguage")}
//       </div>
//     </div>
//   );
// };
// const Content = ({ ...props }) => {
//   const { handleSubmitForm, initConfig } = props;
//   const langId = Number(getCookie("LanguageId").split("/")[0]);
//   const fields = initConfig.value.filter((item) => item.langId !== langId);
//   const t = useTranslations();
//   return (
//     <div className="flex flex-col items-end gap-3 p-3 w-full">
//       {fields.map((item, index) => (
//         <div key={index} className="w-full">
//           <label htmlFor="">{item.langId}</label>
//           <InnerInput config={item} name={initConfig.name} />
//         </div>
//       ))}

//       <CustomButton
//         type="text"
//         className="bg-main-black hover:border-main-black w-fit text-main-white"
//         onClick={handleSubmitForm}
//       >
//         {t("general.close")}
//       </CustomButton>
//     </div>
//   );
// };

// const InnerInput = ({ ...props }) => {
//   const { name, className, config } = props;
//   const dispatch = useDispatch();
//   const initElement = useAppSelector((state) => {
//     const myElement = state.withPersist.pages
//       .find((item) => item.isActive)
//       ?.pageData?.find((element) => element.name === name);
//     return myElement ?? null;
//   });
//   const [inputValue, setInputValue] = useState(null);

//   const defaultClass = ` h-[2.125rem] !bg-gray-gray3 rounded w-full ${className} !border-none `;

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setInputValue(value);
//     let newValue = [{ langId: config.langId, value: value }];
//     if (initElement) {
//       const myValues = initElement.value;
//       if (myValues) {
//         const existingItem = myValues.find(
//           (element) => element.langId === config.langId
//         );
//         if (existingItem) {
//           newValue = myValues.map((element) =>
//             element.langId === config.langId
//               ? { langId: config.langId, value: value }
//               : element
//           );
//         } else {
//           newValue = [...myValues, { langId: config.langId, value: value }];
//         }
//       }
//     }
//     dispatch(
//       setPageData({
//         ...initElement,
//         value: newValue,
//       })
//     );
//   };
//   useEffect(() => {
//     if (initElement && initElement.value && initElement.value.length > 0) {
//       const myValue =
//         initElement.value.find((item) => item.langId == config.langId)?.value ??
//         "";
//       setInputValue(myValue);
//     }
//   }, [initElement]);
//   return (
//     <Input
//       {...props}
//       value={inputValue}
//       className={defaultClass}
//       onChange={handleChange}
//     />
//   );
// };
//       {...props}
//       value={inputValue}
//       className={defaultClass}
//       onChange={handleChange}
//     />
//   );
// };
