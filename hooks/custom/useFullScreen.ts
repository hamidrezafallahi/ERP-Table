import { useDispatch } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setFullScreen } from '@slice/config';

export const useFullScreen = () => {
  const fullScreen = useAppSelector(
    (state) => state.withPersist.config.fullScreen
  );
  const dispatch = useDispatch();

  const toggleFullScreen = () => {
    dispatch(setFullScreen({ fullScreen: !fullScreen }));
  };

  return toggleFullScreen;
};
