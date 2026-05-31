import { useState } from 'react';

import { Switch } from 'antd';
import { useTranslations } from 'next-intl';

import { useCUDDataMutation } from '@services/base';
import { showSuccessToast } from '@utils/toast';

import type { IProps } from './type';

export const CustomSwitch = ({
  className,
  defaultChecked,
  config = null,
  ...props
}: IProps) => {
  const t = useTranslations();
  const [Activation, { isLoading }] = useCUDDataMutation();

  const [isActive, setIsActive] = useState(
    defaultChecked ? defaultChecked : false
  );

  const handleActivationAction = async (activationStatus: boolean) => {
    if (!config) return;
    try {
      const activationResult = await Activation({
        url: config.url,
        body: {
          [config.fieldKey ? config.fieldKey : "Id"]: config.id,
          Inactive: !activationStatus,
          ...config.body,
        },
        id: null,
      }).unwrap();

      if (activationResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        setIsActive((prevState) => !prevState);
      }
    } catch (error) {
      null;
    }
  };

  if (config) {
    return (
      <Switch
        className={`*:!shadow-none ${
          isActive ? "*:before:!bg-main-black" : "*:before:!bg-gray-gray6"
        }   [&>.ant-switch-inner]:!bg-[#F5F5F6] [&>.ant-switch-inner]:!border  [&>.ant-switch-inner]:!border-gray-gray6  ${className}`}
        defaultChecked={isActive}
        loading={isLoading}
        onChange={(checked) => handleActivationAction(checked)}
      />
    );
  } else {
    return (
      <Switch
        {...props}
        defaultChecked={defaultChecked}
        className={`*:!shadow-none ${
          defaultChecked ? "*:before:!bg-main-black" : "*:before:!bg-gray-gray6"
        }   [&>.ant-switch-inner]:!bg-[#F5F5F6] [&>.ant-switch-inner]:!border  [&>.ant-switch-inner]:!border-gray-gray6  ${className}`}
      />
    );
  }
};
