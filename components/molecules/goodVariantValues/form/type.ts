import type { IVariant } from '@services/com/variant/type';

import type { IAppliedVariant } from '../type';

export interface IProps {
  baseVariantData: IVariant[];
  variantDefaultValues: any;
  subFormLoading: boolean;
  existVariants: IAppliedVariant[];
  onApplyVariants: (variants: IAppliedVariant[]) => void;
}
