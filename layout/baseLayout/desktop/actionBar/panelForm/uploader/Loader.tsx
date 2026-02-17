import { Progress } from "antd";

import { UploadSuccessfully } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";

const Loader = ({ id }) => {
  const { percent } = useAppSelector((state) => ({
    percent:
      state.withPersist.config.progressItems.find((item) => item.id === id)
        ?.percent || 0,
  }));

  return (
    <Progress
      className="flex justify-center items-center"
      type="circle"
      trailColor={percent === 100 ? "#5bc16d" : "#CECECE"}
      strokeColor={percent === 100 ? "#5BC16D" : "#939393"}
      percent={percent}
      size={24}
      format={(percent) =>
        percent !== 100 ? null : (
          <span className={`relative rtl:left-[4px]  right-[4px] `}>
            <UploadSuccessfully />
          </span>
        )
      }
    />
  );
};
export default Loader;
