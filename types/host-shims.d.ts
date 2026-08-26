/**
 * Ambient stubs for ERP host modules used by package-local UI.
 * Keeps this repo typecheckable without the full monorepo.
 * Host apps supply the real implementations at runtime.
 */

declare module 'antd' {
  export const Tooltip: any;
  export const Spin: any;
  export const Pagination: any;
  export const Select: any;
  export const Dropdown: any;
  const antd: any;
  export default antd;
}

declare module 'next-intl' {
  export function useTranslations(namespace?: string): any;
  export function useLocale(): string;
}

declare module 'use-intl' {
  export function useTranslations(namespace?: string): any;
  export function useLocale(): string;
}

declare module 'react-dom' {
  export function createPortal(children: any, container: any): any;
}

declare module 'react-redux' {
  export function useDispatch(): any;
  export function useSelector<T = unknown>(
    selector: (state: any) => T,
    equalityFn?: any,
  ): T;
  export const Provider: any;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
}

declare module '@hooks/custom' {
  export function useMediaQuery(query: string): { match: boolean | null };
  export function useInitializePage(...args: any[]): any;
  export function useNavigatePage(...args: any[]): any;
}

declare module '@hooks/custom/useAppSelector' {
  export function useAppSelector<T = any>(selector: (state: any) => T): T;
}

declare module '@utils/toast' {
  export function showErrorToast(message?: any): void;
  export function showSuccessToast(message?: any): void;
}

declare module '@services/customBaseQuery' {
  export function baseQueryByToken(
    args: any,
    api: any,
    extra: any,
  ): Promise<any>;
}

declare module '@services/base' {
  export function useGetData<T = any, E = any>(...args: any[]): any;
  export function useCUDDataMutation<T = any, E = any>(...args: any[]): any;
  export function useGetConditionallyMutation<T = any, E = any>(
    ...args: any[]
  ): any;
}

declare module '@type/elementType' {
  export type IDependOn = {
    fieldName: string;
    value: unknown;
  };
  export type IOption = any;
  export type ISelectOption = any;
  export type GridContainedPageProps = any;
  export type IPageConfig = any;
}

declare module '@type/enum' {
  const enums: any;
  export = enums;
}

declare module '@slice/pages' {
  export const initPage: any;
  export const setActivePage: any;
  const slice: any;
  export default slice;
}

declare module '@slice/pages/enum' {
  export const PageType: any;
  const enums: any;
  export default enums;
}

declare module '@components/organisms/erp-table/ui' {
  export const ERPTable: any;
  export * from '../../../ui/index';
}

declare module '@components/atoms/defaultElements' {
  export const CustomSelect: any;
  export const DynamicSelect: any;
  export const NewDatePicker: any;
  export const CustomDropdownButton: any;
  export const CustomButton: any;
  export const CustomModal: any;
  export const CustomTooltip: any;
}

declare module '@components/atoms/defaultElements/checkbox' {
  const CustomCheckbox: any;
  export default CustomCheckbox;
}

declare module '@components/atoms/defaultElements/inputText' {
  const InputText: any;
  export default InputText;
}

declare module '@components/atoms/iconComponents' {
  export const InfoIcon: any;
  export const ClipboardCheck: any;
  export const ClipboardIcon: any;
  export const CutIcon: any;
  export const Excel: any;
  export const GuaranteeReceive: any;
  export const Layers: any;
  export const PlusIcon: any;
  export const SpinIcon: any;
  export const TrashBin: any;
  export const RedTrashBin: any;
  export const LeftChevron: any;
  export const RightChevron: any;
  export const SearchIcon: any;
  export const CloseIcon: any;
  export const Dots: any;
  export const SavePlus: any;
  export const Reload: any;
  export const NoData: any;
  export const DragIcon: any;
  export const Expand: any;
  export const Undo: any;
  export const Magnifier: any;
  export const EditPencil: any;
  const icons: any;
  export default icons;
}
