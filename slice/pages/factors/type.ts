export interface IInvoice {
  invoiceCategories?: IGoodsCategory[];
  goods?: IGoodsCategory[];
  factor?: IFactor;
  products: IFactorItem[];
}
export interface IFactor {
  saleTypeId: number;
  items: IFactorItem[];
  sum: number;
  tax: number;
  discountSum: number;
  totalPrice: number;
  customer?: ICustomer;
  taxItems?: IEffectiveTypeInFactor[];
  discountItems?: IEffectiveTypeInFactor[];
  addElements?: IEffectiveTypeInFactor[];
}


export interface IEffectiveTypeInFactor {
  id: number,
  amount: number,
  PricePercent: boolean,
  title: number,
  deletable: boolean,
  desc: string,
  type?: 0 | 1 | 2,
}

export interface IGoodsCategory {
  GoodsCategoryId: number;
  GoodsCategoryDesc: string;
  FatherId?: number;
  SubCategories?: IGoodsCategory[];
  GoodsImage?: string;
}


export interface ICustomer {
  CustomerId: number;
  CustomerCode: string;
  CustomerDesc: string;
  CreateUserId: number;
  PlaceId: number;
  GroupId: number;
  ManagmentAccountId: number;
  Person: {
    FullName: string;
    CreateDate: string;
    GetEntityId: number;
  };
}

export interface IFactorItem {
  type: "category" | "product";
  taxItems?: IEffectiveTypeInFactor[];
  discountItems?: IEffectiveTypeInFactor[];
  GoodsCategoryDesc: string;
  GoodsCategoryId?: string | number;
  GoodsId: string | number;
  GoodsImage: string;
  GoodsPrice: number;
  GoodsDiscount?: number;
  GoodsCount: number;
  unitId: number;
  unitDesc: string;
}
export interface IFactorState {
  [pageId: string]: {
    items?: IFactorItem[];
    customer?: ICustomer;
    addElements?: IEffectiveTypeInFactor[];
    discountItems?: IEffectiveTypeInFactor[];
    taxItems?: IEffectiveTypeInFactor[];
    invoice?: {
      invoiceCategories?: IGoodsCategory[];
      goods?: IGoodsCategory[];
      factor?: IFactor;
      products: IFactorItem[];
    };
  };
}
