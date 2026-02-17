"use client";
import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import Chart from '@components/templates/chart';
import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

export default function Page() {
  const initPage = useAppSelector((state) => state.withPersist.init);
  const dispatch = useDispatch();

  const { SystemId, pageId, url, RepoId } = initPage;

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.chart",
        icon: "ChartIcon",
        pageState: PageStateEnum.Opened,
        type: PageTypeEnum.Custom,
        RepoId: RepoId,
        SystemId: SystemId,
        url: url,
        pageData: [],
      })
    );
  }, [initPage]);

  return <Chart />;
}
