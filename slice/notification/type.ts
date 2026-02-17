import type { IBaseDto } from "@services/base/type";

export interface INotification extends IBaseDto {
  MessageUserId: number;
  MessageId: number;
  PlaceId: number;
  SenderName?: string;
  ManagmentAccountId: number;
  CreateDate: string;
  CreateUserId: number;
  Message: {
    MessageId: number;
    StatusId: MessageStatusEnum;
    Message: string;
    Title: string;
    MessageUsers: [{ ReceiverUserId: number }];
    MessageUserStatus: [];
    GetEntityId: number;
    LastStatusId: number;
  };
}

export enum MessageStatusEnum {
  Sent = 1,
  Seen = 2,
}
