import {
  Dispatch,
  SetStateAction,
  useState,
} from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  ContextConfirmationPortals,
} from '@components/organisms/sideBarForm/sideBarFormContext/contextConfirmationPortals';
import { IDynamicModalConfig } from '@components/organisms/sideBarForm/types';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import { useActionManager } from './hooks/useActionManager';
import { useDataManager } from './hooks/useDataManager';
import { TafsiliCategorySideBarMobile } from './tafsiliCategorySideBarMobile';
import { ActionsMobile } from './tafsiliCategorySideBarMobile/actionsMobile';
import { TafsiliCategorySideBarWeb } from './tafsiliCategorySideBarWeb';
import { ISelectTafsili } from './types';

interface TafsiliCategorySideBarProps {
  typeId?: number;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  config: IDynamicModalConfig;
  sideBarTitle: string;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

export const TafsiliCategorySideBar = (props: TafsiliCategorySideBarProps) => {
  const { typeId, setTypeId, config, sideBarTitle, isEdit, setIsEdit } = props;
  const t = useTranslations();
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [editingRecordSide, setEditingRecordSide] =
    useState<ISelectTafsili | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const { match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const { selectData, selectRefetch, isFetchingSelect ,isLoading} = useDataManager({
    config,
  });

  const {
    handleSidebarEdit,
    handleSidebarDelete,
    handleConfirmation,
    triggerIsLoading,
  } = useActionManager({
    typeId,
    selectData: selectData?.Data,
    setEditingRecordSide,
    form,
    setIsEdit,
    match,
    setIsConfirmDrawerOpen,
    config,
    setIsConfirmModalOpen,
    setTypeId,
    t,
    selectRefetch,
  });

  return (
    <div
      className={`${match ? "h-full" : ""} flex flex-col gap-3 p-4 border rounded-lg w-full lg:w-60 lg:min-w-60`}
    >
      <div className="flex items-center justify-between">
        <span>{sideBarTitle}</span>
        {!match && (
          <ActionsMobile
            setOpenModal={setOpenModal}
            handleSidebarEdit={handleSidebarEdit}
            disableActions={!typeId}
            form={form}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            handleSidebarDelete={handleSidebarDelete}
          />
        )}
      </div>
      {match ? (
        <TafsiliCategorySideBarWeb
          config={config}
          selectRefetch={selectRefetch}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          form={form}
          isFetchingSelect={isFetchingSelect}
          selectData={selectData?.Data}
          handleSidebarDelete={handleSidebarDelete}
          handleSidebarEdit={handleSidebarEdit}
          setTypeId={setTypeId}
          editingRecordSide={editingRecordSide}
          setEditingRecordSide={setEditingRecordSide}
          isLoading={isLoading}
        />
      ) : (
        <TafsiliCategorySideBarMobile
          setTypeId={setTypeId}
          selectData={selectData?.Data}
          typeId={typeId}
          selectRefetch={selectRefetch}
          openModal={openModal}
          setOpenModal={setOpenModal}
          config={config}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          form={form}
          editingRecordSide={editingRecordSide}
          setEditingRecordSide={setEditingRecordSide}
        />
      )}
      <ContextConfirmationPortals
        isConfirmModalOpen={isConfirmModalOpen}
        setIsConfirmModalOpen={setIsConfirmModalOpen}
        selectedId={typeId}
        handleConfirmation={handleConfirmation}
        triggerIsLoading={triggerIsLoading}
        isConfirmDrawerOpen={isConfirmDrawerOpen}
        setIsConfirmDrawerOpen={setIsConfirmDrawerOpen}
      />
    </div>
  );
};
