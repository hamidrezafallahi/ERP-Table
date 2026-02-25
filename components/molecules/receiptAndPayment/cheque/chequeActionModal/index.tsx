import { useEffect, useState } from "react";

import { Collapse, CollapseProps, Divider } from "antd";

import { HeaderAction } from "./header";
import type { IProps } from "./type";

export const ChequeActionModal = ({ ids, children, handleReturn }: IProps) => {
  const [collapseItems, setCollapseItems] = useState([]);
  const headerUrl = "api/trh/select/check/receipt/operations";
  const headerRepoViewId = 140034;

  useEffect(() => {
    if (ids.length > 1) {
      const items: CollapseProps["items"] = ids.map((id, idx) => {
        return {
          key: `${idx}`,
          label: `اطلاعات ردیف ${idx + 1}`,
          children: (
            <HeaderAction
              id={id}
              isMulti
              getUrl={headerUrl}
              repoViewId={headerRepoViewId}
            />
          ),
        };
      });
      setCollapseItems(items);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        {ids.length === 1 && (
          <HeaderAction
            id={ids[0]}
            getUrl={headerUrl}
            repoViewId={headerRepoViewId}
            handleReturn={handleReturn}
          />
        )}

        {ids.length > 1 && (
          <Collapse items={collapseItems} defaultActiveKey={["0"]} />
        )}
        <Divider className="m-2" />
        {children}
      </div>
    </>
  );
};
