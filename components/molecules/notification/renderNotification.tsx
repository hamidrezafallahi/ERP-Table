import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";

import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import {
  Info,
  NotExistNotificationIcon,
  SpinIcon,
  TrashBin,
} from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation } from "@services/base";
import {
  type INotification,
  MessageStatusEnum,
} from "@services/notification/type";
import { convertDate, showSuccessToast } from "@utils/core";
import {
  removeNotification,
  updateNotificationStatus,
} from "@slice/notification";
import { Spin } from "antd";
import {
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { IBaseQueryResponse, IBaseRequest } from "@services/base/type";

interface RenderNotificationProps {
  lastItemRef?: RefObject<HTMLDivElement>;
  isDropdown?: boolean;
  desktop?: boolean;
  data: INotification[];
  refetchCount?: () => QueryActionCreatorResult<
    QueryDefinition<
      {
        url: string;
        body: IBaseRequest<any>;
        id: number | string;
      },
      (args: any, api: any, extraOptions: any) => Promise<any>,
      string,
      IBaseQueryResponse<any>,
      "apiService"
    >
  >;
}

export const RenderNotification = ({
  lastItemRef,
  isDropdown,
  desktop,
  data,
  refetchCount,
}: RenderNotificationProps) => {
  const t = useTranslations();
  const [changeStatus] = useCUDDataMutation();
  const { locale } = useAppSelector((state) => ({
    locale: state.withPersist.config.lang,
  }));
  const dispatch = useDispatch();
  const [loadingItems, setLoadingItems] = useState<number[]>([]);

  const handleChangeStatus = async () => {
    const seen = data.filter((item) => item.Message.LastStatusId === 1);
    try {
      const activationResult = await changeStatus({
        url: "api/notification/update/messageUser/status",
        body: {
          input:
            seen?.length > 0
              ? seen?.map((item) => ({
                  MessageId: item.MessageId,
                  UserId: item.Message.MessageUsers[0].ReceiverUserId,
                  StatusId: MessageStatusEnum.Seen,
                }))
              : [],
        },
      }).unwrap();

      if (activationResult?.Result) {
        const seenIds = seen.map((item) => item.MessageId);
        refetchCount();
        dispatch(updateNotificationStatus(seenIds));
      }
    } catch (error) {
      null;
    }
  };

  const handleDelete = async (item: INotification) => {
    setLoadingItems((prev) => [...prev, item.MessageId]);
    try {
      const deleteResult = await changeStatus({
        url: "api/notification/delete/messageUser",
        body: {
          MessageId: item?.MessageId,
          receiverUserId: item.Message.MessageUsers[0].ReceiverUserId,
        },
      }).unwrap();

      if (deleteResult.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        dispatch(removeNotification(item.MessageId));
      }
    } catch (error) {
      null;
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== item.MessageId));
    }
  };

  // useEffect(() => {
  //   if (!notifications.length) return;
  //   const timer = setTimeout(() => handleChangeStatus(), 2000);
  //   return () => clearTimeout(timer);
  // }, [notifications]);

  useEffect(() => {
    if (!isDropdown || !data.length) return;
    const unseen = data.some((item) => item.Message.LastStatusId === 1);

    if (!unseen) return;
    const timer = setTimeout(handleChangeStatus, 2000);
    return () => clearTimeout(timer);
  }, [isDropdown, data]);

  return (
    <>
      {data?.map((item, index) => {
        const isNew = item.Message.LastStatusId === 1;
        return (
          index + 1 <= 20 && (
            <div
              key={item.MessageId}
              ref={index === data.length - 1 ? lastItemRef : null}
              className="flex justify-between items-center gap-2 pt-5 pb-5 border-b-[1px] first:pt-2 last:border-b-0 text-sm group"
            >
              <div
                className={`${
                  isNew ? "border-s-[3px]" : "border-none"
                } flex flex-col gap-2 dark:border-white ps-2 border-black-black95 w-full`}
              >
                <div className="flex justify-between items-center gap-2 w-full">
                  <div className="flex justify-between items-center gap-2">
                    {isDropdown ? (
                      <CustomTooltip title={item?.Message?.Message}>
                        <Info
                          config={{ stroke: isNew ? "#0E0E0E" : "#939393" }}
                        />
                      </CustomTooltip>
                    ) : (
                      <Info />
                    )}
                    <span
                      className={`${
                        isNew ? "text-main-black" : "text-gray-gray8"
                      } text-base font-medium`}
                    >
                      {item?.Message?.Title}
                    </span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span
                        className={`${
                          isNew ? "text-main-black" : "text-gray-gray8"
                        } text-xs font-normal`}
                      >
                        {item?.SenderName ?? t("general.system")}
                      </span>
                      <span
                        className={`${
                          isNew ? "text-main-black" : "text-gray-gray8"
                        } text-xs font-normal`}
                      >
                        {convertDate({
                          dateString: item?.CreateDate,
                          locale: locale,
                        })}
                      </span>
                    </div>
                    {desktop && (
                      <CustomButton
                        className="p-0 hover:!bg-white h-5"
                        type="text"
                        onClick={() => handleDelete(item)}
                      >
                        <TrashBin
                          config={{
                            width: 16,
                            height: 16,
                            stroke: "#D9878E",
                          }}
                        />
                      </CustomButton>
                    )}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <span
                    className={`${isDropdown ? "max-w-72" : ""} ${
                      isNew ? "text-main-black" : "text-gray-gray9"
                    } ps-7 text-sm font-normal`}
                  >
                    {item?.Message?.Message}
                  </span>
                  {!desktop && (
                    <CustomButton
                      className="p-0 hover:!bg-white h-5 hidden group-hover:flex"
                      type="text"
                      onClick={() => handleDelete(item)}
                    >
                      {loadingItems.includes(item.MessageId) ? (
                        <Spin size="large" indicator={<SpinIcon />} />
                      ) : (
                        <TrashBin
                          config={{ width: 16, height: 16, stroke: "#D9878E" }}
                        />
                      )}
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>
          )
        );
      })}
      {data?.length === 0 && (
        <div className="flex flex-col justify-center items-center gap-2 p-4">
          <div className="flex flex-col justify-center items-center gap-2 p-4">
            <NotExistNotificationIcon />
          </div>
          <span className="text-gray-gray7 text-md">{t("general.noData")}</span>
        </div>
      )}
    </>
  );
};
