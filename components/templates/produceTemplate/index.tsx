"use client";
import React, { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { WarningBoxIcon } from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import OperationFlow from './operationFlow';
import ProduceToolbar from './produceToolbar';
import ProductOptions from './productOptions';
import ProduceSidebar from './sideBar';
import VersionManagement from './VersionManagement';

function ProduceTemplate() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const { initPage, selectedGoodId } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const selectedGoodId = state.withPersist.pages
      .find((p) => p.isActive)
      ?.pageData?.find((d) => d.name == "selectedGoodId")?.value;

    return { initPage, selectedGoodId };
  }, shallowEqual);
  const { pageId, RepoId, SystemId, url, pageState, originalPageState } =
    initPage;

  useEffect(() => {
    if (RepoId) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.produce",
          icon: "ProduceIcon",
          pageState,
          originalPageState,
          type: PageTypeEnum.Custom,
          RepoId,
          SystemId,
          url,
        })
      );
    }
  }, []);

  return (
    <>
      <Title caption={"title.produceEngineering"} />
      <div className="relative flex lg:flex-row flex-col gap-4 h-[100%]">
        <ProduceToolbar />
        <ProduceSidebar />
        <div className="relative p-4 border border-dashed w-full h-full">
          {!selectedGoodId && (
            <div className="z-10 absolute inset-1 flex flex-col justify-center items-center backdrop-blur-sm">
              <WarningBoxIcon />
              <div>{t("general.productRequirement")}</div>
            </div>
          )}
          <div className="flex justify-center lg:justify-start">
            {match && <VersionManagement />}
            <OperationFlow />
            <ProductOptions />
          </div>
        </div>
      </div>
    </>
  );
}

export default ProduceTemplate;
