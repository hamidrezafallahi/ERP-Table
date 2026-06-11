import { CustomButton } from '@components/atoms/defaultElements/button';
import {
  Expand,
  Shrink,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useFullScreen } from '@hooks/custom/useFullScreen';

export default function ExpandedButton() {
  const fullScreen = useAppSelector(
    (state) => state.withPersist.config.fullScreen
  );
  const toggleFullScreen = useFullScreen();
  return (
    <>
      <CustomButton
        id="fullScreenMode"
        ghost
        className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
        onClick={toggleFullScreen}
      >
        {fullScreen ? (
          <Shrink config={{ height: 22 }} />
        ) : (
          <Expand config={{ height: 22 }} />
        )}
      </CustomButton>
    </>
  );
}
