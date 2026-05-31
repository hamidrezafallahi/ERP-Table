import { IBaseDto } from "@services/base/type";

export interface TreeTitleHandlers<T extends IBaseDto> {
  findTooltip: (mode: "add" | "addChild", level?: number) => string | null;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onUpload: (item: T) => void;
}
