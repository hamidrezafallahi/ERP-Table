import { useGetData } from "@services/base";
import { IRequest } from "@services/reportFile/type";
import { INotification } from "@slice/notification/type";

interface NotificationBody {
  RepoViewId: number;
  ShowAll: boolean;
  PagingInfo: {
    OnlyTotalCount: boolean;
    PageNumber: number;
    PageRecordCount: number;
  };
}

export const useNotificationsData = (
  onlyTotalCount: boolean,
  skipFetching: boolean
) => {
  const requestBody: NotificationBody = {
    RepoViewId: 110005,
    ShowAll: false,
    PagingInfo: {
      OnlyTotalCount: onlyTotalCount,
      PageNumber: 1,
      PageRecordCount: 2000,
    },
  };

  return useGetData<INotification[], IRequest>({
    url: "api/notification/select/messageUser",
    body: requestBody,
    skip: skipFetching,
  });
};
