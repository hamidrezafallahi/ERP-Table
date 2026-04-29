import { useMemo, useState } from "react";

import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";

import {
  CustomDropdownButton,
  CustomModal,
} from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import { Dots, TrashBin } from "@components/atoms/iconComponents";
import Confirmation from "@components/molecules/confirmation";
import { TagManagement } from "@components/molecules/tag";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useDarkMode } from "@hooks/custom";
import type { IToolbarMenu } from "@type/toolbar";
import { getColoredIcon, showInfoToast } from "@utils/core";

export default function ListSelectMode({
  selectedItems,
  toolbarData,
  confirmationIsLoading,
  handleConfirmation,
  isSelectMode,
}) {
  const t = useTranslations();
  const { mode = "light" } = useDarkMode();
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"Delete" | "Confirm">(
    "Delete",
  );
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

  const groupActionMenu = useMemo(() => {
    const handleGroupAction = (menuItem: IToolbarMenu) => {
      try {
        switch (menuItem.MenuDesc) {
          case ActionLabelsEnum.AddTag as string:
            if (selectedItems?.length > 0) {
              setIsAddTagModalOpen(true);
            } else {
              showInfoToast(
                t("toast.minOneItemToast"),
                ActionLabelsEnum.AddTag as string,
              );
            }
            break;
          default:
            null;
            break;
        }
      } catch (error) {
        null;
      }
    };

    const items =
      toolbarData?.GroupMenu?.length > 0
        ? toolbarData?.GroupMenu?.filter(
            (item) => item.MenuDesc !== ActionLabelsEnum.Delete,
          )?.map((menuItem: IToolbarMenu) => ({
            key: menuItem?.MenuId,
            label: menuItem?.MenuDesc,
            icon: (
              <>
                {typeof menuItem.Icon === "string" && (
                  <span
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        getColoredIcon(menuItem?.Icon, mode),
                      ),
                    }}
                  />
                )}
              </>
            ),
            onClick: () => handleGroupAction(menuItem),
          }))
        : [];
    return items;
  }, [toolbarData?.GroupMenu, selectedItems]);

  const handleDeleteAction = () => {
    if (selectedItems && selectedItems.length > 0) {
      setConfirmMode("Delete");
      setIsConfirmDrawerOpen(true);
    } else {
      showInfoToast(
        t("toast.minOneItemToast"),
        ActionLabelsEnum.Delete as string,
      );
    }
  };

  return (
    <>
      <div
        className={`${
          !isSelectMode ? "translate-y-20 delay-300" : ""
        } right-0 bottom-0 left-0 z-40 fixed  bg-white dark:bg-gray-gray95 shadow-2xl  border-t rounded-t-xl h-[71px]`}
      >
        <div
          className={`${
            !isSelectMode ? "translate-y-20" : ""
          } flex justify-around items-center  px-4 pt-2 h-full transition-all duration-500`}
        >
          <div
            className="flex flex-col items-center gap-1"
            onClick={handleDeleteAction}
          >
            <TrashBin
              config={{
                height: 24,
                width: 24,
                stroke: mode === "dark" ? "#FBFBFB" : "#585858",
              }}
            />
            <span className="text-[10px]">{t("general.delete")}</span>
          </div>
          {groupActionMenu?.length === 3
            ? groupActionMenu?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1"
                  onClick={item?.onClick}
                >
                  {item?.icon}
                  <span className="text-[10px]">
                    {item?.label === ActionLabelsEnum.AddTag
                      ? t("general.tag")
                      : item?.label}
                  </span>
                </div>
              ))
            : groupActionMenu?.length > 3 &&
              groupActionMenu?.slice(0, 2)?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1"
                  onClick={item?.onClick}
                >
                  {item?.icon}
                  <span className="text-[10px]">
                    {item?.label === ActionLabelsEnum.AddTag
                      ? t("general.tag")
                      : item?.label}
                  </span>
                </div>
              ))}
          {groupActionMenu?.length > 3 && (
            <CustomDropdownButton
              placement="bottom"
              className="flex flex-col items-center gap-1 bg-gray-gray3 dark:bg-gray-gray95 p-[6px] rounded w-28 h-full hover:text-main-black dark:hover:text-white text-xs"
              items={groupActionMenu?.slice(2)}
            >
              <Dots />
              <span className="text-[10px] cursor-pointer">
                {t("general.groupAction")}
              </span>
            </CustomDropdownButton>
          )}
        </div>
      </div>

      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedItems}
            mode={confirmMode}
            onLoading={confirmationIsLoading}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
          />
        }
      />

      {isAddTagModalOpen && selectedItems?.length > 0 && (
        <CustomModal
          headerName={t("modal.tags")}
          closeModal={() => setIsAddTagModalOpen(false)}
          isModalOpen={isAddTagModalOpen}
          content={
            <div className="p-2 h-full">
              <TagManagement refIds={selectedItems} />
            </div>
          }
        />
      )}
    </>
  );
}
