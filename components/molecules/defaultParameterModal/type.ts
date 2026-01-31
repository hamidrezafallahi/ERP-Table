import {
  Dispatch,
  ReactNode,
  SetStateAction,
} from 'react';

export interface IDefaultConfigProps {
  setOpenModal?: Dispatch<SetStateAction<boolean>>;
  setContent?:Dispatch<SetStateAction<{title:ReactNode,content:ReactNode}>>;
  removeMenuSide?: () => void;
  handleChangeLang?: (e: string) => void;
  onChange?:()=>void
  showReverse?:boolean
}