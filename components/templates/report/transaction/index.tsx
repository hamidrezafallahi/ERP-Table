import {
  useEffect,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import Header from '../partials/header';
import Navbar from '../partials/navbar';
import TransactionToolbar from './toolbar';
import TransactionTable from './TransactionTable';

function TransactionTemplate() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  const { initPage, parentPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      parentPage: state.withPersist.pages?.find(
        (item) => item.pageId == state.withPersist.config.parentPageId,
      ),
    }),
    shallowEqual,
  );

  useEffect(() => {
    if (parentPage) {
      let selectedRow = null;
      if (
        parentPage?.viewData?.selectedItems?.length > 0 &&
        !!parentPage?.viewData?.selectedItems?.find(
          (item) => item.Level == parentPage.viewData.Level,
        )
      ) {
        selectedRow = {
          Level: parentPage?.viewData?.selectedItems?.find(
            (item) => item.Level == parentPage.viewData.Level,
          )?.Level,
          Ids: parentPage.viewData.selectedItems
            ?.find((item) => item.Level == parentPage.viewData.Level)
            ?.Items.map((item) => item.AccId),
        };
      }
      const temp = {
        ...parentPage.viewData,
        url: "/api/acc/select/repgardesh",
        RepoViewId: 10008,
        FilterIds: [
          ...(parentPage.viewData.FilterIds
            ? parentPage.viewData.FilterIds
            : []),
          ...(selectedRow !== null ? [selectedRow] : []),
        ],
      };

      dispatch(
        addNewPage({
          pageId: initPage.pageId,
          caption: `title.transaction`,
          icon: "Transaction",
          pageState: initPage.pageState,
          originalPageState: initPage.originalPageState,
          type: PageTypeEnum.Custom,
          RepoId: initPage.RepoId,
          SystemId: initPage.SystemId,
          url: "acc/report/transaction",
          listUrl: "acc/report/accounting",
          viewData: temp,
        }),
      );
      setReady(true);
    }
  }, []);

  return (
    <div className="relative flex flex-col gap-2 h-full">
      <div className={`absolute end-0 -top-[60px] flex gap-2`}>
        <TransactionToolbar />
      </div>
      <div className="flex flex-col gap-1 px-3 w-full h-full">
        <Header />
        <Navbar active={false} />
        {ready && <TransactionTable />}
      </div>
    </div>
  );
}

export default TransactionTemplate;
