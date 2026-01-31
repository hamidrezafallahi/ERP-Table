import type { SwitchProps } from "antd";

interface WithConfig {
  config: {
    url: string;
    id: number;
    body?: any;
    fieldKey?: string;
  };
}
interface WithoutConfig extends SwitchProps {
  config?: null;
}

export type IProps = (WithConfig | WithoutConfig) & {
  defaultChecked?: boolean;
  className?: string;
};
