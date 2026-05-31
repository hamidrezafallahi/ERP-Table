import React from "react";
import { INestedListConfig } from "../types";
import { IBaseDto } from "@services/base/type";
import RenderStatus from "@components/molecules/renderStatus";

interface TreeTitleDisplayProps {
  item: IBaseDto;
  config: INestedListConfig;
  selectedId: number;
  match: boolean;
}

const TreeTitleDisplay = (props: TreeTitleDisplayProps) => {
  const { item, config, selectedId, match } = props;
  const { displayKey, uniqueKey, descriptionKey } = config;
  const displayDesc = item?.[displayKey] ?? item[uniqueKey];
  const isSelected = selectedId === item[uniqueKey];
  const isActive = item.Inactive ? false : true;

  return (
    <div className="flex items-center gap-2">
      <span
        // onClick={() => handleDeselect()}
        className={`${
          isSelected && "inline-flex font-bold"
        } ${!isActive && "text-gray-gray7"}`}
      >
        {displayDesc} - {item[descriptionKey]}
      </span>
      {!!item?.PendingStatusId && (
        <RenderStatus
          id={item[uniqueKey]}
          pendingStatusId={item?.PendingStatusId}
          pendingMessage={item?.PendingMessage}
          isMobile={!match ? true : false}
        />
      )}
    </div>
  );
};

export default TreeTitleDisplay;
