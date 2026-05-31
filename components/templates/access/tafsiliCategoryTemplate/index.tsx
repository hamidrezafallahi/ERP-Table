"use client";
import {
  useEffect,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import SideBarForm from '@components/organisms/sideBarForm';
import CustomFormContext
  from '@components/organisms/tafsiliCategory/tafsiliCategoryContext';
import {
  TafsiliCategorySideBar,
} from '@components/organisms/tafsiliCategory/tafsiliCategorySideBar';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { HeaderTypeEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import { tafsiliCategoryConfig } from './tafsiliCategoryConfig';

export default function TafsiliCategoryTemplate() {
  const [tafsiliCategoryId, setTafsiliCategoryId] = useState<number>(undefined);
  const dispatch = useDispatch();
  const { initPage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: "title.tafsiliCategory",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/tafsiliCategory",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <div
      className={`${match ? "h-full mt-0" : "h-[calc(100dvh-10rem)] mt-4 overflow-hidden"} relative`}
    >
      <Title caption={"title.tafsiliCategory"} />
      <SideBarForm
        id={tafsiliCategoryId}
        setId={setTafsiliCategoryId}
        config={tafsiliCategoryConfig(tafsiliCategoryId)}
        sideBarTitle={"طبقه تفصیلی"}
        ExternalSidebar={TafsiliCategorySideBar}
        ExternalCustomForm={CustomFormContext}
      />
    </div>
  );
}
