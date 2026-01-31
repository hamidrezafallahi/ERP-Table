import dayjs from 'dayjs';

export interface IRemindMe {
  RemindOption: string;
  atDate: dayjs.Dayjs;
  atTime: dayjs.Dayjs;
  Caption: string;
}
export interface IProps {
  refId: number;
  repoId: number;
  onClose: () => void;
  isOpen?: boolean;
}
