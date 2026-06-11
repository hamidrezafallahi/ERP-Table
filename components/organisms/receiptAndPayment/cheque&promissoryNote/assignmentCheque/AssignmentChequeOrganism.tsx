"use client";
import { useState } from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import DynamicLevelFields from '@components/molecules/dynamicLevelFields';
import { Level4TypeEnum } from '@components/molecules/dynamicLevelFields/enum';
import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { GridContainedPageProps } from '@type/elementType';

import MainFields from '../mainFields';
import {
  columnConfig,
  formConfig,
  multiSelectConfig,
} from './config';

export default function AssignmentChequeOrganism<T, K>({
  ...props
}: GridContainedPageProps) {
  const { addUrl, updateUrl, form,type } = props;
  const [urls, setUrls] = useState<{
    addUrl: string;
    updateUrl: string;
    vti?: Level4TypeEnum;
  }>({
    addUrl,
    updateUrl,
  });
  const t = useTranslations();
  const { RpWayId,VoucherNatureId } = useAppSelector(
    (state) => ({
      RpWayId: state?.withPersist?.pages
        ?.find((item) => item.isActive)
        ?.pageData?.find((i) => i.name === "RpWayId")?.value,
      VoucherNatureId: state?.withPersist?.pages
        ?.find((item) => item.isActive)
        ?.pageData?.find((i) => i.name === "VoucherNatureId")?.value,
    }),
    shallowEqual,
  );

  const { pageReady, handleSubmit, setController, tableProps} =
    useERPGrid({
      ...props,
      addUrl: urls.addUrl,
      updateUrl: urls.updateUrl,
      formHeight: 550,
      columnConfig: columnConfig(type,VoucherNatureId),
      multiSelectConfig,
      formConfig,
    });
    console.log(pageReady)
  return (
    <div className="flex flex-col gap-8">
      <Form
        form={form}
        onFinish={handleSubmit}
        name="assignmentCheque"
        layout="vertical"
        className={`flex flex-col gap-2 lg:grid lg:grid-cols-6 lg:gap-3 content-start h-[290px]  overflow-y-auto hidden-show-scrollBar`}
      >
        <MainFields form={form} setUrls={setUrls} />
        <DynamicLevelFields
          accountId={RpWayId}
          form={form}
          level4Type={urls.vti}
          url="/api/trh/select/account"
        />
      </Form>

      {pageReady && VoucherNatureId && (
        <div>
          <ERPTable //<IMoreProps>
            {...tableProps}
            // moreDetailComponent={More}
            onReady={(controller) => {
              setController(controller);
            }}
          />
        </div>
      )}
    </div>
  );
}
