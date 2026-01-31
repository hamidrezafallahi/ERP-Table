import type { IFormFieldConfig } from "@type/elementType";
type ZoomLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19;
export interface IMapProps {
  height?: number;
  onChange?: (latLng: [number, number]) => void;
  defaultCenter?: [number, number];
  defaultZoom?: ZoomLevel;
  config?: IFormFieldConfig;
}
