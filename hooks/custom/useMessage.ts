// useNotification.js
import { message } from "antd";

export const useMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const notify = (content, duration = 3) => {
    messageApi.info(content, duration);
  };

  return { notify, contextHolder };
};
