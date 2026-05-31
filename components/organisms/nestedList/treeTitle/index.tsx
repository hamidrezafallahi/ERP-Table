import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { PendingStatusEnum } from '@services/base/type';

import TreeTitleActions from './treeTitleActions';
import TreeTitleDisplay from './treeTitleDisplay';

export const TreeTitle = ({
  item,
  config,
  handlers,
  renderAddChildAction,
  renderCustomAction,
  systemName,
  repoName,
  customAction,
  setStates,
  conditionalActivation,
  withoutActivation,
  selectedId,
}) => {
  const { uniqueKey } = config;
  const isActive = withoutActivation ? true : item.Inactive ? false : true;
  const isPending =
    item?.PendingStatusId === PendingStatusEnum.Pending1 ||
    item?.PendingStatusId === PendingStatusEnum.Pending2 ||
    item?.PendingStatusId === PendingStatusEnum.Pending3;
  const isSelected = selectedId === item[uniqueKey];
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  return (
    <div
      className={`${
        match
          ? "flex flex-wrap items-center gap-2 p-2"
          : "flex flex-col gap-2 p-2 w-full"
      }`}
    >
      <TreeTitleDisplay
        item={item}
        config={config}
        selectedId={selectedId}
        match={match}
      />
      <TreeTitleActions
        isSelected={isSelected}
        isPending={isPending}
        isActive={isActive}
        handlers={handlers}
        config={config}
        item={item}
        renderAddChildAction={renderAddChildAction}
        renderCustomAction={renderCustomAction}
        customAction={customAction}
        setStates={setStates}
        conditionalActivation={conditionalActivation}
        withoutActivation={withoutActivation}
        systemName={systemName}
        repoName={repoName}
      />
    </div>
  );
};
