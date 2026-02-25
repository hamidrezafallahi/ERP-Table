export interface IProps {
  handlePrevStep?: () => Promise<void>;
  id: number;
  mutateIsLoading?: boolean;
  withoutButton?: boolean;
}
