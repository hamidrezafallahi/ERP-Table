"use client";

import { FormInstance } from 'antd/es/form';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  PlusOutline,
  Undo,
} from '@components/atoms/iconComponents';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  useInitializePage,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';

import {
  createHandleAdd,
  createHandleReset,
  createHandleSave,
} from './calendarHandle';

export default function CalendarToolbar({ form }: { form: FormInstance }) {
  const t = useTranslations();
  const dispatch = useDispatch();

  const [trigger] = useCUDDataMutation();
  const initializePage = useInitializePage();
  const { navigateBack } = useNavigatePage();

  const { activePage, locale } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find((p) => p.isActive);
    const locale = state.withPersist.config.lang;
    return { activePage, locale };
  }, shallowEqual);

  const handleAdd = createHandleAdd(activePage, dispatch, initializePage);
  const handleSave = createHandleSave(form, trigger, t, navigateBack, locale);
  const handleReset = createHandleReset(form, dispatch);

  return (
    <div
      className={`-top-14 end-0 absolute flex gap-4 z-10 justify-center items-center`}
    >
      <CustomTooltip title={t("formToolbar.closePage")}>
        <CloseButton />
      </CustomTooltip>

      <CustomTooltip
        className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full"
        title={t("general.fullScreenMode")}
        id="fullScreenMode"
      >
        <ExpandedButton />
      </CustomTooltip>

      <CustomTooltip
        title={t("formToolbar.revalidate")}
        className="hidden xxl:block"
      >
        <CustomButton
          type="text"
          className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[6px] border rounded h-9 text-gray dark:text-white"
          onClick={handleReset}
          id="reload"
        >
          <Undo config={{ width: 24, height: 24 }} />
        </CustomButton>
      </CustomTooltip>

      <CustomTooltip title={t("general.new")} className="hidden xxl:block">
        <CustomButton
          type="text"
          className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[10px] border rounded h-9 text-gray dark:text-white"
          onClick={handleAdd}
          id="newRecord"
        >
          <PlusOutline />
        </CustomButton>
      </CustomTooltip>

      <CustomTooltip title={t("general.save")} className="hidden xxl:block">
        <CustomButton
          onClick={handleSave}
          htmlType="submit"
          type="text"
          className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-3 border hover:border-black-black8 rounded min-w-[76px] h-9 text-white hover:text-black-black8 text-xs"
        >
          {t("general.save")}
        </CustomButton>
      </CustomTooltip>
    </div>
  );
}
