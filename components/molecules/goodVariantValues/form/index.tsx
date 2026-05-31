import {
  FC,
  useEffect,
  useState,
} from 'react';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  Close,
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import type { IAppliedVariant } from '../type';
import type { IProps } from './type';

export const BaseFormGoodVariantValues: FC<IProps> = ({
  baseVariantData,
  variantDefaultValues,
  subFormLoading,
  existVariants,
  onApplyVariants,
}) => {
  const t = useTranslations();
  const [variants, setVariants] = useState<IAppliedVariant[]>([]);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const selectedVariants = variants.map((i) => i.variantId);

  const variantOptions = baseVariantData?.map((item) => {
    return {
      value: item.CommonTypeId,
      variantId: item.VariantId,
      label: item.Title,
      disabled: selectedVariants.includes(item.VariantId),
    };
  });
  const handleFieldChange = (id: number, value: number) => {
    const title = variantOptions.find((item) => item.value === value)?.label;
    const variantId = variantOptions.find(
      (item) => item.value === value
    )?.variantId;

    setVariants(
      variants.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              variantId: variantId,
              commonTypeId: value,
              title: title,
            }
          : variant
      )
    );
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), variantId: null, commonTypeId: null, title: null },
    ]);
  };

  const removeVariantHandler = (id: number) => {
    setVariants(variants.filter((variant) => variant.id !== id));
  };

  useEffect(() => {
    const appliedVariants = variants?.filter((variant) => variant.variantId);
    if (existVariants.length !== appliedVariants?.length) {
      onApplyVariants(
        appliedVariants?.map((item) => {
          return {
            commonTypeId: item.commonTypeId,
            variantId: item.variantId,
            title: item.title,
          };
        })
      );
    }
  }, [variants]);

  useEffect(() => {
    if (variantDefaultValues && variantDefaultValues?.length > 0) {
      const defaultValues = variantDefaultValues.map((item, index) => {
        const defaultValue = item?.Variant;
        return {
          id: index,
          variantId: defaultValue?.VariantId,
          commonTypeId: defaultValue?.CommonTypeId,
          title: defaultValue?.VariantDesc,
        };
      });
      const uniqueData = defaultValues.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.variantId === item.variantId)
      );

      if (uniqueData?.length > 0) {
        uniqueData?.map((item) => {
          const exist = variants?.find((item) =>
            item.variantId === uniqueData?.variantId ? false : true
          );
          if (!exist) {
            setVariants((prev) => [...prev, item]);
          }
        });
      }
    }
  }, [variantDefaultValues]);

  return (
    <div className="flex flex-col justify-between px-2">
      {!match && (
        <div className="flex justify-start">
          <CustomButton
            type="text"
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded text-white text-xs"
            onClick={handleAddVariant}
          >
            {subFormLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              <PlusOutline />
            )}
          </CustomButton>
        </div>
      )}
      <ul className="h-[88px] lg:!max-h-[88px] overflow-y-auto">
        {variants?.map((variant) => (
          <li key={variant.id}>
            <div className="flex items-center gap-2 py-1 max-w-[440px]">
              <CustomSelect
                className="w-full text-xs"
                placeholder={t("general.selectField")}
                value={variant.commonTypeId}
                onChange={(value) => handleFieldChange(variant.id, value)}
                options={variantOptions}
              />

              <CustomButton
                type="text"
                className="bg-gray-gray5 dark:bg-gray-gray12 px-3 py-1 border hover:border-black-black8 rounded text-main-black"
                onClick={() => removeVariantHandler(variant.id)}
              >
                <CustomTooltip title={t("general.delete")}>
                  <div className="flex justify-center items-center gap-1">
                    <Close config={{ width: 8, height: 8 }} />
                  </div>
                </CustomTooltip>
              </CustomButton>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end items-center gap-2 pt-2">
        <CustomButton
          type="text"
          className="bg-black-black8 hover:bg-white px-3 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          onClick={handleAddVariant}
        >
          {subFormLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            <PlusOutline />
          )}
        </CustomButton>
      </div>
    </div>
  );
};
