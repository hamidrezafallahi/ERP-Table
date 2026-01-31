export interface IProps {
  itemsToConfirm?: number | number[];
  mode?: "Delete" | "Confirm" | "createNewEdit";
  onCancel: () => void;
  onConfirm: () => void;
  onLoading: boolean;
}
