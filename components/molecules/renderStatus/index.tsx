"use client";

import {
  MouseEvent,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomTooltip } from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import {
  ErrorAddIcon,
  ErrorDeleteIcon,
  ErrorUpdateIcon,
  PendingAddIcon,
  PendingDeleteIcon,
  PendingUpdateIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import {
  ErrorStatusEnum,
  PendingStatusEnum,
} from '@services/base/type';

interface IProps {
  id: number;
  pendingStatusId: number;
  pendingMessage?: string;
  isMobile?: boolean;
}

type StatusType =
  | "pendingAdd"
  | "pendingUpdate"
  | "pendingDelete"
  | "errorAdd"
  | "errorUpdate"
  | "errorDelete";

export default function RenderStatus({
  id,
  pendingStatusId,
  pendingMessage,
  isMobile,
}: IProps) {
  const t = useTranslations();

  const [statusDrawerIsOpen, setStatusDrawerIsOpen] = useState(false);
  const [statusContent, setStatusContent] = useState<{
    status: StatusType;
    message: string;
  } | null>(null);

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const foundStatusItem = activePage?.viewData?.statusItems?.filter(
    (el) => el.id === id
  );
  const statusId =
    foundStatusItem?.length > 0
      ? foundStatusItem?.reverse()?.[0]?.status
      : pendingStatusId;

  const statusMap: Record<number, StatusType> = {
    [PendingStatusEnum.Pending1]: "pendingAdd",
    [PendingStatusEnum.Pending2]: "pendingUpdate",
    [PendingStatusEnum.Pending3]: "pendingDelete",
    [ErrorStatusEnum.Error100]: "errorAdd",
    [ErrorStatusEnum.Error101]: "errorUpdate",
    [ErrorStatusEnum.Error102]: "errorDelete",
  };

  const status = statusMap[statusId];
  if (!status) return null;

  const statusIconMap: Record<StatusType, any> = {
    pendingAdd: <PendingAddIcon />,
    pendingUpdate: <PendingUpdateIcon />,
    pendingDelete: <PendingDeleteIcon />,
    errorAdd: <ErrorAddIcon />,
    errorUpdate: <ErrorUpdateIcon />,
    errorDelete: <ErrorDeleteIcon />,
  };

  const icon = <div>{statusIconMap[status]}</div>;

  const isPending =
    statusId === PendingStatusEnum.Pending1 ||
    statusId === PendingStatusEnum.Pending2 ||
    statusId === PendingStatusEnum.Pending3;

  const message = isPending
    ? t(`general.${status}Message`)
    : pendingMessage
    ? pendingMessage
    : t(`general.${status}Message`);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatusContent({ status, message });
    setStatusDrawerIsOpen(true);
  };

  const content = isMobile ? (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      {icon}
    </div>
  ) : (
    <CustomTooltip title={message}>
      <div onClick={handleClick} style={{ cursor: "pointer" }}>
        {icon}
      </div>
    </CustomTooltip>
  );

  return (
    <>
      {content}

      {isMobile && statusContent && (
        <CustomDrawer
          content={
            <div className="flex flex-col justify-center items-center gap-2 text-center">
              <div className="flex items-center gap-2 font-medium text-lg">
                {statusIconMap[statusContent.status]}
                <span>{t(`general.${statusContent.status}Title`)}</span>
              </div>
              <span className="font-medium text-gray-gray10 dark:text-white text-sm">
                {statusContent.message}
              </span>
            </div>
          }
          isOpen={statusDrawerIsOpen}
          onClose={() => {
            setStatusDrawerIsOpen(false);
            setStatusContent(null);
          }}
        />
      )}
    </>
  );
}

// "use client";

// import { MouseEvent, useState } from "react";

// import { Spin } from "antd";
// import { useTranslations } from "next-intl";
// import { shallowEqual } from "react-redux";

// import { CustomTooltip } from "@components/atoms/defaultElements";
// import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
// import {
//   ErrorIcon,
//   ErrorStatusIcon,
//   Pending,
//   PendingStatusIcon,
// } from "@components/atoms/iconComponents";
// import { useAppSelector } from "@redux/index";
// import { ErrorStatusEnum, PendingStatusEnum } from "@services/base/type";

// interface IProps {
//   id: number;
//   pendingStatusId: number;
//   pendingMessage?: string;
//   isMobile?: boolean;
// }

// export default function RenderStatus({
//   id,
//   pendingStatusId,
//   pendingMessage,
//   isMobile,
// }: IProps) {
//   const t = useTranslations();
//   const { activePage } = useAppSelector(
//     (state) => ({
//       activePage: state.withPersist.pages.find((item) => item.isActive),
//     }),
//     shallowEqual
//   );
//   let statusId;

//   const findingStatusId = activePage?.viewData?.statusItems?.find(
//     (el) => el.id === id
//   );
//   if (findingStatusId) {
//     statusId = findingStatusId.status;
//   } else {
//     statusId = pendingStatusId;
//   }

//   const [statusDrawerIsOpen, setStatusDrawerIsOpen] = useState(false);
//   const [statusContent, setStatusContent] = useState<{
//     status: "pending" | "error";
//     message: string;
//   } | null>(null);

//   const isPending = [
//     PendingStatusEnum.Pending1,
//     PendingStatusEnum.Pending2,
//     PendingStatusEnum.Pending3,
//   ].includes(statusId);

//   const isError = [
//     ErrorStatusEnum.Error100,
//     ErrorStatusEnum.Error101,
//     ErrorStatusEnum.Error102,
//   ].includes(statusId);

//   if (!isPending && !isError) return null;

//   const status: "pending" | "error" = isPending ? "pending" : "error";
//   const icon =
//     status === "pending" ? (
//       <Spin
//         indicator={<Pending />}
//         className="animate-spin"
//         spinning
//         size="small"
//       />
//     ) : (
//       <ErrorIcon />
//     );
//   const message =
//     pendingMessage ??
//     t(
//       status === "pending"
//         ? "general.pendingStatusMessage"
//         : "general.errorStatusMessage"
//     );

//   const handleClick = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setStatusContent({ status, message });
//     setStatusDrawerIsOpen(true);
//   };

//   const content = isMobile ? (
//     <div onClick={handleClick} style={{ cursor: "pointer" }}>
//       {icon}
//     </div>
//   ) : (
//     <CustomTooltip title={message}>
//       <div onClick={handleClick} style={{ cursor: "pointer" }}>
//         {icon}
//       </div>
//     </CustomTooltip>
//   );

//   return (
//     <>
//       {content}

//       {isMobile && (
//         <CustomDrawer
//           content={
//             <div className="flex flex-col justify-center items-center gap-2 text-center">
//               <div className="flex items-center gap-2 font-medium text-lg">
//                 {statusContent?.status === "pending" ? (
//                   <PendingStatusIcon />
//                 ) : (
//                   <ErrorStatusIcon />
//                 )}
//                 <span>
//                   {statusContent?.status === "pending"
//                     ? t("general.pendingStatusTitle")
//                     : t("general.errorStatusTitle")}
//                 </span>
//               </div>
//               <span className="font-medium text-gray-gray10 text-sm">
//                 {statusContent?.message}
//               </span>
//             </div>
//           }
//           isOpen={statusDrawerIsOpen}
//           onClose={() => {
//             setStatusDrawerIsOpen(false);
//             setStatusContent(null);
//           }}
//         />
//       )}
//     </>
//   );
// }
