import React, {
  useEffect,
  useState,
} from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
  CustomSelect,
} from '@components/atoms/defaultElements';
import { ActionIcon } from '@components/atoms/iconComponents';
import DynamicModal from '@components/organisms/dynamicModal';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { setPageData } from '@slice/pages';

import { produceModalConfig } from '../config';

interface IProps {}
function VersionManagement({ ...props }: IProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const { selectedGoodId, selectedVersionId } = useAppSelector(
    (state) => ({
      selectedGoodId: state.withPersist.pages
        ?.find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedGoodId")?.value,
      selectedVersionId: state.withPersist.pages
        ?.find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedVersionId")?.value,
    }),
    shallowEqual
  );
  const { data, isLoading } = useGetData<any, any>({
    url: "api/prd/select/sPlan",
    body: {
      GoodId: selectedGoodId,
      RepoViewId: 150003,
    },
    skip: !selectedGoodId,
  });

  useEffect(() => {
    if (data?.Result == "Success") {
      setOptions(
        data.Data.map((o) => ({ value: o.SPlanId, label: o.Version }))
      );
      dispatch(
        setPageData({
          name: "selectedVersionId",
          value:
            data.Data.find((i) => i.IsBase)?.SPlanId ??
            data.Data[0]?.SPlanId ??
            undefined,
        })
      );
      dispatch(
        setPageData({
          name: "baseSPlanId",
          value: data.Data.find((i) => i.IsBase)?.SPlanId ?? undefined,
        })
      );
      dispatch(
        setPageData({
          name: "hasMoreSPlan",
          value: data.Data.length > 2,
        })
      );
      dispatch(
        setPageData({
          name: "hasBase",
          value: data.Data.some((i) => i.IsBase === true),
        })
      );
    }
  }, [data]);
  const handleVersion = (e) => {
    dispatch(setPageData({ name: "selectedVersionId", value: e }));
  };

  const handleOpenVersionSetterModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-48 h-full">
        <div>{t("general.version")}</div>
        {selectedGoodId && (
          <CustomSelect
            value={selectedVersionId}
            onChange={handleVersion}
            placeholder={t("general.versionTitle")}
            className="!w-full !h-10"
            options={options}
          />
        )}

        <CustomButton
          type="text"
          onClick={handleOpenVersionSetterModal}
          className="bg-gray-gray9 dark:bg-gray-gray1 m-0 p-0 border-main-black dark:border-main-white h-10 text-main-white dark:text-main-black"
        >
          {t("general.versionManagement")}
        </CustomButton>
      </div>
      <CustomModal
        contentClassName="lg:w-[520px] h-[470px]"
        headerName={"t general.version"}
        open={false}
        onCancel={() => {
          setIsOpen(false);
        }}
        footer={null}
        // centered
        headerIcon={<ActionIcon />}
        closeModal={() => {
          setIsOpen(false);
        }}
        title={"title"}
        isModalOpen={isOpen}
        content={
          <DynamicModal
            id={selectedGoodId}
            sourceKey={"GoodId"}
            config={
              produceModalConfig.find((item) => item.name === "version")?.config
            }
          />
        }
      />
    </>
  );
}

export default VersionManagement;
