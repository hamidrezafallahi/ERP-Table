import {
  useMemo,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { showSuccessToast } from '@utils/core';

import {
  VoucherTypeApiResponse,
  voucherTypeReq,
} from './type';

type UseVoucherDescriptionProps = {
  form: any;
  voucherTypeId: number | string | null;
  controller:any
};

export const useVoucherDescription = (props: UseVoucherDescriptionProps) => {
  const { form, voucherTypeId,controller } = props;
  const t = useTranslations();
  const dispatch = useDispatch();
  const [inputKey, setInputKey] = useState(0);

  const { voucherDescConfig, lang } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find((p) => p.isActive);
    const lang = state.withPersist.config.lang;
    const voucherDescConfig = activePage?.pageData?.find(
      (pro) => pro.name === "VoucherDesc",
    );

    return { voucherDescConfig, lang };
  }, shallowEqual);

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const isDisabled =
    voucherTypeId === undefined ||
    voucherTypeId === null ||
    voucherTypeId === "";

  const { data: menuData } = useGetData<VoucherTypeApiResponse, voucherTypeReq>(
    {
      url: "/api/acc/select/voucherTypeDescriptions",
      body: {
        VoucherTypeId: voucherTypeId as number,
        RepoViewId: 0,
        RepoId: 0,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: 10000,
        },
      },
      skip: isDisabled,
    },
  );

  const items = useMemo(
    () =>
      menuData?.Data?.map((item, index) => ({
        key: String(index),
        label: item.Desc,
        onClick: () => {


// controller
          // form.setFieldValue("VoucherDesc", item.Desc);

          // if (voucherDescConfig) {
          //   dispatch(
          //     setPageData({
          //       ...voucherDescConfig,
          //       value: item.Desc,
          //     }),
          //   );
          // }

          setInputKey((k) => k + 1);
        },
      })) || [],
    [menuData?.Data, form, voucherDescConfig, dispatch],
  );

  const handleSaveDescription = async () => {
    if (isDisabled) return;

    const desc = form.getFieldValue("VoucherDesc");

    const res = await mutateItem({
      url: "/api/acc/insert/voucherTypeDescriptions",
      body: {
        Desc: desc,
        VoucherTypeId: voucherTypeId,
      },
    }).unwrap();

    if (res?.Result === "Success") {
      showSuccessToast(t("toast.successTitle"));
    }
  };

  return {
    inputKey,
    items,
    isDisabled,
    lang,
    handleSaveDescription,
    mutateIsLoading,
  };
};
