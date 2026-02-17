import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INotification, MessageStatusEnum } from "./type";

export interface NotificationState {
  list: INotification[];
}

const initialState: NotificationState = {
  list: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.list = action.payload;
    },
    clearNotifications(state) {
      state.list = [];
    },
    removeNotification(state, action: PayloadAction<number>) {
      state.list = state.list.filter((n) => n.MessageId !== action.payload);
    },
    updateNotificationStatus: (state, action) => {
      const ids: number[] = action.payload;
      state.list = state.list.map((item) =>
        ids.includes(item.MessageId)
          ? {
              ...item,
              Message: {
                ...item.Message,
                LastStatusId: MessageStatusEnum.Seen,
              },
            }
          : item
      );
    },
  },
});

export const { setNotifications, clearNotifications, removeNotification,updateNotificationStatus } =
  notificationSlice.actions;

export default notificationSlice.reducer;
