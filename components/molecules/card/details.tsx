import { useState } from "react";

import { Spin } from "antd";
import { usePathname } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomSwitch, CustomTag } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import {
  AddTagIcon,
  BookMarkIcon,
  BookMarkIconFilled,
  Dots,
  SpinIcon,
} from "@components/atoms/iconComponents";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
} from "@services/base";
import {
  type IBaseQueryResponse,
  type ITagInfo,
  PendingStatusEnum,
} from "@services/base/type";
import { addSpecificTags } from "@slice/container";
import { getColoredIcon, getSystemNameById } from "@utils/core";

export const Details = ({
  item,
  columnsConfig,
  conditionalActions,
  actions,
  onActionClick,
  rowFieldKey,
  additionalFieldKey,
  handleSetBookmark,
  currentId,
  bookmarkIsLoading,
  currentChanges,
  showTags,
  tagsData,
  systemId,
  repoId,
  withoutActivation,
  filteringAction,
}) => {
  const { mode = "light" } = useDarkMode();

  const pathname = usePathname();
  const dispatch = useDispatch();

  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find(
      (item) => item.isActive === true,
    );

    return { activePage };
  }, shallowEqual);
  const parts = pathname.split("/").filter(Boolean);
  const systemName = parts[1];
  const repoName = parts[2]?.replace(/List$/, "");

  const [getTags] = useGetConditionallyMutation();
  const [trigger, { isLoading }] = useCUDDataMutation();

  const [isDeletedTag, setIsDeletedTag] = useState(null);
  const [actionDrawerIsOpen, setActionDrawerIsOpen] = useState(false);

  const handleGetTags = async () => {
    try {
      const repoTagsResponse: IBaseQueryResponse<ITagInfo[]> = await getTags({
        url: `/api/${getSystemNameById(systemId)}/select/repoTag`,
        body: {
          RepoId: repoId,
          RefId: item[rowFieldKey],
        },
      }).unwrap();
      if (repoTagsResponse?.Result == "Success" && repoTagsResponse?.Data) {
        dispatch(
          addSpecificTags({
            RepoId: repoId,
            RefId: item[rowFieldKey],
            tags: repoTagsResponse.Data,
            revalidated: true,
          }),
        );
      }
    } catch (err) {
      null;
    }
  };
  const handleDeleteTag = async (removeTag) => {
    if (isLoading) return;
    setIsDeletedTag(removeTag);
    try {
      const removingTagResponse = await trigger({
        url: `/api/${getSystemNameById(systemId)}/delete/tag`,
        body: {
          Id: removeTag.RepoTagId,
          RefId: item[rowFieldKey],
          RepoId: repoId,
        },
      }).unwrap();

      if (removingTagResponse?.Result == "Success") {
        handleGetTags();
      }
    } catch (err) {
      null;
    }
    setIsDeletedTag(null);
  };

  const defaultBookmark =
    currentChanges &&
    currentChanges.find((item) => item.id === item[rowFieldKey]);
  const [bookmarked, setBookmarked] = useState(
    defaultBookmark?.HasBookMark ? defaultBookmark?.HasBookMark : false,
  );

  let finallyActions = filteringAction
    ? filteringAction(actions, item)
    : actions;

  if (conditionalActions?.length) {
    finallyActions = finallyActions.map((act) => {
      let isDisabled = act.disabled || false;

      conditionalActions.forEach(
        ({ conditionalProperty, conditionallyAction, opposite }) => {
          if (
            conditionallyAction && opposite
              ? !!item[conditionalProperty]
              : !item[conditionalProperty]
          ) {
            if (act.MenuDesc === conditionallyAction) {
              isDisabled = true;
            }
          }
        },
      );

      return {
        ...act,
        disabled: isDisabled,
      };
    });
  }

  const deletedItems = activePage?.viewData?.deletedItems;
  const isDeleted = deletedItems.find((el) => el === item[rowFieldKey]);
  const isPending =
    item["PendingStatusId"] === PendingStatusEnum.Pending1 ||
    item["PendingStatusId"] === PendingStatusEnum.Pending2 ||
    item["PendingStatusId"] === PendingStatusEnum.Pending3;

  return (
    <>
      <div className="flex flex-col gap-2 mt-2">
        {columnsConfig?.map((el, idx) => (
          <div
            key={idx}
            className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap"
          >
            <span className="text-gray-gray8 dark:text-white text-xs">
              {el.fieldCaption} :
            </span>
            <span className="font-bold text-gray-gray10 dark:text-white text-xs">
              {item[el.fieldName]}
            </span>
          </div>
        ))}
      </div>

      {showTags && (
        <div className="flex flex-wrap gap-2 mx-2 mt-6 text-[10px]">
          {tagsData?.map((tag: ITagInfo, idx) => (
            <CustomTag
              key={idx}
              tag={tag}
              deleteTagHandler={handleDeleteTag}
              Loading={isDeletedTag?.Title == tag.Title}
              className="!h-5 !font-semibold !text-2xs"
            />
          ))}
        </div>
      )}

      {isDeleted && (
        <div className="flex justify-between items-center mx-2 mt-6 pb-2"></div>
      )}
      {isPending && (
        <div className="flex justify-between items-center mx-2 mt-6 pb-2"></div>
      )}

      {!isDeleted && !isPending && (
        <div className="flex justify-between items-center mx-2 mt-6 pb-2">
          <div className="flex items-center gap-5">
            {finallyActions && finallyActions.length <= 4
              ? finallyActions.map((action) => {
                  return (
                    <span
                      key={action.MenuDesc}
                      className="z-15 cursor-pointer"
                      aria-label={action.MenuDesc}
                      onClick={() => {
                        if (action.disabled) return;
                        onActionClick(
                          action,
                          item[rowFieldKey],
                          item[additionalFieldKey],
                          item["PendingStatusId"],
                          item["FormViewId"],
                          item["UniqueId"],
                        );
                      }}
                    >
                      {typeof action.Icon === "string" && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getColoredIcon(
                              action.Icon.replaceAll(`="18"`, `="20"`),
                              mode,
                            ),
                          }}
                          style={{
                            width: "16px",
                            height: "19px",
                            opacity: action.disabled ? 0.2 : 1,
                          }}
                        />
                      )}
                    </span>
                  );
                })
              : finallyActions.length > 4 &&
                finallyActions.slice(0, 3)?.map((action) => {
                  return (
                    <span
                      key={action.MenuDesc}
                      className="z-15 cursor-pointer"
                      aria-label={action.MenuDesc}
                      onClick={() => {
                        if (action.disabled) return;
                        onActionClick(
                          action,
                          item[rowFieldKey],
                          item[additionalFieldKey],
                          item["PendingStatusId"],
                          item["FormViewId"],
                          item["UniqueId"],
                        );
                      }}
                    >
                      {typeof action.Icon === "string" && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getColoredIcon(
                              action.Icon.replaceAll(`="18"`, `="20"`),
                              mode,
                            ),
                          }}
                          style={{
                            width: "20px",
                            height: "20px",
                            opacity: action.disabled ? 0.2 : 1,
                          }}
                        />
                      )}
                    </span>
                  );
                })}
            {finallyActions?.length > 4 && (
              <span onClick={() => setActionDrawerIsOpen(true)}>
                <Dots config={{ width: 20, height: 22 }} />
              </span>
            )}
          </div>
          <div className="flex justify-end items-center gap-4 w-fit h-full">
            {!withoutActivation && (
              <CustomSwitch
                config={{
                  url: `/api/${systemName}/inActive/${repoName}`,
                  id: Number(item[rowFieldKey]),
                }}
                defaultChecked={item.Inactive ? false : true}
              />
            )}

            <span
              onClick={() =>
                onActionClick(
                  {
                    MenuDesc: ActionLabelsEnum.AddTag as string,
                    key: `${item[rowFieldKey]}`,
                    loggedInUserId: Number(item[rowFieldKey]),
                  },
                  item[rowFieldKey],
                  item[additionalFieldKey],
                  item["PendingStatusId"],
                  item["FormViewId"],
                  item["UniqueId"],
                )
              }
            >
              <AddTagIcon config={{ width: 20, height: 20 }} />
            </span>
            <span
              className="flex items-center gap-2 overflow-hidden"
              onClick={() => {
                handleSetBookmark(item[rowFieldKey], item?.HasBookMark);
                setBookmarked(!bookmarked);
              }}
            >
              {currentId &&
              currentId === item[rowFieldKey] &&
              bookmarkIsLoading ? (
                <Spin
                  size="small"
                  indicator={<SpinIcon config={{ width: 20, height: 20 }} />}
                />
              ) : bookmarked ? (
                bookmarked ? (
                  <BookMarkIconFilled config={{ width: 20, height: 20 }} />
                ) : (
                  <BookMarkIcon config={{ width: 20, height: 20 }} />
                )
              ) : item?.HasBookMark ? (
                <BookMarkIconFilled config={{ width: 20, height: 20 }} />
              ) : (
                <BookMarkIcon config={{ width: 20, height: 20 }} />
              )}
            </span>
          </div>
        </div>
      )}

      <CustomDrawer
        isOpen={actionDrawerIsOpen}
        onClose={() => setActionDrawerIsOpen(false)}
        content={
          <div className="flex flex-col justify-around gap-4 px-2">
            {finallyActions.slice(3)?.map((action) => {
              return (
                <div
                  className="flex items-center gap-4"
                  key={action.MenuDesc}
                  aria-label={action.MenuDesc}
                  onClick={() => {
                    if (action.disabled) return;
                    onActionClick(
                      action,
                      item[rowFieldKey],
                      item[additionalFieldKey],
                      item["PendingStatusId"],
                      item["FormViewId"],
                      item["UniqueId"],
                    );
                    setActionDrawerIsOpen(false);
                  }}
                >
                  {typeof action.Icon === "string" && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(
                          action.Icon.replaceAll(`="18"`, `="20"`),
                          mode,
                        ),
                      }}
                      style={{
                        width: "16px",
                        height: "19px",
                        opacity: action.disabled ? 0.2 : 1,
                      }}
                    />
                  )}
                  <span
                    className={
                      action.disabled
                        ? "text-xs text-center text-gray-gray6"
                        : "text-xs text-center"
                    }
                  >
                    {action.MenuDesc}
                  </span>
                </div>
              );
            })}
          </div>
        }
      />
    </>
  );
};
