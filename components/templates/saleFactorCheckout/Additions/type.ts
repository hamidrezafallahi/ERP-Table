import {
  Dispatch,
  ReactNode,
  SetStateAction,
} from 'react';

export interface IContent{
    icon:ReactNode
    label:string
    element:ReactNode
    fieldKey:string
}

export interface CustomAdditionProps {
  onChange:(content:IContent)=>void;
  setIsOpen:Dispatch<SetStateAction<boolean>> ;
  content:IContent
}