import {
  Dispatch,
  SetStateAction,
} from 'react';

export interface IFlowItem {
  time?: any;
  notMachin?: boolean;
  id?: number;
  title?: string;
  type: "circle" | "square" | "circleInSquare";
  order?: number;
  createdAt?: string;
  changeFields?: Record<string, any>;
}
export interface IInsertResponse {
  Data: {
    SPlanOpcId: number;
    SPlanId: number;
    OprationName: string;
    OprationType: number;
    Order: number;
    NoMachin: boolean;
    Time: any;
  };
  Status: boolean;
}
export interface IFlowItemExtended extends IFlowItem {
  createdAt: string;
  sPlanOpcId: number;
}

export type TCases =
  | "version"
  | "مواد اولیه"
  | "انرژی"
  | "ابزار"
  | "تخصص"
  | "ماشین"
  | "نیم ساخته"
  | "ویرایش"
  | "جدید"
  | "حذف";

export interface DeleteNodeModalProps {
  onClose?: () => void;
  editNode?: IFlowItem;
  open?: boolean;
  flowItems?: IFlowItem[];
  sPlanOpcId?: number;
}
export interface AddNodeModalProps {
  open?: boolean;
  onClose?: any;
  onSubmit?: (node: IFlowItem, newOrder?: number) => void;
  editNode?: IFlowItem | null;
  flowItems?: IFlowItem[];
  modalType?: TCases | null;
  isLoading?: boolean;
  selectedNode?: IFlowItemExtended | null;
  setFlowItems: Dispatch<SetStateAction<IFlowItem[]>>;
}
export interface FlowNodeProps {
  sPlanOpcId?: number;
  item: IFlowItem;
  selected: boolean;
  onSelect: (id: number) => void;
  handleOpenModal: (type: TCases) => void;
  editNode?: IFlowItem | null;
  flowItems?: IFlowItem[];
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (node: IFlowItem, newOrder?: number) => void;
  selectedNode?: IFlowItemExtended | null;
  setFlowItems: Dispatch<SetStateAction<IFlowItem[]>>;
}

export const typeToSelect = {
  circle: "1",
  square: "2",
  circleInSquare: "3",
} as Record<string, string>;
