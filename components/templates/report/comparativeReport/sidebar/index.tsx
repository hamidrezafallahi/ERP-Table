import { useEffect } from 'react';

import { SelectProps } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConfigValueById } from '@hooks/custom/useGetConfigValueById';
import { setPageData } from '@slice/pages';

function ComparativeReportSidebar() {
  const { reportMode,pageId } = useAppSelector(
    (state) => ({
      reportMode: state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((d) => d.name == "reportMode")?.value,
      pageId: state.withPersist.pages
        .find((item) => item.isActive)?.pageId,
    }),
    shallowEqual,
  );

  const t = useTranslations();
  const dispatch = useDispatch();

  const {Value} = useGetConfigValueById({ id: 5006 });
  const level =  Number(Value)
    const reportModes: SelectProps["options"] = Array.from(
    { length: level },
    (_, i) => {
      return {
        title: t(`report.header.${i + 1}`),
        value: i + 1,
        label: t(`report.header.${i + 1}`),
        onclick: (e) => {
          dispatch(
            setPageData({
              name: "reportMode",
              value: i + 1,
            }),
          );
        },
      };
    },
  );
  useEffect(() => {
    dispatch(
      setPageData({
        name: "reportMode",
        value: 1,
      }),
    );
  }, [pageId]);

  return (
    <div className="flex flex-col gap-3 p-3 w-full h-full">
      {reportModes.map((mode, idx) => (
        <CustomButton
          key={idx}
          type="text"
          className={`w-full h-10 text-center text-xs bg-gray-gray2 dark:bg-gray-gray95  dark:text-white active:bg-gray-gray9 active:font-medium ${reportMode == mode.value && "!bg-gray-gray7 !font-medium text-main-black border border-gray-gray7"}`}
          onClick={() => mode.onclick()}
        >
          {mode.title}
        </CustomButton>
      ))}
    </div>
  );
}

export default ComparativeReportSidebar;
