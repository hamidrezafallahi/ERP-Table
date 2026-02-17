import { combineReducers } from "@reduxjs/toolkit";

import account from "./account";
import config from "./config";
import container from "./container";
import history from "./history";
import init from "./init";
import listItems from "./items";
import navigateList from "./navigateList";
import pages from "./pages";
import notificationReducer, { NotificationState } from "@slice/notification";
import { IInitialContainer } from "./container/type";

const withoutPersist = combineReducers({
  container,
  notification: notificationReducer,
});

export type WithoutPersistState = {
  container: IInitialContainer;
  notification: NotificationState;
};
const withPersist = combineReducers({
  init,
  pages,
  config,
  listItems,
  navigateList,
  history,
  account,
});

const sliceRootReducer = {
  withPersist,
  withoutPersist,
};

export default sliceRootReducer;
