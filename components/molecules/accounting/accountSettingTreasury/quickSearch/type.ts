import { Dispatch, SetStateAction } from "react";

export interface IProps {
  searchPhrase: string;
  setSearchPhrase: Dispatch<SetStateAction<string>>;
}
