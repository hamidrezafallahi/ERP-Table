import { useState } from "react";

import { Divider, Form, FormProps } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { apiService, useCUDDataMutation, useGetData } from "@services/base";
import type { IRequest, IVariant } from "@services/com/variant/type";
import { setPageState } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import { showSuccessToast } from "@utils/core";

import { BaseFormGoodVariantValues } from "./form";
import { SubFormGoodVariantValues } from "./subForm";
import type { IAppliedVariant, IProps } from "./type";

export default function GoodVariantValues({ id, sourceKey, listUrl }: IProps) {
  const t = useTranslations();

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { activePage, listPage } = useAppSelector((state) => {
    const pages = state?.withPersist?.pages;
    const activePage =
      pages && pages.length > 0
        ? pages?.find((item) => item.isActive === true)
        : null;
    const listPage =
      pages && pages.length > 0
        ? pages?.find((item) => item.url === listUrl)
        : null;
    return {
      listPage,
      activePage,
    };
  }, shallowEqual);

  const [detailIsLoading, setDetailIsLoading] = useState(false);

  const getVariantUrl = "api/com/select/variant";
  const repoViewId = 30057;
  const getUrl = "api/com/select/relatedGoodsVariant";
  const detailRepoViewId = 30011;
  const mutateUrl = "api/com/insert/createGoodsVariant";

  const fieldKey = "CommonTypeId";

  const [appliedVariants, setAppliedVariants] = useState<IAppliedVariant[]>([]);

  const { data: variantData } = useGetData<IVariant[], IRequest>({
    url: getVariantUrl,
    body: {
      RepoViewId: repoViewId,
      // [sourceKey]: id,
    },
  });
  const { data: variantDefaultValueData } = useGetData<IAppliedVariant[], null>(
    {
      url: "/api/com/select/initRelatedGoodsVariant",
      body: {
        RepoViewId: 30083,
        [sourceKey]: id,
      },
    }
  );

  const variantDefaultValues = variantDefaultValueData?.Data;

  const variantOptions: IVariant[] = variantData?.Data;

  const handleApplyVariants = (variants: IAppliedVariant[]) => {
    setAppliedVariants(variants);
  };

  const [trigger, { isLoading }] = useCUDDataMutation();

  const onSubmit: FormProps<any>["onFinish"] = async (values) => {
    const result = [];

    // Helper object to group CommonIds by VariantId
    const variantMap = {};

    for (const key in values) {
      if (values[key] === true) {
        const [variantId, commonId] = key.split("-");

        if (!variantMap[variantId]) {
          variantMap[variantId] = [];
        }

        variantMap[variantId].push(commonId);
      }
    }

    // Convert the map into the desired structure
    for (const variantId in variantMap) {
      result.push({
        VariantId: parseInt(variantId),
        CommonIds: variantMap[variantId].map((id) => parseInt(id)),
      });
    }

    try {
      const triggerMultiResponse = await trigger({
        url: mutateUrl,
        body: {
          [sourceKey]: id,
          VariantDatas: result,
        },
      }).unwrap();

      if (triggerMultiResponse?.Result === "Success") {
        dispatch(
          apiService.util.invalidateTags([
            { type: "relatedGoodsVariant", id: id },
          ])
        );
        showSuccessToast(t("toast.save"));

        form.resetFields();
        if (listPage) {
          dispatch(
            setPageState({
              ...listPage,
              pageState: PageStateEnum.NeedReload,
            })
          );
        } else {
          dispatch(
            setPageState({
              ...activePage,
              pageState: PageStateEnum.NeedReload,
            })
          );
        }
      }
    } catch (error) {
      null;
    }
  };

  return (
    <div className="flex flex-col m-2">
      <BaseFormGoodVariantValues
        variantDefaultValues={variantDefaultValues}
        existVariants={appliedVariants}
        onApplyVariants={handleApplyVariants}
        subFormLoading={detailIsLoading}
        baseVariantData={variantOptions}
      />
      <Divider className="m-2" />
      <Form
        name="VariantValue"
        layout="vertical"
        onFinish={onSubmit}
        form={form}
        autoComplete="off"
      >
        <div className="flex flex-col justify-between px-2">
          <div className="max-w-[504px] max-h-[250px] overflow-auto">
            <div className="flex gap-4 px-4 w-fit">
              {appliedVariants?.map((detail, index) => (
                <SubFormGoodVariantValues
                  key={index}
                  fieldId={detail?.commonTypeId}
                  variantId={detail?.variantId}
                  title={detail?.title}
                  form={form}
                  fieldKey={fieldKey}
                  getUrl={getUrl}
                  repoViewId={detailRepoViewId}
                  sourceId={id}
                  sourceKey={sourceKey}
                  setDetailIsLoading={setDetailIsLoading}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end items-center gap-2 dark:bg-black-black5 px-2 pt-4 border-t border-t-gray-gray5 w-full text-xs">
            <Form.Item className="m-0 p-0 text-xs">
              <div className="flex justify-end items-center gap-2 w-full text-xs">
                <CustomButton
                  htmlType="submit"
                  type="text"
                  loading={isLoading}
                  className="flex gap-2 bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
                >
                  {t("general.submit")}
                </CustomButton>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
}
