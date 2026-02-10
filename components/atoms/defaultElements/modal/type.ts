import { ReactNode } from 'react';

import { ModalProps } from 'antd';

export interface IProps extends ModalProps {
  headerIcon?: ReactNode;
  headerName?: string | React.ReactNode;
  contentClassName?: string;
  headerDescription?: string;
  disableTitle?: boolean;
  withFullscreen?: boolean;
  isModalOpen: boolean;
  closeModal: () => void;
  content: ReactNode;
}
