import { FormInstance } from 'antd';
import moment from 'moment-jalaali';

import { AppDispatch } from '@redux/index';
import {
  addNewPage,
  resetPageData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { showSuccessToast } from '@utils/core';

export const createHandleAdd =
  (activePage: any, dispatch: AppDispatch, initializePage: any) => () => {
    const u = activePage.url.split("?id=");

    if (u[1]?.length > 0) {
      initializePage({
        config: {
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: u[0],
          Id: u.length > 0 ? Number(u[1]) : 0,
        },
      });
    } else {
      const newPageId = Math.floor(Math.random() * 1000).toString();

      dispatch(
        addNewPage({
          pageId: newPageId,
          caption: activePage.caption,
          pageState: PageStateEnum.Opened,
          originalPageState: PageStateEnum.Opened,
          type: activePage.type,
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: activePage.url,
          toolbarData: activePage.toolbarData,
          listUrl: activePage.listUrl,
          listPageId: activePage.listPageId,
        })
      );
    }
  };

export const createHandleSave =
  (
    form: FormInstance,
    trigger: any,
    t: any,
    navigateBack: () => void,
    locale: "fa" | "en"
  ) =>
  async () => {
    await form.validateFields();
    const offset = locale === "fa" ? "+03:30" : "+00:00";
    const tempBody = {
      CalendarDesc: form.getFieldValue("title"),
      StartTime: moment(form.getFieldValue("StartTime"))
        // .add({
        //   hour: Number(offset.split(":")[0]),
        //   minute: Number(offset.split(":")[1]),
        //   second: 0,
        //   millisecond: 0,
        // })
        .format("HH:mm").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()),
      EndTime: moment(form.getFieldValue("EndTime"))
        // .add({
        //   hour: Number(offset.split(":")[0]),
        //   minute: Number(offset.split(":")[1]),
        //   second: 0,
        //   millisecond: 0,
        // })
        .format("HH:mm").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()),
      Sat: form.getFieldValue("Sat"),
      Sun: form.getFieldValue("Sun"),
      Mon: form.getFieldValue("Mon"),
      Tue: form.getFieldValue("Tue"),
      Wed: form.getFieldValue("Wed"),
      Thu: form.getFieldValue("Thu"),
      Fri: form.getFieldValue("Fri"),
      StartDayWeek: form.getFieldValue("StartDayWeek"),
    };

    try {
      const result = await trigger({
        url: "/api/com/insert/calendar",
        body: tempBody,
      }).unwrap();

      if (result?.Result == "Success") {
        showSuccessToast(t("toast.successTitle"));
        navigateBack();
      }
    } catch (error) {
      console.log(error);
    }
  };

export const createHandleReset =
  (form: FormInstance, dispatch: AppDispatch) => () => {
    form.resetFields();
    dispatch(resetPageData({}));
  };
