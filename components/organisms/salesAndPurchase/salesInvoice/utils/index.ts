import type {
  IAdditionalInfo,
} from '@components/molecules/salesAndPurchase/salesInvoice/increasingAndDecreasingFactors/type';
import type {
  IState,
} from '@components/molecules/salesAndPurchase/salesInvoice/type';
import type { ITax } from '@services/com/tax/type';
import type { IDiscount } from '@services/sale/discount/type';
import {
  ElementTypeEnum,
} from '@services/sale/increasingAndDecreasingFactors/type';
import type {
  IDiscountState,
  ITaxState,
} from '@services/sale/salesInvoiceDetails/type';

export function calcFactor(
  pureAmount: number,
  elements: IState[] | IAdditionalInfo[]
) {
  if (!Array.isArray(elements) || elements.length === 0) {
    return {
      factorItems: [],
      factorIds: [],
      decreasingFactor: [],
      increasingFactor: [],
      discountableDecreasingFactor: [],
      discountableIncreasingFactor: [],
      taxableDecreasingFactor: [],
      taxableIncreasingFactor: [],
      increasingFactorValue: 0,
      decreasingFactorValue: 0,
      discountableIncreasingFactorValue: 0,
      discountableDecreasingFactorValue: 0,
      taxableIncreasingFactorValue: 0,
      taxableDecreasingFactorValue: 0,
      increasingTaxableDiscountableFactorValue: 0,
      decreasingTaxableDiscountableFactorValue: 0,
    };
  }

  const factorItems = elements.map((item) => ({
    ...item,
    // prefer original API fields, but fall back to already-normalized keys if present
    title: item?.AddElementId ?? item?.title ?? item?.AddElementId,
    pricePercent: item?.PricePercent ?? item?.pricePercent ?? false,
    percent: item?.BaseValue ?? item?.percent ?? 0,
    amount:
      item?.PricePercent ?? item?.pricePercent
        ? (pureAmount * (item?.BaseValue ?? item?.percent ?? 0)) / 100
        : item?.BaseValue ?? item?.percent ?? 0,
    type: item?.ElementType ?? item?.type,
    taxable: item?.Taxable ?? item?.taxable ?? false,
    discountable: item?.Discountable ?? item?.discountable ?? false,
    deletable:
      typeof item?.IsMandatory === "boolean"
        ? !item.IsMandatory
        : item?.deletable ?? true,
  }));

  const factorIds = factorItems.map((i) => i.AddElementId ?? i.id ?? i.title);

  const decreasingFactor = factorItems.filter(
    (i) => i.type === ElementTypeEnum.Decreasing
  );
  const increasingFactor = factorItems.filter(
    (i) => i.type === ElementTypeEnum.Increasing
  );

  const filterBy = (
    arr: any[],
    cond: Partial<{ taxable: boolean; discountable: boolean }>
  ) =>
    arr.filter((i) => {
      for (const key in cond)
        if ((i as any)[key] !== (cond as any)[key]) return false;
      return true;
    });

  const decreasingTaxableDiscountableFactors = filterBy(decreasingFactor, {
    taxable: true,
    discountable: true,
  });
  const increasingTaxableDiscountableFactors = filterBy(increasingFactor, {
    taxable: true,
    discountable: true,
  });

  const discountableDecreasingFactor = filterBy(decreasingFactor, {
    discountable: true,
  });
  const discountableIncreasingFactor = filterBy(increasingFactor, {
    discountable: true,
  });
  const taxableDecreasingFactor = filterBy(decreasingFactor, { taxable: true });
  const taxableIncreasingFactor = filterBy(increasingFactor, { taxable: true });

  const sum = (arr: any[]) =>
    arr.reduce((total, item) => total + (item?.amount || 0), 0);

  return {
    factorItems,
    factorIds,
    decreasingFactor,
    increasingFactor,
    discountableDecreasingFactor,
    discountableIncreasingFactor,
    taxableDecreasingFactor,
    taxableIncreasingFactor,
    increasingFactorValue: sum(increasingFactor),
    decreasingFactorValue: sum(decreasingFactor),
    discountableIncreasingFactorValue: sum(discountableIncreasingFactor),
    discountableDecreasingFactorValue: sum(discountableDecreasingFactor),
    taxableIncreasingFactorValue: sum(taxableIncreasingFactor),
    taxableDecreasingFactorValue: sum(taxableDecreasingFactor),
    increasingTaxableDiscountableFactorValue: sum(
      increasingTaxableDiscountableFactors
    ),
    decreasingTaxableDiscountableFactorValue: sum(
      decreasingTaxableDiscountableFactors
    ),
  };
}

