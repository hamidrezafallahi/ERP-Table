"use client";
import React, { useEffect } from 'react';

import { Form } from 'antd';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import TaxPayersSettingForm from './taxpayersSettingForm';
import { Toolbar } from './toolbar';

export default function TaxpayersSetting() {
  const dispatch = useDispatch();

  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
    }),
    shallowEqual
  );

  const { pageId, RepoId, SystemId, url, Id, pageState, originalPageState } =
    initPage;
  const [form] = Form.useForm();

  useEffect(() => {
    if (RepoId) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.taxPayersSetting",
          icon: "TaxPayersIcon",
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
      <Title caption={"title.taxPayersSetting"} />
      <Toolbar submit={form.submit} />
      <TaxPayersSettingForm form={form} />
    </div>
  );
}
