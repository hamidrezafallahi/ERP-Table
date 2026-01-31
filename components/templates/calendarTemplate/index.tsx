"use client";

import React, { useEffect } from 'react';

import { Form } from 'antd';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import CalendarForm from './calendarForm';
import CalendarMobileToolbar from './calendarMobileToolbar';
import CalendarToolbar from './calendarToolbar';

export default function CalendarTemplate() {

  const [form] = Form.useForm();
 
  const { match, initPage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const initPage = state.withPersist.init;
    return { match, initPage };
  }, shallowEqual);

  const { pageId, RepoId, SystemId, pageState, originalPageState } = initPage;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.calendar",
        icon: "CalendarFormIcon",
        pageState: pageState,
        originalPageState: originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: RepoId,
        SystemId: SystemId,
        url: "com/calendar",
      })
    );
  }, []);

  return (
    <div className="relative">
      <Title caption="title.calendar" />
      <CalendarToolbar form={form} />
      {!match && <CalendarMobileToolbar />}
      <div className="relative flex flex-col justify-between w-full h-full *:dark:text-gray-gray1">
        <CalendarForm form={form} />
      </div>
    </div>
  );
}
