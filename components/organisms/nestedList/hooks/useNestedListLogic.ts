import {
  useCallback,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useCUDDataMutation } from '@services/base';
import { IToolbarMenu } from '@type/toolbar';
import {
  findItemInNestedData,
  findNestedLevel,
} from '@utils/core';
import { showSuccessToast } from '@utils/toast';

import { useModalState } from './useModalState';
import { useSelectionState } from './useSelectionState';
import { useUIState } from './useUIState';

export const useNestedListLogic = <T>(
  config: any,
  titleKey: any,
  data: any,
  refetch: () => void,
  match: boolean,
) => {
  const t = useTranslations();
  const { deleteUrl, updateUrl, uniqueKey, nestedKey, fatherKey } = config;
  const [dynamicAction, setDynamicAction] = useState<{
    icon: string;
    label: string;
    actionConfig: IToolbarMenu;
  }>();
  const [attachmentDesc, setAttachmentDesc] = useState(t("sidebar.drag"));
  const [trigger, { isLoading: triggerIsLoading }] = useCUDDataMutation();
  const { modals, setModals, toggleModal } = useModalState();
  const { selection, setSelection } = useSelectionState();
  const { setUi, ui } = useUIState();

  const extractTitle = useCallback(
    (item: any) => {
      if (!item) return null;
      if (Array.isArray(titleKey)) {
        return titleKey
          .map((key) => item[key])
          .filter(Boolean)
          .join(" - ");
      }
      return item[titleKey as string] || null;
    },
    [titleKey],
  );

  const handleAddAction = (
    id: number,
    fatherId: number,
    type: "addSide" | "addChild" | "firstItem",
  ) => {
    const currentLevel = findNestedLevel(data?.Data, id, {
      idKey: uniqueKey,
      childrenKey: nestedKey,
    });
    const activeSelectedId = selection.selectedId || id;
    let newSelection = {
      selectedId: activeSelectedId,
      id: null,
      fatherId: null,
      level: 1,
      title: null as string | null,
    };
    if (type === "addChild") {
      const currentItem = findItemInNestedData(
        data?.Data,
        uniqueKey as keyof T,
        id,
      );
      newSelection = {
        ...newSelection,
        fatherId: id,
        level: currentLevel + 2,
        title: extractTitle(currentItem),
      };
    } else if (type === "addSide") {
      if (fatherId) {
        const parentItem = findItemInNestedData(
          data?.Data,
          uniqueKey as keyof T,
          fatherId,
        );
        newSelection = {
          ...newSelection,
          fatherId,
          level: currentLevel + 1,
          title: extractTitle(parentItem),
        };
      }
    }
    setSelection(newSelection);
    toggleModal("form", true);
  };

  const handleDropAction = async (
    dragKey: number | string,
    newFatherId: number | null,
  ) => {
    try {
      const triggerFormResponse = await trigger({
        url: updateUrl,
        body: {
          [fatherKey]: newFatherId,
          [uniqueKey]: dragKey,
          ChangeFields: [`${fatherKey}`],
        },
      }).unwrap();
      if (triggerFormResponse?.Result !== "Failed") {
        showSuccessToast(t("toast.successTitle"));
        refetch();
      }
    } catch (error) {
      null;
    }
  };

  const handleDeleteAction = (id: number) => {
    setSelection((prev) => ({ ...prev, id, selectedId: id }));
    if (match) {
      setModals((prev) => ({
        ...prev,
        deleteModal: true,
      }));
    } else {
      setModals((prev) => ({
        ...prev,
        deleteDrawer: true,
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteResult = await trigger({
        url: deleteUrl,
        body: { Id: selection.id },
      }).unwrap();

      if (deleteResult.DeleteResults[0].IsDelete === true) {
        showSuccessToast(t("toast.successTitle"));
        setSelection((prev) => ({ ...prev, id: null, selectedId: null }));
        refetch();
      }
      setModals((prev) => ({
        ...prev,
        deleteModal: false,
        deleteDrawer: false,
      }));
    } catch (error) {
      null;
    }
  };
  const handleAction = async (action: IToolbarMenu) => {
    try {
      setDynamicAction({
        icon: action.Icon as string,
        label: action.MenuDesc,
        actionConfig: action,
      });

      switch (action.MenuDesc) {
        case ActionLabelsEnum.CustomerGroupCredit as string:
          setModals((prev) => ({
            ...prev,
            credit: true,
          }));
          break;
        default:
          setModals((prev) => ({
            ...prev,
            dynamic: true,
          }));
          break;
      }
    } catch (error) {
      null;
    }
  };
  const handleEditAction = (item: T) => {
    const itemId = item[uniqueKey];
    const level = findNestedLevel(data.Data, itemId, {
      idKey: uniqueKey,
      childrenKey: nestedKey,
    });
    setSelection({
      selectedId: itemId,
      id: itemId,
      fatherId: item[fatherKey],
      level: level + 1,
      title: extractTitle(item),
    });
    toggleModal("form", true);
  };
  return {
    selection,
    ui,
    modals,
    dynamicAction,
    attachmentDesc,
    setSelection,
    setUi,
    setModals,
    setDynamicAction,
    setAttachmentDesc,
    actions: {
      handleAddAction,
      handleDeleteConfirm,
      handleDropAction,
      extractTitle,
      handleDeleteAction,
      handleEditAction,
      handleAction,
      toggleModal,
    },
    triggerIsLoading: triggerIsLoading,
  };
};
