import { ITagInfo } from '@services/base/type';

export interface ITags {
  RepoId: number;
  RefId: number;
  tags: ITagInfo[];
  revalidated?: boolean;
}

export interface IInitialContainer {
  defaultTags?: ITagInfo[];
  recordsTags?: ITags[];
  minimize: boolean;
  duration: IDuration;
  verifyExpireTime: number | null;
}

export interface IDuration {
  from: number | Date;
  to: number | Date;
}
