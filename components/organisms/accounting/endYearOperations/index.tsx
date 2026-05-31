import { useEffect } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { EndYearOperationsForm } from '@components/molecules/accounting';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const EndYearOperationsPage = ({ setMobileDrawerContent, form }) => {
  const dispatch = useDispatch();

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );

  const pageId = activePage?.pageId;

  const info = {
    addEndpoint: "/api/acc/voucher/finishingVoucher",
    deleteEndpoint: null,
    updateEndpoint: "/api/acc/voucher/finishingVoucher",
    formIdField: null,
  };

  useEffect(() => {
    const formData = formConfig.map((item) => ({
      ...item,
      isTitleField: item.isTitleField,
      value: item?.value,
      originalValue: item?.originalValue,
    }));
    dispatch(setAllPageData(formData));
    dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
  }, []);
  return (
    <EndYearOperationsForm setMobileDrawerContent={setMobileDrawerContent} />
  );
};
