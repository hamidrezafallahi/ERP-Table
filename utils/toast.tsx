import { message } from 'antd';
import {
  Slide,
  toast,
} from 'react-toastify';

import {
  ToastConfirm,
  ToastError,
  ToastErrorDelete,
  ToastInfo,
  ToastNotification,
  ToastSuccess,
} from '@components/molecules/toast';
import { IDeleteData } from '@services/auth/base/type';
import { MessageEnum } from '@type/enum';

export const showErrorToast = (message, title = "", time = 0) => {
  return toast(<ToastError message={message} title={title} />, {
    bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
    className: "!rounded-2xl border-state-error7 border-[0.5px] !shadow-toast",
    position: "top-right",
    autoClose: time,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
  });
};
export const showErrorToastDelete = (
  message: string,
  deleteData: IDeleteData[],
  title = "",
  time = 0,
) => {
  return toast(
    <ToastErrorDelete
      message={message}
      title={title}
      deleteData={deleteData}
    />,
    {
      bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
      className:
        "!rounded-2xl border-state-error7 border-[0.5px] !shadow-toast",
      position: "top-right",
      autoClose: time,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    },
  );
};
export const showInfoToast = (message = "", title = "", time = 2000) => {
  return toast(<ToastInfo message={message} title={title} />, {
    bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
    className: "!rounded-2xl border-blue-blue005 border-[0.5px] !shadow-toast",
    position: "top-right",
    autoClose: time,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
  });
};
export const showSuccessToast = (message, title = null, time = 2000) => {
  return toast(<ToastSuccess message={message} title={title} />, {
    bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
    className:
      "!rounded-2xl border-state-success2 border-[0.5px] !shadow-toast",
    position: "top-right",
    autoClose: time,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
  });
};
export const showConfirmToast = (
  message = null,
  title = null,
  handleConfirm,
) => {
  return toast(
    <ToastConfirm
      message={message}
      title={title}
      handleConfirm={handleConfirm}
    />,
    {
      bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
      className:
        "!rounded-2xl border-blue-blue005 border-[0.5px] !shadow-toast",
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    },
  );
};
export const showNotificationToast = (message = "", title = "") => {
  return toast(<ToastNotification message={message} title={title} />, {
    bodyClassName: "!p-0 !m-0 !h-28 rounded-2x",
    className: "!rounded-2xl border-black-black border-[0.5px] !shadow-toast",
    position: "bottom-right",
    autoClose: 4000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
  });
};
export function showErrorByErrorCode(errorCode: MessageEnum, content) {
  switch (errorCode) {
    case "s01":
      return showErrorToast(content);
    case "s02":
      return showSuccessToast(content);
    case "s03":
      return showInfoToast(content);
    case "s04":
      return showNotificationToast(content);
    case "s05":
      return message.error({ content });
    case "s06":
      return message.success({ content });
    case "s07":
      return message.info({ content });
    case "s08":
      return message.warning({ content });
    case "s09":
      return message.loading({ content });
    default:
      return showErrorToast(content);
  }
}