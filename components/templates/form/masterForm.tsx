"use client";
import { useState } from 'react';

import { Form } from 'antd';
import { useSearchParams } from 'next/navigation';

import Title from '@components/atoms/Title';
import FormToolbar from '@components/organisms/formToolbar';
import { GridContainedPageProps } from '@type/elementType';

export function MasterForm<T, K>({ ...props }: Omit<GridContainedPageProps,"form"|"tableType"|"masterForm" |"setMasterForm"|"actor"|"columnConfig"|"formConfig"|"multiSelectConfig"|"formHeight"|"recordHeight"|"mobileRecordsPerPage"> ) {
  const { headerFieldKey , caption, listUrl, Component ,saveAsDraft} = props;
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const [masterForm, setMasterForm] = useState<{loading:boolean,action:"save"|"saveAndNew"|"saveAndClose"}>({loading:false,action:"save"});
  const [form] = Form.useForm();

  return (
    <>
      <Title caption={caption} />
      <div className="relative">
        <div className="-top-[60px] absolute end-0">
          <FormToolbar
            listUrl={listUrl}
            toolbarData={toolbar}
            isEdit={id > 0}
            form={form}
            fieldKey={headerFieldKey}
            id={id}
            setMasterForm={setMasterForm}
            masterForm={masterForm}
            saveAsDraft={saveAsDraft}
          />
        </div>
        <Component
          {...props}
          setMasterForm={setMasterForm}
          masterForm={masterForm} 
          form={form}
        />
      </div>
    </>
  );
}
