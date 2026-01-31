import { DynamicSelect } from "@components/atoms/defaultElements";
import { useGetData } from "@services/base";
import { setPageData } from "@slice/pages";
import type { IRequestConfig, ISelectOption } from "@type/elementType";

import { Form } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDispatch } from "react-redux";

export const FieldSelector = ({
  repoId,
  setRepoId,
}: {
  repoId: number;
  setRepoId: (repoId: number) => void;
}) => {
  const t = useTranslations();
  const dispatch = useDispatch();

  const systemAccountConfig: IRequestConfig = {
    endpoint: "/api/mng/select/systemAccount4SelectOption",
    repoViewId: null,
  };

  const [sysId, setSysId] = useState<number | null>(null);
  const { data: items } = useGetData<ISelectOption[], null>({
    url: "/api/mng/select/repo4SelectOption",
    body: {
      SystemId: sysId,
    },
    skip: !sysId,
  });

  const handleSelectRepo = (repoId: number) => {
    setRepoId(repoId);
    dispatch(setPageData({ name: "RepoId", value: repoId }));
  };

  return (
    <div className="flex flex-col gap-2 px-2 border-e-2 border-gray-gray3 text-xs">
      <Form.Item
        label="انتخاب فیلد"
        name="fieldTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={systemAccountConfig}
          onChange={(value) => setSysId(value)}
        />
      </Form.Item>
      <div className="flex flex-col gap-2 h-[calc(100dvh-240px)] overflow-y-auto">
        {items?.Data?.map((item) => (
          <div
            key={item._SelectId}
            className={`cursor-pointer p-2 border-2 rounded-lg ${
              repoId === item._SelectId
                ? "bg-gray-gray7 border-gray-gray8"
                : "bg-gray-gray3"
            }`}
            onClick={() => handleSelectRepo(item._SelectId)}
          >
            <div>{item._SelectDisplay}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
