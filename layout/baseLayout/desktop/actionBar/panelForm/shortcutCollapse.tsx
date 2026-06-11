import {
  Dispatch,
  SetStateAction,
  useState,
} from 'react';

import { Collapse } from 'antd';
import { CollapseProps } from 'antd/lib';
import { useTranslations } from 'next-intl';

import {
  DownChevron,
  InfoIcon,
} from '@components/atoms/iconComponents';

type KeyActionHelpItem = {
  key: string;
  label: string;
  extra: string;
  className?: string;
};
interface IProps {
  minimize: boolean;
  setMinimize: Dispatch<SetStateAction<boolean>>;
  keyActionHelp: KeyActionHelpItem[];
}
export default function ShortcutsCollapse({ ...props }: IProps) {
  const { minimize, setMinimize, keyActionHelp } = props;
  const [isActive, setIsActive] = useState(false);

  const t = useTranslations();

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <button
          onClick={() => {
            setIsActive(!isActive);
            setMinimize?.(false);
          }}
          id="keyActionHelp"
          className="flex gap-1"
        >
          <InfoIcon
            config={{
              width: 24,
              height: 24,
            }}
          />
          <span
            className={`!text-gray-gray85 hover:text-main-black dark:text-white text-sm ${
              minimize && "  hidden"
            }`}
          >
            {t("sidebar.shortcuts")}
          </span>
          <div
            className={`transition-all duration-300 ${
              isActive ? "rotate-180" : ""
            } ${minimize && "  hidden"}`}
          >
            <DownChevron />
          </div>
        </button>
      ),
      showArrow: false,
      children: (
        <div className={`flex flex-col gap-1 ${minimize && "  hidden"}`}>
          {keyActionHelp.map((item) => (
            <div
              key={item.key}
              className={`flex justify-between p-2 rounded-md text-xs  !text-gray-gray85 hover:text-main-black dark:text-white       ${item.className}`}
            >
              <span>{item.label}</span>
              <span className="text-gray-500 text-xs">{item.extra}</span>
            </div>
          ))}
        </div>
      ),
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
    />
  );
}
