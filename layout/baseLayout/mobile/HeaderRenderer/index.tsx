"use client";

import { shallowEqual } from 'react-redux';

import ListToolbar from '@components/organisms/listToolbar';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { HeaderTypeEnum } from '@slice/pages/enum';

export default function HeaderRenderer() {
  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((item) => item.isActive);
    return {
      activePage,
    };
  }, shallowEqual);

  if (!activePage) return null;

  const { headerType } = activePage;

  if (headerType === HeaderTypeEnum.None) return null;

  const hasSearch = headerType === HeaderTypeEnum.MobileWithSearch;
  

  
  return (
    <ListToolbar
      gridData={activePage.gridData ?? []}
      addCaption={activePage.addCaption ?? null}
      confirmUrl={activePage.confirmUrl ?? null}
      deleteUrl={activePage.deleteUrl ?? null}
      formUrl={activePage.formUrl ?? null}
      toolbarData={activePage.toolbarData ?? []}
      isSelectMode={activePage.isSelectMode ?? false}
      renderCustomActions={activePage.renderCustomActions ?? null}
      repoId={activePage.repoId}
      rowFieldKey={activePage.rowFieldKey}
      staticKey={activePage.staticKey}
      staticKeyII={activePage.staticKeyII}
      systemId={activePage.systemId}
      url={activePage.url}
      refetchGridData={activePage.refetchGridData ?? (() => {})}
      isQuickSearch={hasSearch}
    />
  );
}
