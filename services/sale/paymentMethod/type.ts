import type { IBaseDto } from '@services/base/type';

export interface IPaymentMethod extends IBaseDto {
  PaymentWayDesc: string;
  PaymentWayId: 3;
  PaymentWayCode: string;
}

export interface IRequest {
  config: string;
}