export function calcDiscount(
  pureAmount: number,
  discounts: IDiscountState[] | IDiscount[],
  elements: IState[] | IAdditionalInfo[]
) {
  if (!Array.isArray(discounts) || discounts.length === 0) {
    return {
      totalDiscountValue: 0,
      discountIds: [],
      discountItems: [],
      elementDiscountValue: 0,
      goodsDiscountValue: 0,
      elementTaxableDiscountValue: 0,
    };
  }

  const discountIds = discounts.map((item) => item.DiscountId);

  const {
    discountableDecreasingFactorValue,
    discountableIncreasingFactorValue,
    increasingTaxableDiscountableFactorValue,
    decreasingTaxableDiscountableFactorValue,
  } = calcFactor(pureAmount, elements);

  // debug logs removed

  const discountItems = discounts.map((item: any) => {
    const elementAmount =
      ((discountableIncreasingFactorValue - discountableDecreasingFactorValue) *
        item.DiscountAmount) /
      100;
    const totalAmount =
      elementAmount +
      (item.DiscountType
        ? (pureAmount * item.DiscountAmount) / 100
        : item.DiscountAmount);
    return {
      ...item,
      id: item.DiscountId,
      amount: item.DiscountType
        ? (pureAmount * item.DiscountAmount) / 100
        : item.DiscountAmount,
      elementAmount: elementAmount,
      totalAmount: totalAmount,
      deletable: item?.deletable ?? true,
    };
  });

  const goodsDiscountValue = discountItems.reduce(
    (total, item) => total + (item?.amount || 0),
    0
  );

  const elementDiscountValues = discounts.map(
    (item) =>
      ((discountableIncreasingFactorValue - discountableDecreasingFactorValue) *
        item.DiscountAmount) /
      100
  );

  const elementDiscountValue = elementDiscountValues.reduce(
    (sum, val) => sum + val,
    0
  );

  const elementTaxableDiscountableValues = discounts.map(
    (item) =>
      ((increasingTaxableDiscountableFactorValue -
        decreasingTaxableDiscountableFactorValue) *
        item.DiscountAmount) /
      100
  );

  const elementTaxableDiscountableValue =
    elementTaxableDiscountableValues.reduce((sum, val) => sum + val, 0) || 0;

  const totalDiscountValue = goodsDiscountValue + elementDiscountValue;

  return {
    discountIds,
    discountItems,
    totalDiscountValue,
    goodsDiscountValue,
    elementDiscountValue,
    elementTaxableDiscountableValue,
  };
}

export function calcTax(
  pureAmount: number,
  taxes: ITaxState[] | ITax[],
  discounts: IDiscountState[] | IDiscount[],
  elements: IState[] | IAdditionalInfo[],
  vat?: number,
  totalAdditional?: number,
  type?: string
) {
  if (!Array.isArray(taxes) || taxes.length === 0) {
    return {
      taxIds: [],
      taxItems: [],
      totalTaxValue: 0,
      goodsTaxValue: 0,
      elementTaxValue: 0,
    };
  }

  const { taxableDecreasingFactorValue, taxableIncreasingFactorValue } =
    calcFactor(pureAmount, elements);

  const { elementTaxableDiscountableValue, goodsDiscountValue } = calcDiscount(
    pureAmount,
    discounts,
    elements
  );

  const taxBaseAmount = vat ? vat : pureAmount - goodsDiscountValue;

  const elementAmount =
    taxableIncreasingFactorValue -
    taxableDecreasingFactorValue -
    (elementTaxableDiscountableValue || 0);

  const taxItems = taxes.map((item: any) => {
    const totalAmount =
      type === "JEWELRY"
        ? (totalAdditional * 10) / 100 + (pureAmount * item.TaxRate) / 100
        : (taxBaseAmount * item.TaxRate) / 100 +
          (elementAmount ? (elementAmount * item.TaxRate) / 100 : 0);
    return {
      ...item,
      id: item.TaxId,
      amount:
        type === "JEWELRY" ? totalAmount : (taxBaseAmount * item.TaxRate) / 100,
      elementAmount:
        type === "JEWELRY"
          ? 0
          : elementAmount
          ? (elementAmount * item.TaxRate) / 100
          : 0,
      totalAmount: totalAmount,
      deletable: item?.deletable ?? true,
    };
  });

  const taxIds = taxItems.map((i) => i.id);

  const goodsTaxValue = taxItems.reduce(
    (total, item) => total + (item?.amount || 0),
    0
  );

  const elementTaxValues = taxes.map((item) =>
    type === "JEWELRY" ? 0 : (elementAmount * item.TaxRate) / 100
  );

  const elementTaxValue = elementTaxValues.reduce((sum, val) => sum + val, 0);

  const totalTaxValue = goodsTaxValue + elementTaxValue;

  return {
    taxIds,
    taxItems,
    totalTaxValue,
    goodsTaxValue,
    elementTaxValue,
  };
}
