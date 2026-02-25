import { combineReducers } from '@reduxjs/toolkit';
import notificationReducer, { NotificationState } from '@slice/notification';

import account from './account';
import config from './config';
import container from './container';
import { IInitialContainer } from './container/type';
import endYearOperations from './endYearOperations';
import history from './history';
import init from './init';
import listItems from './items';
import navigateList from './navigateList';
import pages from './pages';

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
  endYearOperations,
});

const sliceRootReducer = {
  withPersist,
  withoutPersist,
};

export default sliceRootReducer;
