import { shallowEqual } from 'react-redux';

import { CustomBreadcrumb } from '@components/atoms/defaultElements/breadcrumb';
import PageTitle from '@components/atoms/pageTitle';
import History from '@components/molecules/history';
import { useAppSelector } from '@redux/index';
import { renderPageState } from '@utils/core';

import TopHeadSearchbar from '../topHead/topHeadSearchbar';

export default function Navbar() {
  const active = useAppSelector((state) => state?.withPersist?.pages);
  const activePage =
    active &&
    active.length > 0 &&
    active?.find((item) => item.isActive === true);

  const { lang } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  return (
    <div
      className={`flex flex-col h-full gap-2 p-2 w-full relative ${
        lang === "fa" ? "" : "ltr"
      }`}
    >
      <div className="flex justify-start items-center gap-x-2 w-full h-full">
        <PageTitle/>
        {renderPageState(activePage?.pageState)}
      </div>
      <CustomBreadcrumb />
      <div className="-top-12 absolute flex items-center gap-2 w-1/3">
        <History />
        <TopHeadSearchbar />
      </div>
    </div>
  );
}
