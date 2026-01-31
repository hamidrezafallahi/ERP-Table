export interface IProps {
  onFocus: () => void;
  isActive: boolean;
}

export type QuickFilterRef = {
  clearInput: () => void;
};
