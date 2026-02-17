import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { persistor } from '@redux/index';
import { resetConfig } from '@slice/config';
import {
  deleteCookie,
  resetData,
} from '@utils/core';

export const useHandle = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
await new Promise<void>((resolve, reject) => {
  const req = indexedDB.deleteDatabase('ERP_TABLE_DB');
  req.onsuccess = () => resolve();
  req.onerror = () => reject();
  req.onblocked = () => console.log('waiting for connections to close...');
});
    await resetData(dispatch);
    dispatch(resetConfig({}));
    await persistor.purge();
    deleteCookie("_auth");
    deleteCookie("_rAuth");
    router.replace("/");
  };

  return { handleLogout };
};
