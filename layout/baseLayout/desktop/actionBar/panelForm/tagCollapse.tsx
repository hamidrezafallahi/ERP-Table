import { useState } from 'react';

import { Collapse } from 'antd';
import { CollapseProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import {
  DownChevron,
  TagIcon,
} from '@components/atoms/iconComponents';
import { TagManagement } from '@components/molecules/tag';

import { IProps } from './type';

export default function TagCollapse({ ...props }: IProps) {
  const { minimize, setMinimize } = props;
  const [isActive, setIsActive] = useState(false);
  const t = useTranslations();
  const params = useSearchParams();
  const refId = Number(params.get("id"));

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <div
          title="بر چسب ها"
          onClick={() => {
            setIsActive(!isActive);
            setMinimize?.(false);
          }}
          className={`flex ${minimize ? "justify-center" : " gap-2 "}`}
        >
          {minimize ? (
            <TagIcon config={{ width: 28, height: 28 }} />
          ) : (
            <TagIcon />
          )}

          <span className={`flex text-gray-gray9 dark:text-white text-sm`}>
            <span className={`${minimize && "  hidden"}`}>
              {t("sidebar.tags")}
            </span>

            <div className="flex gap-2">
              <div
                className={`transition-all duration-300 
                  ${minimize && "  hidden"}
                  ${isActive ? "rotate-180" : ""}`}
              >
                <DownChevron />
              </div>
            </div>
          </span>
        </div>
      ),
      children: <TagManagement refIds={[refId]} minimize={minimize} />,
      showArrow: false,
    },
  ];

  return (
    <Collapse
      className={`[&>.ant-collapse-item>.ant-collapse-header]:!p-[1px]  !text-sm relative w-full `}
      rootClassName=""
      style={{
        backgroundColor: "white",
        padding: 0,
        margin: 0,
      }}
      items={items}
      bordered={false}
      defaultActiveKey={isActive ? ["1"] : null}
    />
  );
}
