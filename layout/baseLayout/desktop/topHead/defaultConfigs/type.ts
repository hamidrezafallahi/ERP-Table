import {
  Dispatch,
  SetStateAction,
} from 'react';

import { TourProps } from 'antd';

type StepType = NonNullable<TourProps["steps"]>[number];
export interface IRequiredStep extends StepType {
  id: string;
}
export interface IProps {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
}
