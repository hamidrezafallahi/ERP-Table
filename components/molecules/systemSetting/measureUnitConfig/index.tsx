import React, {
  useEffect,
  useState,
} from 'react';

import {
  SelectProps,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import RadioList from '@components/molecules/radioList';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { showSuccessToast } from '@utils/toast';

export const MeasureUnitConfig = () => {
  const t = useTranslations();
  const [unit, setUnit] = useState(null);
  const [trigger, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const { data, isLoading } = useGetData({
    url: "api/mng/select/placeConfig/valueType",
    body: {},
  });

  const handleChangeUnit = async (e) => {
    setUnit(e.target.value);
  };
  const handleSubmit = async () => {
    try {
      const mutateResult: any = await trigger({
        url: "api/mng/update/placeConfig/valueType",
        body: { Value: unit, ChangeFields: ["Value"] },
      });

      if (mutateResult?.data?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }
    } catch (error) {
      null;
    }
  };
  const options: SelectProps["options"] = [
    { value: "1", title: "تک واحدی", label: "تک واحدی" },
    { value: "2", title: "دو واحدی", label: "دو واحدی" },
    { value: "3", title: "سه واحدی", label: "سه واحدی" },
  ];

  useEffect(() => {
    if (data?.Result === "Success") {
      setUnit(data?.Data[0].PlaceConfigValues[0].Value);
    }
  }, [data]);
  return (
    <div className="flex flex-col justify-between gap-2">
      <RadioList
        className="flex flex-col p-2 border-2 border-dashed"
        onChange={handleChangeUnit}
        value={unit}
        options={options}
      />
      <div className="flex justify-end items-center gap-2 pt-2">
        <CustomButton
          type="text"
          onClick={handleSubmit}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.submit")
          )}
        </CustomButton>
      </div>
    </div>
  );
};
