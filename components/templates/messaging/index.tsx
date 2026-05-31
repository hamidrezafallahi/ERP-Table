"use client";
import React, { useEffect } from 'react';

import { Form } from 'antd';
import { useDispatch } from 'react-redux';

import Title from '@components/atoms/Title';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import MessagingForm from './messagingForm';
import { Toolbar } from './toolbar';

function Messaging() {
  const dispatch = useDispatch();
  const initPage = useAppSelector((state) => state.withPersist.init);
  const { pageId, RepoId, SystemId, url, pageState, originalPageState } =
    initPage;
  const [form] = Form.useForm();

  useEffect(() => {
    if (RepoId) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.messaging ",
          icon: "MessagingIcon",
          pageState,
          originalPageState,
          type: PageTypeEnum.Custom,
          RepoId,
          SystemId,
          url,
        })
      );
    }
  }, [RepoId]);

  return (
    <div className="relative w-full h-full">
      <Title caption={"title.messaging"} />
      <Toolbar submit={form.submit} />
      <MessagingForm form={form} />
    </div>
  );
}

export default Messaging;
