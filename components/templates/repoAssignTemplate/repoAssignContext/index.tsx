"use client";

import { Form } from "antd";
import CustomFormRepoAssign from "./customFormRepoAssign";

export default function RepoAssignContext({ systemId, selectedGoodId }) {
  const [form] = Form.useForm();

  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        <CustomFormRepoAssign
          systemId={systemId}
          form={form}
          selectedGoodId={selectedGoodId}
        />
      </div>
    </>
  );
}
