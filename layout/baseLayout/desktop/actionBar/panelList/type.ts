import { ReactNode } from "react";

export interface IModalObject {
  title: ReactNode;
  content: ReactNode;
}
export interface DataType {
  key?: number;
  RepoTagId?: number;
  name?: string;
  originalName?: string;
}
