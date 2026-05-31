import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import {
  BillListIcon,
  DiscountSignIcon,
  TaxIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import { setElementsInFactor } from '@slice/pages/factors';
import { IEffectiveTypeInFactor } from '@slice/pages/factors/type';

import Summary from '../summary';
import AddElementItem from './addElementItem';
import CustomAddition from './CustomAddition';
import DiscountItem from './discountItem';
import TaxItem from './taxItem';
import { IContent } from './type';

function Additions() {
  const [content, setContent] = useState<IContent>(null);
  const [open, setIsOpen] = useState(false);

  const t = useTranslations();
  const dispatch = useDispatch();
  const { Factor, activePageId } = useAppSelector((state) => {
    const activePageId = state.withPersist.pages?.find(
      (p) => p.isActive
    )?.pageId;

    const Factor = state.withPersist.pages?.find(
        (p) => p.isActive
      )?.pageData?.find(i=>i.name == "Factor")?.value;
    return { Factor, activePageId };
  }, shallowEqual);
  const [getCustomerElk, { data: elkData }] = useGetConditionallyMutation();
  const [getInvoiceElement, { data: invoiceElement }] =
    useGetConditionallyMutation();
  const [getDiscountData, { data: discountData }] =
    useGetConditionallyMutation();
  const [getTaxData, { data: taxData }] = useGetConditionallyMutation();
  const getCustomerPresets = async (CustomerId) => {
    const invoiceElementRes: any = await getInvoiceElement({
      url: "api/sale/select/addElement4SelectOption",
      body: {
        RepoViewId: 130003,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: 300,
        },
      },
    }).unwrap();
    const discountDataRes: any = await getDiscountData({
      url: "/api/sale/select/discount",
      body: {
        RepoViewId: 130059,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: 300,
        },
      },
    }).unwrap();
    const taxDataRes: any = await getTaxData({
      url: "/api/com/select/tax",
      body: {
        RepoViewId: 30054,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: 300,
        },
      },
    }).unwrap();
    const elkRes: any = await getCustomerElk({
      url: "api/sale/select/customer/elk",
      body: {
        CustomerId,
        Price: 0,
      },
    }).unwrap();
    if (
      invoiceElementRes?.Result == "Success" &&
      discountDataRes?.Result == "Success" &&
      taxDataRes?.Result == "Success" &&
      elkRes?.Result == "Success"
    ) {
      const addElements: IEffectiveTypeInFactor[] =
        invoiceElementRes?.AdditionalInfo.filter(
          (item) => item.IsMandatory
        ).map((item) => ({
          // ...item,
          id: item.AddElementId,
          amount: item.BaseValue,
          PricePercent: item.PricePercent,
          title: item.AddElementId,
          deletable: false,
          desc: item.AddElementDesc,
          type: item.ElementType,
        }));
      if (addElements.length > 0) {
        dispatch(
          setElementsInFactor({
            pageId: activePageId,
            type: "addElements",
            elements: addElements,
          })
        );
      }
      if (elkRes.Data[0]?.DiscountItems?.length > 0) {
        const discounts: IEffectiveTypeInFactor[] =
          discountDataRes?.Data?.filter((item) =>
            elkRes.Data[0].DiscountItems.some(
              (d) => d.DiscountId === item.DiscountId
            )
          ).map((item) => ({
            // ...item,
            id: item.DiscountId,
            amount: item.DiscountAmount,
            PricePercent: item.DiscountType,
            title: item.DiscountId,
            deletable: false,
            desc: item.DiscountTitle,
          }));
        dispatch(
          setElementsInFactor({
            pageId: activePageId,
            type: "discountItems",
            elements: discounts,
          })
        );
      }
      if (elkRes.Data[0]?.TaxItems?.length > 0) {
        const taxes: IEffectiveTypeInFactor[] = taxDataRes?.Data?.filter(
          (item) => elkRes.Data[0].TaxItems.some((t) => t.TaxId === item.TaxId)
        ).map((item) => ({
          // ...item,
          id: item.TaxId,
          amount: item.TaxRate,
          PricePercent: 2,
          title: item.TaxId,
          deletable: false,
          desc: item.TaxDesc,
        }));
        dispatch(
          setElementsInFactor({
            pageId: activePageId,
            type: "taxItems",
            elements: taxes,
          })
        );
      }
    }
  };
  useEffect(() => {
    if (Factor?.customer?.CustomerId) {
      getCustomerPresets(Factor.customer.CustomerId);
    }
  }, [Factor?.customer?.CustomerId]);
  const AdditionOptions: SelectProps["options"] = useMemo(() => {
    return invoiceElement?.Data?.map((option) => ({
      label: option?._SelectDisplay,
      value: option?._SelectId,
    }));
  }, [invoiceElement]);

  const DiscountOptions: SelectProps["options"] = useMemo(() => {
    return discountData?.Data?.map((option) => ({
      label: option?.DiscountTitle,
      value: option?.DiscountId,
    }));
  }, [discountData]);
  const TaxOptions: SelectProps["options"] = useMemo(() => {
    return taxData?.Data?.map((option) => ({
      label: option?.TaxDesc,
      value: option?.TaxId,
    }));
  }, [taxData]);
  const AdditionContent: IContent = {
    icon: <BillListIcon />,
    label: t("general.additionElements"),
    element: <AddElementItem Options={AdditionOptions} />,
    fieldKey: "addElements",
  };
  const discountContent: IContent = {
    icon: <DiscountSignIcon config={{ width: 18, height: 18 }} />,
    label: t("general.discounts"),
    element: <DiscountItem Options={DiscountOptions} />,
    fieldKey: "discountItems",
  };
  const taxContent: IContent = {
    icon: <TaxIcon />,
    label: t("general.tax"),
    element: <TaxItem Options={TaxOptions} />,
    fieldKey: "taxItems",
  };
  return (
    <>
      <div className="flex gap-2 p-2 border h-56">
        <div className="w-[23.33%] h-full">
          <CustomAddition
            onChange={setContent}
            setIsOpen={setIsOpen}
            content={AdditionContent}
          />
        </div>
        <div className="w-[23.33%] h-full">
          <CustomAddition
            onChange={setContent}
            setIsOpen={setIsOpen}
            content={discountContent}
          />
        </div>
        <div className="w-[23.33%] h-full">
          <CustomAddition
            onChange={setContent}
            setIsOpen={setIsOpen}
            content={taxContent}
          />
        </div>
        <div className="min-w-[30%] h-full">
          <Summary />
        </div>
      </div>
      <CustomModal
        contentClassName={`p-4 pb-16 relative lg:min-w-[520px]  lg:h-[300px] `}
        headerName={content?.label}
        headerIcon={content?.icon}
        closeModal={() => setIsOpen(false)}
        isModalOpen={open}
        content={content?.element}
      />
    </>
  );
}

export default Additions;
