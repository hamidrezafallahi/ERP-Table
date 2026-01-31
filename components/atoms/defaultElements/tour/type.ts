import { TourProps } from 'antd';

export interface IProps extends TourProps {
  open: boolean;
  onClose: () => void;
  tourStepItems: TourProps['steps'];
  conditionalCloseFunction?: () => boolean;
}
