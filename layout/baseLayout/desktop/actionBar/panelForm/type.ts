import {
  Dispatch,
  SetStateAction,
} from 'react';

export interface IProps {
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
  setOpenModal?: Dispatch<SetStateAction<any>>;
  
}
