"use client";

import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { ChequeAction } from '@components/organisms/receiptAndPayment/cheque';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

export default function ReceivedChequeActionPage() {
  const dispatch = useDispatch();

  const initPage = useAppSelector((state) => state.withPersist.init);
  const repoId = initPage?.RepoId;
  const pageId = initPage?.pageId;
  const systemId = initPage?.SystemId;
  const baseUrl = initPage?.url;
  const listPageId = initPage?.listPageId;
  const id = initPage?.Id;

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.receivedChequeAction",
        pageState: PageStateEnum.Opened,
        type: PageTypeEnum.Custom,
        RepoId: repoId,
        SystemId: systemId,
        pageData: [],
        url: baseUrl,
        listPageId: listPageId,
      })
    );
  }, [id]);

  return <ChequeAction />;
}
