import type { IBaseDto } from '@services/base/type';

export interface SPlanOpcs {
  SPlanOpcId: number;
  OperationName?: string;
  Order: number;
  OperationType?: number;
  GetEntityId?: number;
  DisablePending?: boolean;
}

export interface SPlanModel extends IBaseDto {
  SPlanId: number;
  GoodId: number;
  Version: string;
  IsBase: boolean;
  SPlanOpcs: SPlanOpcs[];
}

export interface ISPlanFormulaItemMinimal extends IBaseDto {
  SPlanId: number;
  SPlanOpcId: number;
  SplanFormulas: any[];
}

export interface ISPlanFormula {
  SPlanOpcFormulaId: number;
  SPlanId: number;
  SPlanOpcId: number;

  SplanFormulas: ISPlanFormulaItemMinimal[];
}

export interface PayloadBody {
  commands: {
    SPlanOpcFormulaId: number | null;
    SPlanOpcId: number;
    SPlanId: number;
    Items: {
      SPlanOpcFormulaItemId: number | null;
      SPlanOpcId: number | null;
      SPlanId: number;
    }[];
  }[];
}

export interface IRequest {
  config: string;
}
