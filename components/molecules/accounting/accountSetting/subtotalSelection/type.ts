import {
  Dispatch,
  SetStateAction,
} from 'react';

export interface IProps {
  selectedSubtotal: number[];
  setSelectedSubtotal: Dispatch<SetStateAction<number[]>>;
}
