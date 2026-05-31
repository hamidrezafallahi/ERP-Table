import { ItemType } from 'antd/es/menu/interface';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import {
  EditPencil,
  HistoryIcon,
  PlusOutline,
  TrashBin,
} from '@components/atoms/iconComponents';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { HistoryTypeEnum } from '@slice/history/enum';

// import * as Icons from '../../atoms/iconComponents';

export default function History() {
  const t = useTranslations();
 
  const initializePage = useInitializePage();

  const { lang, historyItems } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      historyItems: state.withPersist.history,
    }),
    shallowEqual
  );

  const historyMenuItems: ItemType[] = historyItems?.map((history, index) => {
    // const IconComponent = history?.pageIcon ? Icons[history?.pageIcon] : null;
    return {
      key: index,
      disabled: history.type === HistoryTypeEnum.Delete,

      label: (
        <div className="flex justify-between items-center gap-2 w-[200px]">
          <div
            className="flex flex-col gap-2 ps-2 text-sm"
            onClick={() => {
              history.initConfig
                ? initializePage({ config: history.initConfig })
                : null;
            }}
          >
            <div className="flex items-center gap-2">
              {/* {IconComponent && (
                <div>
                  <IconComponent />
                </div>
              )} */}
              <span className="font-bold">{history.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/* <span>{`${t(history.pageName)}`}</span>  //??? */}
            </div>
          </div>
          <div>
            {history.type === HistoryTypeEnum.Delete ? (
              <TrashBin />
            ) : history.type === HistoryTypeEnum.Add ? (
              <PlusOutline />
            ) : (
              <EditPencil />
            )}
          </div>
        </div>
      ),
    };
  });

  // const historyClearAction = {
  //   key: "clearHistory",
  //   label: (
  //     <span
  //       className="flex items-center gap-3 p-2 rounded font-bold text-sm"
  //       onClick={() => {
  //         dispatch(clearHistory());
  //       }}
  //     >
  //       {t("general.deleteAll")}
  //     </span>
  //   ),
  // };

  const historyMenu =
    // historyItems?.length > 0 ? [...historyMenuItems, historyClearAction] : [];
    historyItems?.length > 0 ? [...historyMenuItems] : [];
  return (
    <CustomDropdownButton
      placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
      items={historyMenu}
    >
      <div className="cursor-pointer">
        <HistoryIcon />
      </div>
    </CustomDropdownButton>
  );
}
