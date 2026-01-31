import { createContext, useMemo } from "react";

import type { NotificationArgsProps } from "antd";
import { Button, notification } from "antd";

type NotificationPlacement = NotificationArgsProps["placement"];

const Context = createContext({ name: "Default" });

export const Toast = () => {
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: `Notification ${placement}`,
      description: (
        <Context.Consumer>{({ name }) => `Hello, ${name}!`}</Context.Consumer>
      ),
      placement,
    });
  };
  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);
  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <Button type="primary" onClick={() => openNotification("topRight")}>
        topRight
      </Button>
    </Context.Provider>
  );
};
