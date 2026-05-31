import React, { ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomSwitch,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  AddCircle,
  Edit,
  Link,
  TrashBin,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { IBaseDto } from '@services/base/type';

import {
  INestedListConfig,
  SetStates,
} from '../types';
import { TreeTitleHandlers } from './types';

interface TreeTitleActionsProps<T extends IBaseDto> {
  isSelected: boolean;
  isPending: boolean;
  isActive: boolean;
  handlers: TreeTitleHandlers<T>;
  config: INestedListConfig;
  item: T;
  renderAddChildAction: (item: T) => ReactNode;
  renderCustomAction: (item: T) => ReactNode;
  customAction: (item: T) => ReactNode;
  setStates: SetStates;
  conditionalActivation: (item: T) => true;
  withoutActivation: boolean;
  systemName: string;
  repoName: string;
}

const TreeTitleActions = <T extends IBaseDto>(
  props: TreeTitleActionsProps<T>,
) => {
  const {
    isSelected,
    isPending,
    isActive,
    handlers,
    item,
    config,
    renderAddChildAction,
    renderCustomAction,
    customAction,
    setStates,
    conditionalActivation,
    withoutActivation,
    systemName,
    repoName,
  } = props;
  const { uniqueKey, levelKey, showUploadAction } = config;
  const { match, settingItems } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const activePage = state.withPersist.pages?.find((page) => page.isActive);
    const settingItems = activePage?.toolbarData?.GridMenu;
    return { match, settingItems };
  }, shallowEqual);
  const t = useTranslations();

  if (!isSelected || isPending) return null;


  return (
    <div className="flex items-center gap-3">
      {isActive && (
        <CustomTooltip title={handlers.findTooltip("add", item[levelKey])}>
          <CustomButton
            type="link"
            icon={
              <AddCircle
                config={
                  !match
                    ? {
                        width: 20,
                        height: 20,
                      }
                    : {
                        width: 16,
                        height: 16,
                      }
                }
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              handlers.onAdd();
            }}
            style={{ padding: 0 }}
          />
        </CustomTooltip>
      )}
      {isActive && renderAddChildAction(item)}
      {isActive &&
        settingItems &&
        settingItems?.length > 0 &&
        renderCustomAction(item)}
      {isActive && customAction && customAction(item)}
      {isActive && (
        <CustomTooltip title={t("general.update")}>
          <CustomButton
            type="link"
            icon={
              <Edit
                config={
                  !match
                    ? {
                        width: 18,
                        height: 18,
                      }
                    : {
                        width: 16,
                        height: 16,
                      }
                }
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(item);
            }}
          />
        </CustomTooltip>
      )}
      {isActive && showUploadAction && (
        <CustomButton
          type="text"
          className="flex justify-between hover:!bg-transparent p-0 w-full"
          onClick={() =>
            setStates.setModals((prev) => ({ ...prev, attachment: true }))
          }
        >
          <Link
            config={
              !match
                ? {
                    width: 22,
                    height: 22,
                  }
                : {
                    width: 20,
                    height: 20,
                  }
            }
          />
        </CustomButton>
      )}
      {isActive && (
        <CustomTooltip title={t("general.delete")}>
          <CustomButton
            type="link"
            icon={
              <TrashBin
                config={
                  !match
                    ? {
                        width: 18,
                        height: 18,
                      }
                    : {
                        width: 16,
                        height: 16,
                      }
                }
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(item[uniqueKey]);
            }}
          />
        </CustomTooltip>
      )}
      {!withoutActivation && conditionalActivation(item) && (
        <CustomTooltip
          title={item.Inactive ? t("general.notActive") : t("general.active")}
        >
          <CustomSwitch
            config={{
              url: `/api/${systemName}/inActive/${repoName}`,
              id: item[uniqueKey],
            }}
            defaultChecked={item.Inactive ? false : true}
          />
        </CustomTooltip>
      )}
    </div>
  );
};

export default TreeTitleActions;
