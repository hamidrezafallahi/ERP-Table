import type { IBaseDto } from '@services/base/type';

export interface ICostCenter extends IBaseDto {
  CostCenterCode: string;
  CostCenterDesc: string;
  CostCenterTypeId: number;
  CostCenterId: number;
  SharingId: number;
  SharingPriority: number;
  CostCenterType: {
    CommonDesc: string;
  };
}

export interface IRequest {
  config: string;
}
