import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useCUDDataMutation, apiService } from "@services/base";
import { useDispatch } from "react-redux";

import InputText from "@components/atoms/defaultElements/inputText";
import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";
import { showSuccessToast } from "@utils/core";

export const TafsiliCategoryForm = ({ createUrl, listUrl, repoViewId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const t = useTranslations();

  const [mutateItem, { isLoading }] = useCUDDataMutation();

  const handleSubmit = async (values) => {
    try {
      const result = await mutateItem({
        url: createUrl,
        body: values,
      }).unwrap();

      if (result?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: listUrl,
              body: { RepoViewId: repoViewId },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );
      }
    } catch (error) {
      null;
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label=""
        name="TafsiliCategoryDesc"
        rules={[{ required: true, message: "مقدار را وارد کنید" }]}
      >
        <InputText />
      </Form.Item>

      <div className="flex justify-end items-center gap-2">
        <CustomTooltip title={t("general.addNew")}>
          <span
            className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
            onClick={() => {
              form.resetFields();
            }}
          >
            <PlusOutline />
          </span>
        </CustomTooltip>
        <CustomButton
          type="text"
          htmlType="submit"
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {isLoading ? (
            <Spin size="small" indicator={<SpinIcon />} />
          ) : (
            t("general.submit")
          )}
        </CustomButton>
      </div>
    </Form>
  );
};
