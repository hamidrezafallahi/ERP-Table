import { IBaseDto } from "@services/base/type";

export interface IOrganization {
  OrganizationChartId: number;
  OrganizationChartName: string;
  OrganizationChartFatherId?: number;
  SubUnits?: IOrganization[];
}
export interface IRequest extends IBaseDto {
  config?: string;
}
interface OrgNode {
  id: number;
  name: string;
  title: string;
  images: string[];
  children: OrgNode[];
  relationship: string;
}

export interface IProps {
  nodeData: {
    name: string;
    id: string;
    realId: number;

    images: string[];
    children: OrgNode[];
  };
  fetchApi: any;
  refetchChart: () => void;
  setOpenModalUpdateItem?: any;
  openModalUpdateItem?: boolean;
  setOpenModalDeleteItem?: any;
  openModalDeleteItem?: boolean;
  setOpenModalAddItem?: any;
  openModalAddItem?: boolean;
  setOpenModalImagesItem?: any;
  openModalImagesItem?: boolean;
  direction?: string;
}

export interface IUpdateChildrenProps {
  data: { name: string; id: number; images: any };
  fetchApi: any;
  refetchChart: () => void;
  setOpenModalUpdateItem?: any;
  openModalUpdateItem?: boolean;
  setOpenModalDeleteItem?: any;
  openModalDeleteItem?: boolean;
  setOpenModalAddItem?: any;
  openModalAddItem?: boolean;
  setOpenModalImagesItem?: any;
  openModalImagesItem?: boolean;
  direction?: string;
}
