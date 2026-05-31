import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { persistor } from '@redux/index';
import {
  fullConfigReset,
  resetConfig,
} from '@slice/config';
import { deleteCookie } from '@utils/cookie';
import { resetData } from '@utils/core';

export const useHandle = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase("ERP_TABLE_DB");
      req.onsuccess = () => resolve();
      req.onerror = () => reject();
      req.onblocked = () => console.log("waiting for connections to close...");
    });
    await resetData(dispatch);
    dispatch(resetConfig({}));
    await persistor.purge();
    deleteCookie("_auth");
    deleteCookie("_rAuth");
    router.replace("/");
  };
  const handleFullLogout = async () => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase("ERP_TABLE_DB");
      req.onsuccess = () => resolve();
      req.onerror = () => reject();
      req.onblocked = () => console.log("waiting for connections to close...");
    });
    await resetData(dispatch);
    dispatch(fullConfigReset({}));
    await persistor.purge();
    deleteCookie("_auth");
    deleteCookie("_rAuth");
    deleteCookie("LanguageId");
    deleteCookie("CurrencyId");
    deleteCookie("YearId");
    deleteCookie("ArianSubmitForm");
    deleteCookie("PlaceId");
    router.replace("/");
  };

  return { handleLogout, handleFullLogout };
};
