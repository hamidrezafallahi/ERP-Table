"use client";
import { useState } from 'react';

import { Form } from 'antd';
import { useSearchParams } from 'next/navigation';

import Title from '@components/atoms/Title';
import FormToolbar from '@components/organisms/formToolbar';

import type { IMasterProps } from './type';

export function MasterForm<T, K>({ ...props }: IMasterProps) {
  const {
    fieldKey,
    caption,
    listUrl,
    Component,
  } = props;
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();
  return (
    <>
      <Title caption={caption} />
      <div className="relative">
        <div
          className="-top-[60px] absolute end-0" 
        >
          <FormToolbar
            listUrl={listUrl}
            toolbarData={toolbar}
            isEdit={id > 0}
            form={form}
            fieldKey={fieldKey}
            id={id}
            fromIndexedDb={false}
            loadingFromOutsideComponents={isFormSubmitting}
          />
        </div>
        <Component
          setIsFormSubmitting={setIsFormSubmitting}
          form={form}
          {...props}
        />
      </div>
    </>
  );
}
